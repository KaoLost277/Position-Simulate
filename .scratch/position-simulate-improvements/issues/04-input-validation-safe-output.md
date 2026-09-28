# 04: Input validation and safe output

**What to build:** A trader can never be shown a bogus number. While inputs are incomplete or invalid, every derived output shows an em dash (`—`) and the Win/Lose buttons are disabled. Impossible values are rejected: balance, risk, take profit, and stop loss must be finite and greater than zero; leverage must be finite and at least 1. Clearing a field must never surface `Infinity`, `NaN`, or a silently truncated value.

**Blocked by:** 03: Trade sequence with live equity curve

**Status:** ready-for-agent

- [ ] With any required input empty, non-numeric, or invalid, derived outputs show `—` and trade buttons are disabled.
- [ ] Balance, risk, take profit, and stop loss require finite values greater than zero; leverage requires a finite value at least 1.
- [ ] Zero, negative, and non-numeric entries are rejected without crashing or showing `NaN`/`Infinity`.
- [ ] Clearing a previously valid field returns outputs to `—` and disables trade buttons.
- [ ] Large balances and P/L values display correctly without 32-bit overflow or truncation.
- [ ] Validation behavior is covered by tests at the pure-module barrier and by at least one component test.
- [ ] `CI=true npm run build` stays warning-free.
