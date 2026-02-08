class App {
    constructor() {
        this.currentMode = 'short-story';
        this.init();
    }

    init() {
        this.loadTheme();
        this.bindNavigation();
        this.bindWindowControls();
        this.bindThemeToggle();
        this.bindImportEvents();
    }

    loadTheme() {
        const settings = storage.loadSettingsForMode(this.currentMode);
        if (settings.theme === 'light') {
            document.body.classList.add('light-theme');
            this.updateThemeIcons('light');
        } else {
            document.body.classList.remove('light-theme');
            this.updateThemeIcons('dark');
        }
    }

    toggleTheme() {
        const isLight = document.body.classList.toggle('light-theme');
        const theme = isLight ? 'light' : 'dark';

        const settings = storage.loadSettingsForMode(this.currentMode);
        settings.theme = theme;
        storage.saveSettingsForMode(this.currentMode, settings);

        this.updateThemeIcons(theme);
    }

    updateThemeIcons(theme) {
        const titleBtnIcon = document.querySelector('#btn-theme-toggle i');
        if (titleBtnIcon) {
            titleBtnIcon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    bindThemeToggle() {
        const titleBtn = document.getElementById('btn-theme-toggle');
        if (titleBtn) {
            titleBtn.addEventListener('click', () => this.toggleTheme());
        }

        const sidebarBtn = document.getElementById('sidebar-theme-toggle');
        if (sidebarBtn) {
            sidebarBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    bindNavigation() {
        const navItems = document.querySelectorAll('.menu-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = item.getAttribute('data-page');
                this.switchToPage(target);
            });
        });
        
        // 绑定模式切换事件
        this.bindModeSwitching();
    }
    
    bindModeSwitching() {
        const modeItems = document.querySelectorAll('.mode-item');
        modeItems.forEach(item => {
            item.addEventListener('click', () => {
                const mode = item.getAttribute('data-mode');
                this.switchMode(mode);
            });
        });
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        
        // 移除所有模式的active状态
        document.querySelectorAll('.mode-item').forEach(i => i.classList.remove('active'));
        // 添加当前模式的active状态
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // 隐藏所有模式内容
        document.querySelectorAll('.mode-content').forEach(content => {
            content.style.display = 'none';
        });
        // 显示当前模式的内容
        document.querySelector(`[data-for-mode="${mode}"]`).style.display = 'block';
        
        // 根据模式切换到对应首页
        let defaultPage;
        switch(mode) {
            case 'short-story':
                defaultPage = 'home';
                break;
            case 'medium-length':
                defaultPage = 'volume-home';
                break;
            case 'great-architect':
                defaultPage = 'architect-home';
                break;
            default:
                defaultPage = 'home';
        }
        
        this.switchToPage(defaultPage);
        
        // 初始化对应模式的功能模块
        this.initModeModules(mode);
    }

    initModeModules(mode) {
        switch(mode) {
            case 'short-story':
                if (typeof novelGenerator !== 'undefined') {
                    novelGenerator.init();
                }
                if (typeof outlineGenerator !== 'undefined') {
                    outlineGenerator.init();
                }
                if (typeof settingsManager !== 'undefined') {
                    settingsManager.currentMode = 'short-story';
                    settingsManager.loadSettings();
                }
                if (typeof textAnalyzer !== 'undefined') {
                    textAnalyzer.currentMode = 'short-story';
                }
                if (typeof promptManager !== 'undefined') {
                    promptManager.currentMode = 'short-story';
                    promptManager.loadCurrentProject();
                }
                break;
            case 'medium-length':
                if (typeof volumeGenerator !== 'undefined') {
                    volumeGenerator.init();
                }
                if (typeof settingsManager !== 'undefined') {
                    settingsManager.currentMode = 'medium-length';
                    settingsManager.loadSettings();
                }
                if (typeof textAnalyzer !== 'undefined') {
                    textAnalyzer.currentMode = 'medium-length';
                }
                if (typeof promptManager !== 'undefined') {
                    promptManager.currentMode = 'medium-length';
                    promptManager.loadCurrentProject();
                }
                break;
            case 'great-architect':
                if (typeof greatArchitect !== 'undefined') {
                    greatArchitect.init();
                }
                break;
        }
    }

    switchToPage(pageId) {
        // Remove active from all nav items
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // Add active to current nav items
        document.querySelectorAll(`[data-page="${pageId}"]`).forEach(i => {
            if (i.classList.contains('menu-item')) {
                i.classList.add('active');
            }
        });

        // Show current page
        const targetPage = document.getElementById('page-' + pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Special handling for different pages
        if (pageId === 'generate') {
            // Re-initialize novel generator to ensure events are bound
            if (typeof novelGenerator !== 'undefined') {
                novelGenerator.init();
            }
        } else if (pageId === 'volume-home' || pageId === 'volume-create' || pageId === 'volume-list' || pageId === 'volume-outline' || pageId === 'volume-generate' || pageId === 'volume-write') {
            // Re-initialize volume generator to ensure events are bound
            if (typeof volumeGenerator !== 'undefined') {
                volumeGenerator.init();
            }
        } else if (pageId === 'architect-home' || pageId === 'architect-expand' || pageId === 'architect-build' || pageId === 'architect-write' || pageId === 'architect-optimize') {
            // Re-initialize great architect to ensure events are bound
            if (typeof greatArchitect !== 'undefined') {
                greatArchitect.init();
            }
        }

        // Scroll content area back to top
        const contentArea = document.querySelector('.content-area');
        if (contentArea) contentArea.scrollTop = 0;
    }

    navigateTo(pageId) {
        this.switchToPage(pageId);
    }

    getCurrentMode() {
        return this.currentMode;
    }

    bindWindowControls() {
        const isElectron = typeof require !== 'undefined' && require('electron');
        if (!isElectron) return;

        const { ipcRenderer } = require('electron');

        const minBtn = document.getElementById('btn-minimize');
        const maxBtn = document.getElementById('btn-maximize');
        const closeBtn = document.getElementById('btn-close');

        if (minBtn) {
            minBtn.addEventListener('click', () => {
                ipcRenderer.send('window-minimize');
            });
        }

        if (maxBtn) {
            maxBtn.addEventListener('click', () => {
                ipcRenderer.send('window-maximize');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                ipcRenderer.send('window-close');
            });
        }

        // Listen for state changes from main process
        ipcRenderer.on('window-is-maximized', () => {
            const icon = maxBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-clone'; // Change to restore icon
        });

        ipcRenderer.on('window-is-unmaximized', () => {
            const icon = maxBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-square'; // Change back to maximize icon
        });
    }

    // 显示导入对话框
    showImportDialog() {
        const dialog = document.getElementById('import-dialog');
        if (dialog) {
            dialog.style.display = 'block';
        }
    }

    // 绑定导入功能的事件处理
    bindImportEvents() {
        const startImportBtn = document.getElementById('btn-start-import');
        if (startImportBtn) {
            startImportBtn.addEventListener('click', async () => {
                await this.handleImport();
            });
        }
    }

    // 处理导入流程
    async handleImport() {
        const fileInput = document.getElementById('txt-file-input');
        const autoSplitChapters = document.getElementById('auto-chapter-split').checked;
        const autoFillInfo = document.getElementById('auto-fill-info').checked;
        const previewOnly = document.getElementById('preview-only').checked;

        if (!fileInput.files || fileInput.files.length === 0) {
            alert('请选择要导入的TXT文件');
            return;
        }

        const file = fileInput.files[0];

        // 验证文件大小
        if (file.size > 50 * 1024 * 1024) { // 50MB限制
            alert('文件过大，请选择小于50MB的TXT文件');
            return;
        }

        // 显示进度
        const progressContainer = document.getElementById('import-progress');
        const progressStatus = document.getElementById('progress-status');
        const progressFill = document.getElementById('progress-fill');
        const progressDetails = document.getElementById('progress-details');
        const resultContainer = document.getElementById('import-result');
        const resultContent = document.getElementById('result-content');

        if (progressContainer) {
            progressContainer.style.display = 'block';
        }

        if (resultContainer) {
            resultContainer.style.display = 'none';
        }

        try {
            // 步骤1：读取文件
            progressStatus.textContent = '读取文件中...';
            progressFill.style.width = '20%';
            progressDetails.textContent = '正在读取文件内容...';

            // 步骤2：分析文件
            progressStatus.textContent = '分析文件中...';
            progressFill.style.width = '40%';
            progressDetails.textContent = '正在分析小说内容...';

            // 执行导入
            const options = {
                autoSplitChapters: autoSplitChapters,
                autoFillInfo: autoFillInfo,
                previewOnly: previewOnly
            };

            const analysisResult = await textAnalyzer.executeImport(file, options);

            // 步骤3：填充信息
            if (autoFillInfo && !previewOnly) {
                progressStatus.textContent = '填充信息中...';
                progressFill.style.width = '80%';
                progressDetails.textContent = '正在填充创作题材、小说设定、章节大纲和章节内容...';
            }

            // 步骤4：完成
            progressStatus.textContent = '导入完成';
            progressFill.style.width = '100%';
            progressDetails.textContent = '导入流程已完成';

            // 显示结果
            if (resultContainer && resultContent) {
                resultContainer.style.display = 'block';
                let resultHtml = '<div class="alert alert-success"><i class="fas fa-check-circle"></i> 导入成功！</div>';
                resultHtml += '<h5>导入结果：</h5>';
                resultHtml += `<p><strong>文件名称：</strong>${file.name}</p>`;
                resultHtml += `<p><strong>文件大小：</strong>${(file.size / 1024).toFixed(2)} KB</p>`;
                resultHtml += `<p><strong>章节数量：</strong>${analysisResult.chapters.length}</p>`;
                if (analysisResult.analysis) {
                    resultHtml += `<p><strong>创作题材：</strong>${analysisResult.analysis.creativeTheme?.type || '未知'}</p>`;
                    resultHtml += `<p><strong>核心卖点：</strong>${analysisResult.analysis.coreSellingPoint || '未知'}</p>`;
                }
                resultHtml += '<h6>章节列表：</h6>';
                resultHtml += '<ul class="list-group">';
                analysisResult.chapters.forEach((chapter, index) => {
                    const chapterNum = chapter.chapterNumber || (index + 1);
                    resultHtml += `<li class="list-group-item">第${chapterNum}章：${chapter.title}</li>`;
                });
                resultHtml += '</ul>';
                resultContent.innerHTML = resultHtml;
            }

            // 显示成功消息
            alert('导入成功！\n\n已成功导入并分析TXT文件。\n\n您可以在以下模块查看导入的内容：\n- 创作题材：查看分析的小说类型和风格\n- 小说设定：查看提取的世界观和角色信息\n- 章节大纲：查看生成的章节大纲\n- 小说生成：查看导入的章节内容');

        } catch (error) {
            console.error('导入失败:', error);
            progressStatus.textContent = '导入失败';
            progressDetails.textContent = error.message;
            
            // 显示错误结果
            if (resultContainer && resultContent) {
                resultContainer.style.display = 'block';
                let errorHtml = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> 导入失败！</div>';
                errorHtml += `<p><strong>错误信息：</strong>${error.message}</p>`;
                errorHtml += '<p><strong>解决方案：</strong></p>';
                errorHtml += '<ul>';
                errorHtml += '<li>检查文件是否为有效的TXT文件</li>';
                errorHtml += '<li>确保文件编码正确（建议使用UTF-8编码）</li>';
                errorHtml += '<li>检查AI模型配置是否正确</li>';
                errorHtml += '<li>如果使用本地模型，请确保Ollama已启动</li>';
                errorHtml += '</ul>';
                resultContent.innerHTML = errorHtml;
            }
            
            alert('导入失败:\n\n' + error.message);
        } finally {
            // 启用按钮
            const startImportBtn = document.getElementById('btn-start-import');
            if (startImportBtn) {
                startImportBtn.disabled = false;
            }
        }
    }
}

const app = new App();
