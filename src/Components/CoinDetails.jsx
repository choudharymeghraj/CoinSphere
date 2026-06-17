import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Box, Stack, VStack, HStack, Image, Text, Heading, Button, Badge, useColorModeValue, Alert, AlertIcon, AlertTitle, AlertDescription, Textarea } from '@chakra-ui/react';
import CustomBar from './CustomBar';
import Error from './Error';
import Loader from './Loader';
import Item from './Item';
import Chart from './Chart';

const GEMINI_MODELS_FALLBACK = [
  "gemini-3.1-pro-preview",
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-pro-latest",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest"
];

const fetchAIAnalysisWithFallback = async (compiledPrompt, apiKey) => {
  let lastError = null;

  for (const model of GEMINI_MODELS_FALLBACK) {
    try {
      console.log(`Attempting evaluation with model: ${model}...`);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: compiledPrompt }] }]
        },
        { timeout: 8000 } // 8 second timeout per model to skip hanging models quickly
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          text: response.data.candidates[0].content.parts[0].text,
          modelUsed: model
        };
      }
    } catch (error) {
      console.warn(`Model ${model} failed or rate-limited. Shifting to next fallback...`);
      lastError = error;
    }
  }
  throw new Error(`All Gemini models exhausted. Last error: ${lastError?.message}`);
};

export default function CoinDetails() {
  const [coin, setCoin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("inr");
  const [error, setError] = useState("");
  const [arrow, setArrow] = useState('increase');

  const [days, setDays] = useState("24h")
  const [chartarr, setChartarr] = useState([])

  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "";
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [aiError, setAiError] = useState('');

  const SUGGESTED_CHIPS = [
    "Evaluate current trajectory risk relative to its 30-day average.",
    "What is the statistical probability of a breakout based on the 24h vs 1y range?",
    "Summarize market health metrics concisely."
  ];

  const [query, setQuery] = useState("");
  const [modelUsed, setModelUsed] = useState(null);


  const handleAiAnalysis = async () => {
    if (!GEMINI_API_KEY) {
      setAiError("Please configure a Gemini API key first.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiReport(null);
    setModelUsed(null);

    try {
      const now = Date.now();
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      const thirtyDayPrices = chartarr
        .filter(item => item[0] >= thirtyDaysAgo)
        .map(item => item[1]);

      let thirtyDayHigh = 'NA';
      let thirtyDayLow = 'NA';
      let currentVsThirtyDayAvg = 'NA';

      if (thirtyDayPrices.length > 0) {
        const high = Math.max(...thirtyDayPrices);
        const low = Math.min(...thirtyDayPrices);
        const avg = thirtyDayPrices.reduce((sum, val) => sum + val, 0) / thirtyDayPrices.length;
        thirtyDayHigh = high.toLocaleString();
        thirtyDayLow = low.toLocaleString();
        if (currentVal && avg) {
          currentVsThirtyDayAvg = (((currentVal - avg) / avg) * 100).toFixed(2);
        }
      } else if (chartarr.length > 0) {
        const allPrices = chartarr.map(item => item[1]);
        const high = Math.max(...allPrices);
        const low = Math.min(...allPrices);
        const avg = allPrices.reduce((sum, val) => sum + val, 0) / allPrices.length;
        thirtyDayHigh = high.toLocaleString();
        thirtyDayLow = low.toLocaleString();
        if (currentVal && avg) {
          currentVsThirtyDayAvg = (((currentVal - avg) / avg) * 100).toFixed(2);
        }
      }

      const ath = coin.market_data.ath[currency];
      const athDelta = ath && currentVal ? (((currentVal - ath) / ath) * 100).toFixed(2) : 'NA';
      const rank = coin.market_cap_rank;

      const compactCryptoData = `
Asset ID: ${coin.id}
Current Price: ${currencySymbol}${currentVal ? currentVal.toLocaleString() : 'NA'}
24h Delta: ${coin.market_data.price_change_percentage_24h ? coin.market_data.price_change_percentage_24h.toFixed(2) : 'NA'}%
30d Trend Position: [High: ${thirtyDayHigh}, Low: ${thirtyDayLow}, Current vs Avg: ${currentVsThirtyDayAvg}%]
1y Macro Corridor: [All-Time High Delta: ${athDelta}%, Market Cap Rank: #${rank}]
`;

      const systemPrompt = `You are an expert crypto analyst running inside a lightweight interface. I have attached the data of the cryptocurrency along. Your task is to provide a concise, crisp recommendation using relative terms and probability analysis based on the attached historical boundaries. Do not provide absolute directional certainties or direct financial advice. Keep your response under 120 words total.`;

      const selectedChipOrManualText = query || SUGGESTED_CHIPS[0];
      const fullPromptToSend = `${systemPrompt}\n\nUser Query: "${selectedChipOrManualText}"\n\nContext Data:\n${compactCryptoData}`;

      const result = await fetchAIAnalysisWithFallback(fullPromptToSend, GEMINI_API_KEY);
      setAiReport(result.text);
      setModelUsed(result.modelUsed);
    } catch (err) {
      console.error(err);
      setAiError(err.message || "An error occurred while communicating with Gemini API.");
    } finally {
      setAiLoading(false);
    }
  };

  const parseVerdict = (text) => {
    if (!text) return null;
    if (text.includes("BUY_BULLISH")) return "BUY_BULLISH";
    if (text.includes("HOLD_NEUTRAL")) return "HOLD_NEUTRAL";
    if (text.includes("BEARISH_RISK")) return "BEARISH_RISK";
    return null;
  };

  const renderFormattedReport = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    let elements = [];
    lines.forEach((line, idx) => {
      if (line.includes("Disclaimer:")) {
        elements.push(
          <Box key={idx} mt={6} p={4} bg="rgba(255, 255, 255, 0.02)" borderLeft="4px solid" borderColor="red.400" borderRadius="md">
            <Text fontSize="2xs" color="gray.500" fontStyle="italic">
              {line}
            </Text>
          </Box>
        );
        return;
      }
      if (line.startsWith('#### 📊 Performance Summary')) {
        elements.push(
          <Heading key={idx} size="xs" fontSize="sm" mt={4} mb={2} color="brand.500" letterSpacing="wider" textTransform="uppercase">
            📊 Performance Summary
          </Heading>
        );
      } else if (line.startsWith('#### 🔍 Historical Context & Health')) {
        elements.push(
          <Heading key={idx} size="xs" fontSize="sm" mt={4} mb={2} color="accent.purple" letterSpacing="wider" textTransform="uppercase">
            🔍 Historical Context & Health
          </Heading>
        );
      } else if (line.startsWith('#### 🎯 Investment Verdict')) {
        elements.push(
          <Heading key={idx} size="xs" fontSize="sm" mt={4} mb={2} color="accent.gold" letterSpacing="wider" textTransform="uppercase">
            🎯 Investment Verdict
          </Heading>
        );
      } else if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        const cleaned = line.replace(/^[\s*-]+/, '');
        const boldMatch = cleaned.match(/^\*\*(.*?)\*\*(.*)/);
        if (boldMatch) {
          elements.push(
            <HStack key={idx} align="flex-start" py={1} spacing={2}>
              <Text color="brand.500" fontSize="sm">•</Text>
              <Text fontSize="sm">
                <Text as="span" fontWeight="bold" color="gray.300">{boldMatch[1]}</Text> {boldMatch[2]}
              </Text>
            </HStack>
          );
        } else {
          elements.push(
            <HStack key={idx} align="flex-start" py={1} spacing={2}>
              <Text color="brand.500" fontSize="sm">•</Text>
              <Text fontSize="sm">{cleaned}</Text>
            </HStack>
          );
        }
      } else if (line.trim() !== '') {
        if (line.includes('BUY_BULLISH') || line.includes('HOLD_NEUTRAL') || line.includes('BEARISH_RISK')) {
          const verdictStr = parseVerdict(line);
          const cleanedText = line.replace(/`?\[?BUY_BULLISH\]?`?/, '').replace(/`?\[?HOLD_NEUTRAL\]?`?/, '').replace(/`?\[?BEARISH_RISK\]?`?/, '').replace(/^[\s*:-]+/, '');
          let alertColor = "cyan";
          let alertTitle = "Neutral";
          let rgbVal = "236, 201, 75";
          if (verdictStr === 'BUY_BULLISH') {
            alertColor = "green";
            alertTitle = "BUY / BULLISH";
            rgbVal = "72, 187, 120";
          } else if (verdictStr === 'BEARISH_RISK') {
            alertColor = "red";
            alertTitle = "BEARISH / RISK";
            rgbVal = "245, 101, 101";
          } else if (verdictStr === 'HOLD_NEUTRAL') {
            alertColor = "yellow";
            alertTitle = "HOLD / NEUTRAL";
            rgbVal = "236, 201, 75";
          }
          elements.push(
            <Box key={idx} mt={3} p={4} borderRadius="xl" bg={`rgba(${rgbVal}, 0.1)`} border="1px solid" borderColor={`${alertColor}.400`}>
              <HStack mb={2}>
                <Badge colorScheme={alertColor} variant="solid" px={2.5} py={0.5} borderRadius="md" fontSize="2xs">
                  {alertTitle}
                </Badge>
              </HStack>
              <Text fontSize="sm" fontWeight="medium">
                {cleanedText}
              </Text>
            </Box>
          );
        } else {
          elements.push(
            <Text key={idx} fontSize="sm" color="gray.300" lineHeight="tall" my={2}>
              {line}
            </Text>
          );
        }
      }
    });
    return <VStack align="stretch" spacing={1}>{elements}</VStack>;
  };

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
        if (error.response && error.response.status === 429) {
          setError('CoinGecko API Rate Limit Exceeded. Please wait a moment and refresh.');
        } else {
          setError(`Error While Fetching ${params.id}`);
        }
        setLoading(false);
      }
    }
    getCoinData();
  }, [params.id, currency, days])

  if (error) return <Error Title="Fetch Failure" Message={error} />

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

          {/* CoinSphere AI Advisor Card */}
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

            <HStack justifyContent="space-between" mb={3}>
              <Heading size="md">
                CoinSphere AI Advisor
              </Heading>
              <Badge colorScheme="purple" variant="outline" fontSize="2xs">
                Gemini AI
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500" mb={4}>
              Objective quantitative trend evaluation powered by Google Gemini.
            </Text>

            <VStack align="stretch" spacing={4}>
              {/* Prompt Suggestion Chips */}
              <VStack align="stretch" spacing={2}>
                <HStack justifyContent="space-between" align="center">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.400">
                    Select a prompt suggestion or type your own:
                  </Text>
                  {query && (
                    <Button
                      size="2xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setQuery("")}
                      _hover={{ bg: "rgba(245, 101, 101, 0.15)" }}
                    >
                      Clear
                    </Button>
                  )}
                </HStack>
                <HStack flexWrap="wrap" gap={2} spacing={0}>
                  {SUGGESTED_CHIPS.map((chipText, i) => {
                    const isSelected = query === chipText;
                    return (
                      <Button
                        key={i}
                        size="xs"
                        variant={isSelected ? "solid" : "outline"}
                        colorScheme={isSelected ? "purple" : "gray"}
                        borderRadius="full"
                        whiteSpace="normal"
                        textAlign="left"
                        height="auto"
                        py={2}
                        px={3}
                        fontSize="2xs"
                        onClick={() => setQuery(chipText)}
                        borderWidth="1px"
                        borderColor={isSelected ? "purple.400" : "rgba(255, 255, 255, 0.16)"}
                        _hover={{
                          bg: isSelected ? "purple.600" : "rgba(255, 255, 255, 0.08)"
                        }}
                      >
                        {chipText}
                      </Button>
                    );
                  })}
                </HStack>
              </VStack>

              {/* Query Box */}
              <Box>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask CoinSphere AI about this asset..."
                  size="sm"
                  borderRadius="xl"
                  bg="rgba(0, 0, 0, 0.2)"
                  borderColor="rgba(255, 255, 255, 0.16)"
                  _hover={{ borderColor: "purple.400" }}
                  _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px purple.400" }}
                  fontSize="xs"
                  rows={2}
                  resize="none"
                />
              </Box>

              {/* Action Button */}
              <Button
                size="md"
                w="full"
                bgGradient="linear(to-r, brand.500, accent.purple)"
                color="white"
                fontWeight="bold"
                isLoading={aiLoading}
                loadingText="Analyzing with Gemini Fallback..."
                _hover={{
                  bgGradient: 'linear(to-r, brand.600, accent.purple)',
                  transform: 'translateY(-1px)',
                }}
                onClick={handleAiAnalysis}
              >
                Analyze with Gemini
              </Button>

              {/* Error State */}
              {aiError && (
                <Alert status="error" borderRadius="xl" py={2} px={3}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="xs">Analysis Error</AlertTitle>
                    <AlertDescription fontSize="2xs">{aiError}</AlertDescription>
                  </Box>
                </Alert>
              )}

              {/* Formatted Report Presentation */}
              {aiReport && (
                <VStack align="stretch" spacing={4} mt={2}>
                  {modelUsed && (
                    <HStack justifyContent="space-between">
                      <Text fontSize="2xs" color="gray.500">
                        Response Model:
                      </Text>
                      <Badge colorScheme="cyan" variant="subtle" fontSize="3xs" px={2} py={0.5} borderRadius="full">
                        {modelUsed}
                      </Badge>
                    </HStack>
                  )}
                  <Box
                    bg="rgba(0, 0, 0, 0.15)"
                    p={4}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={cardBorder}
                    maxH="450px"
                    overflowY="auto"
                  >
                    {renderFormattedReport(aiReport)}
                  </Box>
                </VStack>
              )}
            </VStack>
          </Box>
        </VStack>
      </Stack>
    </Container>
  )
}


