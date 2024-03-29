import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Avatar } from '@mui/material';
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

export default function SignUp() {

    //Získání routeru a userContextu pro operaci s Firebase
    const router = useRouter();
    const { user, createUser } = useUserContext();

    //useStates pro zpracování a nastavení emailu a hesla a ověření hesla ve formuláři a error zprávy
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordVer, setPasswordVer] = useState<string>("");

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    //Funkce pro odeslání formuláře a registraci uživatele
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleRegister();
    };

    //Funkce pro zpracování registrace
    const handleRegister = async () => {
      // Kontrola, zda se hesla shodují
      if(password === passwordVer)
      {
        const response = await createUser?.(email, password);
        if (response?.error) {
          setErrorMessage(response.error);
        } else {
          setErrorMessage(null);
        }
      }
      else
      {
        setErrorMessage("Hesla se neschodují.");
      }
    };

    //Pokud je uživatel už přihlášen, přesměruje na hlavní stranu
    useEffect(() => {
        if (user) {
            router.push("/cryptolium");
        }
    });

    //Pokud se hodnota uživatele nějak změní, uživatel je přesměrován na hlavní stranu 
    useEffect(() => {
        if (user?.user.email) {
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
              Sign up
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 3 }}
            >
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorMessage}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="E-mail"
                    name="email"
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Heslo"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="passwordVer"
                    label="Zadej heslo znovu"
                    type="password"
                    id="passwordVer"
                    autoComplete="new-password"
                    onChange={(e) => setPasswordVer(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="/singin" variant="body2">
                    Už máš účet? Přihlaš se
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
}