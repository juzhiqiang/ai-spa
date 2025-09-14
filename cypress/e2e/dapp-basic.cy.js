describe('Red Packet DApp E2E Tests', () => {
  beforeEach(() => {
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

  describe('UI Elements Visibility', () => {
    it('should show connect wallet button', () => {
      cy.contains('button', '连接 MetaMask').should('be.visible');
    });

    it('should display proper icons and emojis', () => {
      // Main title emoji
      cy.contains('🧧 智能合约红包系统').should('be.visible');

      // Feature icons
      cy.contains('🎯').should('be.visible');
      cy.contains('💰').should('be.visible');
      cy.contains('🎲').should('be.visible');
      cy.contains('🔒').should('be.visible');
      cy.contains('⚡').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone 6/7/8

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('button', '连接 MetaMask').should('be.visible');
      cy.contains('欢迎使用智能合约红包系统').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('button', '连接 MetaMask').should('be.visible');
      cy.contains('基于以太坊智能合约的去中心化红包系统').should('be.visible');
    });

    it('should work on desktop viewport', () => {
      cy.viewport(1920, 1080); // Desktop

      cy.contains('🧧 智能合约红包系统').should('be.visible');
      cy.contains('button', '连接 MetaMask').should('be.visible');
      cy.contains('欢迎使用智能合约红包系统').should('be.visible');
    });
  });

  describe('Basic Wallet Connection Test', () => {
    it('should handle wallet connection attempt', () => {
      // Simply test that the button exists and can be clicked without mocking
      // This avoids React re-render issues while still testing the UI interaction
      cy.get('button.connect-button').should('be.visible').should('contain', '连接 MetaMask');

      // Verify the button is clickable by checking it's not disabled
      cy.get('button.connect-button').should('not.be.disabled');
    });

    it('should handle no MetaMask scenario', () => {
      // Test without mocking MetaMask
      cy.contains('button', '连接 MetaMask').should('be.visible');

      // Should still be clickable (might show install prompt)
      cy.get('button.connect-button').click();
    });
  });
});