/**
 * OBELISK Firebase Admin SDK
 * Server-side token verification and user management
 *
 * Setup:
 * 1. npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env
 */

let admin = null;
let initialized = false;

function initFirebaseAdmin() {
    if (initialized) return admin;

    try {
        admin = require('firebase-admin');

        // Option 1: Service account file
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (serviceAccountPath) {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('[FIREBASE-ADMIN] Initialized with service account');
        }
        // Option 2: Environment variables (for cloud deployments)
        else if (process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
            console.log('[FIREBASE-ADMIN] Initialized with env variables');
        }
        // Option 3: Default credentials (GCP environment)
        else {
            admin.initializeApp();
            console.log('[FIREBASE-ADMIN] Initialized with default credentials');
        }

        initialized = true;
        return admin;

    } catch (error) {
        console.warn('[FIREBASE-ADMIN] Not initialized:', error.message);
        console.warn('[FIREBASE-ADMIN] Run: npm install firebase-admin');
        return null;
    }
}

// Verify Firebase ID token
async function verifyIdToken(idToken) {
    const admin = initFirebaseAdmin();
    if (!admin) {
        throw new Error('Firebase Admin not initialized');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return {
            valid: true,
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            name: decodedToken.name,
            picture: decodedToken.picture,
            provider: decodedToken.firebase?.sign_in_provider
        };
    } catch (error) {
        console.error('[FIREBASE-ADMIN] Token verification failed:', error.message);
        return {
            valid: false,
            error: error.message
        };
    }
}

// Get user by UID
async function getUser(uid) {
    const admin = initFirebaseAdmin();
    if (!admin) return null;

    try {
        return await admin.auth().getUser(uid);
    } catch (error) {
        console.error('[FIREBASE-ADMIN] Get user failed:', error.message);
        return null;
    }
}

// Get user by email
async function getUserByEmail(email) {
    const admin = initFirebaseAdmin();
    if (!admin) return null;

    try {
        return await admin.auth().getUserByEmail(email);
    } catch (error) {
        return null;
    }
}

// Create custom token (for wallet-to-Firebase linking)
async function createCustomToken(uid, claims = {}) {
    const admin = initFirebaseAdmin();
    if (!admin) return null;

    try {
        return await admin.auth().createCustomToken(uid, claims);
    } catch (error) {
        console.error('[FIREBASE-ADMIN] Create token failed:', error.message);
        return null;
    }
}

// Set custom user claims
async function setCustomClaims(uid, claims) {
    const admin = initFirebaseAdmin();
    if (!admin) return false;

    try {
        await admin.auth().setCustomUserClaims(uid, claims);
        return true;
    } catch (error) {
        console.error('[FIREBASE-ADMIN] Set claims failed:', error.message);
        return false;
    }
}

// Express middleware for Firebase auth
function firebaseAuthMiddleware(options = {}) {
    const { required = true } = options;

    return async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            if (required) {
                return res.status(401).json({ error: 'Missing authorization token' });
            }
            return next();
        }

        const token = authHeader.split('Bearer ')[1];

        try {
            const decoded = await verifyIdToken(token);

            if (!decoded.valid) {
                if (required) {
                    return res.status(401).json({ error: 'Invalid token' });
                }
                return next();
            }

            // Attach user to request
            req.firebaseUser = decoded;
            next();

        } catch (error) {
            if (required) {
                return res.status(401).json({ error: 'Token verification failed' });
            }
            next();
        }
    };
}

// Express routes for Firebase auth
function setupFirebaseRoutes(app, db) {
    // Sync Firebase user with backend
    app.post('/api/auth/firebase', firebaseAuthMiddleware(), async (req, res) => {
        const { uid, email, displayName, photoURL, emailVerified, provider } = req.body;
        const firebaseUser = req.firebaseUser;

        // Verify token UID matches body UID
        if (firebaseUser.uid !== uid) {
            return res.status(403).json({ error: 'UID mismatch' });
        }

        try {
            // Check if user exists in DB
            let user = db.prepare('SELECT * FROM users WHERE firebase_uid = ?').get(uid);

            if (!user) {
                // Create new user
                const result = db.prepare(`
                    INSERT INTO users (firebase_uid, email, display_name, photo_url, email_verified, auth_provider, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(uid, email, displayName, photoURL, emailVerified ? 1 : 0, provider, Date.now());

                user = {
                    id: result.lastInsertRowid,
                    firebase_uid: uid,
                    email,
                    display_name: displayName,
                    isNewUser: true
                };

                console.log('[FIREBASE] New user created:', email);
            } else {
                // Update existing user
                db.prepare(`
                    UPDATE users SET
                        email = ?,
                        display_name = ?,
                        photo_url = ?,
                        email_verified = ?,
                        last_login = ?
                    WHERE firebase_uid = ?
                `).run(email, displayName, photoURL, emailVerified ? 1 : 0, Date.now(), uid);

                user.isNewUser = false;
                console.log('[FIREBASE] User updated:', email);
            }

            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.display_name,
                    isNewUser: user.isNewUser,
                    walletLinked: !!user.wallet_address
                }
            });

        } catch (error) {
            console.error('[FIREBASE] Sync error:', error);
            res.status(500).json({ error: 'Failed to sync user' });
        }
    });

    // Link wallet to Firebase account
    app.post('/api/auth/link-wallet', firebaseAuthMiddleware(), async (req, res) => {
        const { walletAddress, signature, firebaseUid } = req.body;
        const firebaseUser = req.firebaseUser;

        if (firebaseUser.uid !== firebaseUid) {
            return res.status(403).json({ error: 'UID mismatch' });
        }

        // Verify wallet signature (reuse existing SIWE logic)
        // ... signature verification code ...

        try {
            // Check if wallet already linked to another account
            const existingWallet = db.prepare('SELECT * FROM users WHERE wallet_address = ?').get(walletAddress);
            if (existingWallet && existingWallet.firebase_uid !== firebaseUid) {
                return res.status(400).json({ error: 'Wallet already linked to another account' });
            }

            // Link wallet
            db.prepare('UPDATE users SET wallet_address = ? WHERE firebase_uid = ?')
                .run(walletAddress, firebaseUid);

            // Set custom claim for wallet
            await setCustomClaims(firebaseUid, { walletAddress });

            res.json({
                success: true,
                message: 'Wallet linked successfully'
            });

        } catch (error) {
            console.error('[FIREBASE] Link wallet error:', error);
            res.status(500).json({ error: 'Failed to link wallet' });
        }
    });

    console.log('[FIREBASE-ADMIN] Routes registered: /api/auth/firebase, /api/auth/link-wallet');
}

module.exports = {
    initFirebaseAdmin,
    verifyIdToken,
    getUser,
    getUserByEmail,
    createCustomToken,
    setCustomClaims,
    firebaseAuthMiddleware,
    setupFirebaseRoutes
};
