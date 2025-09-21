import { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import fs from "fs";

// GitHub & OpenAI 客户端
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 获取 PR 信息
const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
const prNumber = event.pull_request.number;
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

// 获取 PR 的 diff（patch）
const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
});

const diffs = files
    .map(f => `File: ${f.filename}\n${f.patch || ""}`)
    .join("\n\n");

// 调 OpenAI 生成审查意见
const resp = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
        { role: "system", content: "你是一个专业的前端代码审查助手。" },
        { role: "user", content: `请帮我审查以下 PR 改动并给出建议：\n\n${diffs}` },
    ],
});

// 提取文本
const review = resp.output_text || "（未生成内容）";

// 回帖到 PR
await octokit.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `🤖 **AI Code Review**\n\n${review}`,
});

console.log("✅ AI review 已评论到 PR");