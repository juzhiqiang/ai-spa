// 以太坊相关类型定义

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, handler: (...args: any[]) => void) => void;
    removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
    selectedAddress?: string;
    chainId?: string;
    networkVersion?: string;
  };
  ethers?: any;
}

export interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  selectedAddress?: string;
  chainId?: string;
  networkVersion?: string;
}

export interface ENSResolver {
  getAvatar(): Promise<string | null>;
  getName(): Promise<string | null>;
  getText(key: string): Promise<string | null>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    ethers?: any;
  }
}