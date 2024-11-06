import {
  NetworkSelectionRequest,
} from '../services/common-interfaces';
import { BigNumber, Wallet } from 'ethers';
import { ContractReceipt } from 'ethers';

export interface PanopticRequest {
  chain: string;
  network: string;
  connector?: string | undefined;
  address?: string;
}

export interface PanopticPoolRequest extends PanopticRequest {
  panopticPool: string;
}

export interface BroadcastedTxResponse {
  network?: string;
  timestamp?: number;
  nonce?: number;
  txHash?: string | BigNumber;
  tx?: { [key: string]: any };
}

export interface EstimateGasResponse {
  network: string;
  timestamp: number;
  gasPrice: number;
  gasPriceToken: string;
  gasLimit: number;
  gasCost: string;
}
export interface CalculateDeltaRequest extends PanopticRequest {
  STRIKE: number;
  RANGE: number;
  PRICE: number;
}

export interface CalculateDeltaResponse {
  delta: number;
}

export interface CalculateGammaRequest extends PanopticRequest {
  STRIKE: number;
  RANGE: number;
  PRICE: number;
}

export interface CalculateGammaResponse {
  gamma: number;
}

export interface GetTokenAddressRequest extends PanopticRequest {
  tokenSymbol: string;
}

export interface GetTokenAddressResponse {
  tokenAddress: string;
  tokenDecimals: number;
}

export interface GreekQueryRequest extends PanopticRequest {
  address: string;
  panopticPool?: string,
  STRIKE: number;
  RANGE: number;
  PRICE: number;
  string: string;
  tick: number;
  positionIdList: BigNumber[];
  greek: string;
}

export interface GreekQueryResponse {
  greek: number;
  address?: string;
  STRIKE?: number;
  RANGE?: number;
  PRICE?: number;
  string?: string;
  tick?: number;
  positionIdList?: BigNumber[];
}

export interface QueryPositionsRequest extends PanopticPoolRequest {
  wallet: Wallet;
  address: string;
}

export interface QueryPositionsResponse extends QuerySubgraphResponse {
  positions?: BigNumber[];
  closedPositionIdList?: BigNumber[];
  openPositionIdList?: BigNumber[];
}

export interface QueryPriceRequest extends PanopticRequest {
  wallet: Wallet;
  address: string;
  uniV3Pool: string;
}
export interface QueryPriceResponse extends QuerySubgraphResponse {
  feeTier?: BigNumber[];
  sqrtPrice?: BigNumber[];
  liquidity?: BigNumber[];
}

export interface QuerySubgraphRequest extends PanopticRequest {
  query: string;
  variables: Record<string, string | string[] | number | number[] | BigNumber | BigNumber[]>;
}

export interface QuerySubgraphResponse {
  queryResponse: string;
}

export interface CreatePositionRequest extends PanopticRequest{
  wallet: Wallet;
  univ3pool: string;
  address: string;
}

export interface CheckCollateralRequest extends PanopticRequest{
  panopticPool: string;
  address: string;
  atTick: number;
  positionIdList: string[];
}

export interface CheckCollateralResponse{
  collateralBalance0: number;
  requiredCollateral0: number;
  collateralBalance1: number;
  requiredCollateral1: number;
}

export interface CreateBigLizardRequest extends CreatePositionRequest {
  width: number;
  longCallStrike: number;
  straddleStrike: number;
  asset: BigNumber;
}

export interface CreateCallCalendarSpreadRequest extends CreatePositionRequest {
  widthLong: number;
  widthShort: number;
  strike: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreateCallDiagonalSpreadRequest extends CreatePositionRequest {
  widthLong: number;
  widthShort: number;
  strikeLong: number;
  strikeShort: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreateCallRatioSpreadRequest extends CreatePositionRequest {
  width: number;
  longStrike: number;
  shortStrike: number;
  asset: BigNumber;
  ratio: BigNumber;
  start: BigNumber;
}

export interface CreateCallSpreadRequest extends CreatePositionRequest {
  width: number;
  strikeLong: number;
  strikeShort: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreateCallZEBRASpreadRequest extends CreatePositionRequest {
  width: number;
  longStrike: number;
  shortStrike: number;
  asset: BigNumber;
  ratio: BigNumber;
  start: BigNumber;
}

export interface CreateIronButterflyRequest extends CreatePositionRequest {
  width: number;
  strike: number;
  wingWidth: number;
  asset: BigNumber;
}

export interface CreateIronCondorRequest extends CreatePositionRequest {
  width: number;
  callStrike: number;
  putStrike: number;
  wingWidth: number;
  asset: BigNumber;
}

export interface CreateJadeLizardRequest extends CreatePositionRequest {
  width: number;
  longCallStrike: number;
  shortCallStrike: number;
  shortPutStrike: number;
  asset: BigNumber;
}

export interface CreatePutCalendarSpreadRequest extends CreatePositionRequest {
  widthLong: number;
  widthShort: number;
  strike: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}
export interface CreatePutDiagonalSpreadRequest extends CreatePositionRequest {
  widthLong: number;
  widthShort: number;
  strikeLong: number;
  strikeShort: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreatePutRatioSpreadRequest extends CreatePositionRequest {
  width: number;
  longStrike: number;
  shortStrike: number;
  asset: BigNumber;
  ratio: BigNumber;
  start: BigNumber;
}

export interface CreatePutSpreadRequest extends CreatePositionRequest {
  width: number;
  strikeLong: number;
  strikeShort: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreatePutZEBRASpreadRequest extends CreatePositionRequest {
  width: number;
  longStrike: number;
  shortStrike: number;
  asset: BigNumber;
  ratio: BigNumber;
  start: BigNumber;
}

export interface CreateStraddleRequest extends CreatePositionRequest {
  width: number;
  strike: number;
  asset: number;
  isLong: number;
  optionRatio: number;
  start: number;
}

export interface CreateStrangleRequest extends CreatePositionRequest {
  width: number;
  callStrike: number;
  putStrike: number;
  asset: BigNumber;
  isLong: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}
export interface CreateSuperBearRequest extends CreatePositionRequest {
  width: number;
  longPutStrike: number;
  shortPutStrike: number;
  shortCallStrike: number;
  asset: BigNumber;
}

export interface CreateSuperBullRequest extends CreatePositionRequest {
  width: number;
  longCallStrike: number;
  shortCallStrike: number;
  shortPutStrike: number;
  asset: BigNumber;
}

export interface CreateZEEHBSRequest extends CreatePositionRequest {
  width: number;
  longStrike: number;
  shortStrike: number;
  asset: BigNumber;
  ratio: BigNumber;
}

export interface PositionLegInformation{
  poolId: string,
  UniswapV3Pool: string,
  asset: string,
  optionRatio: string,
  tokenType: string,
  isLong: string,
  riskPartner: string,
  strike: number,
  width: number
}
export interface UnwrapTokenIdRequest extends PanopticRequest {
  address: string;
  tokenId: string;
}

export interface UnwrapTokenIdResponse {
  numberOfLegs: number;
  legInfo: PositionLegInformation[];
}

export interface CreateAddLegsRequest extends CreatePositionRequest {
  self: BigNumber;
  legIndex: BigNumber;
  optionRatio: BigNumber;
  asset: BigNumber;
  isLong: BigNumber;
  tokenType: BigNumber;
  riskPartner: BigNumber;
  strike: number;
  width: number;
}

export interface CreatePositionResponse {
  tokenId: string;
}

export interface CalculateAccumulatedFeesBatchRequest extends PanopticPoolRequest {
  wallet: Wallet;
  includePendingPremium: boolean;
  positionIdList: BigNumber[];
  address: string;
}

export interface CalculateAccumulatedFeesBatchResponse {
  premium0: BigNumber;
  premium1: BigNumber;
  balances: BigNumber;
}

export interface ExecuteBurnRequest extends PanopticPoolRequest {
  address: string;
  chain: string;
  network: string;
  burnTokenId: BigNumber;
  newPositionIdList: BigNumber[];
  tickLimitLow: number;
  tickLimitHigh: number;
}

export interface ExecuteBurnAndMintRequest extends PanopticPoolRequest {
  address: string;
  chain: string;
  network: string;
  burnTokenId: BigNumber;
  postburnPositionIdList: BigNumber[];
  mintTokenId: BigNumber;
  positionSize: BigNumber;
  effectiveLiquidityLimit: BigNumber;
  burnTickLimitLow: number;
  burnTickLimitHigh: number;
  mintTickLimitLow: number;
  mintTickLimitHigh: number;
}

export interface CollateralTokenRequest extends PanopticPoolRequest {
  wallet: Wallet;
  address: string;
}

export interface CollateralTokenResponse {
  collateralToken: BigNumber;
}

export interface ForceExerciseRequest extends PanopticPoolRequest {
  wallet: Wallet;
  touchedId: BigNumber[];
  positionIdListExercisee: BigNumber[];
  positionIdListExercisor: BigNumber[];
  address: string;
}

export interface ForceExerciseResponse extends BroadcastedTxResponse{
  tx: ContractReceipt;
}

export interface LiquidateRequest extends PanopticPoolRequest {
  wallet: Wallet;
  positionIdListLiquidator: BigNumber[];
  liquidatee: BigNumber;
  delegations: number;
  positionIdList: BigNumber[];
  address: string;
}

export interface LiquidateResponse extends BroadcastedTxResponse{
  tx: ContractReceipt;
}

export interface ExecuteMintRequest extends NetworkSelectionRequest {
  address: string;
  positionIdList: BigNumber[];
  positionSize: BigNumber;
  effectiveLiquidityLimit: BigNumber;
  panopticPool: string;
}

export interface NumberOfPositionsRequest extends PanopticPoolRequest {
  wallet: Wallet;
  address: string;
}

export interface NumberOfPositionsResponse {
  numberOfPositions: BigNumber;
}

export interface OptionPositionBalanceRequest extends PanopticPoolRequest {
  wallet: Wallet;
  tokenId: BigNumber;
  address: string;
}

export interface OptionsPositionBalanceResponse {
  balance: BigNumber;
  poolUtilization0: BigNumber;
  poolUtilization1: BigNumber;
}

export interface PokeMedianRequest extends PanopticPoolRequest {
  address: string;
}

export interface PokeMedianResponse extends BroadcastedTxResponse{
  tx: ContractReceipt;
}

export interface SettleLongPremiumRequest extends PanopticPoolRequest {
  wallet: Wallet;
  positionIdList: BigNumber[];
  owner: BigNumber;
  legIndex: BigNumber;
  address: string;
}

export interface SettleLongPremiumResponse extends BroadcastedTxResponse{
  tx: ContractReceipt;
}

export interface DepositRequest extends PanopticRequest {
  wallet: Wallet;
  collateralTracker: BigNumber;
  assets: BigNumber;
  address: string;
}

export interface DepositResponse extends BroadcastedTxResponse{
  sharesReceived?: BigNumber
}

export interface GetAssetRequest extends PanopticRequest {
  wallet: Wallet;
  collateralTracker: BigNumber;
  address: string;
}

export interface GetAssetResponse extends BroadcastedTxResponse{
  assetTokenAddress?: string;
}

export interface GetPoolDataRequest extends PanopticRequest {
  wallet: Wallet;
  collateralTracker: BigNumber;
  address: string;
}

export interface GetPoolDataResponse {
  poolAssets: BigNumber;
  insideAMM: BigNumber;
  currentPoolUtilization: BigNumber;
}

export interface MaxWithdrawRequest extends PanopticRequest {
  wallet: Wallet;
  collateralTracker: BigNumber;
  address: string;
}

export interface MaxWithdrawResponse {
  maxAssets: BigNumber
}

export interface WithdrawRequest extends PanopticRequest {
  wallet: Wallet;
  collateralTracker: BigNumber;
  assets: BigNumber;
  address: string;
}

export interface WithdrawResponse extends BroadcastedTxResponse{
  sharesWithdrawn?: BigNumber
}

export interface GetAccountLiquidityRequest extends PanopticRequest {
  wallet: Wallet;
  univ3pool: BigNumber;
  owner: BigNumber;
  tokenType: BigNumber;
  tickLower: number;
  tickUpper: number;
  address: string;
}

export interface GetAccountLiquidityResponse {
  accountLiquidity: BigNumber;
}

export interface GetAccountPremiumRequest extends PanopticRequest {
  wallet: Wallet;
  univ3pool: BigNumber;
  owner: BigNumber;
  tokenType: BigNumber;
  tickLower: number;
  tickUpper: number;
  atTick: number;
  isLong: BigNumber;
  address: string;
}

export interface GetAccountPremiumResponse {
  premiumForToken0: BigNumber;
  premiumForToken1: BigNumber;
}

export interface GetAccountFeesBaseRequest extends PanopticRequest {
  wallet: Wallet;
  univ3pool: BigNumber;
  owner: BigNumber;
  tokenType: BigNumber;
  tickLower: number;
  tickUpper: number;
  address: string;
}

export interface GetAccountFeesBaseResponse {
  feesBase0: BigNumber;
  feesBase1: BigNumber;
}

export interface BurnResponse {
  tx: ContractReceipt;
  network?: string;
  timestamp?: number;
  latency?: number;
  base?: string;
  quote?: string;
  amount?: string; // traderequest.amount
  finalAmountReceived?: string; //
  rawAmount?: string;
  finalAmountReceived_basetoken?: string; //
  expectedIn?: string;
  expectedOut?: string;  // : expectedAmountReceived
  expectedPrice?: string;  //
  price?: string; // : finalPrice
  gasPrice?: number;
  gasPriceToken?: string;
  gasLimit?: number;
  gasWanted?: string; //
  gasCost?: string; // : gasUsed
  nonce?: number;
  txHash?: string | BigNumber;
  other?: any
}

export interface MintResponse extends BroadcastedTxResponse{
  tx: ContractReceipt;
  latency?: number;
  base?: string;
  quote?: string;
  amount?: string; // traderequest.amount
  finalAmountReceived?: string; //
  rawAmount?: string;
  finalAmountReceived_basetoken?: string; //
  expectedIn?: string;
  expectedOut?: string;  // : expectedAmountReceived
  expectedPrice?: string;  //
  price?: string; // : finalPrice
  gasPrice?: number;
  gasPriceToken?: string;
  gasLimit?: number;
  gasWanted?: string; //
  gasCost?: string; // : gasUsed
  other?: any
}

export interface BurnAndMintResponse extends BurnResponse {}

export interface GetPanopticPoolRequest extends PanopticRequest{
  address: string;
  uniswapV3PoolAddress: string;
}

export interface GetPanopticPoolResponse{
  panopticPoolAddress: string;
}

export interface CheckUniswapV3PoolRequest extends PanopticRequest{
  address: string;
  t0_address: string;
  t1_address: string;
  fee: 500 | 3000 | 10000; // 500 for 0.05%, 3000 for 0.3%, 10000 for 1%
}

export interface CheckUniswapV3PoolResponse{
  uniswapV3PoolAddress: string;
}

export interface GetSpotPriceRequest extends PanopticRequest{
  address: string;
  uniswapV3PoolAddress: string;
  token0Decimals: number;
  token1Decimals: number;
}

export interface GetSpotPriceResponse{
  spotPrice: number
}

export interface GetTickSpacingAndInitializedTicksRequest extends PanopticRequest{
  address: string;
  uniswapV3PoolAddress: string;
}

export interface GetTickSpacingAndInitializedTicksResponse{
  tickSpacing: number;
  ticks: number[];
  // initializedTicks: number[];
}
