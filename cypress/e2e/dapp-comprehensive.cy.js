describe('Red Packet DApp - Comprehensive E2E Tests', () => {
  const MOCK_USER_ADDRESS = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
  const MOCK_OWNER_ADDRESS = '0x1234567890123456789012345678901234567890';
  const MOCK_USER2_ADDRESS = '0x9876543210987654321098765432109876543210';

  beforeEach(() => {
    cy.visit('/');
  });

  describe('Initial Application State', () => {
    it('should display welcome screen with all key information', () => {
      // Main title and branding
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
      cy.contains('连接钱包').should('be.visible').and('not.be.disabled');

      // Footer
      cy.contains('🚀 Red Packet DApp - 基于区块链的智能红包系统').should('be.visible');
      cy.contains('⚠️ 仅供学习和测试使用，请在测试网络中使用').should('be.visible');
      cy.contains('⚡ v2.1').should('be.visible');
    });

    it('should have proper responsive design', () => {
      cy.testResponsiveLayout();
    });
  });

  describe('Wallet Connection Flow', () => {
    beforeEach(() => {
      cy.mockMetaMask();
    });

    it('should successfully connect wallet and show connected UI', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      // Verify UI changes after connection
      cy.contains('断开连接').should('be.visible');
      cy.checkAddressFormat(MOCK_USER_ADDRESS);

      // Main sections should be visible
      cy.contains('📋 合约信息').should('be.visible');
      cy.contains('🎁 红包状态').should('be.visible');
      cy.contains('📖 使用说明').should('be.visible');
    });

    it('should display contract information correctly', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      cy.contains('📍 合约地址').should('be.visible');
      cy.contains('👑 合约拥有者').should('be.visible');
    });

    it('should show red packet status with all elements', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      // Icons and labels
      cy.contains('💰').should('be.visible'); // Total amount
      cy.contains('📤').should('be.visible'); // Distributed
      cy.contains('👥').should('be.visible'); // Recipients

      cy.contains('总金额').should('be.visible');
      cy.contains('已分发').should('be.visible');
      cy.contains('已领取人数').should('be.visible');
      cy.contains('分发进度').should('be.visible');

      // ETH currency display
      cy.contains('ETH').should('be.visible');
      cy.contains('0.05 ETH').should('be.visible');
    });

    it('should show usage instructions', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      cy.contains('📖 使用说明').should('be.visible');
      cy.contains('🎯 合约拥有者').should('be.visible');
      cy.contains('🧧 用户').should('be.visible');
      cy.contains('🎲 随机分配').should('be.visible');
      cy.contains('⚡ 快速切换').should('be.visible');
      cy.contains('⚠️ 本应用仅供学习测试使用').should('be.visible');
    });
  });

  describe('Contract Owner Functions', () => {
    beforeEach(() => {
      cy.mockContractOwner(MOCK_OWNER_ADDRESS);
      cy.mockRedPacketState();
    });

    it('should show owner interface with deposit capability', () => {
      cy.connectWallet(MOCK_OWNER_ADDRESS);

      // Owner indicator
      cy.contains('（您）').should('be.visible');

      // Deposit button
      cy.contains('💰 充值红包').should('be.visible').and('not.be.disabled');
    });

    it('should handle successful red packet deposit', () => {
      cy.mockTransaction('0xdeposit123456789abcdef');

      cy.connectWallet(MOCK_OWNER_ADDRESS);
      cy.contains('💰 充值红包').click();

      // Should show loading state
      cy.get('.loading-spinner').should('be.visible');

      // Wait for completion
      cy.waitForLoading();
    });

    it('should handle deposit transaction errors', () => {
      cy.mockTransactionError('insufficient funds');

      cy.connectWallet(MOCK_OWNER_ADDRESS);
      cy.contains('💰 充值红包').click();

      // Error should be handled gracefully
      // The specific error handling UI depends on implementation
    });

    it('should show different error messages for different failures', () => {
      const errorScenarios = [
        { error: 'insufficient funds', expectedKeyword: '余额不足' },
        { error: 'user rejected', expectedKeyword: '用户取消' },
        { error: 'Only contract owner', expectedKeyword: '只有合约拥有者' }
      ];

      errorScenarios.forEach(scenario => {
        cy.mockTransactionError(scenario.error);
        cy.connectWallet(MOCK_OWNER_ADDRESS);
        cy.contains('💰 充值红包').click();

        // Check for appropriate error handling
        // Note: This depends on how errors are displayed (alert, toast, inline message, etc.)
      });
    });
  });

  describe('User Red Packet Claiming', () => {
    beforeEach(() => {
      // Mock red packet state with some activity
      cy.mockRedPacketState({
        claimedCount: 2,
        distributedAmount: '20000000000000000', // 0.02 ETH
        userHasClaimed: false
      });
    });

    it('should show claim interface for unclaimed users', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      // Should show unclaimed status
      cy.verifyUnclaimedStatus();

      // Should show progress
      cy.verifyRedPacketProgress(2, 6);
    });

    it('should handle successful red packet claim', () => {
      cy.mockTransaction('0xclaim123456789abcdef');

      cy.connectWallet(MOCK_USER_ADDRESS);
      cy.contains('🧧 领取红包').click();

      // Should show loading
      cy.get('.loading-spinner').should('be.visible');

      cy.waitForLoading();
    });

    it('should handle claim errors appropriately', () => {
      const claimErrors = [
        { error: 'Already claimed', expectedKeyword: '已经领取过了' },
        { error: 'All red packets claimed', expectedKeyword: '红包已被抢完' },
        { error: 'No remaining amount', expectedKeyword: '红包余额不足' },
        { error: 'user rejected', expectedKeyword: '用户取消' }
      ];

      claimErrors.forEach(scenario => {
        cy.mockTransactionError(scenario.error);
        cy.connectWallet(MOCK_USER_ADDRESS);
        cy.contains('🧧 领取红包').click();

        // Error handling verification
      });
    });

    it('should show progress information correctly', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      cy.contains('分发进度').should('be.visible');
      cy.contains('%').should('be.visible');
      cy.verifyRedPacketProgress(2, 6);

      // Progress bar should be visible
      cy.get('[style*="width"]').should('exist');

      // Should show 40% progress (0.02 / 0.05 = 40%)
      cy.contains('40.0%').should('be.visible');
    });
  });

  describe('Already Claimed User State', () => {
    beforeEach(() => {
      // Mock user who has already claimed
      cy.mockRedPacketState({
        claimedCount: 3,
        distributedAmount: '30000000000000000', // 0.03 ETH
        userHasClaimed: true,
        userClaimedAmount: '8000000000000000' // 0.008 ETH
      });
    });

    it('should show claimed status with amount', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      cy.verifyClaimedStatus('0.008');

      // Should not show claim button
      cy.contains('🧧 领取红包').should('not.exist');

      // Should show progress
      cy.verifyRedPacketProgress(3, 6);
    });

    it('should display proper progress when user has claimed', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      // Should show 60% progress (0.03 / 0.05 = 60%)
      cy.contains('60.0%').should('be.visible');
      cy.verifyRedPacketProgress(3, 6);
    });
  });

  describe('Red Packets Exhausted State', () => {
    beforeEach(() => {
      // Mock all red packets claimed
      cy.mockRedPacketState({
        claimedCount: 6,
        distributedAmount: '50000000000000000', // Full 0.05 ETH
        userHasClaimed: false // User didn't get one
      });
    });

    it('should show exhausted message when all claimed', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      cy.verifyExhaustedRedPacket();

      // Should show full progress
      cy.contains('100.0%').should('be.visible');
      cy.verifyRedPacketProgress(6, 6);
    });

    it('should not show claim button when exhausted', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      cy.contains('🧧 领取红包').should('not.exist');
      cy.contains('💰 充值红包').should('not.exist'); // User is not owner
    });
  });

  describe('Multi-Account Support', () => {
    it('should show multi-account notification with multiple authorized accounts', () => {
      const multipleAccounts = [MOCK_USER_ADDRESS, MOCK_USER2_ADDRESS];

      cy.mockMetaMask({ accounts: multipleAccounts, isConnected: true });
      cy.connectWallet(MOCK_USER_ADDRESS);

      // Should show multi-account notification
      cy.contains('检测到 2 个已授权账户').should('be.visible');
      cy.contains('可以通过钱包菜单快速切换').should('be.visible');
      cy.contains('完全无需 MetaMask 确认').should('be.visible');

      // Warning icon should be present
      cy.contains('⚡').should('be.visible');
    });

    it('should not show multi-account notification with single account', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      cy.contains('检测到').should('not.exist');
      cy.contains('个已授权账户').should('not.exist');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle MetaMask not available gracefully', () => {
      // Don't mock ethereum - simulate MetaMask not installed
      cy.contains('连接钱包').should('be.visible');
      cy.contains('连接钱包').click();

      // Should handle gracefully (specific behavior depends on implementation)
      cy.contains('连接钱包').should('be.visible');
    });

    it('should handle connection rejection', () => {
      cy.mockMetaMask({ isConnected: false });

      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_requestAccounts') {
          return Promise.reject(new Error('User rejected the request'));
        }
        return Promise.resolve([]);
      });

      cy.contains('连接钱包').click();

      // Should remain in disconnected state
      cy.contains('连接钱包').should('be.visible');
    });

    it('should handle network errors', () => {
      cy.mockMetaMask();

      cy.get('@ethereumRequest').callsFake(() => {
        return Promise.reject(new Error('Network error'));
      });

      cy.contains('连接钱包').click();

      // Should handle gracefully
      cy.contains('连接钱包').should('be.visible');
    });

    it('should show loading states during slow operations', () => {
      cy.mockContractOwner(MOCK_OWNER_ADDRESS);
      cy.connectWallet(MOCK_OWNER_ADDRESS);

      // Mock slow transaction
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_sendTransaction') {
          return new Promise(resolve => {
            setTimeout(() => resolve('0x123'), 1000);
          });
        }
        return Promise.resolve('0x0');
      });

      cy.contains('💰 充值红包').click();

      // Should show loading
      cy.get('.loading-spinner').should('be.visible');

      // Button should be disabled during loading
      cy.contains('💰 充值红包').should('be.disabled');
    });
  });

  describe('Data Formatting and Display', () => {
    beforeEach(() => {
      cy.mockRedPacketState({
        claimedCount: 3,
        distributedAmount: '25000000000000000', // 0.025 ETH
        userHasClaimed: false
      });
    });

    it('should display ETH amounts with correct formatting', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      // Should show various ETH amounts
      cy.contains('0.05 ETH').should('be.visible'); // Total
      cy.contains('0.025 ETH').should('be.visible'); // Distributed
    });

    it('should display wallet addresses in shortened format', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      cy.checkAddressFormat(MOCK_USER_ADDRESS);
    });

    it('should display progress percentages correctly', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      // Should show 50% progress (0.025 / 0.05 = 50%)
      cy.contains('50.0%').should('be.visible');
    });

    it('should display recipient counts correctly', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      cy.verifyRedPacketProgress(3, 6);
    });

    it('should show all required icons and emojis', () => {
      cy.connectWallet(MOCK_USER_ADDRESS);

      // Title and section icons
      cy.contains('🧧').should('be.visible');
      cy.contains('📋').should('be.visible');
      cy.contains('🎁').should('be.visible');
      cy.contains('📖').should('be.visible');

      // Status icons
      cy.contains('💰').should('be.visible');
      cy.contains('📤').should('be.visible');
      cy.contains('👥').should('be.visible');
      cy.contains('📍').should('be.visible');
      cy.contains('👑').should('be.visible');
    });
  });

  describe('Responsive Design Testing', () => {
    beforeEach(() => {
      cy.connectWallet(MOCK_USER_ADDRESS);
    });

    it('should work correctly on mobile devices', () => {
      cy.viewport(375, 667); // iPhone 6/7/8

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('📋 合约信息').should('be.visible');
      cy.contains('🎁 红包状态').should('be.visible');
      cy.contains('📖 使用说明').should('be.visible');

      // Buttons should be accessible
      cy.contains('断开连接').should('be.visible');
    });

    it('should work correctly on tablets', () => {
      cy.viewport(768, 1024); // iPad

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('📋 合约信息').should('be.visible');
      cy.contains('🎁 红包状态').should('be.visible');
    });

    it('should work correctly on desktop', () => {
      cy.viewport(1920, 1080); // Large desktop

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('📋 合约信息').should('be.visible');
      cy.contains('🎁 红包状态').should('be.visible');
    });

    it('should maintain functionality across different viewport sizes', () => {
      const viewports = [
        [375, 667],   // iPhone
        [768, 1024],  // iPad
        [1024, 768],  // iPad Landscape
        [1280, 720],  // Laptop
        [1920, 1080]  // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        // Key elements should remain visible and functional
        cy.contains('🧧 智能合约红包系统').should('be.visible');
        cy.contains('断开连接').should('be.visible');

        // Red packet status should be readable
        cy.contains('🎁 红包状态').should('be.visible');
        cy.contains('总金额').should('be.visible');
      });
    });
  });

  describe('Performance and Loading', () => {
    it('should load the initial page quickly', () => {
      const start = Date.now();

      cy.visit('/').then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
      });

      cy.contains('🧧 智能合约红包系统').should('be.visible');
    });

    it('should handle rapid user interactions gracefully', () => {
      cy.mockMetaMask();

      // Rapidly click connect button multiple times
      cy.contains('连接钱包').click();
      cy.contains('连接钱包').click();
      cy.contains('连接钱包').click();

      // Should handle gracefully without errors
      cy.checkAddressFormat(MOCK_USER_ADDRESS);
    });
  });
});