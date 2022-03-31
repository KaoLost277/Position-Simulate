import { Box, Button, useColorMode, useColorModeValue, Flex, HStack } from '@chakra-ui/react'
import { SunIcon, MoonIcon,DeleteIcon,DownloadIcon } from '@chakra-ui/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
function Navbar() {
    const { colorMode, toggleColorMode } = useColorMode()
    const icon = <FontAwesomeIcon style={{color:'#fff200'}} icon={faCoins} />
    return (
        <>
            <Box position='fixed' top={0} w='100%' zIndex={1000} bg={useColorModeValue('gray.100','gray.900')} px={4}>
                <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                <a style={{fontWeight:'bold'}} href='#Home'>{icon} Position Simulate</a>
                <HStack >
                    <Button onClick={toggleColorMode}>
                        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                    </Button>
                    </HStack>
                </Flex>
            </Box>
        </>

    );
}
export default Navbar