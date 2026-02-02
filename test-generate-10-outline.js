const fs = require('fs');
const path = require('path');

// 测试生成前10个章节的大纲
async function testGenerate10ChaptersOutline() {
    console.log('=== 测试生成前10个章节的大纲 ===\n');

    // 1. 读取前10个章节内容
    console.log('1. 读取前10个章节内容...');
    const chapters = [];
    const chaptersDir = path.join(__dirname, 'split_chapters');
    const chapterFiles = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.txt'));

    console.log(`   ✓ 找到 ${chapterFiles.length} 个章节文件`);

    chapterFiles.forEach(file => {
        const match = file.match(/第(\d+)章_(.+?)\.txt/);
        if (match) {
            const chapterNumber = parseInt(match[1]);
            const chapterPath = path.join(chaptersDir, file);
            const content = fs.readFileSync(chapterPath, 'utf8');
            chapters.push({
                chapterNumber: chapterNumber,
                title: match[2],
                content: content,
                filePath: chapterPath
            });
        }
    });

    // 按章节号排序并取前10个
    chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
    const first10Chapters = chapters.slice(0, 10);
    console.log(`   ✓ 取前 ${first10Chapters.length} 个章节`);

    // 2. AI生成前10个章节大纲
    console.log('\n2. 调用DeepSeek生成前10个章节大纲...');
    console.log('   ✓ 正在分析前10个章节...');

    const outline10 = await callDeepSeekForChapters(first10Chapters);
    if (!outline10) {
        console.log('   ✗ AI分析失败，使用手动大纲');
        const manualOutline = generateManualChaptersOutline(first10Chapters);
        saveOutline(manualOutline, 'first10');
    } else {
        console.log('   ✓ AI分析成功');
        saveOutline(outline10, 'first10');
    }

    console.log('\n=== 前10个章节大纲测试完成！ ===');
}

// 调用DeepSeek生成章节大纲
async function callDeepSeekForChapters(chapters) {
    const chapterInfos = chapters.map((c, i) => {
        const preview = c.content.substring(0, 300);
        return `${i + 1}. 第${c.chapterNumber}章《${c.title}》\n前300字预览：${preview}...\n`;
    }).join('\n');

    const prompt = `你是一个专业的文学分析师，擅长分析小说章节并生成详细大纲。

请为以下小说的章节生成详细大纲。共有${chapters.length}个章节。

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

// 生成手动章节大纲
function generateManualChaptersOutline(chapters) {
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

// 保存大纲
function saveOutline(analysisResult, prefix) {
    console.log('\n3. 保存大纲...');

    // 保存前10个章节大纲
    const outlinePath = path.join(__dirname, 'data', `test_${prefix}_outline.json`);
    fs.writeFileSync(outlinePath, JSON.stringify(analysisResult.fullOutline, null, 2), 'utf8');
    console.log(`   ✓ 大纲已保存到 data/test_${prefix}_outline.json`);

    // 显示所有10个章节
    console.log('\n4. 前10个章节大纲:');
    analysisResult.fullOutline.forEach((outline, index) => {
        console.log(`   ${index + 1}. ${outline.title}`);
        console.log(`      梗概: ${outline.summary.substring(0, 80)}...`);
        console.log(`      冲突: ${outline.conflict.substring(0, 60)}...`);
    });

    console.log('\n5. 详细大纲示例:');
    console.log('   第1章详细大纲:');
    console.log(`      标题: ${analysisResult.fullOutline[0].title}`);
    console.log(`      梗概: ${analysisResult.fullOutline[0].summary}`);
    console.log(`      冲突: ${analysisResult.fullOutline[0].conflict}`);
    console.log(`      情感: ${analysisResult.fullOutline[0].emotion}`);
    console.log(`      关键事件: ${analysisResult.fullOutline[0].keyEvents.join(', ')}`);
    console.log(`      角色发展: ${analysisResult.fullOutline[0].characterDevelopment}`);
    console.log(`      情节发展: ${analysisResult.fullOutline[0].plotDevelopment}`);
}

// 执行
testGenerate10ChaptersOutline().catch(console.error);