# Rooted

## Local Development (Netlify Functions + Vite)

The API endpoints (`nearby-events`, `nearby-places`) run as Netlify Functions.
Use `netlify dev` — it starts Vite on port 5173 and proxies everything (including functions) through port **8888**.

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

Add these to your `.env.local` (already gitignored):

```
EVENTBRITE_PRIVATE_TOKEN=your_token_here
GOOGLE_MAPS_API_KEY=your_key_here
```

### 3. Run

```bash
npm run dev:netlify
# or: npx netlify dev
```

Open **http://localhost:8888** (not 5173) — all `/.netlify/functions/*` calls route automatically.

### 4. Verify in the browser Network tab

1. Open DevTools → Network tab
2. Trigger a mood check-in (requires location permission)
3. Find the `nearby-events` request — it should hit `/.netlify/functions/nearby-events`
4. A **502** response means the Eventbrite token is wrong; the body will contain `{ error, status, details }` with the exact upstream error
5. A **200** response means events came back — check the JSON for `{ events: [...] }`

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
