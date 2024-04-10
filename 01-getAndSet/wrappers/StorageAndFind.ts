import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export const Opcodes = {
    set_value: 0xd8267988
};

export type StorageAndFindConfig = { contract_id: number; current_value: number };

export function contractConfigToCell(config: StorageAndFindConfig): Cell {
    return beginCell().storeUint(config.contract_id, 32).storeUint(config.current_value, 32).endCell();
}

export class StorageAndFind implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new StorageAndFind(address);
    }

    static createFromConfig(config: StorageAndFindConfig, code: Cell, workchain = 0) {
        const data = contractConfigToCell(config);
        const init = { code, data };
        return new StorageAndFind(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendReqValue(
        provider: ContractProvider,
        via: Sender,
        opts: {
            newDataValue: number;
            value: bigint;
            queryID?: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.set_value, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.newDataValue, 32)
                .endCell(),
        });
    }

    async getCurrentValue(provider: ContractProvider) {
        const result = await provider.get('get_current_data', []);
        return result.stack.readNumber();
    }

    async getContractId(provider: ContractProvider) {
        const result = await provider.get('get_contract_id', []);
        return result.stack.readNumber();
    }
}
