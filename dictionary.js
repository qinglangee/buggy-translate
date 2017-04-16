
var St = StringUtils;


// 检查是否要查字典
function checkSelection(){
    var text = getSelectedText();
    debug("text is :" + text);
    if(text != null && text.length > 0){
        searchWord(text);
    }
}
// 取选中的文字
function getSelectedText(){
    if(window.getSelection) {
        // debug("window.getSelection")
        return window.getSelection().toString();
    } else {
        // debug("document.selection")
        return document.selection.createRange().text;
    }
}
// 查询单词
function searchWord(text){
    debug("search text:" + text);
    var url = "http://dict.youdao.com/search";
    var data = {"keyfrom":"dict.index","q":text};
    $.get(url,data, function(html){
        // debug("get html:", html);
        var word = parseWord(html);
        debug("word is:", word);
        showWord(word);
    },"html");
}

// 从页面解析出单词数据
function parseWord(htmlStr){
    var html = $(htmlStr);
    // 单词
    var keyword = html.find(".keyword");
    var text = St.trim(keyword.text());
    // 发音
    var pronounce = [];
    var pronName = html.find(".pronounce");
    var pronText = html.find(".phonetic")
    for(var i=0; i< pronName.length;i++){
        $(pronText).remove();
        var pronNameValue = $(pronName[i]).text()
        var pron = {"name":St.trim(pronNameValue), "text":St.trim($(pronText[i]).text())};
        pronounce[pronounce.length] = pron;
    }
    // 解释
    var translate = [];
    var transText = keyword.parent().siblings(".trans-container").find("ul>li");
    for(var i = 0; i < transText.length; i++){
        translate[translate.length] = St.trim($(transText[i]).text());
    }

    // word 数据结构
    var word = {"text":text, "pronounce":pronounce, "translate":translate};
    return word;
}

// 启动插件监听
$("body").on("click", checkSelection);