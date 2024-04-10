import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { JettonMinter } from '../wrappers/JettonMinter';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { JettonWallet } from '../wrappers/JettonWallet';
import { buildOnchainMetadata } from '../scripts/utils/jetton-helpers';

let wallet_code: Cell;
let minter_code: Cell;
let blockchain: Blockchain;
let deployer: SandboxContract<TreasuryContract>;
let jettonMinter: SandboxContract<JettonMinter>;

describe('JettonMinter', () => {
    beforeAll(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        wallet_code = await compile('JettonWallet');
        minter_code = await compile('JettonMinter');
        console.log(`deployer:${deployer.address}`);
    });

    beforeEach(async () => {
        const exampleMeta = {
            name: 'Sample Ton Jetton',
            description: 'Sample of Ton Jetton',
            symbol: 'SOTJ',
            decimals: '9',
            image: 'https://www.svgrepo.com/download/483336/coin-vector.svg',
        };
        let contentFinal = buildOnchainMetadata(exampleMeta);

        //初始化minter合约
        jettonMinter = blockchain.openContract(
            JettonMinter.createFromConfig(
                {
                    admin: deployer.address,
                    content: contentFinal,
                    wallet_code: wallet_code,
                },
                minter_code,
            ),
        );

        //部署
        const deployResult = await jettonMinter.sendDeploy(deployer.getSender(), toNano('0.05'));
        //校验结果
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonMinter.address,
            deploy: true,
            success: true,
        });

        console.log(`jettonMinterAddress:${jettonMinter.address}`);
    });

    it('mint test', async () => {
        //mint
        const sender = deployer.getSender();
        const mintAmount = toNano('18');
        // const mintTo = Address.parse('EQB5l3xDhlFh19gJQQQ0md9xBM68RvEfamFupgIjWSIQHuUM'); //接收者的钱包地址
        const mintToAddress = deployer.address; //接收者的钱包地址
        const forward_ton_amount = toNano('0.05');
        const total_ton_amount = toNano('0.1');
        const mintRsp = await jettonMinter.sendMint(
            sender,
            mintToAddress,
            mintAmount,
            forward_ton_amount,
            total_ton_amount,
        );

        expect(mintRsp.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonMinter.address,
            success: true,
        });

        // //transfer
        const senderWalletContarctAddress = await jettonMinter.getWalletContractAddress(mintToAddress);
        const senderWalletContract = blockchain.openContract(
            JettonWallet.createFromAddress(senderWalletContarctAddress),
        );

        //query balance
        let senderBalance = await senderWalletContract.getBalance();
        let senderAddress = await senderWalletContract.getOwner();
        console.log(
            `after mint and before send.  sendeBalance:${senderBalance} senderAddress:${senderAddress} senderWallet:${senderWalletContarctAddress}`,
        );

        const receiptor = await blockchain.treasury('receiptor');
        const transferTo = receiptor.address;
        const transferAmount = toNano('2');
        await senderWalletContract.sendTransfer(
            sender,
            transferTo,
            transferAmount,
            forward_ton_amount,
            total_ton_amount,
        );
        expect(mintRsp.transactions).toHaveTransaction({ success: true });

        //query balance
        senderBalance = await senderWalletContract.getBalance();
        const receiptorWalletContarctAddress = await jettonMinter.getWalletContractAddress(receiptor.address);
        const receiptorWalletContract = blockchain.openContract(
            JettonWallet.createFromAddress(receiptorWalletContarctAddress),
        );
        let receiptorBalance = await receiptorWalletContract.getBalance();
        console.log(`after send senderBalance:${senderBalance} receiptorBalance:${receiptorBalance}`);
    });
});
