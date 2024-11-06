import asyncio
import numpy as np

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
        connector, chain, network = self.connector_chain_network.split("_")

        # fetch wallet address and print balances
        gateway_connections_conf = GatewayConnectionSetting.load()
        if len(gateway_connections_conf) < 1:
            self.notify("No existing wallet.\n")
            return
        wallet = [w for w in gateway_connections_conf if w["chain"] == chain and w["connector"] == connector and w["network"] == network]
        address = wallet[0]['wallet_address']
        self.logger().info(f"Trading options using wallet address: {address}...")

        request_payload = {
            "chain": chain,
            "network": network,
            "connector": connector,
            "address": address
        } 

        request_payload["self"] = "0"
        request_payload["legIndex"] = 0
        request_payload["optionRatio"] = 1
        request_payload["asset"] = "0x6b175474e89094c44da98b954eedeac495271d0f"
        request_payload["isLong"] = 0
        request_payload["tokenType"] = 1
        request_payload["riskPartner"] = 0
        request_payload["strike"] = 100
        request_payload["width"] = 10
        request_payload["panopticPool"] = "0xc34C41289e6c433723542BB1Eba79c6919504EDD" #T0/T1 PanopticPool 
        self.logger().info(f"Checking addLeg...")
        self.logger().info(f"POST /options/addLeg [ connector: {connector} ]")
        createAddLeg = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/addLeg",
            params=request_payload,
            fail_silently=False
        )
        self.logger().info(f"addLeg response: {createAddLeg}")


        # request_payload["univ3pool"] = "0xc34c41289e6c433723542bb1eba79c6919504edd"
        # request_payload["width"] = 1
        # request_payload["longCallStrike"] = 1
        # request_payload["straddleStrike"] = 1
        # request_payload["asset"] = "0x6b175474e89094c44da98b954eedeac495271d0f"
        # self.logger().info(f"Checking createBigLizard...")
        # self.logger().info(f"POST /options/createBigLizard [ connector: {connector} ]")
        # createBigLizard = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/createBigLizard",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"createBigLizard response: {createBigLizard}")

        # self.logger().info(f"Checking getCollateralToken0...")
        # self.logger().info(f"POST /options/getCollateralToken0 [ connector: {connector} ]")
        # colatteralTracker0 = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/getCollateralToken0",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"getCollateralToken0 response: {colatteralTracker0}")

        # self.logger().info(f"Checking getCollateralToken1...")
        # self.logger().info(f"POST /options/getCollateralToken1 [ connector: {connector} ]")
        # colatteralTracker1 = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/getCollateralToken1",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"getCollateralToken1 response: {colatteralTracker1}")

        # self.logger().info(f"Checking getAsset on token0...")
        # self.logger().info(f"POST /options/getAsset [ connector: {connector} ]")
        # request_payload["collateralTracker"] = colatteralTracker0
        # assetToken0 = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/getAsset",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"getAsset response: {assetToken0}")

        # self.logger().info(f"Checking getAsset on token1...")
        # self.logger().info(f"POST /options/getAsset [ connector: {connector} ]")
        # request_payload["collateralTracker"] = colatteralTracker1
        # assetToken1 = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/getAsset",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"getAsset response: {assetToken1}")

        # request_payload["collateralTracker"] = colatteralTracker0
        # self.logger().info(f"Checking maxWithdraw on token0...")
        # self.logger().info(f"POST /options/maxWithdraw [ connector: {connector} ]")
        # response = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/maxWithdraw",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"maxWithdraw response: {response}")

        # request_payload["collateralTracker"] = colatteralTracker1
        # self.logger().info(f"Checking withdrawal limit for token1...")
        # self.logger().info(f"POST /options/maxWithdraw [ connector: {connector} ]")
        # maxWithdraw = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/maxWithdraw",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"maxWithdraw response: {maxWithdraw}")

        # self.logger().info(f"Checking numberOfPositions...")
        # self.logger().info(f"POST /options/numberOfPositions [ connector: {connector} ]")
        # numberOfPositions = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/numberOfPositions",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"numberOfPositions response: {int(numberOfPositions['hex'], 16)}")

        # self.logger().info(f"Checking queryPositions...")
        # self.logger().info(f"POST /options/queryPositions [ connector: {connector} ]")
        # openPositions = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/queryPositions",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"queryPositions response: {openPositions}")

        # request_payload["collateralTracker"] = colatteralTracker0
        # self.logger().info(f"Checking getPoolData...")
        # self.logger().info(f"POST /options/getPoolData [ connector: {connector} ]")
        # data = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/getPoolData",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # poolAssets = data['poolAssets']['hex']
        # insideAMM = data['insideAMM']['hex']
        # currentPoolUtilization = data['currentPoolUtilization']['hex']
        # self.logger().info(f"getPoolData response...")
        # self.logger().info(f"... poolAssets: {poolAssets}")
        # self.logger().info(f"... insideAMM: {insideAMM}")
        # self.logger().info(f"... currentPoolUtilization: {currentPoolUtilization}")

        # self.logger().info(f"Checking pokeMedian...")
        # self.logger().info(f"POST /options/pokeMedian [ connector: {connector} ]")
        # response = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/pokeMedian",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"pokeMedian response: {response}")

        # request_payload["tokenId"]="77322919313040615369538147907420"
        # self.logger().info(f"Checking optionPositionBalance on 77322919313040615369538147907420")
        # self.logger().info(f"POST /options/optionPositionBalance [ connector: {connector} ]")
        # response = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/optionPositionBalance",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"optionPositionBalance response: {response}")

        # request_payload["tokenId"]="77323000906088706391268150146908"
        # self.logger().info(f"Checking optionPositionBalance on 77323000906088706391268150146908")
        # self.logger().info(f"POST /option/optionPositionBalance [ connector: {connector} ]")
        # response = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/optionPositionBalance",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"optionPositionBalance response: {response}")

        # request_payload["includePendingPremium"]=True
        # request_payload["positionIdList"]=["1724358520355700724595784863781761016418202439334584929386932255284888270684","77323000906088706391268150146908","77322919308318248886668502693724"]
        # self.logger().info(f"Checking calculateAccumulatedFeesBatch")
        # self.logger().info(f"POST /option/calculateAccumulatedFeesBatch [ connector: {connector} ]")
        # response = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/calculateAccumulatedFeesBatch",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"calculateAccumulatedFeesBatch response: {response}")

        # self.logger().info(f"Querying greeks...")
        # self.logger().info(f"POST /options/calculateDelta [ connector: {connector} ]")
        # request_payload["tick"] = 1
        # request_payload["greek"] = "delta"
        # delta = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/queryGreeks",
        #     params=request_payload,
        #     fail_silently=False
        # )

        # self.logger().info(f"Querying greeks...")
        # self.logger().info(f"POST /options/queryGreeks [ connector: {connector} ]")
        # request_payload["tick"] = 1
        # request_payload["greek"] = "delta"
        # delta = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/queryGreeks",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # request_payload["greek"] = "gamma"
        # gamma = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/queryGreeks",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"Delta: {delta}")
        # self.logger().info(f"Gamma: {gamma}")


        # self.logger().info(f"MAKING DEPOSIT...")
        # request_payload["assets"] = str(int(np.power(10, 30)))
        # depositToken0 = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/deposit",
        #     params=request_payload,
        #     fail_silently=False
        # )


        self.logger().info("End of trade strategy...")
