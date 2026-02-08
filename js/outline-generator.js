class OutlineGenerator {
    constructor() {
        this.currentMode = 'short-story';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadConfig();
        this.renderOutlineList();
    }

    bindEvents() {
        // Generate Button
        document.getElementById('btn-generate-outline').addEventListener('click', () => this.generateOutline());

        // Brainstorm Button
        document.getElementById('btn-brainstorm-summary').addEventListener('click', () => this.brainstormSummary());

        // Auto-save selling point to project
        document.getElementById('outline-summary').addEventListener('input', (e) => {
            const project = storage.loadProjectForMode(this.currentMode);
            project.sellingPoint = e.target.value;
            storage.saveProjectForMode(this.currentMode, project);
        });

        // Search listener
        document.getElementById('outline-search').addEventListener('input', (e) => {
            this.renderOutlineList(e.target.value);
        });

        // Tab Switching
        document.querySelectorAll('#page-outline .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#page-outline .tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('#page-outline .tab-content').forEach(c => c.classList.remove('active'));

                e.target.classList.add('active');
                const tabId = e.target.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Config Buttons
        document.getElementById('btn-add-outline-field').addEventListener('click', () => this.addFieldRow());
        document.getElementById('btn-reset-outline-config').addEventListener('click', () => this.resetConfig());

        // Delete Delegate
        document.getElementById('outline-field-list').addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete-field')) {
                e.target.closest('.field-row').remove();
                this.saveConfig();
            }
        });

        // Save on input change (auto-save config)
        document.getElementById('outline-field-list').addEventListener('input', () => {
            // Debounce could be added here, but for now direct save is okay or just save on generate
            this.saveConfig();
        });

        // 卷级大纲相关事件
        document.getElementById('btn-switch-to-volume-outline')?.addEventListener('click', () => {
            if (typeof app !== 'undefined') {
                app.navigateTo('volume');
            }
        });
    }

    loadConfig() {
        let config = storage.loadForMode(this.currentMode, 'outline_config', null);

        if (!config && typeof APP_TEMPLATES !== 'undefined' && APP_TEMPLATES.outline_system) {
            config = APP_TEMPLATES.outline_system.outline_components;
        }

        this.renderFieldList(config || []);

        // Also load the selling point into the textarea
        const project = storage.loadProjectForMode(this.currentMode);
        if (project && project.sellingPoint) {
            const summaryEl = document.getElementById('outline-summary');
            if (summaryEl) {
                summaryEl.value = project.sellingPoint;
            }
        }
    }

    resetConfig() {
        if (typeof APP_TEMPLATES !== 'undefined' && APP_TEMPLATES.outline_system) {
            const config = APP_TEMPLATES.outline_system.outline_components;
            this.renderFieldList(config);
            this.saveConfig();
        }
    }

    saveConfig() {
        const fields = this.getFields();
        storage.saveForMode(this.currentMode, 'outline_config', fields);
    }

    getFields() {
        const fields = [];
        document.querySelectorAll('#outline-field-list .field-input').forEach(input => {
            if (input.value.trim()) {
                fields.push(input.value.trim());
            }
        });
        return fields;
    }

    renderFieldList(fields) {
        const container = document.getElementById('outline-field-list');
        container.innerHTML = '';
        fields.forEach(field => this.addFieldRow(field));
    }

    addFieldRow(value = '') {
        const container = document.getElementById('outline-field-list');
        const row = document.createElement('div');
        row.className = 'field-row form-row mb-2';
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <div class="col">
                <input type="text" class="form-control field-input" value="${value}" placeholder="例如：主要情节：描述本章发生的核心事件">
            </div>
            <div class="col-auto">
                <button class="btn btn-sm btn-danger btn-delete-field"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(row);
    }

    async generateOutline() {
        const summary = document.getElementById('outline-summary').value;
        const count = parseInt(document.getElementById('outline-count').value);

        if (!summary) {
            storage.showError('请输入故事梗概');
            return;
        }

        // 验证章节数
        if (isNaN(count) || count < 1 || count > 100) {
            storage.showError('请输入有效的章节数（1-100）');
            return;
        }

        const btn = document.getElementById('btn-generate-outline');
        const originalText = btn.innerText;
        btn.innerText = '生成中...';
        btn.disabled = true;

        try {
            const project = storage.loadProjectForMode('short-story');
            const fields = this.getFields();
            const settings = storage.loadSettingsForMode('short-story');
            const existingOutlines = storage.loadOutlinesForMode('short-story');

            let systemRole = "你是一个专业的网文策划。";
            if (typeof APP_TEMPLATES !== 'undefined' && APP_TEMPLATES.outline_system) {
                systemRole = APP_TEMPLATES.outline_system.task_description;
            }

            // 1. Context: Character & World Settings
            let contextStr = "";
            const chars = settings.characterState || [];
            if (chars.length > 0) {
                const charList = chars.map(c => `${c.key}: ${c.value}`).join(', ');
                contextStr += `\n【当前人物/角色状态】\n${charList}\n`;
            }

            const world = settings.worldSettings || [];
            if (world.length > 0) {
                const worldList = world.map(w => `${w.key}: ${w.value}`).join('\n');
                contextStr += `\n【世界观/背景设定】\n${worldList}\n`;
            }

            // Character Info (Detailed names, personalities, etc.)
            const charInfo = settings.characterInfo || [];
            if (charInfo.length > 0) {
                const charInfoStr = charInfo.map(c =>
                    `姓名：${c.name}\n角色：${c.role || ''}\n性格：${c.personality || ''}\n外貌：${c.appearance || ''}\n背景：${c.background || ''}`
                ).join('\n---\n');
                contextStr += `\n【重要角色信息】\n${charInfoStr}\n`;
            }

            // 2. Context: Previous Outlines (last 3)
            if (existingOutlines.length > 0) {
                const lastIdx = existingOutlines.length;
                const prevContext = existingOutlines.slice(-3).map((o, i) => {
                    const chNum = (lastIdx - (existingOutlines.slice(-3).length - 1)) + i;
                    return `第${chNum}章：${o.title}\n内容梗概：${o.summary}`;
                }).join('\n\n');
                contextStr += `\n【前文大纲回顾】（请务必承接以下剧情）\n${prevContext}\n`;
            }

            // Construct requirements based on dynamic fields
            const fieldReqs = fields.map((f, i) => `${i + 1}. ${f}`).join('\n');

            const nextChapterNum = existingOutlines.length + 1;

            const prompt = `${systemRole}
请根据以下提出的【核心创意与剧情卖点】，为小说《${project.name}》（分类：${project.category}）设计接下来的${count}个章节（从第${nextChapterNum}章开始）的大纲。

【核心指令】
1. **卖点驱动**：所有章节的剧情、冲突和反转都必须围绕【核心创意与剧情卖点】进行深度扩充和落地展示。
2. **角色/金手指联动**：充分利用主角现有的“金手指”和设定来服务于这个卖点，确保护道、升级或装逼情节自然流畅。
3. **承接前文**：如果提供了“前文大纲回顾”，剧情必须逻辑严密地衔接。
4. **人名/设定一致**：严禁修改已有的人物名字、等级、境界等关键设定。

${contextStr}

本阶段核心创意与剧情卖点：
${summary}

【大纲详细要求】
请为每一章生成以下内容，注意字数限制：
1. **主要情节**：200-300字，必须详细描述起承转合、具体的动作和台词要点。
2. **关键冲突**：50-100字，明确核心矛盾、应对方式、最终结果。
3. **情感曲线**：简述“开头→中间→结尾”的情绪波动状态（如：压抑→愤怒→爆发）。

【输出格式】
必须输出纯标准的JSON数组，格式如下：
{
    "chapters": [
        {
            "title": "章节标题",
            "plot": "主要情节内容（200-300字）",
            "conflict": "关键冲突描写",
            "emotion": "情感曲线描述"
        }
    ]
}
注意：严禁输出其他无关文字。确保JSON语法绝对正确。
`;

            // Check API Config
            const response = await this.callAi(prompt);
            const jsonStr = this.extractJson(response);

            if (jsonStr) {
                const data = JSON.parse(jsonStr);
                // Validate structure
                if (data.chapters && Array.isArray(data.chapters)) {
                    this.saveOutlines(data.chapters);
                    this.renderOutlineList();

                    // Switch to list tab
                    document.querySelector('[data-tab="tab-outline-list"]').click();

                    alert('大纲生成成功');
                } else {
                    throw new Error('AI返回的JSON结构不正确');
                }
            } else {
                throw new Error('无法从AI响应中解析JSON');
            }

        } catch (e) {
            console.error(e);
            alert('生成失败: ' + e.message);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }

    async callAi(prompt, temperature = 0.7) {
        const config = apiConfig.getActiveConfig();
        if (!config) {
            throw new Error('请先配置API');
        }

        // 本地模型不需要API Key
        if (config.id !== 'local' && (!config.apiKey || config.apiKey.trim() === '')) {
            throw new Error('请先配置API Key');
        }

        // 确保模型名称不为空
        if (!config.model || config.model.trim() === '') {
            throw new Error('请先配置模型名称');
        }

        // 构建请求数据
        let data;
        let headers = {
            'Content-Type': 'application/json'
        };

        // 本地模型不需要Authorization头
        if (config.id !== 'local' && config.apiKey) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
        }

        // 根据API类型构建不同的请求格式
        if (config.id === 'local') {
            // Ollama API格式
            data = {
                model: config.model,
                messages: [
                    { role: 'system', content: 'You are a professional web novel planner.' },
                    { role: 'user', content: prompt }
                ],
                stream: false,
                options: {
                    temperature: temperature
                }
            };
        } else {
            // OpenAI兼容API格式
            data = {
                model: config.model,
                messages: [
                    { role: 'system', content: 'You are a professional web novel planner.' },
                    { role: 'user', content: prompt }
                ],
                temperature: temperature
            };
        }

        try {
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
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

            const result = await response.json();
            
            // 打印响应结果以进行调试
            console.log('API Response:', JSON.stringify(result, null, 2));

            // 根据API类型解析不同的响应格式
            if (config.id === 'local') {
                // Ollama API响应格式 - 处理多种可能的格式
                if (result.message && result.message.content) {
                    return result.message.content;
                } else if (result.content) {
                    return result.content;
                } else if (result.choices && result.choices[0] && result.choices[0].message) {
                    return result.choices[0].message.content;
                } else {
                    throw new Error('API返回格式错误: ' + JSON.stringify(result));
                }
            } else {
                // OpenAI兼容API响应格式
                if (result.choices && result.choices[0] && result.choices[0].message) {
                    return result.choices[0].message.content;
                } else if (result.message && result.message.content) {
                    return result.message.content;
                } else if (result.content) {
                    return result.content;
                } else {
                    throw new Error('API返回格式错误');
                }
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('无法连接到API服务器，请检查：\n1. API端点是否正确\n2. 网络连接是否正常\n3. 防火墙设置是否阻止了连接\n4. 本地模型服务是否正在运行');
            }
            throw error;
        }
    }

    async brainstormSummary() {
        const btn = document.getElementById('btn-brainstorm-summary');
        const originalText = btn.innerHTML;
        const project = storage.loadProjectForMode('short-story');
        const settings = storage.loadSettingsForMode('short-story');
        const existingOutlines = storage.loadOutlinesForMode('short-story');

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 思考中...';
        btn.disabled = true;

        try {
            let contextStr = `小说标题：${project.name}\n小说分类：${project.category}\n`;

            if (project.authorRole) {
                contextStr += `【人设与设定要求】：\n${project.authorRole}\n`;
            }
            if (project.rules) {
                contextStr += `【创作与风格规则】：\n${project.rules}\n`;
            }

            const chars = settings.characterState || [];
            if (chars.length > 0) {
                const charList = chars.map(c => `${c.key}: ${c.value}`).join(', ');
                contextStr += `【当前人物状态】：${charList}\n`;
            }

            const charInfo = settings.characterInfo || [];
            if (charInfo.length > 0) {
                const charInfoStr = charInfo.map(c =>
                    `姓名：${c.name} (角色：${c.role || ''})`
                ).join(', ');
                contextStr += `【设定角色】：${charInfoStr}\n`;
            }

            if (existingOutlines.length > 0) {
                const lastIdx = existingOutlines.length;
                const lastOutline = existingOutlines[lastIdx - 1];
                contextStr += `【前章剧情】（第${lastIdx}章）：${lastOutline.title}\n内容：${lastOutline.summary}\n`;
            }

            const prompt = `你是一个脑洞大开、深谙网文商业套路的顶级策划。请根据以下已知信息，为我的小说构思一个具有强力吸引力的【核心创意与剧情卖点】。
要求：
1. **严格遵循设定**：必须参考提供的【人设与设定要求】和【创作与风格规则】，严禁凭空产生与之冲突的创意。
2. **非章节情节**：不要写成具体的章节流水账，而是写出一个“钩子”（Hook）、一个创新的金手指扩展、或者一个极具冲突的阶段性大目标。
3. **商业价值**：创意要具有极强的“爽感”或“创新性”，符合${project.category}分类的流行趋势。
4. **逻辑衔接**：必须基于前文剧情，合理延伸主角的成长路线。
5. **字数限制**：大约150-250字，言简意赅，充满爆发力。
6. 直接输出卖点内容，不要有任何开场白或解释。

当前信息：
${contextStr}

请输出符合设定的核心创意与剧情卖点：`;

            const response = await this.callAi(prompt, 0.85);
            if (response) {
                const summary = response.trim();
                document.getElementById('outline-summary').value = summary;

                // Sync to project storage immediately
                const project = storage.loadProjectForMode(this.currentMode);
                project.sellingPoint = summary;
                storage.saveProjectForMode(this.currentMode, project);
            }
        } catch (e) {
            console.error(e);
            alert('头脑风暴失败: ' + e.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    extractJson(text) {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? match[0] : null;
    }

    saveOutlines(newChapters) {
        let outlines = storage.loadOutlinesForMode(this.currentMode);
        newChapters.forEach(ch => {
            outlines.push(ch);
        });
        storage.saveOutlinesForMode(this.currentMode, outlines);
    }

    renderOutlineList(query = '') {
        const container = document.getElementById('outline-list-container');
        const outlines = storage.loadOutlinesForMode(this.currentMode);

        if (outlines.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无大纲，请点击生成</div>';
            return;
        }

        let html = '';
        outlines.forEach((outline, index) => {
            const title = outline.title || '';

            // Handle legacy summary or new segmented fields
            const plot = outline.plot || outline.summary || '';
            const conflict = outline.conflict || '';
            const emotion = outline.emotion || '';

            // Filter logic (check all fields)
            const searchText = `${title} ${plot} ${conflict} ${emotion} 第${index + 1}章`.toLowerCase();
            if (query && !searchText.includes(query.toLowerCase())) {
                return;
            }

            html += `
                <div class="outline-card" id="outline-card-${index}" data-index="${index}">
                    <div class="outline-card-badge">Chapter ${index + 1}</div>
                    <div class="outline-card-header">
                        <div class="outline-card-title" contenteditable="true" 
                             oninput="outlineGenerator.markModified(${index})"
                             onblur="outlineGenerator.saveOutlineEdit(${index})">第${index + 1}章：${title}</div>
                    </div>
                    <div class="outline-card-body">
                        <div class="outline-segment">
                            <label class="segment-label"><i class="fas fa-scroll"></i> 主要情节</label>
                            <div class="outline-card-content segment-plot" contenteditable="true"
                                 oninput="outlineGenerator.markModified(${index})"
                                 onblur="outlineGenerator.saveOutlineEdit(${index})">${plot}</div>
                        </div>
                        <div class="outline-segment">
                            <label class="segment-label"><i class="fas fa-bolt"></i> 关键冲突</label>
                            <div class="outline-card-content segment-conflict" contenteditable="true"
                                 oninput="outlineGenerator.markModified(${index})"
                                 onblur="outlineGenerator.saveOutlineEdit(${index})">${conflict}</div>
                        </div>
                        <div class="outline-segment">
                            <label class="segment-label"><i class="fas fa-heartbeat"></i> 情感曲线</label>
                            <div class="outline-card-content segment-emotion" contenteditable="true"
                                 oninput="outlineGenerator.markModified(${index})"
                                 onblur="outlineGenerator.saveOutlineEdit(${index})">${emotion}</div>
                        </div>
                    </div>
                    <div class="outline-card-actions">
                        <span class="card-save-hint" id="save-hint-${index}">已修改，自动保存中...</span>
                        <button class="btn btn-sm btn-primary" onclick="outlineGenerator.jumpToWriting(${index + 1})">
                            <i class="fas fa-pen-nib"></i> 去写作
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="outlineGenerator.deleteOutline(${index})">
                            <i class="fas fa-trash-alt"></i> 删除
                        </button>
                    </div>
                </div>
            `;
        });

        if (html === '' && query) {
            html = '<div class="empty-state">未找到匹配的大纲</div>';
        }

        container.innerHTML = html;
    }

    markModified(index) {
        const card = document.getElementById(`outline-card-${index}`);
        if (card) {
            card.classList.add('modified');
        }
    }

    saveOutlineEdit(index) {
        const card = document.getElementById(`outline-card-${index}`);
        if (!card) return;

        const titleEl = card.querySelector('.outline-card-title');
        const plotEl = card.querySelector('.segment-plot');
        const conflictEl = card.querySelector('.segment-conflict');
        const emotionEl = card.querySelector('.segment-emotion');
        const hintEl = document.getElementById(`save-hint-${index}`);

        // Extract clean text
        let titleText = titleEl.innerText.trim();
        const prefixMatch = titleText.match(/^第\d+章：(.*)/);
        if (prefixMatch) {
            titleText = prefixMatch[1].trim();
        }

        const plotText = plotEl.innerText.trim();
        const conflictText = conflictEl.innerText.trim();
        const emotionText = emotionEl.innerText.trim();

        // Load, Update, Save
        let outlines = storage.loadOutlinesForMode(this.currentMode);
        if (outlines[index]) {
            outlines[index].title = titleText;
            outlines[index].plot = plotText;
            outlines[index].conflict = conflictText;
            outlines[index].emotion = emotionText;
            // Also update summary for backward compatibility and novelty generation logic
            outlines[index].summary = `${plotText}\n\n【冲突】\n${conflictText}\n\n【情感】\n${emotionText}`;

            storage.saveOutlinesForMode(this.currentMode, outlines);

            // Visual Feedback
            card.classList.remove('modified');
            if (hintEl) {
                hintEl.innerText = '已自动保存';
                hintEl.style.opacity = '0.7';
                hintEl.style.color = 'var(--success-color)';
                setTimeout(() => {
                    if (!card.classList.contains('modified')) {
                        hintEl.style.opacity = '0';
                    }
                }, 2000);
            }
        }
    }

    jumpToWriting(chapterIndex) {
        if (this.currentMode === 'short-story') {
            if (typeof app !== 'undefined') {
                app.navigateTo('generate');
                setTimeout(() => {
                    if (typeof novelGenerator !== 'undefined') {
                        novelGenerator.loadChapter(chapterIndex);
                    }
                }, 100);
            }
        } else if (this.currentMode === 'medium-length') {
            if (typeof app !== 'undefined') {
                app.navigateTo('volume-write');
            }
        }
    }

    deleteOutline(index) {
        if (!confirm('确定要删除这一章的大纲吗？相关生成内容不会受影响。')) return;
        let outlines = storage.load('outlines', []);
        outlines.splice(index, 1);
        storage.save('outlines', outlines);
        this.renderOutlineList();
    }

    // 从分析结果填充章节大纲信息
    fillFromAnalysis(analysisResult) {
        if (!analysisResult || !analysisResult.chapterOutline) {
            return false;
        }

        // 确保chapterOutline是一个数组
        const chapterOutline = Array.isArray(analysisResult.chapterOutline) ? analysisResult.chapterOutline : [];
        if (chapterOutline.length === 0) {
            return false;
        }

        // 转换大纲格式
        const outlines = chapterOutline.map(chapter => ({
            title: chapter.title || `第${chapter.chapterNumber || '未知'}章`,
            plot: chapter.summary || '暂无内容梗概',
            conflict: chapter.conflict || '',
            emotion: chapter.emotion || ''
        }));

        if (outlines.length > 0) {
            // 保存大纲
            storage.save('outlines', outlines);
            // 刷新大纲列表
            this.renderOutlineList();
            return true;
        }

        return false;
    }
}

const outlineGenerator = new OutlineGenerator();
