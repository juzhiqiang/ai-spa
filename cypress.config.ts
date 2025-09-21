import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8080",
    setupNodeEvents(on) {
      let serverProcess: any;

      // 测试运行前启动开发服务器
      on("before:run", async () => {
        const { spawn } = await import("child_process");

        return new Promise<void>((resolve) => {
          console.log("Starting development server...");
          // 启动webpack开发服务器
          serverProcess = spawn("npm", ["run", "client:server"], {
            stdio: "inherit",
            shell: true,
          });

          // 等待服务器启动完成
          setTimeout(() => {
            console.log("Development server started");
            resolve();
          }, 10000);
        });
      });

      // 测试运行后停止开发服务器
      on("after:run", () => {
        if (serverProcess) {
          console.log("Stopping development server...");
          serverProcess.kill();
        }
      });
    },
    // 禁用支持文件
    supportFile: false,
    video: true,
    // 测试失败时截图
    screenshotOnRunFailure: true,
    viewportWidth: 1920,
    viewportHeight: 1080,

  },
});
