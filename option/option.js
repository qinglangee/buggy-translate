var L = ZhchLog;

// 保存单选的设置
function saveSingleValue(key, value) {
    var singlePromise = browser.storage.local.get("single");
    singlePromise.then(saveSingle);
    
    function saveSingle(result){
        var single = result.single;
        if(single == null){
            single = {};
        }
        
        single[key] = value;
        saveOptions("single", single);
    }
}

// 错误处理
function onError(error) {
    L.error(`Error: ${error}`);
}
// 向指定tabs发送消息
function sendMessageToTabs(tabs) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(
            tab.id,
            {"type":"change_option"}
        ).then(response => {
            L.debug("Message from the content script:");
            // L.debug(response.response);
        }).catch(onError);
    }
}
// 选项保存到storage中，发通知给本窗口的所有标签页
function saveOptions(key, value) {
    var option = {};
    option[key] = value;
    setPromise = browser.storage.local.set(option);
    setPromise.then(function(){
        L.debug("send a message for save options.");
        browser.tabs.query({
            currentWindow: true,
            url: ["<all_urls>"]
        }).then(sendMessageToTabs).catch(onError);
    });
}

function restoreOptions() {
    // 恢复单选的设置
    function setSingleChoice(result) {
        var single = result.single;
        L.debug("single is ", single)
        if(single == null){
            return;
        }
        for(var key in single){
            var value = single[key];
            L.debug("restore value:", key, value);
            var ele = $("#" + value);
            if(ele != null){
                ele.attr("checked", "checked");
            }
        }
    }

    function onError(error) {
        console.error(`Error: ${error}`);
    }

    var getting = browser.storage.local.get("single");
    getting.then(setSingleChoice, onError);
}

// 存储文本输入框内容
function saveInputTxt(){
    $(".input_txt").each(function(){
        var ele = $(this);
        var key = ele.attr("name"); // 单选项的name作为key
        var value = ele.val(); // value 作为　value
        L.debug(key + ":" + value);
        saveSingleValue(key, value);
    });
}

// 页面加载完成事件
document.addEventListener("DOMContentLoaded", restoreOptions);

// 处理单选框点击事件
$(".single_choice").on("click", function(){
    var ele = $(this);
    var key = ele.attr("name"); // 单选项的name作为key
    var value = ele.val(); // value 作为　value
    L.debug("select option:",key, value);
    saveSingleValue(key, value);
});

// 处理文本输入事件
$(".input_txt").on("blur", function(){
    var ele = $(this);
    // 先判断是数字, 并且范围是 0 < x < 101
    if(/^\d+$/.test(ele.val()) && ele.val() > 0 && ele.val() < 101){ 
        saveInputTxt();
    }else{
        ele.val(9);
    }
})


