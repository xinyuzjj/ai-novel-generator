const fs = require('fs');
const path = require('path');

// 简单测试章节分割功能
function simpleTestChapterSplitting() {
    console.log('=== 简单测试章节分割功能 ===\n');

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

    // 2. 简单章节分割测试
    console.log('\n2. 简单章节分割测试...');
    
    // 测试1: 查找所有章节标题
    console.log('   测试1: 查找所有章节标题...');
    const chapterTitles = [];
    const chapterRegex = /^\s*第(\d+)章[\s：:]*([^\n]+)$/gm;
    let match;
    
    while ((match = chapterRegex.exec(content)) !== null) {
        chapterTitles.push({
            chapterNumber: parseInt(match[1]),
            title: match[2].trim(),
            index: match.index
        });
    }
    
    console.log(`   ✓ 找到 ${chapterTitles.length} 个章节标题:`);
    chapterTitles.forEach((title, index) => {
        console.log(`     ${index + 1}. 第${title.chapterNumber}章: ${title.title} (位置: ${title.index})`);
    });

    // 测试2: 测试章节内容分割
    console.log('\n3. 测试章节内容分割...');
    if (chapterTitles.length > 0) {
        console.log(`   ✓ 测试章节内容分割:`);
        
        for (let i = 0; i < chapterTitles.length; i++) {
            const start = chapterTitles[i].index;
            const end = i < chapterTitles.length - 1 ? chapterTitles[i + 1].index : content.length;
            const chapterContent = content.substring(start, end).trim();
            
            console.log(`     章节 ${i + 1}: 第${chapterTitles[i].chapterNumber}章 - ${chapterTitles[i].title}`);
            console.log(`       开始位置: ${start}`);
            console.log(`       结束位置: ${end}`);
            console.log(`       内容长度: ${chapterContent.length} 字符`);
            console.log(`       内容预览: ${chapterContent.substring(0, 50)}...`);
            console.log('');
        }
    } else {
        console.log('   ✗ 未找到章节标题，测试按段落分割...');
        
        // 测试按段落分割
        const paragraphs = content.split(/\n{2,}/).filter(p => p.trim().length > 0);
        console.log(`   ✓ 找到 ${paragraphs.length} 个段落`);
        
        // 按段落分割成3章
        const chapterCount = 3;
        const avgParagraphsPerChapter = Math.ceil(paragraphs.length / chapterCount);
        console.log(`   ✓ 按段落分割成 ${chapterCount} 章，每章平均 ${avgParagraphsPerChapter} 个段落`);
        
        let currentChapter = { title: '第1章', content: '', chapterNumber: 1 };
        let currentParagraphs = 0;
        const chapters = [];
        
        paragraphs.forEach((paragraph, paraIndex) => {
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
        
        console.log(`   ✓ 按段落分割完成，共 ${chapters.length} 章:`);
        chapters.forEach((chapter, index) => {
            console.log(`     章节 ${index + 1}: ${chapter.title} (${chapter.content.length} 字符)`);
        });
    }

    console.log('\n=== 简单测试章节分割功能完成！ ===');
}

// 执行测试
simpleTestChapterSplitting();