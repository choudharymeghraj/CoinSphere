import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Box, Stack, VStack, HStack, Image, Text, Heading, Button, Badge, useColorModeValue } from '@chakra-ui/react';
import CustomBar from './CustomBar';
import Error from './Error';
import Loader from './Loader';
import Item from './Item';
import Chart from './Chart';

export default function CoinDetails() {
  const [coin, setCoin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("inr");
  const [error, setError] = useState(false);
  const [arrow, setArrow] = useState('increase');

  const [days, setDays] = useState("24h")
  const [chartarr, setChartarr] = useState([])

  const cardBg = useColorModeValue('white', 'rgba(18, 24, 38, 0.45)');
  const cardBorder = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.06)');
  const controlBg = useColorModeValue('gray.100', 'rgba(255, 255, 255, 0.05)');
  const controlColor = useColorModeValue('gray.600', 'gray.300');
  const controlHoverBg = useColorModeValue('gray.200', 'rgba(255, 255, 255, 0.08)');

  let currencySymbol = "₹"
  if (currency === 'inr') {
    currencySymbol = "₹"
  } else if (currency === 'usd') {
    currencySymbol = "$"
  } else {
    currencySymbol = "€"
  }

  const btns = ["24h", "7d", "14d", "30d", "60d", "200d", "1y", "max"];
  const currencies = [
    { label: 'INR (₹)', value: 'inr' },
    { label: 'USD ($)', value: 'usd' },
    { label: 'EUR (€)', value: 'eur' }
  ];

  const params = useParams();

  useEffect(() => {
    const getCoinData = async () => {
      try {
        const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/${params.id}`)
        const { data: chartData } = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${params.id}/market_chart?vs_currency=${currency}&days=${days}`
        );

        setChartarr(chartData.prices);
        setCoin(data);
        setLoading(false);

        const percent = data.market_data.price_change_percentage_24h;
        if (percent < 0) setArrow('decrease')
        else setArrow('increase')
      }
      catch (error) {
        setLoading(false);
        setError(true);
      }
    }
    getCoinData();
  }, [params.id, currency, days])

  if (error) return <Error Message={`Error While Fetching ${params.id}`} />

  if (loading) return <Loader Message={`Fetching ${params.id}...`} />

  const highVal = coin.market_data.high_24h[currency];
  const lowVal = coin.market_data.low_24h[currency];
  const currentVal = coin.market_data.current_price[currency];
  let rangePercent = 50;
  if (highVal && lowVal && highVal !== lowVal) {
    rangePercent = ((currentVal - lowVal) / (highVal - lowVal)) * 100;
  }

  return (
    <Container maxW={'container.xl'} py={10}>
      <Stack direction={['column', 'row']} spacing={8} align="flex-start">
        {/* Left Column: Chart and Timeframe Controls */}
        <VStack flex={2} w="full" spacing={6} align="stretch">
          {/* Chart Wrapper Card */}
          <Box
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="2xl"
            p={6}
            shadow="xl"
          >
            <HStack justifyContent="space-between" mb={6} flexWrap="wrap" gap={4}>
              <HStack spacing={3}>
                <Image src={coin.image.large} w={12} h={12} />
                <VStack align="flex-start" spacing={0}>
                  <HStack>
                    <Heading size="md">{coin.name}</Heading>
                    <Badge colorScheme="purple" variant="subtle" borderRadius="md" px={2}>
                      {coin.symbol.toUpperCase()}
                    </Badge>
                    <Badge colorScheme="cyan" variant="solid" borderRadius="md" px={2} fontSize="xs">
                      Rank #{coin.market_cap_rank}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Last Updated On {new Date(coin.last_updated).toLocaleString()}
                  </Text>
                </VStack>
              </HStack>

              {/* Currency Selector */}
              <HStack bg={controlBg} p={1} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
                {currencies.map((curr) => {
                  const isActive = currency === curr.value;
                  return (
                    <Button
                      key={curr.value}
                      onClick={() => setCurrency(curr.value)}
                      size="xs"
                      variant={isActive ? 'solid' : 'ghost'}
                      bg={isActive ? 'brand.500' : 'transparent'}
                      color={isActive ? 'black' : controlColor}
                      _hover={{
                        bg: isActive ? 'brand.600' : controlHoverBg,
                      }}
                      borderRadius="lg"
                      px={3}
                    >
                      {curr.label.split(' ')[0]}
                    </Button>
                  );
                })}
              </HStack>
            </HStack>

            <Box w="full" h="400px" display="flex" alignItems="center">
              <Chart arr={chartarr} days={days} currency={currencySymbol} />
            </Box>
          </Box>

          {/* Timeframe Selectors */}
          <HStack spacing={2} overflowX="auto" py={2} justifyContent={['flex-start', 'center']}>
            <HStack bg={controlBg} p={1.5} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
              {btns.map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={days === i ? 'solid' : 'ghost'}
                  bg={days === i ? 'brand.500' : 'transparent'}
                  color={days === i ? 'black' : controlColor}
                  onClick={() => {
                    setDays(i);
                    setLoading(true);
                  }}
                  borderRadius="lg"
                  px={4}
                >
                  {i}
                </Button>
              ))}
            </HStack>
          </HStack>
        </VStack>

        {/* Right Column: Detailed Statistics Card */}
        <VStack flex={1} w="full" spacing={6}>
          <Box
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="2xl"
            p={6}
            shadow="xl"
            w="full"
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
            />

            <Heading size="md" mb={4}>
              Market Statistics
            </Heading>

            <VStack spacing={4} align="stretch">
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                  Current Price
                </Text>
                <HStack align="baseline" spacing={2}>
                  <Text fontSize="3xl" fontWeight="800">
                    {currencySymbol}{currentVal ? currentVal.toLocaleString() : 'NA'}
                  </Text>
                  {typeof coin.market_data.price_change_percentage_24h === 'number' && (
                    <Badge
                      colorScheme={arrow === 'increase' ? 'green' : 'red'}
                      variant="subtle"
                      borderRadius="md"
                      px={2}
                      py={0.5}
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {arrow === 'increase' ? '+' : ''}
                      {coin.market_data.price_change_percentage_24h.toFixed(2)}%
                    </Badge>
                  )}
                </HStack>
              </VStack>

              <CustomBar
                high={`${currencySymbol}${highVal ? highVal.toLocaleString() : 'NA'}`}
                low={`${currencySymbol}${lowVal ? lowVal.toLocaleString() : 'NA'}`}
                value={rangePercent}
              />

              <Box pt={4}>
                <Item Title={"Max Supply"} Value={coin.market_data.max_supply ? coin.market_data.max_supply.toLocaleString() : 'Infinity'} />
                <Item Title={"Circulating Supply"} Value={coin.market_data.circulating_supply ? coin.market_data.circulating_supply.toLocaleString() : 'NA'} />
                <Item Title={"Market Capital"} Value={`${currencySymbol}${coin.market_data.market_cap[currency] ? coin.market_data.market_cap[currency].toLocaleString() : 'NA'}`} />
                <Item Title={"All Time Low"} Value={`${currencySymbol}${coin.market_data.atl[currency] ? coin.market_data.atl[currency].toLocaleString() : 'NA'}`} />
                <Item Title={"All Time High"} Value={`${currencySymbol}${coin.market_data.ath[currency] ? coin.market_data.ath[currency].toLocaleString() : 'NA'}`} />
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Stack>
    </Container>
  )
}


