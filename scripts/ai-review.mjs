import { Octokit } from '@octokit/rest';
import fs from 'fs';

// 初始化GitHub客户端，用于获取PR信息和发表评论
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// 从GitHub Actions环境变量中读取事件信息
const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const prNumber = event.pull_request.number;
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

console.log(`开始审查 PR #${prNumber} in ${owner}/${repo}`);

// 获取PR中所有修改的文件及其差异内容
const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
});

// 将所有文件的差异内容合并为一个字符串
const diffs = files.map(f => `File: ${f.filename}\n${f.patch || ''}`).join('\n\n');
console.log(`发现 ${files.length} 个修改的文件`);

try {
    // 直接调用Mastra API进行代码审查
    console.log('开始调用codeReviewAgent...');
    const response = await fetch('https://reviewcode.juzhiqiang.shop/api/agents/codeReviewAgent/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: `请帮我审查以下 PR 改动并给出建议：\n\n${diffs}`
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const review = await response.json();

    // 提取审查结果
    const reviewContent = review.text || review.content || review.response?.text || review.messages?.[0]?.content || '（未生成审查内容）';
    console.log('AI 审查结果:');
    console.log(reviewContent);

    // 将审查结果作为评论发布到PR
    await octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: `🤖 **AI Code Review**\n\n${reviewContent}`,
    });

    console.log("✅ AI review 已评论到 PR");

    // 检查是否应该自动合并PR
    await attemptAutoMerge(prNumber, owner, repo, reviewContent);
} catch (error) {
    console.error('AI 审查失败:', error.message);

    // 即使AI审查失败，也发布一个通知评论
    await octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: `🤖 **AI Code Review**\n\n❌ AI 审查服务暂时不可用，请稍后重试。\n\n错误信息: ${error.message}`,
    });
}

// 自动合并PR的函数
async function attemptAutoMerge(prNumber, owner, repo, reviewContent) {
    try {
        // 检查总体评分是否达到6/10以上
        const scoreMatch = reviewContent.match(/\*\*总体评分\*\*[：:]\s*(\d+)\/10/);
        if (!scoreMatch) {
            console.log('未找到总体评分，跳过自动合并');
            return;
        }

        const score = parseInt(scoreMatch[1]);
        if (score < 6) {
            console.log(`总体评分 ${score}/10 低于6分，跳过自动合并`);
            return;
        }

        // 执行自动合并
        await octokit.pulls.merge({
            owner,
            repo,
            pull_number: prNumber,
            commit_title: `Auto-merge: 评分 ${score}/10`,
            commit_message: `AI审查评分 ${score}/10，自动合并`,
            merge_method: 'squash'
        });

        console.log(`✅ PR #${prNumber} 已自动合并 (评分: ${score}/10)`);

    } catch (error) {
        console.error('自动合并失败:', error.message);
    }
}
