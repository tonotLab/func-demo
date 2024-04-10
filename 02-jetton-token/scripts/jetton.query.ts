import { Address } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { JettonMinter } from '../wrappers/JettonMinter';
import { JettonWallet } from '../wrappers/JettonWallet';

//Execute the "npx blueprint run jetton.deploy --testnet  --mnemonic" to get the new token address
//Run:  npx blueprint run jetton.query --testnet  --mnemonic
const jettonTokenAddress = Address.parse('EQAPsiC1aSRq488LmNJsYKFDG_oOX8I-I_NBtnEuRga-3nsV');
const userAddress = Address.parse('EQBKzR0_xH-NX5a_s9nze06GUte6rCOaZABOiC8E6OAnpbU5');

export async function run(provider: NetworkProvider) {
    // token owner
    const jettonMinter = provider.open(JettonMinter.createFromAddress(jettonTokenAddress));
    const owner = await jettonMinter.getAdminAddress();
    console.log(`owner:${owner}`);

    //total supply
    const supplyBefore = await jettonMinter.getTotalSupply();
    console.log(`totalSupply:${supplyBefore}`);

    //query balance
    const userWalletContarctAddress = await jettonMinter.getWalletContractAddress(userAddress);
    const userWalletContract = provider.open(JettonWallet.createFromAddress(userWalletContarctAddress));
    const userBalance = await userWalletContract.getBalance();
    console.log(`user:${userAddress} userWallet:${userWalletContarctAddress} userBalance:${userBalance}`);
}
