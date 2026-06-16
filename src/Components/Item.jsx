import { HStack, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

export default function Item({Title,Value}) {
  const borderColor = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.05)');
  const titleColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <>
    <HStack w={'full'} justifyContent={'space-between'} py={3.5} borderBottom="1px solid" borderColor={borderColor}>
        <Text fontSize="sm" fontWeight="semibold" color={titleColor}>{Title}</Text>
        <Text fontSize="sm" fontWeight="bold">{Value || 'NA'}</Text>
    </HStack>
    </>
  )
}
