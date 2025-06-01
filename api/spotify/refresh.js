const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_ACCOUNTS_ENDPOINT = "https://accounts.spotify.com";
const AUTH_SECRET = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
const AUTH_HEADER = `Basic ${AUTH_SECRET}`;
export async function POST(request) {
    console.log("=== TOKEN REFRESH INITIATED ===");
    const { refresh_token } = await request.json();
    try {
        const response = await fetch(`${SPOTIFY_ACCOUNTS_ENDPOINT}/api/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token,
            }),
            headers: {
                Authorization: AUTH_HEADER,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const responseData = await response.json();
        if (response.status !== 200) {
            console.log("=== TOKEN REFRESH FAILED WITH RESPONSE: ", responseData);
            return Response.json({ error: responseData }, { status: response.status });
        }
        console.log("=== TOKEN REFRESH SUCCEEDED WITH RESPONSE: ", responseData);
        return Response.json({ data: responseData });
    }
    catch (error) {
        console.log({ error });
        return Response.json({ error: error }, { status: 500 });
    }
}
//# sourceMappingURL=refresh+api.js.map