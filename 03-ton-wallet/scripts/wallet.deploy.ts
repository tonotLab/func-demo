import { Cell, toNano } from '@ton/core';
import '@ton/test-utils';
import { NetworkProvider, compile } from '@ton/blueprint';
import { TonWallet } from '../wrappers/TonWallet';

// run: npx blueprint run wallet.deploy --testnet --mnemonic
export async function run(provider: NetworkProvider) {
    let wallet_code: Cell = await compile('TonWallet');

    //owner address
    const ownerAddress = provider.sender().address;
    if (!ownerAddress) throw new Error('fail address');

    //deploy
    const tonWallet = provider.open(
        TonWallet.createFromConfig(
            {
                contractId: Math.floor(Math.random() * 1000),
                adminAddress: ownerAddress,
            },
            wallet_code,
        ),
    );

    await tonWallet.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(tonWallet.address);
    console.log(`contractAddress:${tonWallet.address}`);
}
