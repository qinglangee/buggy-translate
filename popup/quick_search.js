
DictionaryView.init(window, true);
DictionaryView.loadPage();

function quickSearch(){
    var word = $("#search_input").val();
    if(word.length > 0){
        Dictionary.searchWord(word, true);
    }
}
$("#search_btn").click(function(){
    quickSearch();
});
$("#search_input").on("keyup", function(e){
    var key = e.which;
    // 回车查词
    if(key == 13){
        quickSearch();
    }
});
$(".open_options").on("click", function(e){
    browser.runtime.openOptionsPage();
});
setTimeout(function(){
    $("#search_input").focus();
}, 200);