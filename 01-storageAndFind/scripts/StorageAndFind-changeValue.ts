import { Address, OpenedContract, toNano } from '@ton/core';
import { StorageAndFind } from '../wrappers/StorageAndFind';
import { compile, NetworkProvider } from '@ton/blueprint';
let deployedContract: OpenedContract<StorageAndFind>;


//  npx blueprint run StorageAndFind-changeValue --testnet
const contractAddress = Address.parse('EQD8gyVx_U1IOXlHCFwL5Ra3JxVpoZZTDixJ7k5vK7QFM3MA');
export async function run(provider: NetworkProvider) {
    // open Contract instance by address
    const deployedContract = provider.open(StorageAndFind.createFromAddress(contractAddress));

    //change value
    const newDataValue = Math.floor(Math.random() * 100);
    console.log(`will set new value:${newDataValue}`);
    await deployedContract.sendReqValue(provider.sender(), {
        newDataValue,
        value: toNano('0.05'),
    });
}
