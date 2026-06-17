import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Box, Container, Image, Grid, Heading, Text, VStack, Badge, useColorModeValue } from '@chakra-ui/react';
import Loader from './Loader';
import Error from './Error';

export default function Exchanges() {
  const [arr, setArr] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cardBg = useColorModeValue('white', 'rgba(18, 24, 38, 0.45)');
  const cardBorder = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.06)');
  const hoverBorder = useColorModeValue('brand.500', 'brand.500');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const getD = (async () => {
      try {
        const { data } = await axios.get('https://api.coingecko.com/api/v3/exchanges?per_page=20')
        setArr(data);
        setLoading(false);
      } 
      catch (error) {
        if (error.response && error.response.status === 429) {
          setError('CoinGecko API Rate Limit Exceeded. Please wait a moment and refresh.');
        } else {
          setError('Error While Fetching Exchanges');
        }
        setLoading(false);
      }
    })

    getD();
  }, [])

  if (error) return <Error Title="Fetch Failure" Message={error} />

  return (
    <Container maxW={'container.xl'} py={10}>
      {loading ? (
        <Loader Message={'Fetching Top Exchanges'} />
      ) : (
        <>
          <VStack spacing={2} align="center" mb={12} textAlign="center">
            <Heading
              fontSize={['3xl', '5xl']}
              fontWeight="800"
              bgGradient="linear(to-r, brand.500, accent.purple)"
              bgClip="text"
            >
              Global Cryptocurrency Exchanges
            </Heading>
            <Text fontSize="md" color={subtextColor} maxW="xl">
              Discover top-rated cryptocurrency spot exchanges ranked by their trust score, trade volumes, and reliability.
            </Text>
          </VStack>

          <Grid
            templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)']}
            gap={6}
          >
            {arr.map((i) => {
              return (
                <Box
                  as="a"
                  href={i.url}
                  target="_blank"
                  key={i.id}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  role="group"
                  _hover={{
                    transform: 'translateY(-6px)',
                  }}
                >
                  <VStack
                    bg={cardBg}
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor={cardBorder}
                    _groupHover={{
                      borderColor: hoverBorder,
                      boxShadow: '0 8px 30px rgba(0, 229, 255, 0.15)',
                    }}
                    p={8}
                    borderRadius={'2xl'}
                    h="full"
                    spacing={4}
                    align="center"
                    justify="center"
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      w="full"
                      h="2px"
                      bgGradient="linear(to-r, brand.500, accent.purple)"
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.3s ease"
                    />

                    <Image src={i.image} w={16} h={16} alt='Exchange' borderRadius="full" />
                    
                    <VStack spacing={1}>
                      <Badge colorScheme="cyan" variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="xs">
                        Rank #{i.trust_score_rank}
                      </Badge>
                      <Heading noOfLines={1} size="sm" fontSize="lg" pt={2} textAlign={'center'}>
                        {i.name}
                      </Heading>
                    </VStack>
                  </VStack>
                </Box>
              )
            })}
          </Grid>
        </>
      )}
    </Container>
  )
}
