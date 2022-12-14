import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { UserContextProvider } from '../components/userContext';
import { InputCrypto } from '../components/InputCrypto';
import { useState } from 'react';
import { DetailComponent } from '../components/DetailComponent';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
  

function MyApp({ Component }: AppProps) {
  const [quer, setQuer] = useState("");


  return <ThemeProvider theme={darkTheme}><CssBaseline/>
  <UserContextProvider><Component/></UserContextProvider>
  <InputCrypto onQuer={setQuer}/>
  <DetailComponent quer={quer}/>
  </ThemeProvider>
}

export default MyApp
