import dotenv from 'dotenv';
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Helper to recursively get all .js files in a directory
async function getApiFiles(dir) {
    let files = [];
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(await getApiFiles(fullPath));
        }
        else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
}
// Convert Express req to Fetch API Request
function expressToFetchRequest(req) {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const init = {
        method: req.method,
        headers: req.headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    };
    return new Request(url, init);
}
// Convert Fetch API Response to Express res
async function fetchResponseToExpress(res, response) {
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    const body = await response.text();
    res.send(body);
}
async function main() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    const apiDir = path.join(__dirname, 'api');
    const files = await getApiFiles(apiDir);
    for (const file of files) {
        // Compute route path
        let route = file
            .replace(apiDir, '')
            .replace(/\\/g, '/')
            .replace(/\+api\.js$/, '') // Remove +api.js
            .replace(/\.js$/, '') // Remove .js
            .replace(/\+/g, ''); // Remove all + characters
        if (route.endsWith('/index'))
            route = route.slice(0, -6);
        if (!route.startsWith('/'))
            route = '/' + route;
        // Dynamic import
        const mod = await import(pathToFileURL(file).href);
        // Register each HTTP method
        for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']) {
            if (typeof mod[method] === 'function') {
                app[method.toLowerCase()](route, async (req, res) => {
                    try {
                        const fetchReq = expressToFetchRequest(req);
                        const fetchRes = await mod[method](fetchReq);
                        await fetchResponseToExpress(res, fetchRes);
                    }
                    catch (err) {
                        console.error(err);
                        res.status(500).send('Internal Server Error');
                    }
                });
                console.log(`Registered [${method}] ${route}`);
            }
        }
    }
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
        console.log(`API server running at http://localhost:${port}`);
    });
}
main();
//# sourceMappingURL=index.js.map