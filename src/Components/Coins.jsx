import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { Box, HStack, VStack, Image, Heading, Text, Container, Grid, Button, Badge, useColorModeValue } from '@chakra-ui/react'
import Loader from './Loader';
import Error from './Error'
import { Link } from 'react-router-dom'

export default function Coins() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("inr");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const btns = new Array(132).fill(1);

  const cardBg = useColorModeValue('white', 'rgba(18, 24, 38, 0.45)');
  const cardBorder = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.06)');
  const hoverBorder = useColorModeValue('brand.500', 'brand.500');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const paginationBg = useColorModeValue('gray.100', 'rgba(255, 255, 255, 0.05)');
  const paginationColor = useColorModeValue('gray.700', 'gray.300');
  const paginationHoverBg = useColorModeValue('gray.200', 'rgba(255, 255, 255, 0.1)');
  const currencyControlBg = useColorModeValue('gray.100', 'rgba(255, 255, 255, 0.05)');
  const currencyHoverBg = useColorModeValue('gray.200', 'rgba(255, 255, 255, 0.08)');
  const currencyInactiveColor = useColorModeValue('gray.600', 'gray.300');

  let currencySymbol = "₹"
  if (currency === 'inr') {
    currencySymbol = "₹"
  } else if (currency === 'usd') {
    currencySymbol = "$"
  } else {
    currencySymbol = "€"
  }

  useEffect(() => {
    const getC = async () => {
      try {
        const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&page=${currentPage}`)
        setCoins(data);
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 429) {
          setError('CoinGecko API Rate Limit Exceeded. Please wait a moment and refresh.');
        } else {
          setError('Error While Fetching Coins');
        }
        setLoading(false);
      }
    }
    getC();
  }, [currency, currentPage])

  if (error) return <Error Title="Fetch Failure" Message={error} />

  const currencies = [
    { label: 'INR (₹)', value: 'inr' },
    { label: 'USD ($)', value: 'usd' },
    { label: 'EUR (€)', value: 'eur' }
  ];

  return (
    <Container maxW={'container.xl'} py={10}>
      {loading ? (
        <Loader Message={'Fetching Coins'} />
      ) : (
        <Box>
          {/* Header */}
          <VStack spacing={2} align="center" mb={10} textAlign="center">
            <Heading
              fontSize={['3xl', '5xl']}
              fontWeight="800"
              bgGradient="linear(to-r, brand.500, accent.purple)"
              bgClip="text"
            >
              Cryptocurrency Markets
            </Heading>
            <Text fontSize="md" color={subtextColor} maxW="xl">
              Track live crypto prices, market cap, and daily performance in your preferred currency.
            </Text>
          </VStack>

          {/* Segmented Control for Currency */}
          <HStack justifyContent="center" mb={8}>
            <HStack bg={currencyControlBg} p={1.5} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
              {currencies.map((curr) => {
                const isActive = currency === curr.value;
                return (
                  <Button
                    key={curr.value}
                    onClick={() => setCurrency(curr.value)}
                    size="sm"
                    variant={isActive ? 'solid' : 'ghost'}
                    bg={isActive ? 'brand.500' : 'transparent'}
                    color={isActive ? 'black' : currencyInactiveColor}
                    _hover={{
                      bg: isActive ? 'brand.600' : currencyHoverBg,
                    }}
                    borderRadius="lg"
                    px={4}
                  >
                    {curr.label}
                  </Button>
                );
              })}
            </HStack>
          </HStack>

          {/* Coins Grid */}
          <Grid
            templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)']}
            gap={6}
            mb={12}
          >
            {coins.map((i) => {
              const priceChange24h = i.price_change_percentage_24h;
              const isPositive = priceChange24h >= 0;

              return (
                <Box
                  as={Link}
                  to={`/Coins/${i.id}`}
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
                    p={6}
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

                    <Image h={16} w={16} src={i.image} alt={i.name} />

                    <VStack spacing={1}>
                      <Badge colorScheme="purple" variant="outline" px={2} py={0.5} borderRadius="md" fontSize="2xs" textTransform="uppercase">
                        {i.symbol}
                      </Badge>
                      <Heading noOfLines={1} size="sm" fontSize="lg" pt={1} textAlign={'center'}>
                        {i.name}
                      </Heading>
                    </VStack>

                    <VStack spacing={0}>
                      <Text fontSize="lg" fontWeight="bold">
                        {i.current_price ? `${currencySymbol} ${i.current_price.toLocaleString()}` : 'NA'}
                      </Text>
                      {typeof priceChange24h === 'number' && (
                        <Text fontSize="xs" fontWeight="semibold" color={isPositive ? 'green.400' : 'red.400'}>
                          {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
                        </Text>
                      )}
                    </VStack>
                  </VStack>
                </Box>
              )
            })}
          </Grid>

          {/* Pagination */}
          <HStack w={'full'} overflowX={'auto'} gap={2} py={4} justifyContent="center">
            {btns.map((item, index) => {
              const pageNum = index + 1;
              const isCurrent = currentPage === pageNum;
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  bg={isCurrent ? 'brand.500' : paginationBg}
                  color={isCurrent ? 'black' : paginationColor}
                  border="1px solid"
                  borderColor={isCurrent ? 'brand.500' : cardBorder}
                  _hover={{
                    bg: isCurrent ? 'brand.600' : paginationHoverBg,
                  }}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    setLoading(true);
                  }}
                  borderRadius="lg"
                  minW={10}
                >
                  {pageNum}
                </Button>
              )
            })}
          </HStack>
        </Box>
      )}
    </Container>
  )
}
