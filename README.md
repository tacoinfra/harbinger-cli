# Harbinger CLI

## About 

`harbinger-cli` is the source for a command line utility called `harbinger`. The CLI is a node binary package written in typescript that contains functionality for working with the [Harbinger Oracle](https://github.com/tacoinfra/harbinger). To get started with Harbinger, visit the [main documentation](https://github.com/tacoinfra/harbinger).

This library provides functionality for interacting with the Harbinger oracle system. Users who want to post prices might also be interested in [Harbinger Poster](https://github.com/tacoinfra/harbinger-poster) which is a hosted component providing similar functionality for posting data to Harbinger. Entities who wish to sign prices for Harbinger may want to look at [Harbinger Signer](https://github.com/tacoinfra/harbinger-signer). Developers of new Harbinger components may be interested in [harbinger-lib](https://github.com/tacoinfra/harbinger-lib).

## Install the CLI

To install the pre-packaged CLI from NPM, run the following:
```
$ npm i -g @tacoinfra/harbinger-cli
$ harbinger --help
```

To build the library from source, run:
```shell
$ npm i
$ npm run build
```

## Functionality

Note: Harbinger installs a symlink named `hbg` which executes the same `harbinger` binary as a shortcut, in case you don't want to type the full name.

`harbinger` has the following functions:
- Deploying an oracle or normalizer contract 
- Update a contract from a price feed
- Push data from an oracle to a normalizer contract
- Pretty-print the value in an oracle contract
- Revoke an oracle contract, triggering an emergency shutdown

## Getting Started

`harbinger` has fully interactive and complete documentation. Simply pass `--help` to `harbinger` or any subcommand. For instance:
```shell
$ harbinger --help
# Prints harbinger documentation.

$ harbinger deploy-oracle
# Prints documentation for the deploy-oracle subcommand.
```

## Common Flows

The following set of commands demonstrates a common flow for deploying and working with a Harbinger oracle.

```shell
# Deploy an oracle contract
$ harbinger deploy-oracle
  # Prints KT1 address of oracle contract.

# Deploy a normalizer contract.
$ harbinger deploy-normalizer \
  --oracle-contract-address <address from above>
  # Prints KT1 address of oracle contract.
  
# Push updates to the oracle contract and normalizer contract every 120 seconds.
$ harbinger update \
  --oracle-contract-address <KT1 address of oracle> \
  --normalizer-contract-address <KT1 address of normalizer> \
  --update-interval 120
```
  
## Credits

Harbinger is written and maintained by [Luke Youngblood](https://github.com/lyoungblood) and [Keefer Taylor](https://github.com/keefertaylor). 
