import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import './index.css';

function App() {
  return (
    <Container disableGutters maxWidth={false} sx={{}}>
      <AppBar position="static">
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
          }}
        >
          <Typography variant="h6">cccloud</Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/upload">
            Upload
          </Button>
        </Toolbar>
      </AppBar>
      <Outlet />
    </Container>
  );
}

export default App;
