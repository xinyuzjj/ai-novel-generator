class NovelGenerator {
    constructor() {
        this.init();
        this.eventsBound = false;
    }

    init() {
        if (!this.eventsBound) {
            this.bindEvents();
            this.eventsBound = true;
        }
        this.renderChapterList();
    }

    bindEvents() {
        document.getElementById('btn-start-gen').addEventListener('click', () => this.startGeneration());
        document.getElementById('btn-refresh-chapters').addEventListener('click', () => {
            document.getElementById('chapter-search').value = '';
            this.renderChapterList();
        });

        // Open novel folder
        document.getElementById('btn-open-novel-folder').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openNovelFolder();
        });

        // Search listener
        document.getElementById('chapter-search').addEventListener('input', (e) => {
            this.renderChapterList(e.target.value);
        });

        // Listen for chapter selection (delegation)
        document.getElementById('chapter-list').addEventListener('click', (e) => {
            const item = e.target.closest('.chapter-item');
            if (item) {
                // Check if click was on locate button
                if (e.target.closest('.btn-locate')) {
                    const index = parseInt(item.getAttribute('data-index'));
                    this.locateChapter(index);
                    e.stopPropagation();
                    return;
                }
                const index = parseInt(item.getAttribute('data-index'));
                this.loadChapter(index);
            }
        });

        // 卷级相关事件
        document.getElementById('btn-switch-to-volume')?.addEventListener('click', () => {
            if (typeof app !== 'undefined') {
                app.navigateTo('volume');
            }
        });

        // 生成卷按钮
        document.getElementById('btn-generate-volume')?.addEventListener('click', () => {
            if (typeof volumeGenerator !== 'undefined') {
                volumeGenerator.createVolume();
            }
        });
    }

    renderChapterList(query = '') {
        const container = document.getElementById('chapter-list');
        const outlines = storage.loadOutlinesForMode('short-story');
        const chapters = storage.loadChapters();

        if (outlines.length === 0) {
            container.innerHTML = '<div style="padding:10px; color:#666;">请先生成大纲</div>';
            return;
        }

        let html = '';
        outlines.forEach((outline, index) => {
            const idx = index + 1;
            const title = outline.title || '';

            // Filter
            if (query && !title.toLowerCase().includes(query.toLowerCase()) && !`第${idx}章`.includes(query)) {
                return;
            }

            const hasContent = chapters[idx] && chapters[idx].length > 0;
            const statusIcon = hasContent ? '<i class="fas fa-check-circle" style="color:var(--success-color)"></i>' : '<i class="far fa-circle"></i>';

            // 检查章节所属的卷
            const volume = chapterToVolume[idx];
            const volumeInfo = volume ? `<span class="chapter-volume">第${volume.id}卷：${volume.title}</span>` : '';

            html += `
                <div class="chapter-item" data-index="${idx}">
                    <div class="chapter-info">
                        ${statusIcon} 第${idx}章：${title}
                        ${volumeInfo}
                    </div>
                    <div class="chapter-actions">
                        <button class="btn-icon-small btn-view" title="查看本地文件" style="display: ${hasContent ? 'flex' : 'none'}">
                            <i class="fas fa-file-alt"></i>
                        </button>
                        <button class="btn-icon-small btn-delete" title="删除本章内容" style="display: ${hasContent ? 'flex' : 'none'}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="btn-icon-small btn-locate" title="定位文章位置">
                            <i class="fas fa-crosshairs"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        if (html === '' && query) {
            html = '<div style="padding:10px; color:#666; text-align:center;">未找到匹配章节</div>';
        }

        container.innerHTML = html;

        // Bind delete and view events
        container.querySelectorAll('.chapter-item').forEach(item => {
            const idx = parseInt(item.getAttribute('data-index'));
            const outline = outlines[idx - 1];

            // View click
            item.querySelector('.btn-view')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const filePath = storage.getChapterPath(idx, outline.title);
                if (filePath && typeof require !== 'undefined') {
                    try {
                        const { shell } = require('electron');
                        shell.openPath(filePath);
                    } catch (err) {
                        console.error('Failed to open file via electron shell:', err);
                        alert('打开文件失败，请手动到项目目录查看: ' + filePath);
                    }
                } else {
                    alert('当前环境不支持直接打开文件，路径: ' + filePath);
                }
            });

            // Delete click
            item.querySelector('.btn-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`确定要删除“第${idx}章：${outline.title}”的内容吗？删除后不可恢复。`)) {
                    if (storage.deleteChapter(idx, outline.title)) {
                        this.renderChapterList(query);
                        if (document.getElementById('gen-chapter-index').value == idx) {
                            this.resetEditor();
                        }
                    }
                }
            });
        });

        // Ensure active state is preserved
        const activeIdx = document.getElementById('gen-chapter-index').value;
        if (activeIdx) {
            document.querySelector(`.chapter-item[data-index="${activeIdx}"]`)?.classList.add('active');
        }
    }

    locateChapter(index) {
        // Find if this chapter exists in storage
        const chapters = storage.loadChapters();
        if (chapters[index]) {
            this.loadChapter(index);
            // Optionally blink the editor or scroll to top to show it's loaded
            const display = document.getElementById('gen-content-display');
            display.style.backgroundColor = 'rgba(3, 218, 198, 0.1)';
            setTimeout(() => {
                display.style.backgroundColor = '';
            }, 500);

            // If in electron, we could open the file if it was a file based storage
            // But here it's localStorage/JSON based, so just load it.
            // The prompt asks for "finding article location", loading it IS finding it.
        } else {
            alert(`第${index}章尚未生成内容。`);
        }
    }

    loadChapter(index) {
        // Update UI
        document.querySelectorAll('.chapter-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`.chapter-item[data-index="${index}"]`)?.classList.add('active');

        document.getElementById('gen-chapter-index').value = index;

        // Load content if exists
        const chapters = storage.loadChapters();
        const content = chapters[index] || '';
        document.getElementById('gen-content-display').innerText = content;

        this.updateWordCount(content);

        // Update status
        document.getElementById('gen-status-text').innerText = content ? '已加载内容' : '暂无内容（可开始生成）';
    }

    resetEditor() {
        document.getElementById('gen-chapter-index').value = '';
        document.getElementById('gen-content-display').innerText = '';
        document.getElementById('gen-status-text').innerText = '就绪';
        document.getElementById('gen-word-count').innerText = '0 字';
    }

    updateWordCount(text) {
        // Simple character count (excluding control characters and trimming ends)
        const count = text.trim().length;
        document.getElementById('gen-word-count').innerText = `${count} 字`;
    }

    async startGeneration() {
        const chapterIndex = document.getElementById('gen-chapter-index').value;
        const outlines = storage.loadOutlinesForMode('short-story');

        if (!storage.validateChapterIndex(chapterIndex)) {
            return;
        }

        const index = parseInt(chapterIndex);

        if (index > outlines.length) {
            storage.showError(`无效的章节号。请输入1到${outlines.length}之间的数字。`);
            return;
        }

        const currentOutline = outlines[index - 1];
        const project = storage.loadProjectForMode('short-story');
        const settings = storage.loadSettingsForMode('short-story');

        // Control Flags
        const useState = document.getElementById('gen-use-state').checked;
        const useWorld = document.getElementById('gen-use-world').checked;
        const useOutline = document.getElementById('gen-use-outline').checked;
        const useContext = document.getElementById('gen-use-context').checked;
        const updateState = document.getElementById('gen-update-state').checked;
        const mode = document.querySelector('input[name="gen-mode"]:checked').value;

        // Prepare context
        let context = '';

        // 1. Previous Chapter Summary/Content
        if (useContext && index > 1) {
            const prevContents = storage.loadChapters();
            const prevContent = prevContents[index - 1] || ''; // Chapter index is 1-based key
            if (prevContent) {
                const prevSummary = prevContent.substring(Math.max(0, prevContent.length - 800)); // Last 800 chars
                context += `\n【上文回顾】\n...${prevSummary}\n`;
            }
        }

        // 2. Character State
        if (useState) {
            const chars = settings.characterState || [];
            if (chars.length > 0) {
                const charStr = chars.map(c => `${c.key}: ${c.value}`).join(', ');
                context += `\n【当前角色状态】\n${charStr}\n`;
            }
        }

        // 3. World Settings
        if (useWorld) {
            const world = settings.worldSettings || {};
            context += `\n【世界观设定】\n${JSON.stringify(world)}\n`;
        }

        // 4. Character Info (Detailed names, personalities, etc.)
        const charInfo = settings.characterInfo || [];
        if (charInfo.length > 0) {
            const charInfoStr = charInfo.map(c =>
                `姓名：${c.name}\n角色：${c.role || ''}\n性格：${c.personality || ''}\n外貌：${c.appearance || ''}\n背景：${c.background || ''}`
            ).join('\n---\n');
            context += `\n【重要角色信息】\n${charInfoStr}\n`;
        }

        // 5. Mode & Update Instructions
        let additionalInstructions = "";

        if (mode === 'plan') {
            additionalInstructions += "\n重要：在正式写作正文前，请先输出一个简短的【本章细纲】，梳理情节脉络，然后再进行正文写作。\n";
        }

        if (updateState) {
            additionalInstructions += "\n【状态更新指令】\n如果本章中角色状态（如等级、物品、状态等）发生变化，请在文章末尾以JSON格式输出更新后的状态列表，格式例如：\n```json\n{\"state_updates\": [{\"key\": \"等级\", \"value\": \"练气四层\"}]}\n```\n";
        }

        const outlineContent = useOutline ? `本章大纲：${currentOutline.summary}` : "本章大纲：(已忽略)";

        const prompt = `
你是一个专业的网文作家，擅长细腻的描写、紧凑的剧情和抓人的节奏。
请根据以下信息撰写小说正文。

【基础信息】
书名：${project.name}
分类：${project.category}
本章标题：${currentOutline.title}
${outlineContent}

【作者设定】
${project.authorRole}

【创作规则】
${project.rules}

${context}

【写作指令】
1. **严格字数控制**：请撰写第${index}章的正文。本章字数**必须**在 ${project.minWords} 到 ${project.maxWords} 字之间。**字数不足是严重的质量问题。**
2. **细节即字数**：为了达到字数要求，请详细描写环境、人物动作、心理活动和对话细节。不要跳过任何情节，深度展开每一分钟的剧情。
3. **严禁总结**：禁止以任何形式总结前文或本章，禁止出现“总而言之”、“于是”等大幅跳跃。
4. **完整输出**：请直接输出正文内容，确保内容在要求的长度范围内独立成章。
直接输出正文内容。
${additionalInstructions}
`;

        // Start Generation
        const btn = document.getElementById('btn-start-gen');
        const editorContainer = document.getElementById('editor-container');
        const display = document.getElementById('gen-content-display');
        const status = document.getElementById('gen-status-text');
        const progressBar = document.getElementById('gen-progress-bar');
        const progressPercent = document.getElementById('progress-percent');

        // Save Prompt Log
        storage.savePromptForMode('short-story', index, prompt, currentOutline.title);

        // Target words for progress estimation
        const targetWords = project.minWords || 2000;
        let generatedText = "";

        btn.disabled = true;
        status.innerText = '正在生成...';
        display.innerText = ''; // Clear prev

        // Show progress bar, hide editor content
        editorContainer.classList.add('generating');
        progressBar.style.width = '0%';
        progressPercent.innerText = '0%';

        try {
            await this.streamAi(prompt, (chunk) => {
                generatedText += chunk;

                // Update progress bar
                let progress = Math.min(99, Math.round((generatedText.length / targetWords) * 100));
                progressBar.style.width = `${progress}%`;
                progressPercent.innerText = `${progress}%`;

                this.updateWordCount(generatedText);
            });

            // Set to 100% when done
            progressBar.style.width = '100%';
            progressPercent.innerText = '100%';

            // Clean output and extract state updates
            const { cleanContent, stateUpdates, plan } = this.extractAndCleanStateUpdates(generatedText);

            // Save Response log
            storage.saveGenLogForMode('short-story', index, generatedText, currentOutline.title);

            // Save extracted plan if any
            if (plan) {
                storage.savePlanForMode('short-story', index, plan, currentOutline.title);
            }

            if (stateUpdates.length > 0) {
                stateUpdates.forEach(update => {
                    storage.saveStateUpdateForMode('short-story', index, update);
                });
            }

            // Update display and word count with clean content
            display.innerText = cleanContent;
            this.updateWordCount(cleanContent);

            // Save clean content to storage/txt
            storage.saveChapter(index, cleanContent, currentOutline.title);
            status.innerText = '生成完成 (已自动保存原始记录)';
            this.renderChapterList(); // Update icons

        } catch (e) {
            console.error(e);
            const config = apiConfig.getActiveConfig();
            const isLocal = config.id === 'local';
            
            let errorMessage = e.message;
            
            // 优化本地模型的错误信息
            if (isLocal) {
                if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
                    errorMessage = '无法连接到本地模型服务，请确保已安装并启动了Ollama。\n\n下载地址：https://ollama.com/\n启动命令：ollama serve';
                } else if (errorMessage.includes('404')) {
                    errorMessage = '模型未找到，请检查模型名称是否正确。\n\n可用模型列表：\n- llama3 (推荐)\n- llama3.1\n- mistral\n- qwen2';
                } else if (errorMessage.includes('500')) {
                    errorMessage = '本地模型服务出错，请检查模型文件是否完整。\n\n尝试重新下载模型：ollama pull llama3';
                } else if (errorMessage.includes('timeout')) {
                    errorMessage = '本地模型响应超时，请尝试：\n1. 增加等待时间\n2. 使用更小的模型 (如 llama3:8b)\n3. 检查系统资源占用';
                } else if (errorMessage.includes('memory') || errorMessage.includes('RAM')) {
                    errorMessage = '内存不足，请尝试：\n1. 使用更小的模型 (如 llama3:8b)\n2. 关闭其他占用内存的程序\n3. 增加系统交换空间';
                }
            }
            
            status.innerText = '生成出错';
            alert('生成出错:\n\n' + errorMessage);
        } finally {
            btn.disabled = false;
            // Hide progress bar, show editor content
            setTimeout(() => {
                editorContainer.classList.remove('generating');
            }, 500);
        }
    }

    extractAndCleanStateUpdates(text) {
        let cleanContent = text;
        const stateUpdates = [];
        let plan = "";

        // 1. Extract JSON State Updates
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
        let match;
        while ((match = jsonRegex.exec(text)) !== null) {
            try {
                const jsonStr = match[1];
                const data = JSON.parse(jsonStr);
                if (data.state_updates) {
                    stateUpdates.push(data);
                }
            } catch (e) {
                console.error('Failed to parse state update JSON:', e);
            }
        }

        // 2. Remove JSON blocks
        cleanContent = cleanContent.replace(jsonRegex, '').trim();

        // 3. Remove AI-generated "Chapter Outlines" or "Plans" if they exist
        // Common patterns created by prompt instructions
        const outlinePatterns = [
            /【本章细纲】[\s\S]*?正文[:：]?\s*/i,
            /本章细纲[:：]?[\s\S]*?正文[:：]?\s*/i,
            /第\d+章细纲[:：]?[\s\S]*?正文[:：]?\s*/i
        ];

        outlinePatterns.forEach(pattern => {
            const planMatch = cleanContent.match(pattern);
            if (planMatch) {
                plan = planMatch[0].trim();
            }
            cleanContent = cleanContent.replace(pattern, '').trim();
        });

        return { cleanContent, stateUpdates, plan };
    }

    async streamAi(prompt, onChunk) {
        const config = apiConfig.getActiveConfig();
        if (!config) throw new Error('API未配置');

        const isLocal = config.id === 'local';
        let headers = {
            'Content-Type': 'application/json'
        };

        // Local models don't need API key
        if (!isLocal && config.apiKey) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
        }

        try {
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: isLocal ? 0.7 : 0.8,
                    max_tokens: isLocal ? 4000 : 8000,
                    stream: true
                })
            });

            if (!response.ok) {
                if (isLocal && response.status === 404) {
                    throw new Error('本地模型服务未运行，请确保Ollama已启动且端口正确。');
                }
                let errorMessage = `API Error: ${response.status}`;
                if (response.status === 401) {
                    errorMessage = 'API Key无效或过期，请重新配置API Key';
                } else if (response.status === 402) {
                    errorMessage = 'API配额不足或需要付费，请检查账户余额或升级套餐';
                } else if (response.status === 403) {
                    errorMessage = '访问被拒绝，请检查API Key是否正确或是否有权限访问该模型';
                } else if (response.status === 404) {
                    errorMessage = 'API端点不存在，请检查配置的API端点是否正确';
                } else if (response.status === 429) {
                    errorMessage = '请求过于频繁，请稍后重试';
                } else if (response.status === 500 || response.status === 502 || response.status === 503) {
                    errorMessage = '服务器错误，请稍后重试或联系API提供商';
                }
                throw new Error(errorMessage);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.replace('data: ', '');
                        if (jsonStr.trim() === '[DONE]') break;
                        try {
                            const data = JSON.parse(jsonStr);
                            const content = data.choices[0].delta.content;
                            if (content) onChunk(content);
                        } catch (e) {
                            // ignore parse errors for partial lines
                        }
                    }
                }
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                if (isLocal) {
                    throw new Error('无法连接到本地模型服务，请检查：\n1. Ollama是否已安装并启动\n2. 本地服务端口是否正确（默认: 11434）\n3. 防火墙设置');
                }
            }
            throw error;
        }
    }

    openNovelFolder() {
        try {
            const project = storage.loadProjectForMode('short-story');
            const projectName = project.name || 'default';
            const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');
            const dataDir = path.join(process.cwd(), 'data', safeProjectName);

            if (typeof require !== 'undefined') {
                const { shell } = require('electron');
                if (shell) {
                    shell.openPath(dataDir);
                } else {
                    // Fallback for browser environment
                    alert('小说文件位置:\n\n' + dataDir + '\n\n请在文件管理器中打开此路径查看小说文件。');
                }
            } else {
                // Fallback for browser environment
                alert('小说文件位置:\n\n' + dataDir + '\n\n请在文件管理器中打开此路径查看小说文件。');
            }
        } catch (error) {
            console.error('打开小说文件夹失败:', error);
            try {
                const project = storage.loadProjectForMode('short-story');
                const projectName = project.name || 'default';
                const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '_');
                const dataDir = path.join(process.cwd(), 'data', safeProjectName);
                alert('打开文件夹失败，请手动打开以下路径:\n\n' + dataDir + '\n\n错误信息: ' + error.message);
            } catch (err) {
                alert('打开文件夹失败，请检查小说是否已保存。');
            }
        }
    }

    // 从分析结果填充章节内容
    fillFromAnalysis(chapters) {
        if (!chapters || chapters.length === 0) {
            return false;
        }

        // 保存章节内容
        chapters.forEach((chapter, index) => {
            const chapterNumber = chapter.chapterNumber || (index + 1);
            storage.saveChapter(chapterNumber, chapter.content, chapter.title);
        });

        // 刷新章节列表
        this.renderChapterList();
        return true;
    }
}

const novelGenerator = new NovelGenerator();
