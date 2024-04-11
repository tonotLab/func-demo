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
    return beginCell().storeBit(config.contractId).storeAddress(config.adminAddress).endCell();
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

    static depositMessage(query_id: number | bigint = 0) {
        const body = beginCell()
            .storeUint(Op.depsoit, 32) // jetton 转账操作码
            .storeUint(query_id, 64) // query_id:uint64
            .endCell();
        return body;
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
}
