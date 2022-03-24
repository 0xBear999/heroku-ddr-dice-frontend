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


const solConnection = new Connection(web3.clusterApiUrl(SOLANA_NETWORK));

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

interface Props {
  gameBalance: number;
  setGameBalance: (value: number) => void;
  handleMobileAppBarOpened: () => void;

}
const PageAppBar = (props: Props) => {


  const wallet = useWallet();
  const darkModeTheme = useAppSelector(selectDarkTheme);
  const dispatch = useAppDispatch();
  const [maxProfileDialogWidth, setMaxProfileDialogWidth] = React.useState<DialogProps['maxWidth']>('sm');
  const [maxProfilePicDialogWidth, setMaxProfilePicDialogWidth] = React.useState<DialogProps['maxWidth']>('xs');

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [userNFTInfo, setUserNFTInfo] = React.useState<any[]>([]);
  const [profileUsername, setProfileUsername] = React.useState('');
  const [profileUserPic, setProfileUserPic] = React.useState('');
  const [profileSelectedPic, setProfileSelectedPic] = React.useState('');
  const [profileInputedUsername, setProfileInputedUsername] = React.useState('');
  const [forceState, setForceState] = React.useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [openProfileDialog, setOpenProfileDialog] = React.useState(false);
  const [openProfilePicDialog, setOpenProfilePicDialog] = React.useState(false);
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

    var address = wallet.publicKey?.toBase58()
    var result = await axios.post(`${SERVER_ENDPOINT}/saveUserProfile`, {
      address: address,
      name: profileInputedUsername,
      pfp: profileSelectedPic
    })
    if (result.status !== 200) return;
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
  return (
    <div className={`${style.appBarPanel}`} >
      <div>
        <Button size="large" variant="outlined" endIcon={darkModeTheme ? <Brightness2Icon /> : <Brightness5Icon />} color="secondary" onClick={() => dispatch(toggleTheme())}>
          {
            darkModeTheme ? 'DARK' : 'LIGHT'
          }
        </Button>
      </div>
      <div>
        <Button
          id="demo-customized-button"
          aria-controls={open ? 'demo-customized-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          variant="contained"
          disableElevation
          onClick={handleClick}
          endIcon={<ArrowDropDownIcon />}
          size="large"
          style={{ marginRight: "20px" }}
        >
          Recent
        </Button>
        <StyledMenu
          id="demo-customized-menu"
          MenuListProps={{
            'aria-labelledby': 'demo-customized-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}

        >
          <MenuItem onClick={handleClose} disableRipple>
            Wallet (7cJg) flipped 0.05 and doubled.
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />

          <MenuItem onClick={handleClose} disableRipple>
            Solgroot flipped 0.05 and doubled 2 times
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleClose} disableRipple>
            Archive
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />

          <MenuItem onClick={handleClose} disableRipple>
            More
          </MenuItem>
        </StyledMenu>
        {
          wallet.connected &&

          <IconButton color="primary" aria-label="upload picture" component="span" className={`${style.userPfpWrapper}`} onClick={handleProfileDialogOpen}>
            <img src={profileUserPic === '' ? './img/dice-png.png' : profileUserPic} className={`${style.userPfp}`} />
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
              Dreamy since Mar 2022
            </p>
            <TextField id="outlined-basic" variant="outlined" onChange={(e) => handleChangeProfileUsername(e.target.value)} value={profileInputedUsername} />

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
    </div>

  )
}

export default PageAppBar;