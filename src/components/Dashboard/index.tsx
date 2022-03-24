/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import * as React from 'react';
import axios from "axios";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import Button from '@mui/material/Button';
import style from './index.module.css'

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Dialog, DialogActions, DialogContent, Divider } from "@mui/material";
import LoadingPage from "../LoadingPage";

import {
  AccountInfo,
  Connection,
  LAMPORTS_PER_SOL,
  PartiallyDecodedInstruction,
  ParsedInstruction,
  PublicKey,
  ParsedConfirmedTransaction,
  ConfirmedSignatureInfo,
  TokenBalance,
  Transaction,
  SystemProgram,
  clusterApiUrl
} from "@solana/web3.js";
import { errorAlert, infoAlert, warningAlert, successAlert } from '../toastGroup';
import { playGame, claim, getUserPoolState } from '../../contexts/helper';

import socketIOClient from "socket.io-client";
import Dice from './Dice'
import { SERVER_ENDPOINT, SOLANA_NETWORK } from '../../contexts/config'
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ButtonGroup from '@mui/material/ButtonGroup';

import { Wallet } from '@project-serum/anchor';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});
interface Props {
  drawerWidth: number,
  gameBalance: number;
  setGameBalance: (value: number) => void;
  mobileAppBarOpened: boolean;
}
const solConnection = new Connection(clusterApiUrl(SOLANA_NETWORK));


export const MainContent = (props: Props) => {
  const wallet = useWallet();
  const [enterGame, setEnterGame] = React.useState(true);
  const [curSolBalance, setCurSolBalance] = React.useState(0);
  const [betNum, setBetNum] = React.useState(1);
  const [betSol, setBetSol] = React.useState(0.05);
  const [diceRolling, setDiceRolling] = React.useState(false);
  const [gameEnded, setGameEnded] = React.useState(false);
  const [resultRand, setResultRand] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const handleEnterGame = () => {
    setEnterGame(false)
  }
  // React.useEffect(() => {
  //   let eleList = document.querySelectorAll(".die-list") as unknown as any[];
  //   let dice = [...eleList];
  //   dice.forEach((die, index) => {

  //     die.classList.toggle("odd-roll");
  //     die.classList.toggle("even-roll");
  //     console.log('class toggled before rolling')
  //   });
  // }, [])

  React.useEffect(() => {
    if (wallet.connected) {
      getCurSolBalance();
      getUserPoolData()
    }
  }, [wallet.connected]);
  const getCurSolBalance = async () => {
    if (!wallet.connected || !wallet.publicKey) return;
    let curBalance = parseFloat((await solConnection.getBalance(wallet.publicKey) / LAMPORTS_PER_SOL).toFixed(4));
    setCurSolBalance(curBalance);

  }
  const getUserPoolData = async () => {
    if (!wallet || !wallet.publicKey) return;
    var result = await getUserPoolState(wallet.publicKey);
    if (!result) return;
    console.log(result.gameData, ":::: user pool data")
    if (result.gameData.rewardAmount.toNumber() > 0) {

      setDiceRolling(true);
      setGameEnded(true);
      setResultRand(result.gameData.rand.toNumber());
      setBetNum(result.gameData.setNum.toNumber())
      setBetSol(result.gameData.amount.toNumber() / LAMPORTS_PER_SOL)
      if (document.getElementById('die-1')) (document.getElementById('die-1') as any).dataset.roll = result.gameData.rand.toNumber();

    }
  }

  const handleBetNumClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, betNum: number) => {
    let eleList = document.querySelectorAll(".betNumBtn") as unknown as any[];
    eleList.forEach((btn) => {
      btn.classList.remove('selected')
    });

    (e.target as any).classList.add('selected');
    setBetNum(betNum);
  }

  const handleBetSolClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, betSol: number) => {
    let eleList = document.querySelectorAll(".betSolBtn") as unknown as any[];
    eleList.forEach((btn) => {
      btn.classList.remove('selected')
    });

    (e.target as any).classList.add('selected');
    setBetSol(betSol);
  }

  const playBtnClicked = async () => {

    if (curSolBalance < betSol * 1.05) errorAlert("Please check your sol balance again!");
    setDiceRolling(true);

    var eleList = document.querySelectorAll(".die-list") as unknown as any[];
    var dice = [...eleList];
    dice.forEach((die, index) => {

      die.classList.toggle("even-roll");
      die.classList.toggle("odd-roll");
      console.log('-----------------------------------')
    });


    var setintervalDice = setInterval(() => {
      dice = document.querySelectorAll(".die-list") as unknown as any[];
      dice.forEach((die, index) => {
        die.classList.toggle("even-roll");
        die.classList.toggle("odd-roll");
      });

    }, 1250);
    const result = await playGame(wallet, betNum, betSol, () => setCurSolBalance(parseFloat((curSolBalance - betSol * 1.05).toFixed(4))));

    if (!result) {
      setDiceRolling(false);
      if (setintervalDice) {
        console.log(':::::', setintervalDice)
        clearInterval(setintervalDice as unknown as number);
      }
      if (document.getElementById('die-1')) (document.getElementById('die-1') as any).dataset.roll = 1;

      errorAlert("Transaction error! Please try again");
      return;
    } else if (result === -1) {
      setDiceRolling(false);
      successAlert("You can try again now!");
      return;

    }

    if (result.rewardAmount > 0) {
      successAlert("You won !");
    } else {
      errorAlert("You lost !")
    }

    getCurSolBalance();
    // setDiceRolling(false);
    if (setintervalDice) clearInterval(setintervalDice);
    if (document.getElementById('die-1')) (document.getElementById('die-1') as any).dataset.roll = result.rand.toNumber();
    setGameEnded(true);

    setResultRand(result.rand.toNumber());


    console.log(
      `amount : `, result.amount.toNumber(),
      `playTime : `, result.playTime.toString(),
      `rand : `, result.rand.toNumber(),
      `rewardAmount : `, result.rewardAmount.toNumber(),
      `setNum : `, result.setNum.toNumber()
    );
  }

  const claimClicked = async () => {
    if (!wallet.connected || !wallet.publicKey) return;
    await claim(wallet, () => setLoading(true), () => setLoading(false));
    setLoading(false);
    successAlert('Doubled money. Congrats !')
    curSolBalance
    setCurSolBalance(parseFloat((curSolBalance + betSol).toFixed(4)));
    retryBtnClicked();
  }

  const walletConnectBtnClicked = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e)
  }

  const retryBtnClicked = () => {
    setDiceRolling(false);
    setGameEnded(false);
    setBetNum(1);
    setBetSol(0.05);
    setResultRand(0);
    setLoading(false);

    // let eleList = document.querySelectorAll(".betNumBtn") as unknown as any[];
    // eleList[0].classList.remove('selected').add('selected');
    // eleList = document.querySelectorAll(".betSolBtn") as unknown as any[];
    // eleList[0].classList.remove('selected').add('selected');

  }
  return (
    <Box component="div"
      aria-label="main content" className={`${style.contentWrapper}`}>
      {
        !diceRolling &&
        <div style={{ position: "relative", width: "100%" }}>
          <div className={`${style.content}`}>
            <div className={`${style.diceImgWrapper}`}>
              <img src='./img/dice-png.png' alt='dreamy dice logo' />
            </div>
            {enterGame ?
              <>
                <div className={`${style.walletConnectBtnWrapper}`}>
                  {
                    !wallet.connected ?
                      <WalletModalProvider>
                        <WalletMultiButton onClick={(e) => walletConnectBtnClicked(e)} />
                      </WalletModalProvider>
                      : <>
                        <Button variant="contained" size="large" style={{ maxWidth: '300px', margin: 'auto' }} onClick={handleEnterGame}>
                          DOUBLE OR NOTHING
                        </Button>
                        <p>
                          CLICK TO SEE OPTIONS
                        </p>
                      </>

                  }
                </div>
                <div className={`${style.recentPlayPanelWrapper}`}>
                  <p className={`${style.recentPlayTitle}`}>
                    RECENT PLAYS
                  </p>
                  <div className={`${style.recentPlayPanel}`} style={{ borderRadius: '10px' }}>
                    <List sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.secondary', border: '1px solid', borderColor: 'border.secondary' }} style={{ borderRadius: '10px', padding: '0px' }}>
                      {[0, 1, 2, 3].map((value, index) => {
                        const labelId = `checkbox-list-secondary-label-${value}`;
                        return (
                          <>
                            <ListItem
                              key={value}
                              secondaryAction={
                                '1 min ago'
                              }
                              disablePadding
                            >
                              <ListItemButton>
                                <ListItemAvatar>
                                  <Avatar
                                    alt={`Avatar n°${value + 1}`}
                                    src={`./img/dice-png.png`}
                                  />
                                </ListItemAvatar>
                                <ListItemText id={labelId} primary={`Line item ${value + 1}`} />
                              </ListItemButton>
                            </ListItem>
                            {
                              index !== [0, 1, 2, 3].length - 1 &&
                              <Divider />
                            }
                          </>

                        );
                      })}
                    </List>
                  </div>
                </div>
              </> :
              <>
                <div className={`${style.gamePlayPanel}`}>
                  <p>I like</p>
                  <div className={`${style.betNumberPanel}`}>
                    <Button variant="contained" size="large" className={`${style.betNumberBtn} betNumBtn selected`} onClick={(e) => handleBetNumClick(e, 1)}>1 - 3</Button>
                    <Button variant="contained" size="large" className={`${style.betNumberBtn} betNumBtn`} onClick={(e) => handleBetNumClick(e, 4)}>4 - 6</Button>
                  </div>
                  <p >
                    FOR
                  </p>
                  <div className={`${style.betSolPanel}`}>
                    <Button variant="contained" size="large" className={`${style.betSolBtn} betSolBtn selected`} onClick={(e) => handleBetSolClick(e, 0.05)}>0.05 SOL</Button>
                    <Button variant="contained" size="large" className={`${style.betSolBtn} betSolBtn`} onClick={(e) => handleBetSolClick(e, 0.1)}>0.1 SOL</Button>
                    <Button variant="contained" size="large" className={`${style.betSolBtn} betSolBtn`} onClick={(e) => handleBetSolClick(e, 0.25)}>0.25 SOL</Button>
                    <Button variant="contained" size="large" className={`${style.betSolBtn} betSolBtn`} onClick={(e) => handleBetSolClick(e, 0.5)}>0.5 SOL</Button>
                    <Button variant="contained" size="large" className={`${style.betSolBtn} betSolBtn`} onClick={(e) => handleBetSolClick(e, 1)}>1 SOL</Button>
                    <Button variant="contained" size="large" className={`${style.betSolBtn} betSolBtn`} onClick={(e) => handleBetSolClick(e, 2)}>2 SOL</Button>
                  </div>
                  <Divider style={{ width: 'calc(100% - 20px)' }} />
                  <Button variant="contained" size="large" style={{ width: 'calc(100% - 20px)', margin: '20px 0' }} onClick={playBtnClicked}>DOUBLE OR NOTHING</Button>
                  <Divider style={{ width: 'calc(100% - 20px)' }} />
                  <p>
                    <span style={{ textDecoration: 'underline' }}>STUCK ? </span>
                  </p>

                </div>
              </>
            }


          </div>
          {
            wallet && wallet.connected &&
            <span className={`${style.curSolBalance}`}>SOL {curSolBalance}</span>
          }
        </div>
      }
      {
        diceRolling &&
        <div style={{ width: '100%', position: "relative" }}>
          <div style={{ maxWidth: '420px', margin: 'auto', width: '100%', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: "calc(100vh - 105px)" }}>
              <div style={{ maxWidth: '420px', margin: 'auto', width: '100%' }}>
                <div>
                  <Dice />
                </div>
                {
                  gameEnded ?
                    <div>
                      <p>
                        {
                          (resultRand >= 4 && resultRand <= 6 && betNum >= 4 && betNum <= 6) || (resultRand >= 1 && resultRand <= 3 && betNum >= 1 && betNum <= 3) ?
                            <span style={{ color: "green" }}>Won</span> :
                            <span style={{ color: "red" }}>Lost</span>
                        }
                      </p>
                      <p>
                        {betSol} SOL
                      </p>
                      <Divider style={{ width: 'calc(100% - 20px)' }} />
                      {
                        (resultRand >= 4 && resultRand <= 6 && betNum >= 4 && betNum <= 6) || (resultRand >= 1 && resultRand <= 3 && betNum >= 1 && betNum <= 3) ?
                          <>
                            <Button variant="contained" size="large" style={{ width: 'calc(100% - 20px)', margin: '20px 0' }} onClick={claimClicked}>Claim Reward</Button>
                          </> :
                          <>
                            <p>Try again?</p>
                            <Button variant="contained" size="large" style={{ width: 'calc(100% - 20px)', margin: '20px 0' }} onClick={retryBtnClicked}>DOUBLE OR NOTHING</Button>
                          </>



                      }

                    </div> :
                    <div>
                      <p>
                        Rolling...
                      </p>
                      <p>
                        Bet to
                        {betNum >= 1 && betNum <= 3 ? "  1 - 3  " : "  4 - 6  "}
                        for {betSol} SOL
                      </p>
                    </div>
                }

              </div>
            </div>

          </div>
          {
            wallet && wallet.connected &&
            <span className={`${style.curSolBalance}`}>SOL {curSolBalance}</span>
          }
        </div>
      }
      {
        loading &&
        <LoadingPage />
      }
    </Box>
  )
}
