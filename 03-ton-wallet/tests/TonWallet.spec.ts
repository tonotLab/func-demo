import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { TonWallet } from '../wrappers/TonWallet';

let wallet_code: Cell;
let blockchain: Blockchain;
let deployer: SandboxContract<TreasuryContract>;
let tonWallet: SandboxContract<TonWallet>;

describe('JettonMinter', () => {
    beforeAll(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        wallet_code = await compile('TonWallet');
        console.log(`deployer:${deployer.address}`);
    });

    beforeEach(async () => {
        //初始化合约
        tonWallet = blockchain.openContract(
            TonWallet.createFromConfig(
                {
                    contractId: Math.floor(Math.random() * 1000),
                    adminAddress: deployer.address,
                },
                wallet_code,
            ),
        );

        //部署
        const deployResult = await tonWallet.sendDeploy(deployer.getSender(), toNano('0.05'));
        //校验结果
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonWallet.address,
            deploy: true,
            success: true,
        });

        console.log(`tonWalletAddress:${tonWallet.address}`);
    });

    it('deposit test', async () => {
        const sender = deployer.getSender();
        const deposit_amount = toNano('0.1');
        const txRsp = await tonWallet.sendDeposit(sender, deposit_amount);

        expect(txRsp.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonWallet.address,
            success: true,
        });

        //query balance
        let contractBalance = await tonWallet.getContractBalance();
        console.log(`after deposit.  contractBalance:${contractBalance}`);
    });
});
