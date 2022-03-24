import type { NextPage } from "next";
import React from 'react';
import Head from "next/head";
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import PageAppBar from '../components/AppBar/PageAppBar';
import MainPanel from '../components/MainPanel';
import { MainContent } from '../components/Dashboard';
import { ToastContainer } from 'react-toastify';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectDarkTheme, toggleTheme } from '../redux/themeSlice';
import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';
import { amber, deepOrange, grey } from '@mui/material/colors';
import { PaletteMode } from '@mui/material';

const drawerWidth = 280;


const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      ...(mode === 'dark' ? {
        main: '#fff',
        primary: '#fff',
        secondary: grey[800],
      } :
        {
          main: '#000',
          primary: '#000',
          secondary: '#212529',

        }),
    },
    secondary: {
      ...(mode === 'dark' ? {
        main: '#f8f9fa',
        primary: '#f8f9fa',
        secondary: '#f8f9fa',
      } :
        {
          main: '#212529',
          primary: '#212529',
          secondary: '#212529',

        }),
    },
    ...(mode === 'dark' ? {
      background: {
        default: '#0F172A',
        paper: '#0F172A',
        secondary: '#1e293b'
      },
    } : {
      background: {
        default: '#fff',
        paper: '#fff',
        secondary: '#fff'
      },
    }),
    ...(mode === 'dark' ? {
      border: {
        secondary: '#1A2434'
      },
    } : {
      border: {
        secondary: '#DFDFDF'
      },
    }),
    text: {
      ...(mode === 'light'
        ? {
          primary: '#000',
          secondary: '#212529',
        }
        : {
          primary: '#fff',
          secondary: grey[500],
        }),
    },
  },
});

const Home: NextPage = (props) => {

  const darkTheme = useAppSelector(selectDarkTheme);
  const dispatch = useAppDispatch();

  const [gameBalance, setGameBalance] = React.useState(0);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileAppBarOpened, setMobileAppBarOpened] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileAppBarOpened = () => {
    setMobileAppBarOpened(!mobileAppBarOpened)
  };

  const darkModeTheme = createTheme(getDesignTokens('dark'));
  const lightModeTheme = createTheme(getDesignTokens('light'));
  return (

    <>
      <ThemeProvider theme={darkTheme ? darkModeTheme : lightModeTheme}>

        <CssBaseline />
        <PageAppBar
          gameBalance={gameBalance}
          setGameBalance={(value) => setGameBalance(value)} handleMobileAppBarOpened={handleMobileAppBarOpened} />



        <MainContent drawerWidth={drawerWidth} gameBalance={gameBalance}
          setGameBalance={(value) => setGameBalance(value)} mobileAppBarOpened={mobileAppBarOpened} />
        {/* <MainPanel
        drawerWidth={drawerWidth}
      >
        <Dashboard
          searchAddress={searchAddress}

        />
      </MainPanel> */}
        <ToastContainer />
      </ThemeProvider>

    </>

  );
};

export default Home;
