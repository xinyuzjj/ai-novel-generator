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

    // 获取模式特定的前缀
    getModePrefix(mode) {
        switch(mode) {
            case 'short-story':
                return this.PREFIX + 'short_';
            case 'medium-length':
                return this.PREFIX + 'medium_';
            case 'great-architect':
                return this.PREFIX + 'architect_';
            default:
                return this.PREFIX;
        }
    }

    // 模式特定的保存方法
    saveForMode(mode, key, data) {
        const prefix = this.getModePrefix(mode);
        if (this.isElectron) {
            try {
                const filePath = this.getFilePathForMode(mode, key);
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                return true;
            } catch (e) {
                console.error(`File save error for ${key} in mode ${mode}:`, e);
                return false;
            }
        } else {
            try {
                localStorage.setItem(prefix + key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Storage save error:', e);
                return false;
            }
        }
    }

    // 模式特定的加载方法
    loadForMode(mode, key, defaultValue = null) {
        const prefix = this.getModePrefix(mode);
        if (this.isElectron) {
            try {
                const filePath = this.getFilePathForMode(mode, key);
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    return JSON.parse(fileContent);
                }
                return defaultValue;
            } catch (e) {
                console.error(`File load error for ${key} in mode ${mode}:`, e);
                return defaultValue;
            }
        } else {
            try {
                const item = localStorage.getItem(prefix + key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage load error:', e);
                return defaultValue;
            }
        }
    }

    // 模式特定的文件路径
    getFilePathForMode(mode, key) {
        // Sanitize key
        const safeKey = key.replace(/[^a-z0-9_-]/gi, '_');

        // Global keys stay in root data dir
        const globalKeys = ['current_project', 'api_config'];
        if (globalKeys.includes(key)) {
            return path.join(this.dataDir, `${this.PREFIX}${safeKey}.json`);
        }

        // Project-specific keys go into a subfolder
        const project = this.loadProjectForMode(mode);
        const projectName = project.name || 'default';
        const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');

        // Mode-specific folder mapping
        const modeNames = {
            'short-story': '短篇小说',
            'medium-length': '中长篇小说',
            'great-architect': '大神架构'
        };
        const modeFolderName = modeNames[mode] || mode;

        // Mode-specific subfolder
        const metadataDir = path.join(this.dataDir, modeFolderName, safeProjectName, 'metadata');

        return path.join(metadataDir, `${this.PREFIX}${safeKey}.json`);
    }

    // 模式特定的章节保存
    saveChapterForMode(mode, chapterIndex, content, title = '') {
        // 1. Save to the chapters.json (mode-specific)
        let chapters = this.loadForMode(mode, 'chapters', {});
        chapters[chapterIndex] = content;
        this.saveForMode(mode, 'chapters', chapters);

        // 2. Save as separate .txt file if in Electron
        if (this.isElectron) {
            try {
                const filePath = this.getChapterPathForMode(mode, chapterIndex, title);
                const articlesDir = path.dirname(filePath);

                if (!fs.existsSync(articlesDir)) {
                    fs.mkdirSync(articlesDir, { recursive: true });
                }

                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Chapter txt saved for mode ${mode}: ${filePath}`);
            } catch (e) {
                console.error('Failed to save chapter txt file:', e);
            }
        }
    }

    // 模式特定的章节路径
    getChapterPathForMode(mode, chapterIndex, title) {
        if (!this.isElectron) return null;
        const project = this.loadProjectForMode(mode);
        const projectName = project.name || 'default';
        const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');

        const modeNames = {
            'short-story': '短篇小说',
            'medium-length': '中长篇小说',
            'great-architect': '大神架构'
        };
        const modeFolderName = modeNames[mode] || mode;

        const articlesDir = path.join(this.dataDir, modeFolderName, safeProjectName, 'articles');

        const safeTitle = (title || `第${chapterIndex}章`).replace(/[\\/:*?"<>|]/g, '_');
        const fileName = `第${chapterIndex}章_${safeTitle}.txt`;
        return path.join(articlesDir, fileName);
    }

    // 模式特定的卷管理方法
    saveVolumeForMode(mode, volumeData) {
        let volumes = this.loadForMode(mode, 'volumes', []);
        if (volumeData.id) {
            // 更新现有卷
            const index = volumes.findIndex(v => v.id === volumeData.id);
            if (index !== -1) {
                volumes[index] = volumeData;
            } else {
                volumes.push(volumeData);
            }
        } else {
            // 创建新卷
            volumeData.id = volumes.length + 1;
            volumeData.status = volumeData.status || 'planning';
            volumes.push(volumeData);
        }
        this.saveForMode(mode, 'volumes', volumes);
        return volumeData;
    }

    loadVolumesForMode(mode) {
        return this.loadForMode(mode, 'volumes', []);
    }

    loadVolumeForMode(mode, volumeId) {
        const volumes = this.loadVolumesForMode(mode);
        return volumes.find(v => v.id === volumeId) || null;
    }

    deleteVolumeForMode(mode, volumeId) {
        let volumes = this.loadVolumesForMode(mode);
        volumes = volumes.filter(v => v.id !== volumeId);
        this.saveForMode(mode, 'volumes', volumes);
        return true;
    }

    saveVolumeSettingsForMode(mode, volumeId, settingsData) {
        const volumeSettings = this.loadForMode(mode, 'volume_settings', {});
        volumeSettings[volumeId] = settingsData;
        this.saveForMode(mode, 'volume_settings', volumeSettings);
        return true;
    }

    loadVolumeSettingsForMode(mode, volumeId) {
        const volumeSettings = this.loadForMode(mode, 'volume_settings', {});
        return volumeSettings[volumeId] || null;
    }

    deleteVolumeSettingsForMode(mode, volumeId) {
        const volumeSettings = this.loadForMode(mode, 'volume_settings', {});
        delete volumeSettings[volumeId];
        this.saveForMode(mode, 'volume_settings', volumeSettings);
        return true;
    }

    saveVolumeSettings(volumeId, settingsData) {
        return this.saveVolumeSettingsForMode('medium-length', volumeId, settingsData);
    }

    loadVolumeSettings(volumeId) {
        return this.loadVolumeSettingsForMode('medium-length', volumeId);
    }

    deleteVolumeSettings(volumeId) {
        return this.deleteVolumeSettingsForMode('medium-length', volumeId);
    }

    // 模式特定的大纲管理
    saveOutlineForMode(mode, outlines) {
        return this.saveForMode(mode, 'outlines', outlines);
    }

    loadOutlinesForMode(mode) {
        return this.loadForMode(mode, 'outlines', []);
    }

    // 模式特定的项目管理
    saveProjectForMode(mode, projectData) {
        if (this.isElectron && projectData.name) {
            this.createProjectForMode(mode, projectData.name);
        }
        return this.saveForMode(mode, 'current_project', projectData);
    }

    loadProjectForMode(mode) {
        return this.loadForMode(mode, 'current_project', { name: '' });
    }

    // 模式特定的章节删除
    deleteChapterForMode(mode, chapterIndex, title = '') {
        let chapters = this.loadForMode(mode, 'chapters', {});
        if (chapters[chapterIndex]) {
            delete chapters[chapterIndex];
            this.saveForMode(mode, 'chapters', chapters);
        }

        if (this.isElectron) {
            try {
                const filePath = this.getChapterPathForMode(mode, chapterIndex, title);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Chapter txt deleted for mode ${mode}: ${filePath}`);
                }
            } catch (e) {
                console.error('Failed to delete chapter txt file:', e);
            }
        }
        return true;
    }

    loadChaptersForMode(mode) {
        return this.loadForMode(mode, 'chapters', {});
    }

    // 模式特定的生成日志保存
    saveGenLogForMode(mode, chapterIndex, content, title = '') {
        if (!this.isElectron) return;
        try {
            const project = this.loadProjectForMode(mode);
            const projectName = project.name || 'default';
            const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');

            const modeNames = {
                'short-story': '短篇小说',
                'medium-length': '中长篇小说',
                'great-architect': '大神架构'
            };
            const modeFolderName = modeNames[mode] || mode;

            const logsDir = path.join(this.dataDir, modeFolderName, safeProjectName, 'gen_logs');

            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            const safeTitle = (title || `第${chapterIndex}章`).replace(/[\\/:*?"<>|]/g, '_');
            const fileName = `第${chapterIndex}章_FULL_RESPONSE_${new Date().getTime()}.txt`;
            const filePath = path.join(logsDir, fileName);

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Gen log saved for mode ${mode}: ${filePath}`);
        } catch (e) {
            console.error('Failed to save generation log:', e);
        }
    }

    // 模式特定的提示词保存
    savePromptForMode(mode, chapterIndex, prompt, title = '') {
        if (!this.isElectron) return;
        try {
            const project = this.loadProjectForMode(mode);
            const projectName = project.name || 'default';
            const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');

            const modeNames = {
                'short-story': '短篇小说',
                'medium-length': '中长篇小说',
                'great-architect': '大神架构'
            };
            const modeFolderName = modeNames[mode] || mode;

            const logsDir = path.join(this.dataDir, modeFolderName, safeProjectName, 'gen_logs');

            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            const safeTitle = (title || `第${chapterIndex}章`).replace(/[\\/:*?"<>|]/g, '_');
            const fileName = `第${chapterIndex}章_PROMPT_${new Date().getTime()}.txt`;
            const filePath = path.join(logsDir, fileName);

            fs.writeFileSync(filePath, prompt, 'utf8');
            console.log(`Prompt log saved for mode ${mode}: ${filePath}`);
        } catch (e) {
            console.error('Failed to save prompt log:', e);
        }
    }

    // 模式特定的状态更新保存
    saveStateUpdateForMode(mode, chapterIndex, jsonContent) {
        if (!this.isElectron) return;

        try {
            const project = this.loadProjectForMode(mode);
            const safeProjectName = (project.name || 'default').replace(/[\\/:*?"<>|]/g, '_');

            const modeNames = {
                'short-story': '短篇小说',
                'medium-length': '中长篇小说',
                'great-architect': '大神架构'
            };
            const modeFolderName = modeNames[mode] || mode;

            const updatesDir = path.join(this.dataDir, modeFolderName, safeProjectName, 'state_updates');

            if (!fs.existsSync(updatesDir)) {
                fs.mkdirSync(updatesDir, { recursive: true });
            }

            const fileName = `第${chapterIndex}章_state.json`;
            const filePath = path.join(updatesDir, fileName);

            fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2), 'utf8');
            console.log(`State update saved for mode ${mode}: ${filePath}`);

            if (jsonContent.state_updates && Array.isArray(jsonContent.state_updates)) {
                let settings = this.loadSettingsForMode(mode);
                let updated = false;

                jsonContent.state_updates.forEach(update => {
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
                    this.saveSettingsForMode(mode, settings);
                    window.dispatchEvent(new CustomEvent('settingsUpdated'));
                }
            }
        } catch (e) {
            console.error('Failed to save state update:', e);
        }
    }

    // 模式特定的计划保存
    savePlanForMode(mode, chapterIndex, plan, title = '') {
        if (!this.isElectron || !plan) return;
        try {
            const project = this.loadProjectForMode(mode);
            const projectName = project.name || 'default';
            const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');

            const modeNames = {
                'short-story': '短篇小说',
                'medium-length': '中长篇小说',
                'great-architect': '大神架构'
            };
            const modeFolderName = modeNames[mode] || mode;

            const logsDir = path.join(this.dataDir, modeFolderName, safeProjectName, 'gen_logs');

            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            const safeTitle = (title || `第${chapterIndex}章`).replace(/[\\/:*?"<>|]/g, '_');
            const fileName = `第${chapterIndex}章_PLAN_${new Date().getTime()}.txt`;
            const filePath = path.join(logsDir, fileName);

            fs.writeFileSync(filePath, plan, 'utf8');
            console.log(`Chapter plan saved for mode ${mode}: ${filePath}`);
        } catch (e) {
            console.error('Failed to save chapter plan:', e);
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

        // 创建三个模式的文件夹
        const modes = ['short-story', 'medium-length', 'great-architect'];
        const modeNames = {
            'short-story': '短篇小说',
            'medium-length': '中长篇小说',
            'great-architect': '大神架构'
        };

        modes.forEach(mode => {
            const modeDir = path.join(this.dataDir, modeNames[mode]);
            if (!fs.existsSync(modeDir)) {
                try {
                    fs.mkdirSync(modeDir, { recursive: true });
                    console.log(`Created mode directory: ${modeNames[mode]}`);
                } catch (e) {
                    console.error(`Failed to create mode directory ${modeNames[mode]}:`, e);
                }
            }
        });
    }

    listProjects(mode = 'short-story') {
        if (!this.isElectron) return [];
        try {
            const modeNames = {
                'short-story': '短篇小说',
                'medium-length': '中长篇小说',
                'great-architect': '大神架构'
            };
            const modeFolderName = modeNames[mode] || mode;
            const modeDir = path.join(this.dataDir, modeFolderName);

            if (!fs.existsSync(modeDir)) {
                return [];
            }

            const files = fs.readdirSync(modeDir, { withFileTypes: true });
            return files
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
        } catch (e) {
            console.error('Failed to list projects:', e);
            return [];
        }
    }

    switchProject(projectName, mode = 'short-story') {
        const project = this.loadProjectForMode(mode);
        project.name = projectName;
        this.saveProjectForMode(mode, project);
        return true;
    }

    createProjectForMode(mode, projectName) {
        if (!this.isElectron) return true;

        try {
            const modeNames = {
                'short-story': '短篇小说',
                'medium-length': '中长篇小说',
                'great-architect': '大神架构'
            };
            const modeFolderName = modeNames[mode] || mode;
            const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');
            const projectDir = path.join(this.dataDir, modeFolderName, safeProjectName);

            if (!fs.existsSync(projectDir)) {
                fs.mkdirSync(projectDir, { recursive: true });
                console.log(`Created project directory: ${projectDir}`);
            }

            return true;
        } catch (e) {
            console.error('Failed to create project directory:', e);
            return false;
        }
    }

    getFilePath(key) {
        const safeKey = key.replace(/[^a-z0-9_-]/gi, '_');
        const globalKeys = ['current_project', 'api_config'];
        if (globalKeys.includes(key)) {
            return path.join(this.dataDir, `${this.PREFIX}${safeKey}.json`);
        }

        const project = this.loadProjectForMode('short-story');
        const projectName = project.name || 'default';
        const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');

        const metadataDir = path.join(this.dataDir, safeProjectName, 'metadata');

        return path.join(metadataDir, `${this.PREFIX}${safeKey}.json`);
    }

    // Generic save
    save(key, data) {
        console.error('save() method is deprecated, use saveForMode() instead');
        return false;
    }

    // Generic load
    load(key, defaultValue = null) {
        console.error('load() method is deprecated, use loadForMode() instead');
        return defaultValue;
    }

    // Helper for projects (默认使用短篇模式)
    saveProject(projectData) {
        return this.saveProjectForMode('short-story', projectData);
    }

    loadProject() {
        return this.loadProjectForMode('short-story');
    }

    // Helper for Settings (按模式隔离)
    saveSettings(settings) {
        return this.saveSettingsForMode('short-story', settings);
    }

    loadSettings() {
        return this.loadSettingsForMode('short-story');
    }

    saveSettingsForMode(mode, settings) {
        return this.saveForMode(mode, 'settings', settings);
    }

    loadSettingsForMode(mode) {
        return this.loadForMode(mode, 'settings', {
            characterState: [],
            worldSettings: {},
            forbidden: []
        });
    }

    // Helper for API Config
    saveApiConfig(config) {
        return this.saveForMode('global', 'api_config', config);
    }

    loadApiConfig() {
        return this.loadForMode('global', 'api_config', {
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

    // Helper for Chapters (默认使用短篇模式)
    saveChapter(chapterIndex, content, title = '') {
        return this.saveChapterForMode('short-story', chapterIndex, content, title);
    }

    getChapterPath(chapterIndex, title) {
        return this.getChapterPathForMode('short-story', chapterIndex, title);
    }

    deleteChapter(chapterIndex, title = '') {
        return this.deleteChapterForMode('short-story', chapterIndex, title);
    }

    saveGenLog(chapterIndex, content, title = '') {
        return this.saveGenLogForMode('short-story', chapterIndex, content, title);
    }

    savePrompt(chapterIndex, prompt, title = '') {
        return this.savePromptForMode('short-story', chapterIndex, prompt, title);
    }

    saveStateUpdate(chapterIndex, jsonContent) {
        return this.saveStateUpdateForMode('short-story', chapterIndex, jsonContent);
    }

    savePlan(chapterIndex, plan, title = '') {
        return this.savePlanForMode('short-story', chapterIndex, plan, title);
    }

    loadChapters() {
        return this.loadForMode('short-story', 'chapters', {});
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
                project: this.loadProjectForMode('short-story'),
                outlines: this.loadOutlinesForMode('short-story'),
                chapters: this.loadForMode('short-story', 'chapters', {})
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
                    if (backup.project) this.saveProjectForMode('short-story', backup.project);
                    if (backup.outlines) this.saveOutlineForMode('short-story', backup.outlines);
                    if (backup.chapters) this.saveForMode('short-story', 'chapters', backup.chapters);

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

    // 卷级存储方法（默认模式）
    saveVolume(volumeData) {
        return this.saveVolumeForMode('medium-length', volumeData);
    }

    loadVolumes() {
        return this.loadVolumesForMode('medium-length');
    }

    loadVolume(volumeId) {
        return this.loadVolumeForMode('medium-length', volumeId);
    }

    deleteVolume(volumeId) {
        return this.deleteVolumeForMode('medium-length', volumeId);
    }

    // 导出卷为TXT（默认模式）
    exportVolumeToTXT(volumeId) {
        return this.exportVolumeToTXTForMode('medium-length', volumeId);
    }

    // 模式特定的卷导出
    exportVolumeToTXTForMode(mode, volumeId) {
        try {
            const project = this.loadProjectForMode(mode);
            const volume = this.loadVolumeForMode(mode, volumeId);
            const outlines = this.loadOutlinesForMode(mode);
            const chapters = this.loadForMode(mode, 'chapters', {});

            if (!volume) {
                this.showError('卷不存在');
                return;
            }

            let txtContent = `小说名称: ${project.name}\n`;
            txtContent += `卷名: ${volume.title}\n`;
            txtContent += `章节范围: 第${volume.startChapter}章 - 第${volume.endChapter}章\n`;
            txtContent += `创建时间: ${new Date().toLocaleString()}\n\n`;
            txtContent += `${volume.summary || '暂无概述'}\n\n`;

            if (volume.chapters && volume.chapters.length > 0) {
                volume.chapters.forEach(chapterNum => {
                    const outlineIndex = chapterNum - 1;
                    if (outlineIndex >= 0 && outlineIndex < outlines.length) {
                        const outline = outlines[outlineIndex];
                        const chapterContent = chapters[chapterNum] || '';
                        txtContent += `\n第${chapterNum}章 ${outline.title}\n`;
                        txtContent += '='.repeat(50) + '\n\n';
                        txtContent += chapterContent + '\n';
                    }
                });
            }

            const blob = new Blob([txtContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name}-第${volume.id}卷-${volume.title}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showSuccess('卷导出成功！\n\n文件已下载到您的下载文件夹。');
        } catch (e) {
            console.error('导出失败:', e);
            this.showError('导出失败: ' + e.message);
        }
    }

    // 导出项目为TXT（默认模式）
    exportProjectToTXT() {
        return this.exportProjectToTXTForMode('short-story');
    }

    // 模式特定的项目导出
    exportProjectToTXTForMode(mode) {
        try {
            const project = this.loadProjectForMode(mode);
            const outlines = this.loadOutlinesForMode(mode);
            const chapters = this.loadForMode(mode, 'chapters', {});
            const volumes = this.loadVolumesForMode(mode);

            let txtContent = `小说名称: ${project.name}\n`;
            txtContent += `分类: ${project.category}\n`;
            txtContent += `总章节数: ${outlines.length}\n`;
            if (volumes.length > 0) {
                txtContent += `总卷数: ${volumes.length}\n`;
            }
            txtContent += `创建时间: ${new Date().toLocaleString()}\n\n`;

            // 如果有卷级结构，按卷导出
            if (volumes.length > 0) {
                volumes.forEach(volume => {
                    txtContent += `\n${'='.repeat(60)}\n`;
                    txtContent += `第${volume.id}卷：${volume.title}\n`;
                    txtContent += `${'='.repeat(60)}\n\n`;
                    txtContent += `${volume.summary || '暂无概述'}\n\n`;
                    
                    if (volume.chapters && volume.chapters.length > 0) {
                        volume.chapters.forEach(chapterNum => {
                            const outlineIndex = chapterNum - 1;
                            if (outlineIndex >= 0 && outlineIndex < outlines.length) {
                                const outline = outlines[outlineIndex];
                                const chapterContent = chapters[chapterNum] || '';
                                txtContent += `\n第${chapterNum}章 ${outline.title}\n`;
                                txtContent += '='.repeat(50) + '\n\n';
                                txtContent += chapterContent + '\n';
                            }
                        });
                    }
                });
            } else {
                // 按章节顺序导出
                for (let i = 0; i < outlines.length; i++) {
                    const chapterNum = i + 1;
                    const outline = outlines[i];
                    const chapterContent = chapters[chapterNum] || '';

                    txtContent += `\n第${chapterNum}章 ${outline.title}\n`;
                    txtContent += '='.repeat(50) + '\n\n';
                    txtContent += chapterContent + '\n';
                }
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

    // 导出卷为TXT
    exportVolumeToTXT(volumeId) {
        try {
            const project = this.loadProjectForMode('medium-length');
            const volume = this.loadVolume(volumeId);
            const outlines = this.loadOutlinesForMode('medium-length');
            const chapters = this.loadForMode('medium-length', 'chapters', {});

            if (!volume) {
                this.showError('卷不存在');
                return;
            }

            let txtContent = `小说名称: ${project.name}\n`;
            txtContent += `卷名: ${volume.title}\n`;
            txtContent += `章节范围: 第${volume.startChapter}章 - 第${volume.endChapter}章\n`;
            txtContent += `创建时间: ${new Date().toLocaleString()}\n\n`;
            txtContent += `${volume.summary || '暂无概述'}\n\n`;

            if (volume.chapters && volume.chapters.length > 0) {
                volume.chapters.forEach(chapterNum => {
                    const outlineIndex = chapterNum - 1;
                    if (outlineIndex >= 0 && outlineIndex < outlines.length) {
                        const outline = outlines[outlineIndex];
                        const chapterContent = chapters[chapterNum] || '';
                        txtContent += `\n第${chapterNum}章 ${outline.title}\n`;
                        txtContent += '='.repeat(50) + '\n\n';
                        txtContent += chapterContent + '\n';
                    }
                });
            }

            const blob = new Blob([txtContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name}-第${volume.id}卷-${volume.title}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showSuccess('卷导出成功！\n\n文件已下载到您的下载文件夹。');
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
