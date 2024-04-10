import { Address, OpenedContract, toNano } from '@ton/core';
import { StorageAndFind } from '../wrappers/StorageAndFind';
import { compile, NetworkProvider } from '@ton/blueprint';
let deployedContract: OpenedContract<StorageAndFind>;

//  npx blueprint run StorageAndFind-getValue --testnet
const contractAddress = Address.parse('EQD8gyVx_U1IOXlHCFwL5Ra3JxVpoZZTDixJ7k5vK7QFM3MA');
export async function run(provider: NetworkProvider) {
    // open Contract instance by address
    const deployedContract = provider.open(StorageAndFind.createFromAddress(contractAddress));

    //get value
    const contractId = await deployedContract.getContractId();
    const currentValue = await deployedContract.getCurrentValue();
    console.log(`contractId:${contractId} currentValue:${currentValue}`);
}
