import React from 'react'
import { VStack,Progress,HStack,Badge,Text } from '@chakra-ui/react'
export default function CustomBar({low,high,value}) {
  return (
    <>
    <VStack w={'full'} spacing={2} my={2}> 
        <Progress value={value} colorScheme='cyan' w={'full'} h="2px" borderRadius="full" bg="rgba(255, 255, 255, 0.05)" />
        <HStack justifyContent={'space-between'} w={'full'} >
          <Badge children={low} colorScheme='red' variant="subtle" px={2} py={0.5} borderRadius="md" />
          <Text fontSize={'xs'} fontWeight="semibold" color="gray.500">24H Range</Text>
          <Badge children={high} colorScheme='green' variant="subtle" px={2} py={0.5} borderRadius="md" />
        </HStack>
    </VStack>
    </>
  )
}
