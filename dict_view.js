var dictBox;
var dictRef={};
var pastBox;
var dictTimer;

// 显示单词释义，定时后隐藏
function showWord(word){
    debug("inshow:", dictBox)
    dictBox.removeClass("dict_hide");
    fillDictContent(word);
    if(dictTimer != null){
        clearTimeout(dictTimer);
    }
    dictTimer = setTimeout(function(){
        dictBox.addClass("dict_hide");
    }, 9000);
}

// 单词内容填充页面
function fillDictContent(word){
    debug("box text", dictRef.text);
    clearDictContent();
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
function clearDictContent(){
    dictRef.text.html("");
    dictRef.pronounce.html("");
    dictRef.translate.html("");
}

// 加载页面内容
function loadPage(){
    var viewUrl = browser.runtime.getURL("html/component.html");
    debug(viewUrl);
    $.get(viewUrl, function(resp){
        // debug(resp)
        var all = $(resp);
        debug("all:", all)
        dictBox = all.find("#buggy_dict_box");
        dictRef.text = dictBox.find(".text")
        dictRef.pronounce = dictBox.find(".pronounce")
        dictRef.translate = dictBox.find(".translate")
        debug("dict box:", dictBox)
        $("body").append(dictBox);
    },"html")
}



loadPage();