import { Grid, Typography } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { LogReg } from '../components/LogReg'
import styles from '../styles/Home.module.css'
import { InputCrypto } from '../components/InputCrypto';


const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
      </ThemeProvider>
      <Head>
        <title>Crypto Portfolio</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>

        <Grid container columns={12} spacing={2}>
          <Grid item xs={2.5} textAlign="center" backgroundColor="#282828"></Grid>
          <Grid item xs={9.5} backgroundColor="#282828">
            <Typography variant="h3" component="h1" gutterBottom textAlign="center">
              Crypto portfolium
            </Typography>
          </Grid>
          <Grid container columns={12} spacing={2}>
            <Grid container columns={12} spacing={2}>
              <Grid item xs={2.5} textAlign="center" marginTop="2%" backgroundColor="#282828"><LogReg /></Grid>
              <Grid item xs={9.5} textAlign="center" padding="100% 0%" marginTop="2%" backgroundColor="#202020"><InputCrypto/></Grid>
            </Grid>
          </Grid>
          <Grid container columns={12} spacing={2} backgroundColor="#282828">
            <Grid item xs={12} textAlign="center" bottom="0" width="100%">
              Footer
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default Home
