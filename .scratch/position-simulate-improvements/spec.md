# Spec: Position Simulate — Correctness & Usability Overhaul

Status: ready-for-agent
Tracker: local markdown (`.scratch/position-simulate-improvements/`) — repo has not run `/setup-matt-pocock-skills`

## Problem Statement

The Position Simulate calculator gives traders numbers they cannot trust and a UI that breaks on small screens.

From the trader's perspective:

- "Position Size" is off by a factor of leverage, and leverage cancels out of profit/loss entirely, so changing leverage does not change the outcome the way it should. The displayed position size is really the margin, unlabeled.
- The "R:R" field renders backwards and rounded to whole numbers (take-profit 1%, stop-loss 3% shows `0:3` instead of `1:3`).
- "You Can Lose" shows a value with no statistical meaning, and literally reads `Infinity` when the risk field is cleared.
- A trade's P/L is always sized from the starting balance, so the running balance is a straight-line sum, not a real equity curve — misleading for anyone simulating a sequence of trades.
- The page uses fixed pixel heights and a media query, so it is broken on phones.
- Inputs are accepted as free text with no validation, producing `NaN`/`Infinity`/silently truncated values.

## Solution

A trustworthy, responsive, single-page trade-position simulator that:

- Computes a standard, documented position-sizing model (see Implementation Decisions), separating notional position size from required margin, with leverage affecting only margin.
- Replaces meaningless outputs with trader-standard metrics (break-even win rate, expectancy).
- Simulates a sequence of trades against a live equity curve, with a toggle between compounding and fixed-initial-balance sizing.
- Validates inputs; shows `—` and disables trade buttons until inputs are valid.
- Persists inputs and trade history in `localStorage`, with "Reset" and "Clear history" controls.
- Is fully responsive from 320px up, in English.

## User Stories

1. As a trader, I want to enter my account balance, risk per trade, take-profit %, stop-loss %, and leverage, so that I can size a position before trading.
2. As a trader, I want the position size to be shown as notional value, so that I know the total exposure the trade represents.
3. As a trader, I want the required margin shown separately, so that I know how much of my balance is actually locked up.
4. As a trader, I want leverage to affect the required margin but not the dollar profit/loss, so that changing leverage does not silently change my risk.
5. As a trader, I want my dollar risk on the trade shown, so that I can confirm it matches my intended risk per trade.
6. As a trader, I want my dollar reward at target shown, so that I know what the winning trade pays.
7. As a trader, I want the risk-to-reward ratio shown as `1 : N`, so that I can judge the trade setup at a glance.
8. As a trader, I want the break-even win rate shown, so that I know how often I need to win to not lose money.
9. As a trader, I want expectancy per trade shown, so that I can see whether the system is profitable given my current results.
10. As a trader, I want to record a win and a loss with one click, so that I can simulate a sequence of trades quickly.
11. As a trader, I want my running balance to update after each trade, so that I can see my equity evolve.
12. As a trader, I want compounding on by default, so that simulated trades reflect realistic growth from the current balance.
13. As a trader, I want to toggle compounding off, so that I can compare against a fixed-initial-balance baseline.
14. As a trader, I want to undo the last trade, so that I can correct a mistaken click.
15. As a trader, I want a history table of trades with number, result, profit/loss, and running balance, so that I can review the sequence.
16. As a trader, I want my win/loss counts and win rate shown, so that I can track my performance.
17. As a trader, I want the outputs to show `—` while my inputs are incomplete or invalid, so that I am never shown a bogus number.
18. As a trader, I want the trade buttons disabled until inputs are valid, so that I cannot record a trade against garbage inputs.
19. As a trader, I want inputs rejected when zero or negative (balance, risk, take-profit, stop-loss) or below 1 (leverage), so that impossible trades are not simulated.
20. As a trader, I want my inputs and history to persist across page refreshes, so that I do not lose my session.
21. As a trader, I want a "Reset" button that clears the input fields but keeps my history, so that I can start a fresh calculation without losing the log.
22. As a trader, I want a separate "Clear history" button, so that I can wipe the trade log and counts when I am done.
23. As a mobile user, I want the calculator to fit and be usable from a 320px-wide screen, so that I can use it on my phone.
24. As a mobile user, I want the input card and output card to stack vertically, and sit side by side on desktop, so that the layout suits my device.
25. As a dark-mode user, I want light/dark mode to work correctly across all new UI, so that the app is comfortable to read.
26. As a user, I want no `NaN`, `Infinity`, or truncated numbers ever displayed, so that I trust the output.
27. As a user, I want large balances and P/L values formatted with thousands separators and without 32-bit overflow, so that big numbers remain correct.
28. As a user, I want a clean browser console with no React warnings, so that the app feels professional.
29. As a maintainer, I want the calculation and simulation logic in a pure, framework-free module, so that it can be tested and reused.
30. As a maintainer, I want the React component to be a thin view over that module, so that logic and presentation stay separated.
31. As a maintainer, I want unit tests covering every formula (position size, margin, risk, reward, R:R, break-even win rate, expectancy, compounding), so that the math cannot silently regress.
32. As a maintainer, I want component tests covering the core user flows (enter inputs → record win/loss → undo → clear), so that wiring stays intact.
33. As a maintainer, I want the broken default `App.test.js` removed, so that the suite is trustworthy.
34. As a maintainer, I want `CI=true npm run build` to pass with zero warnings, so that CI/deploys are clean.
35. As a visitor, I want the deployed Netlify site to behave identically to local, so that what I share works.

## Implementation Decisions

### Domain glossary

- **Notional (position size)**: total exposure in USDT, independent of leverage.
- **Margin**: balance locked up = notional / leverage.
- **Risk amount**: USDT lost if the stop-loss is hit = balance × risk% (in compounding mode, current balance × risk%).
- **Reward**: USDT gained if the take-profit is hit = notional × take-profit%.
- **Risk per trade (%)**: percentage of balance risked per trade (replaces the misnamed "Risk of Ruin").
- **Equity curve**: running balance after each simulated trade.
- **Compounding**: sizing each new trade from the current balance. Non-compounding sizes every trade from the starting balance.
- **Trade sequence**: the ordered list of simulated Win/Lose events, with undo.

### Inputs and units

- Inputs: Balance (USDT), Risk per Trade (%), Take Profit (%), Stop Loss (%), Leverage (×).
- Percentages are entered as whole percent (e.g. `2` = 2%). No fraction/percent mixing.
- Values are stored as numbers, not raw strings.

### Calculation model

- `riskAmount = balance × risk/100`
- `notional = riskAmount / (stoploss/100)`
- `margin = notional / leverage`
- `reward = notional × takeprofit/100`
- `risk = notional × stoploss/100` (equals `riskAmount`)
- `rr = 1 : (takeprofit/stoploss)`
- `breakEvenWinRate = stoploss / (stoploss + takeprofit)`
- `winRate = wins / (wins + losses)`
- `expectancy = winRate × reward − (1 − winRate) × risk`
- Leverage affects **only** `margin`.

### Sequencing / state

- A single pure state transition handles: set inputs/mode, record win, record lose, undo, reset inputs, clear history.
- Recording a trade uses the balance **before** the trade to size it; the resulting balance is stored with the history row.
- Compounding default: **on**. A toggle switches to fixed-initial-balance.
- Undo removes the last history row and restores win/loss counts and balance.
- Undo is a no-op when history is empty.

### Modules

- Introduce a framework-free simulation/calculation module holding all of the above as pure functions and a pure state-transition function. (Seam — see Testing Decisions.)
- The existing Calculator component becomes a thin view: it renders inputs and outputs, dispatches transitions, and reads derived values from the module. The history table component consumes history rows.
- Fix the leftover Next.js-style `App` signature so it reflects a plain CRA render.
- Remove dead module-level variables and unused imports (required for a warning-free `CI=true` build).
- Wire the theme correctly or drop the unused custom theme so the intent is unambiguous; no custom tokens are actually needed (Chakra v1's built-ins are used).

### UI behavior

- Keep the two-card layout (Setting / Output) plus history table.
- Remove all fixed heights/widths; use responsive sizing so the layout is correct from 320px up, stacking on narrow screens and sitting side by side on wide screens.
- Outputs show `—` until inputs are valid; trade buttons are disabled until then.
- Validation: balance, risk, take-profit, stop-loss must be finite and `> 0`; leverage must be finite and `≥ 1`.
- Persist inputs, history, counts, and compounding mode in `localStorage`; hydrate on load.
- "Reset" clears input fields only; "Clear history" wipes history and counts. Both are distinct, explicit controls.
- Number formatting: use `Intl.NumberFormat` with thousands separators, no 32-bit bitwise truncation, no host-locale surprises.
- All read-only result fields use React's `readOnly` prop; table uses proper `Thead`/`Tbody` and keyed rows.
- English UI.

### Git workflow

- Work on a dedicated branch.
- Commit in logical chunks.
- Do not push until the user approves.

### Toolchain

- Stay on the current stack for this work (CRA, React 17, Chakra UI v1).
- `node_modules` is not committed; first run requires `npm ci`.
- `CI=true npm run build` treats ESLint warnings as errors — zero warnings is part of done.

## Testing Decisions

**What makes a good test here**: test observable behavior, not implementation. For the calculation/simulation module, assert input→output for formulas and state transitions (no React, no DOM). For the component, assert what a user sees and does (type, click, read output), not internal state shape.

**Seams** (please confirm these match your expectations):

1. **Primary seam — pure simulation module.** All formulas and the state transition (record win/lose/undo/reset/clear/set inputs/set mode) live here and are unit-tested. This is the highest-value, framework-free seam and should carry the bulk of the tests.
2. **Secondary seam — React Calculator component**, tested via `@testing-library/react` + `user-event` (already dependencies) for wiring: entering inputs updates outputs, Win/Lose update counts and history, Undo reverses, Reset/Clear behave as specified. Keep this thin; it exists to prove the view is connected, not to re-test math.

Both seams are new. No prior art exists in the repo (only the broken default `App.test.js`, which is deleted).

**Modules tested**: the simulation/calculation module (unit, exhaustive over formulas and transitions), and the Calculator component (a small number of integration flows).

**Required coverage**: position size/notional, margin, risk, reward, R:R, break-even win rate, expectancy, compounding vs fixed sizing, win/lose/undo transitions, invalid-input handling (`—`, disabled buttons), persistence hydration.

## Out of Scope

- CRA → Vite migration (phase 2, separate effort).
- TypeScript.
- Backend, accounts, cloud sync, or any paid/API-key service.
- Multiple portfolios / scenarios.
- CSV or image export.
- Thai localization / language switching.
- Charting library or visual equity-curve graph (numeric equity only for now).
- E2E/Playwright tests.
- Changing the deployment target (remains static Netlify).
- Redesigning the visual identity; the two-card layout is retained.

## Further Notes

- This repo has only two real commits and an untracked `AGENTS.md`; no CI workflow or Netlify config is committed.
- `AGENTS.md` at the repo root was written/updated this session and records the build/CI and stack gotchas; keep it in sync with any structural change.
- `package.json` name is `setup-positon` (typo); the app title is "Position Simulate". Renaming is optional and unrelated.
- Deployed at https://positionsimulate.netlify.app — verify behavior there after merge.
