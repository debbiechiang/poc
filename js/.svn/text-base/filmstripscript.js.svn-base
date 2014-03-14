var boost = {
	vars: {
		slideHeight: 800,
		headerHeight: 110,
		winW: $(window).width(),
		origShoePos: {
			width: 1280,
			backgroundSize:1250,
			top:100,
			left:300
		},
		origFlarePos: {
			top:100,
			left:300
		},
		blownOutShoePos:{
			backgroundSize:2200,
			height:1600,
			width:2200,
			top: -700,
			left: -600
		},
		blownOutFlarePos: {
			top: -120,
			left: 0
		}
	},
	// Init func
	init : function () {
		boost.rAF();
		boost.style();
		boost.carousel();
		boost.initboosthotspots();
	},
	poxIn: function($container) {
		console.log($container);
		var $hotspotArray = $container.children('.boosths');

		for (var i = 0; i < $hotspotArray.length; i++){
			$hotspotArray.eq(i).show().delay(500);
		}
	},
	rAF: function(){ 
	/**
	 * Provides requestAnimationFrame in a cross browser way.
	 * @author paulirish / http://paulirish.com/
	 */
		if ( !window.requestAnimationFrame ) {
		 
			window.requestAnimationFrame = ( function() {
		 
				return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
		 
					window.setTimeout( callback, 1000 / 60 );
		 
				};
		 
			} )();
		 
		}
	},
	style: function() {
				//boost.vars.winW = $(window).width(); // move this to the onResize call maybe

		$('.slide').css({
			'width': boost.vars.winW
		})
	},


	// Carousel
	carousel: function(){
		// TODO: Abstract these shoe animations into separate functions
		// they're basically the same array shifted over by one for next and prev direction
		// or else they'll have to be repeated for all inputs! (click, pagination, wipe, keyboard)
		// pagination might be separate because you are going in any which direction 
		// (have to check for state of .wiperight scrim, .graydient background.)
		$('.carousel').carouFredSel({
			height:  800,
			align:'left',
			auto:  { 
				play:false
			}, 
			items: {
				visible:1
			},
			prev: {
				button: $('.prev'), 
				fx: 'scroll',
				duration:400,
				onBefore: function() {
					$(window).scrollTo('#screen1');
					$('.slide .boosths').hide();
					var goingTo = $('.carousel').triggerHandler('currentPage');
					switch (goingTo){
						case 0:
							if ($('.cloneholder02').children('.hero').length){
								$('.cloneholder02').addClass('hidden');
								$('.shoe01').removeClass('hidden');
							}
							$('.shoe01').children('#hero00, #hero01, #hero02, #hero03').animate(boost.vars.origFlarePos, 800);
							$('.shoe01').children('#heroshoe').animate(boost.vars.origShoePos, 800);
							break;
						case 1:								
								$('#screen1').addClass('slideshowView');
								$('#hero00, #hero01, #hero02, #hero03').css(boost.vars.blownOutFlarePos, 800);
								$('#heroshoe').css(boost.vars.blownOutShoePos, 800);
							break;
						case 2:
							break;
						case 3:

							break;
						case 4:

							break;
						case 5:

							$('#screen1').addClass('graydient');
							break;

					}
				},
				onAfter: function() {
					var goingTo = $('.carousel').triggerHandler('currentPage');
					console.log($('.carousel').triggerHandler('currentPage'));

					switch (goingTo){
						case 0:
							var $thisSlide = $('#slide01');
							//$('#caption01').fadeIn();
							break;
						case 1:
							var $thisSlide = $('#slide02');
							$('.shoe01').removeClass('hidden');
							$('.graydient').removeClass('graydient');
							break;
						case 2:
							var $thisSlide = $('#slide03');

							break;
						case 3:
							var $thisSlide = $('#slide04');

							break;
						case 4:
							var $thisSlide = $('#slide05');

							break;
						case 5:
							var $thisSlide = $('#slide06');
							$('.shoe01').addClass('hidden');
							break;

					}

				}
			},
			next: {
				button:$('.next'), 
				fx: 'scroll',
				duration: 400,
				onBefore: function() {
					var goingTo = $('.carousel').triggerHandler('currentPage');
					console.log('goingTo ' + goingTo);
					switch (goingTo){
						case 0:
							$('.graydient').removeClass('graydient');
							$('.shoe01').children('#hero00, #hero01, #hero02, #hero03').css(boost.vars.origFlarePos);
							$('.shoe01').children('#heroshoe').css(boost.vars.origShoePos);

							break;
						case 1:
								$('#screen1').addClass('slideshowView');
								
									$('.shoe01').children('#hero00, #hero01, #hero02, #hero03').animate(boost.vars.blownOutFlarePos, 1000, 'easeOutCubic');
									$('.shoe01').children('#heroshoe').animate(boost.vars.blownOutShoePos, 1000, 'easeOutCubic');

							break;
						case 2:
							$('.cloneholder02').addClass('hidden');
						
						case 3:

							break;
						case 4:
						
							break;
						case 5:
							
							break;

					}
				},
				onAfter: function() {
					var goingTo = $('.carousel').triggerHandler('currentPage');
					console.log('goingTo: '+goingTo);

					switch (goingTo){
						case 0:
						//$('#caption01').fadeIn(800);
							
							$('.shoe01').removeClass('hidden');
							break;
						case 1:
							if (!$('.cloneholder02').children('.hero').length){
								var clone = $('.shoe01').html();
								$('.cloneholder02').append(clone);
								$('.cloneholder02').children().css(boost.vars.blownOutFlarePos);
								$('.cloneholder02').children('#heroshoe').css(boost.vars.blownOutShoePos);
								$('.cloneholder02').show();
								//$('.shoe01').children('#hero00, #hero01, #hero02, #hero03').css(boost.vars.origFlarePos).hide();
								//$('.shoe01').children('#heroshoe').css(boost.vars.origShoePos).hide();
								}else {$('.cloneholder02').removeClass('hidden')}
							$('.shoe01').addClass('hidden');
							break;
						case 2: 
							var $thisSlide = $('#slide03');
							$('.shoe01').addClass('hidden');

							$('#screen1').addClass('graydient');
							$thisSlide.children('.slidehero').css({
								bottom: 30
							}, 400, function() {$thisSlide.children('.caption').fadeIn(1000);
							})

														$('.shoe01').addClass('hidden');
							break;
						case 3:
						
							break;
						case 4:
							

							break;
						case 5:
							

					}
				}

			}, 

			pagination: {
				container: $('.pagination'), 
				anchorBuilder: function(nr, item) {
					    return '<a href="#'+nr+'">&nbsp;</a>'; 
					}
			}

		}, {
			classnames: {
				selected: 'active',
				disabled: 'inactive'
			}
		});
	},

	/* hotspot */
	initboosthotspots : function (){
   		$('.boosths').each(function() {
	        var pop_classes = $(this).attr("class");
	        
	        $(this).addClass("hs_flag");

	        $(this).wrap('<div class="boosths" />');
	        
	        $(".hs_flag").attr("class", "hs_flag");
       
     		});
 		 	   
     
		    var totalpops = $('.boosths').size() + 100;
		    $('.boosths').each(function(i) {
		     var popzindex = totalpops - i;
		     $(this).css({ zIndex: popzindex });
		    });
		    
		    $(".hs_cta").click(function(){
		      $(this).closest('.boosths').toggleClass("active");
		    });
	}


	/* Men's and Women's Boost */

	

}; // /boost{}


// Document ready

$(function() {
	boost.init();


});