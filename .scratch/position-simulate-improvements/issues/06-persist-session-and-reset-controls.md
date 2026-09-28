# 06: Persist session and reset controls

**What to build:** A trader's session survives a page refresh. Inputs, trade history, win/loss counts, and the compounding mode are stored locally and restored on load. Two distinct controls exist: "Reset" clears the input fields while keeping the history, and "Clear history" wipes the trade log and counts. No backend or external service is used.

**Blocked by:** 03: Trade sequence with live equity curve

**Status:** ready-for-agent

- [ ] Inputs, trade history, win/loss counts, and compounding mode persist across a page refresh via browser local storage.
- [ ] On load, a previously saved session is hydrated and displayed correctly.
- [ ] "Reset" clears only the input fields; the history and counts remain.
- [ ] "Clear history" wipes the trade history and resets win/loss counts (and the running balance accordingly), leaving inputs as they are.
- [ ] Persistence hydration and both controls are covered by component tests.
- [ ] No backend, account, or API-key service is introduced; stored data stays on the device.
- [ ] `CI=true npm run build` stays warning-free.
