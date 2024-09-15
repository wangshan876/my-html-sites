self.onmessage = function(event) {
    const {text,splitRegex} = event.data;
    const chapters = splitIntoChapters(text,splitRegex);
    
    self.postMessage(chapters);
};

function splitIntoChapters(text,chapterRegex) {
    let match;
    // 假设章节标题格式为 "第1章" 或 "第十章"
    const chapters = [];
    let lastIndex = 0;
    while ((match = chapterRegex.exec(text)) !== null) {
        // 提取章节标题
        const chapterTitle = match[0].trim(); // 完整的章节标题

        // 添加上一章节的内容
        if (lastIndex < match.index) {
            const unknownContent = text.slice(lastIndex, match.index).trim();
            if (unknownContent) {
                chapters.push({
                    title: 'other',
                    content: unknownContent
                });
            }
        }

        // 章节内容
        const chapterContentStart = match.index + match[0].length;
        const nextChapterMatch = chapterRegex.exec(text);
        const chapterContentEnd = nextChapterMatch ? nextChapterMatch.index : text.length;
        const chapterContent = text.slice(chapterContentStart, chapterContentEnd).trim();

        if (chapterContent) { // 确保章节内容存在
            chapters.push({
                title: chapterTitle,
                content: chapterContent
            });
        }

        lastIndex = chapterContentEnd; // 更新 lastIndex
        chapterRegex.lastIndex = lastIndex; // 重置正则表达式的 lastIndex
    }

    // 处理最后一章后的内容
    if (lastIndex < text.length) {
        const lastContent = text.slice(lastIndex).trim();
        if (lastContent) {
            chapters.push({
                title: 'other',
                content: lastContent
            });
        }
    }

    return chapters;
}