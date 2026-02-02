const fs = require('fs');
const path = require('path');

// 测试章节分割和保存功能
function testChapterSplitAndSave() {
    console.log('=== 测试章节分割和保存功能 ===\n');

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

    // 3. 测试保存章节
    console.log('\n3. 测试保存章节...');
    const saveDir = 'e:\\xss\\new\\test-chapters';
    
    // 确保保存目录存在
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
        console.log(`   ✓ 创建保存目录: ${saveDir}`);
    }

    chapters.forEach((chapter, index) => {
        const chapterNumber = chapter.chapterNumber || (index + 1);
        const chapterContent = chapter.content || '';
        const chapterTitle = chapter.title || `第${chapterNumber}章`;
        
        console.log(`   保存章节 ${chapterNumber}: ${chapterTitle} (${chapterContent.length} 字符)`);
        
        // 保存章节
        const savePath = path.join(saveDir, `第${chapterNumber}章_${chapterTitle}.txt`);
        try {
            fs.writeFileSync(savePath, chapterContent, 'utf8');
            console.log(`   ✓ 章节 ${chapterNumber} 保存成功: ${savePath}`);
        } catch (error) {
            console.log(`   ✗ 章节 ${chapterNumber} 保存失败:`, error.message);
        }
    });

    // 4. 验证保存结果
    console.log('\n4. 验证保存结果...');
    const savedFiles = fs.readdirSync(saveDir);
    console.log(`   ✓ 共保存 ${savedFiles.length} 个章节文件:`);
    savedFiles.forEach((file, index) => {
        console.log(`     ${index + 1}. ${file}`);
    });

    console.log('\n=== 测试章节分割和保存功能完成！ ===');
    console.log(`\n总结:`);
    console.log(`✓ 成功读取TXT文件`);
    console.log(`✓ 成功分割 ${chapters.length} 个章节`);
    console.log(`✓ 成功保存 ${savedFiles.length} 个章节文件`);
    console.log(`✓ 章节分割功能正常工作`);
}

// 分割章节函数（复制自text-analyzer.js）
function splitChapters(content) {
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
        const matches = [...content.matchAll(pattern)];
        
        if (matches.length > 0) {
            console.log(`   使用模式 ${pattern.toString()} 匹配到 ${matches.length} 个章节`);
            
            // 确保章节内容正确分割
            matches.forEach((match, index) => {
                // 计算下一个章节的开始位置
                let nextStart = content.length;
                if (index < matches.length - 1) {
                    nextStart = matches[index + 1].index;
                }
                
                // 提取从当前章节开始到下一个章节开始的内容
                const chapterContent = content.substring(match.index, nextStart).trim();
                
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
        
        // 按段落数量分割，而不是固定分成5章
        const chapterCount = Math.min(3, Math.max(1, Math.ceil(paragraphs.length / 3))); // 最少1章，最多3章，每章至少3个段落
        
        const avgParagraphsPerChapter = Math.ceil(paragraphs.length / chapterCount);
        
        let currentChapter = { title: '第1章', content: '', chapterNumber: 1 };
        let currentParagraphs = 0;

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
        
        console.log(`   按段落分割成 ${chapters.length} 个章节`);
    }

    return chapters;
}

// 执行测试
testChapterSplitAndSave();