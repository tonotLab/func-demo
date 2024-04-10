import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { JettonMinter } from '../wrappers/JettonMinter';
import { JettonWallet } from '../wrappers/JettonWallet';

//Execute the "npx blueprint run jetton.deploy --testnet  --mnemonic" to get the new token address
//Run:  npx blueprint run jetton.transfer --testnet  --mnemonic
const jettonTokenAddress = Address.parse('EQAPsiC1aSRq488LmNJsYKFDG_oOX8I-I_NBtnEuRga-3nsV');
let senderAddress: any;
let sendTo: Address = Address.parse('EQBKzR0_xH-NX5a_s9nze06GUte6rCOaZABOiC8E6OAnpbU5');

export async function run(provider: NetworkProvider) {
    senderAddress = provider.sender()?.address;
    if (!senderAddress) throw new Error('fail');

    // open Contract instance by address
    const jettonMinter = provider.open(JettonMinter.createFromAddress(jettonTokenAddress));

    //init sender wallet contract
    const senderWalletContarctAddress = await jettonMinter.getWalletContractAddress(senderAddress);
    const senderWalletContract = provider.open(JettonWallet.createFromAddress(senderWalletContarctAddress));

    //send jetton
    const transferAmount = toNano('2');
    const forward_ton_amount = toNano('0.05');
    const total_ton_amount = toNano('0.1');
    await senderWalletContract.sendTransfer(
        provider.sender(),
        sendTo,
        transferAmount,
        forward_ton_amount,
        total_ton_amount,
    );
}
