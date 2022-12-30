import { Button, Typography } from "@mui/material";
import { useState } from "react";

export const DetailComponent : React.FC = ({name, setDtail}) => {


    return(       
        <div>
            <Button onClick={() => setDtail(false)}>Zpet na seznam</Button>
            {name}
        </div>
    )
}

