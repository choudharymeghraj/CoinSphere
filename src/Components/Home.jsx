import React from "react"
import { Box, Image, Text, Heading, VStack, HStack, Button, Container, Stack, useColorModeValue } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import btc from '../Assets/btc.png'

const MotionBox = motion(Box);

export default function Home() {
  const heroTextColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Container maxW="container.xl" minH="calc(100vh - 120px)" display="flex" alignItems="center" py={10}>
      <Stack direction={['column', 'row']} spacing={10} align="center" justify="space-between" w="full">
        {/* Left column: Texts & CTAs */}
        <VStack align={['center', 'flex-start']} spacing={6} maxW="xl" textAlign={['center', 'left']}>
          <Box
            bgGradient="linear(to-r, brand.500, accent.purple)"
            bgClip="text"
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Real-time Market Insights
          </Box>
          <Heading 
            fontSize={['4xl', '6xl']} 
            fontWeight="800" 
            lineHeight="shorter"
            bgGradient="linear(to-r, brand.500, accent.purple, accent.magenta)"
            bgClip="text"
          >
            Track Crypto Like A Pro
          </Heading>
          <Text fontSize="lg" color={heroTextColor} maxW="lg">
            CoinSphere is a premium tracking platform. View real-time coin values, inspect comprehensive exchange reliability data, and analyze historical price charts.
          </Text>
          <HStack spacing={4}>
            <Link to="/Coins">
              <Button size="lg" bg="brand.500" color="black" px={8} shadow="0 4px 14px 0 rgba(0, 229, 255, 0.4)" _hover={{ bg: 'brand.600' }}>
                Explore Coins
              </Button>
            </Link>
            <Link to="/Exchanges">
              <Button size="lg" variant="outline" colorScheme="purple" border="2px solid" px={8}>
                Top Exchanges
              </Button>
            </Link>
          </HStack>
        </VStack>

        {/* Right column: Floating Bitcoin image */}
        <MotionBox
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          maxW={['xs', 'md']}
          flex={1}
          display="flex"
          justifyContent="center"
        >
          <Image 
            src={btc} 
            maxW="85%" 
            objectFit="contain" 
            filter="drop-shadow(0px 20px 40px rgba(0, 229, 255, 0.35))" 
          />
        </MotionBox>
      </Stack>
    </Container>
  )
}
