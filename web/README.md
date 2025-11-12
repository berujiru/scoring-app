# Scoring App - Frontend

This is a Vite + React + TypeScript frontend scaffold for the Scoring App backend.

Features included:
- React + TypeScript
- React Router (v6)
- TailwindCSS (mobile-first)
- OpenAPI generation (dev tools configured)

Quick start

1. Install dependencies

```bash
cd web
npm install
```

2. Start dev server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

OpenAPI client

We included `openapi-typescript` and `openapi-typescript-fetch` as dev tools to generate a typed fetch client from your backend OpenAPI spec.

Example (run from `web/`):

```bash
# download/openapi.json to ./openapi.json (or point to remote url) then:
npx openapi-typescript openapi.json --output src/api/types.ts
npx openapi-typescript-fetch --input openapi.json --output src/api/client.ts
```

Note: update `VITE_API_BASE_URL` in `.env` (or in your environment) to point to the backend API.
