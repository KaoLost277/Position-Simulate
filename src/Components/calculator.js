import { useEffect, useMemo, useReducer, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  InputRightElement,
  Switch,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon, RepeatClockIcon } from "@chakra-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator } from "@fortawesome/free-solid-svg-icons";
import Show from "./tableShow";
import {
  MODES,
  countLosses,
  countWins,
  currentBalance,
  deriveTrade,
  expectancy,
  initialState,
  reducer,
  sizingBalance,
  toNumber,
  validateInputs,
  winRate,
} from "../lib/simulation";
import { formatNumber, formatPercent } from "../lib/format";

const STORAGE_KEY = "position-simulate:v1";

const EMPTY_INPUTS = {
  balance: "",
  risk: "",
  takeProfit: "",
  stopLoss: "",
  leverage: "",
};

function loadSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function initSimulation(session) {
  const saved = session && session.simulation;
  if (!saved) return initialState;
  return {
    mode: saved.mode === MODES.FIXED ? MODES.FIXED : MODES.COMPOUND,
    startingBalance:
      typeof saved.startingBalance === "number" ? saved.startingBalance : 0,
    history: Array.isArray(saved.history) ? saved.history : [],
  };
}

function initInputs(session) {
  return session && session.inputs ? { ...EMPTY_INPUTS, ...session.inputs } : EMPTY_INPUTS;
}

function Calculator() {
  const session = useMemo(loadSession, []);
  const [state, dispatch] = useReducer(reducer, session, initSimulation);
  const [inputs, setInputs] = useState(() => initInputs(session));

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ inputs, simulation: state })
      );
    } catch {
      /* storage unavailable — the app still works in-memory */
    }
  }, [inputs, state]);

  const { valid, values } = validateInputs(inputs);
  const sizingBase = sizingBalance(state);
  const trade = values ? deriveTrade(values, sizingBase) : null;
  const wins = countWins(state.history);
  const losses = countLosses(state.history);
  const rate = winRate(state.history);
  const expected = expectancy(state, values);
  const balanceTotal = currentBalance(state);

  const fontColor = useColorModeValue("#2c3e50", "white");
  const cardBg = useColorModeValue("white", "#171923");
  const addonBg = useColorModeValue("twitter.500", "twitter.800");
  const winBorder = useColorModeValue("#48BB78", "#276749");
  const loseBorder = useColorModeValue("#F56565", "#9B2C2C");
  const backBorder = useColorModeValue("#ECC94B", "#975A16");
  const icon = <FontAwesomeIcon icon={faCalculator} />;

  const setField = (field) => (event) => {
    const value = event.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    if (field === "balance") {
      const parsed = toNumber(value);
      if (parsed !== null) dispatch({ type: "setStartingBalance", value: parsed });
    }
  };

  const resetInputs = () => setInputs(EMPTY_INPUTS);

  const valuesOrDash = (value) => (value === null ? "—" : formatNumber(value));

  return (
    <div>
      <h1 id="Home">.</h1>
      <Container id="Home" maxW="container.xl">
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={6}
          mt="100px"
          align="stretch"
        >
          <Box
            className="Setting Calculator"
            color={fontColor}
            borderRadius="7px"
            border="solid 1px"
            borderColor={fontColor}
            flex="1"
            minW="0"
            p={4}
            bg={cardBg}
          >
            <Heading fontSize="33px" textAlign="center" fontWeight="bold" pt={4}>
              {icon} Setting Calculator
            </Heading>

            <InputGroup mt={8} size="lg">
              <InputLeftAddon w="110px" justifyContent="center" bg={addonBg}>
                MY BALANCE
              </InputLeftAddon>
              <Input
                type="number"
                textAlign="center"
                placeholder="Enter your balance"
                value={inputs.balance}
                onChange={setField("balance")}
              />
              <InputRightAddon w="70px" justifyContent="center" bg={addonBg}>
                USDT
              </InputRightAddon>
            </InputGroup>

            <InputGroup mt={6} size="lg">
              <InputLeftAddon w="110px" justifyContent="center" bg={addonBg}>
                RISK PER TRADE
              </InputLeftAddon>
              <Input
                type="number"
                textAlign="center"
                placeholder="Enter your risk"
                value={inputs.risk}
                onChange={setField("risk")}
              />
              <InputRightAddon w="70px" justifyContent="center" bg={addonBg}>
                %
              </InputRightAddon>
            </InputGroup>

            <InputGroup mt={6} size="lg">
              <InputLeftAddon w="110px" justifyContent="center" bg={addonBg}>
                TAKE PROFIT
              </InputLeftAddon>
              <Input
                type="number"
                textAlign="center"
                placeholder="Enter your take profit"
                value={inputs.takeProfit}
                onChange={setField("takeProfit")}
              />
              <InputRightAddon w="70px" justifyContent="center" bg={addonBg}>
                %
              </InputRightAddon>
            </InputGroup>

            <InputGroup mt={6} size="lg">
              <InputLeftAddon w="110px" justifyContent="center" bg={addonBg}>
                STOP LOSS
              </InputLeftAddon>
              <Input
                type="number"
                textAlign="center"
                placeholder="Enter your stop loss"
                value={inputs.stopLoss}
                onChange={setField("stopLoss")}
              />
              <InputRightAddon w="70px" justifyContent="center" bg={addonBg}>
                %
              </InputRightAddon>
            </InputGroup>

            <InputGroup mt={6} size="lg">
              <InputLeftAddon w="110px" justifyContent="center" bg={addonBg}>
                LEVERAGE
              </InputLeftAddon>
              <Input
                type="number"
                textAlign="center"
                placeholder="Enter your leverage"
                value={inputs.leverage}
                onChange={setField("leverage")}
              />
              <InputRightAddon w="70px" justifyContent="center" bg={addonBg}>
                X
              </InputRightAddon>
            </InputGroup>

            <FormControl display="flex" alignItems="center" mt={6}>
              <FormLabel htmlFor="compound-mode" mb="0">
                Compound (size from current balance)
              </FormLabel>
              <Switch
                id="compound-mode"
                isChecked={state.mode === MODES.COMPOUND}
                onChange={(event) =>
                  dispatch({
                    type: "setMode",
                    mode: event.target.checked ? MODES.COMPOUND : MODES.FIXED,
                  })
                }
              />
            </FormControl>
          </Box>

          <Box
            className="output"
            color={fontColor}
            borderRadius="7px"
            border="solid 1px"
            borderColor={fontColor}
            flex="1"
            minW="0"
            p={4}
            bg={cardBg}
          >
            <Heading fontSize="33px" textAlign="center" fontWeight="bold" pt={4}>
              {icon} Out Put
            </Heading>

            <OutputRow label="Position Size" value={valuesOrDash(trade && trade.notional)} unit="USDT" />
            <OutputRow label="Margin" value={valuesOrDash(trade && trade.margin)} unit="USDT" />
            <OutputRow
              label="You Risk"
              value={valuesOrDash(trade && trade.risk)}
              unit="USDT"
            />
            <OutputRow
              label="You Win"
              value={valuesOrDash(trade && trade.reward)}
              unit="USDT"
            />
            <OutputRow
              label="RR"
              value={trade ? `1 : ${formatNumber(trade.rewardToRisk)}` : "—"}
            />
            <OutputRow
              label="Break-even WR"
              value={trade ? formatPercent(trade.breakEvenWinRate, 1) : "—"}
            />

            <HStack mt={6} spacing={4}>
              <OutputRow label="Win" value={wins} flex="1" />
              <OutputRow label="Lose" value={losses} flex="1" />
              <OutputRow
                label="Wr"
                value={rate === null ? "—" : formatPercent(rate, 1)}
                flex="1"
              />
            </HStack>

            <OutputRow
              label="Expectancy"
              value={valuesOrDash(expected)}
              unit="USDT"
            />
            <OutputRow
              label="Balance Total"
              value={formatNumber(balanceTotal)}
              unit="USDT"
            />

            <Stack
              direction={{ base: "column", sm: "row" }}
              spacing={3}
              mt={6}
              justify="space-between"
            >
              <Button
                flex="1"
                border="2px"
                borderColor={winBorder}
                leftIcon={<ArrowUpIcon />}
                isDisabled={!valid}
                onClick={() =>
                  dispatch({ type: "record", result: "win", values })
                }
              >
                Win
              </Button>
              <Button
                flex="1"
                border="2px"
                borderColor={loseBorder}
                leftIcon={<ArrowDownIcon />}
                isDisabled={!valid}
                onClick={() =>
                  dispatch({ type: "record", result: "lose", values })
                }
              >
                Lose
              </Button>
              <Button
                flex="1"
                border="2px"
                borderColor={backBorder}
                leftIcon={<RepeatClockIcon />}
                isDisabled={!state.history.length}
                onClick={() => dispatch({ type: "undo" })}
              >
                Back
              </Button>
            </Stack>

            <HStack mt={3} spacing={3}>
              <Button flex="1" variant="outline" onClick={resetInputs}>
                Reset
              </Button>
              <Button
                flex="1"
                variant="outline"
                isDisabled={!state.history.length}
                onClick={() => dispatch({ type: "clearHistory" })}
              >
                Clear history
              </Button>
            </HStack>
          </Box>
        </Flex>

        <Show table={state.history} />
      </Container>
    </div>
  );
}

function OutputRow({ label, value, unit, flex }) {
  return (
    <InputGroup mt={6} size="lg" flex={flex} minW="0">
      <InputLeftAddon justifyContent="center" bg={useColorModeValue("#9F7AEA", "#44337A")}>
        {label}
      </InputLeftAddon>
      <Input textAlign="center" value={value} readOnly />
      {unit ? <InputRightElement mr="8px">{unit}</InputRightElement> : null}
    </InputGroup>
  );
}

export default Calculator;
