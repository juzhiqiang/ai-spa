describe('Red Packet DApp End-to-End Tests', () => {
  const MOCK_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
  const MOCK_OWNER_ADDRESS = '0x1234567890123456789012345678901234567890';
  const MOCK_CONTRACT_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

  beforeEach(() => {
    // 访问应用首页
    cy.visit('http://localhost:3000/');
    
    // Mock window.ethereum (MetaMask)
    cy.window().then((win) => {
      // 创建模拟的 MetaMask provider
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().as('ethereumRequest'),
        on: cy.stub().as('ethereumOn'),
        removeListener: cy.stub().as('ethereumRemoveListener'),
        selectedAddress: null,
        chainId: '0x1',
        networkVersion: '1'
      };
    });
  });

  describe('Initial Page Load and Layout', () => {
    it('should display the main title and layout correctly', () => {
      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('欢迎使用智能合约红包系统').should('be.visible');
      cy.contains('基于以太坊智能合约的去中心化红包系统').should('be.visible');
    });

    it('should show welcome content when wallet is not connected', () => {
      cy.contains('🎯 支持最多 6 个用户领取').should('be.visible');
      cy.contains('💰 初始总额度 0.05 ETH').should('be.visible');
      cy.contains('🎲 完全随机分配，公平公正').should('be.visible');
      cy.contains('🔒 智能合约保证安全性').should('be.visible');
      cy.contains('⚡ 支持多账户快速切换，无需重新授权').should('be.visible');
      cy.contains('请先连接您的 MetaMask 钱包开始使用').should('be.visible');
    });

    it('should display footer information', () => {
      cy.contains('🚀 Red Packet DApp - 基于区块链的智能红包系统').should('be.visible');
      cy.contains('⚠️ 仅供学习和测试使用，请在测试网络中使用').should('be.visible');
      cy.contains('⚡ v2.1 - 修复账户切换授权问题，支持真正的无缝切换').should('be.visible');
    });

    it('should have responsive gradient background and styling', () => {
      cy.get('body').should('be.visible');
      // 检查主容器的样式
      cy.get('[data-testid="main-container"]').should('exist').or(
        cy.get('div').first().should('have.css', 'background')
      );
    });
  });

  describe('Wallet Connection Flow', () => {
    it('should show connect wallet button when not connected', () => {
      cy.contains('连接钱包').should('be.visible');
      cy.contains('连接钱包').should('not.be.disabled');
    });

    it('should handle successful wallet connection', () => {
      // Mock successful wallet connection
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_requestAccounts') {
          return Promise.resolve([MOCK_WALLET_ADDRESS]);
        }
        if (params.method === 'eth_accounts') {
          return Promise.resolve([MOCK_WALLET_ADDRESS]);
        }
        if (params.method === 'eth_chainId') {
          return Promise.resolve('0x1');
        }
        return Promise.resolve(null);
      });

      // 点击连接钱包按钮
      cy.contains('连接钱包').click();

      // 等待连接完成，应该看到地址显示
      cy.contains('0x742d35...8c5e', { timeout: 10000 }).should('be.visible');
    });

    it('should handle wallet connection rejection', () => {
      // Mock wallet connection rejection
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_requestAccounts') {
          return Promise.reject(new Error('User rejected the request'));
        }
        return Promise.resolve(null);
      });

      cy.contains('连接钱包').click();

      // 应该显示错误状态或保持未连接状态
      cy.contains('连接钱包').should('be.visible');
    });

    it('should handle network switching', () => {
      // Mock network change
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'wallet_switchEthereumChain') {
          return Promise.resolve();
        }
        return Promise.resolve(null);
      });

      // 这个测试取决于具体的网络切换实现
      // 在实际应用中可能需要触发网络切换
    });
  });

  describe('Connected Wallet State', () => {
    beforeEach(() => {
      // 模拟已连接状态
      cy.window().then((win) => {
        win.ethereum.selectedAddress = MOCK_WALLET_ADDRESS;
      });

      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_accounts') {
          return Promise.resolve([MOCK_WALLET_ADDRESS]);
        }
        if (params.method === 'eth_chainId') {
          return Promise.resolve('0x1');
        }
        // Mock contract calls
        if (params.method === 'eth_call') {
          return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
        }
        return Promise.resolve(null);
      });

      cy.reload();
    });

    it('should display connected wallet address', () => {
      cy.contains('0x742d35...8c5e', { timeout: 10000 }).should('be.visible');
    });

    it('should show disconnect button when connected', () => {
      cy.contains('断开连接', { timeout: 10000 }).should('be.visible');
    });

    it('should display contract information section', () => {
      cy.contains('📋 合约信息', { timeout: 10000 }).should('be.visible');
      cy.contains('📍 合约地址').should('be.visible');
      cy.contains('👑 合约拥有者').should('be.visible');
    });

    it('should display red packet status section', () => {
      cy.contains('🎁 红包状态', { timeout: 10000 }).should('be.visible');
      cy.contains('💰').should('be.visible'); // 总金额图标
      cy.contains('📤').should('be.visible'); // 已分发图标
      cy.contains('👥').should('be.visible'); // 已领取人数图标
    });

    it('should show usage instructions', () => {
      cy.contains('📖 使用说明', { timeout: 10000 }).should('be.visible');
      cy.contains('🎯 合约拥有者').should('be.visible');
      cy.contains('🧧 用户').should('be.visible');
      cy.contains('🎲 随机分配').should('be.visible');
      cy.contains('⚡ 快速切换').should('be.visible');
      cy.contains('⚠️ 本应用仅供学习测试使用').should('be.visible');
    });
  });

  describe('Account Switching', () => {
    beforeEach(() => {
      // Mock multiple authorized accounts
      const MOCK_ACCOUNTS = [MOCK_WALLET_ADDRESS, '0x9876543210987654321098765432109876543210'];

      cy.window().then((win) => {
        win.ethereum.selectedAddress = MOCK_WALLET_ADDRESS;
      });

      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_accounts') {
          return Promise.resolve(MOCK_ACCOUNTS);
        }
        if (params.method === 'eth_chainId') {
          return Promise.resolve('0x1');
        }
        return Promise.resolve(null);
      });

      cy.reload();
    });

    it('should show multi-account notification when multiple accounts are authorized', () => {
      cy.contains('检测到 2 个已授权账户', { timeout: 10000 }).should('be.visible');
      cy.contains('可以通过钱包菜单快速切换').should('be.visible');
    });

    it('should handle account switching through wallet component', () => {
      // This would depend on the actual wallet component implementation
      // The test would interact with account switching UI elements
      cy.contains('0x742d35...8c5e', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Red Packet Operations - Owner Functions', () => {
    beforeEach(() => {
      // Mock owner account
      cy.window().then((win) => {
        win.ethereum.selectedAddress = MOCK_OWNER_ADDRESS;
      });

      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_accounts') {
          return Promise.resolve([MOCK_OWNER_ADDRESS]);
        }
        if (params.method === 'eth_chainId') {
          return Promise.resolve('0x1');
        }
        // Mock contract owner check
        if (params.method === 'eth_call' && params.params[0].data?.includes('8da5cb5b')) {
          return Promise.resolve('0x000000000000000000000000' + MOCK_OWNER_ADDRESS.slice(2));
        }
        return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
      });

      cy.reload();
    });

    it('should show deposit button for contract owner', () => {
      cy.contains('💰 充值红包', { timeout: 10000 }).should('be.visible');
      cy.contains('（您）').should('be.visible'); // Owner indicator
    });

    it('should handle red packet deposit', () => {
      // Mock successful transaction
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_sendTransaction') {
          return Promise.resolve('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
        }
        return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
      });

      cy.contains('💰 充值红包', { timeout: 10000 }).click();

      // Should show loading state
      cy.get('.loading-spinner', { timeout: 5000 }).should('be.visible');
    });

    it('should handle deposit errors appropriately', () => {
      // Mock insufficient funds error
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_sendTransaction') {
          return Promise.reject(new Error('insufficient funds'));
        }
        return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
      });

      cy.contains('💰 充值红包', { timeout: 10000 }).click();

      // Should handle error gracefully (depends on implementation)
    });
  });

  describe('Red Packet Operations - User Functions', () => {
    beforeEach(() => {
      // Mock regular user account
      cy.window().then((win) => {
        win.ethereum.selectedAddress = MOCK_WALLET_ADDRESS;
      });

      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_accounts') {
          return Promise.resolve([MOCK_WALLET_ADDRESS]);
        }
        if (params.method === 'eth_chainId') {
          return Promise.resolve('0x1');
        }
        // Mock contract calls for red packet info
        if (params.method === 'eth_call') {
          // Mock has not claimed yet
          return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
        }
        return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
      });

      cy.reload();
    });

    it('should show claim button when user has not claimed', () => {
      cy.contains('🧧 领取红包', { timeout: 10000 }).should('be.visible');
      cy.contains('您可以领取红包').should('be.visible');
    });

    it('should handle successful red packet claim', () => {
      // Mock successful claim transaction
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_sendTransaction') {
          return Promise.resolve('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
        }
        if (params.method === 'eth_call') {
          return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
        }
        return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
      });

      cy.contains('🧧 领取红包', { timeout: 10000 }).click();

      // Should show loading state
      cy.get('.loading-spinner', { timeout: 5000 }).should('be.visible');
    });

    it('should handle claim errors appropriately', () => {
      // Mock already claimed error
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_sendTransaction') {
          return Promise.reject(new Error('Already claimed'));
        }
        return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
      });

      cy.contains('🧧 领取红包', { timeout: 10000 }).click();

      // Should handle error gracefully
    });

    it('should show claimed status after successful claim', () => {
      // Mock already claimed state
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_call') {
          // Mock user has claimed
          return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000001');
        }
        return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000001');
      });

      cy.reload();

      cy.contains('✅', { timeout: 10000 }).should('be.visible');
      cy.contains('您已领取红包').should('be.visible');
      cy.contains('获得金额').should('be.visible');
    });
  });

  describe('Red Packet Status Display', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.ethereum.selectedAddress = MOCK_WALLET_ADDRESS;
      });

      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_accounts') {
          return Promise.resolve([MOCK_WALLET_ADDRESS]);
        }
        return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
      });

      cy.reload();
    });

    it('should display progress bar for red packet distribution', () => {
      cy.contains('分发进度', { timeout: 10000 }).should('be.visible');
      // Progress percentage should be visible
      cy.get('[style*="width"]').should('exist'); // Progress bar
    });

    it('should show red packet statistics', () => {
      cy.contains('总金额', { timeout: 10000 }).should('be.visible');
      cy.contains('已分发').should('be.visible');
      cy.contains('已领取人数').should('be.visible');
      cy.contains('ETH').should('be.visible');
    });

    it('should show "all claimed" message when red packets are exhausted', () => {
      // Mock all red packets claimed
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_call') {
          // Mock max recipients reached
          return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000006');
        }
        return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000006');
      });

      cy.reload();

      cy.contains('😭', { timeout: 10000 }).should('be.visible');
      cy.contains('红包已被抢完！下次要快一点哦~').should('be.visible');
    });
  });

  describe('Responsive Design and Accessibility', () => {
    it('should be responsive on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone 6/7/8 size
      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('连接钱包').should('be.visible');
    });

    it('should be responsive on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad size
      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('欢迎使用智能合约红包系统').should('be.visible');
    });

    it('should be responsive on desktop viewport', () => {
      cy.viewport(1920, 1080); // Desktop size
      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('欢迎使用智能合约红包系统').should('be.visible');
    });

    it('should have proper contrast and readability', () => {
      // Check that text is readable against background
      cy.get('body').should('have.css', 'color');
      cy.contains('🧧 智能合约红包系统').should('be.visible');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle MetaMask not installed', () => {
      cy.window().then((win) => {
        delete win.ethereum;
      });

      cy.reload();

      // Should show appropriate message or fallback
      cy.contains('连接钱包').should('be.visible');
    });

    it('should handle network errors gracefully', () => {
      cy.get('@ethereumRequest').callsFake(() => {
        return Promise.reject(new Error('Network error'));
      });

      cy.contains('连接钱包').click();

      // Should handle error gracefully
      cy.contains('连接钱包').should('be.visible');
    });

    it('should handle loading states appropriately', () => {
      // Mock slow network responses
      cy.get('@ethereumRequest').callsFake(() => {
        return new Promise(resolve => setTimeout(resolve, 2000));
      });

      cy.contains('连接钱包').click();

      // Should show loading state
      cy.contains('连接中...').should('be.visible').or(
        cy.get('[disabled]').should('exist')
      );
    });
  });

  describe('Data Persistence and State Management', () => {
    it('should maintain wallet connection state on page reload', () => {
      // Mock persistent connection
      cy.window().then((win) => {
        win.ethereum.selectedAddress = MOCK_WALLET_ADDRESS;
        localStorage.setItem('walletConnected', 'true');
      });

      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_accounts') {
          return Promise.resolve([MOCK_WALLET_ADDRESS]);
        }
        return Promise.resolve(null);
      });

      cy.reload();

      // Should restore connection
      cy.contains('0x742d35...8c5e', { timeout: 10000 }).should('be.visible');
    });

    it('should clear state on wallet disconnect', () => {
      // This test would verify that disconnecting clears all user data
      // Implementation depends on the actual disconnect flow
      cy.contains('连接钱包').should('be.visible');
    });
  });
});