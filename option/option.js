var L = ZhchLog;

// 保存单选的设置
function saveSingleChoice(key, value) {
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
            // console.log(response.response);
        }).catch(onError);
    }
}

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


document.addEventListener("DOMContentLoaded", restoreOptions);
// document.querySelector("input").addEventListener("change", ll);
$(".single_choice").on("click", function(){
    var ele = $(this);
    var key = ele.attr("name");
    var value = ele.val()
    L.debug("select option:",key, value);
    saveSingleChoice(key, value);
});
