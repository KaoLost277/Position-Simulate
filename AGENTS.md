# AGENTS.md

Position Simulate: a Create React App (CRA) frontend — a crypto position-size / risk calculator. No backend, no API calls.

## Commands

- `npm start` — dev server (CRA, port 3000)
- `npm run build` — production bundle to `build/`
- First run in a fresh checkout: `npm ci` (or `npm install`) — `node_modules` is not committed
- `CI=true npm run build` turns ESLint warnings into build errors; a clean build requires removing unused imports/dead code
- `npm test` — Jest in **watch mode**; in an agent shell use `CI=true npm test` to run once and exit
- Single test: `CI=true npm test -- App.test.js`
- No lint script. ESLint is configured via `eslintConfig` in `package.json` (`react-app`) and only runs as part of `npm run build`.

## Verified gotchas

- `src/App.test.js` is the untouched CRA default and **fails** (it looks for a "learn react" link that this app never renders). Treat a red test suite as pre-existing unless your change touches it.
- React 17 / `react-scripts` 5.0.0 / Chakra UI **v1**. Do not apply Chakra v2 or React 18+ APIs (`createRoot`, `ChakraProvider` v2 patterns, etc.).
- `App({Component, pageProps})` in `src/App.js` is a leftover Next.js-style signature; the app is rendered by `ReactDOM.render` in `src/index.js`. The props are unused — don't reintroduce Next.js conventions.
- `ChakraProvider` in `App.js` does **not** receive the theme. `src/Components/theme.js` is only used by `ColorModeScript` in `index.js`. This has no practical effect: `theme.js` defines only `config` (the default `light` mode), and the `twitter.*` tokens used in `calculator.js` are Chakra v1 built-ins, not custom tokens.
- `calculator.js` declares unused module-level `var` (`balance1`, `risk1`, ...). Ignore/remove; they are dead code.
- The package name in `package.json` is `setup-positon` (typo), unrelated to the app name "Position Simulate".

## Structure

- `src/index.js` → `src/App.js` → `Navbar` + `Calculator`
- `src/Components/calculator.js` — all calculation/state logic and calculator UI; the core file
- `src/Components/tableShow.js` — trade history table
- `src/Components/navbar.js`, `theme.js`
- Deployed on Netlify (https://positionsimulate.netlify.app); no CI workflow or deploy config committed — Netlify builds `npm run build` and serves `build/`.
