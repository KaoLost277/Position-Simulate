import Navbar from "./Components/navbar";
import { ChakraProvider } from "@chakra-ui/react";
import Calculator from "./Components/calculator";
function App({Component,pageProps}) {
  return (
    <ChakraProvider>
        <Navbar {...pageProps}/>
        <Calculator/>
      </ChakraProvider>
   
  );
}

export default App;
