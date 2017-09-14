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

    var dictBox;  // 单词显示浮动框
    var dictThemeBox; // 控制主题的层
    var COM = {}; // 各种组件原型的引用
    var RES = {}; // 各种需要加载的web资源
    var dictRef={}; // 持有各个组件的引用
    var pastBox;
    var dictTimer;
    var mouseInDict = false;
    var winTop = null;
    var G = {};
    G.mouse = {}; // 记录点击位置
    G.isPop = false; // 记录是在弹出窗口还是普通页面
    G.atCorner = true; // true:在右上角显示，　否则鼠标旁边显示
    G.close_by_click = false; // true: 点击空白片关闭单词框
    G.theme = 'theme_black'; // 默认是黑色主题
    _.init = function(wnd, isPop){
        winTop = wnd;
        G.isPop = isPop
    }
    G.box_is_showing = false;
    // 更新设置项
    _.setOptions = function(options){
        if(options != null){
            for(var key in options){
                G[key] = options[key];
            }
            resetViewOptions();
            L.debug("set option, G is", G);
        }
    }
    // 设置改变后，重新设置可能改变的选项
    function resetViewOptions(){
        dictThemeBox.removeClass();
        dictThemeBox.addClass(G.theme);
    }
    // 启动关闭浮动框的计时器
    function startTimer(){
        if(dictTimer != null){
            clearTimeout(dictTimer);
        }
        if(!G.isPop){
            dictTimer = setTimeout(function(){
                _.hideBox();
            }, 9000);
        }
    }
    
    // 浮动框的定位和显示
    function showBox(){
        dictBox.removeClass("dict_hide");
        G.box_is_showing = true;
        if(G.atCorner){
            dictBox.css({"top":"10px", "right":"10px", "left":""});
        }else{
            dictBox.css({"top":G.mouse.y + "px", "left":G.mouse.x + "px", "right":""});
        }
    }
    // 浮动框隐藏
    _.hideBox = function(){
        dictBox.addClass("dict_hide");
        G.box_is_showing = false;
    }
    _.handleClick = function(){
        L.debug("View.getG().close_by_click:", G.close_by_click)
        if(G.close_by_click){
            var inDictBox = isClickDictBox();
            if(!inDictBox){
                _.hideBox();
            }
        }
    }
    
    // 判断点击坐标是否是在 dictBox 中
    function isClickDictBox(){
        try{
            var l = parseInt(dictBox.css("left").replace("px", "")) || 99999;
            var t = parseInt(dictBox.css("top")) || 99999;
            var w = parseInt(dictBox.css("width")) || 99999;
            var h = parseInt(dictBox.css("height")) || 99999;
            var x = G.mouse.x;
            var y = G.mouse.y;
            L.debug("view click: x " + x + " y " + y + " l " + l + " t " + t + " w " + w + " h " + h);
            if(x > l && x < l+w && y > t && y < t+h){
                return true;
            }else{
                return false;
            }
        }catch(e){
            L.error(e);
            return false;
        }
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
        if(word.pronounces.length > 0){
            var pronEles = $("<div></div>");
            for(var i=0;i<word.pronounces.length;i++){
                var pron = word.pronounces[i];
                pronEle = $("<div><span class='pron_text'>" + pron.name + pron.text + "</span></div>");
                
                // 单词音频
                if(pron.audio){
                    pronAudio = COM.pronAudio.clone();
                    L.debug("audio is ", pron.audio);
                    pronAudio.find("audio").attr("src", pron.audio);
                    pronAudio.find("a").click(function(){
                        $(this).prev()[0].play();
                    });
                    pronEle.append(pronAudio);
                }
                pronEle.append($("<div class='clear'></div>"));
                pronEles.append(pronEle);
            }
            dictRef.pronounce.html(pronEles);
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
        // 获取各种资源的链接
        RES.imgs = {};
        RES.imgs.remind = browser.runtime.getURL("imgs/remind.png");
        
        var viewUrl = browser.runtime.getURL("html/component.html");
        L.debug("viewUrl:", viewUrl);
        $.get(viewUrl, function(resp){
            // L.debug(resp)
            var all = $(resp);
            L.debug("all:", all)
            dictBox = all.find("#buggy_dict_box");
            dictThemeBox = dictBox.find("#buggy_dict_theme_box");

            dictRef.msg = dictBox.find("#msg");
            dictRef.text = dictBox.find(".text");
            dictRef.pronounce = dictBox.find(".pronounce");
            dictRef.translate = dictBox.find(".translate");
            L.debug("dict box:", dictBox);
            
            COM.pronAudio = all.find("#pron_audio").find("span"); // 发音的音频显示组件
            COM.pronAudio.find("img").attr("src", RES.imgs.remind);

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
                _.hideBox();
            }, 3000);
        });
        
        // 关闭浮动框
        $(".title_div .close", dictBox).click(function(){
            _.hideBox();
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


