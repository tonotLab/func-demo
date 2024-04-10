import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, ContractProvider, OpenedContract, fromNano, toNano } from '@ton/core';
import { Address as TonAddress, Cell as TonCell } from 'ton';
import { StorageAndFind } from '../wrappers/StorageAndFind';
import '@ton/test-utils';
import { NetworkProvider, compile } from '@ton/blueprint';


//  npx blueprint run StorageAndFind-deploy --testnet
export async function run(provider: NetworkProvider) {
    let blockchain: Blockchain = await Blockchain.create();

    //init contract
    const contract_id = Math.floor(Math.random() * 100000);
    let contract_code: Cell = await compile('StorageAndFind');

    let deployedContract: SandboxContract<StorageAndFind> = blockchain.openContract(
        StorageAndFind.createFromConfig(
            {
                contract_id: contract_id,
                current_value: 0,
            },
            contract_code,
        ),
    );

    //deploy
    await deployedContract.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(deployedContract.address);
    console.log('deployedContract.address', deployedContract.address);
}
