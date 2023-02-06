import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import SingIn from '../components/SingIn'
import { Container } from '@mui/material'

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Cryptolium - Login</title>
                <meta name="description" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.bod}>
                <Container sx={{ height: "100vh", paddingTop: "5vh" }}>
                    <SingIn />
                </Container>
            </div>
        </div>
    )
}

export default Home
