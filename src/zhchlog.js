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


    var DEBUG = 1;
    var INFO = 2;
    var WARN = 3;
    var ERROR = 4;

    var logLevel = DEBUG;

    _.debug = function(content){
        if(logLevel <= DEBUG){
            console.log.apply(this, arguments)
        }
    }
    _.info = function(content){
        if(logLevel <= INFO){
            console.info.apply(this, arguments)
        }
    }
    _.warn = function(content){
        if(logLevel <= WARN){
            console.warn.apply(this, arguments)
        }
    }
    _.error = function(content){
        if(logLevel <= ERROR){
            console.error.apply(this, arguments)
        }
    }



    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports.ZhchLog = _;
    } else {
        root.ZhchLog = _;
    }
}).call(this);
