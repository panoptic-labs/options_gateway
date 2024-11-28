# Panoptic Additions to the Hummingbot Gateway

We have added an `/options` namespace to the Hummingbot Gateway, and have included a number of ways to interact with Panoptic within that namespace:

- You can call `mint` and `burn` with arbitrary token IDs to construct any Panoption possible.
- You can make arbitrary calls to the Panoptic subgraph, as well as convenience methods for getting your existing TokenIDs / positions.
- You can use analytical methods such as `delta` and `gamma` to power a strategy, with more to come.

It also comes with Sepolia support out of the box, which is not found in upstream Hummingbot implementations.

Use this gateway in tandem with [our Hummingbot fork](https://github.com/panoptic-labs/panoptic_hummingbot) to run automated Panoptic trading strategies, such as market making.

## Setup

You can find instructions below about the general Hummingbot setup. To specifically run Panoptic strategies, you can:

Step 1: Get hummingbot set up:

1. `git clone https://github.com/panoptic-labs/panoptic_hummingbot.git`
2. `cd panoptic_hummingbot`
3. `./install` (You may need to first [install anaconda](https://www.anaconda.com/download))
4. `conda activate hummingbot`
5. `./compile`
6. `./start`
7. The Hummingbot UI should now present itself! You can now set a password.
8. The Hummingbot Shell will now present itself. You can then `gateway generate-certs` to generate certificates and secure your Hummingbot instance.
    1. You’ll be prompted to set a password and it’ll list the directory those certificates are stored in.
    2. Copy the directory path it generates these certificates to.
    3. For many users, this was `~/panoptic_hummingbot/certs`. This is just a certs folder in the same folder as your hummingbot repo.

Step 2: Set up this fork of the Hummingbot Gateway:

1. `git clone git@github.com:panoptic-labs/options_gateway.git`
2. `cd options_gateway`
3. `yarn` (Ensure you’re using node 18.0.0 or higher - you can use [nvm](https://github.com/nvm-sh/nvm) to manage different node versions if needed.)
4. `yarn build`
5. Give permissions to the gateway setup script: `chmod a+x gateway-setup.sh`
6. Then run it: `./gateway-setup.sh`
7. It will prompt you to copy over the certificates from your Hummingbot (step (8)(i) above). Enter the path (and possibly passphrase) for those certs.

Step 3: Launch the Gateway:

`yarn start --passphrase=<passphrase>`

Finally, back in the Hummingbot UI tab, you should see Gateway: ONLINE in the navbar, on the right side to the left of > log pane.

1. You can connect to Panoptic's functionality by running `gateway connect panoptic` in the Hummingbot shell. You will be prompted about your RPC URL and private key to get started.
2. To confirm functionality, you can run `gateway balance` to see your Sepolia ETH balance.
3. You can then add more tokens to track balances of if you like via: `gateway connector-tokens panoptic_ethereum_sepolia ETH,WETH,T0,T1`. Your next call to `gateway balance` will show your balances of all those tokens. Be careful NOT to add spaces between the token tickers.
4. Be sure to approve your tokens to appropriate spenders, such as Uniswap or Panoptic contracts, to see valid gas estimates.

From here, you should be able to implement strategies in the `panoptic_hummingbot` repo that call to your local instance of the Gateway, leveraging the Panoptic Gateway methods. You can, of course, write your own code as well that leverages this gateway, by just making calls to `localhost:8080`.

Note that we provide a `doNotBroadcast` flag on Panoptic endpoints, allowing you to use the Gateway as a generic transaction-building API. You can modify `conf/server.yml`'s `unsafeDevModeWithHTTP` flag to `true` to take advantage of this easily without setting up dual TLS handshaking, if you're just going to keep this Gateway and your integration communicating locally on the same machine.

Please [reach out](https://discord.com/invite/8sX5Af2KXG) if you have any issues!

The standard Hummingbot Gateway README can be found below:

--------

![Hummingbot](https://i.ibb.co/X5zNkKw/blacklogo-with-text.png)

# Hummingbot Gateway

Hummingbot Gateway is a REST API that exposes connections to various blockchains (wallet, node & chain interaction) and decentralized exchanges (pricing, trading & liquidity provision). It is written in Typescript and takes advantage of existing blockchain and DEX SDKs. The advantage of using gateway is it provideds a programming language agnostic approach to interacting with blockchains and DEXs.

Gateway may be used alongside the main [Hummingbot client](https://github.com/hummingbot/hummingbot) to enable trading on DEXs, or as a standalone module by external developers.

## Installation via Docker

If you are installing Gateway alongside Hummingbot, check out the [Deploy Examples](https://github.com/hummingbot/deploy-examples) repository that helps you deploy various types of Hummingbot and Gateway configurations. For most new users, we recommend following the [Hummingbot Gateway Compose](https://github.com/hummingbot/deploy-examples/tree/main/hummingbot_gateway_compose) deployment.

The repo also contains [Bash Scripts](https://github.com/hummingbot/deploy-examples/tree/main/bash_scripts#gateway) that help you install the Gateway Docker image on a standalone basis.

## Installation from source

Dependencies:
* NodeJS (16.0.0 or higher)
* Yarn: run `npm install -g yarn` after installing NodeJS

```bash
# Install dependencies
yarn

# Complile Typescript into JS
$ yarn build

# Run Gateway setup script, which helps you set configs and CERTS_PATH
$ chmod a+x gateway-setup.sh
$ ./gateway-setup.sh

# Start the Gateway server using PASSPHRASE
$ yarn start --passphrase=<PASSPHRASE>
```

### Build Docker image

To build the gateway docker image locally execute the below make command:

```bash
make docker
```

Pass the `${TAG}` environmental variable to add a tag to the docker
image. For example, the below command will create the `hummingbot/gateway:dev`
image.

```bash
TAG=dev make docker
```

## Documentation

See the [official Gateway docs](https://docs.hummingbot.org/gateway/).

The API is documented using [Swagger](./docs/swagger). When Gateway is started, it also generates Swagger API docs at: https://localhost:8080


## Contributing

There are a number of ways to contribute to gateway.

- File an issue at [hummingbot issues](https://github.com/hummingbot/gateway/issues)

- Make a [pull request](https://github.com/hummingbot/gateway/)

- Edit the [docs](https://github.com/hummingbot/hummingbot-site/)

- Vote on a [Snapshot proposal](https://snapshot.org/#/hbot.eth)


### Configuration

- If you want to turn off `https`, set `unsafeDevModeWithHTTP` to `true` in [conf/server.yml](./conf/server.yml).

- If you want Gateway to log to standard out, set `logToStdOut` to `true` in [conf/server.yml](./conf/server.yml).

- The format of configuration files are dictated by [src/services/config-manager-v2.ts](./src/services/config-manager-v2.ts) and the corresponding schema files in [src/services/schema](./src/services/schema).

- If you want to turn off `https`, set `unsafeDevModeWithHTTP` to `true` in [conf/server.yml](./conf/server.yml).

- For each supported chain, token lists that translate address to symbols for each chain are stored in `/conf/lists`. You can add tokens here to make them available to Gateway.


### Architecture

Here are some files we recommend you look at in order to get familiar with the Gateway codebase:

- [src/services/ethereum-base.ts](./src/chains/ethereum/ethereum-base.ts): base class for EVM chains.

- [src/connectors/uniswap/uniswap.ts](./src/connectors/uniswap/uniswap.ts): functionality for interacting with Uniswap.

- [src/services/validators.ts](./src/services/validators.ts): defines functions for validating request payloads.


### Testing

For a pull request merged into the codebase, it has to pass unit test coverage requirements. Take a look at [Workflow](./.github/workflows/workflow.yml) for more details.

#### Unit tests

Read this document for more details about how to write unit test in gateway: [How we write unit tests for gateway](./docs/testing.md).

Run all unit tests.

```bash
yarn test:unit
```

Run an individual test folder or file

```bash
yarn jest test/<folder>/<file>
```

#### Manual tests

We have found it is useful to test individual endpoints with `curl` commands. We have a collection of prepared curl calls. POST bodies are stored in JSON files. Take a look at the [curl calls for gateway](./test-helpers/curl/curl.sh). Note that some environment variables are expected.

## Linting

This repo uses `eslint` and `prettier`. When you run `git commit` it will trigger the `pre-commit` hook. This will run `eslint` on the `src` and `test` directories.

You can lint before committing with:

```bash
yarn run lint
```

You can run the prettifier before committing with:

```bash
yarn run prettier
```
