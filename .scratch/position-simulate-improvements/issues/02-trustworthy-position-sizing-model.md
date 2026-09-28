# 02: Trustworthy position-sizing model

**What to build:** A trader enters balance, risk per trade (%), take profit (%), stop loss (%), and leverage, and gets a correct single-trade readout. Position size is shown as notional exposure, required margin is shown separately, and leverage affects only the margin. The risk-to-reward field reads correctly as `1 : N`, and a break-even win rate is shown. The meaningless "You Can Lose" output is removed. The math lives in a framework-free, pure calculation module with unit tests.

**Blocked by:** 01: Clean green baseline

**Status:** ready-for-agent

- [ ] Inputs are captured as numbers (percentages entered as whole percent, e.g. `2` = 2%).
- [ ] Notional position size is `risk amount / (stop loss %)` and is labeled as position size.
- [ ] Required margin is shown separately as `notional / leverage`.
- [ ] Risk amount (dollar loss at stop) and reward (dollar gain at target) are shown.
- [ ] Risk-to-reward displays as `1 : (take profit / stop loss)`, e.g. TP 8%, SL 2% shows `1 : 4`.
- [ ] Break-even win rate is shown as `stop loss / (stop loss + take profit)`.
- [ ] "You Can Lose" / any `100 / risk + wins - losses` value is gone.
- [ ] Changing leverage changes margin but not the dollar risk/reward.
- [ ] All formulas live in a pure module with unit tests covering notional, margin, risk, reward, R:R, and break-even win rate.
- [ ] `CI=true npm run build` stays warning-free.
