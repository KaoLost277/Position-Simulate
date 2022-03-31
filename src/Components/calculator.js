import { Box, Input, Container, HStack, InputGroup, InputLeftAddon, InputRightAddon, useColorModeValue, Heading, VStack, Stack, InputRightElement, Button, useMediaQuery, Flex } from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon, RepeatClockIcon } from '@chakra-ui/icons';
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import Show from './tableShow'

var balance1
var risk1
var stoploss1
var leverage1
var takeprofit1
var countwin1
function Calculator() {

    const [balance, setBalnace] = useState();
    const [risk, setRisk] = useState();
    const [stoploss, setStoploss] = useState();
    const [leverage, setLeverage] = useState();
    const [takeprofit, setTakeprofit] = useState();
    const [countwin, setCoutwin] = useState(0);
    const [countlose, setCoutlose] = useState(0);
    const tradenumber = countwin + countlose;
    const Chance = 100 / risk + countwin - countlose;
    const positonsize = (balance * risk) / stoploss / leverage;
    const rrprostop = Math.round(stoploss / takeprofit);
    const rrtake = Math.round(takeprofit / stoploss);
    const winrate = (countwin / tradenumber) * 100;
    const resultwin = ((positonsize * takeprofit) / 100) * leverage;
    const resultlose = ((positonsize * stoploss) / 100) * leverage;
    const balncetotal = +balance + resultwin * countwin - resultlose * countlose;
    const [table, setTable] = useState([]);
    const bgmod = useColorModeValue('twitter.500', 'twitter.800')
    const fontcolormod = useColorModeValue('#2c3e50', 'White')
    const bgfrom = useColorModeValue('White', '#171923')
    const iconcalculator = <FontAwesomeIcon icon={faCalculator} />
    const undo = () => {
        const last = table.pop();
        if (last.result == "win") setCoutwin((w) => w - 1);
        else setCoutlose((l) => l - 1);
        setTable((t) => [...table]);
    };

    const [phoneScreen] = useMediaQuery('(min-width: 770px)')

    return (
        <div >
            <h1 id='Home'>.</h1>
            <Container id='Home' maxW='container.xl'  >
                <HStack flexDirection={phoneScreen ? "row" : "column"} mt='100px' justifyContent='space-between'>
                    <Box className="Setting Calculator" justifyItems='center' color={fontcolormod} borderRadius='7px' border='solid 1px' borderColor={fontcolormod}
                        maxW={{ base: '500px', sm: '500px', md: "768px" }} w='100%' h='490px' mb={phoneScreen ? "0px" : "30px"} pl='2%' pr='2%' bg={bgfrom}>
                        <Heading fontSize='33px' textAlign='center' fontWeight={'bold'} pt='22px' >{iconcalculator} Setting Calculator</Heading>
                        <InputGroup mt={8} size={phoneScreen ? "lg" : "sm"}>
                            <InputLeftAddon w='105px' justifyContent='center' bg={bgmod} fontSize='100%' >MY BALANCE</InputLeftAddon>
                            <Input
                                type='number'
                                textAlign='center'
                                placeholder="Enter your balance "
                                value={balance}
                                onChange={(event) => {
                                    setBalnace(event.target.value);
                                }}
                            ></Input>
                            <InputRightAddon w='63px' justifyContent='center' bg={bgmod} fontSize='100%'>USDT</InputRightAddon>
                        </InputGroup >
                        <InputGroup mt={6} size={phoneScreen ? "lg" : "sm"}>
                            <InputLeftAddon w='105px' justifyContent='center' bg={bgmod} fontSize='100%'>RISK OF RUIN</InputLeftAddon>
                            <Input
                                type='number'
                                textAlign='center'
                                placeholder="Enter your risk "
                                value={risk}
                                onChange={(event) => {
                                    setRisk(event.target.value);
                                }}
                            ></Input>
                            <InputRightAddon w='63px' justifyContent='center' bg={bgmod} fontSize='100%'>%</InputRightAddon>
                        </InputGroup>
                        <InputGroup mt={6} size={phoneScreen ? "lg" : "sm"}>
                            <InputLeftAddon w='105px' justifyContent='center' bg={bgmod} fontSize='100%' >TAKE PROFIT</InputLeftAddon>
                            <Input
                                type='number'
                                textAlign='center'
                                placeholder="Enter your Take profit "
                                value={takeprofit}
                                onChange={(event) => {
                                    setTakeprofit(event.target.value);
                                }}
                            ></Input>
                            <InputRightAddon w='63px' justifyContent='center' bg={bgmod} fontSize='100%' >%</InputRightAddon>
                        </InputGroup>
                        <InputGroup mt={6} size={phoneScreen ? "lg" : "sm"}>
                            <InputLeftAddon w='105px' justifyContent='center' bg={bgmod} fontSize='100%' >STOP LOSS</InputLeftAddon>
                            <Input
                                type='number'
                                textAlign='center'
                                placeholder="Enter your Stop loss "
                                value={stoploss}
                                onChange={(event) => {
                                    setStoploss(event.target.value);
                                }}
                            ></Input>
                            <InputRightAddon w='63px' justifyContent='center' bg={bgmod} fontSize='100%'>%</InputRightAddon>
                        </InputGroup>
                        <InputGroup size={phoneScreen ? "lg" : "sm"} mt={6} >
                            <InputLeftAddon justifyContent='center' bg={bgmod} w="105px">LEVERAGE</InputLeftAddon>
                            <Input
                                type='number'
                                textAlign='center'
                                placeholder="Enter your Stop loss "
                                value={leverage}
                                onChange={(event) => {
                                    setLeverage(event.target.value);
                                }}
                            ></Input>
                            <InputRightAddon w='63px' justifyContent='center' bg={bgmod} fontSize='100%'>X</InputRightAddon>
                        </InputGroup>

                    </Box>
                    <Box />
                    <Box className='output' justifyItems='center' color={fontcolormod} borderRadius='7px' border='solid 1px' borderColor={fontcolormod}
                        w='100%' maxW={{ base: "768px", sm: '', md: "735px" }} mt='50
                    px' h='490px' pl='2%' pr='2%' bg={bgfrom}>
                        <Heading fontSize='33px' textAlign='center' fontWeight={'bold'} pt='22px' >{iconcalculator}Out Put</Heading>
                        <HStack mt={8}>
                        <InputGroup fontSize='100%' size={phoneScreen ? "lg" : "sm"}  >
                            <InputLeftAddon bg={useColorModeValue('#9F7AEA', '#44337A')} >Position Size</InputLeftAddon>
                            <Input textAlign='center' value={new Intl.NumberFormat().format(~~positonsize)} readonly="readonly" />
                            <InputRightElement mr='8px'>USDT</InputRightElement>
                        </InputGroup >
                        <InputGroup fontSize='100%' size={phoneScreen ? "lg" : "sm"} w='200px'  >
                            <InputLeftAddon bg={useColorModeValue('#9F7AEA', '#44337A')} >RR</InputLeftAddon>
                            <Input textAlign='center' value={`${rrtake}:${rrprostop}`} readonly="readonly" />
                        </InputGroup >
                        </HStack>
                        <HStack mt={6} >
                            <InputGroup size={phoneScreen ? "lg" : "sm"}  >
                                <InputLeftAddon justifyContent='center' bg={useColorModeValue('#00B5D8', '#065666')}>You Can Lose </InputLeftAddon>
                                <Input textAlign='center' value={(Chance || 0).toFixed(0)} readonly="readonly" />

                            </InputGroup >
                            <InputGroup size={phoneScreen ? "lg" : "sm"} mt={8} >
                                <InputLeftAddon justifyContent='center' bg={useColorModeValue('#00B5D8', '#065666')}>Tradnumber</InputLeftAddon>
                                <Input textAlign='center' value={tradenumber} readonly="readonly" />
                            </InputGroup>
                        </HStack>
                        <HStack mt={6}>
                            <InputGroup size={phoneScreen ? "lg" : "sm"} w='300px'  >
                                <InputLeftAddon  justifyContent='center' bg={useColorModeValue('#48BB78', '#276749')}>Win</InputLeftAddon>
                                <Input textAlign='center' value={countwin} readonly="readonly" />
                            </InputGroup>
                            <InputGroup  size={phoneScreen ? "lg" : "sm"} mt={8} w='300px' >
                                <InputLeftAddon justifyContent='center' bg={useColorModeValue('#F56565', '#9B2C2C')}>Lose</InputLeftAddon>
                                <Input textAlign='center' value={countlose} readonly="readonly" />
                            </InputGroup>
                            <InputGroup size={phoneScreen ? "lg" : "sm"} mt={8} >
                                <InputLeftAddon justifyContent='center' bg={useColorModeValue('#4299E1', '#2C5282')}>Wr</InputLeftAddon>
                                <Input textAlign='center' value={(winrate || 0).toFixed(0)} readonly="readonly" />
                                <InputRightElement>%</InputRightElement>
                            </InputGroup>

                        </HStack>
                        <InputGroup size={phoneScreen ? "lg" : "sm"} mt={8}>
                            <InputLeftAddon bg={useColorModeValue('#ED8936', '#C05621')}>Balance Total</InputLeftAddon>
                            <Input textAlign='center' value={new Intl.NumberFormat().format(balncetotal || balance || 0)} readonly="readonly" />
                            <InputRightElement mr='8px'>USDT</InputRightElement>
                        </InputGroup>
                        <HStack mt='23px' justifyContent={'space-between'} >
                            <Button w='lg' size='lg' border='2px' borderColor={useColorModeValue('#48BB78', '#276749')} leftIcon={<ArrowUpIcon />}
                                onClick={() => {
                                    setCoutwin(countwin + 1);
                                    setTable((t) => [
                                        ...t,
                                        {
                                            tradenumber,
                                            result: "win",
                                            profit: "+" + new Intl.NumberFormat().format(resultwin),
                                            balncetotal,
                                        },
                                    ]);
                                }}>Win</Button>
                            <Button w='lg' size='lg' border='2px' borderColor={useColorModeValue('#F56565', '#9B2C2C')} leftIcon={<ArrowDownIcon />}
                                onClick={() => {
                                    setCoutlose(countlose + 1);
                                    setTable((t) => [
                                        ...t,
                                        {
                                            tradenumber,
                                            result: "lose",
                                            profit: "-" + new Intl.NumberFormat().format(resultlose),
                                            balncetotal,
                                        },
                                    ]);
                                }}>Lose</Button>
                            <Button w='lg' size='lg' border='2px' borderColor={useColorModeValue('#ECC94B', '#975A16')} leftIcon={<RepeatClockIcon />} onClick={undo}>Back</Button>
                        </HStack>

                    </Box>
                </HStack>
                <Show table={table}></Show>
            </Container>
        </div>
    )
} export default Calculator;