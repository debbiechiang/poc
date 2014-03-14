
;var boost = boost || {};

// Tracer.console.pause();

boost.ballDrop = (function($, jQuery, boostModernizr){
    
    var boostvars = {};
    if (boost.vars) {
        boostvars = boost.vars
    };

    if (boostModernizr === null) {
        boost.ballDrop.vars.useHeroPreroll = false;
    };

    // global boost.ballDrop settings
    var vars = {
        useHeroPreroll : true,
        usePlayer : 'youtube',
        noHashTargetDiv : '',
        targetElement : '#balldplayer',
        $videoParent : {}
    }

    function cleanIDHash(){
        boost.ballDrop.vars.noHashTargetDiv = boost.ballDrop.vars.targetElement.replace('#', '');
        return boost.ballDrop.vars.noHashTargetDiv;
    }

    // here we add a class to the parent of the video div in order to identify it's type
    // IMPORTANT: Call this at the same time you're adding your embed
    function setLayoutForPlayerType(){
        $(boost.ballDrop.vars.targetElement).parent('div').addClass(boost.ballDrop.vars.usePlayer);
    }

    // start aditv scripts
    var aditv = {
        config : {},
        getAdiTvConfig : function(){
            var config = {
                playlistId : '8TqgJyfqVKSt',
                player : null,
                urls : []
            }

            var dev = [
                'http://development.adidas.com/video/com/assets/js/libs/modernizr.jquery.custom.js',
                'http://development.adidas.com/video/com/assets/js/libs/player_localize_enum.js',
                'http://development.adidas.com/video/com/assets/js/libs/player_loader_core.js',
                'http://development.adidas.com/video/com/assets/js/libs/player_localization_core.js',
                'http://development.adidas.com/video/com/assets/js/libs/player_model_core.js',
                'http://development.adidas.com/video/com/assets/js/libs/player_controller_core.js',
                'http://development.adidas.com/video/com/assets/js/libs/player_view_component_factory.js',
                'http://development.adidas.com/video/com/assets/js/libs/player_view_core.js',
                'http://development.adidas.com/video/com/assets/js/libs/player_plugin_core.js',
                'http://development.adidas.com/video/com/assets/js/jquery.player.js'
            ];

            var staging = [
                'http://staging.adidas.com/video/com/assets/js/aplayer.js'
            ];

            var prod = [
                'http://www.adidas.com/video/com/assets/js/aplayer.js'
            ]

            // @todo detect the environment like with the reviews urls
            config.urls = dev;

            return config;
        },
        setAdiTvControllerObject : function(){
            return boost.ballDrop.cleanIDHash();
        },
        setAdiPlayerObject : function(){
            // this is the unique way that the aditv player api exposes the object
            var player = window[boost.ballDrop.vars.noHashTargetDiv + 'js'];
            return player;
        }
    }

    function loadAditvScripts(){
        boost.ballDrop.aditv.setAdiTvControllerObject();
        boost.loader.loadJSFiles(boost.ballDrop.aditv.config.urls, boost.ballDrop.scriptLoadCallback);
        boost.ballDrop.setLayoutForPlayerType();
    }

    function scriptLoadCallback(){

        if (typeof jQuery.fn.avp === 'function') {
            $boost.fn.avp = jQuery.fn.avp;
        } else {
        };

        $(boost.ballDrop.vars.targetElement).avp({
            'playlistID':boost.ballDrop.aditv.config.playlistId,
            autoPlay : true
        });

        boost.ballDrop.aditv.config.player = boost.ballDrop.aditv.setAdiPlayerObject();

        var player = boost.ballDrop.aditv.config.player;


        // this is temporary code
        var ourInterval = window.setInterval(function(){
            try {
                var playStatus = player.controller.paused();
                var playList = player.playlist;
                clearInterval(ourInterval);
                callBackPlayer(playStatus, playList);
            } catch(e) {
            }
        }, 100);

        function callBackPlayer(playStat, playListObj){

            // $()
                player.checkComplete();
                // window.targetDivjs.controller.play();

                try {
                    boost.preloader.offsetsLoaded = true;
                    boost.preloader.finishLoader();
                    setTimeout(function(){
                        $(boost.ballDrop.vars.targetElement).animate({'opacity' : 1});
                    }, 500);
                } catch(e){
                }

        }
    }
    // aditv 

    var youtubeballdrop = {
        config : {
            urls : ['http://www.google.com/jsapi',
                    'http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js'
            ]
        }
    }
    // youtubeballdrop {}

    function loadYTScripts(){
      //  boost.ballDrop.youtubeballdrop.setAdiTvControllerObject();
        boost.loader.loadJSFiles(boost.ballDrop.youtubeballdrop.config.urls, this.youtubescriptLoadCallback);
    }
    // loadYTScripts()

    // order of youtube execution
    // (1) files loaded, call this
    function youtubescriptLoadCallback(){
        loadPlayer();

        function loadPlayer() {
                var params = {
                    allowScriptAccess: "always",
                    wmode:'transparent'
                };

                var atts = {
                    id: "ytPlayer"
                };

                swfobject.embedSWF("http://www.youtube.com/apiplayer?" + "version=3&enablejsapi=1&fs=1&playerapiid=player1&wmode=transparent", 
                    "balldplayer", "1404", "790", "9", null, null, params, atts);
            }
        // call the function in the Window Scope
        runInWindowScope();
        boost.ballDrop.setLayoutForPlayerType();

        // (2) once loaded, call this
        // we run this in the window scope (see above)
        function runInWindowScope() {
            var ytplayer;

            // (3) execute loadPlayer when it's ready
            

            // (3) called by The Google
            

            // (4) each time the player's state changes
            onPlayerStateChange = function(stateId){
                if (stateId === 5) {
                    $.publish('boost.youtube.playing', true);
                    

                } else if (stateId === 1) {
                    // NOTE: Chromeless youtube video quality can only be set AFTER it starts playing.
                    // ytplayer.setPlaybackQuality("large");

                } else if (stateId === 3){
                    $('.watchvideo').css('z-index', 0);
                    boost.preloader.offsetsLoaded = true;
                    boost.preloader.finishLoader();

                } else if (stateId === 0) {
                    boost.ballDrop.vars.$videoParent.children().remove();
                    $('.watchvideo').css('z-index', 100);
                };
            }

            // (5) player is ready!
            onYouTubePlayerReady = function(playerId) {
                ytplayer = document.getElementById("ytPlayer");

                ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
                ytplayer.addEventListener("onError", "onPlayerError");

                ytplayer.cueVideoById("Rv3o3-ItfSc", 0, "hd720");
                playVideo();
            }

            // (6) not sure when this is used ... 
            function playVideo() {

                if (ytplayer) {
                    ytplayer.playVideo();
                }
            }

            // only if there's an error
            function onPlayerError(errorCode) {
                alert("An error occured of type:" + errorCode);
            }
        }
        // end - runInWindowScope()
    }
    // youtubescriptLoadCallback()

    // end - youtube scripts

    // initialize
    function init(e, data){
        boost.ballDrop.vars.useHeroPreroll = data.useHeroPreroll;
        boost.ballDrop.vars.usePlayer = data.usePlayer;

        boost.ballDrop.vars.$videoParent = $(boost.ballDrop.vars.targetElement).parent();

        if (boost.ballDrop.vars.useHeroPreroll) {

            if (boost.ballDrop.vars.usePlayer === 'aditv') {
                boost.ballDrop.aditv.config = boost.ballDrop.aditv.getAdiTvConfig();
                boost.ballDrop.loadAditvScripts();

            } else if (boost.ballDrop.vars.usePlayer === 'youtube'){
                boost.ballDrop.loadYTScripts();

            };
        } else {

        };
    }

    return {
        vars : vars,
        // setup : setup,   // before init
        init : init,        // after init
        aditv : aditv,
        youtubeballdrop : youtubeballdrop,
        youtubescriptLoadCallback : youtubescriptLoadCallback,
        loadYTScripts : loadYTScripts,
        cleanIDHash : cleanIDHash,
        loadAditvScripts : loadAditvScripts,
        scriptLoadCallback : scriptLoadCallback,
        setLayoutForPlayerType : setLayoutForPlayerType
    };

}($boost, jQuery, boost.Modernizr || null));

// execute this script
$boost.subscribe('boost.balldrop.init', boost.ballDrop.init);

