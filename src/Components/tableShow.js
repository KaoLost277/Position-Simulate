import { Box, Table, Thead, Tbody, Tr, Th, Td, TableCaption } from "@chakra-ui/react";
import { formatNumber } from "../lib/format";

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
          {table.map((trade) => (
            <Tr key={trade.tradeNumber}>
              <Td textAlign="center" fontSize={16}>
                {trade.tradeNumber + 1}
              </Td>
              <Td
                textAlign="center"
                fontSize={16}
                style={{ color: trade.result === "win" ? "#26de81" : "#ff231f" }}
              >
                {trade.result}
              </Td>
              <Td
                textAlign="center"
                fontSize={16}
                style={{ color: trade.result === "win" ? "#26de81" : "#ff231f" }}
              >
                {trade.result === "win" ? "+" : "-"}
                {formatNumber(Math.abs(trade.pnl))}
              </Td>
              <Td textAlign="center" fontSize={16}>
                {formatNumber(trade.balance)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

export default Show;
