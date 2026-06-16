import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    heading: "'Outfit', 'Poppins', sans-serif",
    body: "'Inter', 'Poppins', sans-serif",
  },
  colors: {
    brand: {
      50: '#e0f7fa',
      100: '#b2ebf2',
      200: '#80deea',
      300: '#4dd0e1',
      400: '#26c6da',
      500: '#00e5ff', // Neon Cyan/Teal
      600: '#00b8d4',
      700: '#00838f',
      800: '#006064',
      900: '#00363a',
    },
    accent: {
      purple: '#7c4dff', // Neon Purple
      magenta: '#d500f9', // Neon Magenta
      gold: '#ffd600', // Gold/Yellow
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#090c13' : '#f4f6fa',
        color: props.colorMode === 'dark' ? '#f0f2f5' : '#1a202c',
        backgroundImage: props.colorMode === 'dark' 
          ? 'radial-gradient(circle at 10% 20%, rgba(12, 16, 28, 1) 0%, rgba(9, 12, 19, 1) 90.1%)'
          : 'radial-gradient(circle at 10% 20%, rgba(244, 246, 250, 1) 0%, rgba(235, 239, 245, 1) 90.1%)',
        backgroundAttachment: 'fixed',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'xl',
        fontWeight: 'semibold',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          _hover: {
            bg: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
          },
        }),
        ghost: (props) => ({
          _hover: {
            bg: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
        }),
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'rgba(18, 24, 38, 0.55)' : 'white',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
          borderRadius: '2xl',
          shadow: 'xl',
        },
      }),
    },
  },
});

export default theme;
