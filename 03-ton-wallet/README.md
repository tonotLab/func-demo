# TestTonToken

## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## How to use

### Build
 `yarn blueprint build TonWallet`
 `yarn blueprint build JettonWallet`

### Test

`npx blueprint test` or `yarn blueprint test`

### Deploy

`npx blueprint run wallet.deploy --testnet --mnemonic`


### Deposit

`npx blueprint run wallet.deposit --testnet  --mnemonic`


### Withdraw ton

`npx blueprint run wallet.withdraw --testnet  --mnemonic`


### Query token

`npx blueprint run wallet.query --testnet  --mnemonic`



## Reference connection
* IDO： `https://verifier.ton.org/EQAK30gSv6-eU9jkx5LL7yEYS2LcKfWssxC2dPComW1AR4IU`