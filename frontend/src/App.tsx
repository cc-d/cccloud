import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';

function App() {
  return (
    <Container disableGutters={true} maxWidth="xl">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Home Page
          </Typography>
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
