import { Button, Typography } from "@mui/material";
import { useUserContext } from "./userContext";
import { useRouter } from "next/router";

export const Logout: React.FC = () => {
  //Získání userContexta a routeru
  const { user, logout } = useUserContext();
  const router = useRouter();

  //Funkce pro odhlášení a přesměrování
  const back = () => {
    logout?.();
    router.push("/singin");
  }

  if (user) {
    return (<div>
      <Typography variant="body1" margin="0 0 0.5rem 0">
        {user.user.email}
      </Typography>
      <div>
        {user && (
          <Button variant="outlined" onClick={() => back()}>
            Odhlásit
          </Button>
        )}
      </div>
    </div>
    )
  }
  else return null;
}


