# Red Packet DApp E2E Tests

This directory contains comprehensive end-to-end tests for the Red Packet DApp using Cypress.

## Test Files

### 1. `dapp-basic.cy.js`
Basic smoke tests covering:
- Initial page load and welcome content
- Wallet connection flow
- Contract owner functions
- User red packet claiming
- Multi-account support
- Responsive design
- Error handling

### 2. `dapp-comprehensive.cy.js`
Comprehensive test suite covering:
- Complete application state testing
- All user flows and edge cases
- Detailed error scenario testing
- Performance and loading tests
- Cross-browser compatibility scenarios
- Accessibility testing

## Custom Commands

The tests use custom Cypress commands defined in `cypress/support/dapp-commands.js`:

### Wallet Commands
- `cy.mockMetaMask(options)` - Mock MetaMask provider
- `cy.connectWallet(address)` - Connect wallet with specified address
- `cy.mockContractOwner(address)` - Set up contract owner state
- `cy.checkAddressFormat(address)` - Verify address display formatting

### Contract State Commands
- `cy.mockRedPacketState(state)` - Mock red packet contract state
- `cy.mockTransaction(txHash)` - Mock successful transaction
- `cy.mockTransactionError(message)` - Mock transaction error

### Verification Commands
- `cy.verifyRedPacketProgress(claimed, max)` - Verify progress display
- `cy.verifyClaimedStatus(amount)` - Verify claimed state
- `cy.verifyUnclaimedStatus()` - Verify unclaimed state
- `cy.verifyExhaustedRedPacket()` - Verify exhausted state

### Utility Commands
- `cy.waitForLoading()` - Wait for loading spinners to complete
- `cy.testResponsiveLayout()` - Test multiple viewport sizes

## Running the Tests

### Prerequisites
1. Make sure the development server is running:
   ```bash
   npm run dev
   ```

2. Install Cypress (if not already installed):
   ```bash
   npm install cypress --save-dev
   ```

### Running Tests

#### Interactive Mode (Recommended for development)
```bash
npx cypress open
```
This opens the Cypress Test Runner where you can:
- Select and run individual test files
- See tests run in real-time
- Debug failing tests
- Time travel through test steps

#### Headless Mode (CI/Production)
```bash
# Run all e2e tests
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/dapp-basic.cy.js"

# Run with specific browser
npx cypress run --browser chrome

# Run with video recording
npx cypress run --record
```

## Test Structure

### Test Organization
Tests are organized by functionality:
1. **Initial State Tests** - Page load and welcome content
2. **Wallet Connection** - MetaMask integration
3. **Owner Functions** - Contract owner capabilities
4. **User Functions** - Regular user red packet claiming
5. **State Management** - Different application states
6. **Error Handling** - Error scenarios and edge cases
7. **UI/UX** - Responsive design and accessibility

### Mock Strategy
Tests use comprehensive mocking of:
- **MetaMask Provider** - `window.ethereum` object
- **Blockchain Interactions** - Contract calls and transactions
- **Network Responses** - Success/failure scenarios
- **User States** - Different wallet and claim states

## Test Scenarios Covered

### Wallet Integration
- ✅ MetaMask connection/disconnection
- ✅ Account switching
- ✅ Network handling
- ✅ Connection errors
- ✅ Multi-account support

### Contract Owner Functions
- ✅ Owner identification
- ✅ Red packet deposit
- ✅ Transaction success/failure
- ✅ Error message handling
- ✅ Loading states

### User Functions
- ✅ Red packet claiming
- ✅ Claim status verification
- ✅ Progress tracking
- ✅ Already claimed state
- ✅ Exhausted red packets

### UI/UX
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Loading states
- ✅ Error messages
- ✅ Progress indicators
- ✅ Address formatting
- ✅ Amount display

### Error Handling
- ✅ MetaMask not installed
- ✅ Connection rejection
- ✅ Network errors
- ✅ Transaction failures
- ✅ Contract errors

## Configuration

### Cypress Configuration
The tests are configured to work with the default Cypress setup. Key settings:

- **Base URL**: Automatically detects development server
- **Viewport**: Tests multiple screen sizes
- **Timeouts**: Configured for blockchain operations
- **Retry**: Automatic retry for flaky network operations

### Environment Variables
You can set environment variables for different test environments:

```bash
# Development
CYPRESS_baseUrl=http://localhost:3000

# Staging
CYPRESS_baseUrl=https://staging.yourapp.com
```

## Debugging Tests

### Common Issues

1. **Test Timing Issues**
   - Use `cy.wait()` for specific delays
   - Use `{ timeout: 10000 }` for longer operations
   - Check for loading states

2. **Element Not Found**
   - Verify selectors with correct text/attributes
   - Check for dynamic content loading
   - Use `cy.get()` with proper wait conditions

3. **Mock Issues**
   - Ensure mocks are set up before actions
   - Check mock function signatures
   - Verify mock data formats

### Debugging Tips

1. **Use Cypress Debug Mode**:
   ```javascript
   cy.debug(); // Pauses test execution
   cy.pause(); // Interactive pause
   ```

2. **Console Logging**:
   ```javascript
   cy.window().then((win) => {
     console.log('Window object:', win);
   });
   ```

3. **Screenshots and Videos**:
   - Screenshots are automatically taken on failure
   - Videos are recorded in headless mode
   - Check `cypress/screenshots` and `cypress/videos`

## Best Practices

### Writing Tests
1. **Descriptive Test Names** - Clearly describe what is being tested
2. **Independent Tests** - Each test should be able to run in isolation
3. **Proper Setup/Teardown** - Use `beforeEach` for consistent state
4. **Wait Strategies** - Use proper waits instead of fixed delays
5. **Error Scenarios** - Test both success and failure paths

### Mock Strategy
1. **Realistic Data** - Use realistic addresses and amounts
2. **State Consistency** - Ensure mock state matches UI expectations
3. **Error Variety** - Test different error types and messages
4. **Loading States** - Mock slow operations to test loading UX

### Maintenance
1. **Regular Updates** - Keep tests updated with UI changes
2. **Mock Updates** - Update mocks when contract interfaces change
3. **Browser Testing** - Test on multiple browsers regularly
4. **Performance** - Monitor test execution time

## Continuous Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - run: npx cypress run
        env:
          CYPRESS_baseUrl: http://localhost:3000
```

## Reporting

### Test Results
- Console output shows pass/fail status
- Screenshots captured on failures
- Videos recorded for full test runs
- JUnit XML reports available for CI integration

### Coverage
While E2E tests don't provide code coverage metrics directly, they validate:
- User journey completion rates
- Feature functionality across browsers
- Error handling effectiveness
- Performance characteristics

## Contributing

When adding new tests:

1. **Follow Naming Convention**: `describe` blocks should match feature areas
2. **Use Custom Commands**: Leverage existing custom commands for consistency
3. **Add Documentation**: Update this README for new test scenarios
4. **Test Responsively**: Ensure tests work across viewport sizes
5. **Mock Appropriately**: Use realistic mock data and error scenarios

## Troubleshooting

### Common Problems

**Tests failing locally but passing in CI**:
- Check for timing differences
- Verify mock data consistency
- Look for environment-specific differences

**Flaky tests**:
- Add proper wait conditions
- Increase timeouts for slow operations
- Check for race conditions in async operations

**Mock not working**:
- Verify mock is set up in `beforeEach`
- Check function signatures match expectations
- Ensure mock data format is correct

For more help, see [Cypress Documentation](https://docs.cypress.io) or the team's internal testing guidelines.