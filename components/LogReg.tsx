import { Button, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, TextField, } from "@mui/material";
import { useState } from "react";

export const LogReg:React.FC = () => {
    const div = <div>
        <Button variant='contained'>Login</Button>
        <Button variant='contained'>Register</Button><br/><br/>
        <TextField name="username" label="Username" ></TextField><br/><br/>
        <TextField name="password" label="Password" type="password"></TextField><br/><br/>
        
    </div>

    return div;
}
