/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React from 'react';

import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import {
  LAMPORTS_PER_SOL,
  Connection,
  PublicKey
} from "@solana/web3.js";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import { Wallet, web3 } from '@project-serum/anchor';
import { Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import TextField from '@mui/material/TextField';

import style from './PageAppBar.module.css'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { createSvgIcon } from '@mui/material/utils';
import Link from '@mui/material/Link';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useWallet } from "@solana/wallet-adapter-react";
import { errorAlert } from '../toastGroup';
import LoadingPage from "../LoadingPage";
import { HamburgerMenu } from './Hamburger';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { SOLANA_NETWORK, SERVER_ENDPOINT } from '../../contexts/config';

import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { selectDarkTheme, toggleTheme } from '../../redux/themeSlice';
import { selectLiveplay, toggleLiveplay } from '../../redux/liveplaySlice';

import DeleteIcon from '@mui/icons-material/Delete';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled, alpha } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { maxWidth } from '@mui/system';
import Tooltip from '@mui/material/Tooltip';
import {
  getParsedNftAccountsByOwner
} from "@nfteyez/sol-rayz";
import IconButton from '@mui/material/IconButton';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CasinoIcon from '@mui/icons-material/Casino';
import HelpIcon from '@mui/icons-material/Help';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import socketIOClient from "socket.io-client";
import ShowChartIcon from '@mui/icons-material/ShowChart';
const solConnection = new Connection(web3.clusterApiUrl(SOLANA_NETWORK));

interface Props {
  gameBalance: number;
  setGameBalance: (value: number) => void;
  handleMobileAppBarOpened: () => void;

}

const userPfp = [
  "./img/profile_pic1.PNG",
  "./img/profile_pic2.PNG",
  "./img/profile_pic3.PNG"
]

const socket = socketIOClient(SERVER_ENDPOINT);

const PageAppBar = (props: Props) => {


  const wallet = useWallet();
  const darkModeTheme = useAppSelector(selectDarkTheme);
  const liveplay = useAppSelector(selectLiveplay);

  const dispatch = useAppDispatch();
  const [maxProfileDialogWidth, setMaxProfileDialogWidth] = React.useState<DialogProps['maxWidth']>('sm');
  const [maxProfilePicDialogWidth, setMaxProfilePicDialogWidth] = React.useState<DialogProps['maxWidth']>('xs');
  const [maxHelpDialogWidth, setMaxHelpDialogWidth] = React.useState<DialogProps['maxWidth']>('lg');
  const [userNFTInfo, setUserNFTInfo] = React.useState<any[]>([]);
  const [profileUsername, setProfileUsername] = React.useState('');
  const [profileUserPic, setProfileUserPic] = React.useState('');
  const [profileSelectedPic, setProfileSelectedPic] = React.useState('');
  const [profileInputedUsername, setProfileInputedUsername] = React.useState('');
  const [forceState, setForceState] = React.useState(false);

  const [openProfileDialog, setOpenProfileDialog] = React.useState(false);
  const [openProfilePicDialog, setOpenProfilePicDialog] = React.useState(false);
  const [openHelpDialog, setOpenHelpDialog] = React.useState(false);
  const [openStatDialog, setOpenStatDialog] = React.useState(false);

  const [mostWinsInRowHistory, setMostWinsInRowHistory] = React.useState<any[]>([]);


  // 
  React.useEffect(() => {
    socket.on("update_stat_data", data => {
      console.log('socket stat data received : ', data);

      let mostPlays = (data.historyStat as any[]).sort((item1, item2) => {
        return item1.totalWins / item1.totalPlays > item2.totalWins / item2.totalPlays ? -1 : 1
      }).slice(0, 15);
      setMostWinsInRowHistory(mostPlays);
      // var array = (data.playTxs as any[]).map(item => Object.fromEntries(
      //   Object.entries(item).map(
      //     ([key, val]) => [key === 'player' ? 'timestamp' : key, val]
      //   )
      // ))
    });

    getStatData();

  }, [])

  const getStatData = async () => {
    let result = await axios.post(`${SERVER_ENDPOINT}/getStatData`);
    if (result.status !== 200) return;

    var mostPlays = (result.data.historyStat as any[]).sort((item1, item2) => {
      return item1.winsInRow > item2.winsInRow ? -1 : 1
    }).slice(0, 10);
    console.log(mostPlays)
    setMostWinsInRowHistory(mostPlays);
  }
  // 
  const handleProfileDialogClose = () => {
    setOpenProfileDialog(false)
  }

  const handleProfileDialogOpen = () => {
    setProfileInputedUsername(profileUsername)
    setProfileSelectedPic(profileUserPic)
    setOpenProfileDialog(true)
  }
  const handleProfilePicDialogClose = () => {
    setOpenProfilePicDialog(false)
  }
  const handleProfilePicDialogOpen = () => {

    handleProfileDialogClose();
    setOpenProfilePicDialog(true)
  }

  const goLivePlays = () => {
    dispatch(toggleLiveplay())
  }
  const goRolldice = () => {
    dispatch(toggleLiveplay())

  }

  const getNFTInfo = async () => {
    var holderAccount: any[] = [];

    if (!wallet.connected || !wallet.publicKey)
      return;
    var address = wallet.publicKey?.toBase58();
    const nftAccounts = await getParsedNftAccountsByOwner({ publicAddress: address, connection: solConnection });
    await Promise.allSettled(
      nftAccounts.map(async (holder) => {
        try {
          let res = await get_nft_api_rec(holder.data.uri, holder.mint);

          holderAccount.push({
            ...res,
            // nftname: nftAccounts[j].data.name,
            nftname: holder.data.name,
            nfturi: holder.data.uri,
            mint: holder.mint
          });

        } catch (e) {
          console.log(`   error occured ${e}`);
        };
      })
    );

    console.log(holderAccount)
    setUserNFTInfo(holderAccount);

  }

  async function get_nft_api_rec(url: any, mint: any) {

    try {
      const response = await axios.get(url);
      // console.log(response.data.collection.name + '-' + response.status)
      if (response.status == 200) {
        let ColName = '';
        let collectionName = '';
        let familyName = '';
        if (response.data.collection) {
          if (typeof (response.data.collection) === 'string') {
            collectionName = response.data.collection;
          } else if (response.data.collection.name) {
            collectionName = response.data.collection.name;
          }
          if (response.data.collection.family) {
            familyName = response.data.collection.family;
          }
        }

        if (ColName == '') {
          const colArray = response.data.name.split(" #");
          ColName = colArray['0'];
        }

        const nftArray = response.data.name.split("#");
        let nftName = nftArray['1'] ? nftArray['1'] : response.data.name;

        return {
          mint: mint,
          projectname: ColName ? ColName : '',
          collectionname: collectionName,
          familyname: familyName,
          nftname: nftName,
          image: response.data.image,
          symbol: response.data.symbol,
          url: url
        };
      }
    } catch (error) {
      console.error(error);
    }

  }

  const handleChangeProfileUsername = (value: any) => {
    setProfileInputedUsername(value);
  }

  const handleChangeSelectedProfilePic = (image: any, mint: any) => {
    handleProfileDialogOpen()
    handleProfilePicDialogClose()
    setProfileSelectedPic(image);
    setForceState(!forceState);
    console.log(image)
  }

  const getUserProfileData = async (address: string) => {
    var result = await axios.post(`${SERVER_ENDPOINT}/getUserProfile`, {
      address: address
    })
    if (result.status !== 200) return;
    setProfileUsername(result.data.name);
    setProfileInputedUsername(result.data.name);
    setProfileUserPic(result.data.pfp);
    setProfileSelectedPic(result.data.pfp);
    console.log(result, ' ::::: user profile data');

  }

  const saveProfileData = async () => {
    if (!wallet.publicKey || !profileInputedUsername || !profileInputedUsername.trim()) return;
    var address = wallet.publicKey.toBase58()
    var result = await axios.post(`${SERVER_ENDPOINT}/saveUserProfile`, {
      address: address,
      name: profileInputedUsername,
      pfp: profileSelectedPic
    })
    if (result.status !== 200) {
      errorAlert('error occured !');
      return;
    }
    setProfileUsername(profileInputedUsername);
    setProfileUserPic(profileSelectedPic);
    handleProfileDialogClose();
    console.log(result, ' ::::: user profile data');
  }

  React.useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      getNFTInfo();
      getUserProfileData(wallet.publicKey.toBase58());
    }
  }, [wallet.connected])

  const randomUserPfp = () => {
    let rantIdx = Math.floor(Math.random() * 3);
    return userPfp[rantIdx];
  }

  const handleOpenHelpDialog = () => {
    setOpenHelpDialog(true);
  }

  const handleHelpDialogClose = () => {
    setOpenHelpDialog(false);
  }
  const handleOpenStatDialog = () => {
    setOpenStatDialog(true);
  }

  const handleStatDialogClose = () => {
    setOpenStatDialog(false);
  }
  return (
    <div className={`${style.appBarPanel}`} >
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* <Button size="large" variant="outlined" endIcon={darkModeTheme ? <Brightness2Icon /> : <Brightness5Icon />} color="secondary" onClick={() => dispatch(toggleTheme())} className={`${style.desktopThemeToggleBtn}`}>
          {
            darkModeTheme ? 'DARK' : 'LIGHT'
          }
        </Button>
        {

          <IconButton color="secondary" aria-label="picture" component="span" className={`${style.mobileThemeToggleBtn}`} onClick={() => dispatch(toggleTheme())}>
            {darkModeTheme ? <Brightness2Icon /> : <Brightness5Icon />}
          </IconButton>
        } */}
        <Button
          id="openHow2Play"
          variant="contained"
          disableElevation
          onClick={handleOpenHelpDialog}
          // endIcon={ }
          size="large"
          style={{ marginRight: "20px" }}
          className={`${style.helpBtn}`}
        // className={`${style.desktop2ThemeToggleBtn}`}
        >
          How to Play
        </Button>

        <Button
          id="openHow2Play"
          variant="contained"
          disableElevation
          onClick={handleOpenStatDialog}
          // endIcon={ }
          size="large"
          style={{ marginRight: "20px" }}
          className={`${style.desktopThemeToggleBtn}`}
        // className={`${style.desktop2ThemeToggleBtn}`}
        >
          Leaderboards
        </Button>
        <IconButton color="secondary" aria-label="picture" component="span" className={`${style.mobileThemeToggleBtn}`} onClick={handleOpenStatDialog} style={{ marginRight: "20px" }}>
          <ShowChartIcon />
        </IconButton>
        {
          liveplay ?
            <>
              <Button
                id="goLivePlays"
                variant="contained"
                disableElevation
                onClick={goRolldice}
                // endIcon={ }
                size="large"
                style={{ marginRight: "20px" }}
                className={`${style.desktopThemeToggleBtn}`}
              // className={`${style.desktop2ThemeToggleBtn}`}
              >
                DICE ROLL
              </Button>
              <IconButton color="secondary" aria-label="picture" component="span" className={`${style.mobileThemeToggleBtn}`} onClick={goRolldice} style={{ marginRight: "20px" }}>
                <CasinoIcon />
              </IconButton>
            </> :
            <>
              <Button
                id="goLivePlays"
                variant="contained"
                disableElevation
                onClick={goLivePlays}
                // endIcon={ }
                size="large"
                style={{ marginRight: "20px" }}
                className={`${style.desktopThemeToggleBtn}`}
              // className={`${style.desktop2ThemeToggleBtn}`}
              >
                LIVEPLAYS
              </Button>
              <IconButton color="secondary" aria-label="picture" component="span" className={`${style.mobileThemeToggleBtn}`} onClick={goLivePlays} style={{ marginRight: "20px" }}>
                <DashboardIcon />
              </IconButton>
            </>
        }
      </div>
      <div>


        {
          wallet.connected &&

          <IconButton color="primary" aria-label="upload picture" component="span" className={`${style.userPfpWrapper}`} onClick={handleProfileDialogOpen}>
            <img src={profileUserPic === '' ? randomUserPfp() : profileUserPic} className={`${style.userPfp}`} />
          </IconButton>
        }
      </div>
      <Dialog
        open={openProfileDialog}
        onClose={handleProfileDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth={maxProfileDialogWidth}
      >
        <DialogContent>
          {/* <DialogContentText id="alert-dialog-description">
            
          </DialogContentText> */}
          <div className={`${style.profileDialogContentWrapper}`}>
            <p>
              USER PROFILE
            </p>
            <div style={{ position: 'relative' }}>
              <div className={`${style.profilePic}`}>
                <img src={profileSelectedPic} alt='dreamy dice logo' onClick={handleProfilePicDialogOpen}
                />
              </div>

              <span >CHANGE PICTURE</span>
            </div>


            <p>
              Dreamer since Mar 2022
            </p>
            <TextField id="outlined-basic" variant="outlined" onChange={(e) => handleChangeProfileUsername(e.target.value)} value={profileInputedUsername} placeholder="Nickname" />

          </div>

          <Button onClick={saveProfileData} autoFocus fullWidth size="large" variant="contained" style={{ marginTop: "20px" }}>
            Save
          </Button>
        </DialogContent>

      </Dialog>

      <Dialog
        open={openProfilePicDialog}
        onClose={handleProfilePicDialogClose}
        aria-labelledby="profilePic-dialog-title"
        aria-describedby="profilePic-dialog-description"
        maxWidth={maxProfilePicDialogWidth}
      >
        <DialogContent>
          {/* <DialogContentText id="alert-dialog-description">
            
          </DialogContentText> */}
          <div>
            <p>
              SELECT NFT PFP
            </p>

            {
              wallet.connected && userNFTInfo.length > 0 ?
                <div className={`${style.pfpImgWrapper}`}>
                  {
                    userNFTInfo.map((value, index) => {
                      return (
                        <div key={index} className={`${style.userNFTsImgWrapper}`}>
                          <img src={`${value.image}`} className={`${style.imgPfp}`} onClick={() => handleChangeSelectedProfilePic(value.image, value.mint)} />
                        </div>
                      )
                    })
                  }
                </div> :
                <div>
                  <p>
                    NO NFT PICTURES FOUND!
                  </p>
                </div>
            }
          </div>
        </DialogContent>
      </Dialog>

      {/* help dialog */}
      <Dialog
        open={openHelpDialog}
        onClose={handleHelpDialogClose}
        aria-labelledby="help-dialog-title"
        aria-describedby="help-dialog-description"
        maxWidth={maxHelpDialogWidth}

      >
        <DialogContent>
          {/* <DialogContentText id="alert-dialog-description">
            
          </DialogContentText> */}
          <div className={`${style.helpDialogContent}`}>
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

      {/* stat dialog */}
      <Dialog
        open={openStatDialog}
        onClose={handleStatDialogClose}
        aria-labelledby="stat-dialog-title"
        aria-describedby="stat-dialog-description"
        maxWidth={maxHelpDialogWidth}

      >
        <DialogContent>
          {/* <DialogContentText id="alert-dialog-description">
            
          </DialogContentText> */}
          <div className={`${style.statDialogContent}`}>
            <h3>
              Top Streaks
            </h3>
            <List sx={{ bgcolor: 'background.secondary', border: '1px solid', borderColor: 'border.secondary' }} className={`${style.winsInRowList}`}>
              {mostWinsInRowHistory && mostWinsInRowHistory.length > 0 &&
                mostWinsInRowHistory.map((item, index) => {
                  var timeAgo = new Date().getTime() / 1000 - item.timestamp;
                  var agoString = '';
                  if (timeAgo < 60) agoString = 'in ' + Math.ceil(timeAgo) + ' seconds ago';
                  if (timeAgo >= 60 && timeAgo < 120) agoString = '' + Math.floor(timeAgo / 60) + ' minute ago'
                  if (timeAgo >= 120 && timeAgo < 3600) agoString = '' + Math.floor(timeAgo / 60) + ' minutes ago'
                  if (timeAgo >= 3600 && timeAgo < 7200) agoString = '' + Math.floor(timeAgo / 3600) + ' hour ago'
                  if (timeAgo >= 7200 && timeAgo < 86400) agoString = '' + Math.floor(timeAgo / 3600) + ' hours ago'
                  if (timeAgo >= 86400) agoString = '' + Math.ceil(timeAgo / 86400) + ' days ago'
                  if (timeAgo >= 86400 * 30) agoString = '' + Math.ceil(timeAgo / 86400 / 30) + ' months ago'
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
                          <ListItemText   >

                            {item.name} <span style={{ color: "green" }}> Doubled {item.winsInRow} times </span>


                          </ListItemText>
                        </ListItemButton>

                      </ListItem>
                      {
                        index !== mostWinsInRowHistory.length - 1 &&
                        <Divider />
                      }
                    </>
                  )
                })
              }
            </List>
            {
              console.log(mostWinsInRowHistory, "::mostWinHistory")
            }

          </div>
        </DialogContent>
      </Dialog>
    </div>

  )
}

export default PageAppBar;