#!/usr/bin/env node

/** Commander uses `any` objects to type commands. Disable some linting rules for this. */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  initOracleLib,
  updateOracleFromCoinbase,
  updateOracleFromFeed,
  deployNormalizer,
  deployOracle,
  pushOracleData,
  LogLevel,
  get,
  revokeOracle,
} from '@tacoinfra/harbinger-lib'
import * as commander from 'commander'

const version = '1.3.0'

const defaultNode = 'https://rpctest.tzbeta.net'

const program = new commander.Command()
program.version(version)

// Global options
program.option('--debug', 'Print verbose output.')
program.option('--debug-conseil', 'Prints ConseilJS debug data.')

// The default public key for the coinbase signer.
const coinbasePublicKey =
  'sppk7bkCcE4TZwnqqR7JAKJBybJ2XTCbKZu11ESTvvZQYtv3HGiiffN'

// The default set of asset names to use.
const defaultAssetNames = [
  'BTC-USD',
  'ETH-USD',
  'XTZ-USD',
  'DAI-USDC',
  'REP-USD',
  'ZRX-USD',
  'BAT-USDC',
  'KNC-USD',
  'LINK-USD',
  'COMP-USD',
].reduce((previous, current) => {
  return previous + ',' + current
})

/** Constants for Environment variables. */
const NODE_ENV_VAR = "HARBINGER_NODE"
const PRIVATE_KEY_ENV_VAR = 'HARBINGER_PRIVATE_KEY'
const COINBASE_API_KEY_ID_ENV_VAR = 'COINBASE_API_KEY_ID'
const COINBASE_API_PASSPHRASE_ENV_VAR = 'COINBASE_API_PASSPHRASE'
const COINBASE_API_SECRET_ENV_VAR = 'COINBASE_API_SECRET'

// Deploy Oracle Command
program
  .command('deploy-oracle')
  .description('Deploys an Oracle contract')
  .option(
    '--deployer-private-key <private key>',
    `A base58check encoded private key starting with "edsk". If omitted, this argument can also be read from the "${PRIVATE_KEY_ENV_VAR}" environment variable.`,
    undefined,
  )
  .option(
    '--signer-public-key <public key>',
    'The base58check encoded public key of the service which will sign data in the oracle.',
    coinbasePublicKey,
  )
  .option(
    '--tezos-node-url <Node URL>',
    `Tezos node URL to use to broadcast operation. If omitted, this argument can also be read from the "${NODE_ENV_VAR}" environment variable.`,
    defaultNode,
  )
  .option(
    '--asset-names <comma seperated list>',
    'A comma seperated list of asset names to include in the oracle. Example: BTC-USD,XTZ-USD',
    defaultAssetNames,
  )
  .action(function (commandObject) {
    const logLevel = program.debug ? LogLevel.Debug : LogLevel.Info
    const conseilLogLevel = program.debugConseil ? 'debug' : 'error'
    initOracleLib(conseilLogLevel)
    const assetNamesArray: Array<string> = commandObject.assetNames
      .split(',')
      .sort()

    const deployerPrivateKey = getInput(
      commandObject,
      'deployerPrivateKey',
      'deployer-private-key',
      PRIVATE_KEY_ENV_VAR,
    )

    const nodeUrl = getInput(
      commandObject,
      "tezosNodeUrl",
      "tezos-node-url",
      NODE_ENV_VAR
    )

    deployOracle(
      logLevel,
      assetNamesArray,
      commandObject.signerPublicKey,
      deployerPrivateKey,
      nodeUrl,
    )
  })

// Deploy Normalizer Command
program
  .command('deploy-normalizer')
  .description('Deploys a Normalizer contract')
  .requiredOption(
    '--oracle-contract-address <KT1 Address>',
    'The address of the oracle contract which provides updates',
  )
  .option(
    '--asset-name <asset name>',
    'The name of the asset to normalize. Ex. XTZ-USD',
    'XTZ-USD',
  )
  .option(
    '--data-points <number>',
    'The number of data points to store. Larger sets of data consume more space on chain.',
    parseCLIInt,
    3,
  )
  .option(
    '--deployer-private-key <private key>',
    `A base58check encoded private key starting with "edsk". If omitted, this argument can also be read from the "${PRIVATE_KEY_ENV_VAR}" environment variable.`,
    undefined,
  )
  .option(
    '--tezos-node-url <Node URL>',
    `Tezos node URL to use to broadcast operation. If omitted, this argument can also be read from the "${NODE_ENV_VAR}" environment variable.`,
    defaultNode,
  )
  .action(function (commandObject) {
    const logLevel = program.debug ? LogLevel.Debug : LogLevel.Info
    const conseilLogLevel = program.debugConseil ? 'debug' : 'error'
    initOracleLib(conseilLogLevel)

    const deployerPrivateKey = getInput(
      commandObject,
      'deployerPrivateKey',
      'deployer-private-key',
      PRIVATE_KEY_ENV_VAR,
    )

    const nodeUrl = getInput(
      commandObject,
      "tezosNodeUrl",
      "tezos-node-url",
      NODE_ENV_VAR
    )

    deployNormalizer(
      logLevel,
      deployerPrivateKey,
      commandObject.assetName,
      commandObject.dataPoints,
      commandObject.oracleContractAddress,
      nodeUrl,
    )
  })

// Update command
program
  .command('update')
  .description('Updates an Oracle from a Coinbase data feed')
  .requiredOption(
    '--oracle-contract-address <KT1 Address>',
    'The address of the oracle contract.',
  )
  .option(
    `--coinbase-api-key-id <Coinbase Pro API key identifier>', 'The identifier of a Coinbase Pro API Key, If omitted, this argument can be read from the "${COINBASE_API_KEY_ID_ENV_VAR} environment variable`,
    undefined,
  )
  .option(
    `--coinbase-api-secret <Coinbase Pro API key secret>', 'The secret for a Coinbase Pro API Key. If omitted, this argument can be read from the "${COINBASE_API_PASSPHRASE_ENV_VAR} environment variable`,
    undefined,
  )
  .option(
    `--coinbase-api-passphrase <Coinbase Pro API key Passphrase>', 'The passphrase for a Coinbase Pro API Key. If omitted, this argument can be read from the "${COINBASE_API_PASSPHRASE_ENV_VAR} environment variable`,
    undefined,
  )
  .option(
    '--poster-private-key <private key>',
    `A base58check encoded private key starting with "edsk". If omitted, this argument can also be read from the "${PRIVATE_KEY_ENV_VAR}" environment variable.`,
    undefined,
  )
  .option(
    '--asset-names <comma seperated list>',
    'A comma seperated list of asset names to include in the oracle. Example: BTC-USD,XTZ-USD',
    defaultAssetNames,
  )
  .option(
    '--normalizer-contract-address <KT1 Address>',
    'If present, data is pushed to the medianizer contract on successful updates.',
    undefined,
  )
  .option(
    '--tezos-node-url <Node URL>',
    `Tezos node URL to use to broadcast operation. If omitted, this argument can also be read from the "${NODE_ENV_VAR}" environment variable.`,
    defaultNode,
  )
  .option(
    '--update-interval <seconds>',
    'The number of seconds to wait between updates. If not set, the update only runs once.',
    parseCLIInt,
  )
  .action(function (commandObject) {
    const logLevel = program.debug ? LogLevel.Debug : LogLevel.Info
    const conseilLogLevel = program.debugConseil ? 'debug' : 'error'
    initOracleLib(conseilLogLevel)
    const assetNamesArray = commandObject.assetNames.split(',').sort()

    const posterPrivateKey = getInput(
      commandObject,
      'posterPrivateKey',
      'poster-private-key',
      PRIVATE_KEY_ENV_VAR,
    )
    const coinbaseApiKeyId = getInput(
      commandObject,
      'coinbaseApiKeyId',
      'coinbase-api-key-id',
      COINBASE_API_KEY_ID_ENV_VAR,
    )
    const coinbaseApiSecret = getInput(
      commandObject,
      'coinbaseApiSecret',
      'coinbase-api-secret',
      COINBASE_API_SECRET_ENV_VAR,
    )
    const coinbaseApiPassphrase = getInput(
      commandObject,
      'coinbaseApiPassphrase',
      'coinbase-api-passphrase',
      COINBASE_API_PASSPHRASE_ENV_VAR,
    )
    const nodeUrl = getInput(
      commandObject,
      "tezosNodeUrl",
      "tezos-node-url",
      NODE_ENV_VAR
    )

    updateOracleFromCoinbase(
      logLevel,
      coinbaseApiKeyId,
      coinbaseApiSecret,
      coinbaseApiPassphrase,
      commandObject.oracleContractAddress,
      assetNamesArray,
      posterPrivateKey,
      commandObject.updateInterval,
      nodeUrl,
      commandObject.normalizerContractAddress,
    )
  })

// Update from feed command
program
  .command('update-from-feed')
  .description('Updates an Oracle from an arbitrary data feed')
  .requiredOption(
    '--oracle-contract-address <KT1 Address>',
    'The address of the oracle contract.',
  )
  .requiredOption(
    '--oracle-data-feed-url <URL>',
    'A URL that will provide signed updates.',
  )
  .option(
    '--poster-private-key <private key>',
    `A base58check encoded private key starting with "edsk". If omitted, this argument can also be read from the "${PRIVATE_KEY_ENV_VAR}" environment variable.`,
    undefined,
  )
  .option(
    '--asset-names <comma seperated list>',
    'A comma seperated list of asset names to include in the oracle. Example: BTC-USD,XTZ-USD',
    defaultAssetNames,
  )
  .option(
    '--normalizer-contract-address <KT1 Address>',
    'If present, data is pushed to the medianizer contract on successful updates.',
    undefined,
  )
  .option(
    '--tezos-node-url <Node URL>',
    `Tezos node URL to use to broadcast operation. If omitted, this argument can also be read from the "${NODE_ENV_VAR}" environment variable.`,
    defaultNode,
  )
  .option(
    '--update-interval <seconds>',
    'The number of seconds to wait between updates. If not set, the update only runs once.s',
    parseCLIInt,
  )
  .action(function (commandObject) {
    const logLevel = program.debug ? LogLevel.Debug : LogLevel.Info
    const conseilLogLevel = program.debugConseil ? 'debug' : 'error'
    initOracleLib(conseilLogLevel)
    const assetNamesArray = commandObject.assetNames.split(',').sort()

    const posterPrivateKey = getInput(
      commandObject,
      'posterPrivateKey',
      'poster-private-key',
      PRIVATE_KEY_ENV_VAR,
    )

    const nodeUrl = getInput(
      commandObject,
      "tezosNodeUrl",
      "tezos-node-url",
      NODE_ENV_VAR
    )

    updateOracleFromFeed(
      logLevel,
      commandObject.oracleDataFeedUrl,
      commandObject.oracleContractAddress,
      assetNamesArray,
      posterPrivateKey,
      commandObject.updateInterval,
      nodeUrl,
      commandObject.normalizerContractAddress,
    )
  })

// Push data command.
program
  .command('push')
  .description('Pushes data from an Oracle contract to a Normalizer contract')
  .requiredOption(
    '--oracle-contract-address <KT1 Address>',
    'The address of the oracle contract.',
  )
  .requiredOption(
    '--normalizer-contract-address <KT1 Address>',
    'The address of the medianizer contract.',
  )
  .option(
    '--pusher-private-key <private key>',
    `A base58check encoded private key starting with "edsk". If omitted, this argument can also be read from the "${PRIVATE_KEY_ENV_VAR}" environment variable.`,
    undefined,
  )
  .option(
    '--tezos-node-url <Node URL>',
    `Tezos node URL to use to broadcast operation. If omitted, this argument can also be read from the "${NODE_ENV_VAR}" environment variable.`,
    defaultNode,
  )
  .action(function (commandObject) {
    const logLevel = program.debug ? LogLevel.Debug : LogLevel.Info
    const conseilLogLevel = program.debugConseil ? 'debug' : 'error'
    initOracleLib(conseilLogLevel)

    const pusherPrivateKey = getInput(
      commandObject,
      'pusherPrivateKey',
      'pusher-private-key',
      PRIVATE_KEY_ENV_VAR,
    )

    const nodeUrl = getInput(
      commandObject,
      "tezosNodeUrl",
      "tezos-node-url",
      NODE_ENV_VAR
    )


    pushOracleData(
      logLevel,
      commandObject.oracleContractAddress,
      commandObject.normalizerContractAddress,
      pusherPrivateKey,
      nodeUrl,
    )
  })

// Get the value of a single asset.
program
  .command('get')
  .description('Retrieves the value of an asset in the Oracle')
  .requiredOption('--asset-name <asset name>', 'The asset name to retrieve.')
  .requiredOption(
    '--oracle-contract-address <KT1 Address>',
    'The address of the oracle contract.',
  )
  .option(
    '--tezos-node-url <Node URL>',
    `Tezos node URL to use to broadcast operation. If omitted, this argument can also be read from the "${NODE_ENV_VAR}" environment variable.`,
    defaultNode,
  )
  .action(function (commandObject) {
    const logLevel = program.debug ? LogLevel.Debug : LogLevel.Info
    const conseilLogLevel = program.debugConseil ? 'debug' : 'error'
    initOracleLib(conseilLogLevel)

    const tezosNodeURL = commandObject.tezosNodeUrl
    const contract = commandObject.oracleContractAddress
    const assetName = commandObject.assetName

    get(tezosNodeURL, contract, assetName, logLevel)
  })

program
  .command('revoke')
  .description(
    'Revokes an Oracle, effectively triggering an emergency shutdown.',
  )
  .requiredOption(
    '--signature <signature>',
    "A signature of the Michelson data Option(Key) with value None that can be verified by the Oracle's public key.",
  )
  .requiredOption(
    '--oracle-contract-address <KT1 Address>',
    'The address of the oracle contract.',
  )
  .option(
    '--revoker-private-key <private key>',
    `A base58check encoded private key starting with "edsk". If omitted, this argument can also be read from the "${PRIVATE_KEY_ENV_VAR}" environment variable.`,
    undefined,
  )
  .option(
    '--tezos-node-url <Node URL>',
    `Tezos node URL to use to broadcast operation. If omitted, this argument can also be read from the "${NODE_ENV_VAR}" environment variable.`,
    defaultNode,
  )
  .action(function (commandObject) {
    const logLevel = program.debug ? LogLevel.Debug : LogLevel.Info
    const conseilLogLevel = program.debugConseil ? 'debug' : 'error'
    initOracleLib(conseilLogLevel)

    const revokerPrivateKey = getInput(
      commandObject,
      'revokerPrivateKey',
      'revoker-private-key',
      PRIVATE_KEY_ENV_VAR,
    )

    revokeOracle(
      logLevel,
      commandObject.signature,
      commandObject.oracleContractAddress,
      revokerPrivateKey,
      commandObject.tezosNodeUrl,
    )
  })

/**
 * Get the input from the given command.
 *
 * This is useful for arguments that can be passed on the command line or via the environment variables.
 *
 * @param command The command the program was invoked with.
 * @param argsInputName The name of the property in the given command.
 * @param argsLiteralName The name of the property on the CLI.
 * @param environmentVariableName The name of the environment variable.
 */
function getInput(
  command: commander.Command,
  argsInputName: string,
  argsLiteralName: string,
  environmentVariableName: string,
): string {
  const environmentVariableValue = process.env[environmentVariableName]

  if (command[argsInputName] !== undefined) {
    return command[argsInputName] as string
  } else if (environmentVariableValue !== undefined) {
    return environmentVariableValue
  } else {
    console.log(`You must run the program with either:`)
    console.log(`1) --${argsLiteralName}`)
    console.log(`2) The ${environmentVariableName} environment variable set`)
    console.log('')
    process.exit(1)
  }
}

// Helper function to parse integers from command line arguments.
function parseCLIInt(input: string): number {
  return parseInt(input)
}

// Parse input arguments.
program.parse(process.argv)
