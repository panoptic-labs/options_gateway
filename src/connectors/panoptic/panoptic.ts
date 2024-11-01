import {
  BigNumber,
  Contract,
  Wallet,
  ContractTransaction,
  ContractReceipt
} from 'ethers';
import { PanopticConfig } from './panoptic.config';
import {
  Token
} from '@uniswap/sdk';
import { Ethereum } from '../../chains/ethereum/ethereum';
import { getAddress } from 'ethers/lib/utils';
import panopticPoolAbi from './PanopticPool.ABI.json';
import tokenIdLibraryAbi from './TokenIdLibrary.ABI.json';
import panopticHelperAbi from './PanopticHelper.ABI.json';
import collateralTrackerAbi from './CollateralTracker.ABI.json';
import semiFungiblePositionManagerAbi from './SFPM.ABI.json';
import axios, { AxiosResponse } from 'axios';

export class Panoptic {
  private static _instances: { [name: string]: Panoptic };
  private chainInstance;
  private _chain: string;
  private _network: string;
  private _MulticallAddress: string;
  private _UniswapV3Factory: string;
  private _NonFungiblePositionManager: string;
  private _SemiFungiblePositionManager: string;
  private _PanopticFactory: string;
  private _PanopticHelper: string;
  private _UniswapMigrator: string;
  private _TokenIdLibrary: string;
  private _absoluteGasLimit: number;
  private _gasLimitCushionFactor: number;
  private _subgraphUrl: string;
  private _lowestTick: number;
  private _highestTick: number;
  private chainId;
  private tokenList: Record<string, Token> = {};
  private _ready: boolean = false;

  private constructor(chain: string, network: string) {
    this._chain = chain;
    this._network = network;
    const config = PanopticConfig.config;
    this.chainInstance = this.getChainInstance(network);
    this.chainId = this.chainInstance.chainId;
    this._MulticallAddress = config.multiCallAddress(chain, network);
    this._UniswapV3Factory = config.UniswapV3Factory(chain, network);
    this._NonFungiblePositionManager = config.NonFungiblePositionManager(chain, network);
    this._SemiFungiblePositionManager = config.SemiFungiblePositionManager(chain, network);
    this._PanopticFactory = config.PanopticFactory(chain, network);
    this._PanopticHelper = config.PanopticHelper(chain, network);
    this._UniswapMigrator = config.UniswapMigrator(chain, network);
    this._TokenIdLibrary = config.TokenIdLibrary(chain, network);
    this._subgraphUrl = config.subgraphUrl;
    this._lowestTick = config.lowestTick;
    this._highestTick = config.highestTick;
    this._absoluteGasLimit = config.absoluteGasLimit;
    this._gasLimitCushionFactor = config.gasLimitCushionFactor;
  }

  public static getInstance(chain: string, network: string): Panoptic {
    if (Panoptic._instances === undefined) {
      Panoptic._instances = {};
    }
    if (!(chain + network in Panoptic._instances)) {
      Panoptic._instances[chain + network] = new Panoptic(chain, network);
    }

    return Panoptic._instances[chain + network];
  }

  public getChainInstance(network: string) {
    if (this._chain === 'ethereum') {
      return Ethereum.getInstance(network);
    } else {
      throw new Error('unsupported chain');
    }
  }

  /**
   * Given a token's address, return the connector's native representation of
   * the token.
   *
   * @param address Token address
   */
  public getTokenByAddress(address: string): Token {
    return this.tokenList[getAddress(address)];
  }

  public async init() {
    if (!this.chainInstance.ready()) {
      await this.chainInstance.init();
    }
    for (const token of this.chainInstance.storedTokenList) {
      this.tokenList[token.address] = new Token(
        this.chainId,
        token.address,
        token.decimals,
        token.symbol,
        token.name
      );
    }
    this._ready = true;
  }

  public ready(): boolean {
    return this._ready;
  }

  public get multiCallAddress(): string {
    return this._MulticallAddress;
  }
  public get UniswapV3Factory(): string {
    return this._UniswapV3Factory;
  }
  public get NonFungiblePositionManager(): string {
    return this._NonFungiblePositionManager;
  }
  public get SemiFungiblePositionManager(): string {
    return this._SemiFungiblePositionManager;
  }
  public get PanopticFactory(): string {
    return this._PanopticFactory;
  }
  public get PanopticHelper(): string {
    return this._PanopticHelper;
  }
  public get UniswapMigrator(): string {
    return this._UniswapMigrator;
  }
  public get TokenIdLibrary(): string {
    return this._TokenIdLibrary;
  }
  public get LOWEST_POSSIBLE_TICK(): number {
    return this._lowestTick;
  }
  public get HIGHEST_POSSIBLE_TICK(): number {
    return this._highestTick;
  }
  public get absoluteGasLimit(): number {
    return this._absoluteGasLimit;
  }
  public get gasLimitCushionFactor(): number {
    return this._gasLimitCushionFactor;
  }
  public get subgraphUrl(): string {
    return this._subgraphUrl;
  }
  public get chainName(): string {
    if (this._chain === 'ethereum' && this._network === 'sepolia') {
      return 'eth';
    }
    return this._chain;
  }

  async _gradient(arr: number[]): Promise<number[]> {
    return arr.map((_, index, array) => {
      if (index === 0) {
        return array[1] - array[0];
      } else if (index === array.length - 1) {
        return array[array.length - 1] - array[array.length - 2];
      } else {
        return (array[index + 1] - array[index - 1]) / 2;
      }
    });
  }

  // TODO: Should check that this works
  async _getPayoffGradients(
    STRIKE: number,
    RANGE: number,
    PRICE: number
  ): Promise<{ payoffGradient: number[], pGradient: number[], index: number }> {
    const N = 1000;

    // Generate linspace array
    const linspace = (start: number, end: number, num: number): number[] => {
      const step = (end - start) / (num - 1);
      return Array.from({ length: num }, (_, i) => start + (i * step));
    };

    const p = linspace(STRIKE / 3, 1.75 * STRIKE, N);

    // Define the V function
    const V = (x: number, K: number, r: number): number => {
      if (x <= K / r) {
        return x;
      } else if (x > K / r && x <= K * r) {
        return (2 * Math.sqrt(x * K * r) - x - K) / (r - 1);
      } else {
        return K;
      }
    };

    // Calculate payoff
    const payoff = p.map(x => V(x, STRIKE, RANGE) - V(PRICE, STRIKE, RANGE));

    const payoffGradient = await this._gradient(payoff);
    const pGradient = await this._gradient(p);
    return { payoffGradient, pGradient, index: p.findIndex(x => x >= PRICE) };
  }

  // TODO: In the future, we could deliver a calculateObservedDelta and denote this as merely the
  //       Black-Scholles delta. Same for gamma.
  // TODO: Write a opinionated gateway method that wraps this one but passes in the Uniswap.currentTick for PRICE
  async calculateDelta(
    STRIKE: number,
    RANGE: number,
    PRICE: number
  ): Promise<number | Error> {
    try {
      const { payoffGradient, pGradient, index } = await this._getPayoffGradients(STRIKE, RANGE, PRICE);
      return Math.floor(100 * (payoffGradient[index] / pGradient[index]));
    } catch (error) {
      return new Error("Error calculating delta: " + (error as Error).message);
    }
  }

  // TODO: Write a opinionated gateway method that wraps this one but passes in the Uniswap.currentTick for PRICE
  async calculateGamma(
    STRIKE: number,
    RANGE: number,
    PRICE: number
  ): Promise<number | Error> {
    try {
      const { payoffGradient, pGradient, index } = await this._getPayoffGradients(STRIKE, RANGE, PRICE);
      const payoffGradient2 = await this._gradient(payoffGradient);
      const pGradient2 = await this._gradient(pGradient);
      return Math.floor(100 * (payoffGradient2[index] / pGradient2[index]));
    } catch (error) {
      return new Error("Error calculating gamma: " + (error as Error).message);
    }
  }

  // TODO: These methods on the helper aren't live yet; eventually, this will be the easier way
  //       to get multiple greeks in one call.
  async queryGreeks(
    wallet: Wallet,
    panopticPool: string | undefined,
    tick: number,
    positionIdList: BigNumber[],
    greek: string
  ): Promise<number | Error> {
    try {
      const panopticHelper = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelper, panopticHelperAbi.abi, wallet);
      let response;
      if (greek === "delta") {
        response = await panopticHelperContract.delta(panopticPool, wallet.address, tick, positionIdList);
      } else if (greek === "gamma") {
        response = await panopticHelperContract.gamma(panopticPool, wallet.address, tick, positionIdList);
      } else {
        throw new Error("Invalid greek");
      }
      return response;
    } catch (error) {
      return new Error("Error on queryGreeks: " + (error as Error).message);
    }
  }

  // Subgraph interactions
  async queryPositions(
    wallet: Wallet
  ): Promise<AxiosResponse | Error> {
    try {
      const query = `
      query GetAccountsPositions(
        $account: String!
      ) {
       panopticPoolAccounts(
          where: { account: $account }
        ) {
          accountBalances(
            first: 32
            orderBy: createdBlockNumber
            orderDirection: desc
          ) {
            tokenId { id }
          }
          closedAccountBalances: accountBalances(
            first: 1000
            orderBy: closedTimestamp
            orderDirection: desc
            where: {
              isOpen: 0
              txnClosed_not: null
              txnClosed_: { eventType_in: [OptionBurn, AccountLiquidated, ForcedExercised] }
            }
          ) {
            tokenId { id }
          }
        }
      }
    `;
      const variables = {
        account: wallet.address.toLowerCase(),
      };
      return await this.querySubgraph(query, variables);
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Error querying open positions:" + error.message);
      } else {
        return new Error("Unknown error querying open positions");
      }
    }
  }

  async querySubgraph(
    query: string,
    variables: Record<string, string | string[] | number | number[] | BigNumber | BigNumber[]>
  ): Promise<AxiosResponse | Error> {
    try {
      return await axios.post(this.subgraphUrl, { query, variables });
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Error querying Panoptic Subgraph:" + error.message);
      } else {
        return new Error("Unknown error querying Panoptic Subgraph");
      }
    }
  }

  // PanopticHelper interactions
  async createBigLizard(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    longCallStrike: number,
    straddleStrike: number,
    asset: BigNumber,
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createBigLizard(
        univ3pool,
        width,
        longCallStrike,
        straddleStrike,
        asset
      );
    } catch (error) {
      return new Error("Error calculating createBigLizard: " + (error as Error).message);
    }
  }

  async createCallCalendarSpread(
    wallet: Wallet,
    univ3pool: BigNumber,
    widthLong: number,
    widthShort: number,
    strike: number,
    asset: BigNumber,
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createCallCalendarSpread(
        univ3pool,
        widthLong,
        widthShort,
        strike,
        asset,
        optionRatio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createCallCalendarSpread: " + (error as Error).message);
    }
  }

  async createCallDiagonalSpread(
    wallet: Wallet,
    univ3pool: BigNumber,
    widthLong: number,
    widthShort: number,
    strikeLong: number,
    strikeShort: number,
    asset: BigNumber,
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createCallDiagonalSpread(
        univ3pool,
        widthLong,
        widthShort,
        strikeLong,
        strikeShort,
        asset,
        optionRatio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createCallDiagonalSpread: " + (error as Error).message);
    }
  }

  async createCallRatioSpread(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    longStrike: number,
    shortStrike: number,
    asset: BigNumber,
    ratio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createCallRatioSpread(
        univ3pool,
        width,
        longStrike,
        shortStrike,
        asset,
        ratio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createCallRatioSpread: " + (error as Error).message);
    }
  }

  async createCallSpread(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    strikeLong: number,
    strikeShort: number,
    asset: BigNumber,
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createCallSpread(
        univ3pool,
        width,
        strikeLong,
        strikeShort,
        asset,
        optionRatio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createCallSpread: " + (error as Error).message);
    }
  }

  async createCallZEBRASpread(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    longStrike: number,
    shortStrike: number,
    asset: BigNumber,
    ratio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createCallZEBRASpread(
        univ3pool,
        width,
        longStrike,
        shortStrike,
        asset,
        ratio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createCallZEBRASpread: " + (error as Error).message);
    }
  }

  async createIronButterfly(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    strike: number,
    wingWidth: number,
    asset: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createIronButterfly(
        univ3pool,
        width,
        strike,
        wingWidth,
        asset
      )
    } catch (error) {
      return new Error("Error calculating createIronButterfly: " + (error as Error).message);
    }
  }

  async createIronCondor(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    callStrike: number,
    putStrike: number,
    wingWidth: number,
    asset: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createIronCondor(
        univ3pool,
        width,
        callStrike,
        putStrike,
        wingWidth,
        asset
      );
    } catch (error) {
      return new Error("Error calculating createIronCondor: " + (error as Error).message);
    }
  }

  async createJadeLizard(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    longCallStrike: number,
    shortCallStrike: number,
    shortPutStrike: number,
    asset: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createJadeLizard(
        univ3pool,
        width,
        longCallStrike,
        shortCallStrike,
        shortPutStrike,
        asset
      );
    } catch (error) {
      return new Error("Error calculating createJadeLizard: " + (error as Error).message);
    }
  }

  async createPutCalendarSpread(
    wallet: Wallet,
    univ3pool: BigNumber,
    widthLong: number,
    widthShort: number,
    strike: number,
    asset: BigNumber,
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createPutCalendarSpread(
        univ3pool,
        widthLong,
        widthShort,
        strike,
        asset,
        optionRatio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createPutCalendarSpread: " + (error as Error).message);
    }
  }

  async createPutDiagonalSpread(
    wallet: Wallet,
    univ3pool: BigNumber,
    widthLong: number,
    widthShort: number,
    strikeLong: number,
    strikeShort: number,
    asset: BigNumber,
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createPutDiagonalSpread(
        univ3pool,
        widthLong,
        widthShort,
        strikeLong,
        strikeShort,
        asset,
        optionRatio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createPutDiagonalSpread: " + (error as Error).message);
    }
  }

  async createPutRatioSpread(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    longStrike: number,
    shortStrike: number,
    asset: BigNumber,
    ratio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createPutRatioSpread(
        univ3pool,
        width,
        longStrike,
        shortStrike,
        asset,
        ratio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createPutRatioSpread: " + (error as Error).message);
    }
  }

  async createPutSpread(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    strikeLong: number,
    strikeShort: number,
    asset: BigNumber,
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createPutSpread(
        univ3pool,
        width,
        strikeLong,
        strikeShort,
        asset,
        optionRatio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createPutSpread: " + (error as Error).message);
    }
  }

  async createPutZEBRASpread(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    longStrike: number,
    shortStrike: number,
    asset: BigNumber,
    ratio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createPutZEBRASpread(
        univ3pool,
        width,
        longStrike,
        shortStrike,
        asset,
        ratio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createPutZEBRASpread: " + (error as Error).message);
    }
  }

  async createStraddle(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    strike: number,
    asset: BigNumber,
    isLong: BigNumber,
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createStraddle(
        univ3pool,
        width,
        strike,
        asset,
        isLong,
        optionRatio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createStraddle: " + (error as Error).message);
    }
  }

  async createStrangle(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    callStrike: number,
    putStrike: number,
    asset: BigNumber,
    isLong: BigNumber,
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createStrangle(
        univ3pool,
        width,
        callStrike,
        putStrike,
        asset,
        isLong,
        optionRatio,
        start
      );
    } catch (error) {
      return new Error("Error calculating createStrangle: " + (error as Error).message);
    }
  }

  async createSuperBear(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    longPutStrike: number,
    shortPutStrike: number,
    shortCallStrike: number,
    asset: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createSuperBear(
        univ3pool,
        width,
        longPutStrike,
        shortPutStrike,
        shortCallStrike,
        asset
      );
    } catch (error) {
      return new Error("Error calculating createSuperBear: " + (error as Error).message);
    }
  }

  async createSuperBull(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    longCallStrike: number,
    shortCallStrike: number,
    shortPutStrike: number,
    asset: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createSuperBull(
        univ3pool,
        width,
        longCallStrike,
        shortCallStrike,
        shortPutStrike,
        asset
      );
    } catch (error) {
      return new Error("Error calculating createSuperBull: " + (error as Error).message);
    }
  }

  async createZEEHBS(
    wallet: Wallet,
    univ3pool: BigNumber,
    width: number,
    longStrike: number,
    shortStrike: number,
    asset: BigNumber,
    ratio: BigNumber
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      return await panopticHelperContract.createZEEHBS(
        univ3pool,
        width,
        longStrike,
        shortStrike,
        asset,
        ratio
      );
    } catch (error) {
      return new Error("Error calculating createZEEHBS: " + (error as Error).message);
    }
  }

  // PanopticPool interactions
  async calculateAccumulatedFeesBatch(
    wallet: Wallet,
    panopticPool: string, 
    includePendingPremium: boolean = false,
    positionIdList: BigNumber[]
  ): Promise<{ "premium0": BigNumber, "premium1": BigNumber, [key: number]: BigNumber } | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      const result = await panopticPoolContract.calculateAccumulatedFeesBatch(
        wallet.address,
        includePendingPremium,
        positionIdList
      );
      const { premium0, premium1, ...rest } = result;
      return { premium0, premium1, ...rest };
    } catch (error) {
      return new Error("Error on calculateAccumulatedFeesBatch: " + (error as Error).message);
    }
  }

  async collateralToken0(
    wallet: Wallet,
    panopticPool: string
  ): Promise<{"collateralToken": BigNumber} | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      return await panopticPoolContract.collateralToken0();
    } catch (error) {
      return new Error("Error on collateralToken0: " + (error as Error).message);
    }
  }

  async collateralToken1(
    wallet: Wallet, 
    panopticPool: string
  ): Promise<{"collateralToken": BigNumber} | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      return await panopticPoolContract.collateralToken1();
    } catch (error) {
      return new Error("Error on collateralToken1: " + (error as Error).message);
    }
  }

  async executeBurn(
    wallet: Wallet,
    panopticPool: string, 
    burnTokenId: BigNumber,
    newPositionIdList: BigNumber[],
    tickLimitLow: number = this.LOWEST_POSSIBLE_TICK,
    tickLimitHigh: number = this.HIGHEST_POSSIBLE_TICK
  ): Promise<ContractReceipt | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      const gasEstimate: number = (await panopticPoolContract.estimateGas["burnOptions(uint256,uint256[],int24,int24)"](
        burnTokenId,
        newPositionIdList,
        tickLimitLow,
        tickLimitHigh
      )).toNumber();
      const gasLimit: number = Math.ceil(this.gasLimitCushionFactor * gasEstimate);
      if (gasLimit > this.absoluteGasLimit) {
        return new Error(`Error on executeBurn: Gas limit exceeded, gas estimate limit (${gasLimit}) greater than tx cap (${this.absoluteGasLimit})...`);
      }
      const tx: ContractTransaction = await panopticPoolContract["burnOptions(uint256,uint256[],int24,int24)"](
        burnTokenId,
        newPositionIdList,
        tickLimitLow,
        tickLimitHigh,
        { gasLimit: BigNumber.from(gasLimit) }
      );
      const receipt: ContractReceipt = await tx.wait();
      return receipt;
    } catch (error) {
      return new Error("Error on executeBurn: " + (error as Error).message);
    }
  }

  async forceExercise(
    wallet: Wallet,
    panopticPool: string,
    touchedId: BigNumber[],
    positionIdListExercisee: BigNumber[],
    positionIdListExercisor: BigNumber[]
  ): Promise<ContractReceipt | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      const gasEstimate: number = (await panopticPoolContract.estimateGas.forceExercise(
        wallet.address,
        touchedId,
        positionIdListExercisee,
        positionIdListExercisor
      )).toNumber();
      const gasLimit: number = Math.ceil(this.gasLimitCushionFactor * gasEstimate);
      if (gasLimit > this.absoluteGasLimit) {
        return new Error(`Error on forceExercise: Gas limit exceeded, gas estimate limit (${gasLimit}) greater than tx cap (${this.absoluteGasLimit})...`);
      }
      const tx: ContractTransaction = await panopticPoolContract.forceExercise(
        wallet.address,
        touchedId,
        positionIdListExercisee,
        positionIdListExercisor,
        { gasLimit: BigNumber.from(gasLimit) }
      );
      const receipt: ContractReceipt = await tx.wait();
      return receipt;
    } catch (error) {
      return new Error("Error on forceExercise: " + (error as Error).message);
    }
  }

  async liquidate(
    wallet: Wallet,
    panopticPool: string,
    positionIdListLiquidator: BigNumber[],
    liquidatee: BigNumber,
    delegations: number,
    positionIdList: BigNumber[]
  ): Promise<ContractReceipt | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      const gasEstimate: number = (await panopticPoolContract.estimateGas.liquidate(
        positionIdListLiquidator,
        liquidatee,
        delegations,
        positionIdList
      )).toNumber();
      const gasLimit: number = Math.ceil(this.gasLimitCushionFactor * gasEstimate);
      if (gasLimit > this.absoluteGasLimit) {
        return new Error(`Error on liquidate: Gas limit exceeded, gas estimate limit (${gasLimit}) greater than tx cap (${this.absoluteGasLimit})...`);
      }
      const tx: ContractTransaction = await panopticPoolContract.liquidate(
        positionIdListLiquidator,
        liquidatee,
        delegations,
        positionIdList,
        { gasLimit: BigNumber.from(gasLimit) }
      );
      const receipt: ContractReceipt = await tx.wait();
      return receipt;
    } catch (error) {
      return new Error("Error on liquidate: " + (error as Error).message);
    }
  }

  async executeMint(
    wallet: Wallet,
    panopticPool: string, 
    positionIdList: BigNumber[],
    positionSize: BigNumber,
    effectiveLiquidityLimit: BigNumber,
    tickLimitLow: number = this.LOWEST_POSSIBLE_TICK,
    tickLimitHigh: number = this.HIGHEST_POSSIBLE_TICK
  ): Promise<ContractReceipt | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      const gasEstimate: number = (await panopticPoolContract.estimateGas.mintOptions(
        positionIdList,
        positionSize,
        effectiveLiquidityLimit,
        tickLimitLow,
        tickLimitHigh
      )).toNumber();
      const gasLimit: number = Math.ceil(this.gasLimitCushionFactor * gasEstimate);
      if (gasLimit > this.absoluteGasLimit) {
        return new Error(`Error on executeMint: Gas limit exceeded, gas estimate limit (${gasLimit}) greater than tx cap (${this.absoluteGasLimit})...`);
      }
      const tx: ContractTransaction = await panopticPoolContract.mintOptions(
        positionIdList,
        positionSize,
        effectiveLiquidityLimit,
        tickLimitLow,
        tickLimitHigh,
        { gasLimit: BigNumber.from(gasLimit) }
      );
      const receipt: ContractReceipt = await tx.wait();
      return receipt;
    } catch (error) {
      return new Error("Error on mintOptions: " + (error as Error).message);
    }
  }

  async numberOfPositions(
    wallet: Wallet,
    panopticPool: string
  ): Promise<{"_numberOfPositions": BigNumber} | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      return await panopticPoolContract.numberOfPositions(wallet.address);
    } catch (error) {
      return new Error("Error on numberOfPositions: " + (error as Error).message);
    }
  }

  async optionPositionBalance(
    wallet: Wallet,
    panopticPool: string, 
    tokenId: BigNumber
  ): Promise<{"balance": BigNumber, "poolUtilization0": BigNumber, "poolUtilization1": BigNumber} | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      return await panopticPoolContract.optionPositionBalance(
        wallet.address,
        tokenId
      );
    } catch (error) {
      return new Error("Error on optionsPositionBalance: " + (error as Error).message);
    }
  }

  async pokeMedian(
    wallet: Wallet,
    panopticPool: string
  ): Promise<ContractReceipt | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      const gasEstimate: number = (await panopticPoolContract.estimateGas.pokeMedian()).toNumber();
      const gasLimit: number = Math.ceil(this.gasLimitCushionFactor * gasEstimate);
      if (gasLimit > this.absoluteGasLimit) {
        return new Error(`Error on pokeMedian: Gas limit exceeded, gas estimate limit (${gasLimit}) greater than tx cap (${this.absoluteGasLimit})...`);
      }
      const tx: ContractTransaction = await panopticPoolContract.pokeMedian(
        { gasLimit: BigNumber.from(gasLimit)}
      );
      const receipt: ContractReceipt = await tx.wait();
      return receipt;
    } catch (error) {
      return new Error("Error on pokeMedian: " + (error as Error).message);
    }
  }

  async settleLongPremium(
    wallet: Wallet,
    panopticPool: string,
    positionIdList: BigNumber[],
    owner: BigNumber,
    legIndex: BigNumber
  ): Promise<ContractReceipt | Error> {
    try {
      const panopticPoolContract = new Contract(panopticPool, panopticPoolAbi.abi, wallet);
      const gasEstimate: number = (await panopticPoolContract.estimateGas.settleLongPremium(
        positionIdList,
        owner,
        legIndex
      )).toNumber();
      const gasLimit: number = Math.ceil(this.gasLimitCushionFactor * gasEstimate);
      if (gasLimit > this.absoluteGasLimit) {
        return new Error(`Error on settleLongPremium: Gas limit exceeded, gas estimate limit (${gasLimit}) greater than tx cap (${this.absoluteGasLimit})...`);
      }
      const tx: ContractTransaction = await panopticPoolContract.settleLongPremium(
        positionIdList,
        owner,
        legIndex,
        { gasLimit: BigNumber.from(gasLimit) }
      );
      const receipt: ContractReceipt = await tx.wait();
      return receipt;
    } catch (error) {
      return new Error("Error on settleLongPremium: " + (error as Error).message);
    }
  }

  // CollateralTracker interactions
  async deposit(
    wallet: Wallet,
    collateralTrackerContract: BigNumber,
    assets: BigNumber
  ): Promise<ContractReceipt | Error> {
    try {
      const tokenContract = new Contract(collateralTrackerContract.toString(), collateralTrackerAbi.abi, wallet);
      const gasEstimate: number = (await tokenContract.estimateGas.deposit(
        assets, 
        wallet.address
      )).toNumber();
      const gasLimit: number = Math.ceil(this.gasLimitCushionFactor * gasEstimate);
      if (gasLimit > this.absoluteGasLimit) {
        return new Error(`Error on deposit: Gas limit exceeded, gas estimate limit (${gasLimit}) greater than tx cap (${this.absoluteGasLimit})...`);
      }
      const tx: ContractTransaction = await tokenContract.deposit(
        assets, 
        wallet.address, 
        { gasLimit: BigNumber.from(gasLimit) }
      );
      const receipt: ContractReceipt = await tx.wait();
      return receipt;
    } catch (error) {
      return new Error("Error on deposit: " + (error as Error).message);
    }
  }

  async getAsset(
    wallet: Wallet,
    collateralTrackerContract: BigNumber
  ): Promise<ContractReceipt | Error> {
    try {
      const tokenContract = new Contract(collateralTrackerContract.toString(), collateralTrackerAbi.abi, wallet);
      const receipt = await tokenContract.asset();
      return receipt;
    } catch (error) {
      return new Error("Error on asset: " + (error as Error).message);
    }
  }

  async getPoolData(
    wallet: Wallet,
    collateralTrackerContract: BigNumber
  ): Promise<{"poolAssets": BigNumber, "insideAMM": BigNumber, "currentPoolUtilization": BigNumber} | Error> {
    try {
      const CollateralTracker = new Contract(collateralTrackerContract.toString(), collateralTrackerAbi.abi, wallet);
      return await CollateralTracker.getPoolData();
    } catch (error) {
      return new Error("Error on getPoolData: " + (error as Error).message);
    }
  }

  async maxWithdraw(
    wallet: Wallet,
    collateralTrackerContract: BigNumber
  ): Promise<{"maxAssets": BigNumber} | Error> {
    try {
      const tokenContract = new Contract(collateralTrackerContract.toString(), collateralTrackerAbi.abi, wallet);
      return await tokenContract.maxWithdraw(wallet.address);
    } catch (error) {
      return new Error("Error on maxWithdraw: " + (error as Error).message);
    }
  }

  async withdraw(
    wallet: Wallet,
    collateralTrackerContract: BigNumber,
    assets: BigNumber
  ): Promise<ContractReceipt | Error> {
    try {
      const tokenContract = new Contract(collateralTrackerContract.toString(), collateralTrackerAbi.abi, wallet);
      const gasEstimate: number = (await tokenContract.estimateGas.withdraw(
        assets,
        wallet.address,
        wallet.address
      )).toNumber();
      const gasLimit: number = Math.ceil(this.gasLimitCushionFactor * gasEstimate);
      if (gasLimit > this.absoluteGasLimit) {
        return new Error(`Error on withdraw: Gas limit exceeded, gas estimate limit (${gasLimit}) greater than tx cap (${this.absoluteGasLimit})...`);
      }
      const tx: ContractTransaction = await tokenContract.withdraw(
        assets,
        wallet.address,
        wallet.address,
        { gasLimit: BigNumber.from(gasLimit) }
      );
      const receipt: ContractReceipt = await tx.wait();
      return receipt;
    } catch (error) {
      return new Error("Error on withdraw: " + (error as Error).message);
    }
  }

  // SemiFungiblePositionManager interactions
  async getAccountLiquidity(
    wallet: Wallet,
    univ3pool: BigNumber,
    owner: BigNumber,
    tokenType: BigNumber,
    tickLower: number,
    tickUpper: number
  ): Promise<{"accountLiquidities": BigNumber} | Error> {
    try {
      const semiFungiblePositionManager = this.SemiFungiblePositionManager;
      const semiFungiblePositionManagerContract = new Contract(semiFungiblePositionManager, semiFungiblePositionManagerAbi.abi, wallet);
      return await semiFungiblePositionManagerContract.getAccountLiquidity(
        univ3pool,
        owner,
        tokenType,
        tickLower,
        tickUpper
      );
    } catch (error) {
      return new Error("Error on getAccountLiquidity: " + (error as Error).message);
    }
  }

  async getAccountPremium(
    wallet: Wallet,
    univ3pool: BigNumber,
    owner: BigNumber,
    tokenType: BigNumber,
    tickLower: number,
    tickUpper: number,
    atTick: number,
    isLong: BigNumber
  ): Promise<[BigNumber, BigNumber] | Error> {
    try {
      const semiFungiblePositionManager = this.SemiFungiblePositionManager;
      const semiFungiblePositionManagerContract = new Contract(semiFungiblePositionManager, semiFungiblePositionManagerAbi.abi, wallet);
      const result = await semiFungiblePositionManagerContract.getAccountPremium(
        univ3pool,
        owner,
        tokenType,
        tickLower,
        tickUpper,
        atTick,
        isLong
      );
      return result;
    } catch (error) {
      return new Error("Error on getAccountPremium: " + (error as Error).message);
    }
  }

  async getAccountFeesBase(
    wallet: Wallet,
    univ3pool: BigNumber,
    owner: BigNumber,
    tokenType: BigNumber,
    tickLower: number,
    tickUpper: number
  ): Promise<{"feesBase0": BigNumber, "feesBase1": BigNumber} | Error> {
    try {
      const semiFungiblePositionManager = this.SemiFungiblePositionManager;
      const semiFungiblePositionManagerContract = new Contract(semiFungiblePositionManager, semiFungiblePositionManagerAbi.abi, wallet);
      return await semiFungiblePositionManagerContract.getAccountFeesBase(
        univ3pool,
        owner,
        tokenType,
        tickLower,
        tickUpper
      );
    } catch (error) {
      return new Error("Error on getAccountFeesBase: " + (error as Error).message);
    }
  }

  // TokenIdLibrary interactions
  async addLeg(
    wallet: Wallet,
    self: BigNumber,
    legIndex: BigNumber,
    optionRatio: BigNumber,
    asset: BigNumber,
    isLong: BigNumber,
    tokenType: BigNumber,
    riskPartner: BigNumber,
    strike: number,
    width: number
  ): Promise<{"tokenId": BigNumber} | Error> {
    try {
      const tokenIdLibrary = this.TokenIdLibrary;
      const tokenIdLibraryContract = new Contract(tokenIdLibrary, tokenIdLibraryAbi.abi, wallet);
      return await tokenIdLibraryContract.addLeg(
        self,
        legIndex,
        optionRatio,
        asset,
        isLong,
        tokenType,
        riskPartner,
        strike,
        width
      );
    } catch (error) {
      return new Error("Error on addLeg: " + (error as Error).message);
    }
  }
}
