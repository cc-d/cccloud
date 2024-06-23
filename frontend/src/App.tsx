import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';

import './index.css';
import './FileUpload';
import FileUpload from './FileUpload';
import UserFiles from './UserFiles';
import { ThemeProvider, css
  , createTheme, styled } from '@mui/material/styles';

import blueGrey from '@mui/material/colors/blueGrey';
import grey from '@mui/material/colors/grey';
import { CssBaseline } from '@mui/material';
import { Global } from '@emotion/react';
import {theme, globalStyles} from './theme';
function App() {

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <Global styles={globalStyles} />
    <Container disableGutters maxWidth={false} sx={{backgroundColor: `${theme.palette.background.default}`}}>
      <AppBar position="static" sx={{backgroundColor: `${theme.palette.primary.main}`}}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
          }}
        >
          <Typography variant="h6">cccloud</Typography>
        </Toolbar>
      </AppBar>
      <FileUpload />
    </Container>
    </ThemeProvider>
  );
}

export default App;
