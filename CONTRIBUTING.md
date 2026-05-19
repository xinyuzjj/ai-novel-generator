# 贡献指南

感谢您对 AI Novel Generator 项目的关注！我们欢迎所有形式的贡献，包括但不限于提交 Bug 报告、提出新功能建议、改进文档和提交代码。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [报告 Bug](#报告-bug)
  - [提出功能建议](#提出功能建议)
  - [提交代码](#提交代码)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [审查流程](#审查流程)

## 行为准则

参与本项目即表示您同意遵守以下行为准则：

- 尊重所有参与者，保持友善和包容
- 接受建设性的批评，以专业态度对待不同意见
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 如何贡献

### 报告 Bug

如果您发现了 Bug，请通过 [GitHub Issues](https://github.com/your-repo/issues) 提交报告。提交时请包含以下信息：

1. **问题描述**：清晰简洁地描述 Bug 是什么
2. **复现步骤**：详细说明如何复现该问题
   - 步骤 1
   - 步骤 2
   - ...
3. **期望行为**：描述您期望看到的行为
4. **实际行为**：描述实际看到的行为
5. **环境信息**：
   - 操作系统及版本
   - Node.js 版本
   - 应用版本
6. **截图**：如果适用，请添加截图帮助说明问题
7. **附加信息**：任何其他相关信息

### 提出功能建议

我们欢迎新功能建议！请通过 [GitHub Issues](https://github.com/your-repo/issues) 提交，并使用 `enhancement` 标签。请包含：

1. **功能描述**：清晰描述您想要的功能
2. **使用场景**：描述该功能的使用场景和目标用户
3. **预期行为**：描述该功能应该如何工作
4. **替代方案**：您考虑过的其他替代解决方案
5. **附加信息**：任何其他相关信息或截图

### 提交代码

#### 工作流程

1. **Fork 仓库**
   ```bash
   # 点击 GitHub 页面的 Fork 按钮
   ```

2. **克隆您的 Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-novel-generator.git
   cd ai-novel-generator
   ```

3. **添加上游仓库**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ai-novel-generator.git
   ```

4. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/bug-description
   ```

5. **进行更改**
   - 编写代码
   - 遵循代码规范
   - 添加必要的注释

6. **提交更改**
   ```bash
   git add .
   git commit -m "type: 描述信息"
   ```

7. **保持与上游同步**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

8. **推送到您的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **创建 Pull Request**
   - 前往原始仓库
   - 点击 "New Pull Request"
   - 选择您的分支
   - 填写 PR 描述

## 开发环境设置

### 环境要求

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本
- Git

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/your-repo/ai-novel-generator.git
cd ai-novel-generator

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm start
```

### 项目结构说明

```
ai-novel-generator/
├── js/                    # JavaScript 核心代码
│   ├── api-config.js     # API 配置管理
│   ├── app.js            # 主应用逻辑
│   ├── storage.js        # 数据存储
│   └── ...
├── css/                   # 样式文件
│   └── main.css
├── assets/                # 静态资源
├── index.html            # 主界面
├── main.js               # Electron 主进程
└── package.json          # 项目配置
```

### 调试技巧

- **主进程调试**：在 `main.js` 中使用 `console.log()`，输出将显示在终端
- **渲染进程调试**：使用 `Ctrl+Shift+I`（Windows/Linux）或 `Cmd+Option+I`（macOS）打开 DevTools
- **热重载**：修改代码后需要重启应用（`Ctrl+R` 或 `Cmd+R`）

## 代码规范

### JavaScript 规范

- 使用 ES6+ 语法
- 使用单引号 `'` 而非双引号 `"`
- 缩进使用 4 个空格
- 语句末尾添加分号
- 最大行长度：100 字符

```javascript
// 好的示例
class MyClass {
    constructor() {
        this.name = 'AI Novel Generator';
    }

    greet() {
        console.log(`Hello, ${this.name}!`);
    }
}

// 不好的示例
class MyClass{
constructor(){
this.name = "AI Novel Generator"
}
greet(){
console.log("Hello, " + this.name + "!")
}
}
```

### HTML 规范

- 使用语义化标签
- 属性值使用双引号
- 自闭合标签不要省略斜杠
- 保持缩进一致

```html
<!-- 好的示例 -->
<div class="container">
    <button class="btn btn-primary" id="save-btn">
        保存
    </button>
</div>

<!-- 不好的示例 -->
<div class='container'>
<button class=btn id=save-btn>保存</button>
</div>
```

### CSS 规范

- 使用小写字母和连字符命名类名
- 属性按字母顺序排列
- 使用简写属性
- 添加必要的注释

```css
/* 好的示例 */
.btn-primary {
    background-color: #6200ea;
    border: none;
    border-radius: 4px;
    color: #ffffff;
    padding: 8px 16px;
}

/* 不好的示例 */
.btnPrimary {
    padding: 8px 16px;
    background: #6200ea;
    BORDER: none;
}
```

### 注释规范

- 使用 JSDoc 风格注释函数和类
- 解释"为什么"而非"是什么"
- 保持注释简洁明了

```javascript
/**
 * 分析小说文本并提取关键信息
 * @param {string} text - 小说文本内容
 * @param {Object} options - 分析选项
 * @returns {Promise<Object>} 分析结果
 */
async function analyzeNovel(text, options) {
    // 实现代码
}
```

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。提交信息格式如下：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建过程或辅助工具的变动 |

### 示例

```bash
# 新功能
feat: 添加卷级管理功能

# Bug 修复
fix(api): 修复 API 配置保存失败的问题

# 文档更新
docs: 更新 README 中的安装说明

# 代码重构
refactor(storage): 重构存储模块，提高性能

# 构建相关
chore: 更新 electron-builder 配置
```

## 审查流程

### Pull Request 要求

- [ ] 代码遵循项目规范
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] 提交信息符合规范
- [ ] 没有合并冲突

### 审查清单

审查者将检查：

1. **功能正确性**：代码是否实现了预期功能
2. **代码质量**：是否遵循代码规范
3. **性能影响**：是否引入了性能问题
4. **安全性**：是否存在安全隐患
5. **文档**：相关文档是否已更新

### 合并策略

- 使用 "Squash and Merge" 合并 PR
- 确保提交信息清晰描述更改
- 删除已合并的功能分支

## 发布流程

1. 更新 `package.json` 中的版本号
2. 更新 `CHANGELOG.md`
3. 创建 Git 标签：`git tag -a v1.0.0 -m "版本 1.0.0"`
4. 推送标签：`git push origin v1.0.0`
5. 执行打包：`npm run dist`
6. 创建 GitHub Release

## 获取帮助

如果您在贡献过程中需要帮助：

- 查看 [README.md](README.md) 了解项目基本信息
- 提交 [Issue](https://github.com/your-repo/issues) 询问问题
- 发送邮件至：[your-email@example.com]

## 致谢

感谢所有为这个项目做出贡献的人！您的每一份贡献都让这个项目变得更好。

---

**注意**：本贡献指南可能会随项目发展而更新，请定期查看最新版本。
