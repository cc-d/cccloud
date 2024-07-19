// FILE: frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { Container, CssBaseline, ThemeProvider } from '@mui/material';
import './index.css';
import FileUpload from './FileUpload';
import { theme, globalStyles } from './theme';
import AppBar from './AppBar';
import { Global } from '@emotion/react';

export const App = () => {
  const [secret, setSecret] = useState<string>('');
  const [rememberSecret, setRememberSecret] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    try {
      const resp = await fetch(`http://localhost:8000/token`, {
        method: 'POST',
        body: secret,
        headers: {
          'X-Secret': secret,
        },
      });

      const data = await resp.text();

      setToken(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSecretChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSecret(event.target.value);
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
    if (rememberSecret === null) {
      const secret = localStorage.getItem('secret');
      setRememberSecret(secret !== null);
      secret !== null && setSecret(secret);
    }
  }, [rememberSecret]);

  useEffect(() => {
    if (secret && token === null) {
      getToken();
    }
  }, [secret]);
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
          secret={secret}
          rememberSecret={rememberSecret}
          handleSecretChange={handleSecretChange}
          handleRememberSecretChange={handleRememberSecretChange}
        />
        <FileUpload secret={secret} token={token} />
      </Container>
    </ThemeProvider>
  );
};
