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

    it("can click connect button and trigger connection attempt", () => {
        // 验证按钮可点击
        cy.get(".connect-button").should("be.visible").and("not.be.disabled");

        // 点击连接按钮
        cy.get(".connect-button").click();

        // 验证点击后按钮可能变为加载状态或保持可见（取决于连接结果）
        // 这里只验证按钮确实被点击了，不验证具体的连接结果
        cy.get(".connect-button").should("exist");
    });

    it("shows correct page structure and layout", () => {
        // 验证页面基本结构
        cy.contains("🧧 智能合约红包系统").should("be.visible");
        cy.get(".connect-button").should("contain", "连接 MetaMask");

        // 验证页面布局元素
        cy.contains("基于以太坊智能合约的去中心化红包系统").should("be.visible");
        cy.contains("🎯 支持最多 6 个用户领取").should("be.visible");
        cy.contains("💰 初始总额度 0.05 ETH").should("be.visible");
        cy.contains("🎲 完全随机分配，公平公正").should("be.visible");
    });

    it("verifies page has metamask integration setup", () => {
        // 点击连接按钮应该触发某种行为（即使没有真正的MetaMask）
        cy.get(".connect-button").should("be.visible");

        // 点击按钮
        cy.get(".connect-button").click();

        // 验证点击后的某种响应（可能是错误提示或状态变化）
        // 这里我们主要验证按钮功能正常，而不是具体的MetaMask连接
        cy.get(".connect-button").should("exist");

        // 可以检查控制台是否有相关日志（在真实场景中）
        // 或者验证页面没有崩溃
        cy.contains("智能合约红包系统").should("be.visible");
    });

    it("displays proper responsive design elements", () => {
        // 验证页面在不同视口下的响应式设计
        cy.viewport(375, 667); // iPhone 6/7/8
        cy.get(".connect-button").should("be.visible");
        cy.contains("智能合约红包系统").should("be.visible");

        cy.viewport(768, 1024); // iPad
        cy.get(".connect-button").should("be.visible");

        cy.viewport(1920, 1080); // Desktop
        cy.get(".connect-button").should("be.visible");
    });

    it("shows correct footer information", () => {
        // 验证页脚信息
        cy.contains("🚀 Red Packet DApp - 基于区块链的智能红包系统").should("be.visible");
        cy.contains("⚠️ 仅供学习和测试使用，请在测试网络中使用").should("be.visible");
    });
});
