describe("DApp Wallet Connect UI Tests", () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/');
    });

    it("shows initial state with connect button", () => {
        // 验证初始状态：显示连接按钮
        cy.get(".connect-button").should("be.visible");
        cy.get(".connect-button").should("contain", "连接 MetaMask");
        cy.get(".connect-button").should("not.be.disabled");

        // 验证欢迎页面内容
        cy.contains("欢迎使用智能合约红包系统").should("be.visible");
        cy.contains("请先连接您的 MetaMask 钱包开始使用").should("be.visible");

        // 验证钱包相关组件不存在
        cy.get(".wallet-menu-container").should("not.exist");
        cy.get(".wallet-menu-hover").should("not.exist");
    });

    it("shows loading state when connecting", () => {
        // 验证按钮初始状态
        cy.get(".connect-button").should("be.visible");
        cy.get(".connect-button").should("contain", "连接 MetaMask");

        // 点击连接按钮
        cy.get(".connect-button").click();

        // 验证连接请求被发出（通过检查UI状态变化或等待元素出现）
        // 由于模拟钱包响应很快，我们主要验证UI状态的变化
        cy.get(".connect-button", { timeout: 5000 }).should("not.exist").or("be.disabled");
    });

    it("displays connected state after successful connection", () => {
        // 点击连接钱包按钮
        cy.get(".connect-button").click();

        // 验证连接成功后的UI状态变化 - 等待钱包组件出现
        cy.get(".wallet-connection-container", { timeout: 15000 }).should("exist");

        // 验证钱包地址显示（使用更通用的选择器）
        cy.get(".wallet-connection-container").should("contain", "0x1234");

        // 验证连接按钮消失
        cy.get(".connect-button").should("not.exist");

        // 验证页面内容从欢迎页切换到应用主界面
        cy.contains("欢迎使用智能合约红包系统").should("not.exist");
        cy.contains("📋 合约信息", { timeout: 10000 }).should("be.visible");
        cy.contains("🎁 红包状态").should("be.visible");
    });

    it("displays wallet dropdown menu functionality", () => {
        // 先连接钱包
        cy.get(".connect-button").click();
        cy.get(".wallet-connection-container", { timeout: 15000 }).should("exist");

        // 查找钱包菜单按钮（可能需要更具体的选择器）
        cy.get(".wallet-connection-container").find("[style*='cursor']").first().as("walletMenu");

        // 点击钱包菜单打开下拉菜单
        cy.get("@walletMenu").click();

        // 验证下拉菜单显示
        cy.get(".wallet-dropdown", { timeout: 5000 }).should("be.visible");

        // 验证菜单内容
        cy.get(".wallet-dropdown").should("contain", "当前账户");
        cy.contains("断开连接").should("be.visible");

        // 点击外部关闭菜单
        cy.get("body").click(0, 0);
        cy.get(".wallet-dropdown").should("not.exist");
    });

    it("validates UI elements presence and text content", () => {
        // 验证未连接状态的UI元素
        cy.get(".connect-button").should("contain.text", "连接 MetaMask");

        // 连接钱包
        cy.get(".connect-button").click();
        cy.get(".wallet-connection-container", { timeout: 15000 }).should("exist");

        // 验证连接后的UI元素文本内容
        cy.contains("📋 合约信息", { timeout: 10000 }).should("be.visible");
        cy.contains("📍 合约地址").should("be.visible");
        cy.contains("👑 合约拥有者").should("be.visible");
        cy.contains("🎁 红包状态").should("be.visible");
        cy.contains("💰").should("be.visible"); // 总金额图标
        cy.contains("📤").should("be.visible"); // 已分发图标
        cy.contains("👥").should("be.visible"); // 已领取人数图标
        cy.contains("📖 使用说明").should("be.visible");
    });

    it("verifies metamask connection request is triggered", () => {
        // 监听 window.ethereum.request 调用
        cy.window().then((win) => {
            cy.spy(win.ethereum, 'request').as('ethereumRequest');
        });

        // 点击连接按钮
        cy.get(".connect-button").click();

        // 验证确实调用了 MetaMask 连接请求
        cy.get('@ethereumRequest').should('have.been.called');

        // 验证连接成功的UI状态变化
        cy.get(".wallet-connection-container", { timeout: 10000 }).should("exist");
    });
});
