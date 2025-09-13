import React from 'react';

// 给项目提供 @welldone-software/why-did-you-render 包的类型声明。不提供可能出现类型错误？
/// <reference types="@welldone-software/why-did-you-render" />

// 在开发环境中启用 Why Did You Render 来帮助分析组件重渲染原因
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        onlyLogs: true, // 只在控制台输出日志，不显示弹窗
        titleColor: 'green', // 设置标题颜色为绿色
        diffNameColor: 'aqua', // 设置差异名称颜色为青色
        trackHooks: true, // 追踪 React Hooks 的变化
        trackAllPureComponents: true, // 追踪所有纯组件的重渲染
    });
}
