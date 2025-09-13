/// <reference types="cypress" />
// ***********************************************
// Custom commands for Red Packet DApp testing
// ***********************************************

/**
 * Mock MetaMask ethereum provider
 */
Cypress.Commands.add('mockMetaMask', (options = {}) => {
  const defaults = {
    accounts: ['0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e'],
    chainId: '0x1',
    isConnected: true,
    ...options
  };

  cy.window().then((win) => {
    win.ethereum = {
      isMetaMask: true,
      request: cy.stub().as('ethereumRequest'),
      on: cy.stub().as('ethereumOn'),
      removeListener: cy.stub().as('ethereumRemoveListener'),
      selectedAddress: defaults.isConnected ? defaults.accounts[0] : null,
      chainId: defaults.chainId,
      networkVersion: defaults.chainId === '0x1' ? '1' : '3'
    };

    // Setup default request handlers
    cy.get('@ethereumRequest').callsFake((params) => {
      switch (params.method) {
        case 'eth_requestAccounts':
          return Promise.resolve(defaults.accounts);
        case 'eth_accounts':
          return Promise.resolve(defaults.isConnected ? defaults.accounts : []);
        case 'eth_chainId':
          return Promise.resolve(defaults.chainId);
        case 'net_version':
          return Promise.resolve(defaults.chainId === '0x1' ? '1' : '3');
        default:
          return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
      }
    });
  });
});

/**
 * Connect wallet with mock MetaMask
 */
Cypress.Commands.add('connectWallet', (address = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e') => {
  cy.mockMetaMask({ accounts: [address], isConnected: true });

  cy.contains('连接钱包').click();

  // Wait for connection to complete
  cy.contains('0x' + address.slice(2, 8) + '...' + address.slice(-4), { timeout: 10000 })
    .should('be.visible');
});

/**
 * Mock contract owner state
 */
Cypress.Commands.add('mockContractOwner', (ownerAddress = '0x1234567890123456789012345678901234567890') => {
  cy.get('@ethereumRequest').callsFake((params) => {
    if (params.method === 'eth_accounts') {
      return Promise.resolve([ownerAddress]);
    }
    if (params.method === 'eth_chainId') {
      return Promise.resolve('0x1');
    }
    // Mock contract owner check - return owner address
    if (params.method === 'eth_call' && params.params[0].data?.includes('8da5cb5b')) {
      return Promise.resolve('0x000000000000000000000000' + ownerAddress.slice(2));
    }
    return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
  });

  cy.window().then((win) => {
    win.ethereum.selectedAddress = ownerAddress;
  });
});

/**
 * Mock red packet contract state
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

  cy.get('@ethereumRequest').callsFake((params) => {
    if (params.method === 'eth_call') {
      // Mock different contract function calls based on data
      const data = params.params[0].data || '';

      // getRedPacketInfo() - return totalAmount, distributedAmount, claimedCount
      if (data.includes('getRedPacketInfo') || data.length === 10) {
        return Promise.resolve(
          '0x' +
          parseInt(defaults.totalAmount).toString(16).padStart(64, '0') +
          parseInt(defaults.distributedAmount).toString(16).padStart(64, '0') +
          defaults.claimedCount.toString(16).padStart(64, '0')
        );
      }

      // hasUserClaimed(address)
      if (data.includes('hasUserClaimed') || data.length > 70) {
        return Promise.resolve(defaults.userHasClaimed ? '0x0000000000000000000000000000000000000000000000000000000000000001' : '0x0000000000000000000000000000000000000000000000000000000000000000');
      }

      // getUserClaimedAmount(address)
      if (data.includes('getUserClaimedAmount')) {
        return Promise.resolve('0x' + parseInt(defaults.userClaimedAmount).toString(16).padStart(64, '0'));
      }

      // maxRecipients
      if (data.includes('maxRecipients')) {
        return Promise.resolve('0x' + defaults.maxRecipients.toString(16).padStart(64, '0'));
      }
    }

    return Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000');
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
    // Keep other mocks working
    return cy.get('@ethereumRequest').wrappedMethod(params);
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
    // Keep other mocks working
    return cy.get('@ethereumRequest').wrappedMethod(params);
  });
});

/**
 * Wait for loading to complete
 */
Cypress.Commands.add('waitForLoading', () => {
  cy.get('.loading-spinner', { timeout: 1000 }).should('not.exist');
});

/**
 * Check wallet address format
 */
Cypress.Commands.add('checkAddressFormat', (address: string) => {
  const shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
  cy.contains(shortAddress).should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Mock MetaMask ethereum provider
       * @param options - Configuration options for the mock
       */
      mockMetaMask(options?: {
        accounts?: string[];
        chainId?: string;
        isConnected?: boolean;
      }): Chainable<void>;

      /**
       * Connect wallet with mock MetaMask
       * @param address - Wallet address to connect with
       */
      connectWallet(address?: string): Chainable<void>;

      /**
       * Mock contract owner state
       * @param ownerAddress - Address of the contract owner
       */
      mockContractOwner(ownerAddress?: string): Chainable<void>;

      /**
       * Mock red packet contract state
       * @param state - Contract state configuration
       */
      mockRedPacketState(state?: {
        totalAmount?: string;
        distributedAmount?: string;
        claimedCount?: number;
        maxRecipients?: number;
        userHasClaimed?: boolean;
        userClaimedAmount?: string;
      }): Chainable<void>;

      /**
       * Mock successful transaction
       * @param txHash - Transaction hash to return
       */
      mockTransaction(txHash?: string): Chainable<void>;

      /**
       * Mock transaction error
       * @param errorMessage - Error message to throw
       */
      mockTransactionError(errorMessage?: string): Chainable<void>;

      /**
       * Wait for loading spinner to disappear
       */
      waitForLoading(): Chainable<void>;

      /**
       * Check if wallet address is displayed in correct format
       * @param address - Full wallet address
       */
      checkAddressFormat(address: string): Chainable<void>;
    }
  }
}