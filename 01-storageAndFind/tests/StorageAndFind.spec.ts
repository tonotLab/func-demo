import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { StorageAndFind } from '../wrappers/StorageAndFind';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('StorageAndFind', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('StorageAndFind');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let deployedContract: SandboxContract<StorageAndFind>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        const contract_id = Math.floor(Math.random() * 100000);
        deployedContract = blockchain.openContract(
            StorageAndFind.createFromConfig({ contract_id: contract_id, current_value: 0 }, code),
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await deployedContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: deployedContract.address,
            deploy: true,
            success: true,
        });
        console.log(`contractAddress:${deployedContract.address}`);
    });

    it('change value test', async () => {
        const newDataValue = Math.floor(Math.random() * 100);
        console.log(`will set new value:${newDataValue}`);
        const txRsp = await deployedContract.sendReqValue(deployer.getSender(), {
            newDataValue,
            value: toNano('0.05'),
        });

        expect(txRsp.transactions).toHaveTransaction({
            from: deployer.address,
            to: deployedContract.address,
            success: true,
        });

        const contractId = await deployedContract.getContractId();
        const currentValue = await deployedContract.getCurrentValue();
        console.log(`contractId:${contractId} currentValue:${currentValue}`);
    });
});
