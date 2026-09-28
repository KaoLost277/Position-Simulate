// Pure, framework-free calculation and simulation logic.
// No React, no DOM. Everything here is trivially unit-testable.

export const MODES = Object.freeze({
  COMPOUND: "compound",
  FIXED: "fixed",
});

export const RESULTS = Object.freeze({
  WIN: "win",
  LOSE: "lose",
});

const REQUIRED_POSITIVE = ["balance", "risk", "takeProfit", "stopLoss"];

// Turn a raw input value (string or number) into a finite number, or null.
export function toNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Validate the raw input fields. Returns the parsed values only when every
// field is usable, so callers can show "—" instead of a bogus number.
export function validateInputs(raw) {
  const values = {};

  for (const field of REQUIRED_POSITIVE) {
    const n = toNumber(raw[field]);
    if (n === null || n <= 0) return { valid: false, values: null };
    values[field] = n;
  }

  const leverage = toNumber(raw.leverage);
  if (leverage === null || leverage < 1) return { valid: false, values: null };
  values.leverage = leverage;

  return { valid: true, values };
}

// The single-trade model. `balance` is the balance used for sizing; leverage
// affects only the required margin, never the dollar risk or reward.
export function deriveTrade(values, balance = values.balance) {
  const riskAmount = (balance * values.risk) / 100;
  const notional = riskAmount / (values.stopLoss / 100);
  const margin = notional / values.leverage;
  const reward = (notional * values.takeProfit) / 100;
  const risk = (notional * values.stopLoss) / 100;
  const rewardToRisk = values.takeProfit / values.stopLoss;
  const breakEvenWinRate =
    values.stopLoss / (values.stopLoss + values.takeProfit);

  return {
    riskAmount,
    notional,
    margin,
    reward,
    risk,
    rewardToRisk,
    breakEvenWinRate,
  };
}

// Fractional return of a single trade relative to the balance it is sized
// from. Recording only this rate keeps history independent of the balance, so
// editing the balance rescales the whole curve instead of destroying it.
export function tradeRate(values, result) {
  const riskFraction = values.risk / 100;
  if (result === RESULTS.WIN) {
    return riskFraction * (values.takeProfit / values.stopLoss);
  }
  return -riskFraction;
}

// Re-derive pnl and running balance for the whole history from a starting
// balance and mode. Compounding sizes each trade from the live balance; fixed
// sizes every trade from the starting balance.
export function replay(history, startingBalance, mode) {
  let balance = startingBalance;
  return history.map((row) => {
    const base = mode === MODES.FIXED ? startingBalance : balance;
    const pnl = base * row.rate;
    balance += pnl;
    return { ...row, pnl, balance };
  });
}

export const initialState = Object.freeze({
  mode: MODES.COMPOUND,
  history: [],
});

// Balance after all recorded trades, or the starting balance when none exist.
export function currentBalance(state, startingBalance) {
  const rows = replay(state.history, startingBalance, state.mode);
  return rows.length ? rows[rows.length - 1].balance : startingBalance;
}

// The balance a new trade is sized from: the live balance when compounding,
// the original balance when fixed.
export function sizingBalance(state, startingBalance) {
  return state.mode === MODES.FIXED
    ? startingBalance
    : currentBalance(state, startingBalance);
}

export function countWins(history) {
  return history.filter((trade) => trade.result === RESULTS.WIN).length;
}

export function countLosses(history) {
  return history.filter((trade) => trade.result === RESULTS.LOSE).length;
}

// Fraction (0..1), or null when no trades have been recorded.
export function winRate(history) {
  return history.length ? countWins(history) / history.length : null;
}

// Expected value per trade using the current win rate and the reward/risk the
// next trade would produce. Null until there is at least one trade.
export function expectancy(state, values, startingBalance) {
  const rate = winRate(state.history);
  if (rate === null || !values) return null;
  const { reward, risk } = deriveTrade(values, sizingBalance(state, startingBalance));
  return rate * reward - (1 - rate) * risk;
}

// Pure state transition. `values` is the validated input object (or null).
export function reducer(state, action) {
  switch (action.type) {
    case "setMode":
      return { ...state, mode: action.mode };

    case "record": {
      if (!action.values) return state;
      const trade = {
        tradeNumber: state.history.length,
        result: action.result,
        rate: tradeRate(action.values, action.result),
      };
      return { ...state, history: [...state.history, trade] };
    }

    case "undo":
      if (!state.history.length) return state;
      return { ...state, history: state.history.slice(0, -1) };

    case "clearHistory":
      if (!state.history.length) return state;
      return { ...state, history: [] };

    default:
      return state;
  }
}
