import { Box, Table, Thead, Tbody, Tr, Th, Td, TableCaption } from "@chakra-ui/react";
import { formatNumber } from "../lib/format";
import { RESULTS } from "../lib/simulation";
import { WIN_TEXT, LOSE_TEXT } from "../lib/colors";

function Show({ table }) {
  return (
    <Box overflowX="auto">
      <Table mt={10} minW="320px">
        <TableCaption>Trade history</TableCaption>
        <Thead>
          <Tr>
            <Th textAlign="center" fontSize={16}>
              Number
            </Th>
            <Th textAlign="center" fontSize={16}>
              Result
            </Th>
            <Th textAlign="center" fontSize={16}>
              Profit USDT
            </Th>
            <Th textAlign="center" fontSize={16}>
              Balance
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {table.map((trade) => {
            const won = trade.result === RESULTS.WIN;
            const color = won ? WIN_TEXT : LOSE_TEXT;
            return (
              <Tr key={trade.tradeNumber}>
                <Td textAlign="center" fontSize={16}>
                  {trade.tradeNumber + 1}
                </Td>
                <Td textAlign="center" fontSize={16} style={{ color }}>
                  {trade.result}
                </Td>
                <Td textAlign="center" fontSize={16} style={{ color }}>
                  {typeof trade.pnl === "number"
                    ? `${won ? "+" : "-"}${formatNumber(Math.abs(trade.pnl))}`
                    : "—"}
                </Td>
                <Td textAlign="center" fontSize={16}>
                  {formatNumber(trade.balance)}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}

export default Show;
