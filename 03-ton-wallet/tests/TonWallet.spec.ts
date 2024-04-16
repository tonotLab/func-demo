import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { TonWallet } from '../wrappers/TonWallet';

let wallet_code: Cell;
let blockchain: Blockchain;
let deployer: SandboxContract<TreasuryContract>;
let tonWallet: SandboxContract<TonWallet>;

describe('TonWallet', () => {
    beforeAll(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        wallet_code = await compile('TonWallet');
        console.log(`deployer:${deployer.address}`);
    });

    beforeEach(async () => {
        //初始化合约
        const contractId = Math.floor(Math.random() * 1000);
        console.log(`contractId:${contractId}`);
        tonWallet = blockchain.openContract(
            TonWallet.createFromConfig(
                {
                    contractId: contractId,
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

        let queryContractId = await tonWallet.getContractId();
        let contractAdmin = await tonWallet.getAdminAddress();
        console.log(`tonWalletAddress:${tonWallet.address} queryContractId:${queryContractId} admin:${contractAdmin}`);
    });

    it('deposit and withdraw test', async () => {
        const sender = deployer.getSender();
        const deposit_amount = toNano('0.5');
        const txRsp = await tonWallet.sendDeposit(sender, deposit_amount);
        expect(txRsp.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonWallet.address,
            success: true,
        });

        //query balance
        let contractBalance = await tonWallet.getContractBalance();
        console.log(`after deposit.  contractBalance:${contractBalance}`);

        // withdraw
        const withdraw_amount = toNano('0.2');
        const txWithdrawRsp = await tonWallet.sendWithdraw(sender, withdraw_amount);
        expect(txWithdrawRsp.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonWallet.address,
            success: true,
        });

        //query balance
        contractBalance = await tonWallet.getContractBalance();
        console.log(`after withdraw.  contractBalance:${contractBalance}`);
    });
});
