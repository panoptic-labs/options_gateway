# import asyncio
import bisect
import numpy as np
import panopticHelpers as ph 

from hummingbot.client.settings import GatewayConnectionSetting
# from hummingbot.core.event.events import TradeType
from hummingbot.core.gateway.gateway_http_client import GatewayHttpClient
from hummingbot.core.utils.async_utils import safe_ensure_future
from hummingbot.strategy.script_strategy_base import Decimal, ScriptStrategyBase

# TODO
# def get_unsigned_tx_payload_for_mint(
#     panoptic_pool: address,
#     token_id: int
# ) returns (Byte[]):
# def is_mint_valid(tokenId, positionSize):
# def is_close_valid():

class TradePanoptions(ScriptStrategyBase):
    """
    This example shows how to call the /options/trade Gateway endpoint to execute a panoptic transaction
    """
    # options params
    connector_chain_network = "panoptic_ethereum_sepolia"
    trading_pair = {"t0-t1"}
    markets = {}
    launched = False # Have you launched the strategy? 
    initialized = False # Have all the initialization steps completed? 
    ready = True # Are all on-chain tasks complete and you're ready to process another one? 
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
            safe_ensure_future(self.monitor_and_apply_logic())


    # async task since we are using Gateway
    async def monitor_and_apply_logic(self):
        # TODO: If we're 11 seconds into the block (based on block.timestamp), sleep such that each
        # on_tick is at the start of a block
        self.logger().info(f"Checking price...")
        self.logger().info(f"POST /options/getSpotPrice [ connector: {self.connector} ]")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getSpotPrice",
            params=self.request_payload,
            fail_silently=False
        )
        self.spot_price=response['spotPrice']
        self.logger().info(f"Price: {self.spot_price}")
        # Convert the spot price to a tick location
        self.logger().info(f"Converting spot price to tick location...")
        self.tick_location = ph.adjustedPrice_to_tick(self.spot_price, self.request_payload["token0Decimals"], self.request_payload["token1Decimals"])
        self.request_payload['atTick'] = int(np.floor(self.tick_location))
        self.logger().info(f"Current spot price tick location: {self.tick_location}")

        # Save the spot price and tick location to a log file
        self.logger().info(f"Logging spot data...")
        spot_log_path = "logs/spot_data.dat"
        ph.log_spot_data(spot_log_path, self.request_payload['uniswapV3PoolAddress'], self.spot_price, self.tick_location)
        if self.tick_count % 10 == 0:
            ph.generate_spot_plot(spot_log_path)
        
        self.logger().info(f"Finding relevant Uniswap pool tick locations...")
        lower_idx = bisect.bisect_right(self.tick_locations, self.tick_location) - 1 
        upper_idx = lower_idx + 1
        lower_tick = self.tick_locations[lower_idx] if lower_idx >= 0 else None
        upper_tick = self.tick_locations[upper_idx] if upper_idx < len(self.tick_locations) else None
        self.logger().info(f"Lower tick: {lower_tick}")
        self.logger().info(f"Upper tick: {upper_tick}")

        self.logger().info(f"Checking queryPositions...")
        self.logger().info(f"POST /options/queryPositions [ connector: {self.connector} ]")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/queryPositions",
            params=self.request_payload,
            fail_silently=False
        )
        self.open_positions = response['openPositionIdList']
        self.logger().info(f"Open position list: {self.open_positions}")

        # TODO: Then, query the PanopticHelper to get chunk information for the chunks each position is in
        # This will get you things like:
        # - vegoid (spread multiplier)
        # which will then let you decide to sell/buy based on your vegoid tolerance below

        # Define position of interest
        self.request_payload.update(
            {
                "panopticPool": self.request_payload["panopticPoolAddress"], #redundant 
                "width": ph.timescale_to_width("1H", self.tickSpacing), 
                "strike": ph.get_valid_tick(int(np.floor(self.tick_location)), self.tickSpacing, self.tickSpacing*ph.timescale_to_width("1H", self.tickSpacing)),
                "asset": 0,
                "isLong": 0,
                "optionRatio": 1,
                "start": 0, 
            }
        )
        self.logger().info(f"Tick spacing: {self.tickSpacing}")
        self.logger().info(f"Width correspoinding to 1H timescale: {self.request_payload['width']}")
        self.logger().info(f"Current strike: {self.tick_location}, Valid strike: {self.request_payload['strike']}")

        bad_positions = []
        if len(self.open_positions)>0:
            self.logger().info(f"Checking validity of open positions...")
            for idx, position in enumerate(self.open_positions): 
                outOfRange = False
                self.request_payload["tokenId"] = position
                self.logger().info(f"Position: {self.request_payload['tokenId']}")
                response = await GatewayHttpClient.get_instance().api_request(
                    method="post",
                    path_url="options/unwrapTokenId",
                    params=self.request_payload,
                    fail_silently=False
                )
                self.logger().info(f"Legs in position: {response['numberOfLegs']}")
                for legIdx in range(response['numberOfLegs']): 
                    strike = response['legInfo'][legIdx]['strike']
                    width = response['legInfo'][legIdx]['width']
                    legTickWidth = self.tickSpacing * width 
                    legStrikeHigh = strike + (legTickWidth/2)
                    legStrikeLow = strike - (legTickWidth/2)
                    if lower_tick is not None and upper_tick is not None:
                        # TODO: This is where we might just check the delta instead of checking in-range-ness

                        if (legStrikeLow <= upper_tick and legStrikeHigh >= lower_tick):
                            self.logger().info(f"      |-> The range overlaps with the Uniswap pool tick range.")
                            legInRange = True
                        else:
                            self.logger().info(f"      |-> The range does not overlap with the Uniswap pool tick range.")
                            legInRange = False
                            outOfRange = True
                    else:
                        self.logger().info(f"      |-> Unable to determine overlap due to missing tick information.")
                    self.logger().info(f"      |-> leg #: {(legIdx+1)}")     
                    self.logger().info(f"      |-> asset: {response['legInfo'][legIdx]['asset']}")
                    self.logger().info(f"      |-> isLong: {response['legInfo'][legIdx]['isLong']}")  
                    self.logger().info(f"      |-> tokenType: {response['legInfo'][legIdx]['tokenType']}") 
                    self.logger().info(f"      |-> strike: {strike}")
                    self.logger().info(f"      |-> width: {width}")
                    self.logger().info(f"      |-> strikeTickLow: {legStrikeLow}")
                    self.logger().info(f"      |-> strikeTickHigh: {legStrikeHigh}")
                    self.logger().info(f"      |-> position leg in range: {legInRange}")
                if outOfRange is True: 
                    bad_positions.append(idx)
        else:
            self.logger().info("No open positions found. Minting new position in-range...")
            response = await GatewayHttpClient.get_instance().api_request(
                method="post",
                path_url="options/createStraddle",
                params=self.request_payload,
                fail_silently=False
            )
            self.logger().info(f"Creating Straddle: {response['tokenId']}")
            self.logger().info(f"      |-> UniV3 Pool: {self.request_payload['univ3pool']}")
            self.logger().info(f"      |-> width: {self.request_payload['width']}")
            self.logger().info(f"      |-> strike: {self.request_payload['strike']}")
            self.logger().info(f"      |-> asset: {self.request_payload['asset']}")
            self.logger().info(f"      |-> isLong: {self.request_payload['isLong']}")
            self.logger().info(f"      |-> optionRatio: {self.request_payload['optionRatio']}")
            self.logger().info(f"      |-> start: {self.request_payload['start']}")
            new_position = hex(int(response['tokenId']))
            self.logger().info(f"Hex token ID: {new_position}")
    
            self.open_positions.append(new_position)
            self.request_payload.update({
                "panopticPool": self.request_payload["panopticPoolAddress"], #redundant 
                "positionIdList": self.open_positions,
                "positionSize": "1" + "0" * 25,
                "effectiveLiquidityLimit": 0
            })

            self.logger().info(f"Checking collateral...")
            self.logger().info(f"POST /options/checkCollateral [ connector: {self.connector} ]")
            closest_tick = min(self.tick_locations, key=lambda x: abs(x - self.tick_location))
            self.request_payload["atTick"] = closest_tick
            self.logger().info(f"panopticPool: {self.request_payload['panopticPool']}")
            self.logger().info(f"atTick: {self.request_payload['atTick']}")
            self.logger().info(f"positionIdList: {self.request_payload['positionIdList']}")
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
            self.logger().info(f"Collateral balance token0: {self.collateral_balance_token0}")
            self.logger().info(f"Required collateral token0: {self.required_collateral_token0}")
            self.logger().info(f"Collateral balance token1: {self.collateral_balance_token1}")
            self.logger().info(f"Required collateral token1: {self.required_collateral_token1}")

            # tradeData = await GatewayHttpClient.get_instance().api_request(
            #     method="post",
            #     path_url="options/mint",
            #     params=self.request_payload,
            #     fail_silently=False
            # )
            # self.logger().info(f"api_request submitted... tradeData: {tradeData}")
            # poll for swap result and print resulting balances
            # await self.poll_transaction(self.chain, self.network, tradeData['txHash'])
        
        for badPosition in bad_positions: 
            burnPosition = self.open_positions[badPosition]
            self.logger().info(f"Burning position: {burnPosition}")
            newPositionList = [p for p in self.open_positions if p != burnPosition]
            # self.logger().info(f"New position list: {newPositionList}")
            self.request_payload.update({
                "burnTokenId": burnPosition,
                "newPositionIdList": newPositionList
            })
            # TODO: Possibly just reduce size (which is a multi-called mint-of-smaller-size, then burn) if still in-range but high delta
            # TODO: Possibly reduce size if you can't burn

            # Check collateral, liquidity, forceExercise vs deposit to close. 
            # Get token0, token1 holdings
            # Get availabile liquidiy in token0, token1
            



            # tradeData = await GatewayHttpClient.get_instance().api_request(
            #     method="post",
            #     path_url="options/burn",
            #     params=self.request_payload,
            #     fail_silently=False
            # )
            # self.logger().info(f"api_request submitted... tradeData: {tradeData}")

            # await self.poll_transaction(self.chain, self.network, tradeData['txHash'])

            # TODO: Re-mint for every burnt position
            # TODO: When minting, ensure we mint at strikes & ranges that the UI present

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
        self.request_payload["tokenSymbol"]= self.t0_symbol
        self.logger().info(f"Finding token {self.t0_symbol}")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTokenAddress",
            params=self.request_payload,
            fail_silently=False
        )
        self.request_payload["t0_address"]=response['tokenAddress']
        self.request_payload["token0Decimals"]=response['tokenDecimals']
        self.logger().info(f"t0 address: {self.request_payload['t0_address']}")

        self.request_payload["tokenSymbol"]= self.t1_symbol
        self.logger().info(f"Finding token {self.t1_symbol}")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTokenAddress",
            params=self.request_payload,
            fail_silently=False
        )
        self.request_payload["t1_address"]=response['tokenAddress']
        self.request_payload["token1Decimals"]=response['tokenDecimals']
        self.logger().info(f"t1 address: {self.request_payload['t1_address']}")

        self.logger().info(f"Getting UniswapV3 token pool address...")
        self.logger().info(f"POST /options/checkUniswapPool [ connector: {self.connector}]")
        self.request_payload["fee"]=500
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/checkUniswapPool",
            params=self.request_payload,
            fail_silently=False
        )
        self.request_payload["uniswapV3PoolAddress"]=response["uniswapV3PoolAddress"]
        self.logger().info(f"Uniswap V3 token pool address: {self.request_payload['uniswapV3PoolAddress']}")

        self.logger().info(f"Getting Panoptic token pool address...")
        self.logger().info(f"POST /options/getPanopticPool [ connector: {self.connector}]")
        self.request_payload["univ3pool"]=self.request_payload['uniswapV3PoolAddress'] # redundant 
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getPanopticPool",
            params=self.request_payload,
            fail_silently=False
        )
        self.request_payload["panopticPoolAddress"]=response["panopticPoolAddress"]
        self.logger().info(f"Panoptic token pool address: {self.request_payload['panopticPoolAddress']}")

        self.logger().info(f"Checking ticks...")
        self.logger().info(f"POST /options/getTickSpacingAndInitializedTicks [ connector: {self.connector} ]")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTickSpacingAndInitializedTicks",
            params=self.request_payload,
            fail_silently=False
        )
        self.tickSpacing=response['tickSpacing']
        self.tick_locations=response['ticks']
        self.logger().info(f"Tick spacing: {self.tickSpacing}")
        self.logger().info(f"Ticks: {self.tick_locations[0:10]}...{self.tick_locations[-10:]}")

        self.wallet_address=self.address #redundant 

        self.initialized=True

