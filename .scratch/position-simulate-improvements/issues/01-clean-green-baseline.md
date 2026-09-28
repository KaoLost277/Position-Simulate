# 01: Clean green baseline

**What to build:** Nothing new for the trader — this is the prefactor that makes every later change land on a clean, trustworthy foundation. The project should build warning-free and the browser console should be quiet, so later tickets cannot hide regressions in existing noise.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `node_modules` installed via `npm ci`; the app runs with `npm start`.
- [ ] `CI=true npm run build` completes with zero ESLint warnings/errors.
- [ ] Dead module-level variables and all unused imports are removed across the app.
- [ ] Read-only result fields use React's `readOnly` prop; no "Invalid DOM property" warnings.
- [ ] The table renders with valid `Thead`/`Tbody` structure and every mapped row has a `key`; no `validateDOMNesting`/key warnings.
- [ ] The leftover Next.js-style app signature is gone; the app reflects a plain CRA render.
- [ ] The broken default test that asserts a "learn react" link is deleted, so the suite no longer reports a false failure.
- [ ] No user-visible behavior changes in this ticket.
