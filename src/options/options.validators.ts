import {
  isFloatString,
  mkValidator,
  mkRequestValidator,
  RequestValidator,
  Validator,
} from '../services/validators';

import {
  validateChain,
  validateNetwork,
  isAddress as isEthereumAddress,
  invalidAddressError,
} from '../chains/ethereum/ethereum.validators';

import { FeeAmount } from '@uniswap/v3-sdk';

export const invalidConnectorError: string =
  'The connector param is not a string.';

export const invalidQuoteError: string = 'The quote param is not a string.';

export const invalidBaseError: string = 'The base param is not a string.';

export const invalidTokenError: string =
  'One of the token params is not a string.';

export const invalidAmountError: string =
  'The amount param must be a string of a non-negative integer.';

export const invalidSideError: string =
  'The side param must be a string of "BUY" or "SELL".';

export const invalidPerpSideError: string =
  'The side param must be a string of "LONG" or "SHORT".';

export const invalidFeeTier: string = 'Incorrect fee tier';

export const invalidLimitPriceError: string =
  'The limitPrice param may be null or a string of a float or integer number.';

export const invalidLPPriceError: string =
  'One of the LP prices may be null or a string of a float or integer number.';

export const invalidPositionIdListError: string =
  'The positionIdList must be a list of uint256.';

export const invalidTimeError: string =
  'Period or interval has to be a non-negative integer.';

export const invalidDecreasePercentError: string =
  'If decreasePercent is included it must be a non-negative integer.';

export const invalidAllowedSlippageError: string =
  'The allowedSlippage param may be null or a string of a fraction.';

export const invalidPoolIdError: string =
  'PoolId(if supplied) must be a string.';

export const invalidPositionSizeError: string =
  'The positionSize must be a positive number passed as a string.';

export const invalidEffectiveLiquidityLimitError: string =
  'The effectiveLiquidityLimit must be a positive number.';

export const invalidTickLimitLowError: string =
  'The tickLimitLow must be a number between -887272 and 0.';

export const invalidTickLimitHighError: string =
  'The tickLimitHigh must be a number between 0 and 887272.';

export const invalidNewPositionIdListError: string =
  'The newPositionIdList must be a list of BigNumbers.';

  export const invalidBurnTokenIdError: string =
  'The burnTokenId must be a BigNumber.';

export const validateConnector: Validator = mkValidator(
  'connector',
  invalidConnectorError,
  (val) => typeof val === 'string'
);

// given a request, look for a key called address that is an Ethereum wallet
export const validateAddress: Validator = mkValidator(
  'address',
  invalidAddressError,
  (val) => typeof val === 'string' && (isEthereumAddress(val))
);

export const validateQuote: Validator = mkValidator(
  'quote',
  invalidQuoteError,
  (val) => typeof val === 'string'
);

export const validateBase: Validator = mkValidator(
  'base',
  invalidBaseError,
  (val) => typeof val === 'string'
);

export const validateToken0: Validator = mkValidator(
  'token0',
  invalidTokenError,
  (val) => typeof val === 'string'
);

export const validateToken1: Validator = mkValidator(
  'token1',
  invalidTokenError,
  (val) => typeof val === 'string'
);

export const validateAmount: Validator = mkValidator(
  'amount',
  invalidAmountError,
  (val) => typeof val === 'string' && isFloatString(val)
);

export const validateAmount0: Validator = mkValidator(
  'amount0',
  invalidAmountError,
  (val) => typeof val === 'string'
);

export const validateAmount1: Validator = mkValidator(
  'amount1',
  invalidAmountError,
  (val) => typeof val === 'string'
);

export const validateSide: Validator = mkValidator(
  'side',
  invalidSideError,
  (val) => typeof val === 'string' && (val === 'BUY' || val === 'SELL')
);

export const validatePerpSide: Validator = mkValidator(
  'side',
  invalidPerpSideError,
  (val) => typeof val === 'string' && (val === 'LONG' || val === 'SHORT')
);

export const validateFee: Validator = mkValidator(
  'fee',
  invalidFeeTier,
  (val) =>
    typeof val === 'string' && Object.keys(FeeAmount).includes(val.toUpperCase())
);

export const validateLowerPrice: Validator = mkValidator(
  'lowerPrice',
  invalidLPPriceError,
  (val) => typeof val === 'string' && isFloatString(val),
  true
);

export const validateUpperPrice: Validator = mkValidator(
  'upperPrice',
  invalidLPPriceError,
  (val) => typeof val === 'string' && isFloatString(val),
  true
);

export const validateLimitPrice: Validator = mkValidator(
  'limitPrice',
  invalidLimitPriceError,
  (val) => typeof val === 'string' && isFloatString(val),
  true
);

// TODO: Validate that each element is a valid tokenID
export const validatePositionIdList: Validator = mkValidator(
  'positionIdList',
  invalidPositionIdListError,
  (val) => val.length !== 0,
  true
);

export const validatePeriod: Validator = mkValidator(
  'period',
  invalidTimeError,
  (val) => typeof val === 'number' && val >= 0 && Number.isInteger(val),
  true
);

export const validateInterval: Validator = mkValidator(
  'interval',
  invalidTimeError,
  (val) => typeof val === 'number' && val >= 0 && Number.isInteger(val),
  true
);

export const validateDecreasePercent: Validator = mkValidator(
  'decreasePercent',
  invalidDecreasePercentError,
  (val) =>
    typeof val === 'undefined' ||
    (typeof val === 'number' && val >= 0 && Number.isFinite(val)),
  true
);

export const validateAllowedSlippage: Validator = mkValidator(
  'allowedSlippage',
  invalidAllowedSlippageError,
  (val) => typeof val === 'string' && (isFractionString(val) || val.includes('%')),
  true
);

export const validatePoolId: Validator = mkValidator(
  'poolId',
  invalidPoolIdError,
  (val) => typeof val === 'string' && val.length !== 0,
  true
);

export const validatePositionSize: Validator = mkValidator(
  'positionSize',
  invalidPositionSizeError,
  (val) => typeof val === 'string' && val.length !== 0,
  true
);

export const validateEffectiveLiquidityLimit: Validator = mkValidator(
  'effectiveLiquidityLimit',
  invalidEffectiveLiquidityLimitError,
  (val) =>
    (typeof val === 'number' && val >= 0 && Number.isFinite(val)),
  true
);

export const validateTickLimitLow: Validator = mkValidator(
  'tickLimitLow',
  invalidTickLimitLowError,
  (val) =>
    (typeof val === 'number' && val <= 887272 && val >= -887272),
  true
);

export const validateTickLimitHigh: Validator = mkValidator(
  'tickLimitHigh',
  invalidTickLimitHighError,
  (val) =>
    (typeof val === 'number' && val <= 887272 && val >= -887272),
  true
);

export const validateNewPositionIdList: Validator = mkValidator(
  'newPositionIdList',
  invalidNewPositionIdListError,
  (val) => val.length !== 0,
  true
);

export const validateBurnTokenId: Validator = mkValidator(
  'burnTokenId',
  invalidBurnTokenIdError,
  (val) => typeof val === 'string'
);


export const validateMintRequest: RequestValidator = mkRequestValidator([
  validateConnector,
  validateChain,
  validateNetwork,
  validateAddress,
  validatePositionIdList,
  validatePositionSize,
  validateEffectiveLiquidityLimit,
  validateTickLimitLow,
  validateTickLimitHigh
]);

export const validateBurnRequest: RequestValidator = mkRequestValidator([
  validateConnector,
  validateChain,
  validateNetwork,
  validateAddress,
  validateBurnTokenId,
  validateNewPositionIdList,
  validateTickLimitLow,
  validateTickLimitHigh,
]);
