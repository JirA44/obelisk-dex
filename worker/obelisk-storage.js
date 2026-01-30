/**
 * OBELISK DEX - Cloud Storage Worker
 * Cloudflare Worker for user data persistence
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Route: /user/:userId
        const userMatch = path.match(/^\/user\/([^\/]+)$/);
        if (userMatch) {
            const userId = userMatch[1];

            if (request.method === 'GET') {
                // Load user data
                try {
                    const data = await env.OBELISK_KV.get(`user:${userId}`, 'json');
                    return new Response(JSON.stringify({
                        success: true,
                        data: data || null,
                        lastUpdated: data?.lastUpdated || null
                    }), { headers: corsHeaders });
                } catch (e) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: e.message
                    }), { status: 500, headers: corsHeaders });
                }
            }

            if (request.method === 'POST') {
                // Save user data
                try {
                    const body = await request.json();
                    const dataStr = JSON.stringify(body);

                    // Limit 100KB
                    if (dataStr.length > 100000) {
                        return new Response(JSON.stringify({
                            success: false,
                            error: 'Data too large (max 100KB)'
                        }), { status: 400, headers: corsHeaders });
                    }

                    const dataToSave = {
                        ...body,
                        lastUpdated: Date.now(),
                        userId: userId
                    };

                    await env.OBELISK_KV.put(
                        `user:${userId}`,
                        JSON.stringify(dataToSave),
                        { expirationTtl: 31536000 } // 1 year
                    );

                    return new Response(JSON.stringify({
                        success: true,
                        message: 'Data saved',
                        lastUpdated: dataToSave.lastUpdated
                    }), { headers: corsHeaders });
                } catch (e) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: e.message
                    }), { status: 500, headers: corsHeaders });
                }
            }
        }

        // Health check
        if (path === '/' || path === '/health') {
            return new Response(JSON.stringify({
                success: true,
                service: 'Obelisk Storage API',
                timestamp: Date.now()
            }), { headers: corsHeaders });
        }

        // 404
        return new Response(JSON.stringify({
            success: false,
            error: 'Not found'
        }), { status: 404, headers: corsHeaders });
    }
};
