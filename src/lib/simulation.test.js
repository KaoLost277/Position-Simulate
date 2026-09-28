import {
  MODES,
  currentBalance,
  countLosses,
  countWins,
  deriveTrade,
  expectancy,
  initialState,
  reducer,
  sizingBalance,
  toNumber,
  validateInputs,
  winRate,
} from "./simulation";

const VALID = {
  balance: "1000",
  risk: "2",
  takeProfit: "8",
  stopLoss: "2",
  leverage: "10",
};

describe("toNumber", () => {
  it("parses numeric strings", () => {
    expect(toNumber("2.5")).toBe(2.5);
  });

  it("rejects blank, non-numeric and non-finite input", () => {
    expect(toNumber("")).toBeNull();
    expect(toNumber("   ")).toBeNull();
    expect(toNumber("abc")).toBeNull();
    expect(toNumber(Infinity)).toBeNull();
    expect(toNumber(null)).toBeNull();
  });
});

describe("validateInputs", () => {
  it("accepts positive fields and leverage >= 1", () => {
    const { valid, values } = validateInputs(VALID);
    expect(valid).toBe(true);
    expect(values).toEqual({
      balance: 1000,
      risk: 2,
      takeProfit: 8,
      stopLoss: 2,
      leverage: 10,
    });
  });

  it("rejects zero, negative and empty fields", () => {
    expect(validateInputs({ ...VALID, balance: "0" }).valid).toBe(false);
    expect(validateInputs({ ...VALID, risk: "-1" }).valid).toBe(false);
    expect(validateInputs({ ...VALID, stopLoss: "" }).valid).toBe(false);
  });

  it("rejects leverage below 1", () => {
    expect(validateInputs({ ...VALID, leverage: "0.5" }).valid).toBe(false);
    expect(validateInputs({ ...VALID, leverage: "0" }).valid).toBe(false);
  });

  it("does not return values when invalid", () => {
    expect(validateInputs({ ...VALID, risk: "" }).values).toBeNull();
  });
});

describe("deriveTrade", () => {
  const values = { balance: 1000, risk: 2, takeProfit: 8, stopLoss: 2, leverage: 10 };

  it("computes the standard position-sizing model", () => {
    const t = deriveTrade(values);
    expect(t.riskAmount).toBe(20);
    expect(t.notional).toBe(1000);
    expect(t.margin).toBe(100);
    expect(t.reward).toBe(80);
    expect(t.risk).toBe(20);
    expect(t.rewardToRisk).toBe(4);
    expect(t.breakEvenWinRate).toBeCloseTo(0.2, 10);
  });

  it("changes margin but not dollar risk/reward when leverage changes", () => {
    const a = deriveTrade({ ...values, leverage: 5 });
    const b = deriveTrade({ ...values, leverage: 20 });
    expect(a.margin).not.toBe(b.margin);
    expect(a.reward).toBe(b.reward);
    expect(a.risk).toBe(b.risk);
  });

  it("sizes from an explicit balance", () => {
    expect(deriveTrade(values, 2000).reward).toBe(160);
  });
});

describe("reducer / recording trades", () => {
  const values = { balance: 1000, risk: 2, takeProfit: 8, stopLoss: 2, leverage: 10 };
  const start = { ...initialState, startingBalance: 1000 };

  it("records a win against the running balance", () => {
    const next = reducer(start, { type: "record", result: "win", values });
    expect(next.history).toHaveLength(1);
    expect(next.history[0]).toMatchObject({ tradeNumber: 0, result: "win", pnl: 80, balance: 1080 });
  });

  it("records a loss against the running balance", () => {
    const next = reducer(start, { type: "record", result: "lose", values });
    expect(next.history[0]).toMatchObject({ result: "lose", pnl: -20, balance: 980 });
  });

  it("compounds by sizing each new trade from the live balance", () => {
    let state = reducer(start, { type: "record", result: "win", values });
    state = reducer(state, { type: "record", result: "win", values });
    // second win: 2% of 1080 = 21.6 risk, reward 86.4
    expect(state.history[1].pnl).toBeCloseTo(86.4, 10);
    expect(currentBalance(state)).toBeCloseTo(1166.4, 10);
  });

  it("sizes every trade from the starting balance in fixed mode", () => {
    const fixed = reducer(start, { type: "setMode", mode: MODES.FIXED });
    let state = reducer(fixed, { type: "record", result: "win", values });
    state = reducer(state, { type: "record", result: "win", values });
    expect(state.history[1].pnl).toBe(80);
    expect(currentBalance(state)).toBe(1160);
  });

  it("ignores a record action without validated values", () => {
    expect(reducer(start, { type: "record", result: "win", values: null })).toBe(start);
  });

  it("undo removes the last trade and is a safe no-op when empty", () => {
    const state = reducer(start, { type: "record", result: "win", values });
    const undone = reducer(state, { type: "undo" });
    expect(undone.history).toHaveLength(0);
    expect(currentBalance(undone)).toBe(1000);
    expect(reducer(start, { type: "undo" })).toBe(start);
  });

  it("clearing history restores the starting balance", () => {
    const state = reducer(start, { type: "record", result: "lose", values });
    expect(currentBalance(reducer(state, { type: "clearHistory" }))).toBe(1000);
  });

  it("changing the starting balance clears the recorded run", () => {
    const state = reducer(start, { type: "record", result: "win", values });
    const next = reducer(state, { type: "setStartingBalance", value: 2000 });
    expect(next.startingBalance).toBe(2000);
    expect(next.history).toHaveLength(0);
  });
});

describe("derived summary", () => {
  const values = { balance: 1000, risk: 2, takeProfit: 8, stopLoss: 2, leverage: 10 };
  const start = { ...initialState, startingBalance: 1000 };

  it("computes counts, win rate and sizing balance", () => {
    let state = reducer(start, { type: "record", result: "win", values });
    state = reducer(state, { type: "record", result: "lose", values });
    expect(countWins(state.history)).toBe(1);
    expect(countLosses(state.history)).toBe(1);
    expect(winRate(state.history)).toBeCloseTo(0.5, 10);
    expect(sizingBalance(state)).toBe(currentBalance(state));
  });

  it("returns null win rate and expectancy before any trade", () => {
    expect(winRate(start.history)).toBeNull();
    expect(expectancy(start, values)).toBeNull();
  });

  it("computes expectancy from the current win rate and reward/risk", () => {
    const state = reducer(start, { type: "record", result: "win", values });
    // 100% win rate, compounding: expectancy == reward of the next trade
    // (2% of 1080 = 21.6 risk, 8% reward = 86.4)
    expect(expectancy(state, values)).toBeCloseTo(86.4, 10);
  });
});
