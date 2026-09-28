import Navbar from "./Components/navbar";
import { ChakraProvider } from "@chakra-ui/react";
import Calculator from "./Components/calculator";
import theme from "./Components/theme";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Navbar />
      <Calculator />
    </ChakraProvider>
  );
}

export default App;
