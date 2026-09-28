# AGENTS.md

Position Simulate: a Create React App (CRA) frontend — a crypto position-size / risk calculator. No backend, no API calls.

## Commands

- `npm start` — dev server (CRA, port 3000)
- `npm run build` — production bundle to `build/`
- First run in a fresh checkout: `npm ci` (or `npm install`) — `node_modules` is not committed
- `CI=true npm run build` turns ESLint warnings into build errors; a clean build requires removing unused imports/dead code
- `npm test` — Jest in **watch mode**; in an agent shell use `CI=true npm test` to run once and exit
- Single test: `CI=true npm test -- src/lib/simulation.test.js`
- No lint script. ESLint is configured via `eslintConfig` in `package.json` (`react-app`) and only runs as part of `npm run build`.

## Verified gotchas

- React 17 / `react-scripts` 5.0.0 / Chakra UI **v1**. Do not apply Chakra v2 or React 18+ APIs (`createRoot`, `ChakraProvider` v2 patterns, etc.).
- `src/App.js` is a plain CRA component; `src/index.js` renders it with `ReactDOM.render`. Don't reintroduce Next.js conventions.
- `ChakraProvider` receives `theme` from `src/Components/theme.js`. The theme defines only `config` (default `light` mode); the `twitter.*` tokens used in `calculator.js` are Chakra v1 built-ins, not custom tokens.
- `npm test` runs the real suites in `src/lib/*.test.js` and `src/Components/calculator.test.js`. There is no more failing CRA default test.
- The package name in `package.json` is `setup-positon` (typo), unrelated to the app name "Position Simulate".

## Structure

- `src/index.js` → `src/App.js` → `Navbar` + `Calculator`
- `src/lib/simulation.js` — **all** calculation, validation and state logic (pure, framework-free): input validation, `parseStartingBalance`, `sanitizeHistory`/`hydrateSimulation`, single-trade model, `tradeRate`, `replay`, reducer. State stores a per-trade `rate`, not balances; balances are re-derived with `replay` so editing the balance rescales the curve without losing history. Tested in `src/lib/simulation.test.js`.
- `src/lib/format.js` — number/percent display helpers (returns `—` for non-finite values). `src/lib/colors.js` — shared win/loss colors.
- `src/Components/calculator.js` — the view; reads from `simulation.js`, persists to `localStorage` (`position-simulate:v1`). Tested in `src/Components/calculator.test.js`.
- `src/Components/TradeHistory.js` — trade history table; `navbar.js`, `theme.js` — chrome.
- Deployed on Netlify (https://positionsimulate.netlify.app); no CI workflow or deploy config committed — Netlify builds `npm run build` and serves `build/`.
- Planning docs live in `.scratch/position-simulate-improvements/` (local-markdown issue tracker).
