import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // 应用基础URL，指向webpack开发服务器
    baseUrl: "http://localhost:8080",
    setupNodeEvents(on) {
      // 可以在这里添加其他插件配置
    },
    // 禁用支持文件
    supportFile: false,
    // 启用视频录制用于调试
    video: true,
    // 测试失败时截图
    screenshotOnRunFailure: true,
    // 视窗大小设置
    viewportWidth: 1920,
    viewportHeight: 1080,
    // 超时设置
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
});