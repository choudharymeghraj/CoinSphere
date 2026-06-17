import React from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

export default function Error({Title = "Error Occurred", Message}) {
  return (
   <>
  <Alert status='error' borderRadius="xl" my={4}>
    <AlertIcon />
    <AlertTitle>{Title}</AlertTitle>
    <AlertDescription>{Message}</AlertDescription>
  </Alert>
   </>
  )
}
