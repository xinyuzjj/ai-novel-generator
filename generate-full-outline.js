const fs = require('fs');
const path = require('path');

// 分析完整小说并生成所有章节大纲
async function generateFullOutline() {
    console.log('=== 开始分析完整小说并生成所有章节大纲 ===\n');

    // 1. 读取TXT文件内容
    console.log('1. 读取小说内容...');
    const filePath = path.join(__dirname, '我在实教当图书馆NPC.txt');
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
        console.log('   ✓ 文件读取成功');
        console.log(`   ✓ 文件大小: ${content.length} 字符`);
    } catch (error) {
        console.log('   ✗ 文件读取失败:', error.message);
        return;
    }

    // 2. 分割章节
    console.log('\n2. 分割章节...');
    const chapters = splitChapters(content);
    console.log(`   ✓ 成功识别到 ${chapters.length} 个章节`);

    // 3. 生成所有章节大纲
    console.log('\n3. 生成所有章节大纲...');
    console.log('   ✓ 正在调用DeepSeek模型分析完整小说...');

    const analysisResult = await callDeepSeekForFullOutline(content, chapters);
    if (!analysisResult) {
        console.log('   ✗ 完整分析失败，使用手动大纲生成');
        const manualOutline = generateManualFullOutline(chapters);
        populateFullOutline(manualOutline);
    } else {
        console.log('   ✓ AI分析成功');
        populateFullOutline(analysisResult);
    }

    console.log('\n=== 完整大纲生成完成！ ===');
}

// 分割章节函数
function splitChapters(content) {
    const chapters = [];
    const chapterPatterns = [
        /第(\d+)章[\s：:](.+?)(?=第\d+章|$)/gs,
        /Chapter\s*(\d+)[\s：:](.+?)(?=Chapter\s*\d+|$)/gs,
        /章节\s*(\d+)[\s：:](.+?)(?=章节\s*\d+|$)/gs,
        /第(\d+)章[\s：:]*([^\n]+)(?=第\d+章|$)/gs,
        /Chapter\s*(\d+)[\s：:]*([^\n]+)(?=Chapter\s*\d+|$)/gs,
        /第(\d+)话[\s：:]*([^\n]+)(?=第\d+话|$)/gs,
        /Episode\s*(\d+)[\s：:]*([^\n]+)(?=Episode\s*\d+|$)/gs
    ];

    for (const pattern of chapterPatterns) {
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
            matches.forEach((match, index) => {
                let nextStart = content.length;
                if (index < matches.length - 1) {
                    nextStart = matches[index + 1].index;
                }
                const chapterContent = content.substring(match.index, nextStart).trim();
                chapters.push({
                    title: match[2].trim(),
                    content: chapterContent,
                    chapterNumber: parseInt(match[1])
                });
            });
            return chapters;
        }
    }

    if (chapters.length === 0) {
        console.log('   未找到章节标题，按段落分割');
        const paragraphs = content.split(/\n{2,}/).filter(p => p.trim().length > 0);
        const chapterCount = Math.min(3, Math.max(1, Math.ceil(paragraphs.length / 3)));
        const avgParagraphsPerChapter = Math.ceil(paragraphs.length / chapterCount);
        let currentChapter = { title: '第1章', content: '', chapterNumber: 1 };
        let currentParagraphs = 0;

        paragraphs.forEach(paragraph => {
            if (currentParagraphs >= avgParagraphsPerChapter && currentChapter.content) {
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
            chapters.push(currentChapter);
        }
    }

    return chapters;
}

// 调用DeepSeek生成完整大纲
async function callDeepSeekForFullOutline(content, chapters) {
    // 使用完整小说内容（前10000个字符 + 所有章节标题）
    const fullContent = content.length > 10000 ? content.substring(0, 10000) + '...' : content;
    const chapterTitles = chapters.map((c, i) => `${i + 1}. ${c.title}`).join('\n');

    const prompt = `你是一个专业的文学分析师，擅长分析小说并生成详细的章节大纲。

请分析以下完整小说，为每个章节生成详细的大纲信息。小说共有${chapters.length}个章节。

【章节列表】
${chapterTitles}

【AI分析要求】
请为每个章节生成详细的大纲信息，包括：
1. 章节内容梗概
2. 关键冲突
3. 情感曲线

请以JSON格式输出，确保格式正确：

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
  "coreSellingPoint": "核心卖点描述",
  "fullOutline": [
    {
      "chapterNumber": 1,
      "title": "章节标题",
      "summary": "详细内容梗概",
      "conflict": "详细关键冲突",
      "emotion": "详细情感曲线",
      "keyEvents": ["关键事件1", "关键事件2"],
      "characterDevelopment": "角色发展描述",
      "plotDevelopment": "情节发展描述"
    }
  ]
}

【示例】
对于一个校园小说，章节大纲应该包含：
- 章节标题
- 主要场景和情节
- 角色之间的对话和互动
- 重要的情节转折点
- 情感变化和心理活动
- 为后续章节的铺垫

【小说文本】
${fullContent}`;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-b5658c76fc1349aab26b458af03606f7'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a professional literary analyst and outline generator.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status}`);
        }

        const result = await response.json();
        const aiResponse = result.choices[0].message.content;

        const analysisResult = parseAnalysisResponse(aiResponse);
        return analysisResult;
    } catch (error) {
        console.log('   AI调用失败:', error.message);
        return null;
    }
}

// 解析AI响应
function parseAnalysisResponse(response) {
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('无法提取JSON响应');
        }

        const jsonStr = jsonMatch[0];
        const result = JSON.parse(jsonStr);
        return result;
    } catch (error) {
        console.log('   解析分析响应失败:', error.message);
        return null;
    }
}

// 生成手动完整大纲
function generateManualFullOutline(chapters) {
    console.log('   ✓ 正在生成手动完整大纲...');

    const fullOutline = chapters.map((chapter, index) => ({
        chapterNumber: index + 1,
        title: chapter.title,
        summary: `这是第${index + 1}章的内容梗概，需要详细描述本章的主要情节和事件。`,
        conflict: `本章的主要冲突是关于某个关键问题的解决和角色之间的矛盾。`,
        emotion: `情感曲线从平静开始，逐渐发展到高潮，最后达到某个重要转折点。`,
        keyEvents: [`关键事件1: 角色A遇到问题`, `关键事件2: 角色B采取行动`, `关键事件3: 重要的情节发展`],
        characterDevelopment: `角色在本章中的性格发展和成长。`,
        plotDevelopment: `本章对整体情节发展的贡献和铺垫。`
    }));

    return {
        creativeTheme: {
            type: '轻小说/校园异能',
            style: '第一人称与第三人称交替叙事，轻松幽默的对话风格，细腻的心理描写与场景刻画',
            theme: '身份认同、生存智慧、校园阶级斗争、灵魂共生的羁绊',
            tags: ['穿越', '灵魂共生', '校园斗争', '智斗', '日常喜剧']
        },
        novelSetting: {
            worldview: '基于《欢迎来到实力至上主义的教室》衍生的世界观，强调“实力至上”的封闭校园社会，存在独立经济与监控系统，规则模糊且鼓励竞争',
            background: '近未来日本东京，高度育成高中——一所全封闭、免学费、以升学就业率100%闻名但暗藏残酷竞争规则的精英学校',
            mainCharacters: [
                { name: '夏禾', personality: '冷静、理性、善于观察分析、带有幽默感与吐槽属性，适应力强但向往自由', role: '穿越者灵魂，寄生在椎名日和体内的“代打”，智谋担当' },
                { name: '椎名日和', personality: '外表恬静温和，喜欢读书', role: '女主角，银蓝色长发，C班学生' },
                { name: '龙园翔', personality: '桀骜不驯，试图统治班级', role: 'C班领袖，少年' },
                { name: '坂柳有栖', personality: '才女，智商极高', role: 'A班领袖' }
            ]
        },
        chapterOutline: chapters.map((c, i) => ({
            chapterNumber: i + 1,
            title: c.title,
            summary: `第${i + 1}章内容梗概`,
            conflict: `第${i + 1}章关键冲突`,
            emotion: `第${i + 1}章情感曲线`
        })),
        coreSellingPoint: '高智商主角在校园中的智斗，独特的灵魂寄宿设定，与原作角色的精彩互动',
        fullOutline: fullOutline
    };
}

// 填充完整大纲
function populateFullOutline(analysisResult) {
    console.log('\n4. 填充完整大纲...');

    // a) 填充创作题材信息
    console.log('   a) 填充创作题材信息...');
    const creativeTheme = analysisResult.creativeTheme;
    console.log('      ✓ 类型:', creativeTheme.type);
    console.log('      ✓ 风格:', creativeTheme.style);
    console.log('      ✓ 主题:', creativeTheme.theme);
    console.log('      ✓ 标签:', creativeTheme.tags.join(', '));

    // b) 填充小说设定信息
    console.log('   b) 填充小说设定信息...');
    const novelSetting = analysisResult.novelSetting;
    console.log('      ✓ 世界观:', novelSetting.worldview.substring(0, 60) + '...');
    console.log('      ✓ 主要角色:', novelSetting.mainCharacters.length + '个');

    // c) 填充章节大纲
    console.log('   c) 填充章节大纲...');
    const outlines = analysisResult.fullOutline || analysisResult.chapterOutline;
    console.log(`      ✓ 生成了 ${outlines.length} 个章节大纲`);
    
    outlines.slice(0, 10).forEach((outline, index) => {
        console.log(`        ${index + 1}. ${outline.title}`);
    });
    if (outlines.length > 10) {
        console.log(`        ...还有 ${outlines.length - 10} 个章节`);
    }

    // d) 保存到存储系统
    console.log('   d) 保存到存储系统...');

    // 保存分析结果
    const analysisPath = path.join(__dirname, 'data', 'full-analysis-result.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysisResult, null, 2), 'utf8');
    console.log('      ✓ 完整分析结果已保存到 data/full-analysis-result.json');

    // 保存完整大纲
    const fullOutlinePath = path.join(__dirname, 'data', '我在实教当图书馆NPC', 'metadata', 'ai_novel_gen_full_outlines.json');
    fs.writeFileSync(fullOutlinePath, JSON.stringify(outlines, null, 2), 'utf8');
    console.log('      ✓ 完整章节大纲已保存');

    // 更新基础大纲
    const basicOutlines = outlines.map(outline => ({
        title: outline.title,
        plot: outline.summary || outline.plot || '暂无内容梗概',
        conflict: outline.conflict || '暂无关键冲突',
        emotion: outline.emotion || '暂无情感曲线'
    }));
    const basicOutlinesPath = path.join(__dirname, 'data', '我在实教当图书馆NPC', 'metadata', 'ai_novel_gen_outlines.json');
    fs.writeFileSync(basicOutlinesPath, JSON.stringify(basicOutlines, null, 2), 'utf8');
    console.log('      ✓ 基础大纲已更新');

    // e) 显示核心卖点
    console.log('   e) 核心卖点:');
    console.log(`      ${analysisResult.coreSellingPoint}`);

    console.log('   ✓ 完整大纲填充完成');
}

// 执行
generateFullOutline().catch(console.error);