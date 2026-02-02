const fs = require('fs');
const path = require('path');

// 测试章节分割功能
function testChapterSplitting() {
    console.log('=== 测试章节分割功能 ===\n');

    // 1. 读取测试TXT文件
    console.log('1. 读取测试TXT文件...');
    const testFilePath = 'e:\\xss\\new\\我在实教当图书馆NPC.txt';
    let content;
    try {
        content = fs.readFileSync(testFilePath, 'utf8');
        console.log('   ✓ 文件读取成功');
        console.log(`   ✓ 文件大小: ${content.length} 字符`);
    } catch (error) {
        console.log('   ✗ 文件读取失败:', error.message);
        return;
    }

    // 2. 测试章节分割
    console.log('\n2. 测试章节分割...');
    const chapters = splitChapters(content);
    console.log(`   ✓ 章节分割完成，共 ${chapters.length} 个章节`);

    // 3. 显示章节详情
    console.log('\n3. 章节详情:');
    chapters.forEach((chapter, index) => {
        console.log(`   章节 ${index + 1}:`);
        console.log(`     章节号: ${chapter.chapterNumber}`);
        console.log(`     标题: ${chapter.title}`);
        console.log(`     内容长度: ${chapter.content.length} 字符`);
        console.log(`     内容预览: ${chapter.content.substring(0, 100)}...`);
        console.log('');
    });

    // 4. 测试保存章节
    console.log('\n4. 测试保存章节...');
    chapters.forEach((chapter, index) => {
        const chapterNumber = chapter.chapterNumber || (index + 1);
        const chapterContent = chapter.content || '';
        const chapterTitle = chapter.title || `第${chapterNumber}章`;
        
        console.log(`   保存章节 ${chapterNumber}: ${chapterTitle} (${chapterContent.length} 字符)`);
        
        // 模拟保存章节
        const savePath = path.join('e:\\xss\\new\\test-chapters', `第${chapterNumber}章_${chapterTitle}.txt`);
        try {
            // 确保目录存在
            if (!fs.existsSync(path.dirname(savePath))) {
                fs.mkdirSync(path.dirname(savePath), { recursive: true });
            }
            fs.writeFileSync(savePath, chapterContent, 'utf8');
            console.log(`   ✓ 章节 ${chapterNumber} 保存成功`);
        } catch (error) {
            console.log(`   ✗ 章节 ${chapterNumber} 保存失败:`, error.message);
        }
    });

    console.log('\n=== 章节分割功能测试完成！ ===');
}

// 分割章节函数（复制自text-analyzer.js）
function splitChapters(content) {
    const chapters = [];
    // 常见的章节标题格式
    const chapterPatterns = [
        // 主要模式：匹配"第X章 标题"格式
        /(第\d+章)[\s：:]*([^\n]+)(?=第\d+章|$)/gs,
        // 备用模式1：匹配"第X章:标题"格式
        /第(\d+)章[\s：:](.+?)(?=第\d+章|$)/gs,
        // 备用模式2：匹配"第X章: 标题"格式
        /第(\d+)章[\s：:]*([^\n]+)(?=第\d+章|$)/gs,
        // 支持"第X话"格式
        /(第\d+话)[\s：:]*([^\n]+)(?=第\d+话|$)/gs,
        // 支持"第X话:标题"格式
        /第(\d+)话[\s：:]*([^\n]+)(?=第\d+话|$)/gs,
        // 支持"第X卷"格式
        /(第\d+卷)[\s：:]*([^\n]+)(?=第\d+卷|$)/gs,
        // 支持"第X卷:标题"格式
        /第(\d+)卷[\s：:]*([^\n]+)(?=第\d+卷|$)/gs,
        // 英文格式
        /Chapter\s*(\d+)[\s：:](.+?)(?=Chapter\s*\d+|$)/gs,
        /Chapter\s*(\d+)[\s：:]*([^\n]+)(?=Chapter\s*\d+|$)/gs,
        // 其他格式
        /章节\s*(\d+)[\s：:](.+?)(?=章节\s*\d+|$)/gs,
        /Episode\s*(\d+)[\s：:]*([^\n]+)(?=Episode\s*\d+|$)/gs
    ];

    // 尝试各种分割模式
    for (const pattern of chapterPatterns) {
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
            console.log(`   使用模式 ${pattern.toString()} 匹配到 ${matches.length} 个章节`);
            
            // 确保章节内容正确分割
            matches.forEach((match, index) => {
                console.log(`   匹配到章节 ${index + 1}: ${match[0]}`);
                
                // 计算下一个章节的开始位置
                let nextStart = content.length;
                if (index < matches.length - 1) {
                    nextStart = matches[index + 1].index;
                    console.log(`   章节 ${index + 1} 结束位置: ${nextStart}`);
                }
                
                // 提取从当前章节开始到下一个章节开始的内容
                const chapterContent = content.substring(match.index, nextStart).trim();
                console.log(`   章节 ${index + 1} 内容长度: ${chapterContent.length} 字符`);
                
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
                
                console.log(`   章节 ${index + 1} 信息: 第${chapterNumber}章 - ${chapterTitle}`);
                
                chapters.push({
                    title: chapterTitle,
                    content: chapterContent,
                    chapterNumber: chapterNumber
                });
            });
            
            console.log(`   成功识别到 ${chapters.length} 个章节`);
            return chapters;
        }
    }

    // 如果没有找到章节标题，按段落分割
    if (chapters.length === 0) {
        console.log('   未找到章节标题，按段落分割');
        const paragraphs = content.split(/\n{2,}/).filter(p => p.trim().length > 0);
        console.log(`   找到 ${paragraphs.length} 个段落`);
        
        // 按段落数量分割，而不是固定分成5章
        const chapterCount = Math.min(3, Math.max(1, Math.ceil(paragraphs.length / 3))); // 最少1章，最多3章，每章至少3个段落
        console.log(`   按段落分割成 ${chapterCount} 个章节`);
        
        const avgParagraphsPerChapter = Math.ceil(paragraphs.length / chapterCount);
        console.log(`   每章平均 ${avgParagraphsPerChapter} 个段落`);
        
        let currentChapter = { title: '第1章', content: '', chapterNumber: 1 };
        let currentParagraphs = 0;

        paragraphs.forEach((paragraph, paraIndex) => {
            console.log(`   处理段落 ${paraIndex + 1}, 当前章节 ${currentChapter.chapterNumber}, 已添加 ${currentParagraphs} 个段落`);
            
            if (currentParagraphs >= avgParagraphsPerChapter && currentChapter.content) {
                console.log(`   章节 ${currentChapter.chapterNumber} 已满，保存并开始新章节`);
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
            console.log(`   保存最后一个章节 ${currentChapter.chapterNumber}`);
            chapters.push(currentChapter);
        }
        
        console.log(`   按段落分割成 ${chapters.length} 个章节`);
    }

    // 最终检查
    console.log(`   章节分割完成，共 ${chapters.length} 个章节:`);
    chapters.forEach((chapter, index) => {
        console.log(`   章节 ${index + 1}: 第${chapter.chapterNumber}章 - ${chapter.title} (${chapter.content.length} 字符)`);
    });

    return chapters;
}

// 执行测试
testChapterSplitting();