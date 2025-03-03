import React from "react";
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import DiscordLogin from "./DiscordLogin";

const TopBar: React.FC = () => {
    return (
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h2" component="div">
              Go To Hell
            </Typography>
            <DiscordLogin></DiscordLogin>
          </Toolbar>
        </AppBar>
      );
}

export default TopBar;