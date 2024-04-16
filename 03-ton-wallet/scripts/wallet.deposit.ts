import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TonWallet } from '../wrappers/TonWallet';

//Execute the "npx blueprint run wallet.deploy --testnet --mnemonic" to get the new token address
//Run:  npx blueprint run wallet.deposit --testnet  --mnemonic
const tonWalletAddress = Address.parse('EQB-_iBVS79NFQEb-KXjRAB5G6FmWaqcxQg5qYuaLIfiq_7s');
let senderAddress: any;

export async function run(provider: NetworkProvider) {
    senderAddress = provider.sender()?.address;
    if (!senderAddress) throw new Error('fail');

    // open Contract instance by address
    const tonWallet = provider.open(TonWallet.createFromAddress(tonWalletAddress));

    //send txs
    const deposit_amount = toNano('0.1');
    await tonWallet.sendDeposit(provider.sender(), deposit_amount);
}
