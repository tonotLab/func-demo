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
import { Op } from './TonWalletConstants';

export type TonWalletConfig = { contractId: number; adminAddress: Address };

export function tonWalletConfigToCell(config: TonWalletConfig): Cell {
    return beginCell().storeInt(config.contractId,32).storeAddress(config.adminAddress).endCell();
}

export class TonWallet implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new TonWallet(address);
    }

    static createFromConfig(config: TonWalletConfig, code: Cell, workchain = 0) {
        const data = tonWalletConfigToCell(config);
        const init = { code, data };
        return new TonWallet(contractAddress(workchain, init), init);
    }

    async sendDeposit(provider: ContractProvider, via: Sender, deposit_amount: bigint) {
        if (deposit_amount <= 0) {
            throw new Error('Ton amount should be > 0');
        }
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Op.depsoit, 32) // jetton 转账操作码
                .storeUint(0, 64) // query_id:uint64
                .endCell(),
            value: deposit_amount + toNano('0.015'),
        });
    }

    static withdrawMessage(withdraw_amount: number, query_id: number | bigint = 0) {
        const body = beginCell()
            .storeUint(Op.withdraw, 32) // 操作码
            .storeUint(query_id, 64) // query_id:uint64
            .storeCoins(withdraw_amount)
            .endCell();
        return body;
    }
    async sendWithdraw(provider: ContractProvider, via: Sender, withdraw_amount: bigint) {
        if (withdraw_amount <= 0) {
            throw new Error('Ton amount should be > 0');
        }
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Op.withdraw, 32) // 操作码
                .storeUint(0, 64) // query_id:uint64
                .storeCoins(withdraw_amount)
                .endCell(),
            value: toNano('0.015'),
        });
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getContractBalance(provider: ContractProvider) {
        const result = await provider.get('get_contract_balance', []);
        return result.stack.readNumber();
    }
    
    async getAdminAddress(provider: ContractProvider) {
        const result = await provider.get('get_admin_address', []);
        return result.stack.readAddress();
    }

    async getContractId(provider: ContractProvider) {
        const result = await provider.get('get_contract_id', []);
        return result.stack.readBigNumber();
    }



    
}
