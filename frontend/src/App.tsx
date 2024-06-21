import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import './index.css';
import './FileUpload';
import FileUpload from './FileUpload';
import UserFiles from './UserFiles';

function App() {
  return (
    <Container disableGutters maxWidth={false}>
      <AppBar position="static">
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
  );
}

export default App;
