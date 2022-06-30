import type { NextPage } from "next";
import React from 'react';
import Head from "next/head";
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import PageAppBar from '../components/AppBar/PageAppBar';
import SideBar from '../components/AppBar/SideBar';
import MainPanel from '../components/MainPanel';
import { MainContent } from '../components/Dashboard';
import LivePlayPanel from '../components/Dashboard/liveplay';
import { ToastContainer } from 'react-toastify';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectDarkTheme, toggleTheme } from '../redux/themeSlice';
import { selectLiveplay, toggleLiveplay } from '../redux/liveplaySlice';

import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';
import { amber, deepOrange, grey } from '@mui/material/colors';
import { PaletteMode } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/Help';

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
          main: '#33578C',
          primary: '#33578C',
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
        default: '#6D98D4',
        paper: '#33578C',
        secondary: '#6D98D4'
      },
    }),
    ...(mode === 'dark' ? {
      border: {
        secondary: '#1A2434'
      },
    } : {
      border: {
        secondary: '#000'
      },
    }),
    text: {
      ...(mode === 'light'
        ? {
          primary: '#fff',
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
  const liveplay = useAppSelector(selectLiveplay);

  const dispatch = useAppDispatch();

  const [gameBalance, setGameBalance] = React.useState(0);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileAppBarOpened, setMobileAppBarOpened] = React.useState(false);
  const [openFooterHelpDialog, setOpenHelpDialog] = React.useState(false);
  const [maxFooterHelpDialogWidth, setMaxHelpDialogWidth] = React.useState<DialogProps['maxWidth']>('lg');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileAppBarOpened = () => {
    setMobileAppBarOpened(!mobileAppBarOpened)
  };

  const handleOpenHelpDialog = () => {
    setOpenHelpDialog(true);
  }

  const handleFooterHelpDialogClose = () => {
    setOpenHelpDialog(false);
  }

  const darkModeTheme = createTheme(getDesignTokens('dark'));
  const lightModeTheme = createTheme(getDesignTokens('light'));
  return (

    <>
      <ThemeProvider theme={darkTheme ? darkModeTheme : lightModeTheme}>

        <CssBaseline />
        <PageAppBar
          gameBalance={gameBalance}
          setGameBalance={(value) => setGameBalance(value)} handleMobileAppBarOpened={handleMobileAppBarOpened} />

        {
          liveplay ?
            <LivePlayPanel /> :
            <MainContent drawerWidth={drawerWidth} gameBalance={gameBalance}
              setGameBalance={(value) => setGameBalance(value)} mobileAppBarOpened={mobileAppBarOpened} />}
        <span className={`bottomFixedIconWrapper`}>
          <span>
            <a href="https://magiceden.io" target="_blank" rel="noreferrer">
              <svg width="45" height="32" viewBox="0 0 120 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M85.0241 19.8585L92.0525 28.796C92.8571 29.7998 93.5705 30.6256 93.8589 31.0951C95.9609 33.3559 97.1395 36.4114 97.1379 39.5954C96.9405 43.3518 94.6787 45.91 92.5838 48.6463L87.6654 54.8961L85.1 58.1343C85.008 58.2459 84.9486 58.3839 84.9292 58.5312C84.9099 58.6785 84.9315 58.8285 84.9913 58.9628C85.051 59.0972 85.1463 59.2099 85.2655 59.2872C85.3846 59.3642 85.5223 59.4025 85.6617 59.3972H111.301C115.217 59.3972 120.151 62.9592 119.863 68.3671C119.855 70.8249 118.936 73.1799 117.306 74.9178C115.677 76.6558 113.469 77.636 111.164 77.6445H71.0128C68.3714 77.6445 61.2671 77.9522 59.2785 71.3948C58.8556 70.0245 58.7978 68.556 59.1115 67.1526C59.6896 65.0778 60.6041 63.1268 61.8136 61.3886C63.8326 58.1504 66.0185 54.9122 68.1741 51.7711C70.9521 47.6586 73.806 43.6756 76.6143 39.4821C76.714 39.3455 76.7682 39.1775 76.7682 39.0045C76.7682 38.8315 76.714 38.6634 76.6143 38.5269L66.4132 25.5739C66.3467 25.4801 66.2606 25.4039 66.1618 25.3514C66.0632 25.299 65.9543 25.2718 65.844 25.2718C65.7336 25.2718 65.6248 25.299 65.5261 25.3514C65.4273 25.4039 65.3412 25.4801 65.2747 25.5739C62.5423 29.5084 50.5803 46.9301 48.03 50.4597C45.4798 53.9894 39.1952 54.1836 35.7189 50.4597L19.7646 33.3781C19.6627 33.269 19.5326 33.1946 19.3911 33.1645C19.2495 33.1343 19.1027 33.1497 18.9694 33.2087C18.836 33.2677 18.722 33.3676 18.642 33.4957C18.562 33.6239 18.5195 33.7745 18.5198 33.9285V66.7804C18.5573 69.1117 17.9102 71.397 16.6687 73.3162C15.4274 75.2353 13.6543 76.6923 11.5976 77.4827C10.2835 77.9705 8.87918 78.1162 7.50143 77.9075C6.12383 77.6989 4.81302 77.1419 3.67815 76.2832C2.54328 75.4246 1.61729 74.2888 0.977451 72.9711C0.337758 71.6531 0.00258063 70.1912 0 68.707V9.64182C0.0915364 7.51325 0.809558 5.46962 2.05221 3.80123C3.29485 2.13284 4.99883 0.924637 6.92215 0.348136C8.57193 -0.120623 10.3085 -0.115924 11.956 0.361772C13.6036 0.839369 15.1034 1.77321 16.3035 3.06832L40.8346 29.2655C40.9081 29.3451 40.9969 29.4065 41.0951 29.4453C41.1932 29.4841 41.2982 29.4995 41.4025 29.4901C41.5068 29.4809 41.6079 29.4472 41.6987 29.3917C41.7895 29.336 41.8675 29.2598 41.9276 29.1683L59.3544 3.44061C60.1597 2.3962 61.1694 1.55223 62.3127 0.967682C63.456 0.38313 64.7053 0.0722898 65.973 0.056682H111.301C112.541 0.0589821 113.767 0.343536 114.896 0.891615C116.025 1.43986 117.032 2.23881 117.848 3.23508C118.664 4.23135 119.271 5.40209 119.629 6.66895C119.987 7.93581 120.088 9.26953 119.923 10.5809C119.604 12.8559 118.522 14.9302 116.878 16.4189C115.233 17.9075 113.139 18.7098 110.982 18.6766H85.6009C85.4734 18.6799 85.3491 18.7196 85.2407 18.7916C85.1325 18.8635 85.0443 18.9652 84.9854 19.0858C84.9265 19.2066 84.899 19.342 84.9058 19.4778C84.9127 19.6137 84.9535 19.7451 85.0241 19.8585Z" fill="url(#paint0_linear_6_12)" />
                <defs>
                  <linearGradient id="paint0_linear_6_12" x1="2.59928" y1="4.56932e-07" x2="123.91" y2="66.7325" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9A0CBB" />
                    <stop offset="0.479268" stopColor="#CB1D9F" />
                    <stop offset="1" stopColor="#F72C87" />
                  </linearGradient>
                </defs>
              </svg>
            </a>
          </span>
          <span>
            <a href="https://twitter.com/DreamyDiceRoll" target="_blank" rel="noreferrer">
              <svg width="40" height="32" viewBox="0 0 184 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M183.736 18.2656C176.856 21.3135 169.558 23.3141 162.086 24.201C169.869 19.5359 175.846 12.1486 178.66 3.34666C171.261 7.73747 163.165 10.8311 154.724 12.4938C147.847 5.1682 138.051 0.589966 127.209 0.589966C106.391 0.589966 89.5131 17.4675 89.5131 38.2837C89.5131 41.2385 89.8468 44.1151 90.4892 46.8747C59.1614 45.3022 31.3863 30.2957 12.7942 7.48997C9.5502 13.0572 7.69135 19.533 7.69135 26.4402C7.69135 39.5182 14.3466 51.0553 24.4605 57.8153C18.4745 57.6279 12.6202 56.0111 7.38633 53.1C7.38417 53.2579 7.38417 53.4158 7.38417 53.5744C7.38417 71.8378 20.3775 87.0732 37.621 90.5361C32.0702 92.0458 26.2478 92.2667 20.5985 91.1821C25.3949 106.158 39.3162 117.055 55.8105 117.36C42.9098 127.47 26.6559 133.496 8.99613 133.496C5.95307 133.496 2.95307 133.318 0.00402832 132.97C16.6856 143.665 36.4992 149.905 57.7863 149.905C127.121 149.905 165.036 92.4668 165.036 42.6553C165.036 41.0203 165 39.3948 164.927 37.7785C172.306 32.4437 178.676 25.836 183.736 18.2656" fill="#55ACEE" />
              </svg>
            </a>
          </span>
          <span>
            <a href="https://discord.gg/3DKTYvpR" target="_blank" rel="noreferrer">
              <svg width="40" height="32" viewBox="0 0 194 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M164.202 12.5103C151.547 6.58923 138.159 2.38206 124.392 0C122.678 3.10025 120.674 7.2701 119.292 10.5874C104.449 8.35553 89.7424 8.35553 75.172 10.5874C73.7911 7.27085 71.7424 3.10025 70.0117 0C56.2313 2.38316 42.832 6.60105 30.1713 12.5412C4.9773 50.6133 -1.8526 87.7387 1.56197 124.339C18.2723 136.817 34.4662 144.398 50.3873 149.359C54.3441 143.917 57.8419 138.156 60.8444 132.136C55.128 129.959 49.6172 127.277 44.3775 124.122C45.7564 123.1 47.1028 122.035 48.4147 120.928C80.165 135.779 114.663 135.779 146.035 120.928C147.353 122.027 148.699 123.092 150.072 124.122C144.824 127.286 139.303 129.973 133.575 132.152C136.594 138.197 140.086 143.963 144.032 149.374C159.968 144.414 176.177 136.833 192.887 124.339C196.894 81.9106 186.043 45.1251 164.202 12.5095V12.5103ZM65.1703 101.83C55.6389 101.83 47.8223 92.9322 47.8223 82.0967C47.8223 71.2613 55.4723 62.348 65.1703 62.348C74.869 62.348 82.6848 71.2455 82.5183 82.0967C82.5333 92.9322 74.869 101.83 65.1703 101.83ZM129.279 101.83C119.748 101.83 111.932 92.9322 111.932 82.0967C111.932 71.2613 119.581 62.348 129.279 62.348C138.978 62.348 146.794 71.2455 146.627 82.0967C146.627 92.9322 138.978 101.83 129.279 101.83V101.83Z" fill="#5865F2" />
              </svg>
            </a>

          </span>
          <IconButton color="secondary" aria-label="picture" component="span" className={`mobileHelpDialogBtn`} onClick={handleOpenHelpDialog} style={{ marginRight: "0px" }}>
            <HelpIcon style={{ fontSize: 38 }} />
          </IconButton>
        </span>

        {/* <MainPanel
        drawerWidth={drawerWidth}
      >
        <Dashboard
          searchAddress={searchAddress}

        />
      </MainPanel> */}
        <ToastContainer />
        {/*  */}
        <Dialog
          open={openFooterHelpDialog}
          onClose={handleFooterHelpDialogClose}
          aria-labelledby="profilePic-dialog-title"
          aria-describedby="profilePic-dialog-description"
          maxWidth={maxFooterHelpDialogWidth}

        >
          <DialogContent>
            {/* <DialogContentText id="alert-dialog-description">
            
          </DialogContentText> */}
            <div className={`footerHelpDialogContent`}>
              <h2>
                How to Play
              </h2>

              <p>
                This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.
              </p>
              <h2>
                FAQ
              </h2>

              <p>
                This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.This is random text that will be filled in later on when I send you the text.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </ThemeProvider>

    </>

  );
};

export default Home;
