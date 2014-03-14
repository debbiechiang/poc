var Tracer = (function(global){
  
  var con = global.console;
  var conf = {
    warnOnRemove : true,
    verbose : false,
    disable : false
  };
  // ideally these could be ranked or grouped
  var consoleApi = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,timeStamp,trace,warn";
  
  (function(con) {
    function c() {}
    for (var d = consoleApi.split(","), a; a = d.pop();) {
      con[a] = con[a] || c;
    }
    if (conf.verbose) {
      con.count('----======== Tracer ========----')
      con.log('\t\tSetting up Tracer console tools.');
    }
  }(con));
  
  // Utility
  function extend(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
  }
  
  function logger(){
    // core of the whole thing ... this is getting fugly
    if (!conf.disabled) {
      if (conf.verbose) {
        if (conf.name) {
          con.group(conf.name);
        }
        con.count.call(con, ['========== ' + new Date()]);
        if (conf.trace !== false) { 
          con.trace.apply(con, arguments);
        }
        con.timeStamp.apply(con, arguments);
        con.log.apply(con, arguments);
        if (conf.name) {
          con.groupEnd();
          delete conf.name;
        }
      } else {
        con.log.apply(con, arguments);
      }
    }
  }
  
  var Tracer = function(s){
    logger(s);
  };
  
  Tracer.console = {
    // a place to stash console
    defaultConsole : {},
    // disable console.xyz usage
    pause : function() {
        for (var d = consoleApi.split(","), a; a = d.pop();) {
            Tracer.console.defaultConsole[a] = con[a];
            con[a] = function() {};
        }
        return true;
    },
    // disable it all!!
    kill : function(){
        if (conf.warnOnRemove) {
          try {console.warn('JS user console script debugging disabled by client application.');}
          catch (e) {  }
        }
        for (var d = consoleApi.split(","), a; a = d.pop();) {
            con[a] = function() {};
        }
        return true;
    },
    play : function(tf) {
        if (typeof tf != 'undefined') { // if false is passed to play(), we pause
            if (!tf) { Tracer.console.pause(); return true; }
        }
        for (var d = consoleApi.split(","), a; a = d.pop();) {
            if (Tracer.console.defaultConsole.hasOwnProperty(a)) {
                con[a] = Tracer.console.defaultConsole[a];
                Tracer.console.defaultConsole[a] = function() {};
            }
        }
        return true;
    }
  };

  Tracer.set = function(settings, echo){
    conf = extend({}, conf, settings);
    if (echo) {
      logger('********** setting trace config: ', conf);
    }
  };

  return Tracer;
}(window));

// output only YOUR debugging
// use like: 
// Tracer.console.groupof(String 'myLabel', Function myFunctionName, Array myFuncationName Arguments, scope of myFunctionName)
Tracer.console.groupof = function(str, callThis, args, inScope){
    Tracer.console.play(); // make sure it's working
    console.group(str);
        callThis.apply(inScope, args);
    console.groupEnd();
    Tracer.console.pause(); // disable everyone again
}

