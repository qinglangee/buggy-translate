

DictionaryView.init(window);
DictionaryView.loadPage();


Dictionary.init();

// 启动插件监听
// $("body").on("click", checkSelection);
$(document).on("mouseup", function(e){
    DictionaryView.mouse(e.clientX, e.clientY, e);
    Dictionary.checkSelection(window);
});

// frame 要分别注册事件，因为　getSelection() 取不到frame中选中的内容　(spring javadoc 页面)
for (var i = 0; i < window.frames.length; i++){
    var thisFrame = window.frames[i];
    $(window.frames[i].document).on("click", function(e){
        DictionaryView.mouse(e.clientX, e.clientY, e);
        Dictionary.checkSelection(thisFrame);
    })
}


browser.runtime.onMessage.addListener(function(message){
    console.log("gagagagagagga")
    if(message.type == "change_option"){
    }
});

/*"scripts": ["src/background-script.js"]*/