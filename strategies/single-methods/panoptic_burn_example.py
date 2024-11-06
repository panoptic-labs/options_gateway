import asyncio

from hummingbot.client.settings import GatewayConnectionSetting
# from hummingbot.core.event.events import TradeType
from hummingbot.core.gateway.gateway_http_client import GatewayHttpClient
from hummingbot.core.utils.async_utils import safe_ensure_future
from hummingbot.strategy.script_strategy_base import Decimal, ScriptStrategyBase


class TradePanoptions(ScriptStrategyBase):
    """
    This example shows how to call the /options/trade Gateway endpoint to execute a panoptic transaction
    """
    # options params
    connector_chain_network = "panoptic_ethereum_sepolia"
    trading_pair = {"t0-t1"}
    burnTokenId = "305501382857474784059037218961244"
    newPositionIdList = [
    ]
    tickLimitLow = -887272
    tickLimitHigh = 887272
    markets = {}
    launched = False
    initialized = False
    ready = False 
    tick_count = 0


    def on_tick(self):
        self.logger().info(f"Tick count: {self.tick_count}")
        self.tick_count = self.tick_count + 1
        # only execute once. Remove flag to execute each tick. 
        if not self.launched:
            self.logger().info(f"Launching...")
            self.launched = True
            safe_ensure_future(self.initialize())
        # repeat on-tick
        if self.initialized: 
            safe_ensure_future(self.async_task())

    # async task since we are using Gateway
    async def async_task(self):
        base, quote = list(self.trading_pair)[0].split("-")
        connector, chain, network = self.connector_chain_network.split("_")

        # fetch wallet address and print balances
        gateway_connections_conf = GatewayConnectionSetting.load()
        if len(gateway_connections_conf) < 1:
            self.notify("No existing wallet.\n")
            return
        wallet = [w for w in gateway_connections_conf if w["chain"] == chain and w["connector"] == connector and w["network"] == network]
        address = wallet[0]['wallet_address']
        self.logger().info(f"Trading options using wallet address: {address}")
        await self.get_balance(chain, network, address, base, quote)
        self.logger().info(f"Proceeding to submit burn...")
        # execute swap
        self.logger().info(f"POST /options/burn [ connector: {connector}, burnTokenId (i.e. position): {self.burnTokenId}], newPositionIdList: {self.newPositionIdList}")
        self.request_payload.update({
            "chain": chain,
            "network": network,
            "connector": connector,
            "address": address,
            "burnTokenId": self.burnTokenId,
            "newPositionIdList": self.newPositionIdList,
            "tickLimitLow": self.tickLimitLow,
            "tickLimitHigh": self.tickLimitHigh
        })
    
        tradeData = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/burn",
            params=self.request_payload,
            fail_silently=False
        )

        self.logger().info(f"api_request submitted... tradeData: {tradeData}")

        # poll for swap result and print resulting balances
        await self.poll_transaction(chain, network, tradeData['txHash'])
        await self.get_balance(chain, network, address, base, quote)

        self.logger().info("End of trade strategy...")

    # fetch and print balance of base and quote tokens
    async def get_balance(self, chain, network, address, base, quote):
       self.logger().info(f"POST /network/balance [ address: {address}, base: {base}, quote: {quote} ]")
       balanceData = await GatewayHttpClient.get_instance().get_balances(
           chain,
           network,
           address,
           [base, quote]
       )
       self.logger().info(f"Balances for {address}: {balanceData['balances']}")

    # continuously poll for transaction until confirmed
    async def poll_transaction(self, chain, network, txHash):
        pending: bool = True
        while pending is True:
            self.logger().info(f"POST /network/poll [ txHash: {txHash} ]")
            pollData = await GatewayHttpClient.get_instance().get_transaction_status(
                chain,
                network,
                txHash
            )
            transaction_status = pollData.get("txStatus")
            if transaction_status == 1:
                self.logger().info(f"Trade with transaction hash {txHash} has been executed successfully.")
                pending = False
            elif transaction_status in [-1, 0, 2]:
                self.logger().info(f"Trade is pending confirmation, Transaction hash: {txHash}")
                await asyncio.sleep(2)
            else:
                self.logger().info(f"Unknown txStatus: {transaction_status}")
                self.logger().info(f"{pollData}")
                pending = False

    async def initialize(self): 
        self.t0_symbol, self.t1_symbol = list(self.trading_pair)[0].split("-")
        self.connector, self.chain, self.network = self.connector_chain_network.split("_")

        # fetch wallet address and print balances
        self.gateway_connections_conf = GatewayConnectionSetting.load()
        if len(self.gateway_connections_conf) < 1:
            self.notify("No existing wallet.\n")
            return
        self.wallet = [w for w in self.gateway_connections_conf if w["chain"] == self.chain and w["connector"] == self.connector and w["network"] == self.network]
        self.address = self.wallet[0]['wallet_address']
 
        self.request_payload = {
            "chain": self.chain,
            "network": self.network,
            "connector": self.connector,
            "address": self.address
        } 

        self.logger().info(f"Getting token addresses...")
        self.logger().info(f"POST /options/getTokenAddress [ connector: {self.connector}]")
        self.request_payload["tokenSymbol"]= "t0"
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTokenAddress",
            params=self.request_payload,
            fail_silently=False
        )
        self.t0_address = response['tokenAddress']
        self.t0_decimals = response['tokenDecimals']
        self.request_payload["t0_address"]=self.t0_address
        self.request_payload["token0Decimals"]=self.t0_decimals
        self.logger().info(f"t0 address: {self.t0_address}")

        self.request_payload["tokenSymbol"]= "t1"
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTokenAddress",
            params=self.request_payload,
            fail_silently=False
        )
        self.t1_address = response['tokenAddress']
        self.t1_decimals = response['tokenDecimals']
        self.request_payload["t1_address"]=self.t1_address
        self.request_payload["token1Decimals"]=self.t1_decimals
        self.logger().info(f"t1 address: {self.t1_address}")

        self.logger().info(f"Getting UniswapV3 token pool address...")
        self.logger().info(f"POST /options/checkUniswapPool [ connector: {self.connector}]")
        self.request_payload["fee"]=500
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/checkUniswapPool",
            params=self.request_payload,
            fail_silently=False
        )
        self.uniswapV3PoolAddress=response["uniswapV3PoolAddress"]
        self.logger().info(f"Uniswap V3 token pool address: {self.uniswapV3PoolAddress}")

        self.logger().info(f"Getting Panoptic token pool address...")
        self.logger().info(f"POST /options/getPanopticPool [ connector: {self.connector}]")
        self.request_payload["uniswapV3PoolAddress"]=self.uniswapV3PoolAddress
        self.request_payload["univ3pool"]=self.uniswapV3PoolAddress
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getPanopticPool",
            params=self.request_payload,
            fail_silently=False
        )
        self.panopticPoolAddress=response["panopticPoolAddress"]
        self.logger().info(f"Panoptic token pool address: {self.panopticPoolAddress}")
        self.request_payload["panopticPool"]=self.panopticPoolAddress

        self.logger().info(f"Checking ticks...")
        self.logger().info(f"POST /options/getTickSpacingAndInitializedTicks [ connector: {self.connector} ]")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTickSpacingAndInitializedTicks",
            params=self.request_payload,
            fail_silently=False
        )
        self.tickSpacing=response['tickSpacing']
        self.ticks=response['ticks']
        self.logger().info(f"Tick spacing: {self.tickSpacing}")
        self.logger().info(f"Ticks: {self.ticks[0:10]}...")

        self.wallet_address=self.address

        self.initialized=True