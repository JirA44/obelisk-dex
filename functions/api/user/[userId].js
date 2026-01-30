/**
 * OBELISK DEX - Cloud Storage API
 * Cloudflare Pages Function for user data persistence
 *
 * Endpoints:
 * GET /api/user/[userId] - Load user data
 * POST /api/user/[userId] - Save user data
 */

export async function onRequestGet(context) {
    const { params, env } = context;
    const userId = params.userId;

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID required' }), {
            status: 400,
            headers
        });
    }

    try {
        // Get data from KV
        const data = await env.OBELISK_KV.get(`user:${userId}`, 'json');

        if (data) {
            return new Response(JSON.stringify({
                success: true,
                data,
                lastUpdated: data.lastUpdated || null
            }), { headers });
        } else {
            return new Response(JSON.stringify({
                success: true,
                data: null,
                message: 'No data found for user'
            }), { headers });
        }
    } catch (e) {
        return new Response(JSON.stringify({
            error: 'Failed to load data',
            message: e.message
        }), { status: 500, headers });
    }
}

export async function onRequestPost(context) {
    const { params, env, request } = context;
    const userId = params.userId;

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID required' }), {
            status: 400,
            headers
        });
    }

    try {
        const body = await request.json();

        // Validate data size (max 100KB)
        const dataStr = JSON.stringify(body);
        if (dataStr.length > 100000) {
            return new Response(JSON.stringify({
                error: 'Data too large (max 100KB)'
            }), { status: 400, headers });
        }

        // Add metadata
        const dataToSave = {
            ...body,
            lastUpdated: Date.now(),
            userId: userId
        };

        // Save to KV (expire after 1 year)
        await env.OBELISK_KV.put(
            `user:${userId}`,
            JSON.stringify(dataToSave),
            { expirationTtl: 31536000 } // 1 year
        );

        return new Response(JSON.stringify({
            success: true,
            message: 'Data saved',
            lastUpdated: dataToSave.lastUpdated
        }), { headers });

    } catch (e) {
        return new Response(JSON.stringify({
            error: 'Failed to save data',
            message: e.message
        }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
