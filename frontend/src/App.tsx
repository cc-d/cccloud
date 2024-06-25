// FILE: frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { Container, CssBaseline, ThemeProvider } from '@mui/material';
import './index.css';
import FileUpload from './FileUpload';
import { theme, globalStyles } from './theme';
import AppBar from './AppBar';
import { Global } from '@emotion/react';

function App() {
  const [cccId, setCccId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [rememberCccId, setRememberCccId] = useState<boolean | null>(null);
  const [rememberSecret, setRememberSecret] = useState<boolean | null>(null);

  const handleCccIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCccId(event.target.value);
  };

  const handleSecretChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSecret(event.target.value);
  };

  const handleRememberCccIdChange = () => {
    if (!cccId) {
      return;
    }
    if (rememberCccId) {
      localStorage.removeItem('cccid');
      setRememberCccId(false);
    } else {
      localStorage.setItem('cccid', cccId);
      setRememberCccId(true);
    }
  };

  const handleRememberSecretChange = () => {
    if (!secret) {
      return;
    }
    if (rememberSecret) {
      localStorage.removeItem('secret');
      setRememberSecret(false);
    } else {
      localStorage.setItem('secret', secret);
      setRememberSecret(true);
    }
  };

  useEffect(() => {
    if (rememberCccId === null) {
      const cccId = localStorage.getItem('cccid');
      setRememberCccId(cccId !== null);
      cccId !== null && setCccId(cccId);
    }
    if (rememberSecret === null) {
      const secret = localStorage.getItem('secret');
      setRememberSecret(secret !== null);
      secret !== null && setSecret(secret);
    }
  }, [rememberCccId, rememberSecret]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Global styles={globalStyles} />
      <Container
        disableGutters
        maxWidth={false}
        sx={{ backgroundColor: `${theme.palette.background.default}` }}
      >
        <AppBar
          cccId={cccId}
          secret={secret}
          rememberCccId={rememberCccId}
          rememberSecret={rememberSecret}
          handleCccIdChange={handleCccIdChange}
          handleSecretChange={handleSecretChange}
          handleRememberCccIdChange={handleRememberCccIdChange}
          handleRememberSecretChange={handleRememberSecretChange}
        />
        <FileUpload cccId={cccId} secret={secret} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
