import { Button, TextField, Typography, } from "@mui/material";
import { useState } from "react";

export const LogReg:React.FC = () => {

    const [logorreg, setLogorreg] = useState<string>();
    const user = "";

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
                />
                <TextField
                  name="password"
                  label="Heslo"
                  variant="outlined"
                  type="password"
                />
                <br />
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
                />
                <TextField
                  name="password"
                  label="Heslo"
                  variant="outlined"
                  type="password"
                />
                <br />
               
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
              Přihlášen uživatel {user/*.user.email*/}
            </Typography>
            <div>
              {user && (
                <Button variant="outlined">
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
