# import asyncio
import bisect
import numpy as np
import time
import asyncio

from .utility.panoptic_helpers import utils as ph

from hummingbot.client.settings import GatewayConnectionSetting
# from hummingbot.core.event.events import TradeType
from hummingbot.core.gateway.gateway_http_client import GatewayHttpClient
from hummingbot.core.utils.async_utils import safe_ensure_future
from hummingbot.strategy.script_strategy_base import Decimal, ScriptStrategyBase


class TradePanoptions(ScriptStrategyBase):
    """
    This example shows how to relevant Gateway endpoints trade options on the Panoptic Protocol.
    This strategy attempts to maintain a position in range of the currenct spot price on the
    Uniswap token pool. If no in-range position exists, one is created. If a position is
    out-of-range, it is burned. Collateral requirements to mint/burn positions are checked.
    If a short position is held by another user, the strategy will attempt to force exercise the
    position or request deposit to close. Strategy data is logged and plotted for analysis.

    """
    # trading params and configuration
    connector_chain_network = "panoptic_ethereum_sepolia"
    trading_pair = {"t0-t1"}
    markets = {}
    perturbation_testing = True
    verbosity = 1


    # internal state variables and methods
    launched = False # Have you launched the strategy?
    initialized = False # Have all the initialization steps completed?
    ready = True # Are all on-chain tasks complete and you're ready to process another one?
    tick_count = 0

    # executed each tick (configure tick size in Hummingbot client before launching strategy)
    def on_tick(self):
        # As written, the tick can now be equivalent to an actual clock, as processes are now controlled by
        # flags and wrapped in safe_ensure_future(...)
        self.log(f"Tick count: {self.tick_count}", 1)
        self.tick_count = self.tick_count + 1

        # initial setup - only execute once
        if not self.launched:
            self.log(f"Launching...", 1)
            self.launched = True
            safe_ensure_future(self.initialize())

        # repeat each tick
        if (self.initialized and self.ready):
            # Tricky because the 'safe_ensure_future' bit immediately returns the contained logic as being complete.
            # It won't wait for the processes inside to finish before allowing tick to tok. Can try to get around
            # this by using flags, but that feels clunky.
            self.ready=False
            safe_ensure_future(self.monitor_and_apply_logic())

    # async task since we are using Gateway
    async def monitor_and_apply_logic(self):
        self.log(f"Checking price...", 2)
        self.log(f"POST /options/getSpotPrice [ connector: {self.connector} ]", 0)
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getSpotPrice",
            params=self.request_payload,
            fail_silently=False
        )
        self.spot_price=response['spotPrice']
        self.log(f"Price: {self.spot_price}", 1)
        # Convert the spot price to a tick location
        self.log(f"Converting spot price to tick location...", 2)
        self.tick_location = ph.adjusted_price_to_tick(self.spot_price, self.request_payload["token0Decimals"], self.request_payload["token1Decimals"])
        self.request_payload.update({
            "atTick": int(np.floor(self.tick_location))
        })
        self.log(f"Current spot price tick location: {self.tick_location}", 1)

        # Save the spot price and tick location to a log file
        self.log(f"Logging spot data...", 2)
        spot_log_path = "logs/spot_data.dat"
        ph.log_spot_data(spot_log_path, self.request_payload['uniswapV3PoolAddress'], self.spot_price, self.tick_location)
        # if self.tick_count % 10 == 0:
            # ph.generate_spot_plot(spot_log_path)

        self.log(f"Finding relevant Uniswap pool tick locations...", 2)
        lower_idx = bisect.bisect_right(self.tick_locations, self.tick_location) - 1
        upper_idx = lower_idx + 1
        lower_tick = self.tick_locations[lower_idx] if lower_idx >= 0 else None
        upper_tick = self.tick_locations[upper_idx] if upper_idx < len(self.tick_locations) else None
        self.log(f"Lower tick: {lower_tick}", 2)
        self.log(f"Upper tick: {upper_tick}", 2)

        self.log(f"Checking queryPositions...", 2)
        self.log(f"POST /options/queryPositions [ connector: {self.connector} ]", 0)
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/queryPositions",
            params=self.request_payload,
            fail_silently=False
        )
        self.open_positions = response['openPositionIdList']
        self.log(f"Open position list: {self.open_positions}", 2)

        # Define position of interest
        self.request_payload.update(
            {
                "panopticPool": self.request_payload["panopticPoolAddress"], #redundant
                "width": ph.timescale_to_width("1D", self.tickSpacing),
                "strike": ph.get_valid_tick(int(np.floor(self.tick_location)), self.tickSpacing, self.tickSpacing*ph.timescale_to_width("1D", self.tickSpacing)),
                "asset": 0,
                "isLong": 0,
                "optionRatio": 1,
                "start": 0,
            }
        )
        self.log(f"Tick spacing: {self.tickSpacing}", 2)
        self.log(f"Width correspoinding to 1H timescale: {self.request_payload['width']}", 2)
        self.log(f"Current strike: {self.tick_location}, Valid strike: {self.request_payload['strike']}", 2)

        bad_positions = []
        if len(self.open_positions)>0:
            self.log(f"Checking validity of open positions...", 2)
            for idx, position in enumerate(self.open_positions):
                outOfRange = False
                self.request_payload["tokenId"] = position
                self.log(f"Position: {self.request_payload['tokenId']}", 2)
                response = await GatewayHttpClient.get_instance().api_request(
                    method="post",
                    path_url="options/unwrapTokenId",
                    params=self.request_payload,
                    fail_silently=False
                )
                self.log(f"Legs in position: {response['numberOfLegs']}", 2)
                for legIdx in range(response['numberOfLegs']):
                    strike = response['legInfo'][legIdx]['strike']
                    width = response['legInfo'][legIdx]['width']
                    legTickWidth = self.tickSpacing * width
                    legStrikeHigh = strike + (legTickWidth/2)
                    legStrikeLow = strike - (legTickWidth/2)
                    if lower_tick is not None and upper_tick is not None:
                        if (legStrikeLow <= upper_tick and legStrikeHigh >= lower_tick):
                            self.log(f"      |-> The range overlaps with the Uniswap pool tick range.", 2)
                            legInRange = True
                        else:
                            self.log(f"      |-> The range does not overlap with the Uniswap pool tick range.", 2)
                            legInRange = False
                            outOfRange = True
                    else:
                        self.log(f"      |-> Unable to determine overlap due to missing tick information.", 2)

                    self.log(f"      |-> leg #: {(legIdx+1)}", 2)
                    self.log(f"      |-> asset: {response['legInfo'][legIdx]['asset']}", 2)
                    self.log(f"      |-> isLong: {response['legInfo'][legIdx]['isLong']}", 2)
                    self.log(f"      |-> tokenType: {response['legInfo'][legIdx]['tokenType']}", 2)
                    self.log(f"      |-> strike: {strike}", 2)
                    self.log(f"      |-> width: {width}", 2)
                    self.log(f"      |-> strikeTickLow: {legStrikeLow}", 2)
                    self.log(f"      |-> strikeTickHigh: {legStrikeHigh}", 2)
                    self.log(f"      |-> position leg in range: {legInRange}", 2)
                if outOfRange is True:
                    bad_positions.append(idx)
        else:
            self.log("No open positions found. Minting new position in-range...", 1)
            response = await GatewayHttpClient.get_instance().api_request(
                method="post",
                path_url="options/createStraddle",
                params=self.request_payload,
                fail_silently=False
            )
            self.log(f"Creating Straddle: {response['tokenId']}", 2)
            self.log(f"      |-> UniV3 Pool: {self.request_payload['univ3pool']}", 2)
            self.log(f"      |-> width: {self.request_payload['width']}", 2)
            self.log(f"      |-> strike: {self.request_payload['strike']}", 2)
            self.log(f"      |-> asset: {self.request_payload['asset']}", 2)
            self.log(f"      |-> isLong: {self.request_payload['isLong']}", 2)
            self.log(f"      |-> optionRatio: {self.request_payload['optionRatio']}", 2)
            self.log(f"      |-> start: {self.request_payload['start']}", 2)
            new_position = hex(int(response['tokenId']))
            self.log(f"Hex token ID: {new_position}", 1)

            self.open_positions.append(new_position)
            self.request_payload.update({
                "panopticPool": self.request_payload["panopticPoolAddress"], #redundant
                "positionIdList": self.open_positions,
                "positionSize": "1" + "0" * 3,
                "effectiveLiquidityLimit": 0,
            })

            self.log(f"Checking collateral...", 2)
            self.log(f"POST /options/checkCollateral [ connector: {self.connector} ]", 0)
            closest_tick = min(self.tick_locations, key=lambda x: abs(x - self.tick_location))
            self.request_payload.update({
                "atTick": closest_tick
            })
            self.log(f"panopticPool: {self.request_payload['panopticPool']}", 2)
            self.log(f"atTick: {self.request_payload['atTick']}", 2)
            self.log(f"positionIdList: {self.request_payload['positionIdList']}", 2)
            response = await GatewayHttpClient.get_instance().api_request(
                method="post",
                path_url="options/checkCollateral",
                params=self.request_payload,
                fail_silently=False
            )

            self.collateral_balance_token0 = int(response['collateralBalance0']['hex'], 16)
            self.collateral_balance_token1 = int(response['collateralBalance1']['hex'], 16)
            self.required_collateral_token0 = int(response['requiredCollateral0']['hex'], 16)
            self.required_collateral_token1 = int(response['requiredCollateral1']['hex'], 16)
            self.log(f"Collateral balance token0: {self.collateral_balance_token0}", 2)
            self.log(f"Required collateral token0: {self.required_collateral_token0}", 2)
            self.log(f"Collateral balance token1: {self.collateral_balance_token1}", 2)
            self.log(f"Required collateral token1: {self.required_collateral_token1}", 2)

            tradeData = await GatewayHttpClient.get_instance().api_request(
                method="post",
                path_url="options/mint",
                params=self.request_payload,
                fail_silently=False
            )
            self.log(f"mint submitted... tradeData: {tradeData}", 1)
            # poll for swap result and print resulting balances
            await self.poll_transaction(self.chain, self.network, tradeData['txHash'])

        for badPosition in bad_positions:
            burnPosition = self.open_positions[badPosition]
            self.log(f"Minting new position to replace: {burnPosition}", 1)

            response = await GatewayHttpClient.get_instance().api_request(
                method="post",
                path_url="options/createStraddle",
                params=self.request_payload,
                fail_silently=False
            )
            new_position = hex(int(response['tokenId']))
            self.log(f"Hex token ID of new position: {new_position}", 1)

            # TODO check collateral - skipping that for now

            newPositionList = [p for p in self.open_positions if p != burnPosition]
            self.request_payload.update({
                "burnTokenId": burnPosition,
                "postburnPositionIdList": newPositionList,
                "mintTokenId": new_position,
                "positionSize": "1" + "0" * 3,
                "effectiveLiquidityLimit": 0
            })

            # Check collateral, liquidity, forceExercise vs deposit to close.
            # Get token0, token1 holdings
            # Get availabile liquidiy in token0, token1

            tradeData = await GatewayHttpClient.get_instance().api_request(
                method="post",
                path_url="options/burnAndMint",
                params=self.request_payload,
                fail_silently=False
            )
            self.log(f"burnAndMint submitted... tradeData: {tradeData}", 2)
            await self.poll_transaction(self.chain, self.network, tradeData['txHash'])
        self.ready=True

    async def initialize(self):
        self.t0_symbol, self.t1_symbol = list(self.trading_pair)[0].split("-")
        self.connector, self.chain, self.network = self.connector_chain_network.split("_")

        # fetch wallet address and print balances
        self.gateway_connections_conf = GatewayConnectionSetting.load()
        if len(self.gateway_connections_conf) < 1:
            self.log("No existing wallet.\n", 0)
            return
        self.wallet = [w for w in self.gateway_connections_conf if w["chain"] == self.chain and w["connector"] == self.connector and w["network"] == self.network]
        self.address = self.wallet[0]['wallet_address']

        self.request_payload = {
            "chain": self.chain,
            "network": self.network,
            "connector": self.connector,
            "address": self.address
        }

        self.log(f"Getting token addresses...", 2)
        self.log(f"POST /options/getTokenAddress [ connector: {self.connector}]", 0)
        self.request_payload["tokenSymbol"]= self.t0_symbol
        self.log(f"Finding token {self.t0_symbol}", 2)
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTokenAddress",
            params=self.request_payload,
            fail_silently=False
        )

        self.request_payload.update({
            "t0_address": response['tokenAddress'],
            "token0Decimals": response['tokenDecimals']
        })
        self.log(f"t0 address: {self.request_payload['t0_address']}", 2)

        self.request_payload.update({
            "tokenSymbol": self.t1_symbol
        })
        self.log(f"Finding token {self.t1_symbol}", 2)
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTokenAddress",
            params=self.request_payload,
            fail_silently=False
        )
        self.request_payload.update({
            "t1_address": response['tokenAddress'],
            "token1Decimals": response['tokenDecimals']
        })
        self.log(f"t1 address: {self.request_payload['t1_address']}", 2)

        self.log(f"Getting UniswapV3 token pool address...", 2)
        self.log(f"POST /options/checkUniswapPool [ connector: {self.connector}]", 0)

        self.request_payload.update({
            "fee": 500
        })
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/checkUniswapPool",
            params=self.request_payload,
            fail_silently=False
        )
        self.request_payload.update({
            "uniswapV3PoolAddress": response["uniswapV3PoolAddress"]
        })
        self.log(f"Uniswap V3 token pool address: {self.request_payload['uniswapV3PoolAddress']}", 2)

        self.log(f"Getting Panoptic token pool address...", 2)
        self.log(f"POST /options/getPanopticPool [ connector: {self.connector}]", 0)

        self.request_payload.update({
            "univ3pool": self.request_payload['uniswapV3PoolAddress'] # redundant
        })
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getPanopticPool",
            params=self.request_payload,
            fail_silently=False
        )
        self.request_payload.update({
            "panopticPoolAddress": response["panopticPoolAddress"],
            "panopticPool": response["panopticPoolAddress"],
        })
        self.log(f"Panoptic token pool address: {self.request_payload['panopticPoolAddress']}", 1)

        self.log(f"Checking ticks...", 2)
        self.log(f"POST /options/getTickSpacingAndInitializedTicks [ connector: {self.connector} ]", 0)
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTickSpacingAndInitializedTicks",
            params=self.request_payload,
            fail_silently=False
        )
        self.tickSpacing=response['tickSpacing']
        self.tick_locations=response['ticks']
        self.log(f"Tick spacing: {self.tickSpacing}", 1)
        self.log(f"Ticks: {self.tick_locations[0:10]}...{self.tick_locations[-10:]}", 2)

        self.wallet_address=self.address #redundant

        self.initialized=True

    # continuously poll for transaction until confirmed
    async def poll_transaction(self, chain, network, txHash):
        pending: bool = True
        while pending is True:
            self.log(f"POST /network/poll [ txHash: {txHash} ]", 0)
            pollData = await GatewayHttpClient.get_instance().get_transaction_status(
                chain,
                network,
                txHash
            )
            transaction_status = pollData.get("txStatus")
            if transaction_status == 1:
                self.log(f"Trade with transaction hash {txHash} has been executed successfully.", 1)
                pending = False
            elif transaction_status in [-1, 0, 2]:
                self.log(f"Trade is pending confirmation, Transaction hash: {txHash}", 1)
                await asyncio.sleep(2)
            else:
                self.log(f"Unknown txStatus: {transaction_status}", 1)
                self.log(f"{pollData}", 2)
                pending = False

    def log(self, message, triviality):
        if (triviality <= self.verbosity):
            self.logger().info(message)
