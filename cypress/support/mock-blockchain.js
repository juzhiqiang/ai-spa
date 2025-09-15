// Mock Blockchain Service for E2E Testing
// 这个文件提供完整的区块链模拟，不需要真实的私钥或助记词

/**
 * 创建完整的区块链环境模拟
 */
export class MockBlockchain {
  constructor() {
    this.accounts = new Map();
    this.contracts = new Map();
    this.transactions = new Map();
    this.currentBlockNumber = 12345678;
  }

  /**
   * 添加测试账户（不涉及真实私钥）
   */
  addTestAccount(address, isOwner = false, balance = '1000000000000000000') {
    this.accounts.set(address.toLowerCase(), {
      address,
      balance,
      isOwner,
      claimedAmount: '0',
      hasClaimed: false,
      nonce: 0
    });
  }

  /**
   * 创建红包合约状态
   */
  createRedPacketContract(contractAddress, config = {}) {
    const defaultConfig = {
      owner: '0x1234567890123456789012345678901234567890',
      totalAmount: '50000000000000000', // 0.05 ETH
      distributedAmount: '0',
      maxRecipients: 6,
      claimedCount: 0,
      isActive: true,
      ...config
    };

    this.contracts.set(contractAddress.toLowerCase(), defaultConfig);
  }

  /**
   * 模拟用户领取红包
   */
  simulateClaimRedPacket(userAddress, contractAddress) {
    const contract = this.contracts.get(contractAddress.toLowerCase());
    const user = this.accounts.get(userAddress.toLowerCase());

    if (!contract || !user) {
      throw new Error('Contract or user not found');
    }

    if (user.hasClaimed) {
      throw new Error('Already claimed');
    }

    if (contract.claimedCount >= contract.maxRecipients) {
      throw new Error('All red packets claimed');
    }

    // 随机生成领取金额
    const remainingAmount = parseInt(contract.totalAmount) - parseInt(contract.distributedAmount);
    const remainingRecipients = contract.maxRecipients - contract.claimedCount;
    const minAmount = Math.floor(remainingAmount * 0.1 / remainingRecipients);
    const maxAmount = Math.floor(remainingAmount * 0.4 / remainingRecipients);
    const claimedAmount = Math.floor(Math.random() * (maxAmount - minAmount) + minAmount).toString();

    // 更新状态
    user.hasClaimed = true;
    user.claimedAmount = claimedAmount;
    contract.claimedCount += 1;
    contract.distributedAmount = (parseInt(contract.distributedAmount) + parseInt(claimedAmount)).toString();

    // 生成模拟交易哈希
    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    this.transactions.set(txHash, {
      from: userAddress,
      to: contractAddress,
      value: claimedAmount,
      type: 'claim',
      blockNumber: this.currentBlockNumber++,
      timestamp: Date.now()
    });

    return {
      transactionHash: txHash,
      amount: (parseInt(claimedAmount) / 1e18).toFixed(6), // 转换为 ETH
      blockNumber: this.currentBlockNumber - 1
    };
  }

  /**
   * 模拟所有者充值红包
   */
  simulateDepositRedPacket(ownerAddress, contractAddress, amount) {
    const contract = this.contracts.get(contractAddress.toLowerCase());
    const owner = this.accounts.get(ownerAddress.toLowerCase());

    if (!contract || !owner) {
      throw new Error('Contract or owner not found');
    }

    if (!owner.isOwner) {
      throw new Error('Only contract owner can deposit');
    }

    const ownerBalance = parseInt(owner.balance);
    const depositAmount = parseInt(amount);

    if (ownerBalance < depositAmount) {
      throw new Error('insufficient funds');
    }

    // 更新状态
    owner.balance = (ownerBalance - depositAmount).toString();
    contract.totalAmount = (parseInt(contract.totalAmount) + depositAmount).toString();

    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    this.transactions.set(txHash, {
      from: ownerAddress,
      to: contractAddress,
      value: amount,
      type: 'deposit',
      blockNumber: this.currentBlockNumber++,
      timestamp: Date.now()
    });

    return {
      transactionHash: txHash,
      amount: (depositAmount / 1e18).toFixed(6),
      blockNumber: this.currentBlockNumber - 1
    };
  }

  /**
   * 获取红包合约信息
   */
  getRedPacketInfo(contractAddress) {
    const contract = this.contracts.get(contractAddress.toLowerCase());
    if (!contract) {
      throw new Error('Contract not found');
    }

    return {
      totalAmount: (parseInt(contract.totalAmount) / 1e18).toFixed(6),
      distributedAmount: (parseInt(contract.distributedAmount) / 1e18).toFixed(6),
      claimedCount: contract.claimedCount,
      maxRecipients: contract.maxRecipients,
      isActive: contract.isActive,
      owner: contract.owner
    };
  }

  /**
   * 检查用户是否已领取
   */
  hasUserClaimed(userAddress) {
    const user = this.accounts.get(userAddress.toLowerCase());
    return user ? user.hasClaimed : false;
  }

  /**
   * 获取用户已领取金额
   */
  getUserClaimedAmount(userAddress) {
    const user = this.accounts.get(userAddress.toLowerCase());
    if (!user || !user.hasClaimed) return '0';
    return (parseInt(user.claimedAmount) / 1e18).toFixed(6);
  }

  /**
   * 重置所有状态（用于测试）
   */
  reset() {
    this.accounts.clear();
    this.contracts.clear();
    this.transactions.clear();
    this.currentBlockNumber = 12345678;
  }
}

/**
 * Cypress 自定义命令：设置完整的区块链模拟环境
 */
Cypress.Commands.add('setupMockBlockchain', (config = {}) => {
  const mockChain = new MockBlockchain();

  // 设置测试账户
  const accounts = config.accounts || [
    { address: '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e', isOwner: false, balance: '2000000000000000000' },
    { address: '0x1234567890123456789012345678901234567890', isOwner: true, balance: '5000000000000000000' },
    { address: '0x9876543210987654321098765432109876543210', isOwner: false, balance: '1000000000000000000' }
  ];

  accounts.forEach(acc => {
    mockChain.addTestAccount(acc.address, acc.isOwner, acc.balance);
  });

  // 设置红包合约
  const contractAddress = config.contractAddress || '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  mockChain.createRedPacketContract(contractAddress, config.contractConfig);

  cy.window().then((win) => {
    // 将模拟区块链实例存储到window对象中
    win.mockBlockchain = mockChain;

    // Enhanced MetaMask mock with proper event handling
    const eventHandlers = new Map();
    
    win.ethereum = {
      isMetaMask: true,
      selectedAddress: null, // Start disconnected
      chainId: '0x1', // Ethereum mainnet (app expects mainnet)
      networkVersion: '1',
      isConnected: () => !!win.ethereum.selectedAddress,
      
      // Event handling system
      _eventHandlers: eventHandlers,
      
      on: cy.stub().as('ethereumOn').callsFake((eventName, handler) => {
        if (!eventHandlers.has(eventName)) {
          eventHandlers.set(eventName, []);
        }
        eventHandlers.get(eventName).push(handler);
      }),
      
      removeListener: cy.stub().as('ethereumRemoveListener').callsFake((eventName, handler) => {
        if (eventHandlers.has(eventName)) {
          const handlers = eventHandlers.get(eventName);
          const index = handlers.indexOf(handler);
          if (index > -1) {
            handlers.splice(index, 1);
          }
        }
      }),
      
      // Enhanced request method with proper async behavior
      request: cy.stub().as('ethereumRequest').callsFake(async (params) => {
        // Add realistic delay to simulate MetaMask response time
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const result = await handleEthereumRequest(params, mockChain, contractAddress, win.ethereum, eventHandlers);
        
        // Trigger events after state changes
        if (params.method === 'eth_requestAccounts' && result.length > 0) {
          win.ethereum.selectedAddress = result[0];
          setTimeout(() => {
            triggerEvent(eventHandlers, 'accountsChanged', result);
          }, 100);
        }
        
        return result;
      }),
      
      // Utility method to trigger events (for testing)
      _triggerEvent: (eventName, ...args) => {
        triggerEvent(eventHandlers, eventName, ...args);
      }
    };

    console.log('Mock ethereum provider setup complete:', win.ethereum);

    // Trigger initial setup events if needed
    if (accounts.length > 0 && !win.ethereum.selectedAddress) {
      console.log('Auto-connecting to first account:', accounts[0].address);
      // Don't auto-connect, let the test explicitly connect
    }
  });
});

/**
 * Trigger MetaMask events
 */
function triggerEvent(eventHandlers, eventName, ...args) {
  if (eventHandlers.has(eventName)) {
    eventHandlers.get(eventName).forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.warn(`Error in ${eventName} event handler:`, error);
      }
    });
  }
}

/**
 * 处理以太坊请求的核心逻辑
 */
function handleEthereumRequest(params, mockChain, contractAddress, ethereumProvider, eventHandlers) {
  switch (params.method) {
    case 'eth_requestAccounts':
      // Return all available accounts for connection
      const allAccounts = Array.from(mockChain.accounts.keys());
      if (allAccounts.length > 0) {
        ethereumProvider.selectedAddress = allAccounts[0];
      }
      return Promise.resolve(allAccounts);
      
    case 'eth_accounts':
      // Return connected accounts only
      return Promise.resolve(ethereumProvider.selectedAddress ? [ethereumProvider.selectedAddress] : []);

    case 'eth_chainId':
      return Promise.resolve('0x1'); // Mainnet

    case 'net_version':
      return Promise.resolve('1');

    case 'eth_getBalance':
      const balanceAddress = params.params[0].toLowerCase();
      const account = mockChain.accounts.get(balanceAddress);
      return Promise.resolve(account ? '0x' + parseInt(account.balance).toString(16) : '0x0');

    case 'eth_call':
      return handleContractCall(params, mockChain, contractAddress);

    case 'eth_sendTransaction':
      return handleTransaction(params, mockChain, contractAddress);

    case 'eth_getTransactionReceipt':
      const txHash = params.params[0];
      const tx = mockChain.transactions.get(txHash);
      if (tx) {
        return Promise.resolve({
          transactionHash: txHash,
          blockNumber: '0x' + tx.blockNumber.toString(16),
          status: '0x1', // 成功
          gasUsed: '0x5208',
          logs: tx.type === 'claim' ? [{
            topics: ['0x123456789'], // Mock event signature
            data: '0x' + parseInt(tx.value).toString(16).padStart(64, '0') // Claimed amount
          }] : []
        });
      }
      return Promise.resolve(null);

    case 'wallet_revokePermissions':
      // Handle wallet disconnection
      ethereumProvider.selectedAddress = null;
      setTimeout(() => {
        triggerEvent(eventHandlers, 'accountsChanged', []);
        triggerEvent(eventHandlers, 'disconnect', { code: 4900, message: 'User disconnected' });
      }, 50);
      return Promise.resolve(null);

    default:
      return Promise.resolve('0x0');
  }
}

/**
 * 处理合约调用
 */
function handleContractCall(params, mockChain, contractAddress) {
  const data = params.params[0].data || '';

  // owner() - 0x8da5cb5b
  if (data.includes('8da5cb5b')) {
    const contract = mockChain.contracts.get(contractAddress.toLowerCase());
    return Promise.resolve('0x000000000000000000000000' + contract.owner.slice(2));
  }

  // getRedPacketInfo()
  if (data.length <= 10 || data.includes('getRedPacketInfo')) {
    const info = mockChain.getRedPacketInfo(contractAddress);
    return Promise.resolve(
      '0x' +
      parseInt(parseFloat(info.totalAmount) * 1e18).toString(16).padStart(64, '0') +
      parseInt(parseFloat(info.distributedAmount) * 1e18).toString(16).padStart(64, '0') +
      info.claimedCount.toString(16).padStart(64, '0')
    );
  }

  // hasUserClaimed(address) or hasClaimed(address) - check if contains address parameter
  if (data.length > 70 && (data.includes('hasClaimed') || data.length === 74)) {
    const userAddress = '0x' + data.slice(-40);
    const hasClaimed = mockChain.hasUserClaimed(userAddress);
    return Promise.resolve(hasClaimed ? '0x0000000000000000000000000000000000000000000000000000000000000001' : '0x0000000000000000000000000000000000000000000000000000000000000000');
  }

  // getUserClaimedAmount(address) or claimedAmount(address)
  if (data.includes('getUserClaimedAmount') || data.includes('claimedAmount')) {
    const userAddress = '0x' + data.slice(-40);
    const amount = mockChain.getUserClaimedAmount(userAddress);
    return Promise.resolve('0x' + parseInt(parseFloat(amount) * 1e18).toString(16).padStart(64, '0'));
  }

  // maxRecipients()
  if (data.includes('maxRecipients')) {
    const contract = mockChain.contracts.get(contractAddress.toLowerCase());
    return Promise.resolve('0x' + contract.maxRecipients.toString(16).padStart(64, '0'));
  }

  return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
}

/**
 * 处理交易
 */
function handleTransaction(params, mockChain, contractAddress) {
  const tx = params.params[0];
  const fromAddress = tx.from.toLowerCase();
  const data = tx.data || '';

  try {
    // 充值红包交易
    if (tx.value && parseInt(tx.value, 16) > 0) {
      const result = mockChain.simulateDepositRedPacket(fromAddress, contractAddress, tx.value);
      return Promise.resolve(result.transactionHash);
    }

    // 领取红包交易
    if (data.includes('claim') || tx.to.toLowerCase() === contractAddress.toLowerCase()) {
      const result = mockChain.simulateClaimRedPacket(fromAddress, contractAddress);
      return Promise.resolve(result.transactionHash);
    }

    // 默认成功交易
    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    return Promise.resolve(txHash);

  } catch (error) {
    return Promise.reject(new Error(error.message));
  }
}

/**
 * Cypress 命令：模拟特定的红包状态
 */
Cypress.Commands.add('setRedPacketScenario', (scenario) => {
  cy.window().then((win) => {
    const mockChain = win.mockBlockchain;
    if (!mockChain) return;

    // 预定义的测试场景
    const scenarios = {
      'fresh': {
        contractConfig: { claimedCount: 0, distributedAmount: '0' }
      },
      'partial': {
        contractConfig: { claimedCount: 3, distributedAmount: '30000000000000000' }
      },
      'exhausted': {
        contractConfig: { claimedCount: 6, distributedAmount: '50000000000000000' }
      },
      'user-claimed': {
        contractConfig: { claimedCount: 2, distributedAmount: '20000000000000000' },
        userStates: [
          { address: '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e', hasClaimed: true, claimedAmount: '8000000000000000' }
        ]
      }
    };

    const config = scenarios[scenario];
    if (config) {
      // 更新合约状态
      const contractAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
      const contract = mockChain.contracts.get(contractAddress.toLowerCase());
      Object.assign(contract, config.contractConfig);

      // 更新用户状态
      if (config.userStates) {
        config.userStates.forEach(userState => {
          const user = mockChain.accounts.get(userState.address.toLowerCase());
          if (user) {
            Object.assign(user, userState);
          }
        });
      }
    }
  });
});

/**
 * Cypress 命令：获取模拟交易结果
 */
Cypress.Commands.add('getLastTransaction', () => {
  return cy.window().then((win) => {
    const mockChain = win.mockBlockchain;
    const transactions = Array.from(mockChain.transactions.values());
    return transactions[transactions.length - 1];
  });
});