import React from 'react'

import { VStack,Box,Spinner } from '@chakra-ui/react'
export default function Loader({Message}) {
  return (
   <>
   
  <VStack h={'90vh'} justifyContent={'center'}>
    <Box transform={'scale(3)'}>
    <Spinner size={"xl"} />
    </Box>

  </VStack>
   </>

  )
}
