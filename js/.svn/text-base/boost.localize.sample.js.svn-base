/* 
    Localized JS file

        To run a local JavaScript file on top of ours JS for Boost,
        run code in the following format.
        
        Note our jQuery Publish/Subscribe mechanism is using 
         * jQuery Tiny Pub/Sub
         * https://github.com/cowboy/jquery-tiny-pubsub
         *
         * Copyright (c) 2013 "Cowboy" Ben Alman
         * Licensed under the MIT license.

        (1) [boostLocal] - replace all instances with your namespace
            e.g.

        >    var boostCanadian = (function($, _market){
        >        
        >        function init(){
        >            console.log('boostCanadian called');
        >            console.log('we are ', _market);
        >        }
        >
        >        return {
        >            init : init
        >        }
        >    }($boost, __boost__market));
        >
        >    $boost.subscribe('boost.localize.market', boostCanadian.init);
        
 */

// revealing module pattern
// $ = our copy of jQuery, not the adidas.com copy of jQuery
var boostLocal = (function($, _market){
    
    // your code goes here

    function init(){
        console.warn('boostLocal.init called via subscription');
        // your code goes here
    }

    return {
        // add public methods here
        init : init
    }
}($boost, __boost__market));

$boost.subscribe('boost.localize.scripts', boostLocal.init);
