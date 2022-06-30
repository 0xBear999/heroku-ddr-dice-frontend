/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
import * as React from 'react';

import Box from '@mui/material/Box';
import socketIOClient from "socket.io-client";
import { SERVER_ENDPOINT, SOLANA_NETWORK } from '../../contexts/config'

import Paper from '@mui/material/Paper';

import axios from 'axios';
import style from './liveplay.module.css'
import { Divider } from '@mui/material';
interface Props {
    drawerWidth: number;
}
const socket = socketIOClient(SERVER_ENDPOINT);

const LivePlayPanel = () => {

    const [winNums, setWinNums] = React.useState(0)
    const [lostNums, setLostNums] = React.useState(0)
    const [betNum1, setBetNum1] = React.useState(0)
    const [curPlayers, setCurPlayers] = React.useState(0);
    const [forceFlag, setForceFlag] = React.useState(false);
    const [gameHistory, setGameHistory] = React.useState<any[]>([]);
    const [mostPlayHistory, setMostPlayHistory] = React.useState<any[]>([]);
    const [mostVolumeHistory, setMostVolumeHistory] = React.useState<any[]>([]);
    const [mostWinPercentHistory, setMostWinPercentHistory] = React.useState<any[]>([]);

    const [rollsPerMin, setRollsPerMin] = React.useState(0);

    const [showPanel, setShowPanel] = React.useState(0);
    React.useEffect(() => {
        socket.on("update_stat_data", data => {
            console.log('socket stat data received : ', data);

            var txsHistoryArrayTmp = (data.txsHistory as any[]).sort((item1, item2) => {
                return item1.timestamp < item2.timestamp ? 1 : -1
            });

            setGameHistory(txsHistoryArrayTmp);
            var wins = 0;
            var rollsNumInMin = 1;
            var firstTimestamp = data.txsHistory[0].timestamp;
            var betNum1s = 0;
            for (let i = 0; i < data.txsHistory.length; i++) {
                if (data.txsHistory[i].wl > 0) wins++;
                if (data.txsHistory[i].timestamp >= firstTimestamp - 60) rollsNumInMin++;
                if (data.txsHistory[i].betNum >= 1 && data.txsHistory[i].betNum <= 3) betNum1s++;
            }
            setBetNum1(betNum1s);
            setRollsPerMin(rollsNumInMin);
            setWinNums(wins);


            var mostPlays = (data.historyStat as any[]).sort((item1, item2) => {
                return item1.totalPlays > item2.totalPlays ? -1 : 1
            }).slice(0, 15);
            setMostPlayHistory(mostPlays);

            mostPlays = (data.historyStat as any[]).sort((item1, item2) => {
                return item1.totalWinnedSol > item2.totalWinnedSol ? -1 : 1
            }).slice(0, 15);
            setMostVolumeHistory(mostPlays);

            mostPlays = (data.historyStat as any[]).sort((item1, item2) => {
                return item1.totalWins / item1.totalPlays > item2.totalWins / item2.totalPlays ? -1 : 1
            }).slice(0, 15);
            setMostWinPercentHistory(mostPlays);
            // var array = (data.playTxs as any[]).map(item => Object.fromEntries(
            //   Object.entries(item).map(
            //     ([key, val]) => [key === 'player' ? 'timestamp' : key, val]
            //   )
            // ))
        });
        socket.on("update_connected_players", data => {
            console.log("current players ::", data)
            setCurPlayers(data);
        });
        getStatData();
        getCurrentPlayers();

    }, [])

    const getStatData = async () => {
        let result = await axios.post(`${SERVER_ENDPOINT}/getStatData`);
        if (result.status !== 200) return;

        var txsHistoryArrayTmp = (result.data.txsHistory as any[]).sort((item1, item2) => {
            return item1.timestamp < item2.timestamp ? 1 : -1
        });

        setGameHistory(txsHistoryArrayTmp);
        var wins = 0;
        var rollsNumInMin = 1;
        var firstTimestamp = result.data.txsHistory[0].timestamp;
        var betNum1s = 0;
        for (let i = 0; i < result.data.txsHistory.length; i++) {
            if (result.data.txsHistory[i].wl > 0) wins++;
            if (result.data.txsHistory[i].timestamp >= firstTimestamp - 60) rollsNumInMin++;
            if (result.data.txsHistory[i].betNum >= 1 && result.data.txsHistory[i].betNum <= 3) betNum1s++;
        }
        setBetNum1(betNum1s);
        setRollsPerMin(rollsNumInMin);
        setWinNums(wins);
        console.log(result.data.historyStat)
        var mostPlays = (result.data.historyStat as any[]).sort((item1, item2) => {
            return item1.totalPlays > item2.totalPlays ? -1 : 1
        }).slice(0, 15);
        setMostPlayHistory(mostPlays);

        mostPlays = (result.data.historyStat as any[]).sort((item1, item2) => {
            return item1.totalWinnedSol > item2.totalWinnedSol ? -1 : 1
        }).slice(0, 15);
        setMostVolumeHistory(mostPlays);

        mostPlays = (result.data.historyStat as any[]).sort((item1, item2) => {
            return item1.totalWins / item1.totalPlays > item2.totalWins / item2.totalPlays ? -1 : 1
        }).slice(0, 15);
        setMostWinPercentHistory(mostPlays);

    }

    const getCurrentPlayers = async () => {
        let result = await axios.post(`${SERVER_ENDPOINT}/getConnectedPlayers`);
        setCurPlayers(result.data);
    }

    const showMostPlays = () => {
        setShowPanel(1)
    }

    const showMostSolPlays = () => {
        setShowPanel(2)
    }
    const showMostWinPercentPlays = () => {
        setShowPanel(3)
    }

    return (
        <>
            <Box
                component="main"
                sx={{

                    flexGrow: 1,
                    p: 3,
                    width: { sm: `100%` },
                    overflow: 'auto',
                    padding: { sm: '60px' },
                }}
            >

                <div>
                    <p className={`${style.title1}`}>
                        DDR Live Dashboard
                    </p>
                    <p className={`${style.title2}`}>
                        There are currently <span style={{ fontWeight: "bold" }}>{curPlayers}</span> people rolling dice on this site

                    </p>

                    <div className={`${style.paperWrapper}`}>
                        <Paper className={`${style.paperPanel}`} elevation={8} onClick={showMostPlays}>
                            <div className={`${style.paperContent}`}>
                                <div className={`${style.abovePanel}`}>
                                    <div>
                                        <p>
                                            {mostPlayHistory[0] ? mostPlayHistory[0].name : ""}
                                        </p>
                                        <p>
                                            Most Rolls
                                        </p>
                                    </div>
                                    <div className={`${style.imgWrapper}`}>
                                        <img src={mostPlayHistory[0] ? mostPlayHistory[0].pfp : "./img/dice-png.png"} className={`${style.userLogo}`} alt='avatar' />
                                    </div>
                                </div>
                                <div className={`${style.belowPanel}`}>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <img src='./img/dice-png.png' className={`${style.subLogo}`} alt='ddr' />
                                        </div>
                                        <span>
                                            DDR
                                        </span>
                                    </div>
                                    <Divider orientation="vertical" flexItem />
                                    <div>
                                        {mostPlayHistory[0] ? mostPlayHistory[0].totalPlays : 0} rolls
                                    </div>
                                </div>
                            </div>
                        </Paper>
                        <Paper className={`${style.paperPanel}`} elevation={8} onClick={showMostSolPlays}>
                            <div className={`${style.paperContent}`}>
                                <div className={`${style.abovePanel}`}>
                                    <div>
                                        <p>
                                            {mostVolumeHistory[0] ? mostVolumeHistory[0].name : ""}
                                        </p>
                                        <p>
                                            Most Volume
                                        </p>
                                    </div>
                                    <div className={`${style.imgWrapper}`}>
                                        <img src={mostVolumeHistory[0] ? mostVolumeHistory[0].pfp : "./img/dice-png.png"} className={`${style.userLogo}`} alt='avatar' />
                                    </div>
                                </div>
                                <div className={`${style.belowPanel}`}>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <img src='./img/dice-png.png' className={`${style.subLogo}`} alt='ddr' />
                                        </div>
                                        <span>
                                            DDR
                                        </span>
                                    </div>
                                    <Divider orientation="vertical" flexItem />
                                    <div>
                                        {mostVolumeHistory[0] ? mostVolumeHistory[0].totalWinnedSol.toFixed(1) : 0} SOL
                                    </div>
                                </div>
                            </div>
                        </Paper>
                        <Paper className={`${style.paperPanel}`} elevation={8} onClick={showMostWinPercentPlays}>
                            <div className={`${style.paperContent}`}>
                                <div className={`${style.abovePanel}`}>
                                    <div>
                                        <p>
                                            {mostWinPercentHistory[0] ? mostWinPercentHistory[0].name : ""}
                                        </p>
                                        <p>
                                            Top Win Percent
                                        </p>
                                    </div>
                                    <div className={`${style.imgWrapper}`}>
                                        <img src={mostWinPercentHistory[0] ? mostWinPercentHistory[0].pfp : "./img/dice-png.png"} className={`${style.userLogo}`} alt='avatar' />
                                    </div>
                                </div>

                                <div className={`${style.belowPanel}`}>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <img src='./img/dice-png.png' className={`${style.subLogo}`} alt='ddr' />
                                        </div>
                                        <span>
                                            DDR
                                        </span>
                                    </div>
                                    <Divider orientation="vertical" flexItem />
                                    <div>
                                        {mostWinPercentHistory[0] ? (mostWinPercentHistory[0].totalWins * 100 / mostWinPercentHistory[0].totalPlays).toFixed(2) : 0} %
                                    </div>
                                </div>
                            </div>
                        </Paper>
                    </div>
                    <div className={``}>
                        <div className={`${style.subTitle}`}>
                            <p>
                                Player Win Percentage (last {gameHistory.length} rolls only ): {winNums}
                            </p>
                            <p>
                                Rolls Per Minute:{(rollsPerMin / 60).toFixed(2)}
                            </p>
                        </div>
                        <div className={`${style.gameProgressBar}`}>
                            <div style={{ width: `${betNum1 * 100 / gameHistory.length}%`, backgroundColor: "#3B82F6", height: '100%' }}>
                                Play With Lows(1 - 3) :{betNum1}
                            </div>
                            <div style={{ width: `${100 - betNum1 * 100 / gameHistory.length}%`, backgroundColor: "#22C55E", height: '100%' }}>
                                Play With Highs(4 - 6) :{gameHistory.length - betNum1}

                            </div>
                        </div>
                        <div>
                            {
                                showPanel === 0 &&
                                <>
                                    <div className={`${style.subTitle}`}>
                                        <p>
                                            Play Stream
                                        </p>
                                        <p>
                                            Random Roll was
                                        </p>
                                    </div>
                                    <div className={`${style.historyDetailPanel}`}>
                                        {
                                            gameHistory.slice(0, 15).map((item, index) => {
                                                return (
                                                    <div className={`${style.row}`} key={index}>
                                                        <span className={`${item.wl > 0 ? style.wonborder : style.lostborder}`}>
                                                            {item.name} Played With {item.betNum < 4 ? " Lows(1 - 3) " : " Highs(4 - 6) "} and

                                                            {
                                                                item.wl > 0 ? " Won " + item.betSol + "◎" : " Busted For " + item.betSol + "◎"
                                                            }
                                                        </span>
                                                        <span>
                                                            {
                                                                <div className={`${style.resultRand}`}>

                                                                    {
                                                                        item.rand >= 4 ? <><div> </div><div className={`${item.wl > 0 ? style.wonborder : style.lostborder}`}>Highs(4 - 6)</div></> : <><div className={`${item.wl > 0 ? style.wonborder : style.lostborder}`}>Lows(1 - 3)</div><div> </div></>
                                                                    }
                                                                </div>
                                                            }
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </>
                            }
                            {
                                showPanel === 1 &&
                                <>
                                    <p>
                                        TOP PLAYERS Most Played
                                    </p>
                                    <div>

                                        {
                                            mostPlayHistory.slice(0, 15).map((item, index) => {
                                                return (
                                                    <div className={`${style.row}`} key={index}>
                                                        {index + 1}.&nbsp;&nbsp;&nbsp;
                                                        {item.name} totally played {item.totalPlays} times
                                                    </div>
                                                )
                                            })
                                        }

                                    </div>
                                </>
                            }

                            {
                                showPanel === 2 &&
                                <>
                                    <p>
                                        TOP PLAYERS got the most SOL
                                    </p>
                                    <div>

                                        {
                                            mostVolumeHistory.slice(0, 15).map((item, index) => {
                                                return (
                                                    <div className={`${style.row}`} key={index}>
                                                        {index + 1}.&nbsp;&nbsp;&nbsp;
                                                        {item.name} totally got {item.totalWinnedSol.toFixed(1)} SOL
                                                    </div>
                                                )
                                            })
                                        }

                                    </div>
                                </>
                            }
                            {
                                showPanel === 3 &&
                                <>
                                    <p>
                                        TOP PLAYERS the most winning percent
                                    </p>
                                    <div>

                                        {
                                            mostWinPercentHistory.slice(0, 15).map((item, index) => {
                                                return (
                                                    <div className={`${style.row}`} key={index}>
                                                        {index + 1}.&nbsp;&nbsp;&nbsp;
                                                        {item.name}'s winning percent : {(item.totalWins * 100 / item.totalPlays).toFixed(2)} %
                                                    </div>
                                                )
                                            })
                                        }

                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </Box>
        </>
    );

}

export default LivePlayPanel