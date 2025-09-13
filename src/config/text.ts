// 中文文本配置
export const TEXT = {
  // 主标题
  TITLE: '🧧 智能合约红包系统',
  
  // 钱包连接
  CONNECT_WALLET: '连接 MetaMask',
  CONNECTING: '连接中...',
  DISCONNECT: '断开连接',
  SWITCH_ACCOUNT: '切换账户',
  INSTALL_METAMASK: '请安装 MetaMask 钱包!',
  USER_REJECTED: '用户拒绝了连接请求',
  CONNECT_FAILED: '连接钱包失败，请重试',
  WALLET_CONNECTED: '钱包连接成功',
  WALLET_DISCONNECTED: '钱包已断开连接',
  LOADING_ENS: '加载 ENS 信息中...',
  
  // 合约信息
  CONTRACT_INFO: '📋 合约信息',
  CONTRACT_ADDRESS: '合约地址:',
  TOTAL_ENVELOPES: '已创建红包总数:',
  
  // 创建红包
  CREATE_ENVELOPE: '🧧 创建红包',
  TOTAL_AMOUNT: '💰 红包总金额: ',
  PACKET_COUNT: '📦 红包个数: ',
  RANDOM_ALLOCATION: '🎲 随机分配金额到每个红包，其他用户可以抢取',
  CREATING: '创建中...',
  CREATE_BUTTON: '🚀 创建红包',
  CREATE_SUCCESS: '红包创建成功！\\n交易哈希: ',
  CREATE_FAILED: '创建红包失败，请重试',
  INSUFFICIENT_FUNDS: '余额不足，需要至少 0.05 ETH + Gas费',
  USER_CANCELLED: '用户取消了交易',
  CONNECT_FIRST: '请先连接 MetaMask 钱包',
  
  // 查询红包
  QUERY_ENVELOPE: '🔍 查询红包',
  ENTER_ID: '输入红包ID',
  QUERY_BUTTON: '查询',
  ENVELOPE_INFO: '📦 红包信息',
  ENVELOPE_ID: '红包ID:',
  CREATOR: '创建者:',
  REMAINING_AMOUNT: '剩余金额:',
  TOTAL_PACKETS: '总红包数:',
  REMAINING_PACKETS: '剩余红包数:',
  STATUS: '状态:',
  ACTIVE: ' 🟢 可抢取',
  ENDED: ' 🔴 已抢完',
  CREATED_TIME: '创建时间:',
  CLAIMED_COUNT: '已抢取人数:',
  CLAIM_RECORDS: '抢取记录:',
  
  // 抢红包
  CLAIM_ENVELOPE: '🎉 抢红包',
  CLAIMING: '抢红包中...',
  ALREADY_CLAIMED: '✅ 您已经抢过这个红包了',
  CANNOT_CLAIM_OWN: '❌ 不能抢自己创建的红包',
  ENVELOPE_ENDED: '❌ 红包已被抢完',
  FULLY_CLAIMED: '❌ 红包已被抢光了',
  CANNOT_CLAIM: '❌ 无法抢取',
  CLAIM_SUCCESS: '🎊 恭喜！抢红包成功！',
  TRANSACTION_HASH: '交易哈希: ',
  
  // 错误信息
  QUERY_FAILED: '查询红包失败，请检查红包ID是否正确',
  INVALID_ID: '请输入有效的红包ID',
  ALREADY_CLAIMED_ERROR: '您已经抢过这个红包了！',
  CREATOR_CANNOT_CLAIM: '创建者不能抢自己的红包！',
  NO_PACKETS: '红包已被抢完！',
  CLAIM_FAILED: '抢红包失败，请重试',
  
  // 欢迎页面
  WELCOME_TITLE: '欢迎使用智能合约红包系统',
  WELCOME_DESC1: '基于以太坊智能合约的去中心化红包系统',
  WELCOME_DESC2: '支持创建红包、随机分配金额、多人抢红包等功能',
  FEATURE_1: '🎯 每个红包包含 6 个随机金额的小红包',
  FEATURE_2: '💰 固定总金额 0.05 ETH，随机分配',
  FEATURE_3: '🎲 完全随机分配，公平公正，先到先得',
  FEATURE_4: '🔒 智能合约保证安全性，去中心化运行',
  CONNECT_PROMPT: '请先连接您的 MetaMask 钱包开始抢红包',
  
  // 页脚
  FOOTER_1: '🚀 Red Envelope DApp - 基于区块链的智能红包系统',
  FOOTER_2: '⚠️ 仅供学习和测试使用，请在测试网络中进行测试'
};