const SplitText = (article, regex = '' , filter = null ) => {
    if(!regex) regex = /[\.!\?。！？]+(\s+|$)/;
    if(!filter) filter = (sentence) => {
        return sentence.trim().length > 3; // 过滤掉空句子
    };
    // 使用正则拆分文章
    const sentences = article.split(regex);
    
    // 过滤句子
    console.log(filter)
    return sentences.map((s)=>{
        return s.replace(/[\r\n\s“”\"]/g, '');
    }).filter(filter);
};

export default   SplitText 