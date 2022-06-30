import { Program, web3 } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import {
    Keypair,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    AccountInfo,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout, MintLayout, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WalletContextState } from '@solana/wallet-adapter-react';

import fs from 'fs';
import { AccountData, GlobalPool, PlayerPool } from './types';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

const PLAYER_POOL_SIZE = 104;
const GLOBAL_AUTHORITY_SEED = "global-authority";
const VAULT_AUTHORITY_SEED = "vault-authority";
const ACCOUNT_SEED = "account-data"
const RANDOM_SEED = "set-random-number";

const PROGRAM_ID = "FbudCGq7GiwGhUV3kEaFWfyFE1Lbxs6VNcdn5Jo14nJQ";
const TRESURY_WALLET = new PublicKey("Fs8R7R6dP3B7mAJ6QmWZbomBRuTbiJyiR4QYjoxhLdPu");
import { SOLANA_NETWORK } from './config'
import { IDL } from './ddr_dice';
import { errorAlert, successAlert } from '../components/toastGroup';


// Configure the client to use the local cluster.
// const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve("/home/fury/.config/solana/id.json"), 'utf-8'))), { skipValidation: true });

// Address of the deployed program.

// Generate the program client from IDL.

export const solConnection = new web3.Connection(web3.clusterApiUrl(SOLANA_NETWORK));

// anchor.setProvider(anchor.Provider.local(web3.clusterApiUrl('devnet')));
// const solConnection = anchor.getProvider().connection;
// const payer = anchor.getProvider().wallet;
// let rewardVault: PublicKey = null;
// let program: Program = null;
// const programId = new anchor.web3.PublicKey(PROGRAM_ID);
// program = new anchor.Program(IDL, programId);
// console.log('ProgramId: ', program.programId.toBase58());

export const initProject = async (
    wallet: WalletContextState
) => {
    if (!wallet.publicKey) return;
    let cloneWindow: any = window;

    try {

        let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        const [globalAuthority, bump] = await PublicKey.findProgramAddress(
            [Buffer.from(GLOBAL_AUTHORITY_SEED)],
            program.programId
        );
        const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
            [Buffer.from(VAULT_AUTHORITY_SEED)],
            program.programId
        );
        console.log(rewardVault);

        const tx = await program.rpc.initialize(
            bump, vaultBump, {
            accounts: {
                admin: wallet.publicKey,
                globalAuthority,
                rewardVault: rewardVault,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            },
            signers: [],
        });
        await solConnection.confirmTransaction(tx, "confirmed");
        await new Promise((resolve, reject) => {
            solConnection.onAccountChange(globalAuthority, (data: AccountInfo<Buffer> | null) => {
                if (!data) reject();
                resolve(true);
            });
        });
        successAlert("Success. txHash=" + tx);

        console.log("txHash =", tx);
        return false;
    } catch (error) {
        console.log(error)
    }
}


export const initUserPool = async (
    wallet: WalletContextState,
) => {
    let userAddress = wallet.publicKey
    if (!userAddress) return
    let cloneWindow: any = window

    try {
        let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        let playerPoolKey = await PublicKey.createWithSeed(
            userAddress,
            "player-pool",
            program.programId,
        );
        console.log(playerPoolKey.toBase58());

        let ix = SystemProgram.createAccountWithSeed({
            fromPubkey: userAddress,
            basePubkey: userAddress,
            seed: "player-pool",
            newAccountPubkey: playerPoolKey,
            lamports: await solConnection.getMinimumBalanceForRentExemption(PLAYER_POOL_SIZE),
            space: PLAYER_POOL_SIZE,
            programId: program.programId,
        });


        const tx = await program.rpc.initializePlayerPool(
            {
                accounts: {
                    owner: userAddress,
                    playerPool: playerPoolKey,
                },
                instructions: [
                    ix
                ],
                signers: []
            });
        await solConnection.confirmTransaction(tx, "confirmed");

        console.log("Your transaction signature", tx);
    } catch (error) {
        console.log(error)
    }
}

export const playGame = async (wallet: WalletContextState, setNum: number, deposit: number, setCurSolBalance: Function, setLoading: Function) => {
    let userAddress = wallet.publicKey as PublicKey
    if (!userAddress) return

    try {

        let cloneWindow: any = window
        let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        const [globalAuthority, bump] = await PublicKey.findProgramAddress(
            [Buffer.from(GLOBAL_AUTHORITY_SEED)],
            program.programId
        );
        console.log('GlobalAuthority: ', globalAuthority.toBase58());

        const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
            [Buffer.from(VAULT_AUTHORITY_SEED)],
            program.programId
        );
        console.log('RewardVault: ', rewardVault.toBase58());

        let playerPoolKey = await PublicKey.createWithSeed(
            userAddress,
            "player-pool",
            program.programId,
        );
        console.log(playerPoolKey.toBase58());

        let poolAccount = await solConnection.getAccountInfo(playerPoolKey);
        if (poolAccount === null || poolAccount.data === null) {
            console.log('init');
            await initUserPool(wallet);
        }

        const tx = await program.rpc.playGame(
            bump, vaultBump, new anchor.BN(setNum), new anchor.BN(deposit * 1000000000), {
            accounts: {
                owner: userAddress,
                playerPool: playerPoolKey,
                globalAuthority,
                rewardVault: rewardVault,
                treasuryWallet1: TRESURY_WALLET,
                treasuryWallet2: TRESURY_WALLET,
                treasuryWallet3: TRESURY_WALLET,
                treasuryWallet4: TRESURY_WALLET,
                treasuryWallet5: TRESURY_WALLET,
                treasuryWallet6: TRESURY_WALLET,
                treasuryWallet7: TRESURY_WALLET,
                treasuryWallet8: TRESURY_WALLET,
                treasuryWallet9: TRESURY_WALLET,
                treasuryWallet10: TRESURY_WALLET,
                systemProgram: SystemProgram.programId,
            },
            signers: [],
        });
        setCurSolBalance();
        setLoading();
        await solConnection.confirmTransaction(tx, "finalized");
        let userPoolData = await program.account.playerPool.fetch(playerPoolKey);
        console.log(userPoolData.gameData);
        return userPoolData.gameData;
    } catch (error) {
        errorAlert(error as string)
        console.log(error)
        return -1;
    }
}

export const claim = async (wallet: WalletContextState, startLoading: Function, endLoading: Function) => {
    let userAddress = wallet.publicKey as PublicKey;
    if (!userAddress) return;

    try {
        let cloneWindow: any = window;
        let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        const [globalAuthority, bump] = await PublicKey.findProgramAddress(
            [Buffer.from(GLOBAL_AUTHORITY_SEED)],
            program.programId
        );
        console.log('GlobalAuthority: ', globalAuthority.toBase58());

        const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
            [Buffer.from(VAULT_AUTHORITY_SEED)],
            program.programId
        );

        let playerPoolKey = await PublicKey.createWithSeed(
            userAddress,
            "player-pool",
            program.programId,
        );
        console.log(playerPoolKey.toBase58());

        const tx = await program.rpc.claimReward(
            bump, vaultBump, {
            accounts: {
                owner: userAddress,
                playerPool: playerPoolKey,
                globalAuthority,
                rewardVault: rewardVault,
                systemProgram: SystemProgram.programId,
            }
        });
        startLoading();
        await solConnection.confirmTransaction(tx, "singleGossip");
        // successAlert('Successfully Claim!')
        endLoading();
        console.log("CLaim Succeed!=========================");
    } catch (error) {
        console.log(error)
        errorAlert(error as string)
        return;
    }

}

export const withDraw = async (wallet: WalletContextState, deposit: number) => {
    let userAddress = wallet.publicKey as PublicKey
    if (!userAddress) return

    try {

        let cloneWindow: any = window
        let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())

        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        const [globalAuthority, bump] = await PublicKey.findProgramAddress(
            [Buffer.from(GLOBAL_AUTHORITY_SEED)],
            program.programId
        );
        console.log('GlobalAuthority: ', globalAuthority.toBase58());

        const [rewardVault, vaultBump] = await PublicKey.findProgramAddress(
            [Buffer.from(VAULT_AUTHORITY_SEED)],
            program.programId
        );

        const tx = await program.rpc.withdraw(
            bump, vaultBump, new anchor.BN(deposit * 1000000000), {
            accounts: {
                admin: userAddress,
                globalAuthority,
                rewardVault: rewardVault,
                systemProgram: SystemProgram.programId,
            }
        });


        await solConnection.confirmTransaction(tx, "singleGossip");
        successAlert("Successfully Withdraw!")
        console.log("WithDraw Succeed!=========================");
        return deposit;
    } catch (error) {
        errorAlert(error as string)
        console.log(error)
    }

}


export const getGlobalState = async (
): Promise<GlobalPool | null> => {
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );

    try {
        let globalState = await program.account.globalPool.fetch(globalAuthority);
        return globalState as GlobalPool;
    } catch {
        return null;
    }
}

export const getUserPoolState = async (
    userAddress: PublicKey
): Promise<PlayerPool | null> => {
    if (!userAddress) return null;
    let cloneWindow: any = window;
    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

    let playerPoolKey = await PublicKey.createWithSeed(
        userAddress,
        "player-pool",
        program.programId,
    );
    console.log('Player Pool: ', playerPoolKey.toBase58());
    try {
        let poolState = await program.account.playerPool.fetch(playerPoolKey);
        return poolState as PlayerPool;
    } catch {
        return null;
    }
}

