// FILE: frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { Container, CssBaseline, ThemeProvider } from '@mui/material';
import './index.css';
import FileUpload from './FileUpload';
import { theme, globalStyles } from './theme';
import AppBar from './AppBar';
import { Global } from '@emotion/react';

export const App = () => {
  const [uid, setuid] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [rememberuid, setRememberuid] = useState<boolean | null>(null);
  const [rememberSecret, setRememberSecret] = useState<boolean | null>(null);

  const handleuidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setuid(event.target.value);
  };

  const handleSecretChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSecret(event.target.value);
  };

  const handleRememberuidChange = () => {
    if (!uid) {
      return;
    }
    if (rememberuid) {
      localStorage.removeItem('uid');
      setRememberuid(false);
    } else {
      localStorage.setItem('uid', uid);
      setRememberuid(true);
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
    if (rememberuid === null) {
      const uid = localStorage.getItem('uid');
      setRememberuid(uid !== null);
      uid !== null && setuid(uid);
    }
    if (rememberSecret === null) {
      const secret = localStorage.getItem('secret');
      setRememberSecret(secret !== null);
      secret !== null && setSecret(secret);
    }
  }, [rememberuid, rememberSecret]);

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
          uid={uid}
          secret={secret}
          rememberuid={rememberuid}
          rememberSecret={rememberSecret}
          handleuidChange={handleuidChange}
          handleSecretChange={handleSecretChange}
          handleRememberuidChange={handleRememberuidChange}
          handleRememberSecretChange={handleRememberSecretChange}
        />
        <FileUpload uid={uid} secret={secret} />
      </Container>
    </ThemeProvider>
  );
};
