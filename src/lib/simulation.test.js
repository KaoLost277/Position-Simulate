import {
  MODES,
  RESULTS,
  currentBalance,
  countLosses,
  countWins,
  deriveTrade,
  expectancy,
  hydrateSimulation,
  initialState,
  parseStartingBalance,
  reducer,
  replay,
  sanitizeHistory,
  sizingBalance,
  toNumber,
  tradeRate,
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

const VALUES = {
  balance: 1000,
  risk: 2,
  takeProfit: 8,
  stopLoss: 2,
  leverage: 10,
};

function record(state, result, values = VALUES) {
  return reducer(state, { type: "record", result, values });
}

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
    expect(values).toEqual(VALUES);
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
  it("computes the standard position-sizing model", () => {
    const t = deriveTrade(VALUES);
    expect(t.riskAmount).toBe(20);
    expect(t.notional).toBe(1000);
    expect(t.margin).toBe(100);
    expect(t.reward).toBe(80);
    expect(t.risk).toBe(20);
    expect(t.rewardToRisk).toBe(4);
    expect(t.breakEvenWinRate).toBeCloseTo(0.2, 10);
  });

  it("changes margin but not dollar risk/reward when leverage changes", () => {
    const a = deriveTrade({ ...VALUES, leverage: 5 });
    const b = deriveTrade({ ...VALUES, leverage: 20 });
    expect(a.margin).not.toBe(b.margin);
    expect(a.reward).toBe(b.reward);
    expect(a.risk).toBe(b.risk);
  });
});

describe("tradeRate", () => {
  it("is the reward/risk fraction on a win", () => {
    expect(tradeRate(VALUES, RESULTS.WIN)).toBeCloseTo(0.08, 10);
  });

  it("is the negative risk fraction on a loss", () => {
    expect(tradeRate(VALUES, RESULTS.LOSE)).toBeCloseTo(-0.02, 10);
  });
});

describe("recording trades", () => {
  it("stores only the rate, not the balance", () => {
    const state = record(initialState, RESULTS.WIN);
    expect(state.history[0]).toEqual({
      tradeNumber: 0,
      result: "win",
      rate: 0.08,
    });
  });

  it("compounds by sizing each new trade from the live balance", () => {
    let state = record(initialState, RESULTS.WIN);
    state = record(state, RESULTS.WIN);
    const rows = replay(state.history, 1000, MODES.COMPOUND);
    expect(rows[0]).toMatchObject({ pnl: 80, balance: 1080 });
    expect(rows[1].pnl).toBeCloseTo(86.4, 10);
    expect(rows[1].balance).toBeCloseTo(1166.4, 10);
  });

  it("sizes every trade from the starting balance in fixed mode", () => {
    let state = record(initialState, RESULTS.WIN);
    state = record(state, RESULTS.WIN);
    const rows = replay(state.history, 1000, MODES.FIXED);
    expect(rows[1]).toMatchObject({ pnl: 80, balance: 1160 });
  });

  it("rescales the whole curve when the starting balance changes", () => {
    const state = record(initialState, RESULTS.WIN);
    const rows = replay(state.history, 2000, MODES.COMPOUND);
    expect(rows[0]).toMatchObject({ pnl: 160, balance: 2160 });
  });

  it("ignores a record action without validated values", () => {
    expect(reducer(initialState, { type: "record", result: "win", values: null })).toBe(
      initialState
    );
  });

  it("undo removes the last trade and is a safe no-op when empty", () => {
    const state = record(initialState, RESULTS.WIN);
    const undone = reducer(state, { type: "undo" });
    expect(undone.history).toHaveLength(0);
    expect(reducer(initialState, { type: "undo" })).toBe(initialState);
  });

  it("clearing history restores the starting balance", () => {
    const state = record(initialState, RESULTS.LOSE);
    const cleared = reducer(state, { type: "clearHistory" });
    expect(cleared.history).toHaveLength(0);
    expect(currentBalance(cleared, 1000)).toBe(1000);
  });
});

describe("session rehydration helpers", () => {
  it("parses a positive starting balance or null", () => {
    expect(parseStartingBalance("1000")).toBe(1000);
    expect(parseStartingBalance("0")).toBeNull();
    expect(parseStartingBalance("-5")).toBeNull();
    expect(parseStartingBalance("")).toBeNull();
    expect(parseStartingBalance("abc")).toBeNull();
  });

  it("drops rows that cannot be replayed", () => {
    const good = { tradeNumber: 0, result: "win", rate: 0.08 };
    const kept = sanitizeHistory([
      good,
      null,
      { tradeNumber: 1, result: "win", rate: "0.08" },
      { tradeNumber: 2, result: "sideways", rate: 0.1 },
      { tradeNumber: 3, result: "lose", rate: -0.02 },
    ]);
    expect(kept).toEqual([
      good,
      { tradeNumber: 3, result: "lose", rate: -0.02 },
    ]);
  });

  it("hydrates mode and history, defaulting safely", () => {
    expect(hydrateSimulation(null)).toEqual(initialState);
    expect(hydrateSimulation({ mode: "nonsense", history: "no" })).toEqual(
      initialState
    );
    const hydrated = hydrateSimulation({
      mode: MODES.FIXED,
      history: [{ tradeNumber: 0, result: "win", rate: 0.08 }],
    });
    expect(hydrated.mode).toBe(MODES.FIXED);
    expect(hydrated.history).toHaveLength(1);
  });
});

describe("derived summary", () => {
  it("computes counts, win rate and sizing balance", () => {
    let state = record(initialState, RESULTS.WIN);
    state = record(state, RESULTS.LOSE);
    expect(countWins(state.history)).toBe(1);
    expect(countLosses(state.history)).toBe(1);
    expect(winRate(state.history)).toBeCloseTo(0.5, 10);
    expect(sizingBalance(state, 1000)).toBe(currentBalance(state, 1000));
  });

  it("returns null win rate and expectancy before any trade", () => {
    expect(winRate(initialState.history)).toBeNull();
    expect(expectancy(initialState, VALUES, 1000)).toBeNull();
  });

  it("computes expectancy from the current win rate and reward/risk", () => {
    const state = record(initialState, RESULTS.WIN);
    // 100% win rate, compounding: expectancy == reward of the next trade
    // (2% of 1080 = 21.6 risk, 8% reward = 86.4)
    expect(expectancy(state, VALUES, 1000)).toBeCloseTo(86.4, 10);
  });
});
