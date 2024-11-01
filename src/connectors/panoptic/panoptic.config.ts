import { AvailableNetworks } from '../../services/config-manager-types';
import { ConfigManagerV2 } from '../../services/config-manager-v2';

export namespace PanopticConfig {
  export interface NetworkConfig {
    allowedSlippage: string;
    absoluteGasLimit: number;
    gasLimitCushionFactor: number; 
    ttl: number;
    subgraphUrl: string;
    uniswapV3SubgraphUrl: string; 
    lowestTick: number;
    highestTick: number;
    multiCallAddress: (chain: string, network: string) => string;
    UniswapV3Factory: (chain: string, network: string) => string;
    NonFungiblePositionManager: (chain: string, network: string) => string;
    SemiFungiblePositionManager: (chain: string, network: string) => string;
    PanopticFactory: (chain: string, network: string) => string;
    PanopticHelper: (chain: string, network: string) => string;
    UniswapMigrator: (chain: string, network: string) => string;
    TokenIdLibrary: (chain: string, network: string) => string;
    tradingTypes: Array<string>;
    chainType: string;
    availableNetworks: Array<AvailableNetworks>;
  }

  export const config: NetworkConfig = {
    allowedSlippage: ConfigManagerV2.getInstance().get('panoptic.allowedSlippage'),
    gasLimitCushionFactor: ConfigManagerV2.getInstance().get('panoptic.gasLimitCushionFactor'),
    absoluteGasLimit: ConfigManagerV2.getInstance().get(`panoptic.absoluteGasLimit`),
    ttl: ConfigManagerV2.getInstance().get('panoptic.ttl'),
    subgraphUrl: ConfigManagerV2.getInstance().get('panoptic.subgraph.endpoint'),
    uniswapV3SubgraphUrl: ConfigManagerV2.getInstance().get('panoptic.subgraph.uniswapV3'),
    lowestTick: ConfigManagerV2.getInstance().get('panoptic.lowestTick'),
    highestTick: ConfigManagerV2.getInstance().get('panoptic.highestTick'),
    multiCallAddress: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.multiCallAddress'
      ),
    UniswapV3Factory: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.UniswapV3Factory'
      ),
    NonFungiblePositionManager: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.NonFungiblePositionManager'
      ),
    SemiFungiblePositionManager: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.SemiFungiblePositionManager'
      ),
    PanopticFactory: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.PanopticFactory'
      ),
    PanopticHelper: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.PanopticHelper'
      ),
    UniswapMigrator: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.UniswapMigrator'
      ),
    TokenIdLibrary: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.TokenIdLibrary'
      ),
    tradingTypes: ['AMM'],
    chainType: 'EVM',
    availableNetworks: [
      { chain: 'ethereum', networks: ['sepolia'] },
    ],
  };
}
