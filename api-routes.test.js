const request = require('supertest');

const API_BASE = 'http://localhost:3001';

function getApiRoutes() {
  return [
    // openai
    { method: 'POST', route: '/openai/ai', description: 'OpenAI meme generator', testBody: { content: 'cat meme' }, isStream: true },
    // spotify
    { method: 'POST', route: '/spotify/swap', description: 'Spotify token swap', testBody: { code: 'dummy' } },
    { method: 'POST', route: '/spotify/refresh', description: 'Spotify token refresh', testBody: { refresh_token: 'dummy' } },
    // solana
    { method: 'GET', route: '/solana/airdrop', description: 'Solana airdrop', testQuery: '?address=11111111111111111111111111111111&amount=1000' },
    { method: 'GET', route: '/solana/jupiter', description: 'Solana Jupiter', testQuery: '?mintAddress=So11111111111111111111111111111111111111112' },
    { method: 'GET', route: '/solana/holdings', description: 'Solana holdings', testQuery: '?address=11111111111111111111111111111111&network=devnet' },
    { method: 'GET', route: '/solana/transactions', description: 'Solana transactions', testQuery: '?address=11111111111111111111111111111111&network=devnet' },
    // cloudflare (skipped, file upload)
    // pinata
    { method: 'GET', route: '/pinata/presignedUrl', description: 'Pinata presigned URL' },
    // stripe
    { method: 'POST', route: '/stripe/create-onramp', description: 'Stripe onramp', testBody: {} },
  ];
}

jest.setTimeout(60000);

describe('API route smoke tests', () => {
  const routes = getApiRoutes();

  routes.forEach(({ method, route, description, testBody, testQuery, isStream }) => {
    it(`${method} ${route} - ${description}`, async () => {
      const url = testQuery ? `${route}${testQuery}` : route;
      const start = Date.now();
      try {
        let res;
        if (isStream) {
          res = await new Promise((resolve, reject) => {
            request(API_BASE)
              .post(url)
              .send(testBody || {})
              .buffer(true)
              .parse((res, callback) => {
                let data = '';
                res.on('data', chunk => { data += chunk.toString(); });
                res.on('end', () => callback(null, data));
              })
              .end((err, res) => {
                if (err) return reject(err);
                resolve(res);
              });
          });
        } else if (method === 'GET') {
          res = await request(API_BASE).get(url);
        } else if (method === 'POST') {
          res = await request(API_BASE).post(url).send(testBody || {});
        }
        const duration = Date.now() - start;
        console.log(`\n[${method}] ${url} (${duration}ms)`);
        console.log('Status:', res.status);
        if (isStream) {
          console.log('Streamed Body (truncated):', res.text.slice(0, 500));
        } else {
          console.log('Body:', JSON.stringify(res.body, null, 2));
        }
        expect(res.status).toBeLessThan(500);
      } catch (err) {
        console.error(`\n[${method}] ${url} - ERROR:`, err);
        throw err;
      }
    });
  });
}); 