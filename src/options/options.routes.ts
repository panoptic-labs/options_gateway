/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/ban-types */
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../services/error-handler';
import {
  addLeg,
  mint,
  burn,
  burnAndMint,
  liquidate,
  getCollateralToken0,
  getCollateralToken1,
  getAsset,
  deposit,
  withdraw,
  getPoolData,
  maxWithdraw,
  numberOfPositions,
  querySubgraph,
  checkCollateral,
  createBigLizard,
  createCallCalendarSpread,
  createCallDiagonalSpread,
  createCallRatioSpread,
  createCallSpread,
  createCallZEBRASpread,
  createIronButterfly,
  createIronCondor,
  createJadeLizard,
  createPutCalendarSpread,
  createPutDiagonalSpread,
  createPutRatioSpread,
  createPutSpread,
  createPutZEBRASpread,
  createStraddle,
  createStrangle,
  createSuperBear,
  createSuperBull,
  createZEEHBS,
  unwrapTokenId,
  queryPositions,
  queryPrice,
  queryGreeks,
  calculateAccumulatedFeesBatch,
  optionPositionBalance,
  pokeMedian,
  forceExercise,
  settleLongPremium,
  getAccountLiquidity,
  getAccountPremium,
  getAccountFeesBase,
  calculateDelta,
  calculateGamma,
  getTokenAddress,
  getPanopticPool,
  checkUniswapPool,
  getSpotPrice,
  getTickSpacingAndInitializedTicks
} from './options.controllers';
import {
  ExecuteMintRequest,
  MintResponse,
  ExecuteBurnRequest,
  BurnResponse,
  ExecuteBurnAndMintRequest,
  BurnAndMintResponse,
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
  CreatePositionResponse,
  CalculateAccumulatedFeesBatchRequest,
  CollateralTokenRequest,
  ForceExerciseRequest,
  LiquidateRequest,
  NumberOfPositionsRequest,
  OptionPositionBalanceRequest,
  PokeMedianRequest,
  SettleLongPremiumRequest,
  DepositRequest,
  GetAssetRequest,
  GetPoolDataRequest,
  MaxWithdrawRequest,
  WithdrawRequest,
  GetAccountLiquidityRequest,
  GetAccountPremiumRequest,
  GetAccountFeesBaseRequest,
  CreateAddLegsRequest,
  ForceExerciseResponse,
  LiquidateResponse,
  CollateralTokenResponse,
  GetAssetResponse,
  DepositResponse,
  WithdrawResponse,
  GetPoolDataResponse,
  MaxWithdrawResponse,
  NumberOfPositionsResponse,
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
  CalculateAccumulatedFeesBatchResponse,
  OptionsPositionBalanceResponse,
  PokeMedianResponse,
  SettleLongPremiumResponse,
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
  GetTickSpacingAndInitializedTicksResponse
} from './options.requests';

export namespace OptionsRoutes {
  export const router = Router();

  router.post(
    '/calculateDelta',
    asyncHandler(
      async (
        req: Request<{}, {}, CalculateDeltaRequest>,
        res: Response<CalculateDeltaResponse | Error, {}>
      ) => {
        res.status(200).json(await calculateDelta(req.body));
      }
    )
  );

  router.post(
    '/calculateGamma',
    asyncHandler(
      async (
        req: Request<{}, {}, CalculateGammaRequest>,
        res: Response<CalculateGammaResponse | Error, {}>
      ) => {
        res.status(200).json(await calculateGamma(req.body));
      }
    )
  );

  router.post(
    '/getTokenAddress',
    asyncHandler(
      async (
        req: Request<{}, {}, GetTokenAddressRequest>,
        res: Response<GetTokenAddressResponse | Error, {}>
      ) => {
        res.status(200).json(await getTokenAddress(req.body));
      }
    )
  );

  router.post(
    '/queryGreeks',
    asyncHandler(
      async (
        req: Request<{}, {}, GreekQueryRequest>,
        res: Response<GreekQueryResponse | Error, {}>
      ) => {
        res.status(200).json(await queryGreeks(req.body));
      }
    )
  );

  router.post(
    '/queryPositions',
    asyncHandler(
      async (
        req: Request<{}, {}, QueryPositionsRequest>,
        res: Response<QueryPositionsResponse | Error, {}>
      ) => {
        res.status(200).json(await queryPositions(req.body));
      }
    )
  );

  router.post(
    '/queryPrice',
    asyncHandler(
      async (
        req: Request<{}, {}, QueryPriceRequest>,
        res: Response<QueryPriceResponse | Error, {}>
      ) => {
        res.status(200).json(await queryPrice(req.body));
      }
    )
  );

  router.post(
    '/querySubgraph',
    asyncHandler(
      async (
        req: Request<{}, {}, QuerySubgraphRequest>,
        res: Response<QuerySubgraphResponse | Error, {}>
      ) => {
        res.status(200).json(await querySubgraph(req.body));
      }
    )
  );

  router.post(
    '/checkCollateral',
    asyncHandler(
      async (
        req: Request<{}, {}, CheckCollateralRequest>,
        res: Response<CheckCollateralResponse | Error, {}>
      ) => {
        res.status(200).json(await checkCollateral(req.body));
      }
    )
  );

  router.post(
    '/createBigLizard',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateBigLizardRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createBigLizard(req.body));
      }
    )
  );

  router.post(
    '/createCallCalendarSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateCallCalendarSpreadRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createCallCalendarSpread(req.body));
      }
    )
  );

  router.post(
    '/createCallDiagonalSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateCallDiagonalSpreadRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createCallDiagonalSpread(req.body));
      }
    )
  );

  router.post(
    '/createCallRatioSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateCallRatioSpreadRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createCallRatioSpread(req.body));
      }
    )
  );

  router.post(
    '/createCallSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateCallSpreadRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createCallSpread(req.body));
      }
    )
  );

  router.post(
    '/createCallZEBRASpread',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateCallZEBRASpreadRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createCallZEBRASpread(req.body));
      }
    )
  );

  router.post(
    '/createIronButterfly',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateIronButterflyRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createIronButterfly(req.body));
      }
    )
  );

  router.post(
    '/createIronCondor',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateIronCondorRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createIronCondor(req.body));
      }
    )
  );

  router.post(
    '/createJadeLizard',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateJadeLizardRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createJadeLizard(req.body));
      }
    )
  );

  router.post(
    '/createPutCalendarSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, CreatePutCalendarSpreadRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createPutCalendarSpread(req.body));
      }
    )
  );

  router.post(
    '/createPutDiagonalSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, CreatePutDiagonalSpreadRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createPutDiagonalSpread(req.body));
      }
    )
  );

  router.post(
    '/createPutRatioSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, CreatePutRatioSpreadRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createPutRatioSpread(req.body));
      }
    )
  );

  router.post(
    '/createPutSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, CreatePutSpreadRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createPutSpread(req.body));
      }
    )
  );

  router.post(
    '/createPutZEBRASpread',
    asyncHandler(
      async (
        req: Request<{}, {}, CreatePutZEBRASpreadRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createPutZEBRASpread(req.body));
      }
    )
  );

  router.post(
    '/createStraddle',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateStraddleRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createStraddle(req.body));
      }
    )
  );

  router.post(
    '/createStrangle',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateStrangleRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createStrangle(req.body));
      }
    )
  );

  router.post(
    '/createSuperBear',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateSuperBearRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createSuperBear(req.body));
      }
    )
  );

  router.post(
    '/createSuperBull',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateSuperBullRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createSuperBull(req.body));
      }
    )
  );

  router.post(
    '/createZEEHBS',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateZEEHBSRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await createZEEHBS(req.body));
      }
    )
  );

  router.post(
    '/unwrapTokenId',
    asyncHandler(
      async (
        req: Request<{}, {}, UnwrapTokenIdRequest>,
        res: Response<UnwrapTokenIdResponse | Error, {}>
      ) => {
        res.status(200).json(await unwrapTokenId(req.body));
      }
    )
  );

  router.post(
    '/calculateAccumulatedFeesBatch',
    asyncHandler(
      async (
        req: Request<{}, {}, CalculateAccumulatedFeesBatchRequest>,
        res: Response<CalculateAccumulatedFeesBatchResponse | Error, {}>
      ) => {
        res.status(200).json(await calculateAccumulatedFeesBatch(req.body));
      }
    )
  );

  router.post(
    '/getCollateralToken0',
    asyncHandler(
      async (
        req: Request<{}, {}, CollateralTokenRequest>,
        res: Response<CollateralTokenResponse | Error, {}>
      ) => {
        res.status(200).json(await getCollateralToken0(req.body));
      }
    )
  );

  router.post(
    '/getCollateralToken1',
    asyncHandler(
      async (
        req: Request<{}, {}, CollateralTokenRequest>,
        res: Response<CollateralTokenResponse | Error, {}>
      ) => {
        res.status(200).json(await getCollateralToken1(req.body));
      }
    )
  );

  router.post(
    '/burn',
    asyncHandler(
      async (
        req: Request<{}, {}, ExecuteBurnRequest>,
        res: Response<BurnResponse | Error, {}>
      ) => {
        // TODO: We need to iterate on this; they normally work but we changed up the request format.
        // validateBurnRequest(req.body);
        res.status(200).json(await burn(req.body));
      }
    )
  );

  router.post(
    '/burnAndMint',
    asyncHandler(
      async (
        req: Request<{}, {}, ExecuteBurnAndMintRequest>,
        res: Response<BurnAndMintResponse | Error, {}>
      ) => {
        // TODO: Write validator for burnAndMint
        // validateBurnAndMintRequest(req.body);
        res.status(200).json(await burnAndMint(req.body));
      }
    )
  );

  router.post(
    '/forceExercise',
    asyncHandler(
      async (
        req: Request<{}, {}, ForceExerciseRequest>,
        res: Response<ForceExerciseResponse | Error, {}>
      ) => {
        res.status(200).json(await forceExercise(req.body));
      }
    )
  );

  router.post(
    '/liquidate',
    asyncHandler(
      async (
        req: Request<{}, {}, LiquidateRequest>,
        res: Response<LiquidateResponse | Error, {}>
      ) => {
        res.status(200).json(await liquidate(req.body));
      }
    )
  );

  router.post(
    '/mint',
    asyncHandler(
      async (
        req: Request<{}, {}, ExecuteMintRequest>,
        res: Response<MintResponse | Error, {}>
      ) => {
        // TODO: We need to iterate on this; they normally work but we changed up the request format.
        // validateMintRequest(req.body);
        res.status(200).json(await mint(req.body));
      }
    )
  );

  router.post(
    '/numberOfPositions',
    asyncHandler(
      async (
        req: Request<{}, {}, NumberOfPositionsRequest>,
        res: Response<NumberOfPositionsResponse | Error, {}>
      ) => {
        res.status(200).json(await numberOfPositions(req.body));
      }
    )
  );

  router.post(
    '/optionPositionBalance',
    asyncHandler(
      async (
        req: Request<{}, {}, OptionPositionBalanceRequest>,
        res: Response<OptionsPositionBalanceResponse | Error, {}>
      ) => {
        res.status(200).json(await optionPositionBalance(req.body));
      }
    )
  );

  router.post(
    '/pokeMedian',
    asyncHandler(
      async (
        req: Request<{}, {}, PokeMedianRequest>,
        res: Response<PokeMedianResponse | Error, {}>
      ) => {
        res.status(200).json(await pokeMedian(req.body));
      }
    )
  );

  router.post(
    '/settleLongPremium',
    asyncHandler(
      async (
        req: Request<{}, {}, SettleLongPremiumRequest>,
        res: Response<SettleLongPremiumResponse | Error, {}>
      ) => {
        res.status(200).json(await settleLongPremium(req.body));
      }
    )
  );

  router.post(
    '/deposit',
    asyncHandler(
      async (
        req: Request<{}, {}, DepositRequest>,
        res: Response<DepositResponse | Error, {}>
      ) => {
        res.status(200).json(await deposit(req.body));
      }
    )
  );

  router.post(
    '/getAsset',
    asyncHandler(
      async (
        req: Request<{}, {}, GetAssetRequest>,
        res: Response<GetAssetResponse | Error, {}>
      ) => {
        res.status(200).json(await getAsset(req.body));
      }
    )
  );

  router.post(
    '/getPoolData',
    asyncHandler(
      async (
        req: Request<{}, {}, GetPoolDataRequest>,
        res: Response<GetPoolDataResponse | Error, {}>
      ) => {
        res.status(200).json(await getPoolData(req.body));
      }
    )
  );

  router.post(
    '/maxWithdraw',
    asyncHandler(
      async (
        req: Request<{}, {}, MaxWithdrawRequest>,
        res: Response<MaxWithdrawResponse | Error, {}>
      ) => {
        res.status(200).json(await maxWithdraw(req.body));
      }
    )
  );

  router.post(
    '/withdraw',
    asyncHandler(
      async (
        req: Request<{}, {}, WithdrawRequest>,
        res: Response<WithdrawResponse | Error, {}>
      ) => {
        res.status(200).json(await withdraw(req.body));
      }
    )
  );

  router.post(
    '/getAccountLiquidity',
    asyncHandler(
      async (
        req: Request<{}, {}, GetAccountLiquidityRequest>,
        res: Response<GetAccountLiquidityResponse | Error, {}>
      ) => {
        res.status(200).json(await getAccountLiquidity(req.body));
      }
    )
  );

  router.post(
    '/getAccountPremium',
    asyncHandler(
      async (
        req: Request<{}, {}, GetAccountPremiumRequest>,
        res: Response<GetAccountPremiumResponse | Error, {}>
      ) => {
        res.status(200).json(await getAccountPremium(req.body));
      }
    )
  );

  router.post(
    '/getAccountFeesBase',
    asyncHandler(
      async (
        req: Request<{}, {}, GetAccountFeesBaseRequest>,
        res: Response<GetAccountFeesBaseResponse | Error, {}>
      ) => {
        res.status(200).json(await getAccountFeesBase(req.body));
      }
    )
  );

  router.post(
    '/addLeg',
    asyncHandler(
      async (
        req: Request<{}, {}, CreateAddLegsRequest>,
        res: Response<CreatePositionResponse | Error, {}>
      ) => {
        res.status(200).json(await addLeg(req.body));
      }
    )
  )

  router.post(
    '/getPanopticPool',
    asyncHandler(
      async (
        req: Request<{}, {}, GetPanopticPoolRequest>,
        res: Response<GetPanopticPoolResponse | Error, {}>
      ) => {
        res.status(200).json(await getPanopticPool(req.body));
      }
    )
  )

  router.post(
    '/checkUniswapPool',
    asyncHandler(
      async (
        req: Request<{}, {}, CheckUniswapV3PoolRequest>,
        res: Response<CheckUniswapV3PoolResponse | Error, {}>
      ) => {
        res.status(200).json(await checkUniswapPool(req.body));
      }
    )
  )

  router.post(
    '/getSpotPrice',
    asyncHandler(
      async (
        req: Request<{}, {}, GetSpotPriceRequest>,
        res: Response<GetSpotPriceResponse | Error, {}>
      ) => {
        res.status(200).json(await getSpotPrice(req.body));
      }
    )
  )

  router.post(
    '/getTickSpacingAndInitializedTicks',
    asyncHandler(
      async (
        req: Request<{}, {}, GetTickSpacingAndInitializedTicksRequest>,
        res: Response<GetTickSpacingAndInitializedTicksResponse | Error, {}>
      ) => {
        res.status(200).json(await getTickSpacingAndInitializedTicks(req.body));
      }
    )
  )

}
