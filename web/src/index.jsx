import React from 'react';
import ReactDOM from 'react-dom';
import {
  createMuiTheme,
  ThemeProvider
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import App from './App';
import 'index.css';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#008bf1',
      dark: '$1c3c5b',
      light: '#8fd8ff',
    },

    secondary: {
      main: '#8fd8ff'
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),    
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: '#fff',
        color: '#000'
      }
    },
  }
});

ReactDOM.render(
  // Material UI does not yet play nicely with React Strict
  // <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>,
  // </React.StrictMode>,
  document.getElementById('root')
);