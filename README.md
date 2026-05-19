# AI Novel Generator

一个基于 Electron 的 AI 小说生成器，支持 TXT 文件导入、智能分章、AI 分析和大纲生成。帮助作者快速构建小说框架，提升创作效率。

## ✨ 功能特性

- 📥 **TXT 文件导入**：支持导入完整的 TXT 小说文件，自动识别编码格式
- 🔄 **智能分章**：自动识别和分割章节，支持多种章节标题格式（第X章、Chapter X、数字标题等）
- 🤖 **AI 分析**：调用 AI 进行创作题材分析、小说设定提取、章节大纲生成
- 📝 **大纲生成**：自动生成详细的章节大纲，包括关键冲突、情感曲线、剧情节点
- 📖 **章节管理**：分章显示和编辑小说内容，支持章节重排和合并
- 📚 **卷级管理**：支持以"卷"为单位管理剧情，每卷约 50 章左右，适合长篇连载
- 🎨 **用户友好界面**：直观的图形界面，暗色主题设计，操作简单便捷
- 💾 **数据持久化**：自动保存分析结果和配置，支持导出和备份
- 🔌 **多 API 支持**：支持多种 AI 服务提供商，灵活切换

## 🚀 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器
- Windows / macOS / Linux 操作系统

### 安装步骤

1. **克隆仓库**

```bash
git clone <repository-url>
cd ai-novel-generator
```

2. **安装依赖**

```bash
npm install
```

3. **运行开发环境**

```bash
npm start
```

### 打包发布

#### Windows 平台

```bash
# 使用 npm 脚本
npm run dist

# 或使用 PowerShell 脚本
.\build-exe.ps1

# 或使用批处理脚本
build-exe.bat
```

打包后的文件将在 `build/` 目录中，包含：
- `AI Novel Generator Setup.exe` - 安装程序
- `AI Novel Generator.exe` - 便携版可执行文件

#### 其他平台

```bash
# macOS
npm run dist -- --mac

# Linux
npm run dist -- --linux
```

## 📖 使用指南

### 第一步：配置 AI API

1. 启动应用后，点击右上角的"设置"按钮
2. 在 API 配置页面选择您要使用的 AI 服务提供商
3. 填入对应的 API Key 和模型配置
4. 点击"保存配置"按钮

支持的 AI 服务：
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

### 第二步：导入 TXT 文件

1. 点击主界面的"导入 TXT 文件"按钮
2. 在文件选择对话框中选择要导入的小说文件
3. 系统自动进行章节分割和 AI 分析
4. 等待分析完成后，查看分析结果和章节大纲

### 第三步：查看分析结果

导入完成后，您可以：
- 查看 AI 生成的题材标签和风格分析
- 浏览自动提取的小说设定（世界观、角色等）
- 查看每章的详细大纲和剧情节点
- 编辑和修改 AI 生成的内容

### 第四步：卷级管理

1. 点击"卷管理"菜单项进入卷级管理界面
2. 点击"创建新卷"按钮
3. 输入卷标题、概述和章节数量（建议 50 章左右）
4. 点击"保存卷"按钮
5. 选择已创建的卷，点击"生成卷大纲"按钮
6. 查看生成的卷级大纲和章节预览

### 第五步：导出和保存

- 分析结果自动保存到本地存储
- 支持导出大纲为文本文件
- 支持导出完整分析报告

## 📁 项目结构

```
ai-novel-generator/
├── assets/                    # 静态资源文件
│   └── wechat-qr.png         # 二维码等资源
├── css/                       # 样式文件
│   └── main.css              # 主样式表（暗色主题）
├── js/                        # JavaScript 核心代码
│   ├── api-config.js         # API 配置管理
│   ├── app.js                # 主应用逻辑
│   ├── custom-import.js      # 自定义导入功能
│   ├── fill-fields.js        # 表单自动填充
│   ├── generate-all-outline.js  # 全本大纲生成
│   ├── generate-full-outline.js # 完整大纲生成
│   ├── great-architect.js    # 架构设计器
│   ├── novel-generator.js    # 小说生成功能
│   ├── outline-generator.js  # 大纲生成器
│   ├── prompt-manager.js     # AI 提示词管理
│   ├── settings-manager.js   # 设置管理
│   ├── storage.js            # 本地数据存储
│   ├── templates.js          # 模板管理
│   ├── text-analyzer.js      # 文本分析器
│   └── volume-generator.js   # 卷级生成器
├── data/                      # 数据目录（运行时创建）
├── build/                     # 构建输出目录
├── index.html                 # 主界面 HTML
├── analyze-novel.html         # 小说分析界面
├── main.js                    # Electron 主进程入口
├── package.json              # 项目配置和依赖
├── .gitignore                # Git 忽略规则
├── LICENSE                   # 许可证文件
└── README.md                 # 项目说明文档
```

## 🔌 API 配置说明

### 支持的 AI 服务提供商

| 提供商 | 模型示例 | 官方文档 |
|--------|----------|----------|
| DeepSeek | deepseek-chat, deepseek-reasoner | https://platform.deepseek.com/ |
| OpenAI | gpt-4o, o1 | https://platform.openai.com/ |
| Claude | claude-3-5-sonnet-latest | https://console.anthropic.com/ |
| Gemini | gemini-2.0-flash | https://ai.google.dev/ |
| Kimi | moonshot-v1-auto | https://platform.moonshot.cn/ |
| 智谱 GLM | glm-4-plus | https://open.bigmodel.cn/ |
| 通义千问 | qwen-max-latest | https://dashscope.aliyun.com/ |
| 字节豆包 | doubao-pro-128k | https://console.volcengine.com/ |
| 硅基流动 | deepseek-ai/DeepSeek-V3 | https://siliconflow.cn/ |
| Ollama | llama3, qwen2 等 | https://ollama.com/ |

### 本地模型配置（Ollama）

1. 安装 Ollama：https://ollama.com/
2. 启动 Ollama 服务：
```bash
ollama serve
```
3. 下载模型（推荐）：
```bash
ollama pull llama3      # 综合能力较强
ollama pull qwen2:1.5b  # 微型模型，适合测试
```
4. 在应用设置中选择"Local (Ollama)"并测试连接

### API Key 获取方式

各平台的 API Key 通常可以在对应平台的开发者控制台获取：
- 注册账号并登录
- 进入 API 或开发者页面
- 创建新的 API Key
- 复制并粘贴到应用配置中

## 📦 打包发布说明

### 配置文件

打包配置位于 `package.json` 中的 `build` 字段：

```json
{
  "build": {
    "appId": "com.ainovel.generator",
    "productName": "AI Novel Generator",
    "directories": {
      "output": "build"
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### 发布流程

1. 更新版本号（`package.json` 中的 `version`）
2. 更新 `CHANGELOG.md` 记录变更
3. 执行打包命令：`npm run dist`
4. 检查 `build/` 目录输出
5. 发布到 GitHub Releases 或其他分发渠道

## 🤝 贡献指南

我们欢迎所有形式的贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

### 快速贡献流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 打开 Pull Request

### 贡献类型

- 🐛 提交 Bug 报告
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 添加新功能

## 📄 许可证

本项目采用 [ISC License](LICENSE) 开源许可证。

```
ISC License

Copyright (c) 2024 AI Novel Generator Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [electron-builder](https://www.electron.build/) - 应用打包工具
- [Font Awesome](https://fontawesome.com/) - 图标库
- 所有贡献者和用户的支持

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/your-repo/issues)
- 发送邮件至：[your-email@example.com]

---

**注意**：本项目仅供学习和研究使用，请遵守各 AI 服务提供商的使用条款和相关法律法规。
