

DictionaryView.init(window);
DictionaryView.loadPage();


Dictionary.init();

// click 时初始化插件
function handleClick(e, winClick){
    // console.log("click button is:" + e.button);
    // 鼠标左中右键是 0 1 2, 只对左键有反应
    if(e.button > 0){
        return;
    }
    DictionaryView.mouse(e.clientX, e.clientY, e);
    Dictionary.checkSelection(winClick);
}

// 启动插件监听
// $("body").on("click", checkSelection);
$(document).on("mouseup", function(e){
    handleClick(e, window);
});

// frame 要分别注册事件，因为　getSelection() 取不到frame中选中的内容　(spring javadoc 页面)
for (var i = 0; i < window.frames.length; i++){
    var thisFrame = window.frames[i];
    $(window.frames[i].document).on("mouseup", function(e){
        handleClick(e, thisFrame);
    })
}


/*"scripts": ["src/background-script.js"]*/