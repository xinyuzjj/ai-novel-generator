class GreatArchitect {
    constructor() {
        this.currentStep = 1;
        this.selectedIdea = null;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Navigation
        document.getElementById('btn-architect-next').addEventListener('click', () => this.nextStep());
        document.getElementById('btn-architect-prev').addEventListener('click', () => this.prevStep());

        // Stage 1: Expand
        document.getElementById('btn-architect-expand').addEventListener('click', () => this.expandIdea());
        document.getElementById('btn-architect-preset').addEventListener('click', () => this.showPresets());

        // Stage 2: Build
        document.getElementById('btn-architect-build').addEventListener('click', () => this.buildBible());
        document.getElementById('btn-architect-save-outline').addEventListener('click', () => this.saveOutline());

        // Stage 3: Write/Helper
        document.getElementById('architect-editor').addEventListener('input', (e) => this.handleEditorInput(e));
        document.getElementById('btn-architect-write').addEventListener('click', () => this.assistWrite());
        document.getElementById('btn-architect-outline-write').addEventListener('click', () => this.writeFromOutline());
        document.getElementById('btn-architect-save-draft').addEventListener('click', () => this.saveDraft());
        document.getElementById('btn-architect-import').addEventListener('click', () => this.importChapter());
        document.getElementById('btn-scene-next').addEventListener('click', () => this.nextScene());
        document.getElementById('btn-scene-prev').addEventListener('click', () => this.prevScene());

        // Stage 4: Optimize
        document.getElementById('btn-architect-optimize').addEventListener('click', () => this.optimizeContent());
        document.getElementById('btn-architect-finalize').addEventListener('click', () => this.finalizeContent());
        document.getElementById('btn-architect-export').addEventListener('click', () => this.exportToTXT());
        document.getElementById('btn-architect-preview').addEventListener('click', () => this.previewOptimization());

        // Intensity slider
        const intensitySlider = document.getElementById('architect-intensity');
        const intensityValue = document.getElementById('intentsity-value');
        if (intensitySlider && intensityValue) {
            intensitySlider.addEventListener('input', (e) => {
                intensityValue.textContent = e.target.value;
            });
        }

        // Load chapters on stage 3
        document.querySelector('.stage[data-step="3"]')?.addEventListener('click', () => {
            this.loadChapters();
        });

        // Tab navigation for stages
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                
                // Remove active from all tabs
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Hide all tab contents
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                // Show target
                document.getElementById(targetTab)?.classList.add('active');
            });
        });

        // Load saved draft
        const savedDraft = storage.load('architect_draft', null);
        if (savedDraft) {
            const editor = document.getElementById('architect-editor');
            if (editor && savedDraft.content) {
                editor.value = savedDraft.content;
            }
        }
    }

    // --- Navigation Logic ---

    updateWizardUI() {
        // Update steps
        document.querySelectorAll('.wizard-steps .step').forEach(step => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            step.classList.remove('active', 'completed');
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Update stages
        document.querySelectorAll('.architect-stage').forEach(stage => {
            stage.classList.remove('active');
        });
        document.getElementById(`architect-stage-${this.currentStep}`).classList.add('active');

        // Update buttons
        document.getElementById('btn-architect-prev').disabled = (this.currentStep === 1);

        // Next button is only enabled if logic allows (e.g. choice made in Stage 1)
        this.validateCurrentStep();
    }

    validateCurrentStep() {
        const nextBtn = document.getElementById('btn-architect-next');
        let isValid = false;

        switch (this.currentStep) {
            case 1: isValid = !!this.selectedIdea; break;
            case 2: isValid = true; break; // Allow skip for now
            case 3: isValid = document.getElementById('architect-editor').value.length > 50; break;
            case 4: isValid = true; break;
        }

        nextBtn.disabled = !isValid;
    }

    nextStep() {
        if (this.currentStep < 4) {
            this.currentStep++;
            this.updateWizardUI();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateWizardUI();
        }
    }

    // --- Stage 1: Creative Expansion ---

    async expandIdea() {
        const input = document.getElementById('architect-input-1').value.trim();
        if (!input) {
            alert('请先输入你的创意碎片');
            return;
        }

        const resultsContainer = document.getElementById('architect-results-1');
        const btn = document.getElementById('btn-architect-expand');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在衍生脉络...';
        resultsContainer.innerHTML = '<div class="loading-placeholder">AI 正在深度思考中，请耐心等待衍生结果...</div>';

        // Get user preferences
        const selectedStyles = Array.from(document.querySelectorAll('input[name="architect-style"]:checked'))
            .map(checkbox => checkbox.value);
        const ideaCount = document.getElementById('architect-idea-count').value;
        const detailLevel = document.getElementById('architect-detail-level').value;

        let styleDescription = '';
        if (selectedStyles.length > 0) {
            styleDescription = `
【风格偏好】
用户希望故事包含以下元素：${selectedStyles.join('、')}`;
        }

        let detailDescription = '';
        switch (detailLevel) {
            case 'basic':
                detailDescription = '每个方向只需要标题和一句话介绍，简洁明了。';
                break;
            case 'comprehensive':
                detailDescription = '每个方向需要详细的介绍，包括核心亮点、目标读者群体、商业卖点等。';
                break;
            default:
                detailDescription = '每个方向需要标题、一句话介绍和相关标签。';
        }

        const prompt = `您是一位拥有20年网文创作经验的资深网文架构师，擅长“钩子”设计和商业爆款分析。
基于用户提供的初始创意：【${input}】

【任务目标】
请基于这个创意，衍生出 ${ideaCount} 个完全不同发展方向的故事架构。

${styleDescription}

【细节要求】
${detailDescription}

【重要：输出格式要求】
必须直接输出一个 JSON 数组，不要包含任何 Markdown 代码块标签（如 \`\`\`json），不要有任何解释性文字。
严格遵守 JSON 语法，所有字符串必须使用双引号包裹，即使字符串中包含引号也请进行转义。
示例格式：
[
  {
    "id": 1, 
    "title": "故事标题", 
    "logline": "一句话核心介绍", 
    "tags": ["标签1", "标签2"],
    "highlights": "核心亮点描述"
  }
]`;

        try {
            let fullText = "";
            await novelGenerator.streamAi(prompt, (chunk) => {
                fullText += chunk;
            });

            // Parse and render
            const cleanJson = this.extractJson(fullText);
            const ideas = this.repairJson(cleanJson);

            this.renderIdeas(ideas);
        } catch (e) {
            console.error(e);
            resultsContainer.innerHTML = `<div class="alert alert-error">生成失败: ${e.message}</div>`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-wand-sparkles"></i> 重新衍生故事脉络';
        }
    }

    extractJson(text) {
        // Find the first '[' and the last ']'
        let start = text.indexOf('[');
        let end = text.lastIndexOf(']') + 1;

        if (start === -1) {
            // Try looking for '{' if it's not an array (unlikely but safe)
            start = text.indexOf('{');
            end = text.lastIndexOf('}') + 1;
        }

        if (start !== -1 && end !== -1) {
            let jsonStr = text.substring(start, end);

            // Clean up common AI artifacts
            jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

            return jsonStr;
        }
        return text.trim();
    }

    // Attempt to repair slightly malformed JSON (unquoted keys or string values)
    repairJson(jsonStr) {
        try {
            // First try direct parse
            return JSON.parse(jsonStr);
        } catch (e) {
            console.warn('Initial JSON parse failed, attempting repair...', e);
            try {
                // Common fix: wrap unquoted string values that look like text
                // This is a naive regex fix for simple "key": value where value is missing quotes
                // It looks for : followed by space and then characters that ARE NOT [ { " digit
                let repaired = jsonStr.replace(/:\s*([^"\[\{\d\s][^,\]\}]*)/g, (match, p1) => {
                    const trimmed = p1.trim();
                    if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null') return match;
                    return `: "${trimmed}"`;
                });

                return JSON.parse(repaired);
            } catch (e2) {
                throw new Error('无法解析 AI 输出的格式，请重试。错误: ' + e.message);
            }
        }
    }

    renderIdeas(ideas) {
        const container = document.getElementById('architect-results-1');
        container.innerHTML = '';

        ideas.forEach((idea, index) => {
            const card = document.createElement('div');
            card.className = 'idea-card';
            card.innerHTML = `
                <div class="idea-header">
                    <h4>${idea.title}</h4>
                    <span class="idea-number">#${index + 1}</span>
                </div>
                <p class="logline">${idea.logline}</p>
                <div class="ideas-details">
                    ${idea.highlights ? `<div class="highlight-box"><i class="fas fa-star"></i> ${idea.highlights}</div>` : ''}
                    <div class="tags">
                        ${idea.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                </div>
                <div class="idea-actions">
                    <button class="btn btn-sm btn-primary btn-select-idea" onclick="greatArchitect.selectIdea(${index})">
                        <i class="fas fa-check"></i> 选择这个
                    </button>
                    <button class="btn btn-sm btn-secondary btn-preview-idea" onclick="greatArchitect.previewIdea(${index})">
                        <i class="fas fa-eye"></i> 预览
                    </button>
                </div>
            `;
            card.onclick = (e) => {
                if (!e.target.closest('button')) {
                    this.selectIdea(idea, card);
                }
            };
            container.appendChild(card);
        });

        // Store ideas for reference
        this.generatedIdeas = ideas;
    }

    selectIdea(ideaIndex, cardElement) {
        const idea = this.generatedIdeas[ideaIndex];
        this.selectedIdea = idea;
        document.getElementById('architect-selected-title').value = idea.title;

        // Highlight selected
        document.querySelectorAll('.idea-card').forEach(c => c.classList.remove('selected'));
        if (cardElement) {
            cardElement.classList.add('selected');
        } else {
            const allCards = document.querySelectorAll('.idea-card');
            allCards[ideaIndex].classList.add('selected');
        }

        this.validateCurrentStep();
    }

    previewIdea(ideaIndex) {
        const idea = this.generatedIdeas[ideaIndex];
        const previewContent = `
【故事标题】
${idea.title}

【一句话介绍】
${idea.logline}

【核心标签】
${idea.tags.join('、')}

${idea.highlights ? `\n【核心亮点】\n${idea.highlights}` : ''}
`.trim();

        alert(previewContent);
    }

    showPresets() {
        const presets = [
            {
                title: "无敌流",
                description: "主角开局无敌，一路装X打脸的爽文模式",
                example: "一个重生者回到过去，发现自己可以预知未来，从此在都市中纵横无敌"
            },
            {
                title: "苟流",
                description: "主角隐藏实力，暗中发育，扮猪吃老虎",
                example: "一个表面看似普通的学生，实则是修仙大佬转世，在现代都市中低调修炼"
            },
            {
                title: "系统流",
                description: "主角获得神奇系统，完成任务获得奖励",
                example: "一个普通宅男获得超级神豪系统，完成各种奇葩任务获得亿万财富"
            },
            {
                title: "穿越重生",
                description: "主角穿越到异世界或重生到过去",
                example: "一个普通上班族重生到修仙世界，发现自己带着前世记忆和经验"
            },
            {
                title: "异能都市",
                description: "现代都市背景下的超能力故事",
                example: "一个能控制时间的少年，在充满异能者的都市中挣扎求生"
            }
        ];

        let presetHtml = '<div class="preset-list">';
        presets.forEach((preset, index) => {
            presetHtml += `
                <div class="preset-item" onclick="greatArchitect.applyPreset(${index})">
                    <h4>${preset.title}</h4>
                    <p>${preset.description}</p>
                    <div class="example-text">💡 示例：${preset.example}</div>
                </div>
            `;
        });
        presetHtml += '</div>';

        const modal = document.createElement('div');
        modal.className = 'preset-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content" style="width: 500px; max-width: 90vw;">
                <div class="modal-header">
                    <h3>选择预设模板</h3>
                    <span class="close-modal" onclick="this.closest('.preset-modal').remove()">×</span>
                </div>
                <div class="modal-body">
                    <p>选择一个预设模板作为创作起点：</p>
                    ${presetHtml}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    applyPreset(index) {
        const presets = [
            "主角开局无敌，在都市中一路装X打脸的爽文模式",
            "主角隐藏实力，暗中发育，扮猪吃老虎",
            "主角获得神奇系统，完成任务获得奖励",
            "主角穿越到修仙世界，带着前世记忆",
            "主角获得超能力，在现代都市中挣扎求生"
        ];

        document.getElementById('architect-input-1').value = presets[index];
        document.querySelector('.preset-modal')?.remove();
    }

    selectIdea(idea) {
        this.selectedIdea = idea;
        document.getElementById('architect-selected-title').value = idea.title;

        // Highlight selected
        document.querySelectorAll('.idea-card').forEach(c => c.classList.remove('selected'));
        // Find the card (simple way)
        event.currentTarget.classList.add('selected');

        this.validateCurrentStep();
    }

    // --- Stage 2: Character & Pacing ---

    async buildBible() {
        if (!this.selectedIdea) return;

        const resultsContainer = document.getElementById('architect-results-2');
        const btn = document.getElementById('btn-architect-build');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在构建架构...';
        resultsContainer.innerHTML = '<div class="loading-placeholder">正在模拟反派推演、构建主角人设及大纲节奏...</div>';

        // Get build preferences
        const buildMainCharacter = document.getElementById('build-main-character')?.checked || true;
        const buildVillain = document.getElementById('build-villain')?.checked || true;
        const buildSecondary = document.getElementById('build-secondary')?.checked || true;
        const buildRelationships = document.getElementById('build-relationships')?.checked || true;
        const outlineType = document.getElementById('outline-type')?.value || 'both';
        const outlineChapters = document.getElementById('outline-chapters')?.value || '30';
        const outlineKeyPoints = document.getElementById('outline-key-points')?.checked || true;
        const outlineCliffhangers = document.getElementById('outline-cliffhangers')?.checked || true;
        const outlineCharacterGrowth = document.getElementById('outline-character-growth')?.checked || true;
        const worldDepth = document.getElementById('world-depth')?.value || 'medium';
        const worldSystem = document.getElementById('world-system')?.checked || true;
        const worldHistory = document.getElementById('world-history')?.checked || true;
        const worldPowers = document.getElementById('world-powers')?.checked || true;
        const worldRules = document.getElementById('world-rules')?.checked || true;

        let characterRequirements = `
【角色设定要求】
`;
        if (buildMainCharacter) characterRequirements += `- 主角详细设定：包括表面特征、深层动机、成长路线、性格缺陷等\n`;
        if (buildVillain) characterRequirements += `- 反派推演：设计智商在线、动机合理的核心反派，包括其过去、现在和未来目标\n`;
        if (buildSecondary) characterRequirements += `- 配角设定：设定2-3个主要配角，包括他们的背景、性格和在故事中的作用\n`;
        if (buildRelationships) characterRequirements += `- 关系网络：分析角色之间的复杂关系，包括冲突、合作、背叛等可能性\n`;

        let outlineRequirements = `
【大纲要求】
- 大纲类型：${outlineType === 'emotion' ? '情绪节奏大纲' : outlineType === 'plot' ? '剧情发展大纲' : '综合大纲（情绪+剧情）'}
- 大纲章节数：${outlineChapters} 章
`;
        if (outlineKeyPoints) outlineRequirements += `- 标注关键爽点/虐点位置\n`;
        if (outlineCliffhangers) outlineRequirements += `- 设计章节结尾钩子，保持读者阅读欲望\n`;
        if (outlineCharacterGrowth) outlineRequirements += `- 规划角色成长曲线，标注关键转折点\n`;

        let worldRequirements = `
【世界观设定要求】
- 设定深度：${worldDepth === 'light' ? '轻度设定' : worldDepth === 'medium' ? '中度设定' : '深度设定'}
`;
        if (worldSystem) worldRequirements += `- 力量系统：设定详细的力量体系、等级划分、特殊能力等\n`;
        if (worldHistory) worldRequirements += `- 历史背景：设定世界的历史发展、重要事件、关键转折点\n`;
        if (worldPowers) worldRequirements += `- 势力分布：设定主要势力、组织、派系的结构和关系\n`;
        if (worldRules) worldRequirements += `- 世界规则：设定世界的物理规则、魔法规则、社会规则等\n`;

        const prompt = `您是“冰山理论”叙事专家，擅长深度角色设计和情节架构。
基于选定的故事架构：
标题：${this.selectedIdea.title}
核心：${this.selectedIdea.logline}
标签：${this.selectedIdea.tags ? this.selectedIdea.tags.join('、') : '无'}

【整体要求】
1. **冰山理论**：所有角色都有表面和深层两层，不要直白描述内心。
2. **商业思维**：所有设定都要服务于故事的可读性和吸引力。
3. **冲突设计**：每一部分设定都要能引出后续冲突。

${characterRequirements}

${outlineRequirements}

${worldRequirements}

【输出格式】
请以Markdown格式输出，使用清晰的标题层级。
对于大纲部分，请使用表格格式展示章节安排。
示例表格格式：
| 章节 | 标题 | 核心剧情 | 情绪点 | 角色成长 | 结尾钩子 |
|------|------|----------|--------|----------|----------|
`;

        try {
            let fullText = "";
            await novelGenerator.streamAi(prompt, (chunk) => {
                fullText += chunk;
                resultsContainer.innerHTML = `<div class="markdown-body">${this.parseMarkdown(fullText)}</div>`;
            });
            this.validateCurrentStep();
        } catch (e) {
            resultsContainer.innerHTML = `<div class="alert alert-error">构建失败: ${e.message}</div>`;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-vial"></i> 重新启动深度构建';
        }
    }

    // --- Stage 3: Scene Slicing ---

    handleEditorInput() {
        const text = document.getElementById('architect-editor').value;
        const count = text.length;
        document.getElementById('architect-word-count').textContent = count;

        const helper = document.getElementById('pacing-helper');
        const segments = Math.floor(count / 300);

        if (count > 0 && count % 300 < 50) {
            helper.textContent = `🚀 已进入第 ${segments + 1} 个“切片”。建议在此处预埋一个小的认知偏差或反转点。`;
            helper.classList.add('pacing-alert');
        } else {
            helper.textContent = `建议在 300 字附近增加一个反转点以保持节奏感`;
            helper.classList.remove('pacing-alert');
        }

        this.validateCurrentStep();
    }

    async assistWrite() {
        const editor = document.getElementById('architect-editor');
        const currentText = editor.value;
        const btn = document.getElementById('btn-architect-write');

        btn.disabled = true;
        btn.textContent = 'AI 思考中...';

        // Get write preferences
        const writeMode = document.getElementById('architect-write-mode')?.value || 'normal';
        const aiLevel = document.getElementById('architect-ai-level')?.value || 'medium';
        const intensity = document.getElementById('architect-intensity')?.value || 7;

        // Generate prompt based on write mode
        let modePrompt = '';
        let lengthPrompt = '约 300-500 字';
        let tonePrompt = '';

        switch (writeMode) {
            case 'outline':
                modePrompt = '请基于之前生成的大纲设定，续写接下来的内容。';
                break;
            case 'scene':
                modePrompt = '请使用分镜化叙事，像拍电影一样描写场景。注重动作、环境、表情的细节。';
                break;
            case 'dialogue':
                modePrompt = '请使用对话驱动的方式续写，通过对话展现人物关系和内心。';
                break;
            case 'description':
                modePrompt = '请特别注重环境描写、细节描写和感官描写，增强画面感。';
                break;
            case 'thinking':
                modePrompt = '请深入描写人物的内心活动、思考过程、矛盾心理。';
                break;
            default:
                modePrompt = '请基于当前情节，续写接下来的场景。要求画面感强，对话有潜台词。';
        }

        switch (aiLevel) {
            case 'light':
                lengthPrompt = '约 100-200 字';
                tonePrompt = '只给出关键句子和建议，保持简洁。';
                break;
            case 'strong':
                lengthPrompt = '约 500-800 字';
                tonePrompt = '提供完整详细的续写内容。';
                break;
            case 'full':
                lengthPrompt = '约 800-1200 字';
                tonePrompt = '全权处理，提供最完整的续写。';
                break;
            default:
                lengthPrompt = '约 300-500 字';
                tonePrompt = '提供完整的续写内容。';
        }

        // Generate tone based on intensity
        let intensityText = '';
        if (intensity >= 8) intensityText = '保持高强度、高潮迭起的节奏。';
        else if (intensity >= 6) intensityText = '保持中等强度，有起有伏。';
        else if (intensity >= 4) intensityText = '保持柔和的节奏，注重细节。';
        else intensityText = '保持平静的节奏，注重内心描写。';

        const prompt = `你是一个擅长“分镜化叙事”的小说高手。
当前正在写的小说片段：
${currentText}

【写作模式】
${modePrompt}

【强度要求】
${intensityText}

【AI辅助级别】
${tonePrompt}

【当前任务】
请续写接下来的场景。要求：
1. **画面感**：使用视觉词汇，不要直接描述情绪。
2. **潜台词**：对话要有留白，不能直白。
3. **字数**：${lengthPrompt}
4. **冰山理论**：不直接说明人物情绪，而是通过动作和细节暗示。
5. **冲突设计**：每一段都要埋下新的冲突点或反转。

直接从正文接续输出。既不要在开头添加"接下来"等词语，也不要在结尾添加"待续"。`;

        try {
            await novelGenerator.streamAi(prompt, (chunk) => {
                editor.value += chunk;
                this.handleEditorInput();
            });
        } catch (e) {
            alert('续写失败: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-feather-pointed"></i> AI 辅助撰写/续写';
        }
    }

    saveDraft() {
        const content = document.getElementById('architect-editor').value;
        if (!content) return;

        storage.save('architect_draft', {
            title: this.selectedIdea?.title,
            content: content,
            timestamp: new Date().getTime()
        });
        alert('草稿已保存到本地。');
    }

    // --- Stage 4: Optimization ---

    async optimizeContent() {


        const originalContent = document.getElementById('architect-editor').value;
        if (!originalContent) {
            alert('请在第三阶段输入内容');
            this.currentStep = 3;
            this.updateWizardUI();
            return;
        }

        document.getElementById('architect-original-text').textContent = originalContent;
        const optimizedDisplay = document.getElementById('architect-optimized-text');
        optimizedDisplay.textContent = '优化中...';

        // Get optimization preferences
        const optimizeRemoveAi = document.getElementById('optimize-remove-ai')?.checked || true;
        const optimizeAddDetails = document.getElementById('optimize-add-details')?.checked || true;
        const optimizeVarySentences = document.getElementById('optimize-vary-sentences')?.checked || true;
        const optimizeEnvironment = document.getElementById('optimize-environment')?.checked || true;
        const optimizeStyle = document.getElementById('optimize-style')?.value || 'realistic';
        const structureReorder = document.getElementById('structure-reorder')?.checked || true;
        const structureAddHooks = document.getElementById('structure-add-hooks')?.checked || true;
        const structureShorten = document.getElementById('structure-shorten')?.checked || true;
        const structureAddTransitions = document.getElementById('structure-add-transitions')?.checked || true;
        const structurePacing = document.getElementById('structure-pacing')?.value || 5;
        const contentCheckDialog = document.getElementById('content-check-dialog')?.checked || true;
        const contentCheckCharacter = document.getElementById('content-check-character')?.checked || true;
        const contentCheckPlausibility = document.getElementById('content-check-plausibility')?.checked || true;
        const contentCheckDetails = document.getElementById('content-check-details')?.checked || true;

        // Build optimization requirements
        let styleRequirements = '';
        if (optimizeRemoveAi) styleRequirements += `- 剔除AI感：去掉"首先"、"于是"、"然而"等逻辑引导词\n`;
        if (optimizeAddDetails) styleRequirements += `- 增加细节描写：使用感官词汇，让画面更具体\n`;
        if (optimizeVarySentences) styleRequirements += `- 调整句式节奏：改变句子长短，让叙事有呼吸感\n`;
        if (optimizeEnvironment) styleRequirements += `- 增加环境闲笔：在动作间歇加入环境细节\n`;

        let stylePreference = '';
        switch (optimizeStyle) {
            case 'literary':
                stylePreference = '文学气质：使用更具诗意的语言，增加比喻和象征。';
                break;
            case 'cinematic':
                stylePreference = '电影感：像分镜一样写，注重画面切换和镜头感。';
                break;
            case 'modern':
                stylePreference = '现代简洁：使用现代口语化表达，减少冗余修饰。';
                break;
            case 'classic':
                stylePreference = '经典厚重：使用经典文学的遣词造句，增加历史感。';
                break;
            default:
                stylePreference = '写实风格：用最直接的语言描写现实。';
        }

        let structureRequirements = '';
        if (structureReorder) structureRequirements += `- 重新组织段落：根据逻辑或情绪重新安排段落顺序\n`;
        if (structureAddHooks) structureRequirements += `- 增加钩子：在合适的位置埋下吸引读者的伏笔\n`;
        if (structureShorten) structureRequirements += `- 删减冗余：去掉不必要的描述和重复的表达\n`;
        if (structureAddTransitions) structureRequirements += `- 增加过渡句：让段落之间的转换更自然\n`;

        let pacingText = '';
        if (structurePacing >= 8) pacingText = '快节奏：句子短促有力，情节推进迅速。';
        else if (structurePacing >= 6) pacingText = '中等节奏：有张有弛，注重节奏感。';
        else if (structurePacing >= 4) pacingText = '慢节奏：注重细节和内心描写。';
        else pacingText = '极慢节奏：强调环境和氛围营造。';

        let contentRequirements = '';
        if (contentCheckDialog) contentRequirements += `- 检查对话真实性：确保对话符合人物身份和场景\n`;
        if (contentCheckCharacter) contentRequirements += `- 检查人设一致性：确保角色言行举止符合设定\n`;
        if (contentCheckPlausibility) contentRequirements += `- 检查情节合理性：找出逻辑漏洞和不合理之处\n`;
        if (contentCheckDetails) contentRequirements += `- 检查细节准确性：确保时间、地点、物品等细节准确\n`;

        const prompt = `你是“翻译官”，负责把"AI感"强烈的文字转化成具有"生活烟火感"的文学正文。
原文：
${originalContent}

【风格优化要求】
${styleRequirements}

【风格偏好】
${stylePreference}

【结构优化要求】
${structureRequirements}

【节奏调整】
${pacingText}

【内容检查要求】
${contentRequirements}

【优化原则】
1. **剔除AI感**：去掉"首先"、"于是"、"然而"等逻辑引导词。
2. **增加闲笔**：在动作间歇加入环境细节或生理反应。
3. **打破匀称**：改变句式长短，让叙事有呼吸感。
4. **去套路化**：替换那些平庸的形容词。
5. **内容一致性**：确保优化后内容符合人物设定和情节逻辑。

直接输出优化后的正文。既不要改变原意，也不要在开头添加"原文"等词语。`;

        try {
            let fullText = "";
            await novelGenerator.streamAi(prompt, (chunk) => {
                fullText += chunk;
                optimizedDisplay.textContent = fullText;
            });
        } catch (e) {
            optimizedDisplay.textContent = '优化出错: ' + e.message;
        }
    }

    finalizeContent() {
        const finalContent = document.getElementById('architect-optimized-text').textContent;
        if (!finalContent || finalContent === '优化中...') return;

        if (confirm('是否将优化后的内容导入正式章节库？')) {
            // Here we could find which chapter to import to
            // For now, let's just alert success and save to a special key
            storage.save('architect_final_output', finalContent);
            alert('导入成功！您可以在“小说生成”页面预览或进行后续编辑。');
        }
    }

    exportToTXT() {
        const editor = document.getElementById('architect-editor');
        const currentText = editor.value;
        const optimizedText = document.getElementById('architect-optimized-text')?.textContent || currentText;
        const currentChapter = document.getElementById('architect-chapter-select')?.value || '未选择';
        const title = this.selectedIdea?.title || '未命名故事';

        if (!currentText) {
            alert('没有内容可导出');
            return;
        }

        const txtContent = `
《${title}》
第${currentChapter}章

${optimizedText}

---
导出时间: ${new Date().toLocaleString()}
导出位置: 大神架构
`;

        // Create download
        const blob = new Blob([txtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}-第${currentChapter}章.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    previewOptimization() {

        const originalText = document.getElementById('architect-original-text').textContent;
        const optimizedText = document.getElementById('architect-optimized-text').textContent;

        if (!originalText || !optimizedText) {
            alert('没有内容可以预览');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'preset-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content" style="width: 700px; max-width: 95vw;">
                <div class="modal-header">
                    <h3>内容对比预览</h3>
                    <span class="close-modal" onclick="this.closest('.preset-modal').remove()">×</span>
                </div>
                <div class="modal-body" style="display: flex; gap: 20px; max-height: 60vh; overflow-y: auto;">
                    <div style="flex: 1; padding: 10px; border-right: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 10px;">原文</h4>
                        <div style="white-space: pre-wrap; line-height: 1.6;">${originalText}</div>
                    </div>
                    <div style="flex: 1; padding: 10px;">
                        <h4 style="margin-bottom: 10px;">优化后</h4>
                        <div style="white-space: pre-wrap; line-height: 1.6;">${optimizedText}</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    saveOutline() {
        const results = document.getElementById('architect-results-2');
        if (!results || !results.textContent.trim()) {
            alert('没有内容可保存');
            return;
        }

        storage.save('architect_outline', {
            title: this.selectedIdea?.title,
            content: results.innerHTML,
            timestamp: new Date().getTime()
        });
        alert('设定已保存到本地');
    }

    // Simple markdown parser helper
    parseMarkdown(text) {
        return text
            .replace(/^# (.*)/gm, '<h1>$1</h1>')
            .replace(/^## (.*)/gm, '<h2>$1</h2>')
            .replace(/^### (.*)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }
}

// Initialize when library is ready
window.addEventListener('load', () => {
    window.greatArchitect = new GreatArchitect();
});
