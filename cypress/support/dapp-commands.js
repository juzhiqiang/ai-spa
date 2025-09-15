// Custom commands for DApp testing

/**
 * Mock MetaMask provider (simplified version - use setupMockBlockchain for full functionality)
 */
Cypress.Commands.add('mockMetaMask', (options = {}) => {
  const defaults = {
    accounts: ['0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e'],
    chainId: '0x1',
    isConnected: true,
    ...options
  };

  // Use the enhanced blockchain mock for consistent behavior
  cy.setupMockBlockchain({
    accounts: defaults.accounts.map(address => ({
      address,
      isOwner: address === '0x1234567890123456789012345678901234567890',
      balance: '2000000000000000000'
    })),
    contractConfig: {
      claimedCount: 0,
      distributedAmount: '0'
    }
  });

  // Ensure ethereum provider is available immediately
  cy.window().then((win) => {
    if (win.ethereum && defaults.accounts.length > 0) {
      win.ethereum.selectedAddress = defaults.accounts[0];
    }
  });
});

/**
 * Connect wallet and verify connection
 */
Cypress.Commands.add('connectWallet', (address = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e') => {
  // Set up mock blockchain BEFORE attempting connection
  cy.setupMockBlockchain({
    accounts: [
      { address, isOwner: address === '0x1234567890123456789012345678901234567890', balance: '2000000000000000000' },
      { address: '0x1234567890123456789012345678901234567890', isOwner: true, balance: '5000000000000000000' },
      { address: '0x9876543210987654321098765432109876543210', isOwner: false, balance: '1000000000000000000' }
    ]
  });

  // Wait for DOM to be ready
  cy.contains('连接钱包').should('be.visible');

  // Click connect button
  cy.contains('连接钱包').click();

  // Wait for wallet connection to complete with proper timeout
  const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  cy.contains(formattedAddress, { timeout: 15000 }).should('be.visible');

  // Verify the UI changes to connected state
  cy.contains('断开连接', { timeout: 10000 }).should('be.visible');

  // Wait for contract info to load
  cy.contains('📋 合约信息', { timeout: 10000 }).should('be.visible');
  cy.contains('🎁 红包状态', { timeout: 10000 }).should('be.visible');

  // Wait for any async state updates to complete
  cy.wait(500);
});

/**
 * Mock contract owner responses
 */
Cypress.Commands.add('mockContractOwner', (ownerAddress = '0x1234567890123456789012345678901234567890') => {
  // Set up blockchain mock with owner account
  cy.setupMockBlockchain({
    accounts: [
      { address: ownerAddress, isOwner: true, balance: '5000000000000000000' },
      { address: '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e', isOwner: false, balance: '2000000000000000000' }
    ],
    contractConfig: {
      owner: ownerAddress
    }
  });
  
  // Set the owner as the selected address
  cy.window().then((win) => {
    if (win.ethereum) {
      win.ethereum.selectedAddress = ownerAddress;
    }
  });
});

/**
 * Mock red packet state
 */
Cypress.Commands.add('mockRedPacketState', (state = {}) => {
  const defaults = {
    totalAmount: '50000000000000000', // 0.05 ETH in wei
    distributedAmount: '0',
    claimedCount: 0,
    maxRecipients: 6,
    userHasClaimed: false,
    userClaimedAmount: '0',
    ...state
  };

  // Update the mock blockchain state if it exists
  cy.window().then((win) => {
    if (win.mockBlockchain) {
      const contractAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
      const contract = win.mockBlockchain.contracts.get(contractAddress.toLowerCase());
      if (contract) {
        contract.totalAmount = defaults.totalAmount;
        contract.distributedAmount = defaults.distributedAmount;
        contract.claimedCount = defaults.claimedCount;
        contract.maxRecipients = defaults.maxRecipients;
      }
    }
  });

  // Also update the ethereum request mock for backwards compatibility
  cy.get('@ethereumRequest').then((ethereumRequest) => {
    const originalStub = ethereumRequest;
    cy.get('@ethereumRequest').callsFake((params) => {
      if (params.method === 'eth_call') {
        const data = params.params[0].data || '';

        // Mock different contract function responses based on function selector
        if (data.length <= 10 || data.includes('getRedPacketInfo')) {
          // Return encoded totalAmount, distributedAmount, claimedCount
          return Promise.resolve(
            '0x' +
            parseInt(defaults.totalAmount).toString(16).padStart(64, '0') +
            parseInt(defaults.distributedAmount).toString(16).padStart(64, '0') +
            defaults.claimedCount.toString(16).padStart(64, '0')
          );
        }

        if (data.includes('hasUserClaimed') || data.length > 70) {
          return Promise.resolve(defaults.userHasClaimed ? '0x0000000000000000000000000000000000000000000000000000000000000001' : '0x0000000000000000000000000000000000000000000000000000000000000000');
        }

        if (data.includes('getUserClaimedAmount')) {
          return Promise.resolve('0x' + parseInt(defaults.userClaimedAmount).toString(16).padStart(64, '0'));
        }

        if (data.includes('maxRecipients')) {
          return Promise.resolve('0x' + defaults.maxRecipients.toString(16).padStart(64, '0'));
        }
      }

      // Fall back to original behavior for other methods
      return originalStub(params);
    });
  });
});

/**
 * Mock successful transaction
 */
Cypress.Commands.add('mockTransaction', (txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef') => {
  cy.get('@ethereumRequest').callsFake((params) => {
    if (params.method === 'eth_sendTransaction') {
      return Promise.resolve(txHash);
    }
    // Fall back to existing mock behavior for other methods
    return cy.get('@ethereumRequest').invoke(params);
  });
});

/**
 * Mock transaction error
 */
Cypress.Commands.add('mockTransactionError', (errorMessage = 'Transaction failed') => {
  cy.get('@ethereumRequest').callsFake((params) => {
    if (params.method === 'eth_sendTransaction') {
      return Promise.reject(new Error(errorMessage));
    }
    return cy.get('@ethereumRequest').invoke(params);
  });
});

/**
 * Wait for loading to complete
 */
Cypress.Commands.add('waitForLoading', () => {
  // Wait for any loading spinners to disappear (allow them to appear first)
  cy.get('body').should('be.visible'); // Ensure page is ready

  // Check if loading spinner exists and wait for it to disappear
  cy.get('body').then(($body) => {
    if ($body.find('.loading-spinner').length > 0) {
      cy.get('.loading-spinner', { timeout: 10000 }).should('not.exist');
    }
  });

  // Wait for any async operations to complete
  cy.wait(200);
});

/**
 * Check if address is properly formatted and displayed
 */
Cypress.Commands.add('checkAddressFormat', (address) => {
  const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  cy.contains(formattedAddress).should('be.visible');
});

/**
 * Verify red packet progress display
 */
Cypress.Commands.add('verifyRedPacketProgress', (expectedClaimedCount, expectedMaxRecipients = 6) => {
  cy.contains(`${expectedClaimedCount}/${expectedMaxRecipients}`).should('be.visible');
  cy.contains('分发进度').should('be.visible');
  cy.contains('%').should('be.visible');
});

/**
 * Verify claimed status display
 */
Cypress.Commands.add('verifyClaimedStatus', (amount) => {
  cy.contains('✅').should('be.visible');
  cy.contains('您已领取红包').should('be.visible');
  cy.contains('获得金额').should('be.visible');
  if (amount) {
    cy.contains(`${amount} ETH`).should('be.visible');
  }
});

/**
 * Verify unclaimed status display
 */
Cypress.Commands.add('verifyUnclaimedStatus', () => {
  cy.contains('🎁', { timeout: 10000 }).should('be.visible');
  cy.contains('您可以领取红包', { timeout: 10000 }).should('be.visible');
  cy.contains('🧧 领取红包', { timeout: 10000 }).should('be.visible');
});

/**
 * Verify exhausted red packet display
 */
Cypress.Commands.add('verifyExhaustedRedPacket', () => {
  cy.contains('😭', { timeout: 10000 }).should('be.visible');
  cy.contains('红包已被抢完！下次要快一点哦~', { timeout: 10000 }).should('be.visible');
  cy.contains('🧧 领取红包').should('not.exist');
});

/**
 * Test responsive design at different viewports
 */
Cypress.Commands.add('testResponsiveLayout', () => {
  const viewports = [
    { width: 375, height: 667, name: 'iPhone 6/7/8' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ];

  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.contains('🧧 智能合约红包系统').should('be.visible');
    cy.contains('连接钱包').should('be.visible');
  });

  // Reset to default
  cy.viewport(1280, 720);
});