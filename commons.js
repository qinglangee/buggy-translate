var logLevel = 1;
var DEBUG = 0;
var INFO = 1;
var WARN = 2;
var ERROR = 3;
function debug(content){
    if(logLevel > DEBUG){
        console.log.apply(this, arguments)
    }
}