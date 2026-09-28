// Pure, framework-free calculation and simulation logic.
// No React, no DOM. Everything here is trivially unit-testable.

export const MODES = Object.freeze({
  COMPOUND: "compound",
  FIXED: "fixed",
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
  const errors = {};

  for (const field of REQUIRED_POSITIVE) {
    const n = toNumber(raw[field]);
    if (n === null) {
      errors[field] = "required";
    } else if (n <= 0) {
      errors[field] = "must be greater than 0";
    } else {
      values[field] = n;
    }
  }

  const leverage = toNumber(raw.leverage);
  if (leverage === null) {
    errors.leverage = "required";
  } else if (leverage < 1) {
    errors.leverage = "must be at least 1";
  } else {
    values.leverage = leverage;
  }

  const valid = Object.keys(errors).length === 0;
  return { valid, values: valid ? values : null, errors };
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

export const initialState = Object.freeze({
  mode: MODES.COMPOUND,
  startingBalance: 0,
  history: [],
});

// Balance after all recorded trades, or the starting balance when none exist.
export function currentBalance(state) {
  const last = state.history[state.history.length - 1];
  return last ? last.balance : state.startingBalance;
}

// The balance a new trade is sized from: the live balance when compounding,
// the original balance when fixed.
export function sizingBalance(state) {
  return state.mode === MODES.FIXED ? state.startingBalance : currentBalance(state);
}

export function countWins(history) {
  return history.filter((trade) => trade.result === "win").length;
}

export function countLosses(history) {
  return history.filter((trade) => trade.result === "lose").length;
}

// Fraction (0..1), or null when no trades have been recorded.
export function winRate(history) {
  return history.length ? countWins(history) / history.length : null;
}

// Expected value per trade using the current win rate and the reward/risk the
// next trade would produce. Null until there is at least one trade.
export function expectancy(state, values) {
  const rate = winRate(state.history);
  if (rate === null || !values) return null;
  const { reward, risk } = deriveTrade(values, sizingBalance(state));
  return rate * reward - (1 - rate) * risk;
}

// Pure state transition. `values` is the validated input object (or null).
export function reducer(state, action) {
  switch (action.type) {
    case "setMode":
      return { ...state, mode: action.mode };

    case "setStartingBalance": {
      if (action.value === state.startingBalance) return state;
      // Changing the origin of the equity curve invalidates the recorded run.
      return { ...state, startingBalance: action.value, history: [] };
    }

    case "record": {
      if (!action.values) return state;
      const base = sizingBalance(state);
      const { reward, risk } = deriveTrade(action.values, base);
      const pnl = action.result === "win" ? reward : -risk;
      const trade = {
        tradeNumber: state.history.length,
        result: action.result,
        pnl,
        balance: currentBalance(state) + pnl,
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
