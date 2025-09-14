describe('Red Packet DApp E2E Tests', () => {
  const MOCK_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
  const MOCK_OWNER_ADDRESS = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    // Visit the application
    cy.visit('http://localhost:3000/');
  });

  describe('Initial Page Load', () => {
    it('should display the main title and welcome content', () => {
      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('欢迎使用智能合约红包系统').should('be.visible');
      cy.contains('基于以太坊智能合约的去中心化红包系统').should('be.visible');
    });

    it('should show feature highlights', () => {
      cy.contains('🎯 支持最多 6 个用户领取').should('be.visible');
      cy.contains('💰 初始总额度 0.05 ETH').should('be.visible');
      cy.contains('🎲 完全随机分配，公平公正').should('be.visible');
      cy.contains('🔒 智能合约保证安全性').should('be.visible');
      cy.contains('⚡ 支持多账户快速切换，无需重新授权').should('be.visible');
    });

    it('should display connect wallet call-to-action', () => {
      cy.contains('请先连接您的 MetaMask 钱包开始使用').should('be.visible');
    });

    it('should show footer information', () => {
      cy.contains('🚀 Red Packet DApp - 基于区块链的智能红包系统').should('be.visible');
      cy.contains('⚠️ 仅供学习和测试使用，请在测试网络中使用').should('be.visible');
      cy.contains('⚡ v2.1 - 修复账户切换授权问题，支持真正的无缝切换').should('be.visible');
    });
  });



  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone 6/7/8

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('连接钱包').should('be.visible');
      cy.contains('欢迎使用智能合约红包系统').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('连接钱包').should('be.visible');
      cy.contains('基于以太坊智能合约的去中心化红包系统').should('be.visible');
    });

    it('should work on desktop viewport', () => {
      cy.viewport(1920, 1080); // Desktop

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('连接钱包').should('be.visible');
      cy.contains('欢迎使用智能合约红包系统').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle MetaMask not available', () => {
      // Don't mock ethereum object
      cy.contains('连接钱包').should('be.visible');

      // Should still be clickable (may show error or install prompt)
      cy.contains('连接钱包').click();
    });

    it('should handle connection rejection', () => {
      cy.window().then((win) => {
        win.ethereum = {
          isMetaMask: true,
          request: cy.stub().as('ethereumRequest'),
          on: cy.stub(),
          removeListener: cy.stub(),
          selectedAddress: null,
          chainId: '0x1',
          networkVersion: '1'
        };
      });

      // Mock rejection
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
  });

  describe('Loading States and Interactions', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.ethereum = {
          isMetaMask: true,
          request: cy.stub().as('ethereumRequest'),
          on: cy.stub(),
          removeListener: cy.stub(),
          selectedAddress: MOCK_WALLET_ADDRESS,
          chainId: '0x1',
          networkVersion: '1'
        };
      });
    });

    it('should show loading state during connection', () => {
      // Mock slow connection
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_requestAccounts') {
          return new Promise(resolve => {
            setTimeout(() => resolve([MOCK_WALLET_ADDRESS]), 1000);
          });
        }
        return Promise.resolve('0x0');
      });

      cy.contains('连接钱包').click();

      // Should show some loading indication
      cy.contains('连接中...').should('be.visible').or(cy.get('[disabled]').should('exist'));
    });

    it('should disable buttons during loading', () => {
      cy.get('@ethereumRequest').returns(Promise.resolve([MOCK_WALLET_ADDRESS]));
      cy.contains('连接钱包').click();

      // Mock slow transaction for owner
      cy.get('@ethereumRequest').callsFake((params) => {
        if (params.method === 'eth_call' && params.params && params.params[0].data && params.params[0].data.includes('8da5cb5b')) {
          return Promise.resolve('0x000000000000000000000000' + MOCK_WALLET_ADDRESS.slice(2));
        }
        if (params.method === 'eth_sendTransaction') {
          return new Promise(resolve => {
            setTimeout(() => resolve('0x123'), 2000);
          });
        }
        return Promise.resolve('0x0');
      });

      // If deposit button appears, it should be disabled during loading
      cy.get('button').contains('充值红包').then(($btn) => {
        if ($btn.length > 0) {
          cy.wrap($btn).click();
          cy.wrap($btn).should('be.disabled');
        }
      });
    });
  });

  describe('Data Display and Formatting', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.ethereum = {
          isMetaMask: true,
          request: cy.stub().as('ethereumRequest'),
          on: cy.stub(),
          removeListener: cy.stub(),
          selectedAddress: MOCK_WALLET_ADDRESS,
          chainId: '0x1',
          networkVersion: '1'
        };
      });

      cy.get('@ethereumRequest').returns(Promise.resolve([MOCK_WALLET_ADDRESS]));
      cy.contains('连接钱包').click();
    });

    it('should display ETH amounts with proper formatting', () => {
      cy.contains('ETH', { timeout: 10000 }).should('be.visible');
      cy.contains('0.05 ETH').should('be.visible');
    });

    it('should display wallet addresses in shortened format', () => {
      // Should show formatted address
      cy.contains('0x742d35...8c5e').should('be.visible');
    });

    it('should display progress information', () => {
      cy.contains('分发进度', { timeout: 10000 }).should('be.visible');
      cy.contains('%').should('be.visible');

      // Should show recipient count format (x/6)
      cy.contains('/6').should('be.visible');
    });

    it('should display proper icons and emojis', () => {
      // Main title emoji
      cy.contains('🧧 智能合约红包系统').should('be.visible');

      // Status icons
      cy.contains('💰').should('be.visible');
      cy.contains('📤').should('be.visible');
      cy.contains('👥').should('be.visible');

      // Section icons
      cy.contains('📋').should('be.visible');
      cy.contains('🎁').should('be.visible');
      cy.contains('📖').should('be.visible');
    });
  });
});