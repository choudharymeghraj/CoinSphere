import React from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

export default function Error({Message}) {
  return (
   <>
  <Alert status='error'>
  <AlertIcon />
  <AlertTitle>Your browser is outdated!</AlertTitle>
  <AlertDescription>{Message}</AlertDescription>
</Alert>
   </>
  )
}
