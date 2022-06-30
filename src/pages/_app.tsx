import React, { useMemo } from "react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

// import "tailwindcss/tailwind.css";
import "../styles/globals.scss";
import "../styles/App.css";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { store } from '../redux/store';
import { Provider } from 'react-redux';

import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectDarkTheme, toggleTheme } from '../redux/themeSlice';
import { ConfettiProvider } from '../components/confetti';

// const SOLANA_NETWORK = WalletAdapterNetwork.Mainnet;
const SOLANA_NETWORK = WalletAdapterNetwork.Mainnet;
const network = SOLANA_NETWORK;

// set custom RPC server endpoint for the final website
// const endpoint = "https://explorer-api.devnet.solana.com";
// const endpoint = "http://127.0.0.1:8899";

const WalletProvider = dynamic(
  () => import("../contexts/ClientWalletProvider"),
  {
    ssr: false,
  }
);




function MyApp({ Component, pageProps }: AppProps) {
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);



  return (
    <Provider store={store}>

      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider autoConnect>
          <ConfettiProvider>

            {/* <ThemeProvider theme={darkTheme}> */}
            <Component {...pageProps} />
            {/* </ThemeProvider> */}
          </ConfettiProvider>

        </WalletProvider>
      </ConnectionProvider>
    </Provider>

  );
}

export default MyApp;
