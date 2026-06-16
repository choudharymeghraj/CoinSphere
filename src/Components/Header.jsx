import React from 'react'
import { HStack, Box, Text, useColorModeValue } from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import { FaCoins } from 'react-icons/fa'

export default function Header() {
  const location = useLocation();
  const navBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(9, 12, 19, 0.85)');
  const navBorder = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.05)');
  const activeColor = useColorModeValue('brand.600', 'brand.500');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Coins', path: '/Coins' },
    { name: 'Exchanges', path: '/Exchanges' }
  ];

  return (
    <Box
      position="sticky"
      top={0}
      zIndex="docked"
      bg={navBg}
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor={navBorder}
      px={8}
      py={4}
    >
      <HStack maxW="container.xl" mx="auto" justifyContent="space-between">
        {/* Brand Logo */}
        <Link to="/">
          <HStack spacing={2} cursor="pointer" transition="all 0.3s" _hover={{ transform: 'scale(1.02)' }}>
            <Box color={activeColor}>
              <FaCoins size={24} />
            </Box>
            <Text
              fontSize="2xl"
              fontWeight="800"
              letterSpacing="wider"
              bgGradient="linear(to-r, brand.500, accent.purple)"
              bgClip="text"
            >
              CoinSphere
            </Text>
          </HStack>
        </Link>

        {/* Navigation Links */}
        <HStack spacing={6}>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Box key={link.path} position="relative" py={1}>
                <Link to={link.path}>
                  <Text
                    fontWeight="600"
                    fontSize="sm"
                    color={isActive ? activeColor : inactiveColor}
                    _hover={{ color: activeColor }}
                    transition="color 0.2s ease"
                  >
                    {link.name}
                  </Text>
                </Link>
                {isActive && (
                  <Box
                    position="absolute"
                    bottom="-2px"
                    left={0}
                    right={0}
                    height="2px"
                    bgGradient="linear(to-r, brand.500, accent.purple)"
                    borderRadius="full"
                  />
                )}
              </Box>
            );
          })}
        </HStack>
      </HStack>
    </Box>
  )
}
