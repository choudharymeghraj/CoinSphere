import React from 'react';
import { useColorMode, useColorModeValue, IconButton } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';

const ColorModeSwitcher = props => {
  const { toggleColorMode } = useColorMode();
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);
  const switcherBg = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.08)');
  const switcherBorder = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');

  return (
    <IconButton
      size="md"
      fontSize="18"
      variant="ghost"
      color="current"
      pos={'fixed'}
      top={4}
      right={4}
      zIndex={'overlay'}
      bg={switcherBg}
      backdropFilter="blur(8px)"
      border="1px solid"
      borderColor={switcherBorder}
      borderRadius="xl"
      _hover={{
        bg: useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.15)'),
        transform: 'scale(1.05)',
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      onClick={toggleColorMode}
      icon={<SwitchIcon />}
      {...props}
    />
  );
};


export default ColorModeSwitcher;