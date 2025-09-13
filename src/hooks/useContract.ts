import { useState, useCallback } from 'react';
import { Contract, formatEther, parseEther } from 'ethers';
import type { BrowserProvider } from 'ethers';

// 更新ABI以匹配实际部署的RedPacket合约
const CONTRACT_ABI = [
  "function claimRedPacket() external",
  "function getClaimers() external view returns (address[])",
  "function getRedPacketInfo() external view returns (uint256 _remainingAmount, uint256 _claimedCount, uint256 _maxRecipients, bool _isFinished)",
  "function hasClaimed(address) external view returns (bool)",
  "function claimedAmount(address) external view returns (uint256)",
  "function deposit() external payable",
  "function getContractBalance() external view returns (uint256)",
  "function remainingAmount() external view returns (uint256)",
  "function claimedCount() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function TOTAL_AMOUNT() external view returns (uint256)",
  "function MAX_RECIPIENTS() external view returns (uint256)",
  "event RedPacketClaimed(address indexed claimer, uint256 amount)",
  "event RedPacketCreated(uint256 totalAmount, uint256 maxRecipients)",
  "event RedPacketFinished()"
];

const CONTRACT_ADDRESS = "0xb04611abf453807AC6fDB3151d7839f6f4C53225";

export interface RedPacketInfo {
  remainingAmount: string;
  claimedCount: number;
  maxRecipients: number;
  isFinished: boolean;
  claimers: string[];
  contractBalance: string;
  totalAmount: string;
  distributedAmount: string;
}

export interface ClaimResult {
  amount: string;
  transactionHash: string;
}

export const useContract = (provider: BrowserProvider | null) => {
  const [loading, setLoading] = useState(false);

  const getContract = useCallback(async (withSigner = false) => {
    if (!provider) return null;
    
    try {
      if (withSigner) {
        const signer = await provider.getSigner();
        return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      }
      return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    } catch (error) {
      console.error('Failed to get contract instance:', error);
      return null;
    }
  }, [provider]);

  // 这个函数现在用于向合约充值，因为RedPacket合约需要先充值
  const createEnvelope = async (): Promise<string | null> => {
    if (!provider) {
      throw new Error('Please connect wallet first');
    }
    
    setLoading(true);
    try {
      const contract = await getContract(true);
      if (!contract) {
        throw new Error('Unable to get contract instance');
      }
      
      // 检查是否为合约owner
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const owner = await contract.owner();
      
      if (userAddress.toLowerCase() !== owner.toLowerCase()) {
        throw new Error('Only contract owner can deposit funds');
      }
      
      const tx = await contract.deposit({
        value: parseEther("0.05")
      });
      
      const receipt = await tx.wait();
      return receipt?.hash || null;
    } catch (error: any) {
      console.error('Failed to deposit to contract:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('User cancelled the transaction');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient balance');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const claimEnvelope = async (): Promise<ClaimResult | null> => {
    if (!provider) {
      throw new Error('Please connect wallet first');
    }
    
    setLoading(true);
    try {
      const contract = await getContract(true);
      if (!contract) {
        throw new Error('Unable to get contract instance');
      }
      
      const tx = await contract.claimRedPacket();
      const receipt = await tx.wait();
      
      let claimedAmount = "0";
      if (receipt?.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            if (parsed?.name === 'RedPacketClaimed') {
              claimedAmount = formatEther(parsed.args.amount || 0);
              break;
            }
          } catch {
            // Ignore failed log parsing
          }
        }
      }
      
      return {
        amount: claimedAmount,
        transactionHash: receipt?.hash || ''
      };
    } catch (error: any) {
      console.error('Failed to claim red packet:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('User cancelled the transaction');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRedPacketInfo = async (): Promise<RedPacketInfo | null> => {
    try {
      const contract = await getContract(false);
      if (!contract) return null;
      
      // 获取基本红包信息
      const [remainingAmount, claimedCount, maxRecipients, isFinished] = await contract.getRedPacketInfo();
      
      // 获取其他信息
      const claimers = await contract.getClaimers();
      const contractBalance = await contract.getContractBalance();
      
      // 获取总额度常量
      const totalAmount = await contract.TOTAL_AMOUNT();
      
      // 计算已分配金额
      const distributedAmount = formatEther(BigInt(totalAmount.toString()) - BigInt(remainingAmount.toString()));
      
      return {
        remainingAmount: formatEther(remainingAmount),
        claimedCount: Number(claimedCount),
        maxRecipients: Number(maxRecipients),
        isFinished: isFinished,
        claimers: claimers,
        contractBalance: formatEther(contractBalance),
        totalAmount: formatEther(totalAmount),
        distributedAmount: distributedAmount
      };
    } catch (error) {
      console.error('Failed to get red packet info:', error);
      return null;
    }
  };

  const hasUserClaimed = async (userAddress: string): Promise<boolean> => {
    try {
      const contract = await getContract(false);
      if (!contract) return false;
      
      return await contract.hasClaimed(userAddress);
    } catch (error) {
      console.error('Failed to check if user claimed:', error);
      return false;
    }
  };

  const getUserClaimedAmount = async (userAddress: string): Promise<string> => {
    try {
      const contract = await getContract(false);
      if (!contract) return "0";
      
      const amount = await contract.claimedAmount(userAddress);
      return formatEther(amount);
    } catch (error) {
      console.error('Failed to get user claimed amount:', error);
      return "0";
    }
  };

  const getContractOwner = async (): Promise<string> => {
    try {
      const contract = await getContract(false);
      if (!contract) return "";
      
      return await contract.owner();
    } catch (error) {
      console.error('Failed to get contract owner:', error);
      return "";
    }
  };

  const getContractConstants = async () => {
    try {
      const contract = await getContract(false);
      if (!contract) return { totalAmount: "0.05", maxRecipients: 6 };
      
      const totalAmount = await contract.TOTAL_AMOUNT();
      const maxRecipients = await contract.MAX_RECIPIENTS();
      
      return {
        totalAmount: formatEther(totalAmount),
        maxRecipients: Number(maxRecipients)
      };
    } catch (error) {
      console.error('Failed to get contract constants:', error);
      return { totalAmount: "0.05", maxRecipients: 6 };
    }
  };

  // 为了兼容原有接口，保留这些函数但调整实现
  const getEnvelope = async (): Promise<any> => {
    return await getRedPacketInfo();
  };

  const getTotalEnvelopes = async (): Promise<number> => {
    // RedPacket合约只有一个红包实例
    return 1;
  };

  return {
    loading,
    createEnvelope, // 现在是充值功能
    claimEnvelope, // 现在是领取红包功能
    getEnvelope, // 获取红包信息
    getRedPacketInfo, // 新增：获取红包详细信息
    hasUserClaimed,
    getUserClaimedAmount, // 新增：获取用户领取金额
    getContractOwner, // 新增：获取合约拥有者
    getContractConstants, // 新增：获取合约常量
    getTotalEnvelopes,
    contractAddress: CONTRACT_ADDRESS
  };
};