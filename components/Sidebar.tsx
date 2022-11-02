import { Autocomplete,  Button, TextField, Typography, } from "@mui/material";
import { useState } from "react";
import { useUserContext } from "./userContext";

export const Sidebar: React.FC = () => {

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { user, login, createUser, logout } = useUserContext();
  const [logorreg, setLogorreg] = useState<string>();

  const top100Films = () => [
    { label: 'Bitcoin' },
    { label: 'Ethereum' },
    { label: 'Tether' },
    { label: 'BNB' }
  ];

  const div = (
    <div>
      <br />
      <Button variant="outlined" onClick={() => setLogorreg('Log')}>
        Přihlášení
      </Button>
      <Button variant="outlined" onClick={() => setLogorreg('Reg')}>
        Registrace
      </Button>
    </div>
  );
  if (!user) {
    if (logorreg === 'Log') {
      return (
        <div>
          <div>
            Login
            <br />
            <TextField
              name="email"
              label="Email"
              variant="outlined"
              type="text"
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              name="password"
              label="Heslo"
              variant="outlined"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            {user ? (
              user.user.email
            ) : (
              <Button
                variant="outlined"
                onClick={() => login?.(email, password)}
              >
                Prihlas{' '}
              </Button>
            )}
          </div>
        </div>
      );
    }
    if (logorreg === 'Reg') {
      return (
        <div>
          <div>
            Registrace
            <br />
            <TextField
              name="email"
              label="Email"
              variant="outlined"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              name="password"
              label="Heslo"
              variant="outlined"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            {user ? (
              user.user.email
            ) : (
              <Button
                variant="outlined"
                onClick={() => createUser?.(email, password)}
              >
                Zaregistruj
              </Button>
            )}
          </div>
          <br />
        </div>
      );
    }
  }
  if (user) {
    return (
      <div>
        <Typography variant="body1">
          Přihlášen uživatel<br /> {user.user.email}
        </Typography>
        <div>
          {user && (
            <Button variant="outlined" onClick={() => logout?.()}>
              Odhlaš uživatele
            </Button>
          )}
          {() => setLogorreg('')}
        </div>
        <br /><br />
        <Typography variant="h5">Přidání kryptoměny</Typography>
        <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={top100Films()}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Test" />}
    />

        <TextField
          name="pocet"
          label="Počet měny"
          variant="outlined"
          type="number"
        />

        <br />

        <Button
          id="btn"
          variant="contained"
          type="submit"
        >Potvrdit</Button>
      </div>
    );
  }
  return div;
}
