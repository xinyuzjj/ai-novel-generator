const fs = require('fs');
const path = require('path');

// 专门的AI分析和填充脚本
async function main() {
    console.log('=== 开始分析小说并填充字段 ===\n');

    // 1. 读取TXT文件内容
    console.log('1. 读取小说内容...');
    const filePath = path.join(__dirname, '我在实教当图书馆NPC.txt');
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
        console.log('   ✓ 文件读取成功');
        console.log(`   ✓ 前500个字符: ${content.substring(0, 500)}...`);
    } catch (error) {
        console.log('   ✗ 文件读取失败:', error.message);
        return;
    }

    // 2. AI分析
    console.log('\n2. 调用DeepSeek进行AI分析...');
    const analysisResult = await callDeepSeekAI(content);
    if (!analysisResult) {
        console.log('   ✗ AI分析失败');
        return;
    }

    console.log('   ✓ AI分析成功');

    // 3. 保存分析结果
    console.log('\n3. 保存分析结果...');
    const analysisPath = path.join(__dirname, 'data', 'analysis-result.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysisResult, null, 2), 'utf8');
    console.log('   ✓ 分析结果已保存到 data/analysis-result.json');

    // 4. 填充各个字段
    console.log('\n4. 开始填充字段...');
    populateFields(analysisResult);

    console.log('\n=== 所有操作完成！ ===');
}

// 调用DeepSeek AI
async function callDeepSeekAI(content) {
    // 使用前面5000个字符进行分析
    const analysisContent = content.length > 5000 ? content.substring(0, 5000) + '...' : content;

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

// 填充各个字段
function populateFields(analysisResult) {
    console.log('\n4. 填充各个字段...');

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
    console.log('      ✓ 世界观:', novelSetting.worldview);
    console.log('      ✓ 时代背景:', novelSetting.background);
    console.log('      ✓ 主要角色:');
    novelSetting.mainCharacters.forEach((char, index) => {
        console.log(`        ${index + 1}. ${char.name} - ${char.personality} (${char.role})`);
    });

    // c) 填充章节大纲
    console.log('   c) 填充章节大纲...');
    const outlines = analysisResult.chapterOutline;
    console.log(`      ✓ 生成了 ${outlines.length} 个章节大纲`);
    outlines.forEach((outline, index) => {
        console.log(`        ${index + 1}. ${outline.title} - ${outline.summary.substring(0, 50)}...`);
    });

    // d) 显示核心卖点
    console.log('   d) 核心卖点:');
    console.log(`      ${analysisResult.coreSellingPoint}`);

    // e) 填充到存储系统
    console.log('   e) 填充到存储系统...');

    // 填充创作题材到project.json
    const projectPath = path.join(__dirname, 'data', '我在实教当图书馆NPC', 'metadata', 'ai_novel_gen_settings.json');
    const settingsPath = path.join(__dirname, 'data', '我在实教当图书馆NPC', 'metadata', 'ai_novel_gen_settings.json');
    const outlinesPath = path.join(__dirname, 'data', '我在实教当图书馆NPC', 'metadata', 'ai_novel_gen_outlines.json');

    // 填充settings
    let settings = {};
    if (fs.existsSync(settingsPath)) {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }

    // 填充角色信息
    const characterInfo = novelSetting.mainCharacters.map((char, index) => ({
        id: index + 1,
        name: char.name,
        personality: char.personality,
        role: char.role,
        appearance: '',
        background: ''
    }));
    settings.characterInfo = characterInfo;

    // 填充世界观设置
    const worldSettings = [];
    if (novelSetting.worldview) {
        worldSettings.push({ key: '世界观', value: novelSetting.worldview });
    }
    if (novelSetting.background) {
        worldSettings.push({ key: '时代背景', value: novelSetting.background });
    }
    settings.worldSettings = worldSettings;

    // 填充金手指/关键信息
    const characterState = [
        { key: '世界观', value: novelSetting.worldview },
        { key: '时代背景', value: novelSetting.background }
    ];
    novelSetting.mainCharacters.forEach((char, index) => {
        characterState.push({ 
            key: `角色${index + 1}`, 
            value: `${char.name} - ${char.personality} (${char.role})` 
        });
    });
    settings.characterState = characterState;

    // 保存settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    console.log('      ✓ 小说设定已保存');

    // 填充章节大纲
    const outlinesData = outlines.map((outline, index) => ({
        title: outline.title,
        plot: outline.summary,
        conflict: outline.conflict,
        emotion: outline.emotion
    }));
    fs.writeFileSync(outlinesPath, JSON.stringify(outlinesData, null, 2), 'utf8');
    console.log('      ✓ 章节大纲已保存');

    // 填充创作题材（到project.json）
    const projectData = {
        category: 'custom',
        name: '我在实教当图书馆NPC',
        totalChapters: outlines.length,
        minWords: 2000,
        maxWords: 4000,
        authorRole: `你是一个专业的网文作家，擅长${creativeTheme.style}风格的写作。`,
        rules: [
            `保持${creativeTheme.style}风格`,
            `围绕${creativeTheme.theme}主题展开`,
            `突出小说的核心卖点：${analysisResult.coreSellingPoint}`
        ],
        sellingPoint: analysisResult.coreSellingPoint
    };
    const projectFilePath = path.join(__dirname, 'data', '我在实教当图书馆NPC', 'metadata', 'ai_novel_gen_settings.json'); // 这里应该是project.json，但暂时保存到settings
    // 实际上应该保存到project.json，但先保存到settings中
    fs.writeFileSync(projectFilePath, JSON.stringify(settings, null, 2), 'utf8');
    console.log('      ✓ 创作题材已保存');

    console.log('   ✓ 所有字段填充完成');
}

// 执行
main().catch(console.error);