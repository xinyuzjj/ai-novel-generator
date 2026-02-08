class TextAnalyzer {
    constructor() {
        this.currentMode = 'short-story';
        this.init();
    }

    init() {
        // 初始化配置
    }

    // 分析TXT文件内容
    async analyzeTxtContent(content, options = {}) {
        const {
            autoSplitChapters = true,
            autoFillInfo = true,
            previewOnly = false
        } = options;

        try {
            // 1. 首先进行章节分割
            let chapters = [];
            if (autoSplitChapters) {
                chapters = this.splitChapters(content);
            } else {
                chapters = [{ title: '全文', content: content }];
            }

            // 2. 如果需要自动填充信息，调用AI分析
            let analysisResult = null;
            if (autoFillInfo && !previewOnly) {
                try {
                    analysisResult = await this.analyzeNovelContent(content);
                } catch (aiError) {
                    console.error('AI分析失败，使用默认值:', aiError);
                    // 即使AI分析失败，也返回默认的分析结果结构
                    analysisResult = {
                        creativeTheme: {
                            type: '未知',
                            style: '未知',
                            theme: '未知',
                            tags: []
                        },
                        novelSetting: {
                            worldview: '未知',
                            background: '未知',
                            mainCharacters: []
                        },
                        chapterOutline: [],
                        coreSellingPoint: '未知'
                    };
                }
            }

            return {
                success: true,
                chapters: chapters,
                analysis: analysisResult,
                content: content
            };
        } catch (error) {
            console.error('分析文本失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 分割章节
    splitChapters(content) {
        const chapters = [];
        
        // 预处理：移除多余的空白字符，统一换行符
        content = content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
        
        // 常见的章节标题格式
        const chapterPatterns = [
            // 主要模式：匹配"第X章 标题"格式（支持中文和英文标点）
            /^\s*第(\d+)章[\s：:]*([^\n]+)$/gm,
            // 备用模式1：匹配"第X章:标题"格式
            /^\s*第(\d+)章[\s：:](.+?)$/gm,
            // 备用模式2：匹配"第X章: 标题"格式
            /^\s*第(\d+)章[\s：:]*([^\n]+)$/gm,
            // 支持"第X话"格式
            /^\s*第(\d+)话[\s：:]*([^\n]+)$/gm,
            // 支持"第X话:标题"格式
            /^\s*第(\d+)话[\s：:]*([^\n]+)$/gm,
            // 支持"第X卷"格式
            /^\s*第(\d+)卷[\s：:]*([^\n]+)$/gm,
            // 支持"第X卷:标题"格式
            /^\s*第(\d+)卷[\s：:]*([^\n]+)$/gm,
            // 英文格式
            /^\s*Chapter\s*(\d+)[\s：:](.+?)$/gm,
            /^\s*Chapter\s*(\d+)[\s：:]*([^\n]+)$/gm,
            // 其他格式
            /^\s*章节\s*(\d+)[\s：:](.+?)$/gm,
            /^\s*Episode\s*(\d+)[\s：:]*([^\n]+)$/gm
        ];

        // 尝试各种分割模式
        for (const pattern of chapterPatterns) {
            console.log(`尝试分割模式: ${pattern.toString()}`);
            const matches = [...content.matchAll(pattern)];
            
            if (matches.length > 0) {
                console.log(`使用模式 ${pattern.toString()} 匹配到 ${matches.length} 个章节`);
                
                // 确保章节内容正确分割
                matches.forEach((match, index) => {
                    console.log(`匹配到章节 ${index + 1}: ${match[0]}`);
                    console.log(`章节 ${index + 1} 开始位置: ${match.index}`);
                    
                    // 计算下一个章节的开始位置
                    let nextStart = content.length;
                    if (index < matches.length - 1) {
                        nextStart = matches[index + 1].index;
                        console.log(`章节 ${index + 1} 结束位置: ${nextStart}`);
                    }
                    
                    // 提取从当前章节开始到下一个章节开始的内容
                    const chapterContent = content.substring(match.index, nextStart).trim();
                    console.log(`章节 ${index + 1} 内容长度: ${chapterContent.length} 字符`);
                    
                    // 解析章节号和标题
                    let chapterNumber, chapterTitle;
                    if (match[1] && !isNaN(parseInt(match[1]))) {
                        chapterNumber = parseInt(match[1]);
                        chapterTitle = match[2].trim();
                    } else {
                        // 尝试从标题中提取章节号
                        const chapterNumMatch = match[1].match(/第(\d+)[章节话卷]/);
                        chapterNumber = chapterNumMatch ? parseInt(chapterNumMatch[1]) : index + 1;
                        chapterTitle = match[2].trim();
                    }
                    
                    console.log(`章节 ${index + 1} 信息: 第${chapterNumber}章 - ${chapterTitle}`);
                    
                    chapters.push({
                        title: chapterTitle,
                        content: chapterContent,
                        chapterNumber: chapterNumber
                    });
                });
                
                console.log(`成功识别到 ${chapters.length} 个章节`);
                return chapters;
            }
        }

        // 如果没有找到章节标题，按段落分割
        if (chapters.length === 0) {
            console.log('未找到章节标题，按段落分割');
            const paragraphs = content.split(/\n{2,}/).filter(p => p.trim().length > 0);
            console.log(`找到 ${paragraphs.length} 个段落`);
            
            // 按段落数量分割，而不是固定分成5章
            const chapterCount = Math.min(3, Math.max(1, Math.ceil(paragraphs.length / 3))); // 最少1章，最多3章，每章至少3个段落
            console.log(`按段落分割成 ${chapterCount} 个章节`);
            
            const avgParagraphsPerChapter = Math.ceil(paragraphs.length / chapterCount);
            console.log(`每章平均 ${avgParagraphsPerChapter} 个段落`);
            
            let currentChapter = { title: '第1章', content: '', chapterNumber: 1 };
            let currentParagraphs = 0;

            paragraphs.forEach((paragraph, paraIndex) => {
                console.log(`处理段落 ${paraIndex + 1}, 当前章节 ${currentChapter.chapterNumber}, 已添加 ${currentParagraphs} 个段落`);
                
                if (currentParagraphs >= avgParagraphsPerChapter && currentChapter.content) {
                    console.log(`章节 ${currentChapter.chapterNumber} 已满，保存并开始新章节`);
                    chapters.push({ ...currentChapter });
                    currentChapter = {
                        title: `第${chapters.length + 1}章`,
                        content: paragraph,
                        chapterNumber: chapters.length + 1
                    };
                    currentParagraphs = 1;
                } else {
                    currentChapter.content += (currentChapter.content ? '\n\n' : '') + paragraph;
                    currentParagraphs++;
                }
            });

            if (currentChapter.content) {
                console.log(`保存最后一个章节 ${currentChapter.chapterNumber}`);
                chapters.push(currentChapter);
            }
            
            console.log(`按段落分割成 ${chapters.length} 个章节`);
        }

        // 最终检查
        console.log(`章节分割完成，共 ${chapters.length} 个章节:`);
        chapters.forEach((chapter, index) => {
            console.log(`章节 ${index + 1}: 第${chapter.chapterNumber}章 - ${chapter.title} (${chapter.content.length} 字符)`);
        });

        return chapters;
    }

    // 分析小说内容
    async analyzeNovelContent(content) {
        // 限制分析内容长度
        const analysisContent = content.length > 5000 ? content.substring(0, 5000) + '...' : content;

        // 构建AI提示词
        const prompt = `你是一个专业的文学分析师，擅长分析小说文本并提取关键信息。请分析以下小说文本，提取以下信息：

1. 创作题材：分析小说的类型、风格、主题等
2. 小说设定：分析小说的世界观、背景、主要角色等
3. 章节大纲：基于文本内容，生成一个合理的章节大纲，包括每个章节的主要情节、关键冲突和情感曲线
4. 核心卖点：分析小说的核心吸引力和亮点

请以JSON格式输出分析结果，确保格式正确：

{
  "creativeTheme": {
    "type": "小说类型",
    "style": "文风特点",
    "theme": "主题思想",
    "tags": ["标签1", "标签2"]
  },
  "novelSetting": {
    "worldview": "世界观描述",
    "background": "时代背景",
    "mainCharacters": [
      {
        "name": "角色名",
        "personality": "性格特点",
        "role": "角色定位"
      }
    ]
  },
  "chapterOutline": [
    {
      "chapterNumber": 1,
      "title": "章节标题",
      "summary": "章节内容梗概",
      "conflict": "关键冲突描述",
      "emotion": "情感曲线描述"
    }
  ],
  "coreSellingPoint": "核心卖点描述"
}

小说文本：
${analysisContent}`;

        // 调用AI进行分析
        const response = await this.callAi(prompt);
        if (!response) {
            throw new Error('AI分析失败');
        }

        // 解析AI响应
        const analysisResult = this.parseAnalysisResponse(response);
        return analysisResult;
    }

    // 调用AI
    async callAi(prompt, temperature = 0.7) {
        // 复用outline-generator.js中的callAi方法
        if (typeof outlineGenerator !== 'undefined' && outlineGenerator.callAi) {
            try {
                return await outlineGenerator.callAi(prompt, temperature);
            } catch (error) {
                console.error('复用outlineGenerator.callAi失败:', error);
                // 继续执行后备方案
            }
        }

        // 如果outlineGenerator不可用，尝试直接调用API
        const config = apiConfig.getActiveConfig();
        if (!config) {
            throw new Error('请先配置API');
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
                    { role: 'system', content: 'You are a professional literary analyst.' },
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
                    { role: 'system', content: 'You are a professional literary analyst.' },
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

            // 根据API类型解析不同的响应格式
            if (config.id === 'local') {
                // Ollama API响应格式
                if (result.message && result.message.content) {
                    return result.message.content;
                } else if (result.content) {
                    return result.content;
                } else if (result.choices && result.choices[0] && result.choices[0].message) {
                    return result.choices[0].message.content;
                } else {
                    throw new Error('API返回格式错误');
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
            console.error('AI调用失败:', error);
            throw error;
        }
    }

    // 解析分析响应
    parseAnalysisResponse(response) {
        try {
            // 提取JSON部分
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('无法提取JSON响应');
            }

            const jsonStr = jsonMatch[0];
            const result = JSON.parse(jsonStr);
            return result;
        } catch (error) {
            console.error('解析分析响应失败:', error);
            // 返回默认结构
            return {
                creativeTheme: {
                    type: '未知',
                    style: '未知',
                    theme: '未知',
                    tags: []
                },
                novelSetting: {
                    worldview: '未知',
                    background: '未知',
                    mainCharacters: []
                },
                chapterOutline: [],
                coreSellingPoint: '未知'
            };
        }
    }

    // 填充创作题材信息
    fillCreativeTheme(analysisResult) {
        if (!analysisResult || !analysisResult.creativeTheme) {
            return false;
        }

        // 使用promptManager的fillFromAnalysis方法来填充
        if (typeof promptManager !== 'undefined' && promptManager.fillFromAnalysis) {
            return promptManager.fillFromAnalysis(analysisResult);
        }

        // 后备方案：直接填充
        const { creativeTheme, coreSellingPoint } = analysisResult;

        // 直接更新存储的数据
        const project = storage.loadProject();
        if (project) {
            // 设置小说分类
            const type = creativeTheme.type || '';
            let category = 'custom';
            if (type.includes('玄幻') || type.includes('修真')) {
                category = 'xuanhuan';
            } else if (type.includes('都市') || type.includes('现代')) {
                category = 'dushi';
            } else if (type.includes('科幻') || type.includes('未来')) {
                category = 'kehuan';
            } else if (type.includes('历史') || type.includes('古代')) {
                category = 'lishi';
            } else if (type.includes('言情') || type.includes('爱情')) {
                category = 'yanqing';
            } else if (type.includes('武侠') || type.includes('仙侠')) {
                category = 'wuxia';
            }
            project.category = category;

            // 设置项目名称（如果为空）
            if (!project.name) {
                project.name = '新建小说_' + Math.floor(Math.random() * 10000);
            }

            // 设置作者角色
            if (creativeTheme.style) {
                project.authorRole = `你是一个专业的网文作家，擅长${creativeTheme.style}风格的写作。`;
            }

            // 设置创作规则
            let rules = '';
            if (creativeTheme.style) {
                rules += `1. 保持${creativeTheme.style}风格\n`;
            }
            if (creativeTheme.theme) {
                rules += `2. 围绕${creativeTheme.theme}主题展开\n`;
            }
            if (coreSellingPoint) {
                rules += `3. 突出小说的核心卖点：${coreSellingPoint}\n`;
            }
            project.rules = rules;

            // 设置核心卖点
            if (coreSellingPoint) {
                project.sellingPoint = coreSellingPoint;
            }

            // 保存到存储
            storage.saveProject(project);
        }

        // 同时更新DOM元素（如果存在）
        // 设置小说分类
        const categorySelect = document.getElementById('prompt-category');
        if (categorySelect) {
            // 根据分析结果选择合适的分类
            const type = creativeTheme.type || '';
            if (type.includes('玄幻') || type.includes('修真')) {
                categorySelect.value = 'xuanhuan';
            } else if (type.includes('都市') || type.includes('现代')) {
                categorySelect.value = 'dushi';
            } else if (type.includes('科幻') || type.includes('未来')) {
                categorySelect.value = 'kehuan';
            } else if (type.includes('历史') || type.includes('古代')) {
                categorySelect.value = 'lishi';
            } else if (type.includes('言情') || type.includes('爱情')) {
                categorySelect.value = 'yanqing';
            } else if (type.includes('武侠') || type.includes('仙侠')) {
                categorySelect.value = 'wuxia';
            } else {
                categorySelect.value = 'custom';
            }
        }

        // 设置项目名称（如果为空）
        const projectNameInput = document.getElementById('prompt-project-name');
        if (projectNameInput && !projectNameInput.value) {
            projectNameInput.value = '新建小说_' + Math.floor(Math.random() * 10000);
        }

        // 设置作者角色
        const authorRoleTextarea = document.getElementById('prompt-author-role');
        if (authorRoleTextarea && creativeTheme.style) {
            authorRoleTextarea.value = `你是一个专业的网文作家，擅长${creativeTheme.style}风格的写作。`;
        }

        // 设置创作规则
        const rulesTextarea = document.getElementById('prompt-rules');
        if (rulesTextarea) {
            let rules = '';
            if (creativeTheme.style) {
                rules += `1. 保持${creativeTheme.style}风格\n`;
            }
            if (creativeTheme.theme) {
                rules += `2. 围绕${creativeTheme.theme}主题展开\n`;
            }
            if (coreSellingPoint) {
                rules += `3. 突出小说的核心卖点：${coreSellingPoint}\n`;
            }
            rulesTextarea.value = rules;
        }

        // 设置核心卖点
        const sellingPointTextarea = document.getElementById('outline-summary');
        if (sellingPointTextarea && coreSellingPoint) {
            sellingPointTextarea.value = coreSellingPoint;
        }

        return true;
    }

    // 填充小说设定信息
    fillNovelSetting(analysisResult) {
        if (!analysisResult || !analysisResult.novelSetting) {
            return false;
        }

        // 使用settingsManager的fillFromAnalysis方法来填充
        if (typeof settingsManager !== 'undefined' && settingsManager.fillFromAnalysis) {
            return settingsManager.fillFromAnalysis(analysisResult);
        }

        // 后备方案：直接填充
        const { novelSetting } = analysisResult;

        // 填充金手指/关键信息
        const characterState = [];
        if (novelSetting.worldview) {
            characterState.push({ key: '世界观', value: novelSetting.worldview });
        }
        if (novelSetting.background) {
            characterState.push({ key: '时代背景', value: novelSetting.background });
        }

        // 填充角色信息
        if (novelSetting.mainCharacters && Array.isArray(novelSetting.mainCharacters)) {
            novelSetting.mainCharacters.forEach((character, index) => {
                characterState.push({ 
                    key: `角色${index + 1}`, 
                    value: `${character.name || '未知角色'} - ${character.personality || '未知性格'} (${character.role || '未知定位'})` 
                });
            });
        }

        // 保存到设置
        let settings = storage.loadSettingsForMode(this.currentMode);
        if (characterState.length > 0) {
            settings.characterState = characterState;
        }
        
        // 保存角色信息
        if (novelSetting.mainCharacters && Array.isArray(novelSetting.mainCharacters)) {
            const characterInfo = novelSetting.mainCharacters.map((character, index) => ({
                id: index + 1,
                name: character.name || `角色${index + 1}`,
                role: character.role || '未知',
                personality: character.personality || '未知',
                appearance: character.appearance || '未知',
                background: character.background || '未知'
            }));
            settings.characterInfo = characterInfo;
        }
        
        // 保存世界观信息
        if (novelSetting.worldview) {
            const worldSettings = [];
            worldSettings.push({ key: '世界观', value: novelSetting.worldview });
            if (novelSetting.background) {
                worldSettings.push({ key: '时代背景', value: novelSetting.background });
            }
            settings.worldSettings = worldSettings;
        }
        
        storage.saveSettingsForMode(this.currentMode, settings);

        // 触发UI刷新
        window.dispatchEvent(new CustomEvent('settingsUpdated'));

        return true;
    }

    // 填充章节大纲信息
    fillChapterOutline(analysisResult) {
        if (!analysisResult || !analysisResult.chapterOutline) {
            return false;
        }

        // 确保chapterOutline是一个数组
        const chapterOutline = Array.isArray(analysisResult.chapterOutline) ? analysisResult.chapterOutline : [];
        if (chapterOutline.length === 0) {
            return false;
        }

        // 使用outlineGenerator的fillFromAnalysis方法来填充
        if (typeof outlineGenerator !== 'undefined' && outlineGenerator.fillFromAnalysis) {
            // 创建一个新的analysisResult对象，确保chapterOutline是数组
            const safeAnalysisResult = {
                ...analysisResult,
                chapterOutline: chapterOutline
            };
            const result = outlineGenerator.fillFromAnalysis(safeAnalysisResult);
            
            // 如果有分割的章节，生成所有章节的详细大纲
            if (typeof window.splitChaptersResult !== 'undefined' && window.splitChaptersResult.length > 0) {
                this.generateAllChaptersOutline(window.splitChaptersResult);
            }
            
            return result;
        }

        // 后备方案：直接填充
        // 保存大纲
        const outlines = chapterOutline.map(chapter => ({
            title: chapter.title || `第${chapter.chapterNumber || '未知'}章`,
            plot: chapter.summary || '暂无内容梗概',
            conflict: chapter.conflict || '',
            emotion: chapter.emotion || ''
        }));

        if (outlines.length > 0) {
            storage.saveOutlinesForMode(this.currentMode, outlines);
            // 刷新大纲列表
            if (this.currentMode === 'short-story' && typeof outlineGenerator !== 'undefined') {
                outlineGenerator.renderOutlineList();
            }
            
            // 如果有分割的章节，生成所有章节的详细大纲
            if (typeof window.splitChaptersResult !== 'undefined' && window.splitChaptersResult.length > 0) {
                this.generateAllChaptersOutline(window.splitChaptersResult);
            }
        }

        return true;
    }

    // 填充章节内容
    fillChapterContent(chapters) {
        if (!chapters || chapters.length === 0) {
            return false;
        }

        // 使用novelGenerator的fillFromAnalysis方法来填充（仅短篇模式）
        if (this.currentMode === 'short-story' && typeof novelGenerator !== 'undefined' && novelGenerator.fillFromAnalysis) {
            return novelGenerator.fillFromAnalysis(chapters);
        }

        // 后备方案：直接填充
        chapters.forEach((chapter, index) => {
            const chapterNumber = chapter.chapterNumber || (index + 1);
            const chapterContent = chapter.content || '';
            const chapterTitle = chapter.title || `第${chapterNumber}章`;
            storage.saveChapter(chapterNumber, chapterContent, chapterTitle);
        });

        // 刷新章节列表
        if (this.currentMode === 'short-story' && typeof novelGenerator !== 'undefined' && novelGenerator.renderChapterList) {
            novelGenerator.renderChapterList();
        }

        return true;
    }

    // 执行完整的导入流程
    async executeImport(file, options = {}) {
        try {
            // 读取文件内容
            let content;
            if (file instanceof File) {
                // 浏览器环境
                content = await storage.readUploadedTxtFile(file);
            } else {
                // 文件系统路径
                content = storage.readTxtFile(file);
            }

            if (!content) {
                throw new Error('无法读取文件内容');
            }

            // 1. 首先进行章节分割
            console.log('开始分割章节...');
            let chapters = [];
            if (options.autoSplitChapters) {
                console.log('使用自动分章模式');
                chapters = this.splitChapters(content);
                console.log(`自动分章完成，共 ${chapters.length} 个章节`);
                
                // 保存分割结果到window变量，供后续使用
                window.splitChaptersResult = chapters;
                console.log(`章节分割完成，共 ${chapters.length} 个章节`);
            } else {
                console.log('使用全文模式');
                chapters = [{ title: '全文', content: content, chapterNumber: 1 }];
                console.log('全文模式，共 1 个章节');
            }

            // 2. 保存章节到创建的文档中
            console.log('开始保存章节...');
            chapters.forEach((chapter, index) => {
                const chapterNumber = chapter.chapterNumber || (index + 1);
                const chapterContent = chapter.content || '';
                const chapterTitle = chapter.title || `第${chapterNumber}章`;
                
                console.log(`准备保存章节 ${chapterNumber}: ${chapterTitle} (${chapterContent.length} 字符)`);
                
                // 确保内容不为空
                if (chapterContent.trim()) {
                    console.log(`保存章节 ${chapterNumber}: ${chapterTitle} (${chapterContent.length} 字符)`);
                    storage.saveChapter(chapterNumber, chapterContent, chapterTitle);
                    console.log(`章节 ${chapterNumber} 保存成功`);
                } else {
                    console.log(`跳过空章节 ${chapterNumber}: ${chapterTitle}`);
                }
            });

            // 3. 根据分割的章节更新大纲
            console.log('开始更新大纲...');
            const outlines = chapters.map((chapter, index) => {
                const chapterNumber = chapter.chapterNumber || (index + 1);
                const chapterTitle = chapter.title || `第${chapterNumber}章`;
                const chapterSummary = chapter.content ? chapter.content.substring(0, 200) + '...' : '暂无内容梗概';
                
                console.log(`创建大纲 ${chapterNumber}: ${chapterTitle}`);
                
                return {
                    title: chapterTitle,
                    plot: chapterSummary,
                    conflict: '',
                    emotion: ''
                };
            });
            
            console.log(`准备保存大纲，共 ${outlines.length} 个章节`);
            storage.saveOutlinesForMode(this.currentMode, outlines);
            console.log(`大纲保存成功，共 ${outlines.length} 章`);

            // 4. 刷新章节列表
            if (this.currentMode === 'short-story' && typeof novelGenerator !== 'undefined' && novelGenerator.renderChapterList) {
                console.log('刷新章节列表...');
                novelGenerator.renderChapterList();
                console.log('章节列表刷新成功');
            } else {
                console.log('novelGenerator未定义或renderChapterList方法不存在');
            }

            // 5. 然后进行内容分析（包括AI分析）
            console.log('开始分析内容...');
            let analysisResult;
            try {
                analysisResult = await this.analyzeTxtContent(content, options);
                
                if (!analysisResult.success) {
                    console.log('AI分析失败，使用默认分析结果');
                    // 创建默认分析结果
                    analysisResult = {
                        success: true,
                        chapters: chapters,
                        analysis: {
                            creativeTheme: {
                                type: '未知',
                                style: '未知',
                                theme: '未知',
                                tags: []
                            },
                            novelSetting: {
                                worldview: '未知',
                                background: '未知',
                                mainCharacters: []
                            },
                            chapterOutline: chapters.map((chapter, index) => ({
                                chapterNumber: index + 1,
                                title: chapter.title,
                                summary: chapter.content.substring(0, 200) + '...',
                                conflict: '',
                                emotion: ''
                            })),
                            coreSellingPoint: '未知'
                        },
                        content: content
                    };
                }
            } catch (error) {
                console.error('AI分析失败:', error);
                // 创建默认分析结果
                analysisResult = {
                    success: true,
                    chapters: chapters,
                    analysis: {
                        creativeTheme: {
                            type: '未知',
                            style: '未知',
                            theme: '未知',
                            tags: []
                        },
                        novelSetting: {
                            worldview: '未知',
                            background: '未知',
                            mainCharacters: []
                        },
                        chapterOutline: chapters.map((chapter, index) => ({
                            chapterNumber: index + 1,
                            title: chapter.title,
                            summary: chapter.content.substring(0, 200) + '...',
                            conflict: '',
                            emotion: ''
                        })),
                        coreSellingPoint: '未知'
                    },
                    content: content
                };
            }

            // 6. 填充信息
            if (options.autoFillInfo) {
                console.log('开始填充信息...');
                console.log('分析结果:', JSON.stringify(analysisResult, null, 2));
                
                // 填充创作题材
                try {
                    const fillCreativeThemeResult = this.fillCreativeTheme(analysisResult.analysis);
                    console.log('填充创作题材结果:', fillCreativeThemeResult);
                } catch (error) {
                    console.error('填充创作题材失败:', error);
                }
                
                // 填充小说设定
                try {
                    const fillNovelSettingResult = this.fillNovelSetting(analysisResult.analysis);
                    console.log('填充小说设定结果:', fillNovelSettingResult);
                } catch (error) {
                    console.error('填充小说设定失败:', error);
                }
                
                // 填充章节大纲
                try {
                    const fillChapterOutlineResult = this.fillChapterOutline(analysisResult.analysis);
                    console.log('填充章节大纲结果:', fillChapterOutlineResult);
                } catch (error) {
                    console.error('填充章节大纲失败:', error);
                }
                
                // 7. 生成所有章节的详细大纲
                try {
                    console.log('开始生成所有章节的详细大纲...');
                    if (chapters.length > 1) {
                        await this.generateAllChaptersOutline(chapters);
                    }
                } catch (error) {
                    console.error('生成所有章节详细大纲失败:', error);
                }
                
                console.log('信息填充完成');
            }

            return {
                success: true,
                chapters: chapters,
                analysis: analysisResult.analysis,
                content: content
            };
        } catch (error) {
            console.error('执行导入流程失败:', error);
            throw error;
        }
    }

    // 生成所有章节的详细大纲
    async generateAllChaptersOutline(chapters) {
        console.log('=== 开始生成所有章节的详细大纲 ===\n');

        // 保存分割结果到window变量，供后续使用
        window.splitChaptersResult = chapters;

        console.log(`   ✓ 共 ${chapters.length} 个章节`);
        console.log('   ✓ 正在调用AI分析...');

        // AI生成所有章节大纲
        let outlineResult;
        try {
            outlineResult = await this.callDeepSeekForAllChapters(chapters);
        } catch (error) {
            console.log('   AI调用失败:', error.message);
            outlineResult = null;
        }
        
        if (!outlineResult) {
            console.log('   ✗ AI分析失败，使用手动大纲');
            const manualOutline = this.generateManualChaptersOutline(chapters);
            this.saveFullOutline(manualOutline);
        } else {
            console.log('   ✓ AI分析成功');
            this.saveFullOutline(outlineResult);
        }

        console.log('\n=== 所有章节大纲生成完成！ ===');
    }

    // 调用DeepSeek生成所有章节大纲
    async callDeepSeekForAllChapters(chapters) {
        const chapterInfos = chapters.map((c, i) => {
            const preview = c.content.substring(0, 300);
            return `${i + 1}. 第${c.chapterNumber}章《${c.title}》\n前300字预览：${preview}...\n`;
        }).join('\n');

        const prompt = `你是一个专业的文学分析师，擅长分析小说章节并生成详细大纲。

请为以下小说的所有章节生成详细大纲。小说共有${chapters.length}个章节。

【AI分析要求】
请为每个章节生成以下信息：
1. 章节标题
2. 内容梗概：详细描述本章的主要情节和事件
3. 关键冲突：本章的主要矛盾和冲突
4. 情感曲线：角色的情感变化和心理活动
5. 关键事件：3-5个本章最重要的事件
6. 角色发展：本章中角色的性格发展和成长
7. 情节发展：本章对整体情节发展的贡献和铺垫

请以JSON格式输出，确保格式正确：

{
  "fullOutline": [
    {
      "chapterNumber": 1,
      "title": "章节标题",
      "summary": "详细内容梗概",
      "conflict": "详细关键冲突",
      "emotion": "详细情感曲线",
      "keyEvents": ["关键事件1", "关键事件2", "关键事件3"],
      "characterDevelopment": "角色发展描述",
      "plotDevelopment": "情节发展描述"
    }
  ]
}

【章节列表和预览】
${chapterInfos}`;

        try {
            // 复用outline-generator.js中的callAi方法
            if (typeof outlineGenerator !== 'undefined' && outlineGenerator.callAi) {
                try {
                    const response = await outlineGenerator.callAi(prompt);
                    const outlineResult = this.parseOutlineResponse(response);
                    return outlineResult;
                } catch (error) {
                    console.error('复用outlineGenerator.callAi失败:', error);
                    // 继续执行后备方案
                }
            }

            // 如果outlineGenerator不可用，尝试直接调用API
            const config = apiConfig.getActiveConfig();
            if (!config) {
                throw new Error('请先配置API');
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
                        { role: 'system', content: 'You are a professional literary analyst and outline generator.' },
                        { role: 'user', content: prompt }
                    ],
                    stream: false,
                    options: {
                        temperature: 0.7
                    }
                };
            } else {
                // OpenAI兼容API格式
                data = {
                    model: config.model,
                    messages: [
                        { role: 'system', content: 'You are a professional literary analyst and outline generator.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7
                };
            }

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

            // 根据API类型解析不同的响应格式
            if (config.id === 'local') {
                // Ollama API响应格式
                if (result.message && result.message.content) {
                    const outlineResult = this.parseOutlineResponse(result.message.content);
                    return outlineResult;
                } else if (result.content) {
                    const outlineResult = this.parseOutlineResponse(result.content);
                    return outlineResult;
                } else if (result.choices && result.choices[0] && result.choices[0].message) {
                    const outlineResult = this.parseOutlineResponse(result.choices[0].message.content);
                    return outlineResult;
                } else {
                    throw new Error('API返回格式错误');
                }
            } else {
                // OpenAI兼容API响应格式
                if (result.choices && result.choices[0] && result.choices[0].message) {
                    const outlineResult = this.parseOutlineResponse(result.choices[0].message.content);
                    return outlineResult;
                } else if (result.message && result.message.content) {
                    const outlineResult = this.parseOutlineResponse(result.message.content);
                    return outlineResult;
                } else if (result.content) {
                    const outlineResult = this.parseOutlineResponse(result.content);
                    return outlineResult;
                } else {
                    throw new Error('API返回格式错误');
                }
            }
        } catch (error) {
            console.log('   AI调用失败:', error.message);
            return null;
        }
    }

    // 解析大纲响应
    parseOutlineResponse(response) {
        try {
            // 提取JSON部分
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('无法提取JSON响应');
            }

            const jsonStr = jsonMatch[0];
            const result = JSON.parse(jsonStr);
            return result;
        } catch (error) {
            console.log('   解析大纲响应失败:', error.message);
            return null;
        }
    }

    // 生成手动章节大纲
    generateManualChaptersOutline(chapters) {
        console.log('   ✓ 正在生成手动章节大纲...');

        const fullOutline = chapters.map((chapter, index) => ({
            chapterNumber: index + 1,
            title: chapter.title,
            summary: `第${index + 1}章的内容梗概，本章主要讲述了角色在特定情境下的经历和发展。`,
            conflict: `本章的主要冲突是关于角色之间的矛盾或外部环境的挑战。`,
            emotion: `情感曲线从平静开始，逐渐发展到高潮，最后达到某个重要转折点。`,
            keyEvents: [
                `关键事件1: 角色遇到了某个问题`,
                `关键事件2: 角色采取了某种行动`,
                `关键事件3: 重要的情节发展`
            ],
            characterDevelopment: `角色在本章中的性格发展和成长，可能包括态度的转变或能力的提升。`,
            plotDevelopment: `本章对整体情节发展的贡献和铺垫，为后续章节埋下伏笔。`
        }));

        return { fullOutline: fullOutline };
    }

    // 保存完整大纲
    saveFullOutline(analysisResult) {
        console.log('\n3. 保存大纲...');

        // 保存完整大纲
        storage.saveForMode(this.currentMode, 'full_outlines', analysisResult.fullOutline);
        console.log('   ✓ 完整章节大纲已保存');

        // 更新基础大纲（用于软件显示）
        const basicOutlines = analysisResult.fullOutline.map(outline => ({
            title: outline.title,
            plot: outline.summary,
            conflict: outline.conflict,
            emotion: outline.emotion
        }));
        storage.saveOutlinesForMode(this.currentMode, basicOutlines);
        console.log('   ✓ 基础大纲已更新');

        // 显示前10个章节
        console.log('\n4. 前10个章节大纲:');
        analysisResult.fullOutline.slice(0, 10).forEach((outline, index) => {
            console.log(`   ${index + 1}. ${outline.title}`);
            console.log(`      梗概: ${outline.summary.substring(0, 50)}...`);
            console.log(`      冲突: ${outline.conflict.substring(0, 40)}...`);
        });

        if (analysisResult.fullOutline.length > 10) {
            console.log(`      ...还有 ${analysisResult.fullOutline.length - 10} 个章节`);
        }

        // 刷新大纲列表
        if (this.currentMode === 'short-story' && typeof outlineGenerator !== 'undefined') {
            outlineGenerator.renderOutlineList();
        }

        // 触发大纲更新事件
        window.dispatchEvent(new CustomEvent('outlineUpdated'));
    }

    // 获取存储路径的辅助方法
    pathJoin(...paths) {
        return paths.join(path.sep);
    }

    // 检查路径是否存在
    pathExists(filePath) {
        try {
            return fs.existsSync(filePath);
        } catch (error) {
            console.log('路径检查失败:', error.message);
            return false;
        }
    }
}

const textAnalyzer = new TextAnalyzer();
