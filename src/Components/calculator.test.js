import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import Calculator from "./calculator";

function renderCalculator() {
  return render(
    <ChakraProvider>
      <Calculator />
    </ChakraProvider>
  );
}

async function fillValidInputs() {
  userEvent.type(screen.getByPlaceholderText(/enter your balance/i), "1000");
  userEvent.type(screen.getByPlaceholderText(/enter your risk/i), "2");
  userEvent.type(screen.getByPlaceholderText(/enter your take profit/i), "8");
  userEvent.type(screen.getByPlaceholderText(/enter your stop loss/i), "2");
  userEvent.type(screen.getByPlaceholderText(/enter your leverage/i), "10");
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

describe("Calculator", () => {
  it("shows dashes and disables trading until inputs are valid", () => {
    renderCalculator();
    expect(screen.getByRole("button", { name: /^win/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^lose/i })).toBeDisabled();
    expect(screen.getAllByDisplayValue("—").length).toBeGreaterThan(0);
  });

  it("computes the correct single-trade readout", async () => {
    renderCalculator();
    await fillValidInputs();

    expect(screen.getByDisplayValue("100")).toBeInTheDocument(); // margin
    expect(screen.getByDisplayValue("1 : 4")).toBeInTheDocument(); // R:R
    expect(screen.getByDisplayValue("20%")).toBeInTheDocument(); // break-even WR
    expect(screen.getByRole("button", { name: /^win/i })).toBeEnabled();
  });

  it("records a compounding win and updates the equity curve", async () => {
    renderCalculator();
    await fillValidInputs();

    userEvent.click(screen.getByRole("button", { name: /^win/i }));

    expect(await screen.findByText("+80")).toBeInTheDocument();
    expect(screen.getByText("1,080")).toBeInTheDocument();
  });

  it("undraws the last trade", async () => {
    renderCalculator();
    await fillValidInputs();
    userEvent.click(screen.getByRole("button", { name: /^win/i }));
    expect(await screen.findByText("+80")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /^back/i }));
    expect(screen.queryByText("+80")).not.toBeInTheDocument();
  });

  it("keeps history when inputs are reset, until history is cleared", async () => {
    renderCalculator();
    await fillValidInputs();
    userEvent.click(screen.getByRole("button", { name: /^win/i }));
    expect(await screen.findByText("+80")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /^reset/i }));
    expect(screen.getByText("+80")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /clear history/i }));
    expect(screen.queryByText("+80")).not.toBeInTheDocument();
  });

  it("restores a saved session after remount", async () => {
    const { unmount } = renderCalculator();
    await fillValidInputs();
    userEvent.click(screen.getByRole("button", { name: /^win/i }));
    expect(await screen.findByText("+80")).toBeInTheDocument();
    unmount();

    renderCalculator();
    expect(await screen.findByText("+80")).toBeInTheDocument();
  });
});
