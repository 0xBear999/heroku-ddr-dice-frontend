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
import { Confetti } from '../confetti'

import { Wallet } from '@project-serum/anchor';

const perFace = [
  [-0.1, 0.3, -1],
  [-0.1, 0.6, -0.4],
  [-0.85, -0.42, 0.73],
  [-0.8, 0.3, -0.75],
  [0.3, 0.45, 0.9],
  [-0.16, 0.6, 0.18]
];
const setVal = (num: number) => {
  var eleList = document.querySelectorAll(".dice") as unknown as any[];
  var dice = [...eleList];
  dice.forEach((die, index) => {
    die.style.transform = `rotate3d(${perFace[num - 1]}, 180deg)`;

    console.log('-----------------------------------')
  });

  // $(".dice").css("transform", `rotate3d(${perFace[num - 1]}, 180deg)`);
};
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
  const [betSol, setBetSol] = React.useState(0.1);
  const [diceRolling, setDiceRolling] = React.useState(false);
  const [gameEnded, setGameEnded] = React.useState(false);
  const [resultRand, setResultRand] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [mainGameHistory, setMainGameHistory] = React.useState<any[]>([]);
  const [isloadingConfetti, setIsLoadingConfetti] = React.useState(false)
  const [resultMessage, setResultMessage] = React.useState("Congrats !")
  const [showResultMsg, setShowResultMsg] = React.useState(false);
  const handleEnterGame = () => {
    setShowResultMsg(false)
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
    const socket = socketIOClient(SERVER_ENDPOINT);
    socket.on("update_stat_data", data => {
      // console.log('socket stat data received : ', data.txsHistory.reverse());
      var txsHistoryArrayTmp = (data.txsHistory as any[]).sort((item1, item2) => {
        return item1.timestamp < item2.timestamp ? 1 : -1
      });

      setMainGameHistory(txsHistoryArrayTmp)
      // var array = (data.playTxs as any[]).map(item => Object.fromEntries(
      //   Object.entries(item).map(
      //     ([key, val]) => [key === 'player' ? 'timestamp' : key, val]
      //   )
      // ))
    });

    getStatData();
  }, [])

  const getStatData = async () => {
    try {
      var statData = await axios.post(`${SERVER_ENDPOINT}/getStatData`);
      // console.log("=================================init stat data ::::", (statData.data.txsHistory as any[]).reverse())
      var txsHistoryArrayTmp = (statData.data.txsHistory as any[]).sort((item1, item2) => {
        return item1.timestamp < item2.timestamp ? 1 : -1
      });
      setMainGameHistory(txsHistoryArrayTmp);
    } catch (error) {
      console.log(error)
    }
  }

  React.useEffect(() => {
    if (wallet.connected) {
      getCurSolBalance();
      getUserPoolData()
    }
  }, [wallet.connected]);
  const getCurSolBalance = async () => {
    if (!wallet.connected || !wallet.publicKey) return;
    let curBalance = parseFloat((await solConnection.getBalance(wallet.publicKey) / LAMPORTS_PER_SOL).toFixed(2));
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
    setShowResultMsg(false)

    if (curSolBalance < betSol * 1.05) errorAlert("Please check your sol balance again!");
    setDiceRolling(true);
    // setTimeout(() => {


    // }, 50);


    // var setintervalDice = setInterval(() => {
    //   dice = document.querySelectorAll(".dice") as unknown as any[];
    //   dice.forEach((die, index) => {
    //     die.classList.remove("throw");
    //     // die.classList.add("up");

    //     // setVal(2);
    //     setTimeout(() => {
    //       die.classList.add("throw");

    //     }, 50);
    //     // die.classList.toggle("even-roll");
    //     // die.classList.toggle("odd-roll");
    //   });

    // }, 800);
    const result = await playGame(wallet, betNum, betSol, () => setCurSolBalance(parseFloat((curSolBalance - betSol * 1.05).toFixed(2))), () => setLoading(true));
    setLoading(false)
    if (!result || result.gameData === undefined) {
      // clearInterval(result?.setintervalDice)

      setDiceRolling(false);
      // if (setintervalDice) {
      //   console.log(':::::', setintervalDice)
      //   clearInterval(setintervalDice as unknown as number);

      //   var eleList = document.querySelectorAll(".dice") as unknown as any[];
      //   var dice = [...eleList];
      //   dice.forEach((die, index) => {
      //     die.classList.remove("throw");
      //     die.classList.remove("up");

      //   });
      // }
      // if (document.getElementById('die-1')) (document.getElementById('die-1') as any).dataset.roll = 1;
      errorAlert("Transaction error! Please try again");
      return;
    }
    // clearInterval(result?.setintervalDice)

    setTimeout(() => {
      var eleList = document.querySelectorAll(".dice") as unknown as any[];
      eleList.forEach((die, index) => {
        die.classList.remove("throw");
        setVal(result.gameData.rand.toNumber());

        // die.classList.add("up");
        // setVal(2);
        setTimeout(() => {
          die.classList.add("throw");


        }, 50);

        // die.classList.toggle("even-roll");
        // die.classList.toggle("odd-roll");
        console.log('-----------------------------------')
      });

    }, 1000);


    if (result.gameData.rewardAmount.toNumber() > 0) {
      setTimeout(() => {
        successAlert("You won !");
        setResultMessage("You Won. Congrats !")
        setIsLoadingConfetti(true)

      }, 3000)
    } else {
      setTimeout(() => {
        setResultMessage("Keep Dreaming !")
        errorAlert("Keep Dreaming !")
      }, 3000)
    }

    setTimeout(() => {
      setShowResultMsg(true)
      getCurSolBalance();
      setGameEnded(true);

      setResultRand(result.gameData.rand.toNumber());


      console.log(
        `amount : `, result.gameData.amount.toNumber(),
        `playTime : `, result.gameData.playTime.toString(),
        `rand : `, result.gameData.rand.toNumber(),
        `rewardAmount : `, result.gameData.rewardAmount.toNumber(),
        `setNum : `, result.gameData.setNum.toNumber()
      );
    }, 2500)

    // setDiceRolling(false);
    // if (setintervalDice) clearInterval(setintervalDice);
    // var eleList = document.querySelectorAll(".dice") as unknown as any[];
    // var dice = [...eleList];
    // dice.forEach((die, index) => {
    //   die.classList.remove("throw");
    //   die.classList.remove("up");

    // });
    // if (document.getElementById('die-1')) (document.getElementById('die-1') as any).dataset.roll = result.rand.toNumber();

  }

  const claimClicked = async () => {
    if (!wallet.connected || !wallet.publicKey) return;
    await claim(wallet, () => setLoading(true), () => setLoading(false));
    setLoading(false);
    successAlert('Doubled money. Congrats !')
    curSolBalance
    setCurSolBalance(parseFloat((curSolBalance + betSol).toFixed(2)));
    retryBtnClicked();
    setIsLoadingConfetti(false)

  }

  const walletConnectBtnClicked = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e)
  }

  const retryBtnClicked = () => {
    setShowResultMsg(false);
    setDiceRolling(false);
    setGameEnded(false);
    setBetNum(1);
    setBetSol(0.1);
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
              <img src='./img/logo.png' alt='dreamy dice logo' style={{ width: "100%" }} />
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
                        <Button variant="contained" size="large" className={`${style.ready2RollBtn}`} onClick={handleEnterGame}>
                          Ready to Roll?
                        </Button>
                        {/* <p>
                          CLICK TO SEE OPTIONS
                        </p> */}
                      </>

                  }
                </div>
                <div className={`${style.recentPlayPanelWrapper}`}>
                  <p className={`${style.recentPlayTitle}`}>
                    RECENT PLAYS
                  </p>
                  <div className={`${style.recentPlayPanel}`} style={{ borderRadius: '10px' }}>
                    <List sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.secondary', border: '1px solid', borderColor: 'border.secondary' }} style={{ borderRadius: '10px', padding: '0px' }}>
                      {mainGameHistory.slice(0, 12).map((item, index) => {
                        var timeAgo = new Date().getTime() / 1000 - item.timestamp;
                        var agoString = '';
                        if (timeAgo < 60) agoString = 'in ' + Math.ceil(timeAgo) + ' seconds ago';
                        if (timeAgo >= 60 && timeAgo < 120) agoString = '' + Math.floor(timeAgo / 60) + ' minute ago'
                        if (timeAgo >= 120 && timeAgo < 3600) agoString = '' + Math.floor(timeAgo / 60) + ' minutes ago'
                        if (timeAgo >= 3600 && timeAgo < 7200) agoString = '' + Math.floor(timeAgo / 3600) + ' hour ago'
                        if (timeAgo >= 7200 && timeAgo < 86400) agoString = '' + Math.floor(timeAgo / 3600) + ' hours ago'
                        if (timeAgo >= 86400) agoString = '' + Math.ceil(timeAgo / 86400) + ' days ago'
                        if (timeAgo >= 86400 * 30) agoString = '' + Math.ceil(timeAgo / 86400 / 30) + ' months ago'
                        const labelId = `checkbox-list-secondary-label-${item}`;
                        return (
                          <>
                            <ListItem
                              key={index}
                              secondaryAction={
                                agoString
                              }
                              disablePadding
                            >
                              <ListItemButton>
                                <ListItemAvatar>
                                  <Avatar
                                    alt={`Avatar n°${item + 1}`}
                                    src={item.pfp ? item.pfp : `./img/dice-png.png`}
                                  />
                                </ListItemAvatar>
                                <ListItemText id={labelId}  >

                                  {item.name} Played With {item.betSol} and

                                  {
                                    item.wl > 0 ? <span style={{ color: "green" }}> Doubled</span> : <span style={{ color: "darkmagenta" }}> Busted</span>
                                  }
                                </ListItemText>
                              </ListItemButton>
                            </ListItem>
                            {
                              index !== mainGameHistory.length - 1 &&
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
                  <p>Rolling</p>
                  <div className={`${style.betNumberPanel}`}>
                    <Button variant="contained" size="large" className={`${style.betNumberBtn} betNumBtn selected`} onClick={(e) => handleBetNumClick(e, 1)}>Lows(1 - 3)</Button>
                    <Button variant="contained" size="large" className={`${style.betNumberBtn} betNumBtn`} onClick={(e) => handleBetNumClick(e, 4)}>Highs(4 - 6)</Button>
                  </div>
                  <p >
                    FOR
                  </p>
                  <div className={`${style.betSolPanel}`}>
                    <Button variant="contained" size="large" className={`${style.betSolBtn} betSolBtn selected`} onClick={(e) => handleBetSolClick(e, 0.1)}>0.1 SOL</Button>
                    <Button variant="contained" size="large" className={`${style.betSolBtn} betSolBtn`} onClick={(e) => handleBetSolClick(e, 0.2)}>0.2 SOL</Button>
                    <Button variant="contained" size="large" className={`${style.betSolBtn} betSolBtn`} onClick={(e) => handleBetSolClick(e, 0.35)}>0.35 SOL</Button>
                    <Button variant="contained" size="large" className={`${style.betSolBtn} betSolBtn`} onClick={(e) => handleBetSolClick(e, 0.5)}>0.5 SOL</Button>

                  </div>
                  <Divider style={{ width: 'calc(100% - 20px)' }} />
                  <Button variant="contained" size="large" style={{ width: 'calc(100% - 20px)', margin: '20px 0' }} onClick={playBtnClicked}>READY TO ROLL</Button>
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
              <div style={{ maxWidth: '420px', margin: 'auto', width: '100%', marginTop: "60%" }}>
                <Dice />
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
                            {/* <p>Try again?</p> */}
                            <Button variant="contained" size="large" style={{ width: 'calc(100% - 20px)', margin: '20px 0' }} onClick={retryBtnClicked}>Keep Dream</Button>
                            {/* READY TO ROLL */}
                          </>



                      }

                    </div> :
                    <div>
                      <p>
                        Rolling...
                      </p>
                      <p>
                        Play With
                        {betNum >= 1 && betNum <= 3 ? "  Lows(1 - 3)  " : "  Highs(4 - 6)  "}
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
      {isloadingConfetti &&

        <Confetti />
      }
      {
        showResultMsg &&
        <span className={`${style.congratText}`}>{resultMessage}<br /><span style={{ fontSize: "27px" }}>Result Number : {resultRand}</span></span>
      }



    </Box>
  )
}
