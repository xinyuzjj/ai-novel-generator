# 更新日志

所有项目的显著变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 暂无

### 变更
- 暂无

### 修复
- 暂无

---

## [1.0.0] - 2024-XX-XX

### 新增
- 初始版本发布
- 基于 Electron 的桌面应用框架
- TXT 文件导入功能，支持自动识别编码格式
- 智能分章功能，支持多种章节标题格式识别
- AI 分析功能，支持题材分析、设定提取、大纲生成
- 大纲生成功能，包含关键冲突、情感曲线、剧情节点
- 章节管理功能，支持分章显示和编辑
- 卷级管理功能，支持以卷为单位组织剧情（每卷约50章）
- 多 API 支持，包括：
  - DeepSeek (V3/R1)
  - OpenAI (GPT-4o/o1)
  - Claude (3.5 Sonnet)
  - Google Gemini
  - 月之暗面 Kimi
  - 智谱 GLM
  - 通义千问
  - 字节豆包
  - 硅基流动
  - Ollama 本地模型
- 暗色主题用户界面
- 数据持久化存储
- Windows 平台打包支持（NSIS 安装程序和便携版）
- 自动保存配置功能
- 本地模型自动检测功能（Ollama）

### 技术特性
- 使用 Electron 25.0+ 构建跨平台桌面应用
- 使用 electron-builder 进行应用打包
- 支持 Capacitor 移动端框架（实验性）
- 模块化的 JavaScript 架构
- 本地文件系统存储
- 响应式 UI 设计

### 文档
- 添加详细的项目 README
- 添加贡献指南 CONTRIBUTING.md
- 添加更新日志 CHANGELOG.md
- 添加 ISC 开源许可证

---

## 版本说明

### 版本号格式

本项目使用语义化版本控制（SemVer），版本号格式为：`主版本号.次版本号.修订号`

- **主版本号**：当进行不兼容的 API 修改时递增
- **次版本号**：当添加向下兼容的功能时递增
- **修订号**：当进行向下兼容的问题修复时递增

### 变更类型说明

- **新增 (Added)**：新添加的功能
- **变更 (Changed)**：对现有功能的变更
- **废弃 (Deprecated)**：即将移除的功能
- **移除 (Removed)**：已移除的功能
- **修复 (Fixed)**：Bug 修复
- **安全 (Security)**：安全相关的修复

---

## 如何更新

### 从源码更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖（如有更新）
npm install

# 3. 启动应用
npm start
```

### 从安装包更新

1. 下载最新版本的安装包
2. 运行安装程序
3. 安装程序会自动替换旧版本

---

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何贡献。

---

## 反馈

如果您发现任何问题或有任何建议，请通过以下方式反馈：

- 提交 [GitHub Issue](https://github.com/your-repo/issues)
- 发送邮件至：[your-email@example.com]
