
DictionaryView.init(window);
DictionaryView.loadPage(true);

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
})