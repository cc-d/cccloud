// FILE: frontend/src/AppBar.tsx
import React from 'react';

import { useEffect, useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Checkbox,
} from '@mui/material';

interface AppBarProps {
  cccId: string | null;
  secret: string | null;
  rememberCccId: boolean | null;
  rememberSecret: boolean | null;
  handleCccIdChange: React.ChangeEventHandler<HTMLInputElement>;
  handleSecretChange: React.ChangeEventHandler<HTMLInputElement>;
  handleRememberCccIdChange: React.ChangeEventHandler<HTMLInputElement>;
  handleRememberSecretChange: React.ChangeEventHandler<HTMLInputElement>;
}

const IdSecInput = ({
  value,
  type,
  remember,
  onChange,
  handleRememberChange,
}: {
  value: string | null;
  type: 'cccid' | 'secret';
  remember: boolean | null;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  handleRememberChange: React.ChangeEventHandler<HTMLInputElement>;
}) => {
  const label = type === 'cccid' ? 'ID' : 'Secret';
  const inputType = type === 'cccid' ? 'text' : 'password';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        maxWidth: '200px',
      }}
    >
      <TextField
        label={label}
        variant="filled"
        value={value || ''}
        onChange={onChange}
        type={inputType}
        size="small"
        sx={{
          backgroundColor: 'rgba(0,0,0, 0.2)',
          flexGrow: 1,
          borderRadius: 1,
          m: 0,
          p: 0,
        }}
      />

      <Checkbox
        checked={remember !== null && remember !== false}
        onChange={handleRememberChange}
        color="default"
      />
    </Box>
  );
};

const AppBar: React.FC<AppBarProps> = ({
  cccId,
  secret,
  rememberCccId,
  rememberSecret,
  handleCccIdChange,
  handleSecretChange,
  handleRememberCccIdChange,
  handleRememberSecretChange,
}) => {
  const [guts, setGuts] = useState(true);
  useEffect(() => {
    if (window.innerWidth < 600) {
      setGuts(false);
    } else {
      setGuts(true);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setGuts(true);
      } else {
        setGuts(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <MuiAppBar
      position="static"
      sx={{ backgroundColor: 'primary.main', p: 0.5 }}
    >
      <Toolbar
        disableGutters={guts}
        sx={{
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            m: 0,
            p: 0,
            mr: 0.5,
          }}
        >
          cccloud
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexGrow: 1,
            maxWidth: '300px',
            alignItems: 'center',
          }}
        >
          <IdSecInput
            value={cccId}
            type="cccid"
            remember={rememberCccId}
            onChange={handleCccIdChange}
            handleRememberChange={handleRememberCccIdChange}
          />
          <IdSecInput
            value={secret}
            type="secret"
            remember={rememberSecret}
            onChange={handleSecretChange}
            handleRememberChange={handleRememberSecretChange}
          />
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
