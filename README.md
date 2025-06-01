# ExpoExpress

**Easily deploy your Expo API Routes as a standalone Express server—no Expo web build required!**

## Why?

Expo's API Routes feature is a powerful way to add backend endpoints to your Expo app, but currently, deploying these routes outside of Expo's web build (`npx expo export -p web`) is not officially supported. Many developers only need the API endpoints for their mobile apps and run into issues when their project can't build for web (e.g., due to incompatible dependencies or web-only errors).

**ExpoExpress** solves this by letting you drag-and-drop your `api` folder (from your Expo project) into this server, instantly exposing your API routes via Express—no Expo, no web build, no hassle.

---

## Features

- **Zero-config:** Just copy your `api` folder here and run the server.
- **No Expo dependency:** Does not require Expo or any Expo CLI tooling.
- **Automatic route registration:** All your API routes are auto-registered, matching the Expo API Routes convention.
- **Supports all HTTP methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS.
- **TypeScript support:** Write your routes in TypeScript, compile, and serve.

---

## How It Works

- Place your Expo-style `api` folder inside the `/api` directory of this project.
- The server recursively loads all `.js` files in `/api`, mapping them to Express routes using the same conventions as Expo API Routes.
- Each exported HTTP method (`GET`, `POST`, etc.) in your route files is registered as an Express handler.

---

## Getting Started

### 1. Clone this repo

```sh
git clone https://github.com/jongan69/ExpoExpress.git
cd ExpoExpress
```

### 2. Copy your API routes

Copy your `api` folder from your Expo project into this repo's root directory:

```
/ExpoExpress
  /api
    /your-api-routes-here
  index.ts
  package.json
  ...
```

### 3. Install dependencies

```sh
npm install
# or
yarn install
# or
pnpm install
# or 
bun install
```


### 4. Compile TypeScript (if using TypeScript)

```sh
npm run compile
```

This will:
- Compile your TypeScript files to JavaScript.
- Fix import extensions for Node.js compatibility.

### 5. Start the server

```sh
npm start
```

The server will run on `http://localhost:3001` by default (configurable via the `PORT` environment variable).

---

## Example

Suppose you have the following Expo API route:

```js
// api/hello/+api.ts
export async function GET(request: Request) {
  return new Response('Hello from Expo API Route!');
}
```

After copying this into `/api/hello/+api.ts` and starting the server, you can access:

```
GET http://localhost:3001/hello
```

---

## Supported Features

- **Route mapping:** Follows Expo's API route conventions (e.g., `/api/hello/+api.ts` → `/hello`).
- **HTTP methods:** Export `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, or `OPTIONS` functions from your route files.
- **Request/Response:** Handlers use the Fetch API's `Request` and `Response` objects, just like in Expo.

---

## Limitations

- Only `.js` files are loaded at runtime. If using TypeScript, ensure you compile to `.js` before running.
- Middleware and advanced Express features are not auto-injected; this is a minimal bridge for Expo API Routes.
- Not all Expo-specific APIs (e.g., `expo-auth-session`) will work outside the Expo runtime.

---

## Why not just use `npx expo export -p web`?

- If your project can't build for web (e.g., due to incompatible dependencies, web-only errors, or you simply don't need a web app), Expo's export command won't work.
- This server lets you deploy your API endpoints independently of the web build process.

---

## FAQ

**Q: Can I use this in production?**  
A: This is a minimal bridge for deploying API endpoints. For production, consider adding your own authentication, rate limiting, and error handling as needed.

**Q: Does this support dynamic routes?**  
A: Yes, as long as your file structure matches Expo's API Routes conventions.

**Q: What about middlewares?**  
A: You can add Express middlewares in `index.ts` as needed.

---

## Credits

Inspired by the needs of the Expo community ([see issue #30450](https://github.com/expo/expo/issues/30450)).

---

## License

MIT

---

**Happy hacking!** If you have suggestions or run into issues, feel free to open a PR or issue.
