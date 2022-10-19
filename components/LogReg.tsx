import { Button, TextField, Typography, } from "@mui/material";
import { useState } from "react";
import { useUserContext } from "./userContext";

export const LogReg:React.FC = () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { user, login, createUser, logout } = useUserContext();
    const [logorreg, setLogorreg] = useState<string>();


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
            <Typography variant="caption">
              Přihlášen uživatel {user.user.email}
            </Typography>
            <div>
              {user && (
                <Button variant="outlined" onClick={() => logout?.()}>
                  Odhlaš uživatele
                </Button>
              )}
              {() => setLogorreg('')}
            </div>
          </div>
        );
      }
      return div;
}
