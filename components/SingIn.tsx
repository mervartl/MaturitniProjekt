import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useUserContext } from './userContext';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Alert from '@mui/material/Alert';

//Vytvoření tmavého tématu
const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default function SignIn() {

    //Získání routeru a userContextu pro operaci s Firebase
    const router = useRouter();
    const { user, login } = useUserContext();

    //useStates pro zpracování a nastavení emailu a hesla ve formuláři a error zprávy
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    //Funkce pro odeslání formuláře a přihlášení uživatele
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await handleLogin();
    };

    //Funkce pro zpracování přihlášení
    const handleLogin = async () => {
        const response = await login?.(email, password);
        if (response?.error) {
          setErrorMessage(response.error);
        } else {
          setErrorMessage(null);
        }
    };

    //Pokud je uživatel už přihlášen, přesměruje na hlavní stranu
    useEffect(() => {
        if (user?.user.uid) {
            router.push("/cryptolium");
        }
    },[]);

    //Pokud se hodnota uživatele nějak změní, uživatel je přesměrován na hlavní stranu 
    useEffect(() => {
        if (user?.user.uid) {
            router.push("/cryptolium");
        }
    }, [user]);

    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h3" marginBottom="2vh">
              CRYPTOLIUM
            </Typography>
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorMessage}
                </Alert>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="/" variant="body2">
                    {"Ještě nemáš účet? Zaregistruj se."}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
}