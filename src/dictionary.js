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


    // 词典的主要逻辑
    
    var St = StringUtils;
    var L = ZhchLog;
    var View = DictionaryView;
    var G = {};
    G.api = "youdao"; // 默认值为 youdao
    var API = {
        "youdao":{
            url:"http://dict.youdao.com/search",
            data:{"keyfrom":"dict.index","q":"word"}
        },
        "bing":{
            url:"http://cn.bing.com/dict/search",
            data:{"q":"word"}
        }
    };
    G.lastWord = "";
    
    // 正则匹配英文
    var englishReg = /^[-\w\s'\d\.]+$/;
    // 正则匹配非英文
    var notEnglishReg = /[^-\w\s'\d\.]+/g;


    // 检查是否要查字典
    _.checkSelection = function(winClick){
        var text = "";
        try{
            var target = View.getG().mouse.ele.target;
            // 如果是input textarea之类的，FF中用 window.getSelection 取不到，所以提前用它们的方法取值
            if(target.value != null){
                text = target.value.substring(target.selectionStart, target.selectionEnd);
            }
        }catch(err){
            // 一般不会出错，　出错也不理它就好了
        }
        if(text == null || text.length == 0){
            text = _.getSelectedText(winClick);
        }
        L.debug("text is :" + text);
        // 只处理英文
        if(!englishReg.test(text)){
            text = text.replace(notEnglishReg, "");
        }
        text = St.trim(text);
        
        L.debug("after replace text is :" + text);
        
        if(text != null && text.length > 0){
            if(!View.getG().box_is_showing || text != G.lastWord){
                G.lastWord = text;
                _.searchWord(text);
            }
        }else{
            L.debug("View.getG().close_by_click:", View.getG().close_by_click)
            if(View.getG().close_by_click){
                View.hideBox();
            }
        }
    }
    // 取选中的文字
    _.getSelectedText = function(winClick){
        L.debug("chu dian shen a ")
        // firefox中有 window.getSelection, 但是不返回　textarea 中的选中内容
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
        
        // TODO 无法获得配置更新信息，只好先每次都重新读取
        loadOptions();
        
        
        View.showMsg("正在查词:" + text + "...");
        
        var api = API[G.api];
        api.data.q = text;
        $.get(api.url,api.data, function(html){
            // L.debug("get html:", html);
            var word = parseWord(html);
            L.debug("word is:", word);
            View.showWord(word, isPop);
        },"html");
    }
    function parseWord(html){
        if(G.api == "youdao"){
            return parseYoudaoWord(html);
        }else{
            return parseBingWord(html);
        }
    }
    function parseBingWord(htmlStr){
        var html = $(htmlStr);
        var container = html.find(".qdef");
        // 单词
        var headword = container.find("#headword h1");
        var text = St.trim(headword.text());
        // 发音
        var pronounce = [];
        // 美音
        var usText = container.find(".hd_prUS").text();
        if(usText.indexOf("[") > 0){
            var usName = usText.substring(0,usText.indexOf("["));
            var usPron = usText.substring(usText.indexOf("["));
            pronounce[pronounce.length] = {"name":usName, "text":usPron};
        }
        // 英音
        var ukText = container.find(".hd_pr").text();
        if(ukText.indexOf("[") > 0){
            var ukName = ukText.substring(0,ukText.indexOf("["));
            var ukPron = ukText.substring(ukText.indexOf("["));
            pronounce[pronounce.length] = {"name":ukName, "text":ukPron};
        }
        // 解释
        var translate = [];
        var transText = container.find("ul>li");
        for(var i=0;i<transText.length;i++){
            translate[translate.length] = St.trim($(transText[i]).text());
        }
        
        // word 数据结构
        var word = {"text":text, "pronounce":pronounce, "translate":translate};
        return word;
    }

    // 从页面解析出单词数据
    function parseYoudaoWord(htmlStr){
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

    // 加载配置
    function loadOptions(){
        L.debug("dict loadOptions");
        function onError(error) {
            console.error(`Error: ${error}`);
        }

        function onGot(item) {
            var single = item.single;
            if(single == null){
                return;
            }
            L.debug("load single is ",single);
            G.api = single.api || G.api;

            var options = {};
            options["atCorner"] = !("nearby" == single.box_location); // 默认是true
            options["close_by_click"] = single.close_by_click == "yes"; // 默认是false
            View.setOptions(options);
        }

        var getting = browser.storage.local.get("single");
        getting.then(onGot, onError);
    }
    
    _.init = function(){
        loadOptions();
        
        // TODO 暂时通信失败
        // browser.runtime.onMessage.addListener(function(message){
        //     if(message.type == "change_option"){
        //         loadOptions();
        //     }
        // });
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
