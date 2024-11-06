import asyncio

from hummingbot.client.settings import GatewayConnectionSetting
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
    positionIdList = [
        "77322973700535398579242074044252",
        "77322919308318248886668502693724",
        "77322919313040615369538147907420",
        "77323000906088706391268150146908",
        "0x3cff3cc4c0403cff3db480803cff3cc460c03cff3db4204000ac3730726f75c"
    ]
    positionSize = "123456789000000000000000000"
    effectiveLiquidityLimit = 0
    tickLimitLow = -887272
    tickLimitHigh = 887272
    markets = {}
    on_going_task = False

    def on_tick(self):
        # only execute once. Remove flag to execute each tick.
        if not self.on_going_task:
            self.on_going_task = True
            # wrap async task in safe_ensure_future
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
        self.logger().info(f"Proceeding to submit mint...")
        # execute swap
        self.logger().info(f"POST /options/mint [ connector: {connector}, base: {base}, quote: {quote}, amount (i.e. position size): {self.positionSize}, tokenId (i.e. position): {self.positionIdList}]")
        request_payload = {
            "chain": chain,
            "network": network,
            "connector": connector,
            "address": address,
            "positionIdList": self.positionIdList,
            "positionSize": self.positionSize,
            "effectiveLiquidityLimit": self.effectiveLiquidityLimit,
            "tickLimitLow": self.tickLimitLow,
            "tickLimitHigh": self.tickLimitHigh
        }

        tradeData = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/mint",
            params=request_payload,
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
