describe('Red Packet DApp - Wallet Integration E2E Tests', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');

    // Initialize mock MetaMask
    cy.mockMetaMask();
  });

  describe('Page Layout and Initial State', () => {
    it('should display welcome content when wallet is not connected', () => {
      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('欢迎使用智能合约红包系统').should('be.visible');
      cy.contains('基于以太坊智能合约的去中心化红包系统').should('be.visible');

      // Feature highlights
      cy.contains('🎯 支持最多 6 个用户领取').should('be.visible');
      cy.contains('💰 初始总额度 0.05 ETH').should('be.visible');
      cy.contains('🎲 完全随机分配，公平公正').should('be.visible');
      cy.contains('🔒 智能合约保证安全性').should('be.visible');
      cy.contains('⚡ 支持多账户快速切换，无需重新授权').should('be.visible');

      // Call to action
      cy.contains('请先连接您的 MetaMask 钱包开始使用').should('be.visible');
    });

    it('should show connect wallet button', () => {
      cy.contains('连接钱包').should('be.visible').and('not.be.disabled');
    });

    it('should display footer information', () => {
      cy.contains('🚀 Red Packet DApp - 基于区块链的智能红包系统').should('be.visible');
      cy.contains('⚠️ 仅供学习和测试使用，请在测试网络中使用').should('be.visible');
      cy.contains('⚡ v2.1 - 修复账户切换授权问题，支持真正的无缝切换').should('be.visible');
    });
  });

  describe('Wallet Connection', () => {
    it('should connect wallet successfully', () => {
      const testAddress = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';

      cy.connectWallet(testAddress);

      // Verify address is displayed
      cy.checkAddressFormat(testAddress);

      // Should show disconnect button
      cy.contains('断开连接').should('be.visible');
    });

    it('should show contract information when connected', () => {
      cy.connectWallet();

      cy.contains('📋 合约信息', { timeout: 10000 }).should('be.visible');
      cy.contains('📍 合约地址').should('be.visible');
      cy.contains('👑 合约拥有者').should('be.visible');
    });

    it('should show red packet status when connected', () => {
      cy.connectWallet();

      cy.contains('🎁 红包状态', { timeout: 10000 }).should('be.visible');

      // Should show statistics icons
      cy.contains('💰').should('be.visible'); // Total amount
      cy.contains('📤').should('be.visible'); // Distributed
      cy.contains('👥').should('be.visible'); // Recipients

      cy.contains('总金额').should('be.visible');
      cy.contains('已分发').should('be.visible');
      cy.contains('已领取人数').should('be.visible');
      cy.contains('ETH').should('be.visible');
    });

    it('should show usage instructions when connected', () => {
      cy.connectWallet();

      cy.contains('📖 使用说明', { timeout: 10000 }).should('be.visible');
      cy.contains('🎯 合约拥有者').should('be.visible');
      cy.contains('🧧 用户').should('be.visible');
      cy.contains('🎲 随机分配').should('be.visible');
      cy.contains('⚡ 快速切换').should('be.visible');
      cy.contains('⚠️ 本应用仅供学习测试使用').should('be.visible');
    });
  });

  describe('Contract Owner Functions', () => {
    beforeEach(() => {
      const ownerAddress = '0x1234567890123456789012345678901234567890';
      cy.mockContractOwner(ownerAddress);
      cy.mockRedPacketState();

      cy.reload();
      cy.connectWallet(ownerAddress);
    });

    it('should show owner indicator and deposit button', () => {
      cy.contains('（您）', { timeout: 10000 }).should('be.visible');
      cy.contains('💰 充值红包').should('be.visible');
    });

    it('should handle successful deposit', () => {
      cy.mockTransaction();

      cy.contains('💰 充值红包', { timeout: 10000 }).click();

      // Should show loading state briefly
      cy.get('.loading-spinner').should('be.visible');

      // Wait for transaction to complete
      cy.waitForLoading();
    });

    it('should handle deposit errors', () => {
      cy.mockTransactionError('insufficient funds');

      cy.contains('💰 充值红包', { timeout: 10000 }).click();

      // Should handle error gracefully
      // Error handling depends on implementation - could be alert or UI message
    });
  });

  describe('User Functions - Red Packet Claiming', () => {
    beforeEach(() => {
      const userAddress = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';

      cy.mockRedPacketState({
        claimedCount: 2,
        distributedAmount: '20000000000000000', // 0.02 ETH
        userHasClaimed: false
      });

      cy.connectWallet(userAddress);
    });

    it('should show claim button for unclaimed user', () => {
      cy.contains('🧧 领取红包', { timeout: 10000 }).should('be.visible');
      cy.contains('您可以领取红包').should('be.visible');
      cy.contains('🎁').should('be.visible'); // Gift icon for available claim
    });

    it('should show progress information', () => {
      cy.contains('分发进度', { timeout: 10000 }).should('be.visible');

      // Progress bar should be visible
      cy.get('[style*="width"]').should('exist');

      // Should show statistics
      cy.contains('2/6').should('be.visible'); // claimedCount/maxRecipients
    });

    it('should handle successful claim', () => {
      cy.mockTransaction('0xabcdef123456789');

      cy.contains('🧧 领取红包', { timeout: 10000 }).click();

      // Should show loading
      cy.get('.loading-spinner').should('be.visible');

      cy.waitForLoading();
    });

    it('should handle claim errors', () => {
      cy.mockTransactionError('Already claimed');

      cy.contains('🧧 领取红包', { timeout: 10000 }).click();

      // Should handle error appropriately
    });
  });

  describe('User Functions - Already Claimed State', () => {
    beforeEach(() => {
      const userAddress = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';

      cy.mockRedPacketState({
        claimedCount: 3,
        distributedAmount: '30000000000000000', // 0.03 ETH
        userHasClaimed: true,
        userClaimedAmount: '8000000000000000' // 0.008 ETH
      });

      cy.connectWallet(userAddress);
    });

    it('should show claimed status', () => {
      cy.contains('✅', { timeout: 10000 }).should('be.visible');
      cy.contains('您已领取红包').should('be.visible');
      cy.contains('获得金额').should('be.visible');
      cy.contains('0.008 ETH').should('be.visible');
    });

    it('should not show claim button for claimed user', () => {
      cy.contains('🧧 领取红包').should('not.exist');
    });
  });

  describe('Red Packets Exhausted State', () => {
    beforeEach(() => {
      const userAddress = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';

      cy.mockRedPacketState({
        claimedCount: 6, // All claimed
        distributedAmount: '50000000000000000', // Full 0.05 ETH
        userHasClaimed: false
      });

      cy.connectWallet(userAddress);
    });

    it('should show exhausted message when all red packets are claimed', () => {
      cy.contains('😭', { timeout: 10000 }).should('be.visible');
      cy.contains('红包已被抢完！下次要快一点哦~').should('be.visible');
    });

    it('should not show claim button when exhausted', () => {
      cy.contains('🧧 领取红包').should('not.exist');
    });

    it('should show full progress', () => {
      cy.contains('100.0%', { timeout: 10000 }).should('be.visible');
      cy.contains('6/6').should('be.visible');
    });
  });

  describe('Multi-Account Support', () => {
    it('should show multi-account notification', () => {
      const accounts = [
        '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e',
        '0x9876543210987654321098765432109876543210'
      ];

      cy.mockMetaMask({ accounts, isConnected: true });
      cy.reload();

      cy.connectWallet(accounts[0]);

      cy.contains('检测到 2 个已授权账户', { timeout: 10000 }).should('be.visible');
      cy.contains('可以通过钱包菜单快速切换').should('be.visible');
      cy.contains('完全无需 MetaMask 确认').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.connectWallet();
    });

    it('should work on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone 6/7/8

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('📋 合约信息').should('be.visible');
      cy.contains('🎁 红包状态').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('📋 合约信息').should('be.visible');
      cy.contains('🎁 红包状态').should('be.visible');
    });

    it('should work on desktop viewport', () => {
      cy.viewport(1920, 1080); // Desktop

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('📋 合约信息').should('be.visible');
      cy.contains('🎁 红包状态').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle MetaMask not available', () => {
      // Remove ethereum from window
      cy.window().then((win) => {
        delete (win as any).ethereum;
      });

      cy.reload();

      // Should still show connect button or appropriate message
      cy.contains('连接钱包').should('be.visible');
    });

    it('should handle connection rejection', () => {
      cy.mockMetaMask({ isConnected: false });

      // Mock rejection
      cy.get('@ethereumRequest').callsFake((params: any) => {
        if (params.method === 'eth_requestAccounts') {
          return Promise.reject(new Error('User rejected the request'));
        }
        return Promise.resolve([]);
      });

      cy.contains('连接钱包').click();

      // Should remain in disconnected state
      cy.contains('连接钱包').should('be.visible');
    });

    it('should handle network errors gracefully', () => {
      cy.mockMetaMask();

      // Mock network error
      cy.get('@ethereumRequest').callsFake(() => {
        return Promise.reject(new Error('Network error'));
      });

      cy.contains('连接钱包').click();

      // Should handle gracefully
      cy.contains('连接钱包').should('be.visible');
    });
  });

  describe('Loading States', () => {
    it('should show loading states during operations', () => {
      cy.connectWallet();

      // Mock slow transaction
      cy.get('@ethereumRequest').callsFake((params: any) => {
        if (params.method === 'eth_sendTransaction') {
          return new Promise(resolve => {
            setTimeout(() => resolve('0x123'), 2000);
          });
        }
        return Promise.resolve('0x0');
      });

      // Try to perform an action that would trigger loading
      // This depends on having the contract owner state
      cy.mockContractOwner();
      cy.reload();
      cy.connectWallet();

      cy.contains('💰 充值红包', { timeout: 10000 }).click();

      // Should show loading spinner
      cy.get('.loading-spinner').should('be.visible');
    });
  });
});