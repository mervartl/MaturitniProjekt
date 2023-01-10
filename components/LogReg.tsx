import { Button, Typography } from "@mui/material";
import { useState } from "react";
import { useUserContext } from "./userContext";

export const LogReg: React.FC = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { user, login, createUser, logout } = useUserContext();
    const [logorreg, setLogorreg] = useState<string>();

if(user)
{
    return(<div>
        <Typography variant="body1" margin="0 0 0.5rem 0">
            {user.user.email}
        </Typography>
        <div>
          {user && (
            <Button variant="outlined" onClick={() => logout?.()}>
              Odhlásit
            </Button>
          )}
          {() => setLogorreg("")}
        </div>
    </div>
    )
}
else return null;

    
}


