# 03: Trade sequence with live equity curve

**What to build:** A trader records a sequence of trades with Win/Lose buttons and watches a real equity curve, not a straight-line sum. Each new trade is sized from the current balance by default (compounding), with a toggle to size every trade from the starting balance instead. The history table shows each trade's result, profit/loss, and running balance. Win/loss counts, win rate, and expectancy update with the sequence, and Undo reverses the last trade. State transitions live in the pure module.

**Blocked by:** 02: Trustworthy position-sizing model

**Status:** ready-for-agent

- [ ] Recording a win or loss appends a row and updates the running balance.
- [ ] Compounding is the default: each new trade is sized from the balance before that trade.
- [ ] A toggle switches to fixed-initial-balance sizing, and the readout/history reflect the change.
- [ ] History table columns: trade number, result, profit/loss USDT, running balance; numbers formatted with thousands separators and without 32-bit truncation.
- [ ] Win count, loss count, win rate, and expectancy (win rate × reward − loss rate × risk) are shown and update with the sequence.
- [ ] Undo removes the last row and restores prior counts and balance; it is a safe no-op when the history is empty.
- [ ] Trade recording uses functional state updates (no stale-value behavior on rapid clicks).
- [ ] State transitions (record win, record lose, undo) are unit-tested in the pure module.
- [ ] Component tests cover: record win, record lose, and undo through the UI.
- [ ] `CI=true npm run build` stays warning-free.
