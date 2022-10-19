import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { UserContextProvider } from '../components/userContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


function MyApp({ Component, pageProps }: AppProps) {
  return <ThemeProvider theme={darkTheme}><CssBaseline/><UserContextProvider><Component {...pageProps} /></UserContextProvider></ThemeProvider>
}

export default MyApp
