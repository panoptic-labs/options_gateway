import {
  ExecuteBurnRequest,
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
  UnwrapTokenIdResponse,
  GetTickSpacingAndInitializedTicksRequest,
  GetTickSpacingAndInitializedTicksResponse,
} from './options.requests';
import {
  addLeg as panopticAddLeg,
  mint as panopticMint,
  burn as panopticBurn,
  forceExercise as panopticForceExercise,
  liquidate as panopticLiquidate,
  getCollateralToken0 as panopticGetCollateralToken0,
  getCollateralToken1 as panopticGetCollateralToken1,
  getAsset as panopticGetAsset,
  deposit as panopticDeposit,
  withdraw as panopticWithdraw,
  getPoolData as panopticGetPoolData,
  maxWithdraw as panopticMaxWithdraw,
  numberOfPositions as panopticNumberOfPositions,
  querySubgraph as panopticQuerySubgraph,
  checkCollateral as panopticCheckCollateral,
  createBigLizard as panopticCreateBigLizard,
  createCallCalendarSpread as panopticCreateCallCalendarSpread,
  createCallDiagonalSpread as panopticCreateCallDiagonalSpread,
  createCallRatioSpread as panopticCreateCallRatioSpread,
  createCallSpread as panopticCreateCallSpread,
  createCallZEBRASpread as panopticCreateCallZEBRASpread,
  createIronButterfly as panopticCreateIronButterfly,
  createIronCondor as panopticCreateIronCondor,
  createJadeLizard as panopticCreateJadeLizard,
  createPutCalendarSpread as panopticCreatePutCalendarSpread,
  createPutDiagonalSpread as panopticCreatePutDiagonalSpread,
  createPutRatioSpread as panopticCreatePutRatioSpread,
  createPutSpread as panopticCreatePutSpread,
  createPutZEBRASpread as panopticCreatePutZEBRASpread,
  createStraddle as panopticCreateStraddle,
  createStrangle as panopticCreateStrangle,
  createSuperBear as panopticCreateSuperBear,
  createSuperBull as panopticCreateSuperBull,
  createZEEHBS as panopticCreateZEEHBS,
  unwrapTokenId as panopticUnwrapTokenId,
  queryPositions as panopticQueryPositions,
  queryPrice as panopticQueryPrice,
  queryGreeks as panopticQueryGreeks,
  calculateAccumulatedFeesBatch as panopticCalculateAccumulatedFeesBatch,
  optionPositionBalance as panopticOptionPositionBalance,
  pokeMedian as panopticPokeMedian,
  settleLongPremium as panopticSettleLongPremium,
  getAccountLiquidity as panopticGetAccountLiquidity,
  getAccountPremium as panopticGetAccountPremium,
  getAccountFeesBase as panopticGetAccountFeesBase,
  calculateDelta as panopticCalculateDelta,
  calculateGamma as panopticCalculateGamma,
  getTokenAddress as panopticGetTokenAddress,
  getPanopticPool as panopticGetPanopticPool,
  checkUniswapPool as panopticCheckUniswapPool,
  getSpotPrice as panopticGetSpotPrice,
  getTickSpacingAndInitializedTicks as panopticGetTickSpacingAndInitializedTicks
} from '../connectors/panoptic/panoptic.controllers';
import {
  getInitializedChain,
  getConnector,
} from '../services/connection-manager';
import {
  Chain as Ethereumish,
} from '../services/common-interfaces';
import { Panoptic } from '../connectors/panoptic/panoptic';

export async function calculateDelta(req: CalculateDeltaRequest): Promise<CalculateDeltaResponse | Error> {
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCalculateDelta(connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function calculateGamma(req: CalculateGammaRequest): Promise<CalculateGammaResponse | Error> {
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCalculateGamma(connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getTokenAddress(req: GetTokenAddressRequest): Promise<GetTokenAddressResponse | Error> {
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticGetTokenAddress(connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function queryGreeks(req: GreekQueryRequest): Promise<GreekQueryResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticQueryGreeks(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function queryPositions(req: QueryPositionsRequest): Promise<QueryPositionsResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticQueryPositions(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function queryPrice(req: QueryPriceRequest): Promise<QueryPriceResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticQueryPrice(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function querySubgraph(req: QuerySubgraphRequest): Promise<QuerySubgraphResponse | Error> {
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticQuerySubgraph(connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function checkCollateral(req: CheckCollateralRequest): Promise<CheckCollateralResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = 
    await getConnector<Panoptic>(
      req.chain, 
      req.network, 
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCheckCollateral(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createBigLizard(req: CreateBigLizardRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCreateBigLizard(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createCallCalendarSpread(req: CreateCallCalendarSpreadRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCreateCallCalendarSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createCallDiagonalSpread(req: CreateCallDiagonalSpreadRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain, req.network, req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCreateCallDiagonalSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createCallRatioSpread(req: CreateCallRatioSpreadRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateCallRatioSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createCallSpread(req: CreateCallSpreadRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateCallSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createCallZEBRASpread(req: CreateCallZEBRASpreadRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateCallZEBRASpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createIronButterfly(req: CreateIronButterflyRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateIronButterfly(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createIronCondor(req: CreateIronCondorRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateIronCondor(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createJadeLizard(req: CreateJadeLizardRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateJadeLizard(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createPutCalendarSpread(req: CreatePutCalendarSpreadRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreatePutCalendarSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createPutDiagonalSpread(req: CreatePutDiagonalSpreadRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreatePutDiagonalSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createPutRatioSpread(req: CreatePutRatioSpreadRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreatePutRatioSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createPutSpread(req: CreatePutSpreadRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreatePutSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createPutZEBRASpread(req: CreatePutZEBRASpreadRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreatePutZEBRASpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createStraddle(req: CreateStraddleRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateStraddle(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createStrangle(req: CreateStrangleRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateStrangle(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createSuperBear(req: CreateSuperBearRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateSuperBear(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createSuperBull(req: CreateSuperBullRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateSuperBull(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createZEEHBS(req: CreateZEEHBSRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateZEEHBS(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function unwrapTokenId(req: UnwrapTokenIdRequest): Promise<UnwrapTokenIdResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticUnwrapTokenId(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function calculateAccumulatedFeesBatch(req: CalculateAccumulatedFeesBatchRequest): Promise<CalculateAccumulatedFeesBatchResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCalculateAccumulatedFeesBatch(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getCollateralToken0(req: CollateralTokenRequest): Promise<CollateralTokenResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticGetCollateralToken0(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getCollateralToken1(req: CollateralTokenRequest): Promise<CollateralTokenResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticGetCollateralToken1(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function burn(req: ExecuteBurnRequest): Promise<BurnResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticBurn(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function forceExercise(req: ForceExerciseRequest): Promise<ForceExerciseResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticForceExercise(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function liquidate(req: LiquidateRequest): Promise<LiquidateResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticLiquidate(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function mint(req: ExecuteMintRequest): Promise<MintResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticMint(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function numberOfPositions(req: NumberOfPositionsRequest): Promise<NumberOfPositionsResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticNumberOfPositions(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function optionPositionBalance(req: OptionPositionBalanceRequest): Promise<OptionsPositionBalanceResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticOptionPositionBalance(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function pokeMedian(req: PokeMedianRequest): Promise<PokeMedianResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticPokeMedian(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function settleLongPremium(req: SettleLongPremiumRequest): Promise<SettleLongPremiumResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticSettleLongPremium(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function deposit(req: DepositRequest): Promise<DepositResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticDeposit(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getAsset(req: GetAssetRequest): Promise<GetAssetResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticGetAsset(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getPoolData(req: GetPoolDataRequest): Promise<GetPoolDataResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticGetPoolData(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function maxWithdraw(req: MaxWithdrawRequest): Promise<MaxWithdrawResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticMaxWithdraw(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function withdraw(req: WithdrawRequest): Promise<WithdrawResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticWithdraw(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getAccountLiquidity(req: GetAccountLiquidityRequest): Promise<GetAccountLiquidityResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticGetAccountLiquidity(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getAccountPremium(req: GetAccountPremiumRequest): Promise<GetAccountPremiumResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticGetAccountPremium(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getAccountFeesBase(req: GetAccountFeesBaseRequest): Promise<GetAccountFeesBaseResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticGetAccountFeesBase(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function addLeg(req: CreateAddLegsRequest): Promise<CreatePositionResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticAddLeg(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getPanopticPool(req: GetPanopticPoolRequest): Promise<GetPanopticPoolResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticGetPanopticPool(
      <Ethereumish>chain,
      connector,
      req
    );
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function checkUniswapPool(req: CheckUniswapV3PoolRequest): Promise<CheckUniswapV3PoolResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCheckUniswapPool(
      <Ethereumish>chain,
      connector,
      req
    );
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getSpotPrice(req: GetSpotPriceRequest): Promise<GetSpotPriceResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticGetSpotPrice(
      <Ethereumish>chain,
      connector,
      req
    );
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getTickSpacingAndInitializedTicks(req: GetTickSpacingAndInitializedTicksRequest): Promise<GetTickSpacingAndInitializedTicksResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    // console.log("Checkpoint0... req: ", req);
    return panopticGetTickSpacingAndInitializedTicks(
      <Ethereumish>chain,
      connector,
      req
    );
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}
