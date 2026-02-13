// Simple test endpoint
export async function onRequest(context) {
    return new Response(JSON.stringify({
        success: true,
        message: "API is working!",
        timestamp: Date.now()
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
