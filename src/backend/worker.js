/**
 * OBELISK Cloudflare Worker
 * Lightweight API proxy with caching and rate limiting
 *
 * Deploy: wrangler publish
 */

// Configuration
const BACKEND_URL = 'https://obelisk-backend-production.up.railway.app'; // Railway backend
const CACHE_TTL = 60; // seconds
const RATE_LIMIT = 60; // requests per minute

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400'
};

// Rate limiting using Cloudflare's Cache API
async function checkRateLimit(ip, env) {
    const key = `ratelimit:${ip}`;
    const cache = caches.default;

    const cached = await cache.match(new Request(`http://ratelimit/${key}`));
    if (cached) {
        const data = await cached.json();
        if (data.count >= RATE_LIMIT) {
            return false;
        }
        data.count++;
        await cache.put(
            new Request(`http://ratelimit/${key}`),
            new Response(JSON.stringify(data), {
                headers: { 'Cache-Control': `max-age=60` }
            })
        );
    } else {
        await cache.put(
            new Request(`http://ratelimit/${key}`),
            new Response(JSON.stringify({ count: 1 }), {
                headers: { 'Cache-Control': `max-age=60` }
            })
        );
    }
    return true;
}

// Main handler
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Health check
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({
                status: 'ok',
                edge: request.cf?.colo || 'unknown',
                timestamp: Date.now()
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }

        // Rate limiting
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const allowed = await checkRateLimit(ip, env);
        if (!allowed) {
            return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': '60',
                    ...corsHeaders
                }
            });
        }

        // Cacheable GET requests
        if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
            const cache = caches.default;
            const cacheKey = new Request(url.toString(), request);

            // Check cache
            let response = await cache.match(cacheKey);
            if (response) {
                // Add cache hit header
                response = new Response(response.body, response);
                response.headers.set('X-Cache', 'HIT');
                return response;
            }

            // Fetch from backend
            try {
                const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
                response = await fetch(backendUrl, {
                    method: request.method,
                    headers: request.headers
                });

                // Clone for caching
                const responseToCache = response.clone();

                // Cache successful responses
                if (response.ok) {
                    const headers = new Headers(responseToCache.headers);
                    headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);

                    ctx.waitUntil(
                        cache.put(cacheKey, new Response(responseToCache.body, {
                            status: responseToCache.status,
                            headers
                        }))
                    );
                }

                // Add CORS and cache miss header
                const finalResponse = new Response(response.body, response);
                finalResponse.headers.set('X-Cache', 'MISS');
                Object.entries(corsHeaders).forEach(([k, v]) => {
                    finalResponse.headers.set(k, v);
                });

                return finalResponse;

            } catch (error) {
                return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
                    status: 502,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    }
                });
            }
        }

        // Non-cacheable requests (POST, PUT, DELETE)
        try {
            const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
            const response = await fetch(backendUrl, {
                method: request.method,
                headers: request.headers,
                body: request.method !== 'GET' ? request.body : undefined
            });

            const finalResponse = new Response(response.body, response);
            Object.entries(corsHeaders).forEach(([k, v]) => {
                finalResponse.headers.set(k, v);
            });

            return finalResponse;

        } catch (error) {
            return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
                status: 502,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }
    }
};

// WebSocket Durable Object (for real-time price feeds)
export class PriceFeedDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.sessions = new Map();
    }

    async fetch(request) {
        const url = new URL(request.url);

        if (request.headers.get('Upgrade') === 'websocket') {
            const pair = this.state.id.toString();
            const [client, server] = Object.values(new WebSocketPair());

            server.accept();
            this.sessions.set(server, { pair });

            server.addEventListener('message', (event) => {
                // Handle subscription messages
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'subscribe') {
                        // Handle subscription
                    }
                } catch (e) {}
            });

            server.addEventListener('close', () => {
                this.sessions.delete(server);
            });

            return new Response(null, { status: 101, webSocket: client });
        }

        return new Response('Expected WebSocket', { status: 400 });
    }

    broadcast(message) {
        const msg = JSON.stringify(message);
        this.sessions.forEach((session, ws) => {
            try {
                ws.send(msg);
            } catch (e) {
                this.sessions.delete(ws);
            }
        });
    }
}
