(function() {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };


    
    var St = StringUtils;
    var L = ZhchLog;
    var View = DictionaryView;


    // 检查是否要查字典
    _.checkSelection = function(winClick){
        var text = _.getSelectedText(winClick);
        L.debug("text is :" + text);
        if(text != null && text.length > 0){
            _.searchWord(text);
        }
    }
    // 取选中的文字
    _.getSelectedText = function(winClick){
        L.debug("chu dian shen a ")
        if(winClick.getSelection) {
            L.debug("window.getSelection")
            var selText = winClick.getSelection().toString();
            return selText;
        } else {
            L.debug("document.selection")
            return winClick.document.selection.createRange().text;
        }
    }

    // 遍历取 iframe 中的选中内容
    // _.tryIframeText = function(wnd){
    //     var result = wnd.getSelection();
    //     for (var i = 0; !result && i < wnd.frames.length; i++){
    //         L.debug("try time is:", i);
    //         result = _.tryIframeText(wnd.frames[i]);
    //     }
    //     return result;
    // }

    // 查询单词
    _.searchWord = function(text, isPop){
        L.debug("search text:" + text);
        var url = "http://dict.youdao.com/search";
        var data = {"keyfrom":"dict.index","q":text};
        $.get(url,data, function(html){
            // L.debug("get html:", html);
            var word = _.parseWord(html);
            L.debug("word is:", word);
            View.showWord(word, isPop);
        },"html");
    }

    // 从页面解析出单词数据
    _.parseWord = function(htmlStr){
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




    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports.Dictionary = _;
    } else {
        root.Dictionary = _;
    }
}).call(this);
