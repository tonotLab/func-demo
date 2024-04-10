import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { JettonMinter } from '../wrappers/JettonMinter';

//Execute the "npx blueprint run jetton.deploy --testnet  --mnemonic" to get the new token address
//Run:  npx blueprint run jetton.mint --testnet  --mnemonic
const jettonTokenAddress: Address = Address.parse('EQAPsiC1aSRq488LmNJsYKFDG_oOX8I-I_NBtnEuRga-3nsV');
let mintTo: any; //default is owner
export async function run(provider: NetworkProvider) {
    mintTo = provider.sender()?.address;
    if (!mintTo) throw new Error('fail');

    // open Contract instance by address
    const jettonMinter = provider.open(JettonMinter.createFromAddress(jettonTokenAddress));

    //mint
    const mintAmount = toNano('200');
    const mintToAddress = mintTo; //接收者的钱包地址
    const forward_ton_amount = toNano('0.05');
    const total_ton_amount = toNano('0.1');
    await jettonMinter.sendMint(provider.sender(), mintToAddress, mintAmount, forward_ton_amount, total_ton_amount);
}
