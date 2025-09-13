export interface EnvelopeInfo {
  id: number;
  creator: string;
  totalAmount: string;
  remainingAmount: string;
  totalPackets: number;
  remainingPackets: number;
  claimedBy: string[];
  isActive: boolean;
  createdAt: number;
}

export interface ClaimResult {
  amount: string;
  transactionHash: string;
}

// 新增：RedPacket 合约相关类型
export interface RedPacketInfo {
  remainingAmount: string;
  claimedCount: number;
  maxRecipients: number;
  isFinished: boolean;
  claimers: string[];
  contractBalance: string;
  totalAmount: string;        // 新增：初始总额度
  distributedAmount: string;  // 新增：已分配金额
}

export interface UserClaimInfo {
  hasClaimed: boolean;
  claimedAmount: string;
}

export interface ContractInfo {
  address: string;
  owner: string;
  totalSupply: string;
  isActive: boolean;
}

// 新增：合约常量类型
export interface ContractConstants {
  totalAmount: string;
  maxRecipients: number;
}

// 新增：红包统计信息类型
export interface RedPacketStats {
  initialAmount: string;
  distributedAmount: string;
  remainingAmount: string;
  participantCount: number;
  maxParticipants: number;
  progressPercentage: number;
  isCompleted: boolean;
}