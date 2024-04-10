import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    toNano,
} from '@ton/core';
import { Op } from './JettonConstants';

export type JettonWalletConfig = {};

export function jettonWalletConfigToCell(config: JettonWalletConfig): Cell {
    return beginCell().endCell();
}

export class JettonWallet implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new JettonWallet(address);
    }

    static createFromConfig(config: JettonWalletConfig, code: Cell, workchain = 0) {
        const data = jettonWalletConfigToCell(config);
        const init = { code, data };
        return new JettonWallet(contractAddress(workchain, init), init);
    }

    static transferMessage(
        from: Address,
        to: Address,
        jetton_amount: bigint,
        forward_ton_amount: bigint,
        query_id: number | bigint = 0,
    ) {
        const body = beginCell()
            .storeUint(Op.transfer, 32) // jetton 转账操作码
            .storeUint(query_id, 64) // query_id:uint64
            .storeCoins(jetton_amount) // amount:(VarUInteger 16) -  转账的 Jetton 金额（小数位 = 6 - jUSDT, 9 - 默认）
            .storeAddress(to) // destination:MsgAddress
            .storeAddress(from) // response_destination:MsgAddress
            .storeUint(0, 1) // custom_payload:(Maybe ^Cell)
            .storeCoins(forward_ton_amount) // forward_ton_amount:(VarUInteger 16)
            .storeUint(0, 1) // forward_payload:(Either Cell ^Cell)
            .endCell();
        return body;
    }
    async sendTransfer(
        provider: ContractProvider,
        via: Sender,
        to: Address,
        jetton_amount: bigint,
        forward_ton_amount: bigint,
        total_ton_amount: bigint,
    ) {
        if (total_ton_amount <= forward_ton_amount) {
            throw new Error('Total ton amount should be > forward amount');
        }
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonWallet.transferMessage(this.address, to, jetton_amount, forward_ton_amount),
            value: total_ton_amount + toNano('0.015'),
        });
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getWalletData(provider: ContractProvider) {
        let res = await provider.get('get_wallet_data', []);
        console.log('res:' + res);

        let balance = res.stack.readBigNumber();
        let ownerAddress = res.stack.readAddress();
        let jettonMasterAddress = res.stack.readAddress();
        let walletCode = res.stack.readCell();

        return {
            balance,
            ownerAddress,
            jettonMasterAddress,
            walletCode,
        };
    }

    async getBalance(provider: ContractProvider) {
        let res = await this.getWalletData(provider);
        return res.balance;
    }

    async getOwner(provider: ContractProvider) {
        let res = await this.getWalletData(provider);
        return res.ownerAddress;
    }
}
