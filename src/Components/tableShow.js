import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,Box,useMediaQuery,Container
  } from '@chakra-ui/react'
function Show({ table }) {
  const [phoneScreen] = useMediaQuery('(min-width: 770px)')
    return (
        <>
         
       <Table    mt={10} >
       <TableCaption >Table Source</TableCaption>
            <Tr>
              <Th textAlign='center'  fontSize={16}>Number</Th>
              <Th textAlign='center' fontSize={16}>Result</Th>
              <Th textAlign='center' fontSize={16}>Profit USDT</Th>
              
            </Tr>
            {table.map((table,) => {


              return (

                <Tr >

                  <Td textAlign='center' fontSize={16} className="taberstyle">{table.tradenumber + 1}</Td>
                  <Td textAlign='center' fontSize={16} style={{ color: table.result == 'win' ? '#26de81' : '#ff231f' }}>{table.result}</Td>
                  <Td textAlign='center' fontSize={16} style={{ color: table.result == 'win' ? '#26de81' : '#ff231f' }}>{table.profit}</Td>
                  
                </Tr>
              );
            })}

          </Table>
        </>
    )
}
export default Show;