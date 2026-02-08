# AI Novel Generator

一个基于Electron的AI小说生成器，支持TXT文件导入、智能分章、AI分析和大纲生成。

## ✨ 功能特性

- 📥 **TXT文件导入**：支持导入完整的TXT小说文件
- 🔄 **智能分章**：自动识别和分割章节，支持多种章节标题格式
- 🤖 **AI分析**：调用AI进行创作题材、小说设定、章节大纲分析
- 📝 **大纲生成**：自动生成章节大纲，包括关键冲突和情感曲线
- 📖 **章节管理**：分章显示和编辑小说内容
- 📚 **卷级管理**：支持一卷为一个大副本/大剧情，一卷约50章左右
- 🎨 **用户友好界面**：直观的图形界面，操作简单

## 🚀 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 运行开发环境

```bash
npm start
```

### 打包成exe文件

```bash
npm run dist
```

打包后的文件将在 `build/` 目录中。

## 📖 使用说明

### 导入TXT文件

1. 点击"导入TXT文件"按钮
2. 选择要导入的TXT文件
3. 系统自动进行章节分割和AI分析
4. 查看分析结果和章节大纲

### 卷级管理

1. 点击"卷管理"菜单项
2. 点击"创建新卷"按钮
3. 输入卷标题、概述和章节数量（建议50章左右）
4. 点击"保存卷"按钮
5. 选择卷，点击"生成卷大纲"按钮生成卷级大纲
6. 查看生成的卷级大纲和章节预览

### AI配置

1. 点击"设置"按钮
2. 配置API信息（支持OpenAI兼容API和Ollama本地模型）
3. 保存配置

## 📁 项目结构

```
ai-novel-generator/
├── js/                 # JavaScript核心代码
│   ├── api-config.js    # API配置
│   ├── app.js           # 主应用逻辑
│   ├── novel-generator.js  # 小说生成
│   ├── outline-generator.js  # 大纲生成
│   ├── prompt-manager.js    # 提示词管理
│   ├── settings-manager.js  # 设置管理
│   ├── storage.js       # 数据存储
│   ├── text-analyzer.js    # 文本分析
│   └── volume-generator.js  # 卷级生成
├── css/                # 样式文件
│   └── main.css         # 主样式
├── assets/             # 资源文件
├── build/              # 构建输出目录
├── package.json        # 项目配置
└── README.md          # 项目说明
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

ISC License - 请查看 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [electron-builder](https://www.electron.build/) - 应用打包工具
