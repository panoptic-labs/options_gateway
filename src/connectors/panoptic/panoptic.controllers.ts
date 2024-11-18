import { BigNumber, Wallet, ContractReceipt } from 'ethers';
import {
  HttpException,
  LOAD_WALLET_ERROR_CODE,
  LOAD_WALLET_ERROR_MESSAGE,
} from '../../services/error-handler';
import {
  Ethereumish,
  ExpectedTrade,
  Tokenish,
} from '../../services/common-interfaces';
import { logger } from '../../services/logger';
import {
  ExecuteBurnRequest,
  ExecuteBurnAndMintRequest,
  BurnResponse,
  CalculateDeltaRequest,
  CalculateDeltaResponse,
  CalculateGammaRequest,
  CalculateGammaResponse,
  GetTokenAddressRequest,
  GetTokenAddressResponse,
  GreekQueryRequest,
  GreekQueryResponse,
  QueryPositionsRequest,
  QueryPositionsResponse,
  QueryPriceRequest,
  QueryPriceResponse,
  QuerySubgraphRequest,
  QuerySubgraphResponse,
  CheckCollateralRequest,
  CheckCollateralResponse,
  CreateBigLizardRequest,
  CreateCallCalendarSpreadRequest,
  CreateCallDiagonalSpreadRequest,
  CreateCallRatioSpreadRequest,
  CreateCallSpreadRequest,
  CreateCallZEBRASpreadRequest,
  CreateIronButterflyRequest,
  CreateIronCondorRequest,
  CreateJadeLizardRequest,
  CreatePutCalendarSpreadRequest,
  CreatePutDiagonalSpreadRequest,
  CreatePutRatioSpreadRequest,
  CreatePutSpreadRequest,
  CreatePutZEBRASpreadRequest,
  CreateStraddleRequest,
  CreateStrangleRequest,
  CreateSuperBearRequest,
  CreateSuperBullRequest,
  CreateZEEHBSRequest,
  UnwrapTokenIdRequest,
  UnwrapTokenIdResponse,
  CreateAddLegsRequest,
  CreatePositionResponse,
  CalculateAccumulatedFeesBatchRequest,
  CalculateAccumulatedFeesBatchResponse,
  CollateralTokenRequest,
  CollateralTokenResponse,
  ForceExerciseRequest,
  ForceExerciseResponse,
  LiquidateRequest,
  LiquidateResponse,
  ExecuteMintRequest,
  MintResponse,
  NumberOfPositionsRequest,
  NumberOfPositionsResponse,
  OptionPositionBalanceRequest,
  PokeMedianRequest,
  SettleLongPremiumRequest,
  DepositRequest,
  DepositResponse,
  GetAssetRequest,
  GetAssetResponse,
  GetPoolDataRequest,
  MaxWithdrawRequest,
  WithdrawRequest,
  GetAccountLiquidityRequest,
  GetAccountPremiumRequest,
  GetAccountFeesBaseRequest,
  EstimateGasResponse,
  OptionsPositionBalanceResponse,
  PokeMedianResponse,
  SettleLongPremiumResponse,
  GetPoolDataResponse,
  MaxWithdrawResponse,
  WithdrawResponse,
  GetAccountLiquidityResponse,
  GetAccountPremiumResponse,
  GetAccountFeesBaseResponse,
  GetPanopticPoolRequest,
  GetPanopticPoolResponse,
  CheckUniswapV3PoolRequest,
  CheckUniswapV3PoolResponse,
  GetSpotPriceRequest,
  GetSpotPriceResponse,
  GetTickSpacingAndInitializedTicksRequest,
  GetTickSpacingAndInitializedTicksResponse,
  TransactionBuildingResult
} from '../../options/options.requests';
import { Panoptic } from '../panoptic/panoptic';
import { gasCostInEthString } from '../../services/base';

export interface TradeInfo {
  baseToken: Tokenish;
  quoteToken: Tokenish;
  requestAmount: BigNumber;
  expectedTrade: ExpectedTrade;
}

export async function txWriteData(
  ethereumish: Ethereumish,
  address: string,
  maxFeePerGas?: string,
  maxPriorityFeePerGas?: string
): Promise<{
  wallet: Wallet;
  maxFeePerGasBigNumber: BigNumber | undefined;
  maxPriorityFeePerGasBigNumber: BigNumber | undefined;
}> {
  let maxFeePerGasBigNumber: BigNumber | undefined;
  if (maxFeePerGas) {
    maxFeePerGasBigNumber = BigNumber.from(maxFeePerGas);
  }
  let maxPriorityFeePerGasBigNumber: BigNumber | undefined;
  if (maxPriorityFeePerGas) {
    maxPriorityFeePerGasBigNumber = BigNumber.from(maxPriorityFeePerGas);
  }

  let wallet: Wallet;
  try {
    wallet = await ethereumish.getWallet(address);
  } catch (err) {
    logger.error(`Wallet ${address} not available.`);
    throw new HttpException(
      500,
      LOAD_WALLET_ERROR_MESSAGE + err,
      LOAD_WALLET_ERROR_CODE
    );
  }
  return { wallet, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber };
}

// NOTE: Relies on a hard-coded 10M gas limit for every transaction.
// TODO: Replace with actual tx simulation logic.
export async function estimateGas(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
): Promise<EstimateGasResponse | Error> {
  const gasPrice: number = ethereumish.gasPrice;
  const gasLimit: number = panopticish.absoluteGasLimit;
  return {
    network: ethereumish.chain,
    timestamp: Date.now(),
    gasPrice: gasPrice,
    gasPriceToken: ethereumish.nativeTokenSymbol,
    gasLimit: gasLimit,
    gasCost: gasCostInEthString(gasPrice, gasLimit),
  };
}

export async function calculateDelta(
  panopticish: Panoptic,
  req: CalculateDeltaRequest
): Promise<CalculateDeltaResponse | Error> {
  const result = await panopticish.calculateDelta(req.PRICE, req.RANGE, req.STRIKE);

  if (result instanceof Error) {
    logger.error(`Error executing calculateDelta: ${result.message}`);
    return result;
  }

  return {
    delta: result
  };
}

export async function calculateGamma(
  panopticish: Panoptic,
  req: CalculateGammaRequest
): Promise<CalculateGammaResponse | Error> {
  const result = await panopticish.calculateGamma(req.PRICE, req.RANGE, req.STRIKE);

  if (result instanceof Error) {
    logger.error(`Error executing calculateGamma: ${result.message}`);
    return result;
  }

  return {
    gamma: result
  };
}

export async function getTokenAddress(
  panopticish: Panoptic,
  req: GetTokenAddressRequest
): Promise<GetTokenAddressResponse | Error> {
  const result = await panopticish.getTokenAddress(req.tokenSymbol);

  if (result instanceof Error) {
    logger.error(`Error executing getTokenAddress: ${result.message}`);
    return result;
  }

  return {
    tokenAddress: result["tokenAddress"],
    tokenDecimals: result["tokenDecimals"]
  };
}

// TODO: Eventually, we'll allow users to make 1 gateway call to get all 5 greeks, rather than
//       calling calculateDelta, then calculateGamma, etc...
//       NOT YET FUNCTIONAL
export async function queryGreeks(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GreekQueryRequest
): Promise<GreekQueryResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.queryGreeks(
    wallet,
    req.panopticPool,
    req.tick,
    req.positionIdList,
    req.greek
  );

  if (result instanceof Error) {
    logger.error(`Error executing queryGreeks: ${result.message}`);
    return result;
  }

  return {
    greek: result
  };
}

// Subgraph interactions
export async function queryPositions(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: QueryPositionsRequest
): Promise<QueryPositionsResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.queryPositions(wallet, req.panopticPool);

  if (result instanceof Error) {
    logger.error(`Error executing queryPositions: ${result.message}`);
    return result;
  }

  const accountBalances = result.data['data']['panopticPoolAccounts'][0]['accountBalances'];
  const closedAccountBalances = result.data['data']['panopticPoolAccounts'][0]['closedAccountBalances'];

  // Extract token IDs
  const positions = accountBalances.map((item: any) => item['tokenId']['id']);
  const closedPositions = closedAccountBalances.map((item: any) => item['tokenId']['id']);

  // Filter open positions
  const openPositions = positions.filter((id: string) => !closedPositions.includes(id));

  return {
    queryResponse: JSON.stringify(result.data),
    positions: positions,
    closedPositionIdList: closedPositions,
    openPositionIdList: openPositions
  };
}

export async function queryPrice(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: QueryPriceRequest
): Promise<QueryPriceResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.queryPrice(
    wallet,
    req.uniV3Pool
  );

  if (result instanceof Error) {
    logger.error(`Error executing queryPrice: ${result.message}`);
    return result;
  }

  const feeTier = result.data['data']['pool']['feeTier'];
  const sqrtPrice = result.data['data']['pool']['sqrtPrice'];
  const liquidity = result.data['data']['pool']['liquidity'];

  return {
    queryResponse: JSON.stringify(result.data),
    feeTier: feeTier,
    sqrtPrice: sqrtPrice,
    liquidity: liquidity
  };
}

export async function querySubgraph(
  panopticish: Panoptic,
  req: QuerySubgraphRequest
): Promise<QuerySubgraphResponse | Error> {
  const result = await panopticish.querySubgraph(req.query, req.variables);

  if (result instanceof Error) {
    logger.error(`Error executing querySubgraph: ${result.message}`);
    return result;
  }

  return {
    queryResponse: result.data
  };
}

// PanopticHelper interactions
export async function checkCollateral(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CheckCollateralRequest
): Promise<CheckCollateralResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.checkCollateral(
    wallet,
    req.panopticPool,
    req.atTick,
    req.positionIdList
  );

  if (result instanceof Error) {
    logger.error(`Error executing checkCollateral: ${result.message}`);
    return result;
  }

  return result
}


export async function createBigLizard(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateBigLizardRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createBigLizard(
    wallet,
    req.univ3pool,
    req.width,
    req.longCallStrike,
    req.straddleStrike,
    req.asset
  );

  if (result instanceof Error) {
    logger.error(`Error executing createBigLizard: ${result.message}`);
    return result;
  }

  return result
}

export async function createCallCalendarSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateCallCalendarSpreadRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createCallCalendarSpread(
    wallet,
    req.univ3pool,
    req.widthLong,
    req.widthShort,
    req.strike,
    req.asset,
    req.optionRatio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createCallCalendarSpread: ${result.message}`);
    return result;
  }

  return result
}

export async function createCallDiagonalSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateCallDiagonalSpreadRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createCallDiagonalSpread(
    wallet,
    req.univ3pool,
    req.widthLong,
    req.widthShort,
    req.strikeLong,
    req.strikeShort,
    req.asset,
    req.optionRatio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createCallDiagonalSpread: ${result.message}`);
    return result;
  }

  return result
}

export async function createCallRatioSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateCallRatioSpreadRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createCallRatioSpread(
    wallet,
    req.univ3pool,
    req.width,
    req.longStrike,
    req.shortStrike,
    req.asset,
    req.ratio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createCallRatioSpread: ${result.message}`);
    return result;
  }

  return result
}

export async function createCallSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateCallSpreadRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createCallSpread(
    wallet,
    req.univ3pool,
    req.width,
    req.strikeLong,
    req.strikeShort,
    req.asset,
    req.optionRatio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createCallSpread: ${result.message}`);
    return result;
  }

  return result
}

export async function createCallZEBRASpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateCallZEBRASpreadRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createCallZEBRASpread(
    wallet,
    req.univ3pool,
    req.width,
    req.longStrike,
    req.shortStrike,
    req.asset,
    req.ratio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createCallZEBRASpread: ${result.message}`);
    return result;
  }

  return result
}

export async function createIronButterfly(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateIronButterflyRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createIronButterfly(
    wallet,
    req.univ3pool,
    req.width,
    req.strike,
    req.wingWidth,
    req.asset
  );

  if (result instanceof Error) {
    logger.error(`Error executing createIronButterfly: ${result.message}`);
    return result;
  }

  return result
}

export async function createIronCondor(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateIronCondorRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createIronCondor(
    wallet,
    req.univ3pool,
    req.width,
    req.callStrike,
    req.putStrike,
    req.wingWidth,
    req.asset
  );

  if (result instanceof Error) {
    logger.error(`Error executing createIronCondor: ${result.message}`);
    return result;
  }

  return result
}

export async function createJadeLizard(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateJadeLizardRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createJadeLizard(
    wallet,
    req.univ3pool,
    req.width,
    req.longCallStrike,
    req.shortCallStrike,
    req.shortPutStrike,
    req.asset
  );

  if (result instanceof Error) {
    logger.error(`Error executing createJadeLizard: ${result.message}`);
    return result;
  }

  return result
}

export async function createPutCalendarSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreatePutCalendarSpreadRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createPutCalendarSpread(
    wallet,
    req.univ3pool,
    req.widthLong,
    req.widthShort,
    req.strike,
    req.asset,
    req.optionRatio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createPutCalendarSpread: ${result.message}`);
    return result;
  }

  return result
}

export async function createPutDiagonalSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreatePutDiagonalSpreadRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createPutDiagonalSpread(
    wallet,
    req.univ3pool,
    req.widthLong,
    req.widthShort,
    req.strikeLong,
    req.strikeShort,
    req.asset,
    req.optionRatio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createPutDiagonalSpread: ${result.message}`);
    return result;
  }

  return result
}

export async function createPutRatioSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreatePutRatioSpreadRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createPutRatioSpread(
    wallet,
    req.univ3pool,
    req.width,
    req.longStrike,
    req.shortStrike,
    req.asset,
    req.ratio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createPutRatioSpread: ${result.message}`);
    return result;
  }

  return result
}

export async function createPutSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreatePutSpreadRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createPutSpread(
    wallet,
    req.univ3pool,
    req.width,
    req.strikeLong,
    req.strikeShort,
    req.asset,
    req.optionRatio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createPutSpread: ${result.message}`);
    return result;
  }

  return result
}

export async function createPutZEBRASpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreatePutZEBRASpreadRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createPutZEBRASpread(
    wallet,
    req.univ3pool,
    req.width,
    req.longStrike,
    req.shortStrike,
    req.asset,
    req.ratio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createPutZEBRASpread: ${result.message}`);
    return result;
  }

  return result
}

export async function createStraddle(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateStraddleRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createStraddle(
    wallet,
    req.univ3pool,
    req.width,
    req.strike,
    req.asset,
    req.isLong,
    req.optionRatio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createStraddle: ${result.message}`);
    return result;
  }

  return result
}

export async function createStrangle(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateStrangleRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createStrangle(
    wallet,
    req.univ3pool,
    req.width,
    req.callStrike,
    req.putStrike,
    req.asset,
    req.isLong,
    req.optionRatio,
    req.start
  );

  if (result instanceof Error) {
    logger.error(`Error executing createStrangle: ${result.message}`);
    return result;
  }

  return result
}

export async function createSuperBear(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateSuperBearRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createSuperBear(
    wallet,
    req.univ3pool,
    req.width,
    req.longPutStrike,
    req.shortPutStrike,
    req.shortCallStrike,
    req.asset
  );

  if (result instanceof Error) {
    logger.error(`Error executing createSuperBear: ${result.message}`);
    return result;
  }

  return result
}

export async function createSuperBull(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateSuperBullRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createSuperBull(
    wallet,
    req.univ3pool,
    req.width,
    req.longCallStrike,
    req.shortCallStrike,
    req.shortPutStrike,
    req.asset
  );

  if (result instanceof Error) {
    logger.error(`Error executing createSuperBull: ${result.message}`);
    return result;
  }

  return result
}

export async function createZEEHBS(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateZEEHBSRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createZEEHBS(
    wallet,
    req.univ3pool,
    req.width,
    req.longStrike,
    req.shortStrike,
    req.asset,
    req.ratio
  );

  if (result instanceof Error) {
    logger.error(`Error executing createZEEHBS: ${result.message}`);
    return result;
  }

  return result
}

export async function unwrapTokenId(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: UnwrapTokenIdRequest
): Promise<UnwrapTokenIdResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.unwrapTokenId(
    wallet,
    req.tokenId
  );

  if (result instanceof Error) {
    logger.error(`Error executing unwrapTokenId: ${result.message}`);
    return result;
  }

  return {
    numberOfLegs: result.length,
    legInfo: result
  };
}

// PanopticPool interactions
export async function calculateAccumulatedFeesBatch(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CalculateAccumulatedFeesBatchRequest
): Promise<CalculateAccumulatedFeesBatchResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.calculateAccumulatedFeesBatch(
    wallet,
    req.panopticPool,
    req.includePendingPremium,
    req.positionIdList
  );

  if (result instanceof Error) {
    logger.error(`Error executing calculateAccumulatedFeesBatch: ${result.message}`);
    return result;
  }

  return {
    premium0: result['premium0'],
    premium1: result['premium1'],
    balances: result[2]
  };
}

export async function getCollateralToken0(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CollateralTokenRequest
): Promise<CollateralTokenResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.collateralToken0(
    wallet,
    req.panopticPool
  );

  if (result instanceof Error) {
    logger.error(`Error executing collateralToken0: ${result.message}`);
    return result;
  }

  return {
    collateralToken: result.collateralToken
  };
}

export async function getCollateralToken1(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CollateralTokenRequest
): Promise<CollateralTokenResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.collateralToken1(
    wallet,
    req.panopticPool
  );

  if (result instanceof Error) {
    logger.error(`Error executing collateralToken1: ${result.message}`);
    return result;
  }

  return {
    collateralToken: result.collateralToken
  };
}

export async function burn(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: ExecuteBurnRequest
): Promise<BurnResponse | Error> {
  const startTimestamp: number = Date.now();
  try {
    const { wallet } = await txWriteData(ethereumish, req.address);
    const gasPrice: number = ethereumish.gasPrice;
    const tx: ContractReceipt | Error = await panopticish.executeBurn(
      wallet,
      req.panopticPool,
      req.burnTokenId,
      req.newPositionIdList,
      req.tickLimitLow,
      req.tickLimitHigh,
    );

    if (tx instanceof Error) {
      logger.error(`Error executing burn: ${tx.message}`);
      return tx;
    }

    if (tx.transactionHash) {
      await ethereumish.txStorage.saveTx(
        ethereumish.chain,
        ethereumish.chainId,
        tx.transactionHash,
        new Date(),
        ethereumish.gasPrice
      );
    }

    logger.info(
      `Burn has been executed, txHash is ${tx.transactionHash}, nonce is ${tx.transactionIndex}, gasPrice is ${gasPrice}, gas used is ${tx.gasUsed}.`
    );

    return {
      tx: tx,
      network: ethereumish.chain,
      timestamp: startTimestamp,
      txHash: tx.transactionHash,
    };
  } catch (error) {
    logger.error(`Unexpected error in burn function: ${error instanceof Error ? error.message : error}`);
    return new Error(`Unexpected error in burn function: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function burnAndMint(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: ExecuteBurnAndMintRequest
): Promise<BurnResponse | Error> {
  const startTimestamp: number = Date.now();
  try {
    const { wallet } = await txWriteData(ethereumish, req.address);
    const gasPrice: number = ethereumish.gasPrice;
    const tx: ContractReceipt | Error = await panopticish.executeBurnAndMint(
      wallet,
      req.panopticPool,
      req.burnTokenId,
      req.postburnPositionIdList,
      req.mintTokenId,
      req.positionSize,
      req.effectiveLiquidityLimit,
      req.burnTickLimitLow,
      req.burnTickLimitHigh,
      req.mintTickLimitLow,
      req.mintTickLimitHigh,
    );

    if (tx instanceof Error) {
      logger.error(`Error executing burn-and-mint multicall: ${tx.message}`);
      return tx;
    }

    if (tx.transactionHash) {
      await ethereumish.txStorage.saveTx(
        ethereumish.chain,
        ethereumish.chainId,
        tx.transactionHash,
        new Date(),
        ethereumish.gasPrice
      );
    }

    logger.info(
      `Burn-and-mint has been executed, txHash is ${tx.transactionHash}, nonce is ${tx.transactionIndex}, gasPrice is ${gasPrice}, gas used is ${tx.gasUsed}.`
    );

    return {
      tx: tx,
      network: ethereumish.chain,
      timestamp: startTimestamp,
      txHash: tx.transactionHash,
    };
  } catch (error) {
    logger.error(`Unexpected error in burn-and-mint multicall: ${error instanceof Error ? error.message : error}`);
    return new Error(`Unexpected error in burn-and-mint multicall: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


export async function forceExercise(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: ForceExerciseRequest
): Promise<ForceExerciseResponse | Error> {
  const startTimestamp: number = Date.now();
  try {
    const { wallet } = await txWriteData(ethereumish, req.address);
    const gasPrice: number = ethereumish.gasPrice;
    const tx: ContractReceipt | Error = await panopticish.forceExercise(
      wallet,
      req.panopticPool,
      req.touchedId,
      req.positionIdListExercisee,
      req.positionIdListExercisor,
    );

    if (tx instanceof Error) {
      logger.error(`Error executing force exercise: ${tx.message}`);
      return tx;
    }

    if (tx.transactionHash) {
      await ethereumish.txStorage.saveTx(
        ethereumish.chain,
        ethereumish.chainId,
        tx.transactionHash,
        new Date(),
        ethereumish.gasPrice
      );
    }

    logger.info(
      `forceExercise has been executed, txHash is ${tx.transactionHash}, nonce is ${tx.transactionIndex}, gasPrice is ${gasPrice}, gas used is ${tx.gasUsed}.`
    );

    return {
      network: ethereumish.chain,
      timestamp: startTimestamp,
      txHash: tx.transactionHash,
      tx: tx
    };
  } catch (error) {
    logger.error(`Unexpected error in force exercise function: ${error instanceof Error ? error.message : error}`);
    return new Error(`Unexpected error in force exercise function: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function liquidate(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: LiquidateRequest
): Promise<LiquidateResponse | Error> {
  const startTimestamp: number = Date.now();
  try {
    const { wallet } = await txWriteData(ethereumish, req.address);
    const gasPrice: number = ethereumish.gasPrice;
    const tx: ContractReceipt | Error = await panopticish.liquidate(
      wallet,
      req.panopticPool,
      req.positionIdListLiquidator,
      req.liquidatee,
      req.delegations,
      req.positionIdList
    );

    if (tx instanceof Error) {
      logger.error(`Error executing liquidation: ${tx.message}`);
      return tx;
    }

    if (tx.transactionHash) {
      await ethereumish.txStorage.saveTx(
        ethereumish.chain,
        ethereumish.chainId,
        tx.transactionHash,
        new Date(),
        ethereumish.gasPrice
      );
    }

    logger.info(
      `Liquidation has been executed, txHash is ${tx.transactionHash}, gasPrice is ${gasPrice}, gas used is ${tx.gasUsed}.`
    );

    return {
      network: ethereumish.chain,
      timestamp: startTimestamp,
      txHash: tx.transactionHash,
      tx: tx
    };
  } catch (error) {
    logger.error(`Unexpected error in liquidation function: ${error instanceof Error ? error.message : error}`);
    return new Error(`Unexpected error in liquidation function: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function mint(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: ExecuteMintRequest
): Promise<MintResponse | Error> {
  const startTimestamp: number = Date.now();
  try {
    const { wallet } = await txWriteData(ethereumish, req.address);
    const gasPrice: number = ethereumish.gasPrice;
    const mintTx: TransactionBuildingResult = await panopticish.executeMint(
      wallet,
      req.panopticPool,
      req.positionIdList,
      BigNumber.from(req.positionSize),
      req.effectiveLiquidityLimit,
      req.doNotBroadcast
    );

    if (mintTx instanceof Error) {
      logger.error(`Error executing mint: ${mintTx.message}`);
      return mintTx;
    }

    if (mintTx.receipt) {
      await ethereumish.txStorage.saveTx(
        ethereumish.chain,
        ethereumish.chainId,
        mintTx.receipt.transactionHash,
        new Date(),
        ethereumish.gasPrice
      );
      logger.info(
        `Mint has been executed, txHash is ${mintTx.receipt.transactionHash}, gasPrice is ${gasPrice}, gas used is ${mintTx.receipt.gasUsed}.`
      );
    }

    return {
      tx: mintTx.receipt,
      network: ethereumish.chain,
      timestamp: startTimestamp,
      txHash: mintTx.receipt?.transactionHash,
      unsignedTransaction: mintTx.unsignedTransaction,
    };
  } catch (error) {
    logger.error(`Unexpected error in mint function: ${error instanceof Error ? error.message : error}`);
    return new Error(`Unexpected error in mint function: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function numberOfPositions(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: NumberOfPositionsRequest
): Promise<NumberOfPositionsResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.numberOfPositions(
    wallet,
    req.panopticPool
  );

  if (result instanceof Error) {
    logger.error(`Error executing numberOfPositions: ${result.message}`);
    return result;
  }

  return {
    numberOfPositions: result._numberOfPositions
  }
}

export async function optionPositionBalance(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: OptionPositionBalanceRequest
): Promise<OptionsPositionBalanceResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.optionPositionBalance(
    wallet,
    req.panopticPool,
    req.tokenId
  );

  if (result instanceof Error) {
    logger.error(`Error executing optionPositionBalance: ${result.message}`);
    return result;
  }

  return {
    balance: result.balance,
    poolUtilization0: result.poolUtilization0,
    poolUtilization1: result.poolUtilization1
  };
}

export async function pokeMedian(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: PokeMedianRequest
): Promise<PokeMedianResponse | Error> {
  const startTimestamp: number = Date.now();
  try {
    const { wallet } = await txWriteData(ethereumish, req.address);
    const gasPrice: number = ethereumish.gasPrice;
    const tx: ContractReceipt | Error = await panopticish.pokeMedian(
      wallet,
      req.panopticPool
    );

    if (tx instanceof Error) {
      logger.error(`Error executing pokeMedian: ${tx.message}`);
      return tx;
    }

    if (tx.transactionHash) {
      await ethereumish.txStorage.saveTx(
        ethereumish.chain,
        ethereumish.chainId,
        tx.transactionHash,
        new Date(),
        ethereumish.gasPrice
      );
    }

    logger.info(
      `pokeMedian has been executed, txHash is ${tx.transactionHash}, gasPrice is ${gasPrice}, gas used is ${tx.gasUsed}.`
    );

    return {
      tx: tx,
      network: ethereumish.chain,
      timestamp: startTimestamp,
      txHash: tx.transactionHash,
    };
  } catch (error) {
    logger.error(`Unexpected error in pokeMedian function: ${error instanceof Error ? error.message : error}`);
    return new Error(`Unexpected error in pokeMedian function: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function settleLongPremium(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: SettleLongPremiumRequest
): Promise<SettleLongPremiumResponse | Error> {
  const startTimestamp: number = Date.now();
  try {
    const { wallet } = await txWriteData(ethereumish, req.address);
    const gasPrice: number = ethereumish.gasPrice;
    const tx: ContractReceipt | Error = await panopticish.settleLongPremium(
      wallet,
      req.panopticPool,
      req.positionIdList,
      req.owner,
      req.legIndex
    );

    if (tx instanceof Error) {
      logger.error(`Error executing settleLongPremium: ${tx.message}`);
      return tx;
    }

    if (tx.transactionHash) {
      await ethereumish.txStorage.saveTx(
        ethereumish.chain,
        ethereumish.chainId,
        tx.transactionHash,
        new Date(),
        ethereumish.gasPrice
      );
    }

    logger.info(
      `settleLongPremium has been executed, txHash is ${tx.transactionHash}, gasPrice is ${gasPrice}, gas used is ${tx.gasUsed}.`
    );

    return {
      tx: tx,
      network: ethereumish.chain,
      timestamp: startTimestamp,
      txHash: tx.transactionHash,
    };
  } catch (error) {
    logger.error(`Unexpected error in settleLongPremium function: ${error instanceof Error ? error.message : error}`);
    return new Error(`Unexpected error in settleLongPremium function: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// CollateralTracker interactions

export async function deposit(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: DepositRequest
): Promise<DepositResponse | Error> {
  const startTimestamp: number = Date.now();
  try {
    const { wallet } = await txWriteData(ethereumish, req.address);
    const gasPrice: number = ethereumish.gasPrice;
    const tx: ContractReceipt | Error = await panopticish.deposit(
      wallet,
      req.collateralTracker,
      BigNumber.from(req.assets)
    );

    if (tx instanceof Error) {
      logger.error(`Error executing deposit: ${tx.message}`);
      return tx;
    }

    if (tx.transactionHash) {
      await ethereumish.txStorage.saveTx(
        ethereumish.chain,
        ethereumish.chainId,
        tx.transactionHash,
        new Date(),
        ethereumish.gasPrice
      );
    }

    logger.info(
      `deposit has been executed, txHash is ${tx.transactionHash}, gasPrice is ${gasPrice}, gas used is ${tx.gasUsed}.`
    );

    return {
      tx: tx,
      network: ethereumish.chain,
      timestamp: startTimestamp,
      txHash: tx.transactionHash
    };
  } catch (error) {
    logger.error(`Unexpected error in deposit function: ${error instanceof Error ? error.message : error}`);
    return new Error(`Unexpected error in deposit function: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getAsset(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetAssetRequest
): Promise<GetAssetResponse | Error> {
  const startTimestamp: number = Date.now();
  try {
    const { wallet } = await txWriteData(ethereumish, req.address);
    const gasPrice: number = ethereumish.gasPrice;
    const tx: ContractReceipt | Error = await panopticish.getAsset(
      wallet,
      req.collateralTracker
    );

    if (tx instanceof Error) {
      logger.error(`Error executing getAsset: ${tx.message}`);
      return tx;
    }

    if (tx.transactionHash) {
      await ethereumish.txStorage.saveTx(
        ethereumish.chain,
        ethereumish.chainId,
        tx.transactionHash,
        new Date(),
        ethereumish.gasPrice
      );
    }

    logger.info(
      `getAsset has been executed, txHash is ${tx.transactionHash}, gasPrice is ${gasPrice}, gas used is ${tx.gasUsed}.`
    );

    return {
      tx: tx,
      network: ethereumish.chain,
      timestamp: startTimestamp,
      txHash: tx.transactionHash,
    };
  } catch (error) {
    logger.error(`Unexpected error in getAsset function: ${error instanceof Error ? error.message : error}`);
    return new Error(`Unexpected error in getAsset function: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getPoolData(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetPoolDataRequest
): Promise<GetPoolDataResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.getPoolData(
    wallet,
    req.collateralTracker
  );

  if (result instanceof Error) {
    logger.error(`Error executing getPoolData: ${result.message}`);
    return result;
  }

  return {
    poolAssets: result.poolAssets,
    insideAMM: result.insideAMM,
    currentPoolUtilization: result.currentPoolUtilization
  };
}

export async function maxWithdraw(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: MaxWithdrawRequest
): Promise<MaxWithdrawResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.maxWithdraw(
    wallet,
    req.collateralTracker
  );

  if (result instanceof Error) {
    logger.error(`Error executing maxWithdraw: ${result.message}`);
    return result;
  }

  return {
    maxAssets: result.maxAssets
  };
}

export async function withdraw(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: WithdrawRequest
): Promise<WithdrawResponse | Error> {
  const startTimestamp: number = Date.now();
  try {
    const { wallet } = await txWriteData(ethereumish, req.address);
    const gasPrice: number = ethereumish.gasPrice;
    const tx: ContractReceipt | Error = await panopticish.withdraw(
      wallet,
      req.collateralTracker,
      BigNumber.from(req.assets)
    );

    if (tx instanceof Error) {
      logger.error(`Error executing withdraw: ${tx.message}`);
      return tx;
    }

    if (tx.transactionHash) {
      await ethereumish.txStorage.saveTx(
        ethereumish.chain,
        ethereumish.chainId,
        tx.transactionHash,
        new Date(),
        ethereumish.gasPrice
      );
    }

    logger.info(
      `withdraw has been executed, txHash is ${tx.transactionHash}, gasPrice is ${gasPrice}, gas used is ${tx.gasUsed}.`
    );

    return {
      tx: tx,
      network: ethereumish.chain,
      timestamp: startTimestamp,
      txHash: tx.transactionHash
    };
  } catch (error) {
    logger.error(`Unexpected error in withdraw function: ${error instanceof Error ? error.message : error}`);
    return new Error(`Unexpected error in withdraw function: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// SemiFungiblePositionManager interactions
export async function getAccountLiquidity(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetAccountLiquidityRequest
): Promise<GetAccountLiquidityResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.getAccountLiquidity(
    wallet,
    req.univ3pool,
    req.owner,
    req.tokenType,
    req.tickLower,
    req.tickUpper
  );

  if (result instanceof Error) {
    logger.error(`Error executing getAccountLiquidity: ${result.message}`);
    return result;
  }

  return {
    accountLiquidity: result.accountLiquidities
  };
}

export async function getAccountPremium(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetAccountPremiumRequest
): Promise<GetAccountPremiumResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.getAccountPremium(
    wallet,
    req.univ3pool,
    req.owner,
    req.tokenType,
    req.tickLower,
    req.tickUpper,
    req.atTick,
    req.isLong
  );

  if (result instanceof Error) {
    logger.error(`Error executing getAccountPremium: ${result.message}`);
    return result;
  }

  return {
    premiumForToken0: result[0],
    premiumForToken1: result[1]
  };
}

export async function getAccountFeesBase(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetAccountFeesBaseRequest
): Promise<GetAccountFeesBaseResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.getAccountFeesBase(
    wallet,
    req.univ3pool,
    req.owner,
    req.tokenType,
    req.tickLower,
    req.tickUpper
  );

  if (result instanceof Error) {
    logger.error(`Error executing getAccountFeesBase: ${result.message}`);
    return result;
  }

  return {
    feesBase0: result.feesBase0,
    feesBase1: result.feesBase1
  };
}

// TokenIdLibrary interactions
export async function addLeg(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateAddLegsRequest
): Promise<CreatePositionResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.addLeg(
    wallet,
    req.self,
    req.legIndex,
    req.optionRatio,
    req.asset,
    req.isLong,
    req.tokenType,
    req.riskPartner,
    req.strike,
    req.width
  );

  if (result instanceof Error) {
    logger.error(`Error executing addLeg: ${result.message}`);
    return result;
  }

  return result
}

// PanopticFactory interactions

export async function getPanopticPool(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetPanopticPoolRequest
): Promise<GetPanopticPoolResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.getPanopticPool(
    wallet,
    req.uniswapV3PoolAddress
  );

  if (result instanceof Error) {
    logger.error(`Error executing getPanopticPool: ${result.message}`);
    return result;
  }

  return {
    panopticPoolAddress: result
  };
}

// Uniswap V3 interactions
export async function checkUniswapPool(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CheckUniswapV3PoolRequest
): Promise<CheckUniswapV3PoolResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.checkUniswapPool(
    wallet,
    req.t0_address,
    req.t1_address,
    req.fee
  );

  if (result instanceof Error) {
    logger.error(`Error executing checkUniswapPool: ${result.message}`);
    return result;
  }

  return {
    uniswapV3PoolAddress: result
  };
}

// UniswapPool interactions
export async function getSpotPrice(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetSpotPriceRequest
): Promise<GetSpotPriceResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.getSpotPrice(
    wallet,
    req.uniswapV3PoolAddress,
    req.token0Decimals,
    req.token1Decimals
  );
  if (result instanceof Error) {
    logger.error(`Error executing getSpotPrice: ${result.message}`);
    return result;
  }
  return {
    spotPrice: result
  };
}

export async function getTickSpacingAndInitializedTicks(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetTickSpacingAndInitializedTicksRequest
): Promise<GetTickSpacingAndInitializedTicksResponse | Error> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.getTickSpacingAndInitializedTicks(
    wallet,
    req.uniswapV3PoolAddress
  );
  if (result instanceof Error) {
    logger.error(`Error executing getTickSpacingAndInitializedTicks: ${result.message}`);
    return result;
  }
  return result
}
