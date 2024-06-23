/** @jsxImportSource @emotion/react */
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { blueGrey, grey, red, orange, blue, green, teal } from '@mui/material/colors';
import { Global, css } from '@emotion/react';

export const theme = createTheme({
  palette: {
    background: {
      default: blueGrey[700], // Light blue-gray background
      paper: blueGrey[400],
    },
    text: {
      primary: grey[50], // White text for better readability
      secondary: grey[100],
    },
    primary: {
      main: teal[500], // Vibrant teal for primary actions
      contrastText: grey[50],
    },
    secondary: {
      main: blueGrey[300],
      contrastText: grey[900],
    },
    error: {
      main: red[500],
      contrastText: grey[50],
    },
    warning: {
      main: orange[500],
      contrastText: grey[900],
    },
    info: {
      main: blue[500],
      contrastText: grey[50],
    },
    success: {
      main: green[500],
      contrastText: grey[50],
    },
    divider: grey[400],
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export const globalStyles = css`
  body {
    background-color: ${theme.palette.background.default};
    color: ${theme.palette.text.primary};
    font-family: ${theme.typography.fontFamily};
    margin: 0;
  }

  a {
    color: ${theme.palette.primary.main};
  }
`;
