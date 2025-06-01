const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_ACCOUNTS_ENDPOINT = "https://accounts.spotify.com";
const CLIENT_CALLBACK_URL = "blipz://authenticate";
const AUTH_SECRET = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
const AUTH_HEADER = `Basic ${AUTH_SECRET}`;
export async function POST(request) {
    const { code } = await request.json();
    if (!code) {
        return Response.json({ error: 'Code is required' }, { status: 400 });
    }
    try {
        const body = new URLSearchParams();
        body.append("grant_type", "authorization_code");
        body.append("redirect_uri", CLIENT_CALLBACK_URL);
        body.append("code", code);
        const response = await fetch(`${SPOTIFY_ACCOUNTS_ENDPOINT}/api/token`, {
            method: "POST",
            body: body,
            headers: {
                Authorization: AUTH_HEADER,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const responseData = await response.json();
        if (response.status !== 200) {
            console.log("=== TOKEN SWAP FAILED WITH RESPONSE: ", responseData);
            return Response.json({ error: responseData }, { status: response.status });
        }
        console.log("=== TOKEN SWAP SUCCEEDED WITH RESPONSE: ", responseData);
        return Response.json({ data: responseData });
    }
    catch (error) {
        console.log({ error });
        return Response.json({ error: error }, { status: 500 });
    }
}
//# sourceMappingURL=swap+api.js.map