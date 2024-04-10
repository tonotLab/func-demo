# TestTonToken

## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## How to use

### Build
 `yarn blueprint build JettonMinter`
 `yarn blueprint build JettonWallet`

### Test

`npx blueprint test` or `yarn blueprint test`

### Deploy

`npx blueprint run jetton.deploy --testnet --mnemonic`


### Mint token

`npx blueprint run jetton.mint --testnet  --mnemonic`


### Transfer token

`npx blueprint run jetton.transfer --testnet  --mnemonic`


### Query token

`npx blueprint run jetton.query --testnet  --mnemonic`