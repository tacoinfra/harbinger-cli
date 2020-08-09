# Harbinger Tezos oracle CLI

This is client software for reading / writing from the BTC / USD oracle. The following contracts are hardcoded:
- [Oracle contract to read from](https://you.better-call.dev/carthagenet/KT1XjYrm3AX5Ptw2ZKXTPYE5ZDFWprfdihKb/storage)
- [Oracle contract to write to](https://you.better-call.dev/carthagenet/KT1DiFg6TxLgsCFAFmLgc9mBBUdE7TRnQzMG/storage)

## Usage

## Pre-requisites

Install the dependencies of the project and `ts-node` (allows direct execution of typescript).

```shell
$ npm i
$ npm i -g ts-node
```

## Retrieve a BTC / USD Price

The following will output a closing price of BTC at a given timestamp. The data is read from [KT1XjYrm3AX5Ptw2ZKXTPYE5ZDFWprfdihKb](https://you.better-call.dev/carthagenet/KT1XjYrm3AX5Ptw2ZKXTPYE5ZDFWprfdihKb/storage).

```shell
$ ts-node src/get-btc-usd-price.ts

Oracle Data:
BTC / USD Price: [object Object]
As of: 2020-03-29T10:53:00Z
```

## Update the BTC / USD Price

The following will output a command to run in tezos-client to update the storage. Data is written to [KT1DiFg6TxLgsCFAFmLgc9mBBUdE7TRnQzMG](https://you.better-call.dev/carthagenet/KT1DiFg6TxLgsCFAFmLgc9mBBUdE7TRnQzMG/storage).

```
$ ts-node src/update-price.ts
<Run given command>
```

# TODO

- Pass contract as a param
