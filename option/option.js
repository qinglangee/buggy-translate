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

function saveOptions(key, value) {
    var option = {};
    option[key] = value;
    setPromise = browser.storage.local.set(option);
    // TODO 与dictionary.js 通信失败
    // setPromise.then(function(){
    //     browser.runtime.sendMessage({"type":"change_option"});
    // });
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
