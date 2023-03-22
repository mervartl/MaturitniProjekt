import { Grid, Link, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Sidebar } from '../components/Sidebar'
import styles from '../styles/Home.module.css'
import { InputCrypto } from '../components/InputCrypto';
import { LogReg } from '../components/LogReg';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Crypto Portfolio</title>
        <meta name="Crypto Portfolio"/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <Grid container columns={12} spacing={2} >
          <Grid item md={3} lg={2.5} xs={12} textAlign="center" marginTop="1.5%" paddingRight="3%"><LogReg /></Grid>
          <Grid item md={9} lg={9.5} xs={12} textAlign="center" marginTop="1%">
            <Typography variant="h3" textAlign="center" paddingBottom="2.5%">
              CRYPTOLIUM
            </Typography>
          </Grid>
          <Grid container columns={12} spacing={2} minHeight="90.7vh">
            <Grid container columns={12} spacing={2}>
              <Grid item md={3} lg={2.5} xs={12} textAlign="center" marginTop="2vh" ><Sidebar /></Grid>
              <Grid item md={9} lg={9.5} xs={12} textAlign="center" padding="0%" marginTop="2vh" className={styles.bod}><InputCrypto /></Grid>
            </Grid>
          </Grid>
          <Grid container columns={12} spacing={2}>
            <Grid item xs={12} textAlign="center">
              <Typography variant="body2" color="text.secondary" align="center">
                <Link color="inherit" href="https://delta-skola.cz/">
                  Lukáš Mervart
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default Home
