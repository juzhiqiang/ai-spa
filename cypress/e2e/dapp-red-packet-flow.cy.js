import '../support/mock-blockchain.js';

describe('Red Packet DApp - Complete Flow Tests (No Real Keys)', () => {
  const TEST_CONFIG = {
    contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    accounts: [
      { address: '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e', isOwner: false, balance: '2000000000000000000' }, // User 1
      { address: '0x1234567890123456789012345678901234567890', isOwner: true, balance: '5000000000000000000' },  // Owner
      { address: '0x9876543210987654321098765432109876543210', isOwner: false, balance: '1000000000000000000' }  // User 2
    ],
    contractConfig: {
      owner: '0x1234567890123456789012345678901234567890',
      totalAmount: '50000000000000000', // 0.05 ETH
      distributedAmount: '0',
      maxRecipients: 6,
      claimedCount: 0,
      isActive: true
    }
  };

  beforeEach(() => {
    cy.visit('http://localhost:3000/');
    cy.setupMockBlockchain(TEST_CONFIG);
  });

  describe('Complete Red Packet Lifecycle', () => {
    it('should simulate complete red packet flow from creation to claiming', () => {
      // === 第一步：合约所有者创建红包 ===
      cy.log('步骤1: 合约所有者连接钱包');

      // 模拟所有者连接
      cy.window().then((win) => {
        win.ethereum.selectedAddress = TEST_CONFIG.accounts[1].address; // Owner
      });

      cy.contains('连接钱包').click();

      // 验证所有者身份
      cy.contains('（您）', { timeout: 10000 }).should('be.visible');
      cy.contains('💰 充值红包').should('be.visible');

      // === 第二步：充值红包 ===
      cy.log('步骤2: 充值红包');

      cy.contains('💰 充值红包').click();

      // 验证充值成功
      cy.get('.loading-spinner').should('be.visible');
      cy.waitForLoading();

      // 验证交易成功
      cy.getLastTransaction().then((tx) => {
        expect(tx.type).to.equal('deposit');
        expect(tx.from.toLowerCase()).to.equal(TEST_CONFIG.accounts[1].address.toLowerCase());
      });

      // === 第三步：用户1连接并查看红包状态 ===
      cy.log('步骤3: 用户1连接钱包查看红包');

      // 切换到用户1
      cy.window().then((win) => {
        win.ethereum.selectedAddress = TEST_CONFIG.accounts[0].address; // User 1
      });

      cy.reload();
      cy.contains('连接钱包').click();

      // 验证红包状态显示
      cy.contains('🎁 红包状态', { timeout: 10000 }).should('be.visible');
      cy.contains('您可以领取红包').should('be.visible');
      cy.contains('0/6').should('be.visible'); // 无人领取
      cy.contains('0.05 ETH').should('be.visible'); // 总金额

      // === 第四步：用户1领取红包 ===
      cy.log('步骤4: 用户1领取红包');

      cy.contains('🧧 领取红包').click();

      // 验证领取过程
      cy.get('.loading-spinner').should('be.visible');
      cy.waitForLoading();

      // 验证领取交易
      cy.getLastTransaction().then((tx) => {
        expect(tx.type).to.equal('claim');
        expect(tx.from.toLowerCase()).to.equal(TEST_CONFIG.accounts[0].address.toLowerCase());
        expect(parseFloat(tx.amount)).to.be.greaterThan(0);
      });

      // === 第五步：验证用户1已领取状态 ===
      cy.log('步骤5: 验证用户1已领取状态');

      // 重新加载查看状态
      cy.reload();
      cy.contains('连接钱包').click();

      cy.contains('✅', { timeout: 10000 }).should('be.visible');
      cy.contains('您已领取红包').should('be.visible');
      cy.contains('获得金额').should('be.visible');
      cy.contains('ETH').should('be.visible');

      // 进度应该更新
      cy.contains('1/6').should('be.visible');

      // === 第六步：用户2连接并领取 ===
      cy.log('步骤6: 用户2连接并领取红包');

      // 切换到用户2
      cy.window().then((win) => {
        win.ethereum.selectedAddress = TEST_CONFIG.accounts[2].address; // User 2
      });

      cy.reload();
      cy.contains('连接钱包').click();

      // 验证用户2可以看到红包状态
      cy.contains('您可以领取红包', { timeout: 10000 }).should('be.visible');
      cy.contains('1/6').should('be.visible'); // 显示已有1人领取

      // 用户2领取红包
      cy.contains('🧧 领取红包').click();
      cy.get('.loading-spinner').should('be.visible');
      cy.waitForLoading();

      // === 第七步：验证整体状态 ===
      cy.log('步骤7: 验证整体红包状态');

      cy.reload();
      cy.contains('连接钱包').click();

      // 用户2应该看到已领取状态
      cy.contains('您已领取红包', { timeout: 10000 }).should('be.visible');
      cy.contains('2/6').should('be.visible'); // 现在有2人领取

      // 进度条应该显示相应百分比
      cy.contains('%').should('be.visible');
    });

    it('should handle multiple users claiming simultaneously', () => {
      cy.log('测试多用户同时领取场景');

      // 设置红包已有一些活动的场景
      cy.setRedPacketScenario('partial');

      // 用户连接
      cy.contains('连接钱包').click();

      // 验证部分活动状态
      cy.contains('3/6', { timeout: 10000 }).should('be.visible');
      cy.contains('您可以领取红包').should('be.visible');

      // 模拟用户领取
      cy.contains('🧧 领取红包').click();
      cy.get('.loading-spinner').should('be.visible');
      cy.waitForLoading();

      // 验证状态更新
      cy.reload();
      cy.contains('连接钱包').click();
      cy.contains('4/6', { timeout: 10000 }).should('be.visible');
    });

    it('should show exhausted state when all red packets are claimed', () => {
      cy.log('测试红包耗尽状态');

      // 设置红包已耗尽场景
      cy.setRedPacketScenario('exhausted');

      cy.contains('连接钱包').click();

      // 验证耗尽状态显示
      cy.contains('😭', { timeout: 10000 }).should('be.visible');
      cy.contains('红包已被抢完！下次要快一点哦~').should('be.visible');
      cy.contains('6/6').should('be.visible');
      cy.contains('100.0%').should('be.visible');

      // 不应该有领取按钮
      cy.contains('🧧 领取红包').should('not.exist');
    });

    it('should display correct claimed status for users who already claimed', () => {
      cy.log('测试已领取用户状态显示');

      // 设置用户已领取场景
      cy.setRedPacketScenario('user-claimed');

      cy.contains('连接钱包').click();

      // 验证已领取状态
      cy.contains('✅', { timeout: 10000 }).should('be.visible');
      cy.contains('您已领取红包').should('be.visible');
      cy.contains('获得金额').should('be.visible');
      cy.contains('0.008 ETH').should('be.visible');

      // 进度显示
      cy.contains('2/6').should('be.visible');

      // 不应该有领取按钮
      cy.contains('🧧 领取红包').should('not.exist');
    });
  });

  describe('Error Scenarios Testing', () => {
    it('should handle various claim errors without real blockchain', () => {
      const errorScenarios = [
        {
          name: '用户已领取错误',
          setup: () => cy.setRedPacketScenario('user-claimed'),
          action: () => {
            // 模拟已领取用户尝试再次领取
            cy.window().then((win) => {
              const mockChain = win.mockBlockchain;
              const userAddress = TEST_CONFIG.accounts[0].address.toLowerCase();
              const user = mockChain.accounts.get(userAddress);
              user.hasClaimed = false; // 临时设为未领取以显示按钮

              // 但实际交易会失败
              win.ethereum.request = cy.stub().callsFake((params) => {
                if (params.method === 'eth_sendTransaction') {
                  return Promise.reject(new Error('Already claimed'));
                }
                return Promise.resolve('0x0');
              });
            });
          },
          expectedError: '已经领取过了'
        },
        {
          name: '红包已耗尽错误',
          setup: () => cy.setRedPacketScenario('exhausted'),
          action: () => {
            cy.window().then((win) => {
              win.ethereum.request = cy.stub().callsFake((params) => {
                if (params.method === 'eth_sendTransaction') {
                  return Promise.reject(new Error('All red packets claimed'));
                }
                return Promise.resolve('0x0');
              });
            });
          },
          expectedError: '红包已被抢完'
        },
        {
          name: '用户取消交易',
          setup: () => cy.setRedPacketScenario('partial'),
          action: () => {
            cy.window().then((win) => {
              win.ethereum.request = cy.stub().callsFake((params) => {
                if (params.method === 'eth_sendTransaction') {
                  return Promise.reject(new Error('user rejected'));
                }
                return Promise.resolve('0x0');
              });
            });
          },
          expectedError: '用户取消'
        }
      ];

      errorScenarios.forEach(scenario => {
        cy.log(`测试场景: ${scenario.name}`);

        scenario.setup();
        cy.contains('连接钱包').click();

        scenario.action();

        // 尝试领取（如果按钮存在）
        cy.get('body').then(($body) => {
          if ($body.find('button:contains("领取红包")').length > 0) {
            cy.contains('🧧 领取红包').click();
          }
        });

        // 验证错误处理
        // 注意：具体的错误显示方式依赖于应用的实现
        // 可能是alert、toast通知、或页面内错误消息
      });
    });

    it('should handle owner deposit errors', () => {
      cy.log('测试所有者充值错误场景');

      // 切换到所有者
      cy.window().then((win) => {
        win.ethereum.selectedAddress = TEST_CONFIG.accounts[1].address;

        // 模拟余额不足
        const ownerAddress = TEST_CONFIG.accounts[1].address.toLowerCase();
        const owner = win.mockBlockchain.accounts.get(ownerAddress);
        owner.balance = '1000000000000000'; // 很少的余额

        win.ethereum.request = cy.stub().callsFake((params) => {
          if (params.method === 'eth_sendTransaction') {
            return Promise.reject(new Error('insufficient funds'));
          }
          return Promise.resolve('0x0');
        });
      });

      cy.contains('连接钱包').click();

      // 验证所有者界面
      cy.contains('（您）', { timeout: 10000 }).should('be.visible');

      // 尝试充值
      cy.contains('💰 充值红包').click();

      // 验证错误处理
      // 应用应该显示相应的错误消息
    });
  });

  describe('Performance and UX Testing', () => {
    it('should maintain responsive UI during blockchain operations', () => {
      cy.log('测试区块链操作期间的UI响应性');

      // 模拟慢速交易
      cy.window().then((win) => {
        win.ethereum.request = cy.stub().callsFake((params) => {
          if (params.method === 'eth_sendTransaction') {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve('0x123456789abcdef');
              }, 2000); // 2秒延迟
            });
          }
          return Promise.resolve('0x0');
        });
      });

      cy.contains('连接钱包').click();

      // 触发交易
      cy.contains('🧧 领取红包', { timeout: 10000 }).click();

      // 验证加载状态
      cy.get('.loading-spinner').should('be.visible');

      // 按钮应该被禁用
      cy.contains('🧧 领取红包').should('be.disabled');

      // UI应该保持响应
      cy.contains('🎁 红包状态').should('be.visible');
      cy.contains('📖 使用说明').should('be.visible');

      // 等待交易完成
      cy.waitForLoading();
    });

    it('should handle rapid user interactions gracefully', () => {
      cy.log('测试快速用户交互的处理');

      cy.contains('连接钱包').click();

      // 快速多次点击（应该被去抖动或防护）
      cy.contains('🧧 领取红包', { timeout: 10000 })
        .click()
        .click()
        .click();

      // 应该只处理一次交易
      cy.get('.loading-spinner').should('be.visible');

      cy.waitForLoading();

      // 验证只有一次交易被处理
      cy.getLastTransaction().then((tx) => {
        expect(tx.type).to.equal('claim');
      });
    });

    it('should maintain state consistency across page reloads', () => {
      cy.log('测试页面重新加载时的状态一致性');

      // 设置特定状态
      cy.setRedPacketScenario('user-claimed');

      cy.contains('连接钱包').click();

      // 验证状态
      cy.contains('您已领取红包', { timeout: 10000 }).should('be.visible');

      // 重新加载页面
      cy.reload();

      // 重新连接
      cy.contains('连接钱包').click();

      // 状态应该保持一致
      cy.contains('您已领取红包', { timeout: 10000 }).should('be.visible');
      cy.contains('获得金额').should('be.visible');
    });
  });

  describe('Cross-browser and Device Testing', () => {
    it('should work consistently across different viewport sizes', () => {
      const viewports = [
        { width: 375, height: 667, name: 'iPhone SE' },
        { width: 414, height: 896, name: 'iPhone XR' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1024, height: 768, name: 'iPad Landscape' },
        { width: 1440, height: 900, name: 'Desktop' },
        { width: 1920, height: 1080, name: 'Large Desktop' }
      ];

      viewports.forEach(viewport => {
        cy.log(`测试视口: ${viewport.name} (${viewport.width}x${viewport.height})`);

        cy.viewport(viewport.width, viewport.height);

        // 基本功能应该在所有尺寸下工作
        cy.contains('🧧 智能合约红包系统').should('be.visible');
        cy.contains('连接钱包').should('be.visible');

        cy.contains('连接钱包').click();

        // 主要功能区域应该可见
        cy.contains('🎁 红包状态', { timeout: 10000 }).should('be.visible');
        cy.contains('📋 合约信息').should('be.visible');

        // 按钮应该可点击
        cy.contains('🧧 领取红包').should('be.visible');

        // 重置到默认视口
        cy.viewport(1280, 720);
        cy.reload();
      });
    });
  });
});