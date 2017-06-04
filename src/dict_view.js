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

    var L = ZhchLog;

    var dictBox;
    var dictRef={}; // 持有各个组件的引用
    var pastBox;
    var dictTimer;
    var mouseInDict = false;
    var winTop = null;
    var G = {};
    G.mouse = {}; // 记录点击位置
    G.isPop = false; // 记录是在弹出窗口还是普通页面
    G.atCorner = false; // true:在右上角显示，　否则鼠标旁边显示
    _.init = function(wnd, isPop){
        winTop = wnd;
        G.isPop = isPop
    }
    // 更新设置项
    _.setOptions = function(options){
        if(options != null){
            for(var key in options){
                G[key] = options[key];
            }
            L.debug("set option, G is", G);
        }
    }
    // 启动关闭浮动框的计时器
    function startTimer(){
        if(dictTimer != null){
            clearTimeout(dictTimer);
        }
        if(!G.isPop){
            dictTimer = setTimeout(function(){
                hideBox();
            }, 9000);
        }
    }
    
    // 浮动框的定位和显示
    function showBox(){
        dictBox.removeClass("dict_hide");
        if(G.atCorner){
            dictBox.css({"top":"10px", "right":"10px", "left":""});
        }else{
            dictBox.css({"top":G.mouse.y + "px", "left":G.mouse.x + "px", "right":""});
        }
    }
    // 浮动框隐藏
    function hideBox(){
        dictBox.addClass("dict_hide");
    }

    // 显示单词释义，定时后隐藏
    _.showWord = function(word){
        L.debug("fun showWord:", dictBox);
        _.fillDictContent(word);
        showBox();
        startTimer();
    }
    // 显示正在查词，定时后隐藏
    _.showMsg = function(msg){
        L.debug("fun showMsg:", msg);
        _.clearDictContent();
        dictRef.msg.html(msg);
        showBox();
        startTimer();
    }

    // 单词内容填充页面
    _.fillDictContent = function(word){
        L.debug("box text", dictRef.text);
        _.clearDictContent();
        dictRef.text.html(word.text);

        // 发音
        if(word.pronounce.length > 0){
            var pronStr = "";
            for(var i=0;i<word.pronounce.length;i++){
                var pron = word.pronounce[i];
                pronStr += pron.name + pron.text;
            }
            dictRef.pronounce.html(pronStr);
        }

        // 翻译
        if(word.translate.length > 0){
            for(var i=0; i< word.translate.length; i++){
                var transEle = $("<div>" + word.translate[i] + "</div>");
                dictRef.translate.append(transEle);
            }
        }

    }
    // 清空浮动框显示内容
    _.clearDictContent = function(){
        dictRef.msg.html("");
        dictRef.text.html("");
        dictRef.pronounce.html("");
        dictRef.translate.html("");
    }

    // 加载页面内容
    _.loadPage = function(){
        var viewUrl = browser.runtime.getURL("html/component.html");
        L.debug("viewUrl:", viewUrl);
        $.get(viewUrl, function(resp){
            // L.debug(resp)
            var all = $(resp);
            L.debug("all:", all)
            dictBox = all.find("#buggy_dict_box");

            dictRef.msg = dictBox.find("#msg");
            dictRef.text = dictBox.find(".text");
            dictRef.pronounce = dictBox.find(".pronounce");
            dictRef.translate = dictBox.find(".translate");
            L.debug("dict box:", dictBox);

            if(G.isPop){
                _.initPop();
            }else{
                _.initPage();
            }
            
        },"html")
    }
    
    // 普通页面的初始化
    _.initPage = function(){
        // 设置浮动框　z-index
        // 有bug, 取不到最大值　https://www.zhihu.com/question/52284255/answer/130343309
        // var maxZ = Math.max.apply(null,$.map($('body > *'), function(e,n){
        //     var zIndex = $(e).css("z-index");
        //     return !isNaN(zIndex) ? parseInt(zIndex) : 1;
        // }));
        
        maxZ = 2147483647; // 直接设置成数值上限吧
        dictBox.css("z-index", maxZ); // 设置显示在最上层
        // 鼠标在上方时，不消失
        dictBox.mouseover(function(){
            clearTimeout(dictTimer);
        }).mouseout(function(){
            dictTimer = setTimeout(function(){
                dictBox.addClass("dict_hide");
            }, 3000);
        });
        
        // 关闭浮动框
        $(".title_div .close", dictBox).click(function(){
            dictBox.addClass("dict_hide");
        });
        dictBox.addClass("fix_box"); // 普通网页中固定位置
        $("html").append(dictBox);
        
    }
    // pop 窗口的初始化
    _.initPop = function(){
        dictBox.removeClass("dict_hide");
        dictBox.find(".title_div").addClass("dict_hide")
        $("#pop_box").append(dictBox);
    }
    
    // 记录鼠标位置
    _.mouse = function(x, y, ele){
        G.mouse.x = x;
        G.mouse.y = y;
        G.mouse.ele = ele;
    }
    
    _.getG = function(){
        return G;
    }




    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports.DictionaryView = _;
    } else {
        root.DictionaryView = _;
    }
}).call(this);


