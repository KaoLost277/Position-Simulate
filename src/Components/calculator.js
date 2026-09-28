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
  Stack,
  Switch,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon, RepeatClockIcon } from "@chakra-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator } from "@fortawesome/free-solid-svg-icons";
import TradeHistory from "./TradeHistory";
import {
  MODES,
  RESULTS,
  countLosses,
  countWins,
  currentBalance,
  deriveTrade,
  expectancy,
  hydrateSimulation,
  parseStartingBalance,
  reducer,
  replay,
  sizingBalance,
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

// Rebuild a trusted simulation state from whatever is in storage.
function initSimulation(session) {
  return hydrateSimulation(session && session.simulation);
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
  const startBalance = parseStartingBalance(inputs.balance);

  const trade = values ? deriveTrade(values, sizingBalance(state, values.balance)) : null;
  const rows =
    startBalance === null
      ? state.history.map((row) => ({ ...row, pnl: null, balance: null }))
      : replay(state.history, startBalance, state.mode);
  const wins = countWins(state.history);
  const losses = countLosses(state.history);
  const rate = winRate(state.history);
  const expected = values ? expectancy(state, values, values.balance) : null;

  const fontColor = useColorModeValue("#2c3e50", "white");
  const cardBg = useColorModeValue("white", "#171923");
  const addonBg = useColorModeValue("twitter.500", "twitter.800");
  const outAddonBg = useColorModeValue("#9F7AEA", "#44337A");
  const winBorder = useColorModeValue("#48BB78", "#276749");
  const loseBorder = useColorModeValue("#F56565", "#9B2C2C");
  const backBorder = useColorModeValue("#ECC94B", "#975A16");
  const icon = <FontAwesomeIcon icon={faCalculator} />;

  const setField = (field) => (event) =>
    setInputs((prev) => ({ ...prev, [field]: event.target.value }));

  const resetInputs = () => setInputs(EMPTY_INPUTS);

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

            <NumberField
              label="BALANCE"
              placeholder="Enter your balance"
              unit="USDT"
              value={inputs.balance}
              onChange={setField("balance")}
              addonBg={addonBg}
            />
            <NumberField
              label="RISK %"
              placeholder="Enter your risk"
              unit="%"
              value={inputs.risk}
              onChange={setField("risk")}
              addonBg={addonBg}
            />
            <NumberField
              label="TAKE PROFIT"
              placeholder="Enter your take profit"
              unit="%"
              value={inputs.takeProfit}
              onChange={setField("takeProfit")}
              addonBg={addonBg}
            />
            <NumberField
              label="STOP LOSS"
              placeholder="Enter your stop loss"
              unit="%"
              value={inputs.stopLoss}
              onChange={setField("stopLoss")}
              addonBg={addonBg}
            />
            <NumberField
              label="LEVERAGE"
              placeholder="Enter your leverage"
              unit="X"
              value={inputs.leverage}
              onChange={setField("leverage")}
              addonBg={addonBg}
            />

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

            <OutputRow label="Position Size" value={formatNumber(trade && trade.notional)} unit="USDT" addonBg={outAddonBg} />
            <OutputRow label="Margin" value={formatNumber(trade && trade.margin)} unit="USDT" addonBg={outAddonBg} />
            <OutputRow label="You Risk" value={formatNumber(trade && trade.risk)} unit="USDT" addonBg={outAddonBg} />
            <OutputRow label="You Win" value={formatNumber(trade && trade.reward)} unit="USDT" addonBg={outAddonBg} />
            <OutputRow
              label="RR"
              value={trade ? `1 : ${formatNumber(trade.rewardToRisk)}` : "—"}
              addonBg={outAddonBg}
            />
            <OutputRow
              label="Break-even WR"
              value={trade ? formatPercent(trade.breakEvenWinRate, 1) : "—"}
              addonBg={outAddonBg}
            />

            <OutputRow label="Win" value={wins} addonBg={outAddonBg} />
            <OutputRow label="Lose" value={losses} addonBg={outAddonBg} />
            <OutputRow
              label="Wr"
              value={rate === null ? "—" : formatPercent(rate, 1)}
              addonBg={outAddonBg}
            />

            <OutputRow label="Expectancy" value={formatNumber(expected)} unit="USDT" addonBg={outAddonBg} />
            <OutputRow
              label="Balance Total"
              value={startBalance === null ? "—" : formatNumber(currentBalance(state, startBalance))}
              unit="USDT"
              addonBg={outAddonBg}
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
                  dispatch({ type: "record", result: RESULTS.WIN, values })
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
                  dispatch({ type: "record", result: RESULTS.LOSE, values })
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
                Undo
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

        <TradeHistory table={rows} />
      </Container>
    </div>
  );
}

const ADDON_LABEL_WIDTH = { base: "92px", sm: "120px" };
const ADDON_UNIT_WIDTH = { base: "52px", sm: "64px" };
const ADDON_FONT = { base: "xs", sm: "sm" };

function AddonLabel({ children, bg }) {
  return (
    <InputLeftAddon
      w={ADDON_LABEL_WIDTH}
      justifyContent="center"
      bg={bg}
      fontSize={ADDON_FONT}
    >
      {children}
    </InputLeftAddon>
  );
}

function AddonUnit({ children, bg }) {
  return (
    <InputRightAddon
      w={ADDON_UNIT_WIDTH}
      justifyContent="center"
      bg={bg}
      fontSize={ADDON_FONT}
    >
      {children}
    </InputRightAddon>
  );
}

function NumberField({ label, placeholder, unit, value, onChange, addonBg }) {
  return (
    <InputGroup mt={6} size="lg">
      <AddonLabel bg={addonBg}>{label}</AddonLabel>
      <Input
        type="number"
        textAlign="center"
        minW="0"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <AddonUnit bg={addonBg}>{unit}</AddonUnit>
    </InputGroup>
  );
}

function OutputRow({ label, value, unit, addonBg }) {
  return (
    <InputGroup mt={6} size="lg" minW="0">
      <AddonLabel bg={addonBg}>{label}</AddonLabel>
      <Input textAlign="center" minW="0" value={value} readOnly />
      {unit ? <InputRightElement mr="8px">{unit}</InputRightElement> : null}
    </InputGroup>
  );
}

export default Calculator;
