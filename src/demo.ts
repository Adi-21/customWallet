import * as bip39 from 'bip39';
import { hdkey } from 'ethereumjs-wallet';

const createMnemonic = async () => {
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const entropy = bip39.mnemonicToEntropy(mnemonic);
    const mnemonic1 = bip39.entropyToMnemonic(entropy);
    console.log({ mnemonic, mnemonic1, seed: seed.toString("hex"), entropy });
};

const createWallets = async (count = 1) => {
    const mnemonic = "aligator crocodile brother sister cousin family husband wife";
    const seed = (await bip39.mnemonicToSeed(mnemonic)).toString("hex");
    const masterWallet = hdkey.fromMasterSeed(Buffer.from(seed, "hex"));
    console.log(masterWallet.getWallet().getPrivateKeyString());
    console.log(masterWallet.getWallet().getPublicKeyString());

    const hdPath = `m/44'/60'/0'/0/`;

    for (let index = 0; index < count; index++) {
        const wallet = masterWallet.derivePath(hdPath + index).getWallet();
        const pri = wallet.getPrivateKeyString();
        const pub = wallet.getPublicKeyString();
        const add = wallet.getAddressString();
        console.log({ pri, pub, add });
    }
};

const createTransaction = async (fromAddress: string, toAddress: string, transferEtherAmount, senderPrivateKey: string) => {
    /** please visit https://app.zeeve.io in order to get the ethereum node endpoint*/
    const ethers = require('ethers');
    const url = 'https://app.zeeve.io/shared-api/eth/ae8b13a676cbd1201258614f173116507c922a8274883578/';
    const customHttpProvider = new ethers.JsonRpcProvider(url);
    /** price to commit any transaction */
    const gasPrice = await customHttpProvider.eth.getGasPrice();

    /**
     * maximum price in 'wei' to commit any transaction
     * and transactions are not allowed above price
     */
    const gasLimit = 3000000;

    /** number of transaction sent from the sender address */
    const nonce = await customHttpProvider.eth.getTransactionCount(fromAddress, "pending");

    /** ethereum network blockchain id */
    const chainId = await customHttpProvider.eth.getChainId();

    const convertedAmount = customHttpProvider.utils.toWei(transferEtherAmount, "ether");


    console.log({ gasPrice, nonce, chainId, convertedAmount });
    /**
     * creating the raw transaction hash by creating the transaction object
     * and signing it with the sender's private key
     */
    const { rawTransaction } = await customHttpProvider.eth.accounts.signTransaction(
        {
            to: toAddress,
            value: convertedAmount,
            gasPrice,
            gas: gasLimit,
            nonce,
            chainId,
        },
        senderPrivateKey
    );

    console.log({ rawTransaction });
    /**
     * sending the signed raw transaction hash
     * and fetching the transaction hash & block number on success
     */
    const txnDetails = await customHttpProvider.eth.sendSignedTransaction(
        rawTransaction
    );

    console.log(txnDetails);
};

createMnemonic();
createWallets(2);
createTransaction("0x20a6dB3f1c2d8a09659913CAd1048367d6F1ee16", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 0.001, "f08531a78307c394db7d7b267d9c32649218eec72442f88d7d1bc2d62378dcd1");