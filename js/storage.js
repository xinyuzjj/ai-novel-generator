const fs = typeof require !== 'undefined' ? require('fs') : null;
const path = typeof require !== 'undefined' ? require('path') : null;

class Storage {
    constructor() {
        this.PREFIX = 'ai_novel_gen_';
        this.isElectron = !!fs;
        this.dataDir = this.isElectron ? path.join(process.cwd(), 'data') : null;

        if (this.isElectron) {
            this.ensureDataDir();
        }
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            try {
                fs.mkdirSync(this.dataDir, { recursive: true });
            } catch (e) {
                console.error('Failed to create data directory:', e);
            }
        }
    }

    listProjects() {
        if (!this.isElectron) return [];
        try {
            const files = fs.readdirSync(this.dataDir, { withFileTypes: true });
            return files
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
        } catch (e) {
            console.error('Failed to list projects:', e);
            return [];
        }
    }

    switchProject(projectName) {
        const project = this.load('current_project', {});
        project.name = projectName;
        // We need to reload specific project settings if we switch
        // For now, save this as the current project so getFilePath picks it up
        this.save('current_project', project);
        return true;
    }

    getFilePath(key) {
        // Sanitize key
        const safeKey = key.replace(/[^a-z0-9_-]/gi, '_');

        // Global keys stay in root data dir
        const globalKeys = ['current_project', 'api_config'];
        if (globalKeys.includes(key)) {
            return path.join(this.dataDir, `${this.PREFIX}${safeKey}.json`);
        }

        // Project-specific keys go into a subfolder
        const project = this.loadProject();
        const projectName = project.name || 'default';
        const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');

        // Metadata folder for state files
        const metadataDir = path.join(this.dataDir, safeProjectName, 'metadata');

        if (this.isElectron && !fs.existsSync(metadataDir)) {
            try {
                fs.mkdirSync(metadataDir, { recursive: true });
            } catch (e) {
                console.error('Failed to create metadata directory:', e);
            }
        }

        return path.join(metadataDir, `${this.PREFIX}${safeKey}.json`);
    }

    // Generic save
    save(key, data) {
        if (this.isElectron) {
            try {
                const filePath = this.getFilePath(key);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                return true;
            } catch (e) {
                console.error(`File save error for ${key}:`, e);
                return false;
            }
        } else {
            try {
                localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Storage save error:', e);
                return false;
            }
        }
    }

    // Generic load
    load(key, defaultValue = null) {
        if (this.isElectron) {
            try {
                const filePath = this.getFilePath(key);
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    return JSON.parse(fileContent);
                }
                return defaultValue;
            } catch (e) {
                console.error(`File load error for ${key}:`, e);
                return defaultValue;
            }
        } else {
            try {
                const item = localStorage.getItem(this.PREFIX + key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage load error:', e);
                return defaultValue;
            }
        }
    }

    // Helper for projects
    saveProject(projectData) {
        // We'll store a list of project IDs and then individual project data
        // For simplicity in this version, we might just have ONE active project
        return this.save('current_project', projectData);
    }

    loadProject() {
        return this.load('current_project', {
            name: '新建小说',
            category: 'xuanhuan',
            totalChapters: 100,
            minWords: 2000,
            maxWords: 4000,
            authorRole: '',
            rules: '',
            sellingPoint: ''
        });
    }

    // Helper for Settings
    saveSettings(settings) {
        return this.save('settings', settings);
    }

    loadSettings() {
        return this.load('settings', {
            characterState: [],
            worldSettings: {},
            forbidden: []
        });
    }

    // Helper for API Config
    saveApiConfig(config) {
        return this.save('api_config', config);
    }

    loadApiConfig() {
        return this.load('api_config', {
            activeId: 'deepseek',
            apis: {
                'deepseek': {
                    id: 'deepseek',
                    name: 'DeepSeek',
                    enabled: true,
                    apiKey: '',
                    model: 'deepseek-chat',
                    endpoint: 'https://api.deepseek.com/v1/chat/completions'
                },
                'moonshot': {
                    id: 'moonshot',
                    name: 'Moonshot',
                    enabled: false,
                    apiKey: '',
                    model: 'moonshot-v1-8k',
                    endpoint: 'https://api.moonshot.cn/v1/chat/completions'
                },
                'zhipu': {
                    id: 'zhipu',
                    name: 'ZhipuGLM',
                    enabled: false,
                    apiKey: '',
                    model: 'glm-4',
                    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
                },
                'qwen': {
                    id: 'qwen',
                    name: 'Qwen',
                    enabled: false,
                    apiKey: '',
                    model: 'qwen-turbo',
                    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
                },
                'doubao': {
                    id: 'doubao',
                    name: 'Doubao',
                    enabled: false,
                    apiKey: '',
                    model: 'doubao-pro-32k',
                    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
                },
                'gemini': {
                    id: 'gemini',
                    name: 'Gemini',
                    enabled: false,
                    apiKey: '',
                    model: 'gemini-1.5-flash',
                    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
                },
                'local': {
                    id: 'local',
                    name: 'Local',
                    enabled: false,
                    apiKey: 'sk-no-key-required',
                    model: 'llama3',
                    endpoint: 'http://localhost:11434/v1/chat/completions'
                },
                'siliconflow': {
                    id: 'siliconflow',
                    name: 'SiliconFlow',
                    enabled: false,
                    apiKey: '',
                    model: 'deepseek-ai/DeepSeek-V3',
                    endpoint: 'https://api.siliconflow.cn/v1/chat/completions'
                },
                'openai': {
                    id: 'openai',
                    name: 'OpenAI',
                    enabled: false,
                    apiKey: '',
                    model: 'gpt-3.5-turbo',
                    endpoint: 'https://api.openai.com/v1/chat/completions'
                }
            }
        });
    }

    // Helper for Chapters
    saveChapter(chapterIndex, content, title = '') {
        // 1. Save to the chapters.json (project-specific)
        let chapters = this.load('chapters', {});
        chapters[chapterIndex] = content;
        this.save('chapters', chapters);

        // 2. Save as separate .txt file if in Electron
        if (this.isElectron) {
            try {
                const filePath = this.getChapterPath(chapterIndex, title);
                const articlesDir = path.dirname(filePath);

                if (!fs.existsSync(articlesDir)) {
                    fs.mkdirSync(articlesDir, { recursive: true });
                }

                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Chapter txt saved: ${filePath}`);
            } catch (e) {
                console.error('Failed to save chapter txt file:', e);
            }
        }
    }

    getChapterPath(chapterIndex, title) {
        if (!this.isElectron) return null;
        const project = this.loadProject();
        const projectName = project.name || 'default';
        const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');
        const articlesDir = path.join(this.dataDir, safeProjectName, 'articles');

        const safeTitle = (title || `第${chapterIndex}章`).replace(/[\\/:*?"<>|]/g, '_');
        const fileName = `第${chapterIndex}章_${safeTitle}.txt`;
        return path.join(articlesDir, fileName);
    }

    deleteChapter(chapterIndex, title = '') {
        // 1. Remove from JSON
        let chapters = this.load('chapters', {});
        if (chapters[chapterIndex]) {
            delete chapters[chapterIndex];
            this.save('chapters', chapters);
        }

        // 2. Delete .txt file
        if (this.isElectron) {
            try {
                const filePath = this.getChapterPath(chapterIndex, title);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Chapter txt deleted: ${filePath}`);
                }
            } catch (e) {
                console.error('Failed to delete chapter txt file:', e);
            }
        }
        return true;
    }

    saveGenLog(chapterIndex, content, title = '') {
        if (!this.isElectron) return;
        try {
            const project = this.loadProject();
            const projectName = project.name || 'default';
            const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');
            const logsDir = path.join(this.dataDir, safeProjectName, 'gen_logs');

            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            const safeTitle = (title || `第${chapterIndex}章`).replace(/[\\/:*?"<>|]/g, '_');
            const fileName = `第${chapterIndex}章_FULL_RESPONSE_${new Date().getTime()}.txt`;
            const filePath = path.join(logsDir, fileName);

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Gen log saved: ${filePath}`);
        } catch (e) {
            console.error('Failed to save generation log:', e);
        }
    }

    savePrompt(chapterIndex, prompt, title = '') {
        if (!this.isElectron) return;
        try {
            const project = this.loadProject();
            const projectName = project.name || 'default';
            const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');
            const logsDir = path.join(this.dataDir, safeProjectName, 'gen_logs');

            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            const safeTitle = (title || `第${chapterIndex}章`).replace(/[\\/:*?"<>|]/g, '_');
            const fileName = `第${chapterIndex}章_PROMPT_${new Date().getTime()}.txt`;
            const filePath = path.join(logsDir, fileName);

            fs.writeFileSync(filePath, prompt, 'utf8');
            console.log(`Prompt log saved: ${filePath}`);
        } catch (e) {
            console.error('Failed to save prompt log:', e);
        }
    }

    saveStateUpdate(chapterIndex, jsonContent) {
        if (!this.isElectron) return;

        try {
            const project = this.loadProject();
            const safeProjectName = (project.name || 'default').replace(/[\\/:*?"<>|]/g, '_');
            const updatesDir = path.join(this.dataDir, safeProjectName, 'state_updates');

            if (!fs.existsSync(updatesDir)) {
                fs.mkdirSync(updatesDir, { recursive: true });
            }

            const fileName = `第${chapterIndex}章_state.json`;
            const filePath = path.join(updatesDir, fileName);

            fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2), 'utf8');
            console.log(`State update saved to: ${filePath}`);

            // Also save a human-readable version of updates if needed?
            // For now, the JSON is fine.

            // Auto-sync logic
            if (jsonContent.state_updates && Array.isArray(jsonContent.state_updates)) {
                let settings = this.loadSettings();
                let updated = false;

                jsonContent.state_updates.forEach(update => {
                    // Try to find key/value even if AI makes mistakes in JSON structure
                    const key = update.key || (typeof update === 'object' ? Object.keys(update).find(k => k !== 'value') : null);
                    const value = update.value || (key ? update[key] : null);

                    if (!key || value === undefined) return;

                    const existing = settings.characterState.find(s => s.key === key);
                    if (existing) {
                        existing.value = value;
                        updated = true;
                    } else {
                        settings.characterState.push({ key, value });
                        updated = true;
                    }
                });

                if (updated) {
                    this.saveSettings(settings);
                    // Trigger UI refresh
                    window.dispatchEvent(new CustomEvent('settingsUpdated'));
                }
            }
        } catch (e) {
            console.error('Failed to save state update:', e);
        }
    }

    savePlan(chapterIndex, plan, title = '') {
        if (!this.isElectron || !plan) return;
        try {
            const project = this.loadProject();
            const projectName = project.name || 'default';
            const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');
            const logsDir = path.join(this.dataDir, safeProjectName, 'gen_logs');

            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            const safeTitle = (title || `第${chapterIndex}章`).replace(/[\\/:*?"<>|]/g, '_');
            const fileName = `第${chapterIndex}章_PLAN_${new Date().getTime()}.txt`;
            const filePath = path.join(logsDir, fileName);

            fs.writeFileSync(filePath, plan, 'utf8');
            console.log(`Chapter plan saved: ${filePath}`);
        } catch (e) {
            console.error('Failed to save chapter plan:', e);
        }
    }

    loadChapters() {
        return this.load('chapters', {});
    }

    // 错误处理辅助方法
    showError(message) {
        alert('错误:\n\n' + message);
    }

    showSuccess(message) {
        alert('成功:\n\n' + message);
    }

    showWarning(message) {
        alert('警告:\n\n' + message);
    }

    // 验证方法
    validateChapterIndex(chapterIndex) {
        if (!chapterIndex) {
            this.showError('请先选择章节');
            return false;
        }

        const index = parseInt(chapterIndex);

        if (isNaN(index)) {
            this.showError('无效的章节号');
            return false;
        }

        if (index < 1) {
            this.showError('章节号不能小于1');
            return false;
        }

        return true;
    }

    validateOutlineConfig(config) {
        if (!config || !config.summary) {
            this.showError('请输入故事梗概');
            return false;
        }

        return true;
    }

    // 备份和恢复功能
    backupData() {
        try {
            const backup = {
                timestamp: new Date().toISOString(),
                apiConfig: this.loadApiConfig(),
                settings: this.loadSettings(),
                project: this.loadProject(),
                outlines: this.load('outlines', []),
                chapters: this.load('chapters', {})
            };

            const backupStr = JSON.stringify(backup, null, 2);
            const blob = new Blob([backupStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-novel-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showSuccess('数据备份成功！\n\n文件已下载到您的下载文件夹。');
        } catch (e) {
            console.error('备份失败:', e);
            this.showError('备份失败: ' + e.message);
        }
    }

    restoreData(file) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);

                    if (!backup.timestamp) {
                        this.showError('无效的备份文件格式');
                        return;
                    }

                    // 确认恢复
                    if (!confirm(`确认恢复备份文件？\n\n备份时间: ${backup.timestamp}\n\n此操作将覆盖当前所有数据！`)) {
                        return;
                    }

                    // 恢复数据
                    if (backup.apiConfig) this.saveApiConfig(backup.apiConfig);
                    if (backup.settings) this.saveSettings(backup.settings);
                    if (backup.project) this.saveProject(backup.project);
                    if (backup.outlines) this.save('outlines', backup.outlines);
                    if (backup.chapters) this.save('chapters', backup.chapters);

                    // 刷新UI
                    location.reload();

                    this.showSuccess('数据恢复成功！\n\n系统将自动刷新。');
                } catch (e) {
                    console.error('恢复失败:', e);
                    this.showError('恢复失败: ' + e.message);
                }
            };
            reader.readAsText(file);
        } catch (e) {
            console.error('恢复失败:', e);
            this.showError('恢复失败: ' + e.message);
        }
    }

    // 导出项目为TXT
    exportProjectToTXT() {
        try {
            const project = this.loadProject();
            const outlines = this.load('outlines', []);
            const chapters = this.load('chapters', {});

            let txtContent = `小说名称: ${project.name}\n`;
            txtContent += `分类: ${project.category}\n`;
            txtContent += `总章节数: ${outlines.length}\n`;
            txtContent += `创建时间: ${new Date().toLocaleString()}\n\n`;

            for (let i = 0; i < outlines.length; i++) {
                const chapterNum = i + 1;
                const outline = outlines[i];
                const chapterContent = chapters[chapterNum] || '';

                txtContent += `\n第${chapterNum}章 ${outline.title}\n`;
                txtContent += '='.repeat(50) + '\n\n';
                txtContent += chapterContent + '\n';
            }

            const blob = new Blob([txtContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name}-全文导出.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showSuccess('项目导出成功！\n\n文件已下载到您的下载文件夹。');
        } catch (e) {
            console.error('导出失败:', e);
            this.showError('导出失败: ' + e.message);
        }
    }

    // 清理旧数据
    cleanupOldData() {
        try {
            // 清理30天前的日志文件
            const thirtyDaysAgo = new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
            const project = this.loadProject();
            const projectName = project.name || 'default';
            const safeProjectName = projectName.replace(/[\/:*?"<>|]/g, '_');
            const logsDir = path.join(this.dataDir, safeProjectName, 'gen_logs');

            if (this.isElectron && fs.existsSync(logsDir)) {
                const files = fs.readdirSync(logsDir);
                files.forEach(file => {
                    const filePath = path.join(logsDir, file);
                    const stats = fs.statSync(filePath);
                    if (stats.mtime.getTime() < thirtyDaysAgo) {
                        fs.unlinkSync(filePath);
                        console.log('Deleted old log file:', filePath);
                    }
                });
            }

            this.showSuccess('数据清理完成！\n\n已删除30天前的日志文件。');
        } catch (e) {
            console.error('清理失败:', e);
            this.showError('清理失败: ' + e.message);
        }
    }

    // 读取TXT文件
    readTxtFile(filePath) {
        if (!this.isElectron || !fs.existsSync(filePath)) {
            return null;
        }

        try {
            // 尝试使用utf8编码读取
            let content = fs.readFileSync(filePath, 'utf8');
            return content;
        } catch (e) {
            try {
                // 如果utf8失败，尝试使用gbk编码
                const iconv = require('iconv-lite');
                const buffer = fs.readFileSync(filePath);
                let content = iconv.decode(buffer, 'gbk');
                return content;
            } catch (e2) {
                try {
                    // 最后尝试使用utf16编码
                    const buffer = fs.readFileSync(filePath);
                    let content = buffer.toString('utf16le');
                    return content;
                } catch (e3) {
                    console.error('Failed to read TXT file:', e3);
                    return null;
                }
            }
        }
    }

    // 读取上传的TXT文件（浏览器环境）
    readUploadedTxtFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.onerror = (e) => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsText(file, 'utf8');
        });
    }

    // 预览TXT文件内容
    previewTxtFile(filePath, maxLength = 1000) {
        const content = this.readTxtFile(filePath);
        if (!content) return null;
        return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    }
}

const storage = new Storage();
