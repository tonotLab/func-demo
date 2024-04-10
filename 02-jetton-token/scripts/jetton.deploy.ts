import { Cell, toNano } from '@ton/core';
import '@ton/test-utils';
import { NetworkProvider, compile } from '@ton/blueprint';
import { buildOnchainMetadata } from './utils/jetton-helpers';
import { JettonMinter } from '../wrappers/JettonMinter';

// run: npx blueprint run jetton.deploy --testnet --mnemonic
export async function run(provider: NetworkProvider) {
    let minter_code: Cell = await compile('JettonMinter');
    let wallet_code: Cell = await compile('JettonWallet');

    //owner address
    const ownerAddress = provider.sender().address;
    if (!ownerAddress) throw new Error('fail address');

    //init param
    const numStart = Math.floor(Math.random() * 1000);
    const numEnd = Math.floor(Math.random() * 1000);
    const jettonName = `${numStart} My Jetton ${numEnd}`;

    const jettonParams = {
        name: jettonName,
        description: `This is my random jetton write by Func-lang ${Date.now()}`,
        symbol: `${numStart}MSJD${numEnd}`,
        image: 'https://avatars.githubusercontent.com/u/104382459?s=200&v=4',
    };
    let content = buildOnchainMetadata(jettonParams);
    // let max_supply = toNano(123456766689011);

    //init minter
    const jettonMinter = provider.open(
        JettonMinter.createFromConfig(
            {
                admin: ownerAddress,
                content: content,
                wallet_code: wallet_code,
            },
            minter_code,
        ),
    );

    await jettonMinter.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(jettonMinter.address);
    console.log(`jettonAddress:${jettonMinter.address}`);
}
