# XHS Creator Analytics

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)

一款开源、无服务器的浏览器扩展，用于在小红书创作服务平台中汇总自己的笔记数据，目前支持查询总浏览量、点赞量、收藏量、评论数、转发数和浏览量 Top 10 笔记，支持所有笔记数据的导出。

登录创作服务平台并打开笔记管理页面后，扩展会读取当前账号的全部笔记，在浏览器本地完成统计，并生成简洁的分析面板。

> 本项目为独立开源项目，与小红书及其关联公司无隶属、授权或合作关系。

## 功能

- 自动分页获取当前账号的全部笔记，包括公开可见/仅互关好友可见/仅自己可见
- 汇总浏览量、点赞、收藏、评论和转发
- 展示浏览量 Top 10 笔记
- 显示抓取总数和实时进度
- 导出按发布时间从晚到早排列的 XLSX 明细
- 所有数据均在当前浏览器中处理

## 浏览器兼容性

目前仅兼容 Microsoft Edge 和 Google Chrome，其它浏览器暂不支持。

## 安装

### Microsoft Edge

1. 下载并解压最新的 Release。
2. 打开 `edge://extensions/`。
3. 启用“开发人员模式”。
4. 点击“加载解压缩的扩展”。
5. 选择包含 `manifest.json` 的项目目录 `XHS-Creator-Analytics-v1.0.0`。

### Google Chrome

1. 下载并解压最新的 Release。
2. 打开 `chrome://extensions/`。
3. 启用“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择包含 `manifest.json` 的项目目录 `XHS-Creator-Analytics-v1.0.0`。

## 使用方法

1. 登录[小红书创作服务平台](https://creator.xiaohongshu.com/)。
2. 打开[笔记管理](https://creator.xiaohongshu.com/new/note-manager)。
3. 点击工具栏中的 **XHS Creator Analytics**。
4. 点击“启动分析面板”。
5. 等待统计完成；如需明细，点击“导出全部数据”。

分析期间请保持笔记管理页面打开。

## 导出字段

XLSX 文件包含：笔记 ID、标题、发布时间、笔记类型、浏览量、点赞量、收藏量、评论数和转发数。

## 隐私

- 不要求用户向扩展提供账号或密码
- 使用浏览器中已有的小红书登录状态
- 不连接开发者服务器
- 不上传、出售或共享笔记数据
- 不长期保存原始笔记数据
- 仅申请访问 `creator.xiaohongshu.com`
- 本工具只应用于分析登录用户自己的创作者数据

详细说明见 [PRIVACY.md](PRIVACY.md)。

## 项目结构

```text
.
├── manifest.json
├── page-bridge.js       # 页面环境中的 API 请求与分页
├── content.js           # 数据统计、面板和导出交互
├── xlsx-export.js       # 本地生成 XLSX
├── panel.css            # 分析面板样式
├── popup.html
├── popup.js
├── popup.css
└── icons/
```

项目不需要安装依赖，也不需要执行构建命令。


## 提交问题

请通过 GitHub Issues 提交浏览器版本、扩展版本、页面错误提示和复现步骤。

## 参与贡献

欢迎提交 Issue 和 Pull Request。请勿增加不必要的网站权限、远程执行代码或用户数据上传功能。

## 扩展商店

提交材料和检查步骤见 [STORE_SUBMISSION.md](STORE_SUBMISSION.md)。

## 许可证

本项目采用 [MIT License](LICENSE)。
