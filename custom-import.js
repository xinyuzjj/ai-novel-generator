const fs = require('fs');
const path = require('path');

// 自定义导入和分析函数
async function importAndAnalyze() {
    console.log('=== 开始导入TXT文件并进行AI分析 ===\n');

    // 1. 读取TXT文件内容
    console.log('1. 读取TXT文件...');
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
    console.log('   ✓ 章节列表:');
    chapters.forEach((chapter, index) => {
        console.log(`     ${index + 1}. ${chapter.title}`);
    });

    // 3. AI分析（使用DeepSeek）
    console.log('\n3. 开始AI分析...');
    console.log('   ✓ 正在调用DeepSeek模型...');
    
    const analysisResult = await callDeepSeekAI(content);
    if (!analysisResult) {
        console.log('   ✗ AI分析失败，使用手动分析结果');
        // 使用手动分析结果作为备份
        const manualAnalysis = generateManualAnalysis();
        populateFields(manualAnalysis);
    } else {
        console.log('   ✓ AI分析成功');
        populateFields(analysisResult);
    }

    // 4. 保存章节
    console.log('\n4. 保存章节内容...');
    const savePath = path.join(__dirname, 'split_chapters');
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
    }

    chapters.forEach((chapter, index) => {
        const chapterPath = path.join(savePath, `第${chapter.chapterNumber}章_${chapter.title}.txt`);
        fs.writeFileSync(chapterPath, chapter.content, 'utf8');
    });
    console.log('   ✓ 所有章节已保存到 split_chapters/ 目录');

    console.log('\n=== 导入和分析完成！ ===');
}

// 分割章节函数
function splitChapters(content) {
    const chapters = [];
    // 常见的章节标题格式
    const chapterPatterns = [
        /第(\d+)章[\s：:](.+?)(?=第\d+章|$)/gs,
        /Chapter\s*(\d+)[\s：:](.+?)(?=Chapter\s*\d+|$)/gs,
        /章节\s*(\d+)[\s：:](.+?)(?=章节\s*\d+|$)/gs,
        /第(\d+)章[\s：:]*([^\n]+)(?=第\d+章|$)/gs,
        /Chapter\s*(\d+)[\s：:]*([^\n]+)(?=Chapter\s*\d+|$)/gs,
        /第(\d+)话[\s：:]*([^\n]+)(?=第\d+话|$)/gs,
        /Episode\s*(\d+)[\s：:]*([^\n]+)(?=Episode\s*\d+|$)/gs
    ];

    // 尝试各种分割模式
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

// 调用DeepSeek AI
async function callDeepSeekAI(content) {
    // 限制分析内容长度（使用完整内容）
    const analysisContent = content.length > 8000 ? content.substring(0, 8000) + '...' : content;

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

    // 调用DeepSeek API
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
                    { role: 'system', content: 'You are a professional literary analyst.' },
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

        // 解析AI响应
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

// 生成手动分析结果（作为备份）
function generateManualAnalysis() {
    return {
        creativeTheme: {
            type: '校园奇幻/穿越',
            style: '智斗/恋爱/后宫',
            theme: '在高度育成学校中的生存与发展',
            tags: ['校园', '穿越', '智斗', '恋爱', '后宫']
        },
        novelSetting: {
            worldview: '基于《实力至上主义的教室》世界观，高度育成学校，班级制度，点数系统',
            background: '现代东京，高中校园背景',
            mainCharacters: [
                { name: '夏禾', personality: '穿越者，智商高，擅长智斗', role: '男主角，寄宿在椎名日和体内' },
                { name: '椎名日和', personality: '恬静温和，喜欢读书', role: '女主角，银蓝色长发，C班学生' },
                { name: '龙园翔', personality: '桀骜不驯，试图统治班级', role: 'C班领袖，少年' },
                { name: '坂柳有栖', personality: '才女，智商极高', role: 'A班领袖' }
            ]
        },
        chapterOutline: [
            {
                chapterNumber: 1,
                title: '少女，需要代打嘛？',
                summary: '主角夏禾穿越到椎名日和体内，两人初次交流，建立基本信任',
                conflict: '发现共享身体，建立基本信任',
                emotion: '从惊讶、尴尬到接受和理解'
            },
            {
                chapterNumber: 2,
                title: '亡牌代练',
                summary: '主角接管身体，与老师进行点数交易',
                conflict: '通过"贿赂"老师获得特权，揭示学校规则',
                emotion: '从紧张到对学校制度的不满'
            },
            {
                chapterNumber: 3,
                title: '是他主动给的！',
                summary: '与龙园翔交易，获得十万点数并给出建议',
                conflict: '龙园试图拉拢，主角拒绝并给予建议',
                emotion: '从对峙到交易的洒脱'
            }
        ],
        coreSellingPoint: '高智商主角在校园中的智斗，独特的灵魂寄宿设定，与原作角色的精彩互动'
    };
}

// 填充各个字段
function populateFields(analysisResult) {
    console.log('\n5. 填充各个字段...');

    // 填充创作题材信息
    console.log('   a) 填充创作题材信息...');
    const creativeTheme = analysisResult.creativeTheme;
    console.log('      ✓ 类型:', creativeTheme.type);
    console.log('      ✓ 风格:', creativeTheme.style);
    console.log('      ✓ 主题:', creativeTheme.theme);
    console.log('      ✓ 标签:', creativeTheme.tags.join(', '));

    // 填充小说设定信息
    console.log('   b) 填充小说设定信息...');
    const novelSetting = analysisResult.novelSetting;
    console.log('      ✓ 世界观:', novelSetting.worldview.substring(0, 50) + '...');
    console.log('      ✓ 时代背景:', novelSetting.background);
    console.log('      ✓ 主要角色:');
    novelSetting.mainCharacters.forEach((char, index) => {
        console.log(`        ${index + 1}. ${char.name} - ${char.personality} (${char.role})`);
    });

    // 填充章节大纲
    console.log('   c) 填充章节大纲...');
    const outlines = analysisResult.chapterOutline;
    console.log(`      ✓ 生成了 ${outlines.length} 个章节大纲`);
    outlines.forEach((outline, index) => {
        console.log(`        ${index + 1}. ${outline.title} - ${outline.summary.substring(0, 30)}...`);
    });

    console.log('   ✓ 所有字段填充完成');
}

// 执行导入和分析
importAndAnalyze().catch(console.error);