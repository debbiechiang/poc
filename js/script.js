// handlebars template helper, for the Reviews
Handlebars.registerHelper('indexer', function(item){
    var countRows = item + 1;
    if (countRows > 3) {
        return countRows - 3;
    } else {
        return countRows;
    };
});

Handlebars.registerHelper('tagHandler', function(context, block){
    var totalTags = context.length;
    var ret = '';
    var maxTags = 2;

    function handleNormal(normalcontext, block){
        // this is just #each
        for (var i = 0, j = normalcontext.length; i<j; i++){
            ret = ret + block.fn(normalcontext[i]);
        }
        return ret;
    }

    function handleExtra(extracontext, block){
        ret = ret + "<li class='tagsmore roundCorners' style='opacity: 1; text-align:center; cursor:pointer; width: 10px;><span class='otherTagsNumber'>+" + extracontext.length + "</span><ul class='moreList roundCorners' style='display: none; width: 123px;'>"; 
        handleNormal(extracontext, block);
        ret = ret + "<div class='tag_bubble_arrow'></div></ul></li>"; 
        return ret;
    }

    if (totalTags > maxTags){
        var extraTags = context.slice(maxTags);
        var normalTags = context.slice(0,maxTags);
        handleNormal(normalTags, block);
        handleExtra(extraTags, block);
    } else {
        handleNormal(context, block);
    }

    return new Handlebars.SafeString(ret);
});

// no var statement here anymore since it's been moved to modernizr.boost.js
// boost namespace
;boost = (function($, _market, boostModernizr, _env){

    // we import Modernizr or a copy of Modernizr from modernizr.boost.js
    var modernizr = boostModernizr;

    var boostMarket = (function(market){
        // add class to html tag based on market id from adi's .php
        $('html').addClass(market);
        return market;
    }(_market));

    // global config and settings
    var vars = {
        DEBUG: true,
        useHeroPreroll: true,
        usePlayer: 'youtube',
        useReviews: true,
        slideHeight: 800,
        headerHeight: 110,
        winW: $(window).width(),
        winH: $(window).height(),
        absLeft: ($(window).width() - 950) / 2, // the distance from the left edge to the content well
        pos: 0,
        productDock: false,
        lookDock: false,
        urls: {
            // reviews query urls
            local: 'js/allin/boostquery.js',
            dev: '//hp.dev.brandservices.adidas.com/pc',
            // dev: '//hp.brandservices.adidas.com/pc', // testing prod against dev
            qa: '//hp.qa.brandservices.adidas.com/pc',
            prod: '//hp.brandservices.adidas.com/pc',
            reviewsQuery: '/allaccess/jsonp/?callback=?&page=global/boost_news/0/6',
            // reviewsQuery: '/allaccess/jsonp/?callback=?&page=posts/{market}/+-%28-expirationDate%3A%5B2012-06-07T12%3A02%3A40Z+TO+%2A%5D+OR+expirationDate%3A%5B%2A+TO+%2A%5D+OR+-expirationDate%3A%221-01-01T00%3A00%3A00Z%22%29+AND+-%28-displayDate%3A%5B%2A+TO+2012-06-07T12%3A02%3A40Z%5D+OR+displayDate%3A%5B%2A+TO+%2A%5D+OR+-displayDate%3A%221-01-01T00%3A00%3A00Z%22%29/6/0/publishDate+desc/',
            

            flag : (function(env){
                if (env === 'dev') { // handling special local dev cases
                    var url = location.href.toLowerCase();
                    var localServer = (url.indexOf('local') > -1 || url.indexOf('user') > -1) ? true : false;
                    if (localServer) {
                        return 'dev'; //'local' or 'dev' to override
                    } else {
                        return env;
                    }
                } else {
                    return env;
                }
            }(_env)),
            ytiframeresrc: '//www.youtube.com/iframe_api',
            addthis: '//s7.addthis.com/js/250/addthis_widget.js'
        },
        preload: true // set to false to disable the preloader.
    }; // vars {}

    var els = {}; // els {}

    // Init func
    var init =  function() {
        this.cache.init();

        this.preloader.init();
        this.rAF();
        this.loader.init();
        this.inView();
        this.style.init();
        this.carousel();
        this.animate();
        this.hotspot.bind();
        this.tray.init();
        this.colors.init();
        this.reviews.init();
        this.ytiframe.init();

        // fire external library
        $.publish('boost.balldrop.init', {
            useHeroPreroll : boost.vars.useHeroPreroll,
            usePlayer : boost.vars.usePlayer
        });

        // two options for localized JS (doubt you'd use more than one)
        // (a) we listen to them if they want us to load a file
        // will load a file ./mks/[market]/script.js
        $.subscribe('boost.localize.load.market.js', boost.localize.jsload);
        $.subscribe('boost.localize.load.market.css', boost.localize.cssload);

        // (b) we tell them to execute a script
        //  example in js/boost.localize.sample.js
        $.publish('boost.localize.scripts');
        // boost.loadVideoOverlay();

        // Delegate .transition() calls to .animate()
        // if the browser can't do CSS transitions.
        if (!$.support.transition)
          $.fn.transition = $.fn.animate;
    }; // init()

    var cache = {
        init: function() {
            boost.els.$body = $('body');
            // screens
            boost.els.$screen1 = $('#screen1');
            boost.els.$screen2 = $('#screen2');
            boost.els.$screen3 = $('#screen3');
            boost.els.$screen4 = $('#screen4');
            boost.els.$screen5 = $('#screen5');
            boost.els.$screen6 = $('#screen6');

            // animation on screen 1
            boost.els.$movingShoe = $('.movingshoe');
            boost.els.$wipeRight =  $('.wiperight');
            boost.els.$splitScreenHero = $('#splitscreenhero');
            boost.els.$cloneholder01 = $('.cloneholder01');
            boost.els.$cloneholder02 = $('.cloneholder02');
            boost.els.$shoePrev = $('#shoeprev');

            // product carousel 
            boost.els.$carousel = $('.carousel');
            boost.els.$carouselcta = boost.els.$carousel.find('.bigcta');
            boost.els.$carouselpage = $('#productpagination');      

            // lookbook carousel
            boost.els.$lookbook = $('.lookbook');
            boost.els.$lookbookcta = boost.els.$lookbook.find('.bigcta');
            boost.els.$lookbookpage = $('#lookpagination');              
        }
    };

    var hotspot = {
        init: function(activeslide) {
            if (activeslide.data('hsLoaded') != true){
                this.delayabit(activeslide);
                this.activatetophs(activeslide);
                activeslide.data('hsLoaded', true); 
            }
        },
        bind: function(){
            $(".hs_cta").click(function() {
                $(this).parent('.boosths').toggleClass("active");
            });
        },
        delayabit: function(activeslide) {
            setTimeout((function() {
                activeslide.find('.boosths').each(function(i) {
                    $(this).delay(i * 300).transition({
                        'opacity': '1'
                    }, 500, 'linear');
                });
            }), 200);
        },
        activatetophs: function(activeslide) {
            setTimeout((function() {
                activeslide.find('.boosths:last-child').addClass('active');
            }), 1200);
        }
    }; // hotspot()

    var inView = function(){
        var inViewSelectors = '.mensboost, .womensboost, #screen0, #screen1, #screen2, #screen3, #screen4, #screen5';
        $(inViewSelectors).on('inview', function(event, visible) {
                if (visible === true) {
                    $(this).addClass('inview');
                } else {
                    $(this).removeClass('inview');
                }
            }
        );
    }; // inView()

    var rAF = function() {
        /**
         * Provides requestAnimationFrame in a cross browser way.
         * @author paulirish / http://paulirish.com/
         */
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (function() {
                return window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
                        window.setTimeout(callback, 1000 / 60);
                    };
            })();
        }
    }; // rAF();

    var style = {
        orig: {
            shoePos: {
                width: 925,
                top: 200,
                backgroundSize:'contain'
            },
            flare0Pos: {
                top: 10
            },
            flare1Pos: {
                top: 140
            },
            flare2Pos: {
                top: 210
            }
        },
        blowout: {
            shoePos: {
                width: 1300,
                top: -290,
                backgroundSize:'contain'
            },
            flare0Pos: {
                top: -300,
                left: 0
            },
            flare1Pos: {
                top: -110,
                left: -245
            },
            flare2Pos: {
                top: -350,
                left: -327
            }
        },
        initPos: [
            {
                el: '#slide03 .slidehero',
                pos: -60, 
                proper: 'left'
            }, {
                el: '#slide04 .slidehero',
                pos: 0,
                proper: 'left'
            }, {
                el: '#slide05 .slidehero',
                pos: 255,
                proper: 'left'
            }, {
                el: '#slide06 .slidehero',
                pos: 395,
                proper: 'left'
            }, {
                el: '.lookbook .slidehero',
                pos: -485,
                proper: 'left'
            }, {
                el: '#ballvideo',
                pos: 280,
                proper: 'left'
            }, {
                el: '#productpagination',
                pos: 415,
                proper:'left'
            }
        ],
        init: function(){
            this.update();
            this.positionHero('.movingshoe', 'orig');

            $('.watchvideo').css('left',664-$('.watchvideo').width()/2);

            this.alignIt($('.mensredshoe'), 0, 'left');

           
        }, // boost.style.init();

        reset: function() {
            // If the user scrolls back up to the top of the slide, reset the entire experience. 
            $('.boosths').css('opacity',0).removeClass('active');
            $('.slide').data('hsLoaded', false);
            boost.els.$screen1.removeClass('slideshowView');

            boost.colors.resetColorSplit();
            boost.els.$carousel.trigger('slideToPage', [0, {
                fx: 'none',
                onBefore: function() {
                    boost.els.$cloneholder02.addClass('hidden');
                    boost.els.$shoePrev.addClass('inactive');
                },
                onAfter: function() {
                    boost.style.positionHero('.movingshoe','orig');
                    boost.els.$movingShoe.removeClass('hidden');
                    $('#caption01').fadeIn();
                }
            }]);

            $('.lookbook').trigger('slideToPage', [0, {
                fx: 'none',
                onBefore: function() {
                    $('#lookprev').addClass('inactive');
                },
                onAfter: function() {
                
                }
            }]);

        }, // boost.style.reset();

        update: function() {
            /* The max window width is 1920px and the content well is 950px wide. The content well always stays centered
             * in the visible window area. Decorative elements are fixed relative to that 950px content well; having a wider
             * browser window will reveal more of the hero shoe, but the shoe will always stay centered in the viewport. In other words,
             * there is always a point in the image that will overlap the left edge of the content well.
             *
             * Everything that needs to be called on browser resize goes here.
             */

            // updating the universal vars
            var absLeft = boost.vars.absLeft = ($(window).width() - 950) / 2;
            boost.vars.winW = $(window).width();
            boost.vars.winH = $(window).height();

            // updating the hero positions that depend on absLeft
            this.orig.shoePos.left = absLeft + 50;
            this.orig.flare0Pos.left = absLeft + 450;
            this.orig.flare1Pos.left = absLeft + 20;
            this.orig.flare2Pos.left = absLeft - 200;
            this.blowout.shoePos.left = absLeft - 230;

            // update the distance that the men's shoe has to go in the colors transition
            boost.colors.kickoffscreen = '+='+ (boost.vars.winW - boost.vars.absLeft) + 'px';

            // update the product slide hero and lookbook image positions
            for (var i = 0; i < boost.style.initPos.length; i++) {
                this.alignIt($(boost.style.initPos[i].el), boost.style.initPos[i].pos, boost.style.initPos[i].proper);
            }

            // update the hero shoe transitions
            this.positionHero('.cloneholder01', 'orig');
            this.positionHero('.cloneholder02', 'blowout');

            if(!boost.els.$wipeRight.hasClass('hidden')){
                if (boost.els.$screen1.hasClass('slideshowView')){
                    this.positionHero('.movingshoe', 'blowout');
                }else {
                    this.positionHero('.movingshoe', 'orig');
                }
            }
            // @todo: generalize this part.
            boost.els.$wipeRight.css({
                width: boost.vars.winW/2 + 10,
                top: boost.vars.headerHeight
            });

            boost.els.$splitScreenHero.css({
                marginLeft: boost.vars.absLeft -520
            });

            if (!(boost.colors.mensscreen.hasClass('seen')) && !(boost.colors.womensscreen.hasClass('seen'))){
                // Only do this if the main color splitscreen is showing, or else it'll show the main screen underneath the
                // other visible one.
                $('.menssidewiper').css({
                    width: boost.vars.winW/2 + 40
                });

                boost.style.alignIt($('.mensredshoe'), 0, 'left');

                $("#womensexample").css({
                    left:boost.vars.winW/2
                });
            }

            boost.els.$movingShoe.css({
                'max-width': boost.vars.winW + 'px'
            });

            $('.screen, .caroufredsel_wrapper, .slide').css({
                'width': boost.vars.winW
            });

            $('.backdrop').css({
                'width': boost.vars.winW + 40
            });
            
        }, // boost.style.update()

        alignIt: function($el, fixedX, proper){
            $el.each(function() {
                $(this).css(proper, boost.vars.absLeft + fixedX + 'px');
            });
        }, // boost.style.alignIt()

        positionHero: function(el, group){
            var $el = $(el);
            $el.find('.heroshoe').css(boost.style[group].shoePos);
            $el.find('.hero00').css(boost.style[group].flare0Pos);
            $el.find('.hero01').css(boost.style[group].flare1Pos);
            $el.find('.hero02').css(boost.style[group].flare2Pos);
        }, // boost.style.positionHero()

        animateHero: function(el, group, duration){
            var $el = $(el);
            $el.find('.heroshoe').transition(boost.style[group].shoePos, duration);
            $el.find('.hero00').transition(boost.style[group].flare0Pos, duration);
            $el.find('.hero01').transition(boost.style[group].flare1Pos, duration);
            $el.find('.hero02').transition(boost.style[group].flare2Pos, duration);
        } // boost.style.animateHero()
    }; //style();

    // Carousel
    var carousel = function() {
        // PRODUCT DETAILS CAROUSEL (screen1)
        var prodSettings = {
            height: 800,
            width:boost.vars.winW,
            responsive:true,
            circular: false,
            infinite: true,
            align: 'left',
            auto: {
                play: false
            },
            scroll: {
                fx: 'scroll',
                duration:400
            },
            items: {
                visible: 1,
                width: boost.vars.winW
            },
           onCreate: function() {
                boost.els.$shoePrev.addClass('inactive');
                $(this).parents('.screen').addClass('showing-slide-0');
            },
            prev: {
                button: boost.els.$shoePrev,
                onBefore: function(data) {
                    var $this = $(this);
                    boost.els.$body.scrollTo(boost.vars.slideHeight, 200);

                    var goingTo = $this.triggerHandler('currentPosition') || 0;
                    
                    // Add a "showing-slide-#' class to the parent <section> for CSS purposes
                    // (after removing any existing showing-slide-# class)
                    $this.parents('.screen').removeClass(function(i, c){
                        return (c.match(/showing-slide-[0-9]+/ig) || []).join(' ');
                     }).addClass('showing-slide-' + goingTo);

                    switch (goingTo) {
                        case 0:
                            if (data.items.old[0].id == 'slide02'){
                                //if going backwards from slide 2 to 1, reverse that transition
                                boost.style.positionHero('.movingshoe', 'blowout');
                                boost.els.$movingShoe.removeClass('hidden');
                                $(boost.els.$cloneholder02, boost.els.$cloneholder01).addClass('hidden');
                                boost.style.animateHero('.movingshoe', 'orig', 1000);
                            }else {
                                // otherwise, keep cloneholders in place and just scroll back through it. 
                                boost.els.$movingShoe.addClass('hidden');
                                boost.style.positionHero('.movingshoe', 'orig');
                                if(!$.browser.msie || document.documentMode > 8)
                                    boost.els.$cloneholder01.removeClass('hidden');
                            }
                            break;
                        default:
                            boost.els.$screen1.addClass('slideshowView');
                            boost.els.$cloneholder02.removeClass('hidden');
                            boost.els.$carouselpage.css({
                                'position': 'absolute'
                            });
                        break;
                    }
                },
                onAfter: function(data) {
                    var $this = $(this);
                    var goingTo = $this.triggerHandler('currentPage');
                    var $thisSlide;

                    switch (goingTo) {
                        case 0:
                            boost.els.$shoePrev.addClass('inactive');
                            $('#caption01').fadeIn();
                            $('.slideshowView').removeClass('slideshowView');
                            boost.els.$cloneholder01.addClass('hidden');

                            if (data.items.old[0].id == 'slide02'){
                            }else {
                                //boost.style.positionHero('.movingshoe', 'orig');
                                boost.els.$movingShoe.removeClass('hidden');
                                boost.els.$cloneholder01.addClass('hidden');
                            }
                            break;
                        case 1:
                            boost.els.$shoePrev.removeClass('inactive');
                            boost.els.$cloneholder02.removeClass('hidden');
                            boost.els.$carouselpage.css({
                                'position': 'absolute'
                            });
                            break;
                        default:
                            boost.els.$shoePrev.removeClass('inactive');
                            boost.els.$carouselpage.css({
                                'position': 'absolute'
                            });
                            break;
                    }

                    boost.hotspot.init($(this).triggerHandler('currentVisible'));
                }
            },
            next: {
                button: $('#shoenext'),
                fx: 'scroll',
                duration: 400,
                onBefore: function() {
                    var $this = $(this);
                    boost.els.$body.scrollTo(boost.vars.slideHeight, 200);
                    var goingTo = $this.triggerHandler('currentPosition') || 0;
                    
                    // Add a "showing-slide-#' class to the parent <section> for CSS purposes
                    // (after removing any existing showing-slide-# class)
                    $this.parents('.screen').removeClass(function(i, c){
                        return (c.match(/showing-slide-[0-9]+/ig) || []).join(' ');
                     }).addClass('showing-slide-' + goingTo);

                    
                    switch (goingTo) {
                        case 0:
                            //$('.cloneholder02').addClass('hidden');
                            boost.style.positionHero('.movingshoe', 'orig');
                            $('.slideshowView').removeClass('slideshowView');
                            break;
                        case 1:
                            $('#caption01').hide();
                            boost.els.$screen1.addClass('slideshowView');
                            $(boost.els.$cloneholder02, boost.els.$cloneholder01).addClass('hidden');
                            boost.style.animateHero('.movingshoe', 'blowout', 800);
                            break;
                        default:
                            boost.els.$movingShoe.addClass('hidden');
                            boost.els.$cloneholder02.removeClass('hidden');
                            boost.els.$screen1.addClass('slideshowView');
                            break;
                    }
                },
                onAfter: function() {
                    var goingTo = $(this).triggerHandler('currentPage');
                                         
                    var $thisSlide;
                    switch (goingTo) {
                        case 0:
                            boost.els.$shoePrev.addClass('inactive');
                            $('#caption01').fadeIn(800);
                            boost.els.$movingShoe.removeClass('hidden');
                            break;
                        case 1:
                            boost.els.$shoePrev.removeClass('inactive');
                            boost.els.$cloneholder02.removeClass('hidden');
                            break;
                        default:
                            boost.els.$shoePrev.removeClass('inactive');
                            boost.els.$movingShoe.addClass('hidden');
                            break;
                    }
                     boost.hotspot.init($(this).triggerHandler('currentVisible'));
                }

            },

            pagination: {
                container: $('#productpagination'),
                anchorBuilder: function(nr, item) {
                    return '<a href="#' + nr + '">&nbsp;</a>';
                }
            }
        }; // prodSettings {} object

        // carouFredSel plugin options
        var prodOptions = {
            classnames: {
                selected: 'active',
                disabled: 'inactive'
            }
        }; // prodOptions {} object

        // instantiate carouFredSel() with config options from above
        boost.els.$carousel.carouFredSel(prodSettings, prodOptions);

        function handleLookbookSlide(){
            var $this = $(this);
            var $lookprev = $('#lookprev');
            var activeslidenum = $this.triggerHandler('currentPage');
            var activeslide = $this.triggerHandler('currentVisible');

            if (activeslidenum === 0){
                $lookprev.addClass('inactive');
            } else {
                $lookprev.removeClass('inactive');
            }

            boost.hotspot.init(activeslide);
        }

        boost.els.$lookbook.carouFredSel({
            height: 800,
            circular: false,
            responsive: true,
            infinite: true,
            align: 'left',
            auto: {
                play: false
            },
            items: {
                visible: 1
            },
            onCreate: function() {
                $('#lookprev').addClass('inactive');
            },
            prev: {
                button: $('#lookprev'),
                fx: 'scroll',
                duration: 400,
                onAfter: handleLookbookSlide,
            },
            next: {
                button: $('#looknext'),
                fx: 'scroll',
                duration: 400,
                onBefore: function() {
                    var goingTo = boost.els.$lookbook.triggerHandler('currentPage');

                    if (goingTo > 0){
                        boost.els.$lookbookcta.css({
                           'position':'absolute',
                           top:584,
                           right:0
                        });
                    }
                },
                onAfter: handleLookbookSlide
            },
            pagination: {
                container: $('#lookpagination'),
                anchorBuilder: function(nr, item) {
                    return '<a href="#' + nr + '">&nbsp;</a>';
                },
                onAfter: handleLookbookSlide
            }
        }, {
            classnames: {
                selected: 'active',
                disabled: 'inactive'
            }
        });

        // Both carousels have large CTAs on the first slide that act as next buttons.
        $('.bigcta').on('click', function() {
            $(this).closest('.caroufredsel_wrapper').children().triggerHandler('nextPage');
        });

    }; // carousel()

    var tray = {
        currScreen: 0,
        previousSectionTitle: '',
        titleArr: [],
        metricsArr: ['', 'PRODUCT_DETAIL', 'COLORS', 'APPAREL_LOOKBOOK', 'REVIEWS', 'GO_BOOST'],
        $trayLink: $('.next-section-link-holder'),
        init: function(){
            $('.next-section-link-holder, .wiperight .shoe01, .seeboost').click(function(e) {
                e.preventDefault();
                var target = $(this).attr('href');
                boost.tray.scrollToSection(target);
                return false;
            });
            boost.tray.buildArr();
            // boost.tray.$trayLink.parent('.tray-link-wrp').attr({});
            boost.tray.$trayLink.attr({'id' : 'gotoscreen1', 'href': '#screen1'}).html('<span>'+ boost.tray.titleArr[0].title +'</span><span class="black-down-cta-icon"></span>');
        },
        buildArr: function() {
            $('.screen').each(function(i) {
                var $this = $(this);
                boost.tray.titleArr[i] = {
                    'title': $this.data('title'),
                    'id': '#' + $this.attr('id')
                };
            });

            boost.tray.handleReviews();
        },
        handleReviews: function() {
            if (boost.reviews.showing === false){
                boost.tray.titleArr.splice(4,1);
                boost.tray.metricsArr.splice(4,1);
            }
            boost.tray.updateText();
        },
        updateText: function(){
            var screennumber = Math.max(0, Math.floor((boost.pos+50)/boost.vars.slideHeight));

            if ((screennumber !== boost.tray.currScreen) && screennumber < boost.tray.titleArr.length - 1){
                boost.tray.$trayLink.attr({
                    'id' : 'gotoscreen'+[screennumber+1],
                    'href': boost.tray.titleArr[screennumber+1].id
                })
                .children('span:first-child').html(boost.tray.titleArr[screennumber+1].title);

                boost.tray.currScreen = screennumber;

                
            }
        },
        scrollToSection: function(target) {
            $('body').scrollTo(target, 1000, {
                easing: 'easeInCubic'
            });
            boost.tray.updateText();
            return false;
        }

    }; // tray()

    /* Men's and Women's Boost */
    var colors = {
        kickoffscreen: 0,
        menssidewiper: $('.menssidewiper'),
        mensexample: $('#mensexample'),
        mensscreen: $('.mensboost'),
        mensclone: $('.menssidewiper .clone'),
        womensexample: $('#womensexample'),
        womensscreen: $('.womensboost'),
        header: $('#colors_bst h1'),

        switchScreen: function($color1, $color2){
             // @params: jQuery objects for shoe color option by gender. $color1 is default.
            var $curr = $(this);
            var $color = $color1.hasClass('displayed') ? $color1 : $color2;

            // reset thumbnails
            $curr.find('.currentImg').removeClass('currentImg').hide();
            $curr.find('.actv').removeClass('actv');

            // show the first thumbnail 
            $color.find('img').eq(0).show().addClass('currentImg');
            $color.find('.thumbs a').eq(0).addClass('actv');
        },

        goToMens: function() {
            this.header.hide();

            // animate the splitscreen BG to the right
            this.menssidewiper.transition({
                width: boost.vars.winW + 80
            }, 400, 'easeInSine', function() {
                boost.els.$screen2.addClass('noBG');
            });
            
            // animate the men's example shoe to the right
            this.mensexample.transition({
                left: boost.colors.kickoffscreen
            }, 540, 'easeInSine');

            // reset the thumbnails
            this.switchScreen.call(this.mensscreen, $('#mens_red'), $('#mens_black'));
            
            // transition the men's screen in. 
            this.mensscreen.delay(300).transition({
                left: 0
            },600).addClass('seen');

        },
        resetColorSplit: function() {

            if (this.mensscreen.hasClass('seen')){
                boost.els.$screen2.removeClass('noBG');

                this.mensclone.addClass('hidden');
                this.menssidewiper.delay(100).transition({
                    width: boost.vars.winW/2 + 40
                }, 300, function() {
                    boost.colors.header.show();
                });
                this.mensexample.show().transition({
                    left: boost.vars.absLeft
                }, 400);
                this.mensscreen.transition({
                    left:'-100%'
                }, 300).removeClass('seen');
            }else{
                this.menssidewiper.delay(100).transition({
                    width:boost.vars.winW/2 + 40
                }, 300, function(){
                    boost.colors.mensexample.show();
                    boost.colors.mensclone.addClass('hidden');
                    boost.colors.header.show();
                });
                this.womensexample.transition({
                    left:boost.vars.winW/2
                },400);
                this.womensscreen.transition({
                    left:2200
                }, 300).removeClass('seen');
            }
        },
        goToWomens: function() {
            this.header.hide();

            // transition out the men's splitscreen elements.
            // this is necessary due to the structure of the diagonal splitscreen.
            this.mensclone.removeClass('hidden');
            this.mensexample.hide();
            this.menssidewiper.transition({
                width:0
            }, 400);

            // transition the women's example shoe off to the left. 
            this.womensexample.transition({
                left: -500
            },700);

            // reset the thumbnails 
            this.switchScreen.call(this.womensscreen, $('#womens_teal'), $('#womens_black'));

            // transition in the women's screen. 
            this.womensscreen.transition({
                left:0
            },650).addClass('seen');

        },

        init : function(){
            var mainImg, currentImg;
            var firstShoeFadeDuration = 200;
            boost.colors.kickoffscreen = '+='+ (boost.vars.winW - boost.vars.absLeft) + 'px';

            function paletteToggle(context, color, gender){
                var $slide = $('.' + gender + 'boost');
                var $gallery = $('#' + gender + '_' + color);

                // switch color palette indicator
                $slide.find('.color_pal').removeClass('active');
                $(context).find('span.color_pal').addClass('active');

                // switch gallery container
                $slide.find('.color_chosen').removeClass('displayed').addClass('hide');
                $gallery.removeClass('hide').addClass('displayed');

                // switch gallery thumbnail and image
                $slide.find('.shoe_large img').fadeOut(100).removeClass('currentImg');
                $gallery.find('.thumbs a').removeClass('actv').eq(0).addClass('actv');
                $gallery.find('img').eq(0).addClass('currentImg').fadeIn('fast');
            }

            // view men's boost
            $('.viewmens, .menssidewiper, .mensside').on("click", function(e) {
                boost.colors.goToMens();
                return false;
            });

            $('.backtoviewmens, .backtoviewwomens').on("click", function(e) {
                boost.colors.resetColorSplit();
                return false;
            });

            // view women's boost
            $('.viewwomens, .womensside').on("click", function(e) {
                boost.colors.goToWomens();
                return false;
            });

            // bind palette events 
            $('#mensblack').on("click", function(e) {
                paletteToggle(this, 'black', 'mens');
                return false;
            });

            $('#mensred').on("click", function(e) {
                paletteToggle(this, 'red', 'mens');          
                return false;
            });

            $('#womensblack').on("click", function(e) {
                paletteToggle(this, 'black', 'womens');
                return false;
            });

            $('#womensteal').on("click", function(e) {
                paletteToggle(this, 'teal', 'womens');
                return false
            });
            
            // construct gallery relationships
            $(".shoe_large img").each(function(index, element) {
                $(element).attr("class", 'i' + index);
            });
            $(".thumbs a").each(function(index, element) {
                $(element).attr("rel", 'i' + index);
            });
           
            // bind thumbnail events
            $('.thumbs a').click(function() {
                $(this).parent().find('a').removeClass('actv');
             
               $(this).addClass('actv');
                mainImg = $(this).attr('rel');
                if (mainImg != currentImg) {
                    $('.currentImg').fadeOut(20).removeClass('currentImg');
                    $('.' + mainImg).fadeIn(200, function() {
                        $(this).removeClass('hide').addClass('currentImg');
                    
                    }); 
                    return false;
                }
                return false;
            });

        
        }
    }; // colors {}

  
    var animate = function() {
        var ticking = false;

        // Touch stuff
        var touch = isTouch(),
            // is touch device
            touchStart = {
                x: 0,
                y: 0
            },
            scrollStart = 0,
            incrementalScrollPos = finalScrollPos = 0; // vars for touch

        /* INITIALIZE THE STYLING */
        requestAnimationFrame(move);

        // touch
        function touchStartHandler(e) {
            //e.preventDefault();
            touchStart.x = e.touches[0].pageX;
            // Store the position of finger on swipe begin:
            touchStart.y = e.touches[0].pageY;
            // Store scroll val on swipe begin:
            scrollStart = finalScrollPos;
        }

        function touchMoveHandler(e) {
            e.preventDefault();
            offset = {};
            offset.x = touchStart.x - e.touches[0].pageX;

            // Get distance finger has moved since swipe begin:
            offset.y = touchStart.y - e.touches[0].pageY;

            // Add finger move dist to original scroll value
            finalScrollPos = Math.max(0, scrollStart + offset.y);

            $('h1').html(finalScrollPos);
        }


        function isBetween(pos, min, max) {
            return (pos > min && pos < max);
        }

        function onScroll() {
            boost.pos  = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            isItTicking(function() {
                requestAnimationFrame(move);
            });
        }

        function onResize(){
            isItTicking(function(){
                boost.style.update();
                requestAnimationFrame(move);
                ticking = false;
            });
        }
 

        function isItTicking(callback) {
            if (!ticking) {
                callback();
                boost.tray.updateText();
            }
            ticking = true;
        }

        function move() {
            ticking = false;
            var pos = boost.pos;
            var bv = boost.vars;
            var winBottom = pos + boost.vars.winH;

            if (pos === 0) {
                boost.style.reset();
            }

            if (boost.els.$screen5.hasClass('inview') || winBottom >4000){
                $('.stickyfooter').addClass('hidden');
            } else {
                $('.stickyfooter').removeClass('hidden');
            }


            // Dock/Undock product pagination + CTA
            if (winBottom > 1300 && winBottom < 1600){
                if (boost.vars.productDock === false) {

                    // dock the pagination div
                    boost.els.$carouselpage.css({
                        position: 'fixed',
                        bottom: 82,
                        left: (boost.vars.winW - 121)/2
                    });

                    // if it's the first slide of the carousel, dock the CTA
                    if (boost.els.$carousel.triggerHandler('currentPage') === 0){
                        boost.els.$carouselcta.css({
                            position: 'fixed',
                            top: 'auto',
                            bottom:82,
                            right:boost.vars.absLeft
                        });
                    }

                    boost.vars.productDock = true;
                }
            } else if (boost.vars.productDock === true){
                // unock the product carousel elements. 
                boost.els.$carouselpage.css({
                    position: 'absolute'
                });

                boost.els.$carouselcta.css({
                   position: 'absolute',
                   top: 584,
                   right: 0
                });

                boost.vars.productDock = false;
            }

            // Dock/undock lookbook pagination + CTA
            if (winBottom > 2850 && winBottom < 3200){
                if (boost.vars.lookDock === false) {
                    // dock the pagination div
                    boost.els.$lookbookpage.css({
                        position: 'fixed',
                        bottom: 82,
                        left: (boost.vars.winW - 86)/2
                    });

                    // if it's the first slide of the lookbook, dock the CTA
                    if (boost.els.$lookbook.triggerHandler('currentPage') === 0){
                        boost.els.$lookbookcta.css({
                            position: 'fixed',
                            top: 'auto',
                            bottom: 82,
                            right:boost.vars.absLeft
                        });
                    }

                    boost.vars.lookDock = true;
                }
            } else if (boost.vars.lookDock === true){
                // undock everything
                boost.els.$lookbookpage.css({
                    position: 'relative',
                    bottom: 'auto',
                    left:'auto',
                    'margin': '-100px auto 0'
                });

                boost.els.$lookbookcta.css({
                   position :'absolute',
                   top:584,
                   right:0
                });

                boost.vars.lookDock = false;
            }

            // Dock the carousel arrows if the window height is small
            if (boost.vars.winH < 800) {
                if (winBottom > 1200 && winBottom < 1600){
                    $('#shoeprev, #shoenext').addClass('docked');
                }else {
                    $('#shoeprev, #shoenext').removeClass('docked');
                }

                if(winBottom > 2744 && winBottom < 3200){
                    $('#lookprev, #looknext').addClass('docked');
                }else{
                    $('#lookprev, #looknext').removeClass('docked');
                }

            }

            if (boost.els.$screen3.hasClass('inview')) {
                // automatically init the hotspots on the first lookbook slide. 
                boost.hotspot.init(boost.els.$screen3.find('#look01'));
            }

            
        } // move();

        function isTouch() {
            return 'ontouchstart' in window;
        }

        if (touch === false) {
            if (window.addEventListener){
                window.addEventListener('scroll', onScroll, false);
                window.addEventListener('resize', onResize, false);
            } else if (window.attachEvent){
                window.attachEvent('onscroll', onScroll, false);
                window.attachEvent('onresize', onResize, false);
            }
        } else {
        }
    }; // animate()

    var preloader = {
        loadOffset: 0,
        imgsLoaded: false,
        offsetsLoaded: false,
        progressbar: document.getElementById('progressbar'), // progressbar polyfill doesn't like it if this is a jQuery obj
        progressoverlay: $('#progressoverlay'),
        imgArray: [
            'img/boost-sprite.png',
            'img/globalNav.png',
            'img/ball.jpg',
            'img/splitscreenhero2.png',
            'img/hero/shoe-unskewed.png',
            'img/hero/behind_2.png',
            'img/hero/behind_3.png',
            'img/hero/behind_4.png',
            'img/shoe-slide-01.png',
            'img/shoe-slide-02.png',
            'img/shoe-slide-03-1.png',
            'img/shoe-slide-03-2.png',
            'img/shoe-slide-03-3.png',
            'img/shoe-slide-04.png'
        ],
        offSetConfig : [
            {
                name : 'balldrop',
                toggle : 'useHeroPreroll',
                val : 3
            }
        ],
        getMax: function(){
            return boost.preloader.imgArray.length + boost.preloader.loadOffset;
        },
        setOffsets: function(){
            if (boost.vars[boost.preloader.offSetConfig[0].toggle]) {
                boost.preloader.loadOffset = boost.preloader.offSetConfig[0].val;
            } else {
                boost.preloader.loadOffset = 0;
            }
            if (boost.preloader.loadOffset === 0) {
                boost.preloader.offsetsLoaded = true;
            }
        },
        init: function() {
            boost.preloader.setOffsets();

            if (boost.vars.preload === false){
                boost.preloader.progressoverlay.hide();
            }else {
                boost.preloader.progressbar.max = boost.preloader.getMax();
                boost.preloader.preload(boost.preloader.imgArray);
            }

            $.subscribe('boost.youtube.playing', function(){
                boost.preloader.offsetsLoaded = true;
                boost.preloader.finishLoader();
            });

        },
        finishLoader: function(){
            if (boost.preloader.offsetsLoaded && boost.preloader.imgsLoaded) {
                boost.preloader.progressbar.value = boost.preloader.getMax();
                boost.preloader.progressoverlay.hide();
            }
        },
        preload: function(assetArray) {
            var totalloaded = 0;
            $(assetArray).each(function() {
                $(document.createElement('img')).load(function(){
                    totalloaded++;
                    boost.preloader.progressbar.value = totalloaded;
                    if (totalloaded == boost.preloader.imgArray.length){
                        boost.preloader.imgsLoaded = true;
                        boost.preloader.finishLoader();
                    }
                }).attr('src', this.toString());
            });
        }
    }; // preloader()

    var reviews = {
        // we use handlebars.js (in plugins.js) and an inline script-tag based template file
        count : 0,
        limit : 6,
        // limit : 6,
        checked : false,
        $block : '#screen4',
        $blockDiv : 'div.tilecontainer',
        $triggerBlockPre : '#screen2',
        $triggerBlockPost : '#screen5',
        $templateBlock : '#reviewTemplate',
        trigger : true,
        sInView : false,
        showing : false,
        response : {},
        dataToUse : [],
        template : '',
        templateWork : [],
        // temp
        checkInterval : null,

        // check to see if the reviews are in view
        checkReviewView : function(){
            if (!boost.reviews.showing && !boost.reviews.checked && boost.reviews.checkInterval === null) {
                boost.reviews.checkInterval = setInterval(function(){
                    if (boost.reviews.$triggerBlockPre.hasClass('inview') || boost.reviews.$triggerBlockPost.hasClass('inview')){
                        if (boost.reviews.showing === false) {
                            boost.reviews.loadReviews();
                            clearInterval(boost.reviews.checkInterval);
                            boost.reviews.checkInterval = null;
                        }
                    }
                }, 500);
                // logic to see if the thing is inView
            }
        },

        // logic to load the reviews
        loadReviews : function(){
            boost.reviews.fetchReviews(boost.reviews.successHandler);
            boost.reviews.checked = true;
        },

        // count how many we have based on data feed response
        getCount : function(data){
            var howmany;
                howmany = data.length;
            if (howmany) {
                return howmany;
            } else {
                return 0;
            };
        },

        // jsonp callback
        successHandler : function(data){
            var br = boost.reviews;

            br.response = data;
            
            br.parseData(br, br.response);
        },

        // tags are too complicated. offloading to this thing, just because ... 
        handleTags : function(obj){
            var item = [];
            var x = 0;

            while (x < obj[0].tag.length) {
                item.push(obj[0].tag[x].label[0].text);
                x++;
            }

            return item;
        },

        // pull only the data we need from the horribly formatted json we've got
        //      so it's easier to iterate over
        getFieldsFromData : function(fields, datarow){
            var br = boost.reviews;
            var x = 0;
            var output = {};
            var item = datarow.json.articleInfo[0]; // shortcut

            if (!item) {
                return output;
            }

            while (x < fields.length){

                // if you need another field, be sure it's
                // in fieldList in getDataSets()
                // for the actual format of the json, see ./js/allin/news.json.js
                switch (fields[x]) {
                    case 'banner':
                        output[fields[x]] = item.articleImages[0].tout_1_1Image[0].path[0].text;
                        break;
                    case 'tags':
                        // this may need to be modified
                        output[fields[x]] = br.handleTags(item.tags[0].categoryTags);
                        break;
                    case 'segmentTitle':
                        output[fields[x]] = item.editorialSegmentTitle[0].tag[0].id[0].text;
                        break;
                    case 'articleTitle':
                        output[fields[x]] = item.articleTitle[0].text;
                        break;
                    default: 
                        output[fields[x]] = null;
                        break;
                }
                x++;
            }

            return output;
        },

        // Go All In urls are defined by convension
        // Take the articleId and creationDate from the Page Composer:
        // <str name="articleId">p-running-boost-unveil-gai-news</str>
        // <date name="creationDate">2013-02-12T14:49:04Z</date>
         
        // URL is created by convention:
        // discover.adidas.de/goallin/news/2013/02/p-running-boost-unveil-gai-news/
        // discover.adidas.de/goallin/news/$creationDate[0]/$creationDate[1]/{$articleId}/
        //
        // domain is another question...
        makeUrlLink : function(data){
            
            // var domain = window.location.origin; // we may need a list of market specific all in domains
            
            // var domain = 'http://www.adidas.com';
            var domain = location.origin;
            // var market = '/' + _market;
            var market = '';
            var allInPath = 'goallin/news';
            var month = data.creationDate.getMonth()+1;
            var year = data.creationDate.getFullYear();
            var articleId = data.articleId;
            var url = domain + market + '/' + allInPath + '/' + year + '/' + month + '/' + articleId + '/';

            return url;
        },

        makeUrlTags : function(){
            // var domain = window.location.origin; // we may need a list of market specific all in domains
            
            // var domain = 'http://www.adidas.com';
            var domain = location.origin;
            // var market = '/' + _market;
            var market = '';
            var allInPath = 'goallin/search';
            var url = domain + market + '/' + allInPath + '/';


            return url;
        },

        // here is step one of parsing
        // for each row that's been returned to parseData()
        // grab the appropriate fields and put them at the top level of the
        // object we will iterate over with fieldList
        getDataSets : function(dataArray){


            var br = boost.reviews;
            var data = [];
            var fieldData = {};
            var temp = {};
            var fieldList = ['banner', 'tags', 'segmentTitle', 'articleTitle'];

            if (dataArray.length > 0) {
                var x = 0;
                while (x < dataArray.length) {

                    fieldData = br.getFieldsFromData(fieldList, dataArray[x]);
                
                    if (typeof fieldData === 'object') {
                        temp = {
                            publishDate : $.timeago(dataArray[x].publishDate),      // used for UI display
                            creationDate : new Date(dataArray[x].creationDate),     // used to make URL
                            articleId : dataArray[x].articleId,                     // used to make URL
                            tridionId : dataArray[x].tridionId
                        }
                        // goallin/search/ + tagname
                        temp.allinurl = br.makeUrlLink(temp);
                        temp.tagrooturl = br.makeUrlTags();
                        $.extend(true, temp, temp, fieldData);
                    } else {
                    };
                    data.push(temp);
                    x++;
                
                }
            };

            return data;
        },

        // this is where the guts of the work is done
        //      this checks for valid data, gets a count, returns an array of all the data
        //      the array of data is a flattened version of the data so that 
        //      our template code can iterate over it nicely.
        parseData : function(br, data){
            // verify real data
            if (data.page.length && data.page.length > 0) {

                var dataSet;
                var dataObject = [];
                var outputJson = {};

                // double check data format
                if (data.page[0].data.response.docs) {
                    dataSet = data.page[0].data.response.docs;
                } else {
                    dataSet = null;
                };

                // does it look ok?
                if (dataSet !== null) {

                    br.count = br.getCount(dataSet);

                    // enforce the limit we have set
                    if (br.count > br.limit) {
                        br.count = br.limit;
                        dataSet = dataSet.slice(0, br.limit);
                    };

                    var i = 0;
                    while (i < br.count) {

                        outputJson = $.xml2json(dataSet[i].data, true);
                        dataSet[i].json = outputJson;

                        i++;
                    }

                    dataObject = br.getDataSets(dataSet);
                    
                    br.dataToUse = br.makeArticleList(dataObject);
                    br.addReviews(br.dataToUse);

                } else {
                };

            } else {
            }
        },

        // this just makes iteration easier
        makeArticleList : function(dataObject){

            var articles = {
                articles : dataObject
            }

            return articles;
        },

        // get a good environment relavent url
        getUrlByEnv: function(_market, flag){

            function baseUrl(flag){
                if (flag === 'local') {
                    return boost.vars.urls.local;
                } else if (flag === 'dev') {
                    return boost.vars.urls.dev;
                } else if (flag === 'qa') {
                    return boost.vars.urls.qa;
                } else {
                    return boost.vars.urls.prod;
                };
            };

            var urlToUse = baseUrl(flag);

            if (flag !== 'local') {
                urlToUse = urlToUse + boost.vars.urls.reviewsQuery;

                var marketToken = {
                    market: _market
                }
                urlToUse = boost.reviews.replaceCurlyTokens(urlToUse, marketToken);
            };


            return urlToUse;
        },

        // actual ajax
        fetchReviews : function(callBack){
            var br = boost.reviews;
            var urlToUse = br.getUrlByEnv(boostMarket, boost.vars.urls.flag);
            var datatype = (boost.vars.urls === 'local') ? 'json' : 'jsonp';


            $.ajax({
                url : urlToUse,
                dataType : datatype,
                success : callBack
            }).done(function(data){
                boost.reviews.showReviews();
            });

        },

        // hide / show reviews
        showReviews : function(){
            this.$block.slideDown(function(){
                boost.reviews.showing = true;
                boost.tray.buildArr();
                boost.reviews.socialData.fetch();
                boost.reviews.addInteraction();
            });
        },

        // compile the template with the parser of choice
        getCompiled : function(html){
            return Handlebars.compile(html);
        },

        // getTemplate() html and call compile
        getTemplate : function(){
            var br = boost.reviews;
            var template = br.$templateBlock.html();
                template = br.getCompiled(template);
            return template;
        },

        // a templating tool: string s, object d
        // e.g. replaceCurlyTokens("hello {place} {yourName}", { place : "world", yourName : "Rob"});
        replaceCurlyTokens: function(s, d) {
            for (var p in d) {
                s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
            }
            return s;
        },

        // add the stuff to the divs, etc.
        addReviews : function(dataToUse){
            var br = boost.reviews;
            var output = '';
            var template = this.getTemplate();

            output = template(br.dataToUse);

            br.$block.find(br.$blockDiv).html(output);
        },

        addInteraction: function() {

            $('.tagsmore').hover(function() {
                $(this).children('.moreList').show();
            }, function() {
                $(this).children('.moreList').hide();
            });
        },

        socialData : {
            fetch : function(){
                var br = boost.reviews;
                var brs = br.socialData;

                brs.brandViews();
                brs.comments();
            },
            viewsresponse : {},
            brandViews : function(){
                var br = boost.reviews;
                var brs = br.socialData;
                var dataused = br.dataToUse.articles;
    
                // borrowed from adidas.com one site "go all in"
                function comboBreaker(s_url) {
                    var time = new Date().getTime();
                    var random = Math.floor(Math.random() * 100000);

                    var str = s_url + ((s_url.indexOf('?') == -1) ? '?' : '&') + 'cachebreak=' + time + random;
                    return str;
                };

                var ids = '';
                var idarray = [];

                // collect tridion IDs and the query string data for the request
                $.each(dataused, function(i, valOf){
                    idarray.push(dataused[i].tridionId);
                    ids += ('ids[]=' + dataused[i].tridionId + '&');
                });

                ids = ids.substring(0, ids.length-1);


                // var allInDomain = 'http://www.adidas.com';
                var allInDomain = location.origin;
                // var allInDomain = 'http://hp.dev.brand.adidas.com';
                var allInPath = '/goallin';
                var viewService = '/ws/views';

                var fulluri = allInDomain + allInPath + comboBreaker(viewService) + '&' + encodeURIComponent(ids);
                var responseObjects = {};

                $.ajax({
                    url : fulluri,
                    dataType : 'json',
                    success: function(data){
                        brs.viewsresponse = data;
                    }
                }).done(function(data){

                    if (brs.viewsresponse.result) {
                        $.each(idarray, function(i){
                            try {
                                responseObjects[idarray[i]] = brs.viewsresponse.result.stories[idarray[i]]
                            } catch(e){
                                responseObjects[idarray[i]] = 0;
                            }
                        });
                    } else {
                    };


                    var $tiles = $('.tile');
                    var $item;

                    $.each(dataused, function(i){
                        $item = null;
                        $item = $tiles.find('span.views_count[rel="' + dataused[i].tridionId + '"]').find('span.numberOfViews');
                        $item.html(responseObjects[dataused[i].tridionId]);
                    });

                })

            },
            pushComments : function(data){
                var $tiles = $('.tile');
                if ($tiles.size() === data.length) {

                    $tiles.each(function(i, el){
                        $(el).find('span.numberOfComments').html(data[i]);
                    });

                } else {
                };
            },
            comments : function(){
                /* e.g.
                    http://comments.us1.gigya.com/comments.getStreamInfo?format=jsonp&sdk=js&APIKey=2_5bUiIFCM3q3I65O7j4Ybe_JGhAklhHiSHtrcK9Slez_3vIu9uO7R2-X3A-HamgHE&categoryID=news&streamID=2013%2F02%2Fp-running-boost-unveil-gai-news&callback=testCallBack
                */
                var br = boost.reviews;
                var brs = br.socialData;
                var dataused = br.dataToUse.articles;
                var commentIds = [];
                var splitter = "/news/";
                var x = 0;
                // urls
                var serviceBase = "http://comments.us1.gigya.com/comments.getStreamInfo?format=jsonp&sdk=js&APIKey=";
                var apiKey = "2_5bUiIFCM3q3I65O7j4Ybe_JGhAklhHiSHtrcK9Slez_3vIu9uO7R2-X3A-HamgHE";
                var categoryId = "&categoryID=news&";
                var streamId = "streamID=";
                var callBack = "&callback=?";
                var commentData = [];
            
                function getCommentsUrl(id){
                    var url = '';
                        url += serviceBase;
                        url += apiKey;
                        url += categoryId;
                        url += (streamId + encodeURIComponent(id.split(splitter)[1]));
                        // live example commented out
                        // url += (streamId + encodeURIComponent('2012/12/uk-p-womenstraining-jessennis-nwsartcle'));
                        url += callBack;
                    return url;
                }

                // called for every ajax response on the service. when the max number of 
                //  comment service responses are returned, then we pushComments();
                $.subscribe('boost.reviews.comments.fetched', function(e, data){


                    if (data.length === commentIds.length) {
                        boost.reviews.socialData.pushComments(data);
                    }
                })

                // for each article that came back on the reviews, fetch the corresponding comment count
                if (dataused.length > 0) {
                    // collect the ids
                    while (x < dataused.length){
                        commentIds.push(dataused[x].allinurl);
                        x++;
                    }

                    // if we have a good collection ... 
                    if (commentIds.length > 0) {

                        x = 0;
                        while (x < commentIds.length) {
                            // this will be a series of ajax calls.
                            //  for each response, we publish to announce it has finished
                            //      since we can't just call another chunk of code we want
                            //      them all so we check and wait
                            $.ajax({
                                url : getCommentsUrl(commentIds[x]),
                                dataType : 'jsonp'
                            }).done(function(data){
                                try {
                                    commentData.push(data.streamInfo.commentCount);
                                } catch (e) {
                                    commentData.push(0);
                                }
                                $.publish('boost.reviews.comments.fetched', [commentData]); // be certain an [array] is passed
                            });

                            x++;
                        }
                    } 

                } 
            }
        },
        init : function(){
            if (boost.vars.useReviews) {
                // @todo: add in logic for checking
                // if (reviewsInView || reviewTrigger) {
                // };
                this.$block = $(this.$block);
                this.$triggerBlockPre = $(this.$triggerBlockPre);
                this.$triggerBlockPost = $(this.$triggerBlockPost);
                this.$templateBlock = $(this.$templateBlock);

                this.checkReviewView();
            }
        }
    };

    // requires Modernizr yepnope loader
    var loader = (function(Modernizr){
        
        if (typeof Modernizr !== 'object') {
            return {
                init : function(){return false;}
            };
        } else {
        }

        var market = boostMarket;

        function load(fileOrArray, callback, tflocale){
            if (tflocale) {
                Modernizr.load({
                    load : 'mks/' + this.market + '/' + fileOrArray,
                    complete : callback
                });
            } else {
                Modernizr.load({
                    load : fileOrArray,
                    complete : callback
                });
            }
        }

        function loadLocalizedJS(callback){
            var callbackFn = callback || function(){};
            boost.loader.load('script.js', callbackFn, true);
        }

        function loadLocalizedCSS(callback){
            var callbackFn = callback || function(){};
            boost.loader.load('style.css', callbackFn, true);
        }

        function loadCSSFiles(fileArray, callBack){
            var callbackFn = callback || function(){};
            boost.loader.load(fileArray, callbackFn, false);
        }

        function loadJSFiles(fileArray, callback){
            var callbackFn = callback || function(){};
            boost.loader.load(fileArray, callbackFn, false);
        }

        function init (){
            // no initializing needed, really
        }

        return {
            init : init,
            market : market,
            load : load,
            loadLocalizedCSS : loadLocalizedCSS,
            loadLocalizedJS : loadLocalizedJS,
            loadCSSFiles : loadCSSFiles,
            loadJSFiles : loadJSFiles
        };

    }(Modernizr)); // bringing in same modernizr we load elsewhere
    
    var localize = {
        jsload : function(e, thisMarket){
            boost.loader.loadLocalizedJS();
        },
        cssload : function(e, thisMarket){
            boost.loader.loadLocalizedCSS();
        }
    };


    var ytubecountrycode, ccOnOff; 
    if (_market==='latin-america'){ytubecountrycode = 'es_mx';}
    else if (_market==='hk' || _market==='tw'){ytubecountrycode = 'zh_hk';}
    else if (_market==='br' || _market==='pt'){ytubecountrycode = 'pt_br';}
    else ytubecountrycode = _market;
    if (_market==='latin-america' || _market==='hk' || _market==='tw' || _market==='br' || _market==='hu' || _market==='es' || (_market==='de' && (!$.browser.msie || document.documentMode > 8)) || _market==='fr' || _market==='ru' || _market==='it'|| _market==='cz'|| _market==='pl'|| _market==='sk' || _market === 'tr'){
            ccOnOff = 1;
        }else {
         /* for those markets that don't have subtitles or non-usuable subtitle */
            ccOnOff = 0;
        }
    
    var ytiframe = {
  
 init : function(){
    var player;

    onYouTubeIframeAPIReady = function () {
        player = new YT.Player('player', {
          height: '100%',
          width: '100%',
          videoId: 'MZnAeK9l5oU',
          playerVars: { 
            'autoplay': 0, 
            'controls': 1, 
            'fs':0, 
            'rel':0, 
            'showinfo': 0, 
            'color':'white', 
            'wmode': 'transparent', 
            'cc_lang_pref': ytubecountrycode, 
            'hl' : ytubecountrycode, 
            'cc_load_policy': ccOnOff
        }
        });
    }

    function pauseVidHide(){
        $('#videoverlay').css('display', 'none');
            try{player.pauseVideo();}catch(e){};
    }

    $('#ballvideo, .watchvideo').on("click", function(){
    if ($.browser.msie && player == undefined){
        onYouTubeIframeAPIReady();
        }
        $('#videoverlay').css({
            'display': 'block', 
            'top': boost.vars.headerHeight, 
            'height': boost.vars.winH - boost.vars.headerHeight
        });   
            try{
                player.playVideo();
            }catch(e){};
    });

    $('#vid_cls').on("click", function(){
        pauseVidHide();
    });

    $(document).keyup(function(e) { /* escape keypress */
        if (e.keyCode == 27) { pauseVidHide(); }
    });
  
  return player;
    
}

};


    return {

        vars : vars,
        els : els,
        init : init,
        cache : cache,
        hotspot : hotspot,
        inView: inView,
        rAF : rAF,
        style : style,
        carousel : carousel,
        tray : tray,
        colors : colors,
        animate : animate,
        preloader : preloader,
        reviews : reviews,
        Modernizr : Modernizr,
        loader : loader,
        localize : localize,
        ytiframe : ytiframe

    };

}($boost, boost.Modernizr, __boost__env)); // /boost{}

// Document ready
$boost(function() {
    boost.init();
});
