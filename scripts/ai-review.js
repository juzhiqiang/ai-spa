import { Octokit } from '@octokit/rest';
import { MastraClient } from '@mastra/client-js';
import fs from 'fs';

// GitHub & Mastra 客户端
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const mastraClient = new MastraClient({
    baseUrl: 'https://reviewcode.juzhiqiang.shop/',
});

// 获取 PR 信息1
const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const prNumber = event.pull_request.number;
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

// 获取 PR 的 diff（patch）
const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
});

const diffs = files.map(f => `File: ${f.filename}\n${f.patch || ''}`).join('\n\n');

// 调用部署的 codeReviewAgent
const review = await mastraClient.agents.run({
    agentId: 'codeReviewAgent',
    input: {
        diffs: diffs,
        instruction: '请帮我审查以下 PR 改动并给出建议',
    },
});

// 提取审查结果
const reviewContent = review.text || review.output || '（未生成审查内容）';
console.log(reviewContent);
// // 回帖到 PR
// await octokit.issues.createComment({
//     owner,
//     repo,
//     issue_number: prNumber,
//     body: `🤖 **AI Code Review**\n\n${reviewContent}`,
// });

// console.log("✅ AI review 已评论到 PR");
