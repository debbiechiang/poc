// TABLE OF CONTENTS
// 1. CarouFredSel
  /// -----------+> note this copy of CarouFredSel is hacked to use $boost
// 2. jQuery Tiny Pub/Sub
// 3. HTML5 Progress polyfill
// 4. handlebars.js
// 5. backgroundResize.js
// 6. jquery.xml2json.js
// 7. jquery.timeago.js
// 8. jquery scrollto.js
// 9. jquery inview.js
// 10. jquery transit.js
// 11. boost.noconflict.js
// 12. jQuery easing.js

/*
 *  jQuery carouFredSel 6.1.0
 *  Demo's and documentation:
 *  caroufredsel.frebsite.nl
 *
 *  Copyright (c) 2012 Fred Heusschen
 *  www.frebsite.nl
 *
 *  Dual licensed under the MIT and GPL licenses.
 *  http://en.wikipedia.org/wiki/MIT_License
 *  http://en.wikipedia.org/wiki/GNU_General_Public_License
 */


(function($) {


  //  LOCAL

  if ( $.fn.carouFredSel )
  {
    return;
  }

  $.fn.caroufredsel = $.fn.carouFredSel = function(options, configs)
  {

    //  no element
    if (this.length == 0)
    {
      debug( true, 'No element found for "' + this.selector + '".' );
      return this;
    }

    //  multiple elements
    if (this.length > 1)
    {
      return this.each(function() {
        $(this).carouFredSel(options, configs);
      });
    }


    var $cfs = this,
      $tt0 = this[0],
      starting_position = false;

    if ($cfs.data('_cfs_isCarousel'))
    {
      starting_position = $cfs.triggerHandler('_cfs_triggerEvent', 'currentPosition');
      $cfs.trigger('_cfs_triggerEvent', ['destroy', true]);
    }


    $cfs._cfs_init = function(o, setOrig, start)
    {
      o = go_getObject($tt0, o);

      o.items = go_getItemsObject($tt0, o.items);
      o.scroll = go_getScrollObject($tt0, o.scroll);
      o.auto = go_getAutoObject($tt0, o.auto);
      o.prev = go_getPrevNextObject($tt0, o.prev);
      o.next = go_getPrevNextObject($tt0, o.next);
      o.pagination = go_getPaginationObject($tt0, o.pagination);
      o.swipe = go_getSwipeObject($tt0, o.swipe);
      o.mousewheel = go_getMousewheelObject($tt0, o.mousewheel);

      if (setOrig)
      {
        opts_orig = $.extend(true, {}, $.fn.carouFredSel.defaults, o);
      }

      opts = $.extend(true, {}, $.fn.carouFredSel.defaults, o);
      opts.d = cf_getDimensions(opts);

      crsl.direction = (opts.direction == 'up' || opts.direction == 'left') ? 'next' : 'prev';

      var a_itm = $cfs.children(),
        avail_primary = ms_getParentSize($wrp, opts, 'width');

      if (is_true(opts.cookie))
      {
        opts.cookie = 'caroufredsel_cookie_' + conf.serialNumber;
      }

      opts.maxDimension = ms_getMaxDimension(opts, avail_primary);

      //  complement items and sizes
      opts.items = in_complementItems(opts.items, opts, a_itm, start);
      opts[opts.d['width']] = in_complementPrimarySize(opts[opts.d['width']], opts, a_itm);
      opts[opts.d['height']] = in_complementSecondarySize(opts[opts.d['height']], opts, a_itm);

      //  primary size not set for a responsive carousel
      if (opts.responsive)
      {
        if (!is_percentage(opts[opts.d['width']]))
        {
          opts[opts.d['width']] = '100%';
        }
      }

      //  primary size is percentage
      if (is_percentage(opts[opts.d['width']]))
      {
        crsl.upDateOnWindowResize = true;
        crsl.primarySizePercentage = opts[opts.d['width']];
        opts[opts.d['width']] = ms_getPercentage(avail_primary, crsl.primarySizePercentage);
        if (!opts.items.visible)
        {
          opts.items.visibleConf.variable = true;
        }
      }

      if (opts.responsive)
      {
        opts.usePadding = false;
        opts.padding = [0, 0, 0, 0];
        opts.align = false;
        opts.items.visibleConf.variable = false;
      }
      else
      {
        //  visible-items not set
        if (!opts.items.visible)
        {
          opts = in_complementVisibleItems(opts, avail_primary);
        }

        //  primary size not set -> calculate it or set to "variable"
        if (!opts[opts.d['width']])
        {
          if (!opts.items.visibleConf.variable && is_number(opts.items[opts.d['width']]) && opts.items.filter == '*')
          {
            opts[opts.d['width']] = opts.items.visible * opts.items[opts.d['width']];
            opts.align = false;
          }
          else
          {
            opts[opts.d['width']] = 'variable';
          }
        }
        //  align not set -> set to center if primary size is number
        if (is_undefined(opts.align))
        {
          opts.align = (is_number(opts[opts.d['width']]))
            ? 'center'
            : false;
        }
        //  set variabe visible-items
        if (opts.items.visibleConf.variable)
        {
          opts.items.visible = gn_getVisibleItemsNext(a_itm, opts, 0);
        }
      }

      //  set visible items by filter
      if (opts.items.filter != '*' && !opts.items.visibleConf.variable)
      {
        opts.items.visibleConf.org = opts.items.visible;
        opts.items.visible = gn_getVisibleItemsNextFilter(a_itm, opts, 0);
      }

      opts.items.visible = cf_getItemsAdjust(opts.items.visible, opts, opts.items.visibleConf.adjust, $tt0);
      opts.items.visibleConf.old = opts.items.visible;

      if (opts.responsive)
      {
        if (!opts.items.visibleConf.min)
        {
          opts.items.visibleConf.min = opts.items.visible;
        }
        if (!opts.items.visibleConf.max)
        {
          opts.items.visibleConf.max = opts.items.visible;
        }
        opts = in_getResponsiveValues(opts, a_itm, avail_primary);
      }
      else
      {
        opts.padding = cf_getPadding(opts.padding);

        if (opts.align == 'top')
        {
          opts.align = 'left';
        }
        else if (opts.align == 'bottom')
        {
          opts.align = 'right';
        }

        switch (opts.align)
        {
          //  align: center, left or right
          case 'center':
          case 'left':
          case 'right':
            if (opts[opts.d['width']] != 'variable')
            {
              opts = in_getAlignPadding(opts, a_itm);
              opts.usePadding = true;
            }
            break;

          //  padding
          default:
            opts.align = false;
            opts.usePadding = (
              opts.padding[0] == 0 && 
              opts.padding[1] == 0 && 
              opts.padding[2] == 0 && 
              opts.padding[3] == 0
            ) ? false : true;
            break;
        }
      }

      if (!is_number(opts.scroll.duration))
      {
        opts.scroll.duration = 500;
      }
      if (is_undefined(opts.scroll.items))
      {
        opts.scroll.items = (opts.responsive || opts.items.visibleConf.variable || opts.items.filter != '*') 
          ? 'visible'
          : opts.items.visible;
      }

      opts.auto = $.extend(true, {}, opts.scroll, opts.auto);
      opts.prev = $.extend(true, {}, opts.scroll, opts.prev);
      opts.next = $.extend(true, {}, opts.scroll, opts.next);
      opts.pagination = $.extend(true, {}, opts.scroll, opts.pagination);
      //  swipe and mousewheel extend later on, per direction

      opts.auto = go_complementAutoObject($tt0, opts.auto);
      opts.prev = go_complementPrevNextObject($tt0, opts.prev);
      opts.next = go_complementPrevNextObject($tt0, opts.next);
      opts.pagination = go_complementPaginationObject($tt0, opts.pagination);
      opts.swipe = go_complementSwipeObject($tt0, opts.swipe);
      opts.mousewheel = go_complementMousewheelObject($tt0, opts.mousewheel);

      if (opts.synchronise)
      {
        opts.synchronise = cf_getSynchArr(opts.synchronise);
      }


      //  DEPRECATED
      if (opts.auto.onPauseStart)
      {
        opts.auto.onTimeoutStart = opts.auto.onPauseStart;
        deprecated('auto.onPauseStart', 'auto.onTimeoutStart');
      }
      if (opts.auto.onPausePause)
      {
        opts.auto.onTimeoutPause = opts.auto.onPausePause;
        deprecated('auto.onPausePause', 'auto.onTimeoutPause');
      }
      if (opts.auto.onPauseEnd)
      {
        opts.auto.onTimeoutEnd = opts.auto.onPauseEnd;
        deprecated('auto.onPauseEnd', 'auto.onTimeoutEnd');
      }
      if (opts.auto.pauseDuration)
      {
        opts.auto.timeoutDuration = opts.auto.pauseDuration;
        deprecated('auto.pauseDuration', 'auto.timeoutDuration');
      }
      //  /DEPRECATED


    };  //  /init


    $cfs._cfs_build = function() {
      $cfs.data('_cfs_isCarousel', true);

      var a_itm = $cfs.children(),
        orgCSS = in_mapCss($cfs, ['textAlign', 'float', 'position', 'top', 'right', 'bottom', 'left', 'zIndex', 'width', 'height', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft']),
        newPosition = 'relative';

      switch (orgCSS.position)
      {
        case 'absolute':
        case 'fixed':
          newPosition = orgCSS.position;
          break;
      }

      $wrp.css(orgCSS).css({
        'overflow'    : 'hidden',
        'position'    : newPosition
      });

      $cfs.data('_cfs_origCss', orgCSS).css({
        'textAlign'   : 'left',
        'float'     : 'none',
        'position'    : 'absolute',
        'top'     : 0,
        'right'     : 'auto',
        'bottom'    : 'auto',
        'left'      : 0,
        'marginTop'   : 0,
        'marginRight' : 0,
        'marginBottom'  : 0,
        'marginLeft'  : 0
      });

      sz_storeMargin(a_itm, opts);
      sz_storeSizes(a_itm, opts);
      if (opts.responsive)
      {
        sz_setResponsiveSizes(opts, a_itm);
      }

    };  //  /build


    $cfs._cfs_bind_events = function() {
      $cfs._cfs_unbind_events();


      //  stop event
      $cfs.bind(cf_e('stop', conf), function(e, imm) {
        e.stopPropagation();

        //  button
        if (!crsl.isStopped)
        {
          if (opts.auto.button)
          {
            opts.auto.button.addClass(cf_c('stopped', conf));
          }
        }

        //  set stopped
        crsl.isStopped = true;

        if (opts.auto.play)
        {
          opts.auto.play = false;
          $cfs.trigger(cf_e('pause', conf), imm);
        }
        return true;
      });


      //  finish event
      $cfs.bind(cf_e('finish', conf), function(e) {
        e.stopPropagation();
        if (crsl.isScrolling)
        {
          sc_stopScroll(scrl);
        }
        return true;
      });


      //  pause event
      $cfs.bind(cf_e('pause', conf), function(e, imm, res) {
        e.stopPropagation();
        tmrs = sc_clearTimers(tmrs);

        //  immediately pause
        if (imm && crsl.isScrolling)
        {
          scrl.isStopped = true;
          var nst = getTime() - scrl.startTime;
          scrl.duration -= nst;
          if (scrl.pre)
          {
            scrl.pre.duration -= nst;
          }
          if (scrl.post)
          {
            scrl.post.duration -= nst;
          }
          sc_stopScroll(scrl, false);
        }

        //  update remaining pause-time
        if (!crsl.isPaused && !crsl.isScrolling)
        {
          if (res)
          {
            tmrs.timePassed += getTime() - tmrs.startTime;
          }
        }

        //  button
        if (!crsl.isPaused)
        {
          if (opts.auto.button)
          {
            opts.auto.button.addClass(cf_c('paused', conf));
          }
        }

        //  set paused
        crsl.isPaused = true;

        //  pause pause callback
        if (opts.auto.onTimeoutPause)
        {
          var dur1 = opts.auto.timeoutDuration - tmrs.timePassed,
            perc = 100 - Math.ceil( dur1 * 100 / opts.auto.timeoutDuration );

          opts.auto.onTimeoutPause.call($tt0, perc, dur1);
        }
        return true;
      });


      //  play event
      $cfs.bind(cf_e('play', conf), function(e, dir, del, res) {
        e.stopPropagation();
        tmrs = sc_clearTimers(tmrs);

        //  sort params
        var v = [dir, del, res],
          t = ['string', 'number', 'boolean'],
          a = cf_sortParams(v, t);

        dir = a[0];
        del = a[1];
        res = a[2];

        if (dir != 'prev' && dir != 'next')
        {
          dir = crsl.direction;
        }
        if (!is_number(del))
        {
          del = 0;
        }
        if (!is_boolean(res))
        {
          res = false;
        }

        //  stopped?
        if (res)
        {
          crsl.isStopped = false;
          opts.auto.play = true;
        }
        if (!opts.auto.play)
        {
          e.stopImmediatePropagation();
          return debug(conf, 'Carousel stopped: Not scrolling.');
        }

        //  button
        if (crsl.isPaused)
        {
          if (opts.auto.button)
          {
            opts.auto.button.removeClass(cf_c('stopped', conf));
            opts.auto.button.removeClass(cf_c('paused', conf));
          }
        }

        //  set playing
        crsl.isPaused = false;
        tmrs.startTime = getTime();

        //  timeout the scrolling
        var dur1 = opts.auto.timeoutDuration + del;
          dur2 = dur1 - tmrs.timePassed;
          perc = 100 - Math.ceil(dur2 * 100 / dur1);

        if (opts.auto.progress)
        {
          tmrs.progress = setInterval(function() {
            var pasd = getTime() - tmrs.startTime + tmrs.timePassed,
              perc = Math.ceil(pasd * 100 / dur1);
            opts.auto.progress.updater.call(opts.auto.progress.bar[0], perc);
          }, opts.auto.progress.interval);
        }

        tmrs.auto = setTimeout(function() {
          if (opts.auto.progress)
          {
            opts.auto.progress.updater.call(opts.auto.progress.bar[0], 100);
          }
          if (opts.auto.onTimeoutEnd)
          {
            opts.auto.onTimeoutEnd.call($tt0, perc, dur2);
          }
          if (crsl.isScrolling)
          {
            $cfs.trigger(cf_e('play', conf), dir);
          }
          else
          {
            $cfs.trigger(cf_e(dir, conf), opts.auto);
          }
        }, dur2);

        //  pause start callback
        if (opts.auto.onTimeoutStart)
        {
          opts.auto.onTimeoutStart.call($tt0, perc, dur2);
        }

        return true;
      });


      //  resume event
      $cfs.bind(cf_e('resume', conf), function(e) {
        e.stopPropagation();
        if (scrl.isStopped)
        {
          scrl.isStopped = false;
          crsl.isPaused = false;
          crsl.isScrolling = true;
          scrl.startTime = getTime();
          sc_startScroll(scrl);
        }
        else
        {
          $cfs.trigger(cf_e('play', conf));
        }
        return true;
      });


      //  prev + next events
      $cfs.bind(cf_e('prev', conf)+' '+cf_e('next', conf), function(e, obj, num, clb, que) {
        e.stopPropagation();

        //  stopped or hidden carousel, don't scroll, don't queue
        if (crsl.isStopped || $cfs.is(':hidden'))
        {
          e.stopImmediatePropagation();
          return debug(conf, 'Carousel stopped or hidden: Not scrolling.');
        }

        //  not enough items
        var minimum = (is_number(opts.items.minimum)) ? opts.items.minimum : opts.items.visible + 1;
        if (minimum > itms.total)
        {
          e.stopImmediatePropagation();
          return debug(conf, 'Not enough items ('+itms.total+' total, '+minimum+' needed): Not scrolling.');
        }

        //  get config
        var v = [obj, num, clb, que],
          t = ['object', 'number/string', 'function', 'boolean'],
          a = cf_sortParams(v, t);

        obj = a[0];
        num = a[1];
        clb = a[2];
        que = a[3];

        var eType = e.type.slice(conf.events.prefix.length);

        if (!is_object(obj))
        {
          obj = {};
        }
        if (is_function(clb))
        {
          obj.onAfter = clb;
        }
        if (is_boolean(que))
        {
          obj.queue = que;
        }
        obj = $.extend(true, {}, opts[eType], obj);

        //  test conditions callback
        if (obj.conditions && !obj.conditions.call($tt0, eType))
        {
          e.stopImmediatePropagation();
          return debug(conf, 'Callback "conditions" returned false.');
        }

        if (!is_number(num))
        {
          if (opts.items.filter != '*')
          {
            num = 'visible';
          }
          else
          {
            var arr = [num, obj.items, opts[eType].items];
            for (var a = 0, l = arr.length; a < l; a++)
            {
              if (is_number(arr[a]) || arr[a] == 'page' || arr[a] == 'visible') {
                num = arr[a];
                break;
              }
            }
          }
          switch(num) {
            case 'page':
              e.stopImmediatePropagation();
              return $cfs.triggerHandler(cf_e(eType+'Page', conf), [obj, clb]);
              break;

            case 'visible':
              if (!opts.items.visibleConf.variable && opts.items.filter == '*')
              {
                num = opts.items.visible;
              }
              break;
          }
        }

        //  resume animation, add current to queue
        if (scrl.isStopped)
        {
          $cfs.trigger(cf_e('resume', conf));
          $cfs.trigger(cf_e('queue', conf), [eType, [obj, num, clb]]);
          e.stopImmediatePropagation();
          return debug(conf, 'Carousel resumed scrolling.');
        }

        //  queue if scrolling
        if (obj.duration > 0)
        {
          if (crsl.isScrolling)
          {
            if (obj.queue)
            {
              if (obj.queue == 'last')
              {
                queu = [];
              }
              if (obj.queue != 'first' || queu.length == 0)
              {
                $cfs.trigger(cf_e('queue', conf), [eType, [obj, num, clb]]);
              }
            }
            e.stopImmediatePropagation();
            return debug(conf, 'Carousel currently scrolling.');
          }
        }

        tmrs.timePassed = 0;
        $cfs.trigger(cf_e('slide_'+eType, conf), [obj, num]);

        //  synchronise
        if (opts.synchronise)
        {
          var s = opts.synchronise,
            c = [obj, num];

          for (var j = 0, l = s.length; j < l; j++) {
            var d = eType;
            if (!s[j][2])
            {
              d = (d == 'prev') ? 'next' : 'prev';
            }
            if (!s[j][1])
            {
              c[0] = s[j][0].triggerHandler('_cfs_triggerEvent', ['configuration', d]);
            }
            c[1] = num + s[j][3];
            s[j][0].trigger('_cfs_triggerEvent', ['slide_'+d, c]);
          }
        }
        return true;
      });


      //  prev event
      $cfs.bind(cf_e('slide_prev', conf), function(e, sO, nI) {
        e.stopPropagation();
        var a_itm = $cfs.children();

        //  non-circular at start, scroll to end
        if (!opts.circular)
        {
          if (itms.first == 0)
          {
            if (opts.infinite)
            {
              $cfs.trigger(cf_e('next', conf), itms.total-1);
            }
            return e.stopImmediatePropagation();
          }
        }

        sz_resetMargin(a_itm, opts);

        //  find number of items to scroll
        if (!is_number(nI))
        {
          if (opts.items.visibleConf.variable)
          {
            nI = gn_getVisibleItemsPrev(a_itm, opts, itms.total-1);
          }
          else if (opts.items.filter != '*')
          {
            var xI = (is_number(sO.items)) ? sO.items : gn_getVisibleOrg($cfs, opts);
            nI = gn_getScrollItemsPrevFilter(a_itm, opts, itms.total-1, xI);
          }
          else
          {
            nI = opts.items.visible;
          }
          nI = cf_getAdjust(nI, opts, sO.items, $tt0);
        }

        //  prevent non-circular from scrolling to far
        if (!opts.circular)
        {
          if (itms.total - nI < itms.first)
          {
            nI = itms.total - itms.first;
          }
        }

        //  set new number of visible items
        opts.items.visibleConf.old = opts.items.visible;
        if (opts.items.visibleConf.variable)
        {
          var vI = cf_getItemsAdjust(gn_getVisibleItemsNext(a_itm, opts, itms.total-nI), opts, opts.items.visibleConf.adjust, $tt0);
          if (opts.items.visible+nI <= vI && nI < itms.total)
          {
            nI++;
            vI = cf_getItemsAdjust(gn_getVisibleItemsNext(a_itm, opts, itms.total-nI), opts, opts.items.visibleConf.adjust, $tt0);
          }
          opts.items.visible = vI;
        }
        else if (opts.items.filter != '*')
        {
          var vI = gn_getVisibleItemsNextFilter(a_itm, opts, itms.total-nI);
          opts.items.visible = cf_getItemsAdjust(vI, opts, opts.items.visibleConf.adjust, $tt0);
        }

        sz_resetMargin(a_itm, opts, true);

        //  scroll 0, don't scroll
        if (nI == 0)
        {
          e.stopImmediatePropagation();
          return debug(conf, '0 items to scroll: Not scrolling.');
        }
        debug(conf, 'Scrolling '+nI+' items backward.');


        //  save new config
        itms.first += nI;
        while (itms.first >= itms.total)
        {
          itms.first -= itms.total;
        }

        //  non-circular callback
        if (!opts.circular)
        {
          if (itms.first == 0 && sO.onEnd)
          {
            sO.onEnd.call($tt0, 'prev');
          }
          if (!opts.infinite)
          {
            nv_enableNavi(opts, itms.first, conf);
          }
        }

        //  rearrange items
        $cfs.children().slice(itms.total-nI, itms.total).prependTo($cfs);
        if (itms.total < opts.items.visible + nI)
        {
          $cfs.children().slice(0, (opts.items.visible+nI)-itms.total).clone(true).appendTo($cfs);
        }

        //  the needed items
        var a_itm = $cfs.children(),
          i_old = gi_getOldItemsPrev(a_itm, opts, nI),
          i_new = gi_getNewItemsPrev(a_itm, opts),
          i_cur_l = a_itm.eq(nI-1),
          i_old_l = i_old.last(),
          i_new_l = i_new.last();

        sz_resetMargin(a_itm, opts);

        var pL = 0,
          pR = 0;

        if (opts.align)
        {
          var p = cf_getAlignPadding(i_new, opts);
          pL = p[0];
          pR = p[1];
        }
        var oL = (pL < 0) ? opts.padding[opts.d[3]] : 0;

        //  hide items for fx directscroll
        var hiddenitems = false,
          i_skp = $();
        if (opts.items.visible < nI)
        {
          i_skp = a_itm.slice(opts.items.visibleConf.old, nI);
          if (sO.fx == 'directscroll')
          {
            var orgW = opts.items[opts.d['width']];
            hiddenitems = i_skp;
            i_cur_l = i_new_l;
            sc_hideHiddenItems(hiddenitems);
            opts.items[opts.d['width']] = 'variable';
          }
        }

        //  save new sizes
        var $cf2 = false,
          i_siz = ms_getTotalSize(a_itm.slice(0, nI), opts, 'width'),
          w_siz = cf_mapWrapperSizes(ms_getSizes(i_new, opts, true), opts, !opts.usePadding),
          i_siz_vis = 0,
          a_cfs = {},
          a_wsz = {},
          a_cur = {},
          a_old = {},
          a_new = {},
          a_lef = {},
          a_lef_vis = {},
          a_dur = sc_getDuration(sO, opts, nI, i_siz);

        switch(sO.fx)
        {
          case 'cover':
          case 'cover-fade':
            i_siz_vis = ms_getTotalSize(a_itm.slice(0, opts.items.visible), opts, 'width');
            break;
        }

        if (hiddenitems)
        {
          opts.items[opts.d['width']] = orgW;
        }

        sz_resetMargin(a_itm, opts, true);
        if (pR >= 0)
        {
          sz_resetMargin(i_old_l, opts, opts.padding[opts.d[1]]);
        }
        if (pL >= 0)
        {
          sz_resetMargin(i_cur_l, opts, opts.padding[opts.d[3]]);
        }

        if (opts.align)
        {
          opts.padding[opts.d[1]] = pR;
          opts.padding[opts.d[3]] = pL;
        }

        a_lef[opts.d['left']] = -(i_siz - oL);
        a_lef_vis[opts.d['left']] = -(i_siz_vis - oL);
        a_wsz[opts.d['left']] = w_siz[opts.d['width']];

        //  scrolling functions
        var _s_wrapper = function() {},
          _a_wrapper = function() {},
          _s_paddingold = function() {},
          _a_paddingold = function() {},
          _s_paddingnew = function() {},
          _a_paddingnew = function() {},
          _s_paddingcur = function() {},
          _a_paddingcur = function() {},
          _onafter = function() {},
          _moveitems = function() {},
          _position = function() {};

        //  clone carousel
        switch(sO.fx)
        {
          case 'crossfade':
          case 'cover':
          case 'cover-fade':
          case 'uncover':
          case 'uncover-fade':
            $cf2 = $cfs.clone(true).appendTo($wrp);
            break;
        }
        switch(sO.fx)
        {
          case 'crossfade':
          case 'uncover':
          case 'uncover-fade':
            $cf2.children().slice(0, nI).remove();
            $cf2.children().slice(opts.items.visibleConf.old).remove();
            break;

          case 'cover':
          case 'cover-fade':
            $cf2.children().slice(opts.items.visible).remove();
            $cf2.css(a_lef_vis);
            break;
        }

        $cfs.css(a_lef);

        //  reset all scrolls
        scrl = sc_setScroll(a_dur, sO.easing);

        //  animate / set carousel
        a_cfs[opts.d['left']] = (opts.usePadding) ? opts.padding[opts.d[3]] : 0;

        //  animate / set wrapper
        if (opts[opts.d['width']] == 'variable' || opts[opts.d['height']] == 'variable')
        {
          _s_wrapper = function() {
            $wrp.css(w_siz);
          };
          _a_wrapper = function() {
            scrl.anims.push([$wrp, w_siz]);
          };
        }

        //  animate / set items
        if (opts.usePadding)
        {
          if (i_new_l.not(i_cur_l).length)
          {
            a_cur[opts.d['marginRight']] = i_cur_l.data('_cfs_origCssMargin');

            if (pL < 0)
            {
              i_cur_l.css(a_cur);
            }
            else
            {
              _s_paddingcur = function() {
                i_cur_l.css(a_cur);
              };
              _a_paddingcur = function() {
                scrl.anims.push([i_cur_l, a_cur]);
              };
            }
          }
          switch(sO.fx)
          {
            case 'cover':
            case 'cover-fade':
              $cf2.children().eq(nI-1).css(a_cur);
              break;
          }

          if (i_new_l.not(i_old_l).length)
          {
            a_old[opts.d['marginRight']] = i_old_l.data('_cfs_origCssMargin');
            _s_paddingold = function() {
              i_old_l.css(a_old);
            };
            _a_paddingold = function() {
              scrl.anims.push([i_old_l, a_old]);
            };
          }

          if (pR >= 0)
          {
            a_new[opts.d['marginRight']] = i_new_l.data('_cfs_origCssMargin') + opts.padding[opts.d[1]];
            _s_paddingnew = function() {
              i_new_l.css(a_new);
            };
            _a_paddingnew = function() {
              scrl.anims.push([i_new_l, a_new]);
            };
          }
        }

        //  set position
        _position = function() {
          $cfs.css(a_cfs);
        };


        var overFill = opts.items.visible+nI-itms.total;

        //  rearrange items
        _moveitems = function() {
          if (overFill > 0)
          {
            $cfs.children().slice(itms.total).remove();
            i_old = $( $cfs.children().slice(itms.total-(opts.items.visible-overFill)).get().concat( $cfs.children().slice(0, overFill).get() ) );
          }
          sc_showHiddenItems(hiddenitems);

          if (opts.usePadding)
          {
            var l_itm = $cfs.children().eq(opts.items.visible+nI-1);
            l_itm.css(opts.d['marginRight'], l_itm.data('_cfs_origCssMargin'));
          }
        };


        var cb_arguments = sc_mapCallbackArguments(i_old, i_skp, i_new, nI, 'prev', a_dur, w_siz);

        //  fire onAfter callbacks
        _onafter = function() {
          sc_afterScroll($cfs, $cf2, sO);
          crsl.isScrolling = false;
          clbk.onAfter = sc_fireCallbacks($tt0, sO, 'onAfter', cb_arguments, clbk);
          queu = sc_fireQueue($cfs, queu, conf);

          if (!crsl.isPaused)
          {
            $cfs.trigger(cf_e('play', conf));
          }
        };

        //  fire onBefore callback
        crsl.isScrolling = true;
        tmrs = sc_clearTimers(tmrs);
        clbk.onBefore = sc_fireCallbacks($tt0, sO, 'onBefore', cb_arguments, clbk);

        switch(sO.fx)
        {
          case 'none':
            $cfs.css(a_cfs);
            _s_wrapper();
            _s_paddingold();
            _s_paddingnew();
            _s_paddingcur();
            _position();
            _moveitems();
            _onafter();
            break;

          case 'fade':
            scrl.anims.push([$cfs, { 'opacity': 0 }, function() {
              _s_wrapper();
              _s_paddingold();
              _s_paddingnew();
              _s_paddingcur();
              _position();
              _moveitems();
              scrl = sc_setScroll(a_dur, sO.easing);
              scrl.anims.push([$cfs, { 'opacity': 1 }, _onafter]);
              sc_startScroll(scrl);
            }]);
            break;

          case 'crossfade':
            $cfs.css({ 'opacity': 0 });
            scrl.anims.push([$cf2, { 'opacity': 0 }]);
            scrl.anims.push([$cfs, { 'opacity': 1 }, _onafter]);
            _a_wrapper();
            _s_paddingold();
            _s_paddingnew();
            _s_paddingcur();
            _position();
            _moveitems();
            break;

          case 'cover':
            scrl.anims.push([$cf2, a_cfs, function() {
              _s_paddingold();
              _s_paddingnew();
              _s_paddingcur();
              _position();
              _moveitems();
              _onafter();
            }]);
            _a_wrapper();
            break;

          case 'cover-fade':
            scrl.anims.push([$cfs, { 'opacity': 0 }]);
            scrl.anims.push([$cf2, a_cfs, function() {
              $cfs.css({ 'opacity': 1 });
              _s_paddingold();
              _s_paddingnew();
              _s_paddingcur();
              _position();
              _moveitems();
              _onafter();
            }]);
            _a_wrapper();
            break;

          case 'uncover':
            scrl.anims.push([$cf2, a_wsz, _onafter]);
            _a_wrapper();
            _s_paddingold();
            _s_paddingnew();
            _s_paddingcur();
            _position();
            _moveitems();
            break;

          case 'uncover-fade':
            $cfs.css({ 'opacity': 0 });
            scrl.anims.push([$cfs, { 'opacity': 1 }]);
            scrl.anims.push([$cf2, a_wsz, _onafter]);
            _a_wrapper();
            _s_paddingold();
            _s_paddingnew();
            _s_paddingcur();
            _position();
            _moveitems();
            break;

          default:
            scrl.anims.push([$cfs, a_cfs, function() {
              _moveitems();
              _onafter();
            }]);
            _a_wrapper();
            _a_paddingold();
            _a_paddingnew();
            _a_paddingcur();
            break;
        }

        sc_startScroll(scrl);
        cf_setCookie(opts.cookie, $cfs, conf);

        $cfs.trigger(cf_e('updatePageStatus', conf), [false, w_siz]);

        return true;
      });


      //  next event
      $cfs.bind(cf_e('slide_next', conf), function(e, sO, nI) {
        e.stopPropagation();
        var a_itm = $cfs.children();

        //  non-circular at end, scroll to start
        if (!opts.circular)
        {
          if (itms.first == opts.items.visible)
          {
            if (opts.infinite)
            {
              $cfs.trigger(cf_e('prev', conf), itms.total-1);
            }
            return e.stopImmediatePropagation();
          }
        }

        sz_resetMargin(a_itm, opts);

        //  find number of items to scroll
        if (!is_number(nI))
        {
          if (opts.items.filter != '*')
          {
            var xI = (is_number(sO.items)) ? sO.items : gn_getVisibleOrg($cfs, opts);
            nI = gn_getScrollItemsNextFilter(a_itm, opts, 0, xI);
          }
          else
          {
            nI = opts.items.visible;
          }
          nI = cf_getAdjust(nI, opts, sO.items, $tt0);
        }

        var lastItemNr = (itms.first == 0) ? itms.total : itms.first;

        //  prevent non-circular from scrolling to far
        if (!opts.circular)
        {
          if (opts.items.visibleConf.variable)
          {
            var vI = gn_getVisibleItemsNext(a_itm, opts, nI),
              xI = gn_getVisibleItemsPrev(a_itm, opts, lastItemNr-1);
          }
          else
          {
            var vI = opts.items.visible,
              xI = opts.items.visible;
          }

          if (nI + vI > lastItemNr)
          {
            nI = lastItemNr - xI;
          }
        }

        //  set new number of visible items
        opts.items.visibleConf.old = opts.items.visible;
        if (opts.items.visibleConf.variable)
        {
          var vI = cf_getItemsAdjust(gn_getVisibleItemsNextTestCircular(a_itm, opts, nI, lastItemNr), opts, opts.items.visibleConf.adjust, $tt0);
          while (opts.items.visible-nI >= vI && nI < itms.total)
          {
            nI++;
            vI = cf_getItemsAdjust(gn_getVisibleItemsNextTestCircular(a_itm, opts, nI, lastItemNr), opts, opts.items.visibleConf.adjust, $tt0);
          }
          opts.items.visible = vI;
        }
        else if (opts.items.filter != '*')
        {
          var vI = gn_getVisibleItemsNextFilter(a_itm, opts, nI);
          opts.items.visible = cf_getItemsAdjust(vI, opts, opts.items.visibleConf.adjust, $tt0);
        }

        sz_resetMargin(a_itm, opts, true);

        //  scroll 0, don't scroll
        if (nI == 0)
        {
          e.stopImmediatePropagation();
          return debug(conf, '0 items to scroll: Not scrolling.');
        }
        debug(conf, 'Scrolling '+nI+' items forward.');


        //  save new config
        itms.first -= nI;
        while (itms.first < 0)
        {
          itms.first += itms.total;
        }

        //  non-circular callback
        if (!opts.circular)
        {
          if (itms.first == opts.items.visible && sO.onEnd)
          {
            sO.onEnd.call($tt0, 'next');
          }
          if (!opts.infinite)
          {
            nv_enableNavi(opts, itms.first, conf);
          }
        }

        //  rearrange items
        if (itms.total < opts.items.visible+nI)
        {
          $cfs.children().slice(0, (opts.items.visible+nI)-itms.total).clone(true).appendTo($cfs);
        }

        //  the needed items
        var a_itm = $cfs.children(),
          i_old = gi_getOldItemsNext(a_itm, opts),
          i_new = gi_getNewItemsNext(a_itm, opts, nI),
          i_cur_l = a_itm.eq(nI-1),
          i_old_l = i_old.last(),
          i_new_l = i_new.last();

        sz_resetMargin(a_itm, opts);

        var pL = 0,
          pR = 0;

        if (opts.align)
        {
          var p = cf_getAlignPadding(i_new, opts);
          pL = p[0];
          pR = p[1];
        }

        //  hide items for fx directscroll
        var hiddenitems = false,
          i_skp = $();
        if (opts.items.visibleConf.old < nI)
        {
          i_skp = a_itm.slice(opts.items.visibleConf.old, nI);
          if (sO.fx == 'directscroll')
          {
            var orgW = opts.items[opts.d['width']];
            hiddenitems = i_skp;
            i_cur_l = i_old_l;
            sc_hideHiddenItems(hiddenitems);
            opts.items[opts.d['width']] = 'variable';
          }
        }

        //  save new sizes
        var $cf2 = false,
          i_siz = ms_getTotalSize(a_itm.slice(0, nI), opts, 'width'),
          w_siz = cf_mapWrapperSizes(ms_getSizes(i_new, opts, true), opts, !opts.usePadding),
          i_siz_vis = 0,
          a_cfs = {},
          a_cfs_vis = {},
          a_cur = {},
          a_old = {},
          a_lef = {},
          a_dur = sc_getDuration(sO, opts, nI, i_siz);

        switch(sO.fx)
        {
          case 'uncover':
          case 'uncover-fade':
            i_siz_vis = ms_getTotalSize(a_itm.slice(0, opts.items.visibleConf.old), opts, 'width');
            break;
        }

        if (hiddenitems)
        {
          opts.items[opts.d['width']] = orgW;
        }

        if (opts.align)
        {
          if (opts.padding[opts.d[1]] < 0)
          {
            opts.padding[opts.d[1]] = 0;
          }
        }
        sz_resetMargin(a_itm, opts, true);
        sz_resetMargin(i_old_l, opts, opts.padding[opts.d[1]]);

        if (opts.align)
        {
          opts.padding[opts.d[1]] = pR;
          opts.padding[opts.d[3]] = pL;
        }

        a_lef[opts.d['left']] = (opts.usePadding) ? opts.padding[opts.d[3]] : 0;

        //  scrolling functions
        var _s_wrapper = function() {},
          _a_wrapper = function() {},
          _s_paddingold = function() {},
          _a_paddingold = function() {},
          _s_paddingcur = function() {},
          _a_paddingcur = function() {},
          _onafter = function() {},
          _moveitems = function() {},
          _position = function() {};

        //  clone carousel
        switch(sO.fx)
        {
          case 'crossfade':
          case 'cover':
          case 'cover-fade':
          case 'uncover':
          case 'uncover-fade':
            $cf2 = $cfs.clone(true).appendTo($wrp);
            $cf2.children().slice(opts.items.visibleConf.old).remove();
            break;
        }
        switch(sO.fx)
        {
          case 'crossfade':
          case 'cover':
          case 'cover-fade':
            $cfs.css('zIndex', 1);
            $cf2.css('zIndex', 0);
            break;
        }

        //  reset all scrolls
        scrl = sc_setScroll(a_dur, sO.easing);

        //  animate / set carousel
        a_cfs[opts.d['left']] = -i_siz;
        a_cfs_vis[opts.d['left']] = -i_siz_vis;

        if (pL < 0)
        {
          a_cfs[opts.d['left']] += pL;
        }

        //  animate / set wrapper
        if (opts[opts.d['width']] == 'variable' || opts[opts.d['height']] == 'variable')
        {
          _s_wrapper = function() {
            $wrp.css(w_siz);
          };
          _a_wrapper = function() {
            scrl.anims.push([$wrp, w_siz]);
          };
        }

        //  animate / set items
        if (opts.usePadding)
        {
          var i_new_l_m = i_new_l.data('_cfs_origCssMargin');
          if (pR >= 0)
          {
            i_new_l_m += opts.padding[opts.d[1]];
          }
          i_new_l.css(opts.d['marginRight'], i_new_l_m);

          if (i_cur_l.not(i_old_l).length)
          {
            a_old[opts.d['marginRight']] = i_old_l.data('_cfs_origCssMargin');
          }
          _s_paddingold = function() {
            i_old_l.css(a_old);
          };
          _a_paddingold = function() {
            scrl.anims.push([i_old_l, a_old]);
          };

          var i_cur_l_m = i_cur_l.data('_cfs_origCssMargin');
          if (pL > 0)
          {
            i_cur_l_m += opts.padding[opts.d[3]];
          }
          a_cur[opts.d['marginRight']] = i_cur_l_m;
          _s_paddingcur = function() {
            i_cur_l.css(a_cur);
          };
          _a_paddingcur = function() {
            scrl.anims.push([i_cur_l, a_cur]);
          };
        }

        //  set position
        _position = function() {
          $cfs.css(a_lef);
        };


        var overFill = opts.items.visible+nI-itms.total;

        //  rearrange items
        _moveitems = function() {
          if (overFill > 0)
          {
            $cfs.children().slice(itms.total).remove();
          }
          var l_itm = $cfs.children().slice(0, nI).appendTo($cfs).last();
          if (overFill > 0)
          {
            i_new = gi_getCurrentItems(a_itm, opts);
          }
          sc_showHiddenItems(hiddenitems);

          if (opts.usePadding)
          {
            if (itms.total < opts.items.visible+nI) {
              var i_cur_l = $cfs.children().eq(opts.items.visible-1);
              i_cur_l.css(opts.d['marginRight'], i_cur_l.data('_cfs_origCssMargin') + opts.padding[opts.d[3]]);
            }
            l_itm.css(opts.d['marginRight'], l_itm.data('_cfs_origCssMargin'));
          }
        };


        var cb_arguments = sc_mapCallbackArguments(i_old, i_skp, i_new, nI, 'next', a_dur, w_siz);

        //  fire onAfter callbacks
        _onafter = function() {
          $cfs.css('zIndex', $cfs.data('_cfs_origCss').zIndex);
          sc_afterScroll($cfs, $cf2, sO);
          crsl.isScrolling = false;
          clbk.onAfter = sc_fireCallbacks($tt0, sO, 'onAfter', cb_arguments, clbk);
          queu = sc_fireQueue($cfs, queu, conf);
          
          if (!crsl.isPaused)
          {
            $cfs.trigger(cf_e('play', conf));
          }
        };

        //  fire onBefore callbacks
        crsl.isScrolling = true;
        tmrs = sc_clearTimers(tmrs);
        clbk.onBefore = sc_fireCallbacks($tt0, sO, 'onBefore', cb_arguments, clbk);

        switch(sO.fx)
        {
          case 'none':
            $cfs.css(a_cfs);
            _s_wrapper();
            _s_paddingold();
            _s_paddingcur();
            _position();
            _moveitems();
            _onafter();
            break;

          case 'fade':
            scrl.anims.push([$cfs, { 'opacity': 0 }, function() {
              _s_wrapper();
              _s_paddingold();
              _s_paddingcur();
              _position();
              _moveitems();
              scrl = sc_setScroll(a_dur, sO.easing);
              scrl.anims.push([$cfs, { 'opacity': 1 }, _onafter]);
              sc_startScroll(scrl);
            }]);
            break;

          case 'crossfade':
            $cfs.css({ 'opacity': 0 });
            scrl.anims.push([$cf2, { 'opacity': 0 }]);
            scrl.anims.push([$cfs, { 'opacity': 1 }, _onafter]);
            _a_wrapper();
            _s_paddingold();
            _s_paddingcur();
            _position();
            _moveitems();
            break;

          case 'cover':
            $cfs.css(opts.d['left'], $wrp[opts.d['width']]());
            scrl.anims.push([$cfs, a_lef, _onafter]);
            _a_wrapper();
            _s_paddingold();
            _s_paddingcur();
            _moveitems();
            break;

          case 'cover-fade':
            $cfs.css(opts.d['left'], $wrp[opts.d['width']]());
            scrl.anims.push([$cf2, { 'opacity': 0 }]);
            scrl.anims.push([$cfs, a_lef, _onafter]);
            _a_wrapper();
            _s_paddingold();
            _s_paddingcur();
            _moveitems();
            break;

          case 'uncover':
            scrl.anims.push([$cf2, a_cfs_vis, _onafter]);
            _a_wrapper();
            _s_paddingold();
            _s_paddingcur();
            _position();
            _moveitems();
            break;

          case 'uncover-fade':
            $cfs.css({ 'opacity': 0 });
            scrl.anims.push([$cfs, { 'opacity': 1 }]);
            scrl.anims.push([$cf2, a_cfs_vis, _onafter]);
            _a_wrapper();
            _s_paddingold();
            _s_paddingcur();
            _position();
            _moveitems();
            break;

          default:
            scrl.anims.push([$cfs, a_cfs, function() {
              _position();
              _moveitems();
              _onafter();
            }]);
            _a_wrapper();
            _a_paddingold();
            _a_paddingcur();
            break;
        }

        sc_startScroll(scrl);
        cf_setCookie(opts.cookie, $cfs, conf);

        $cfs.trigger(cf_e('updatePageStatus', conf), [false, w_siz]);

        return true;
      });


      //  slideTo event
      $cfs.bind(cf_e('slideTo', conf), function(e, num, dev, org, obj, dir, clb) {
        e.stopPropagation();

        var v = [num, dev, org, obj, dir, clb],
          t = ['string/number/object', 'number', 'boolean', 'object', 'string', 'function'],
          a = cf_sortParams(v, t);

        obj = a[3];
        dir = a[4];
        clb = a[5];

        num = gn_getItemIndex(a[0], a[1], a[2], itms, $cfs);

        if (num == 0)
        {
          return false;
        }
        if (!is_object(obj))
        {
          obj = false;
        }

/*
        if (crsl.isScrolling)
        {
          if (!is_object(obj) || obj.duration > 0)
          {
//            return false;
          }
        }
*/

        if (dir != 'prev' && dir != 'next')
        {
          if (opts.circular)
          {
            dir = (num <= itms.total / 2) ? 'next' : 'prev';
          }
          else
          {
            dir = (itms.first == 0 || itms.first > num) ? 'next' : 'prev';
          }
        }

        if (dir == 'prev')
        {
          num = itms.total-num;
        }
        $cfs.trigger(cf_e(dir, conf), [obj, num, clb]);

        return true;
      });


      //  prevPage event
      $cfs.bind(cf_e('prevPage', conf), function(e, obj, clb) {
        e.stopPropagation();
        var cur = $cfs.triggerHandler(cf_e('currentPage', conf));
        return $cfs.triggerHandler(cf_e('slideToPage', conf), [cur-1, obj, 'prev', clb]);
      });


      //  nextPage event
      $cfs.bind(cf_e('nextPage', conf), function(e, obj, clb) {
        e.stopPropagation();
        var cur = $cfs.triggerHandler(cf_e('currentPage', conf));
        return $cfs.triggerHandler(cf_e('slideToPage', conf), [cur+1, obj, 'next', clb]);
      });


      //  slideToPage event
      $cfs.bind(cf_e('slideToPage', conf), function(e, pag, obj, dir, clb) {
        e.stopPropagation();
        if (!is_number(pag))
        {
          pag = $cfs.triggerHandler(cf_e('currentPage', conf));
        }
        var ipp = opts.pagination.items || opts.items.visible,
          max = Math.ceil(itms.total / ipp)-1;

        if (pag < 0)
        {
          pag = max;
        }
        if (pag > max)
        {
          pag = 0;
        }
        return $cfs.triggerHandler(cf_e('slideTo', conf), [pag*ipp, 0, true, obj, dir, clb]);
      });

      //  jumpToStart event
      $cfs.bind(cf_e('jumpToStart', conf), function(e, s) {
        e.stopPropagation();
        if (s)
        {
          s = gn_getItemIndex(s, 0, true, itms, $cfs);
        }
        else
        {
          s = 0;
        }

        s += itms.first;
        if (s != 0)
        {
          if (itms.total > 0)
          {
            while (s > itms.total)
            {
              s -= itms.total;
            }
          }
          $cfs.prepend($cfs.children().slice(s, itms.total));
        }
        return true;
      });


      //  synchronise event
      $cfs.bind(cf_e('synchronise', conf), function(e, s) {
        e.stopPropagation();
        if (s)
        {
          s = cf_getSynchArr(s);
        }
        else if (opts.synchronise)
        {
          s = opts.synchronise;
        }
        else
        {
          return debug(conf, 'No carousel to synchronise.');
        }

        var n = $cfs.triggerHandler(cf_e('currentPosition', conf)),
          x = true;

        for (var j = 0, l = s.length; j < l; j++)
        {
          if (!s[j][0].triggerHandler(cf_e('slideTo', conf), [n, s[j][3], true]))
          {
            x = false;
          }
        }
        return x;
      });


      //  queue event
      $cfs.bind(cf_e('queue', conf), function(e, dir, opt) {
        e.stopPropagation();
        if (is_function(dir))
        {
          dir.call($tt0, queu);
        }
        else if (is_array(dir))
        {
          queu = dir;
        }
        else if (!is_undefined(dir))
        {
          queu.push([dir, opt]);
        }
        return queu;
      });


      //  insertItem event
      $cfs.bind(cf_e('insertItem', conf), function(e, itm, num, org, dev) {
        e.stopPropagation();

        var v = [itm, num, org, dev],
          t = ['string/object', 'string/number/object', 'boolean', 'number'],
          a = cf_sortParams(v, t);

        itm = a[0];
        num = a[1];
        org = a[2];
        dev = a[3];

        if (is_object(itm) && !is_jquery(itm))
        { 
          itm = $(itm);
        }
        else if (is_string(itm))
        {
          itm = $(itm);
        }
        if (!is_jquery(itm) || itm.length == 0)
        {
          return debug(conf, 'Not a valid object.');
        }

        if (is_undefined(num))
        {
          num = 'end';
        }

        sz_storeMargin(itm, opts);
        sz_storeSizes(itm, opts);

        var orgNum = num,
          before = 'before';

        if (num == 'end')
        {
          if (org)
          {
            if (itms.first == 0)
            {
              num = itms.total-1;
              before = 'after';
            }
            else
            {
              num = itms.first;
              itms.first += itm.length;
            }
            if (num < 0)
            {
              num = 0;
            }
          }
          else
          {
            num = itms.total-1;
            before = 'after';
          }
        }
        else
        {
          num = gn_getItemIndex(num, dev, org, itms, $cfs);
        }

        var $cit = $cfs.children().eq(num);
        if ($cit.length)
        {
          $cit[before](itm);
        }
        else
        {
          debug(conf, 'Correct insert-position not found! Appending item to the end.');
          $cfs.append(itm);
        }

        if (orgNum != 'end' && !org)
        {
          if (num < itms.first)
          {
            itms.first += itm.length;
          }
        }
        itms.total = $cfs.children().length;
        if (itms.first >= itms.total)
        {
          itms.first -= itms.total;
        }

        $cfs.trigger(cf_e('updateSizes', conf));
        $cfs.trigger(cf_e('linkAnchors', conf));

        return true;
      });


      //  removeItem event
      $cfs.bind(cf_e('removeItem', conf), function(e, num, org, dev) {
        e.stopPropagation();

        var v = [num, org, dev],
          t = ['string/number/object', 'boolean', 'number'],
          a = cf_sortParams(v, t);

        num = a[0];
        org = a[1];
        dev = a[2];

        var removed = false;
        if (num instanceof $ && num.length > 1)
        {
          $removed = $();
          num.each(function(i, el) {
            var $rem = $cfs.trigger(cf_e('removeItem', conf), [$(this), org, dev]);
            if ($rem) $removed = $removed.add($rem);
          });
          return $removed;
        }

        if (is_undefined(num) || num == 'end')
        {
          $removed = $cfs.children().last();
        }
        else
        {
          num = gn_getItemIndex(num, dev, org, itms, $cfs);
          var $removed = $cfs.children().eq(num);
          if ($removed.length){
            if (num < itms.first) itms.first -= $removed.length;
          }
        }
        if ($removed && $removed.length)
        {
          $removed.detach();
          itms.total = $cfs.children().length;
          $cfs.trigger(cf_e('updateSizes', conf));
        }

        return $removed;
      });


      //  onBefore and onAfter event
      $cfs.bind(cf_e('onBefore', conf)+' '+cf_e('onAfter', conf), function(e, fn) {
        e.stopPropagation();
        var eType = e.type.slice(conf.events.prefix.length);
        if (is_array(fn))
        {
          clbk[eType] = fn;
        }
        if (is_function(fn))
        {
          clbk[eType].push(fn);
        }
        return clbk[eType];
      });


      //  currentPosition event
      $cfs.bind(cf_e('currentPosition', conf), function(e, fn) {
        e.stopPropagation();
        if (itms.first == 0)
        {
          var val = 0;
        }
        else
        {
          var val = itms.total - itms.first;
        }
        if (is_function(fn))
        {
          fn.call($tt0, val);
        }
        return val;
      });


      //  currentPage event
      $cfs.bind(cf_e('currentPage', conf), function(e, fn) {
        e.stopPropagation();
        var ipp = opts.pagination.items || opts.items.visible,
          max = Math.ceil(itms.total/ipp-1),
          nr;
        if (itms.first == 0)
        {
          nr = 0;
        }
        else if (itms.first < itms.total % ipp)
        {
          nr = 0;
        }
        else if (itms.first == ipp && !opts.circular)
        {
          nr = max;
        }
        else 
        {
           nr = Math.round((itms.total-itms.first)/ipp);
        }
        if (nr < 0)
        {
          nr = 0;
        }
        if (nr > max)
        {
          nr = max;
        }
        if (is_function(fn))
        {
          fn.call($tt0, nr);
        }
        return nr;
      });


      //  currentVisible event
      $cfs.bind(cf_e('currentVisible', conf), function(e, fn) {
        e.stopPropagation();
        var $i = gi_getCurrentItems($cfs.children(), opts);
        if (is_function(fn))
        {
          fn.call($tt0, $i);
        }
        return $i;
      });


      //  slice event
      $cfs.bind(cf_e('slice', conf), function(e, f, l, fn) {
        e.stopPropagation();

        if (itms.total == 0)
        {
          return false;
        }

        var v = [f, l, fn],
          t = ['number', 'number', 'function'],
          a = cf_sortParams(v, t);

        f = (is_number(a[0])) ? a[0] : 0;
        l = (is_number(a[1])) ? a[1] : itms.total;
        fn = a[2];

        f += itms.first;
        l += itms.first;

        if (items.total > 0)
        {
          while (f > itms.total)
          {
            f -= itms.total;
          }
          while (l > itms.total)
          {
            l -= itms.total;
          }
          while (f < 0)
          {
            f += itms.total;
          }
          while (l < 0)
          {
            l += itms.total;
          }
        }
        var $iA = $cfs.children(),
          $i;

        if (l > f)
        {
          $i = $iA.slice(f, l);
        }
        else
        {
          $i = $( $iA.slice(f, itms.total).get().concat( $iA.slice(0, l).get() ) );
        }

        if (is_function(fn))
        {
          fn.call($tt0, $i);
        }
        return $i;
      });


      //  isPaused, isStopped and isScrolling events
      $cfs.bind(cf_e('isPaused', conf)+' '+cf_e('isStopped', conf)+' '+cf_e('isScrolling', conf), function(e, fn) {
        e.stopPropagation();
        var eType = e.type.slice(conf.events.prefix.length),
          value = crsl[eType];
        if (is_function(fn))
        {
          fn.call($tt0, value);
        }
        return value;
      });


      //  configuration event
      $cfs.bind(cf_e('configuration', conf), function(e, a, b, c) {
        e.stopPropagation();
        var reInit = false;

        //  return entire configuration-object
        if (is_function(a))
        {
          a.call($tt0, opts);
        }
        //  set multiple options via object
        else if (is_object(a))
        {
          opts_orig = $.extend(true, {}, opts_orig, a);
          if (b !== false) reInit = true;
          else opts = $.extend(true, {}, opts, a);

        }
        else if (!is_undefined(a))
        {

          //  callback function for specific option
          if (is_function(b))
          {
            var val = eval('opts.'+a);
            if (is_undefined(val))
            {
              val = '';
            }
            b.call($tt0, val);
          }
          //  set individual option
          else if (!is_undefined(b))
          {
            if (typeof c !== 'boolean') c = true;
            eval('opts_orig.'+a+' = b');
            if (c !== false) reInit = true;
            else eval('opts.'+a+' = b');
          }
          //  return value for specific option
          else
          {
            return eval('opts.'+a);
          }
        }
        if (reInit)
        {
          sz_resetMargin($cfs.children(), opts);
          $cfs._cfs_init(opts_orig);
          $cfs._cfs_bind_buttons();
          var sz = sz_setSizes($cfs, opts);
          $cfs.trigger(cf_e('updatePageStatus', conf), [true, sz]);
        }
        return opts;
      });


      //  linkAnchors event
      $cfs.bind(cf_e('linkAnchors', conf), function(e, $con, sel) {
        e.stopPropagation();

        if (is_undefined($con))
        {
          $con = $('body');
        }
        else if (is_string($con))
        {
          $con = $($con);
        }
        if (!is_jquery($con) || $con.length == 0)
        {
          return debug(conf, 'Not a valid object.');
        }
        if (!is_string(sel))
        {
          sel = 'a.caroufredsel';
        }

        $con.find(sel).each(function() {
          var h = this.hash || '';
          if (h.length > 0 && $cfs.children().index($(h)) != -1)
          {
            $(this).unbind('click').click(function(e) {
              e.preventDefault();
              $cfs.trigger(cf_e('slideTo', conf), h);
            });
          }
        });
        return true;
      });


      //  updatePageStatus event
      $cfs.bind(cf_e('updatePageStatus', conf), function(e, build, sizes) {
        e.stopPropagation();
        if (!opts.pagination.container)
        {
          return;
        }

        var ipp = opts.pagination.items || opts.items.visible,
          pgs = Math.ceil(itms.total/ipp);

        if (build)
        {
          if (opts.pagination.anchorBuilder)
          {
            opts.pagination.container.children().remove();
            opts.pagination.container.each(function() {
              for (var a = 0; a < pgs; a++)
              {
                var i = $cfs.children().eq( gn_getItemIndex(a*ipp, 0, true, itms, $cfs) );
                $(this).append(opts.pagination.anchorBuilder.call(i[0], a+1));
              }
            });
          }
          opts.pagination.container.each(function() {
            $(this).children().unbind(opts.pagination.event).each(function(a) {
              $(this).bind(opts.pagination.event, function(e) {
                e.preventDefault();
                $cfs.trigger(cf_e('slideTo', conf), [a*ipp, -opts.pagination.deviation, true, opts.pagination]);
              });
            });
          });
        }

        var selected = $cfs.triggerHandler(cf_e('currentPage', conf)) + opts.pagination.deviation;
        if (selected >= pgs)
        {
          selected = 0;
        }
        if (selected < 0)
        {
          selected = pgs-1;
        }
        opts.pagination.container.each(function() {
          $(this).children().removeClass(cf_c('selected', conf)).eq(selected).addClass(cf_c('selected', conf));
        });
        return true;
      });


      //  updateSizes event
      $cfs.bind(cf_e('updateSizes', conf), function(e) {
        var vI = opts.items.visible,
          a_itm = $cfs.children(),
          avail_primary = ms_getParentSize($wrp, opts, 'width');

        itms.total = a_itm.length;

        if (crsl.primarySizePercentage)
        {
          opts.maxDimension = avail_primary;
          opts[opts.d['width']] = ms_getPercentage(avail_primary, crsl.primarySizePercentage);
        }
        else
        {
          opts.maxDimension = ms_getMaxDimension(opts, avail_primary);
        }

        if (opts.responsive)
        {
          opts.items.width = opts.items.sizesConf.width;
          opts.items.height = opts.items.sizesConf.height;
          opts = in_getResponsiveValues(opts, a_itm, avail_primary);
          vI = opts.items.visible;
          sz_setResponsiveSizes(opts, a_itm);
        }
        else if (opts.items.visibleConf.variable)
        {
          vI = gn_getVisibleItemsNext(a_itm, opts, 0);
        }
        else if (opts.items.filter != '*')
        {
          vI = gn_getVisibleItemsNextFilter(a_itm, opts, 0);
        }

        if (!opts.circular && itms.first != 0 && vI > itms.first) {
          if (opts.items.visibleConf.variable)
          {
            var nI = gn_getVisibleItemsPrev(a_itm, opts, itms.first) - itms.first;
          }
          else if (opts.items.filter != '*')
          {
            var nI = gn_getVisibleItemsPrevFilter(a_itm, opts, itms.first) - itms.first;
          }
          else
          {
            var nI = opts.items.visible - itms.first;
          }
          debug(conf, 'Preventing non-circular: sliding '+nI+' items backward.');
          $cfs.trigger(cf_e('prev', conf), nI);
        }

        opts.items.visible = cf_getItemsAdjust(vI, opts, opts.items.visibleConf.adjust, $tt0);
        opts.items.visibleConf.old = opts.items.visible;
        opts = in_getAlignPadding(opts, a_itm);

        var sz = sz_setSizes($cfs, opts);
        $cfs.trigger(cf_e('updatePageStatus', conf), [true, sz]);
        nv_showNavi(opts, itms.total, conf);
        nv_enableNavi(opts, itms.first, conf);

        return sz;
      });


      //  destroy event
      $cfs.bind(cf_e('destroy', conf), function(e, orgOrder) {
        e.stopPropagation();
        tmrs = sc_clearTimers(tmrs);

        $cfs.data('_cfs_isCarousel', false);
        $cfs.trigger(cf_e('finish', conf));
        if (orgOrder)
        {
          $cfs.trigger(cf_e('jumpToStart', conf));
        }
        sz_resetMargin($cfs.children(), opts);
        if (opts.responsive)
        {
          $cfs.children().each(function() {
            $(this).css($(this).data('_cfs_origCssSizes'));
          });
        }

        $cfs.css($cfs.data('_cfs_origCss'));
        $cfs._cfs_unbind_events();
        $cfs._cfs_unbind_buttons();
        $wrp.replaceWith($cfs);

        return true;
      });


      //  debug event
      $cfs.bind(cf_e('debug', conf), function(e) {
        debug(conf, 'Carousel width: '+opts.width);
        debug(conf, 'Carousel height: '+opts.height);
        debug(conf, 'Item widths: '+opts.items.width);
        debug(conf, 'Item heights: '+opts.items.height);
        debug(conf, 'Number of items visible: '+opts.items.visible);
        if (opts.auto.play)
        {
          debug(conf, 'Number of items scrolled automatically: '+opts.auto.items);
        }
        if (opts.prev.button)
        {
          debug(conf, 'Number of items scrolled backward: '+opts.prev.items);
        }
        if (opts.next.button)
        {
          debug(conf, 'Number of items scrolled forward: '+opts.next.items);
        }
        return conf.debug;
      });


      //  triggerEvent, making prefixed and namespaced events accessible from outside
      $cfs.bind('_cfs_triggerEvent', function(e, n, o) {
        e.stopPropagation();
        return $cfs.triggerHandler(cf_e(n, conf), o);
      });
    };  //  /bind_events


    $cfs._cfs_unbind_events = function() {
      $cfs.unbind(cf_e('', conf));
      $cfs.unbind(cf_e('', conf, false));
      $cfs.unbind('_cfs_triggerEvent');
    };  //  /unbind_events


    $cfs._cfs_bind_buttons = function() {
      $cfs._cfs_unbind_buttons();
      nv_showNavi(opts, itms.total, conf);
      nv_enableNavi(opts, itms.first, conf);

      if (opts.auto.pauseOnHover)
      {
        var pC = bt_pauseOnHoverConfig(opts.auto.pauseOnHover);
        $wrp.bind(cf_e('mouseenter', conf, false), function() { $cfs.trigger(cf_e('pause', conf), pC);  })
          .bind(cf_e('mouseleave', conf, false), function() { $cfs.trigger(cf_e('resume', conf));   });
      }

      //  play button
      if (opts.auto.button)
      {
        opts.auto.button.bind(cf_e(opts.auto.event, conf, false), function(e) {
          e.preventDefault();
          var ev = false,
            pC = null;

          if (crsl.isPaused)
          {
            ev = 'play';
          }
          else if (opts.auto.pauseOnEvent)
          {
            ev = 'pause';
            pC = bt_pauseOnHoverConfig(opts.auto.pauseOnEvent);
          }
          if (ev)
          {
            $cfs.trigger(cf_e(ev, conf), pC);
          }
        });
      }

      //  prev button
      if (opts.prev.button)
      {
        opts.prev.button.bind(cf_e(opts.prev.event, conf, false), function(e) {
          e.preventDefault();
          $cfs.trigger(cf_e('prev', conf));
        });
        if (opts.prev.pauseOnHover)
        {
          var pC = bt_pauseOnHoverConfig(opts.prev.pauseOnHover);
          opts.prev.button.bind(cf_e('mouseenter', conf, false), function() { $cfs.trigger(cf_e('pause', conf), pC);  })
                  .bind(cf_e('mouseleave', conf, false), function() { $cfs.trigger(cf_e('resume', conf));   });
        }
      }

      //  next butotn
      if (opts.next.button)
      {
        opts.next.button.bind(cf_e(opts.next.event, conf, false), function(e) {
          e.preventDefault();
          $cfs.trigger(cf_e('next', conf));
        });
        if (opts.next.pauseOnHover)
        {
          var pC = bt_pauseOnHoverConfig(opts.next.pauseOnHover);
          opts.next.button.bind(cf_e('mouseenter', conf, false), function() { $cfs.trigger(cf_e('pause', conf), pC);  })
                  .bind(cf_e('mouseleave', conf, false), function() { $cfs.trigger(cf_e('resume', conf));   });
        }
      }

      //  pagination
      if (opts.pagination.container)
      {
        if (opts.pagination.pauseOnHover)
        {
          var pC = bt_pauseOnHoverConfig(opts.pagination.pauseOnHover);
          opts.pagination.container.bind(cf_e('mouseenter', conf, false), function() { $cfs.trigger(cf_e('pause', conf), pC); })
                       .bind(cf_e('mouseleave', conf, false), function() { $cfs.trigger(cf_e('resume', conf));  });
        }
      }

      //  prev/next keys
      if (opts.prev.key || opts.next.key)
      {
        $(document).bind(cf_e('keyup', conf, false, true, true), function(e) {
          var k = e.keyCode;
          if (k == opts.next.key)
          {
            e.preventDefault();
            $cfs.trigger(cf_e('next', conf));
          }
          if (k == opts.prev.key)
          {
            e.preventDefault();
            $cfs.trigger(cf_e('prev', conf));
          }
        });
      }

      //  pagination keys
      if (opts.pagination.keys)
      {
        $(document).bind(cf_e('keyup', conf, false, true, true), function(e) {
          var k = e.keyCode;
          if (k >= 49 && k < 58)
          {
            k = (k-49) * opts.items.visible;
            if (k <= itms.total)
            {
              e.preventDefault();
              $cfs.trigger(cf_e('slideTo', conf), [k, 0, true, opts.pagination]);
            }
          }
        });
      }


      //  DEPRECATED
      if (opts.prev.wipe || opts.next.wipe)
      {
        deprecated( 'the touchwipe-plugin', 'the touchSwipe-plugin' );
        if ($.fn.touchwipe)
        {
          var wP = (opts.prev.wipe) ? function() { $cfs.trigger(cf_e('prev', conf)) } : null,
            wN = (opts.next.wipe) ? function() { $cfs.trigger(cf_e('next', conf)) } : null;

          if (wN || wN)
          {
            if (!crsl.touchwipe)
            {
              crsl.touchwipe = true;
              var twOps = {
                'min_move_x': 30,
                'min_move_y': 30,
                'preventDefaultEvents': true
              };
              switch (opts.direction)
              {
                case 'up':
                case 'down':
                  twOps.wipeUp = wP;
                  twOps.wipeDown = wN;
                  break;
                default:
                  twOps.wipeLeft = wN;
                  twOps.wipeRight = wP;
              }
              $wrp.touchwipe(twOps);
            }
          }
        }
      }
      //  /DEPRECATED


      //  swipe
      if ($.fn.swipe)
      {
        var isTouch = 'ontouchstart' in window;
        if ((isTouch && opts.swipe.onTouch) || (!isTouch && opts.swipe.onMouse))
        {
          var scP = $.extend(true, {}, opts.prev, opts.swipe),
            scN = $.extend(true, {}, opts.next, opts.swipe),
            swP = function() { $cfs.trigger(cf_e('prev', conf), [scP]) },
            swN = function() { $cfs.trigger(cf_e('next', conf), [scN]) };

          switch (opts.direction)
          {
            case 'up':
            case 'down':
              opts.swipe.options.swipeUp = swN;
              opts.swipe.options.swipeDown = swP;
              break;
            default:
              opts.swipe.options.swipeLeft = swN;
              opts.swipe.options.swipeRight = swP;
          }
          if (crsl.swipe)
          {
            $cfs.swipe('destroy');
          }
          $wrp.swipe(opts.swipe.options);
          $wrp.css('cursor', 'move');
          crsl.swipe = true;
        }
      }

      //  mousewheel
      if ($.fn.mousewheel)
      {


        //  DEPRECATED
        if (opts.prev.mousewheel)
        {
          deprecated('The prev.mousewheel option', 'the mousewheel configuration object');
          opts.prev.mousewheel = null;
          opts.mousewheel = {
            items: bt_mousesheelNumber(opts.prev.mousewheel)
          };
        }
        if (opts.next.mousewheel)
        {
          deprecated('The next.mousewheel option', 'the mousewheel configuration object');
          opts.next.mousewheel = null;
          opts.mousewheel = {
            items: bt_mousesheelNumber(opts.next.mousewheel)
          };
        }
        //  /DEPRECATED


        if (opts.mousewheel)
        {
          var mcP = $.extend(true, {}, opts.prev, opts.mousewheel),
            mcN = $.extend(true, {}, opts.next, opts.mousewheel);

          if (crsl.mousewheel)
          {
            $wrp.unbind(cf_e('mousewheel', conf, false));
          }
          $wrp.bind(cf_e('mousewheel', conf, false), function(e, delta) { 
            e.preventDefault();
            if (delta > 0)
            {
              $cfs.trigger(cf_e('prev', conf), [mcP]);
            }
            else
            {
              $cfs.trigger(cf_e('next', conf), [mcN]);
            }
          });
          crsl.mousewheel = true;
        }
      }

      if (opts.auto.play)
      {
        $cfs.trigger(cf_e('play', conf), opts.auto.delay);
      }

      if (crsl.upDateOnWindowResize)
      {
        var resizeFn = function(e) {
          $cfs.trigger(cf_e('finish', conf));
          if (opts.auto.pauseOnResize && !crsl.isPaused)
          {
            $cfs.trigger(cf_e('play', conf));
          }
          sz_resetMargin($cfs.children(), opts);
          $cfs.trigger(cf_e('updateSizes', conf));
        };

        var $w = $(window),
          onResize = null;

        if ($.debounce && conf.onWindowResize == 'debounce')
        {
          onResize = $.debounce(200, resizeFn);
        }
        else if ($.throttle && conf.onWindowResize == 'throttle')
        {
          onResize = $.throttle(300, resizeFn);
        }
        else
        {
          var _windowWidth = 0,
            _windowHeight = 0;

          onResize = function() {
            var nw = $w.width(),
              nh = $w.height();

            if (nw != _windowWidth || nh != _windowHeight)
            {
              resizeFn();
              _windowWidth = nw;
              _windowHeight = nh;
            }
          };
        }
        $w.bind(cf_e('resize', conf, false, true, true), onResize);
      }
    };  //  /bind_buttons


    $cfs._cfs_unbind_buttons = function() {
      var ns1 = cf_e('', conf),
        ns2 = cf_e('', conf, false);
        ns3 = cf_e('', conf, false, true, true);

      $(document).unbind(ns3);
      $(window).unbind(ns3);
      $wrp.unbind(ns2);

      if (opts.auto.button)
      {
        opts.auto.button.unbind(ns2);
      }
      if (opts.prev.button)
      {
        opts.prev.button.unbind(ns2);
      }
      if (opts.next.button)
      {
        opts.next.button.unbind(ns2);
      }
      if (opts.pagination.container)
      {
        opts.pagination.container.unbind(ns2);
        if (opts.pagination.anchorBuilder)
        {
          opts.pagination.container.children().remove();
        }
      }
      if (crsl.swipe)
      {
        $cfs.swipe('destroy');
        $wrp.css('cursor', 'default');
        crsl.swipe = false;
      }
      if (crsl.mousewheel)
      {
        crsl.mousewheel = false;
      }

      nv_showNavi(opts, 'hide', conf);
      nv_enableNavi(opts, 'removeClass', conf);

    };  //  /unbind_buttons



    //  START

    if (is_boolean(configs))
    {
      configs = {
        'debug': configs
      };
    }

    //  set vars
    var crsl = {
        'direction'   : 'next',
        'isPaused'    : true,
        'isScrolling' : false,
        'isStopped'   : false,
        'mousewheel'  : false,
        'swipe'     : false
      },
      itms = {
        'total'     : $cfs.children().length,
        'first'     : 0
      },
      tmrs = {
        'auto'      : null,
        'progress'    : null,
        'startTime'   : getTime(),
        'timePassed'  : 0
      },
      scrl = {
        'isStopped'   : false,
        'duration'    : 0,
        'startTime'   : 0,
        'easing'    : '',
        'anims'     : []
      },
      clbk = {
        'onBefore'    : [],
        'onAfter'   : []
      },
      queu = [],
      conf = $.extend(true, {}, $.fn.carouFredSel.configs, configs),
      opts = {},
      opts_orig = $.extend(true, {}, options), 
      $wrp = $cfs.wrap('<'+conf.wrapper.element+' class="'+conf.wrapper.classname+'" />').parent();


    conf.selector   = $cfs.selector;
    conf.serialNumber = $.fn.carouFredSel.serialNumber++;


    //  create carousel
    $cfs._cfs_init(opts_orig, true, starting_position);
    $cfs._cfs_build();
    $cfs._cfs_bind_events();
    $cfs._cfs_bind_buttons();

    //  find item to start
    if (is_array(opts.items.start))
    {
      var start_arr = opts.items.start;
    }
    else
    {
      var start_arr = [];
      if (opts.items.start != 0)
      {
        start_arr.push(opts.items.start);
      }
    }
    if (opts.cookie)
    {
      start_arr.unshift(parseInt(cf_getCookie(opts.cookie), 10));
    }

    if (start_arr.length > 0)
    {
      for (var a = 0, l = start_arr.length; a < l; a++)
      {
        var s = start_arr[a];
        if (s == 0)
        {
          continue;
        }
        if (s === true)
        {
          s = window.location.hash;
          if (s.length < 1)
          {
            continue;
          }
        }
        else if (s === 'random')
        {
          s = Math.floor(Math.random()*itms.total);
        }
        if ($cfs.triggerHandler(cf_e('slideTo', conf), [s, 0, true, { fx: 'none' }]))
        {
          break;
        }
      }
    }
    var siz = sz_setSizes($cfs, opts),
      itm = gi_getCurrentItems($cfs.children(), opts);

    if (opts.onCreate)
    {
      opts.onCreate.call($tt0, {
        'width': siz.width,
        'height': siz.height,
        'items': itm
      });
    }

    $cfs.trigger(cf_e('updatePageStatus', conf), [true, siz]);
    $cfs.trigger(cf_e('linkAnchors', conf));

    if (conf.debug)
    {
      $cfs.trigger(cf_e('debug', conf));
    }

    return $cfs;
  };



  //  GLOBAL PUBLIC

  $.fn.carouFredSel.serialNumber = 1;
  $.fn.carouFredSel.defaults = {
    'synchronise' : false,
    'infinite'    : true,
    'circular'    : true,
    'responsive'  : false,
    'direction'   : 'left',
    'items'     : {
      'start'     : 0
    },
    'scroll'    : {
      'easing'    : 'swing',
      'duration'    : 500,
      'pauseOnHover'  : false,
      'event'     : 'click',
      'queue'     : false
    }
  };
  $.fn.carouFredSel.configs = {
    'debug'     : false,
    'onWindowResize': 'throttle',
    'events'    : {
      'prefix'    : '',
      'namespace'   : 'cfs'
    },
    'wrapper'   : {
      'element'   : 'div',
      'classname'   : 'caroufredsel_wrapper'
    },
    'classnames'  : {}
  };
  $.fn.carouFredSel.pageAnchorBuilder = function(nr) {
    return '<a href="#"><span>'+nr+'</span></a>';
  };
  $.fn.carouFredSel.progressbarUpdater = function(perc) {
    $(this).css('width', perc+'%');
  };

  $.fn.carouFredSel.cookie = {
    get: function(n) {
      n += '=';
      var ca = document.cookie.split(';');
      for (var a = 0, l = ca.length; a < l; a++)
      {
        var c = ca[a];
        while (c.charAt(0) == ' ')
        {
          c = c.slice(1);
        }
        if (c.indexOf(n) == 0)
        {
          return c.slice(n.length);
        }
      }
      return 0;
    },
    set: function(n, v, d) {
      var e = "";
      if (d)
      {
        var date = new Date();
        date.setTime(date.getTime() + (d * 24 * 60 * 60 * 1000));
        e = "; expires=" + date.toGMTString();
      }
      document.cookie = n + '=' + v + e + '; path=/';
    },
    remove: function(n) {
      $.fn.carouFredSel.cookie.set(n, "", -1);
    }
  };


  //  GLOBAL PRIVATE

  //  scrolling functions
  function sc_setScroll(d, e) {
    return {
      anims: [],
      duration: d,
      orgDuration: d,
      easing: e,
      startTime: getTime()
    };
  }
  function sc_startScroll(s) {

    if (is_object(s.pre))
    {
      sc_startScroll(s.pre);
    }
    for (var a = 0, l = s.anims.length; a < l; a++)
    {
      var b = s.anims[a];
      if (!b)
      {
        continue;
      }
      if (b[3])
      {
        b[0].stop();
      }
      b[0].animate(b[1], {
        complete: b[2],
        duration: s.duration,
        easing: s.easing
      });
    }
    if (is_object(s.post))
    {
      sc_startScroll(s.post);
    }
  }
  function sc_stopScroll(s, finish) {
    if (!is_boolean(finish))
    {
      finish = true;
    }
    if (is_object(s.pre))
    {
      sc_stopScroll(s.pre, finish);
    }
    for (var a = 0, l = s.anims.length; a < l; a++)
    {
      var b = s.anims[a];
      b[0].stop(true);
      if (finish)
      {
        b[0].css(b[1]);
        if (is_function(b[2]))
        {
          b[2]();
        }
      }
    }
    if (is_object(s.post))
    {
      sc_stopScroll(s.post, finish);
    }
  }
  function sc_afterScroll( $c, $c2, o ) {
    if ($c2)
    {
      $c2.remove();
    }

    switch(o.fx) {
      case 'fade':
      case 'crossfade':
      case 'cover-fade':
      case 'uncover-fade':
        $c.css('filter', '');
        break;
    }
  }
  function sc_fireCallbacks($t, o, b, a, c) {
    if (o[b])
    {
      o[b].call($t, a);
    }
    if (c[b].length)
    {
      for (var i = 0, l = c[b].length; i < l; i++)
      {
        c[b][i].call($t, a);
      }
    }
    return [];
  }
  function sc_fireQueue($c, q, c) {

    if (q.length)
    {
      $c.trigger(cf_e(q[0][0], c), q[0][1]);
      q.shift();
    }
    return q;
  }
  function sc_hideHiddenItems(hiddenitems) {
    hiddenitems.each(function() {
      var hi = $(this);
      hi.data('_cfs_isHidden', hi.is(':hidden')).hide();
    });
  }
  function sc_showHiddenItems(hiddenitems) {
    if (hiddenitems)
    {
      hiddenitems.each(function() {
        var hi = $(this);
        if (!hi.data('_cfs_isHidden'))
        {
          hi.show();
        }
      });
    }
  }
  function sc_clearTimers(t) {
    if (t.auto)
    {
      clearTimeout(t.auto);
    }
    if (t.progress)
    {
      clearInterval(t.progress);
    }
    return t;
  }
  function sc_mapCallbackArguments(i_old, i_skp, i_new, s_itm, s_dir, s_dur, w_siz) {
    return {
      'width': w_siz.width,
      'height': w_siz.height,
      'items': {
        'old': i_old,
        'skipped': i_skp,
        'visible': i_new,

        //  DEPRECATED
        'new': i_new
        //  /DEPRECATED
      },
      'scroll': {
        'items': s_itm,
        'direction': s_dir,
        'duration': s_dur
      }
    };
  }
  function sc_getDuration( sO, o, nI, siz ) {
    var dur = sO.duration;
    if (sO.fx == 'none')
    {
      return 0;
    }
    if (dur == 'auto')
    {
      dur = o.scroll.duration / o.scroll.items * nI;
    }
    else if (dur < 10)
    {
      dur = siz / dur;
    }
    if (dur < 1)
    {
      return 0;
    }
    if (sO.fx == 'fade')
    {
      dur = dur / 2;
    }
    return Math.round(dur);
  }

  //  navigation functions
  function nv_showNavi(o, t, c) {
    var minimum = (is_number(o.items.minimum)) ? o.items.minimum : o.items.visible + 1;
    if (t == 'show' || t == 'hide')
    {
      var f = t;
    }
    else if (minimum > t)
    {
      debug(c, 'Not enough items ('+t+' total, '+minimum+' needed): Hiding navigation.');
      var f = 'hide';
    }
    else
    {
      var f = 'show';
    }
    var s = (f == 'show') ? 'removeClass' : 'addClass',
      h = cf_c('hidden', c);

    if (o.auto.button)
    {
      o.auto.button[f]()[s](h);
    }
    if (o.prev.button)
    {
      o.prev.button[f]()[s](h);
    }
    if (o.next.button)
    {
      o.next.button[f]()[s](h);
    }
    if (o.pagination.container)
    {
      o.pagination.container[f]()[s](h);
    }
  }
  function nv_enableNavi(o, f, c) {
    if (o.circular || o.infinite) return;
    var fx = (f == 'removeClass' || f == 'addClass') ? f : false,
      di = cf_c('disabled', c);

    if (o.auto.button && fx)
    {
      o.auto.button[fx](di);
    }
    if (o.prev.button)
    {
      var fn = fx || (f == 0) ? 'addClass' : 'removeClass';
      o.prev.button[fn](di);
    }
    if (o.next.button)
    {
      var fn = fx || (f == o.items.visible) ? 'addClass' : 'removeClass';
      o.next.button[fn](di);
    }
  }

  //  get object functions
  function go_getObject($tt, obj) {
    if (is_function(obj))
    {
      obj = obj.call($tt);
    }
    else if (is_undefined(obj))
    {
      obj = {};
    }
    return obj;
  }
  function go_getItemsObject($tt, obj) {
    obj = go_getObject($tt, obj);
    if (is_number(obj))
    {
      obj = {
        'visible': obj
      };
    }
    else if (obj == 'variable')
    {
      obj = {
        'visible': obj,
        'width': obj, 
        'height': obj
      };
    }
    else if (!is_object(obj))
    {
      obj = {};
    }
    return obj;
  }
  function go_getScrollObject($tt, obj) {
    obj = go_getObject($tt, obj);
    if (is_number(obj))
    {
      if (obj <= 50)
      {
        obj = {
          'items': obj
        };
      }
      else
      {
        obj = {
          'duration': obj
        };
      }
    }
    else if (is_string(obj))
    {
      obj = {
        'easing': obj
      };
    }
    else if (!is_object(obj))
    {
      obj = {};
    }
    return obj;
  }
  function go_getNaviObject($tt, obj) {
    obj = go_getObject($tt, obj);
    if (is_string(obj))
    {
      var temp = cf_getKeyCode(obj);
      if (temp == -1)
      {
        obj = $(obj);
      }
      else
      {
        obj = temp;
      }
    }
    return obj;
  }

  function go_getAutoObject($tt, obj) {
    obj = go_getNaviObject($tt, obj);
    if (is_jquery(obj))
    {
      obj = {
        'button': obj
      };
    }
    else if (is_boolean(obj))
    {
      obj = {
        'play': obj
      };
    }
    else if (is_number(obj))
    {
      obj = {
        'timeoutDuration': obj
      };
    }
    if (obj.progress)
    {
      if (is_string(obj.progress) || is_jquery(obj.progress))
      {
        obj.progress = {
          'bar': obj.progress
        };
      }
    }
    return obj;
  }
  function go_complementAutoObject($tt, obj) {
    if (is_function(obj.button))
    {
      obj.button = obj.button.call($tt);
    }
    if (is_string(obj.button))
    {
      obj.button = $(obj.button);
    }
    if (!is_boolean(obj.play))
    {
      obj.play = true;
    }
    if (!is_number(obj.delay))
    {
      obj.delay = 0;
    }
    if (is_undefined(obj.pauseOnEvent))
    {
      obj.pauseOnEvent = true;
    }
    if (!is_boolean(obj.pauseOnResize))
    {
      obj.pauseOnResize = true;
    }
    if (!is_number(obj.timeoutDuration))
    {
      obj.timeoutDuration = (obj.duration < 10)
        ? 2500
        : obj.duration * 5;
    }
    if (obj.progress)
    {
      if (is_function(obj.progress.bar))
      {
        obj.progress.bar = obj.progress.bar.call($tt);
      }
      if (is_string(obj.progress.bar))
      {
        obj.progress.bar = $(obj.progress.bar);
      }
      if (obj.progress.bar)
      {
        if (!is_function(obj.progress.updater))
        {
          obj.progress.updater = $.fn.carouFredSel.progressbarUpdater;
        }
        if (!is_number(obj.progress.interval))
        {
          obj.progress.interval = 50;
        }
      }
      else
      {
        obj.progress = false;
      }
    }
    return obj;
  }

  function go_getPrevNextObject($tt, obj) {
    obj = go_getNaviObject($tt, obj);
    if (is_jquery(obj))
    {
      obj = {
        'button': obj
      };
    }
    else if (is_number(obj))
    {
      obj = {
        'key': obj
      };
    }
    return obj;
  }
  function go_complementPrevNextObject($tt, obj) {
    if (is_function(obj.button))
    {
      obj.button = obj.button.call($tt);
    }
    if (is_string(obj.button))
    {
      obj.button = $(obj.button);
    }
    if (is_string(obj.key))
    {
      obj.key = cf_getKeyCode(obj.key);
    }
    return obj;
  }

  function go_getPaginationObject($tt, obj) {
    obj = go_getNaviObject($tt, obj);
    if (is_jquery(obj))
    {
      obj = {
        'container': obj
      };
    }
    else if (is_boolean(obj))
    {
      obj = {
        'keys': obj
      };
    }
    return obj;
  }
  function go_complementPaginationObject($tt, obj) {
    if (is_function(obj.container))
    {
      obj.container = obj.container.call($tt);
    }
    if (is_string(obj.container))
    {
      obj.container = $(obj.container);
    }
    if (!is_number(obj.items))
    {
      obj.items = false;
    }
    if (!is_boolean(obj.keys))
    {
      obj.keys = false;
    }
    if (!is_function(obj.anchorBuilder) && !is_false(obj.anchorBuilder))
    {
      obj.anchorBuilder = $.fn.carouFredSel.pageAnchorBuilder;
    }
    if (!is_number(obj.deviation))
    {
      obj.deviation = 0;
    }
    return obj;
  }

  function go_getSwipeObject($tt, obj) {
    if (is_function(obj))
    {
      obj = obj.call($tt);
    }
    if (is_undefined(obj))
    {
      obj = {
        'onTouch': false
      };
    }
    if (is_true(obj))
    {
      obj = {
        'onTouch': obj
      };
    }
    else if (is_number(obj))
    {
      obj = {
        'items': obj
      };
    }
    return obj;
  }
  function go_complementSwipeObject($tt, obj) {
    if (!is_boolean(obj.onTouch))
    {
      obj.onTouch = true;
    }
    if (!is_boolean(obj.onMouse))
    {
      obj.onMouse = false;
    }
    if (!is_object(obj.options))
    {
      obj.options = {};
    }
    if (!is_boolean(obj.options.triggerOnTouchEnd))
    {
      obj.options.triggerOnTouchEnd = false;
    }
    return obj;
  }
  function go_getMousewheelObject($tt, obj) {
    if (is_function(obj))
    {
      obj = obj.call($tt);
    }
    if (is_true(obj))
    {
      obj = {};
    }
    else if (is_number(obj))
    {
      obj = {
        'items': obj
      };
    }
    else if (is_undefined(obj))
    {
      obj = false;
    }
    return obj;
  }
  function go_complementMousewheelObject($tt, obj) {
    return obj;
  }

  //  get number functions
  function gn_getItemIndex(num, dev, org, items, $cfs) {
    if (is_string(num))
    {
      num = $(num, $cfs);
    }

    if (is_object(num))
    {
      num = $(num, $cfs);
    }
    if (is_jquery(num))
    {
      num = $cfs.children().index(num);
      if (!is_boolean(org))
      {
        org = false;
      }
    }
    else
    {
      if (!is_boolean(org))
      {
        org = true;
      }
    }
    if (!is_number(num))
    {
      num = 0;
    }
    if (!is_number(dev))
    {
      dev = 0;
    }

    if (org)
    {
      num += items.first;
    }
    num += dev;
    if (items.total > 0)
    {
      while (num >= items.total)
      {
        num -= items.total;
      }
      while (num < 0)
      {
        num += items.total;
      }
    }
    return num;
  }

  //  items prev
  function gn_getVisibleItemsPrev(i, o, s) {
    var t = 0,
      x = 0;

    for (var a = s; a >= 0; a--)
    {
      var j = i.eq(a);
      t += (j.is(':visible')) ? j[o.d['outerWidth']](true) : 0;
      if (t > o.maxDimension)
      {
        return x;
      }
      if (a == 0)
      {
        a = i.length;
      }
      x++;
    }
  }
  function gn_getVisibleItemsPrevFilter(i, o, s) {
    return gn_getItemsPrevFilter(i, o.items.filter, o.items.visibleConf.org, s);
  }
  function gn_getScrollItemsPrevFilter(i, o, s, m) {
    return gn_getItemsPrevFilter(i, o.items.filter, m, s);
  }
  function gn_getItemsPrevFilter(i, f, m, s) {
    var t = 0,
      x = 0;

    for (var a = s, l = i.length; a >= 0; a--)
    {
      x++;
      if (x == l)
      {
        return x;
      }

      var j = i.eq(a);
      if (j.is(f))
      {
        t++;
        if (t == m)
        {
          return x;
        }
      }
      if (a == 0)
      {
        a = l;
      }
    }
  }

  function gn_getVisibleOrg($c, o) {
    return o.items.visibleConf.org || $c.children().slice(0, o.items.visible).filter(o.items.filter).length;
  }

  //  items next
  function gn_getVisibleItemsNext(i, o, s) {
    var t = 0,
      x = 0;

    for (var a = s, l = i.length-1; a <= l; a++)
    {
      var j = i.eq(a);

      t += (j.is(':visible')) ? j[o.d['outerWidth']](true) : 0;
      if (t > o.maxDimension)
      {
        return x;
      }

      x++;
      if (x == l+1)
      {
        return x;
      }
      if (a == l)
      {
        a = -1;
      }
    }
  }
  function gn_getVisibleItemsNextTestCircular(i, o, s, l) {
    var v = gn_getVisibleItemsNext(i, o, s);
    if (!o.circular)
    {
      if (s + v > l)
      {
        v = l - s;
      }
    }
    return v;
  }
  function gn_getVisibleItemsNextFilter(i, o, s) {
    return gn_getItemsNextFilter(i, o.items.filter, o.items.visibleConf.org, s, o.circular);
  }
  function gn_getScrollItemsNextFilter(i, o, s, m) {
    return gn_getItemsNextFilter(i, o.items.filter, m+1, s, o.circular) - 1;
  }
  function gn_getItemsNextFilter(i, f, m, s, c) {
    var t = 0,
      x = 0;

    for (var a = s, l = i.length-1; a <= l; a++)
    {
      x++;
      if (x >= l)
      {
        return x;
      }

      var j = i.eq(a);
      if (j.is(f))
      {
        t++;
        if (t == m)
        {
          return x;
        }
      }
      if (a == l)
      {
        a = -1;
      }
    }
  }

  //  get items functions
  function gi_getCurrentItems(i, o) {
    return i.slice(0, o.items.visible);
  }
  function gi_getOldItemsPrev(i, o, n) {
    return i.slice(n, o.items.visibleConf.old+n);
  }
  function gi_getNewItemsPrev(i, o) {
    return i.slice(0, o.items.visible);
  }
  function gi_getOldItemsNext(i, o) {
    return i.slice(0, o.items.visibleConf.old);
  }
  function gi_getNewItemsNext(i, o, n) {
    return i.slice(n, o.items.visible+n);
  }

  //  sizes functions
  function sz_storeMargin(i, o, d) {
    if (o.usePadding)
    {
      if (!is_string(d))
      {
        d = '_cfs_origCssMargin';
      }
      i.each(function() {
        var j = $(this),
          m = parseInt(j.css(o.d['marginRight']), 10);
        if (!is_number(m)) 
        {
          m = 0;
        }
        j.data(d, m);
      });
    }
  }
  function sz_resetMargin(i, o, m) {
    if (o.usePadding)
    {
      var x = (is_boolean(m)) ? m : false;
      if (!is_number(m))
      {
        m = 0;
      }
      sz_storeMargin(i, o, '_cfs_tempCssMargin');
      i.each(function() {
        var j = $(this);
        j.css(o.d['marginRight'], ((x) ? j.data('_cfs_tempCssMargin') : m + j.data('_cfs_origCssMargin')));
      });
    }
  }
  function sz_storeSizes(i, o) {
    if (o.responsive)
    {
      i.each(function() {
        var j = $(this),
          s = in_mapCss(j, ['width', 'height']);
        j.data('_cfs_origCssSizes', s);
      });
    }
  }
  function sz_setResponsiveSizes(o, all) {
    var visb = o.items.visible,
      newS = o.items[o.d['width']],
      seco = o[o.d['height']],
      secp = is_percentage(seco);

    all.each(function() {
      var $t = $(this),
        nw = newS - ms_getPaddingBorderMargin($t, o, 'Width');

      $t[o.d['width']](nw);
      if (secp)
      {
        $t[o.d['height']](ms_getPercentage(nw, seco));
      }
    });
  }
  function sz_setSizes($c, o) {
    var $w = $c.parent(),
      $i = $c.children(),
      $v = gi_getCurrentItems($i, o),
      sz = cf_mapWrapperSizes(ms_getSizes($v, o, true), o, false);

    $w.css(sz);

    if (o.usePadding)
    {
      var p = o.padding,
        r = p[o.d[1]];

      if (o.align && r < 0)
      {
        r = 0;
      }
      var $l = $v.last();
      $l.css(o.d['marginRight'], $l.data('_cfs_origCssMargin') + r);
      $c.css(o.d['top'], p[o.d[0]]);
      $c.css(o.d['left'], p[o.d[3]]);
    }

    $c.css(o.d['width'], sz[o.d['width']]+(ms_getTotalSize($i, o, 'width')*2));
    $c.css(o.d['height'], ms_getLargestSize($i, o, 'height'));
    return sz;
  }

  //  measuring functions
  function ms_getSizes(i, o, wrapper) {
    return [ms_getTotalSize(i, o, 'width', wrapper), ms_getLargestSize(i, o, 'height', wrapper)];
  }
  function ms_getLargestSize(i, o, dim, wrapper) {
    if (!is_boolean(wrapper))
    {
      wrapper = false;
    }
    if (is_number(o[o.d[dim]]) && wrapper)
    {
      return o[o.d[dim]];
    }
    if (is_number(o.items[o.d[dim]]))
    {
      return o.items[o.d[dim]];
    }
    dim = (dim.toLowerCase().indexOf('width') > -1) ? 'outerWidth' : 'outerHeight';
    return ms_getTrueLargestSize(i, o, dim);
  }
  function ms_getTrueLargestSize(i, o, dim) {
    var s = 0;

    for (var a = 0, l = i.length; a < l; a++)
    {
      var j = i.eq(a);

      var m = (j.is(':visible')) ? j[o.d[dim]](true) : 0;
      if (s < m)
      {
        s = m;
      }
    }
    return s;
  }

  function ms_getTotalSize(i, o, dim, wrapper) {
    if (!is_boolean(wrapper))
    {
      wrapper = false;
    }
    if (is_number(o[o.d[dim]]) && wrapper)
    {
      return o[o.d[dim]];
    }
    if (is_number(o.items[o.d[dim]]))
    {
      return o.items[o.d[dim]] * i.length;
    }

    var d = (dim.toLowerCase().indexOf('width') > -1) ? 'outerWidth' : 'outerHeight',
      s = 0;

    for (var a = 0, l = i.length; a < l; a++)
    {
      var j = i.eq(a);
      s += (j.is(':visible')) ? j[o.d[d]](true) : 0;
    }
    return s;
  }
  function ms_getParentSize($w, o, d) {
    var isVisible = $w.is(':visible');
    if (isVisible)
    {
      $w.hide();
    }
    var s = $w.parent()[o.d[d]]();
    if (isVisible)
    {
      $w.show();
    }
    return s;
  }
  function ms_getMaxDimension(o, a) {
    return (is_number(o[o.d['width']])) ? o[o.d['width']] : a;
  }
  function ms_hasVariableSizes(i, o, dim) {
    var s = false,
      v = false;

    for (var a = 0, l = i.length; a < l; a++)
    {
      var j = i.eq(a);

      var c = (j.is(':visible')) ? j[o.d[dim]](true) : 0;
      if (s === false)
      {
        s = c;
      }
      else if (s != c)
      {
        v = true;
      }
      if (s == 0)
      {
        v = true;
      }
    }
    return v;
  }
  function ms_getPaddingBorderMargin(i, o, d) {
    return i[o.d['outer'+d]](true) - i[o.d[d.toLowerCase()]]();
  }
  function ms_getPercentage(s, o) {
    if (is_percentage(o))
    {
      o = parseInt( o.slice(0, -1), 10 );
      if (!is_number(o))
      {
        return s;
      }
      s *= o/100;
    }
    return s;
  }

  //  config functions
  function cf_e(n, c, pf, ns, rd) {
    if (!is_boolean(pf))
    {
      pf = true;
    }
    if (!is_boolean(ns))
    {
      ns = true;
    }
    if (!is_boolean(rd))
    {
      rd = false;
    }

    if (pf)
    {
      n = c.events.prefix + n;
    }
    if (ns)
    {
      n = n +'.'+ c.events.namespace;
    }
    if (ns && rd)
    {
      n += c.serialNumber;
    }

    return n;
  }
  function cf_c(n, c) {
    return (is_string(c.classnames[n])) ? c.classnames[n] : n;
  }
  function cf_mapWrapperSizes(ws, o, p) {
    if (!is_boolean(p))
    {
      p = true;
    }
    var pad = (o.usePadding && p) ? o.padding : [0, 0, 0, 0];
    var wra = {};

    wra[o.d['width']] = ws[0] + pad[1] + pad[3];
    wra[o.d['height']] = ws[1] + pad[0] + pad[2];

    return wra;
  }
  function cf_sortParams(vals, typs) {
    var arr = [];
    for (var a = 0, l1 = vals.length; a < l1; a++)
    {
      for (var b = 0, l2 = typs.length; b < l2; b++)
      {
        if (typs[b].indexOf(typeof vals[a]) > -1 && is_undefined(arr[b]))
        {
          arr[b] = vals[a];
          break;
        }
      }
    }
    return arr;
  }
  function cf_getPadding(p) {
    if (is_undefined(p))
    {
      return [0, 0, 0, 0];
    }
    if (is_number(p))
    {
      return [p, p, p, p];
    }
    if (is_string(p))
    {
      p = p.split('px').join('').split('em').join('').split(' ');
    }

    if (!is_array(p))
    {
      return [0, 0, 0, 0];
    }
    for (var i = 0; i < 4; i++)
    {
      p[i] = parseInt(p[i], 10);
    }
    switch (p.length)
    {
      case 0:
        return [0, 0, 0, 0];
      case 1:
        return [p[0], p[0], p[0], p[0]];
      case 2:
        return [p[0], p[1], p[0], p[1]];
      case 3:
        return [p[0], p[1], p[2], p[1]];
      default:
        return [p[0], p[1], p[2], p[3]];
    }
  }
  function cf_getAlignPadding(itm, o) {
    var x = (is_number(o[o.d['width']])) ? Math.ceil(o[o.d['width']] - ms_getTotalSize(itm, o, 'width')) : 0;
    switch (o.align)
    {
      case 'left': 
        return [0, x];
      case 'right':
        return [x, 0];
      case 'center':
      default:
        return [Math.ceil(x/2), Math.floor(x/2)];
    }
  }
  function cf_getDimensions(o) {
    var dm = [
        ['width'  , 'innerWidth'  , 'outerWidth'  , 'height'  , 'innerHeight' , 'outerHeight' , 'left', 'top' , 'marginRight' , 0, 1, 2, 3],
        ['height' , 'innerHeight' , 'outerHeight' , 'width' , 'innerWidth'  , 'outerWidth'  , 'top' , 'left', 'marginBottom', 3, 2, 1, 0]
      ];

    var dl = dm[0].length,
      dx = (o.direction == 'right' || o.direction == 'left') ? 0 : 1;

    var dimensions = {};
    for (var d = 0; d < dl; d++)
    {
      dimensions[dm[0][d]] = dm[dx][d];
    }
    return dimensions;
  }
  function cf_getAdjust(x, o, a, $t) {
    var v = x;
    if (is_function(a))
    {
      v = a.call($t, v);

    }
    else if (is_string(a))
    {
      var p = a.split('+'),
        m = a.split('-');

      if (m.length > p.length)
      {
        var neg = true,
          sta = m[0],
          adj = m[1];
      }
      else
      {
        var neg = false,
          sta = p[0],
          adj = p[1];
      }

      switch(sta)
      {
        case 'even':
          v = (x % 2 == 1) ? x-1 : x;
          break;
        case 'odd':
          v = (x % 2 == 0) ? x-1 : x;
          break;
        default:
          v = x;
          break;
      }
      adj = parseInt(adj, 10);
      if (is_number(adj))
      {
        if (neg)
        {
          adj = -adj;
        }
        v += adj;
      }
    }
    if (!is_number(v) || v < 1)
    {
      v = 1;
    }
    return v;
  }
  function cf_getItemsAdjust(x, o, a, $t) {
    return cf_getItemAdjustMinMax(cf_getAdjust(x, o, a, $t), o.items.visibleConf);
  }
  function cf_getItemAdjustMinMax(v, i) {
    if (is_number(i.min) && v < i.min)
    {
      v = i.min;
    }
    if (is_number(i.max) && v > i.max)
    {
      v = i.max;
    }
    if (v < 1)
    {
      v = 1;
    }
    return v;
  }
  function cf_getSynchArr(s) {
    if (!is_array(s))
    {
      s = [[s]];
    }
    if (!is_array(s[0]))
    {
      s = [s];
    }
    for (var j = 0, l = s.length; j < l; j++)
    {
      if (is_string(s[j][0]))
      {
        s[j][0] = $(s[j][0]);
      }
      if (!is_boolean(s[j][1]))
      {
        s[j][1] = true;
      }
      if (!is_boolean(s[j][2]))
      {
        s[j][2] = true;
      }
      if (!is_number(s[j][3]))
      {
        s[j][3] = 0;
      }
    }
    return s;
  }
  function cf_getKeyCode(k) {
    if (k == 'right')
    {
      return 39;
    }
    if (k == 'left')
    {
      return 37;
    }
    if (k == 'up')
    {
      return 38;
    }
    if (k == 'down')
    {
      return 40;
    }
    return -1;
  }
  function cf_setCookie(n, $c, c) {
    if (n)
    {
      var v = $c.triggerHandler(cf_e('currentPosition', c));
      $.fn.carouFredSel.cookie.set(n, v);
    }
  }
  function cf_getCookie(n) {
    var c = $.fn.carouFredSel.cookie.get(n);
    return (c == '') ? 0 : c;
  }

  //  init function
  function in_mapCss($elem, props) {
    var css = {}, prop;
    for (var p = 0, l = props.length; p < l; p++)
    {
      prop = props[p];
      css[prop] = $elem.css(prop);
    }
    return css;
  }
  function in_complementItems(obj, opt, itm, sta) {
    if (!is_object(obj.visibleConf))
    {
      obj.visibleConf = {};
    }
    if (!is_object(obj.sizesConf))
    {
      obj.sizesConf = {};
    }

    if (obj.start == 0 && is_number(sta))
    {
      obj.start = sta;
    }

    //  visible items
    if (is_object(obj.visible))
    {
      obj.visibleConf.min = obj.visible.min;
      obj.visibleConf.max = obj.visible.max;
      obj.visible = false;
    }
    else if (is_string(obj.visible))
    {
      //  variable visible items
      if (obj.visible == 'variable')
      {
        obj.visibleConf.variable = true;
      }
      //  adjust string visible items
      else
      {
        obj.visibleConf.adjust = obj.visible;
      }
      obj.visible = false;
    }
    else if (is_function(obj.visible))
    {
      obj.visibleConf.adjust = obj.visible;
      obj.visible = false;
    }

    //  set items filter
    if (!is_string(obj.filter))
    {
      obj.filter = (itm.filter(':hidden').length > 0) ? ':visible' : '*';
    }

    //  primary item-size not set
    if (!obj[opt.d['width']])
    {
      //  responsive carousel -> set to largest
      if (opt.responsive)
      {
        debug(true, 'Set a '+opt.d['width']+' for the items!');
        obj[opt.d['width']] = ms_getTrueLargestSize(itm, opt, 'outerWidth');
      }
      //   non-responsive -> measure it or set to "variable"
      else
      {
        obj[opt.d['width']] = (ms_hasVariableSizes(itm, opt, 'outerWidth')) 
          ? 'variable' 
          : itm[opt.d['outerWidth']](true);
      }
    }

    //  secondary item-size not set -> measure it or set to "variable"
    if (!obj[opt.d['height']])
    {
      obj[opt.d['height']] = (ms_hasVariableSizes(itm, opt, 'outerHeight')) 
        ? 'variable' 
        : itm[opt.d['outerHeight']](true);
    }

    obj.sizesConf.width = obj.width;
    obj.sizesConf.height = obj.height;
    return obj;
  }
  function in_complementVisibleItems(opt, avl) {
    //  primary item-size variable -> set visible items variable
    if (opt.items[opt.d['width']] == 'variable')
    {
      opt.items.visibleConf.variable = true;
    }
    if (!opt.items.visibleConf.variable) {
      //  primary size is number -> calculate visible-items
      if (is_number(opt[opt.d['width']]))
      {
        opt.items.visible = Math.floor(opt[opt.d['width']] / opt.items[opt.d['width']]);
      }
      //  measure and calculate primary size and visible-items
      else
      {
        opt.items.visible = Math.floor(avl / opt.items[opt.d['width']]);
        opt[opt.d['width']] = opt.items.visible * opt.items[opt.d['width']];
        if (!opt.items.visibleConf.adjust)
        {
          opt.align = false;
        }
      }
      if (opt.items.visible == 'Infinity' || opt.items.visible < 1)
      {
        debug(true, 'Not a valid number of visible items: Set to "variable".');
        opt.items.visibleConf.variable = true;
      }
    }
    return opt;
  }
  function in_complementPrimarySize(obj, opt, all) {
    //  primary size set to auto -> measure largest item-size and set it
    if (obj == 'auto')
    {
      obj = ms_getTrueLargestSize(all, opt, 'outerWidth');
    }
    return obj;
  }
  function in_complementSecondarySize(obj, opt, all) {
    //  secondary size set to auto -> measure largest item-size and set it
    if (obj == 'auto')
    {
      obj = ms_getTrueLargestSize(all, opt, 'outerHeight');
    }
    //  secondary size not set -> set to secondary item-size
    if (!obj)
    {
      obj = opt.items[opt.d['height']];
    }
    return obj;
  }
  function in_getAlignPadding(o, all) {
    var p = cf_getAlignPadding(gi_getCurrentItems(all, o), o);
    o.padding[o.d[1]] = p[1];
    o.padding[o.d[3]] = p[0];
    return o;
  }
  function in_getResponsiveValues(o, all, avl) {

    var visb = cf_getItemAdjustMinMax(Math.ceil(o[o.d['width']] / o.items[o.d['width']]), o.items.visibleConf);
    if (visb > all.length)
    {
      visb = all.length;
    }

    var newS = Math.floor(o[o.d['width']]/visb);

    o.items.visible = visb;
    o.items[o.d['width']] = newS;
    o[o.d['width']] = visb * newS;
    return o;
  }


  //  buttons functions
  function bt_pauseOnHoverConfig(p) {
    if (is_string(p))
    {
      var i = (p.indexOf('immediate') > -1) ? true : false,
        r = (p.indexOf('resume')  > -1) ? true : false;
    }
    else
    {
      var i = r = false;
    }
    return [i, r];
  }
  function bt_mousesheelNumber(mw) {
    return (is_number(mw)) ? mw : null
  }

  //  helper functions
  function is_null(a) {
    return (a === null);
  }
  function is_undefined(a) {
    return (is_null(a) || typeof a == 'undefined' || a === '' || a === 'undefined');
  }
  function is_array(a) {
    return (a instanceof Array);
  }
  function is_jquery(a) {
    return (a instanceof $boost);
  }
  function is_object(a) {
    return ((a instanceof Object || typeof a == 'object') && !is_null(a) && !is_jquery(a) && !is_array(a));
  }
  function is_number(a) {
    return ((a instanceof Number || typeof a == 'number') && !isNaN(a));
  }
  function is_string(a) {
    return ((a instanceof String || typeof a == 'string') && !is_undefined(a) && !is_true(a) && !is_false(a));
  }
  function is_function(a) {
    return (a instanceof Function || typeof a == 'function');
  }
  function is_boolean(a) {
    return (a instanceof Boolean || typeof a == 'boolean' || is_true(a) || is_false(a));
  }
  function is_true(a) {
    return (a === true || a === 'true');
  }
  function is_false(a) {
    return (a === false || a === 'false');
  }
  function is_percentage(x) {
    return (is_string(x) && x.slice(-1) == '%');
  }


  function getTime() {
    return new Date().getTime();
  }

  function deprecated( o, n ) {
    debug(true, o+' is DEPRECATED, support for it will be removed. Use '+n+' instead.');
  }
  function debug(d, m) {
    if (is_object(d))
    {
      var s = ' ('+d.selector+')';
      d = d.debug;
    }
    else
    {
      var s = '';
    }
    if (!d)
    {
      return false;
    }

    if (is_string(m))
    {
      m = 'carouFredSel'+s+': ' + m;
    }
    else
    {
      m = ['carouFredSel'+s+':', m];
    }

    if (window.console && window.console.log)
    {
      window.console.log(m);
    }
    return false;
  }



  //  EASING FUNCTIONS

  $.extend($.easing, {
    'quadratic': function(t) {
      var t2 = t * t;
      return t * (-t2 * t + 4 * t2 - 6 * t + 4);
    },
    'cubic': function(t) {
      return t * (4 * t * t - 9 * t + 6);
    },
    'elastic': function(t) {
      var t2 = t * t;
      return t * (33 * t2 * t2 - 106 * t2 * t + 126 * t2 - 67 * t + 15);
    }
  });


})(jQuery);

/*
 * jQuery Tiny Pub/Sub
 * https://github.com/cowboy/jquery-tiny-pubsub
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

(function($) {

  var o = $({});

  $.subscribe = function() {
    o.on.apply(o, arguments);
  };

  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };

  $.publish = function() {
    o.trigger.apply(o, arguments);
  };

}(jQuery));

/* 
 * HTML5 Progress polyfill
 * https://github.com/LeaVerou/HTML5-Progress-polyfill
 * 
 * Copyright (c) 2012 Lea LeaVerou
 * Licensed under the MIT license.
 */

/*
 * <progress> polyfill
 * Don't forget to also include progress-polyfill.css!
 * @author Lea Verou http://leaverou.me
 */
 
(function(){

// Test browser support first
if('position' in document.createElement('progress')) {
  return;
}

/**
 * Private functions
 */

// Smoothen out differences between Object.defineProperty
// and __defineGetter__/__defineSetter__
var defineProperty, supportsEtters = true;

if(Object.defineProperty) {
  // Changed to fix issue #3 https://github.com/LeaVerou/HTML5-Progress-polyfill/issues/3
  defineProperty = function(o, property, etters) {
    etters.enumerable = true;
    etters.configurable = true;
    
    try {
      Object.defineProperty(o, property, etters);
    } catch(e) {
      if(e.number === -0x7FF5EC54) {
        etters.enumerable = false;
        Object.defineProperty(o, property, etters);
      }
    }
  }
}
else {
  if ('__defineSetter__' in document.body) {
    defineProperty = function(o, property, etters) {
      o.__defineGetter__(property, etters.get);
      
      if(etters.set) {
        o.__defineSetter__(property, etters.set);
      }
    };
  }
  else {
    // Fallback to regular properties if getters/setters are not supported
    defineProperty = function(o, property, etters) {
        o[property] = etters.get.call(o);
      },
      supportsEtters = false;
  }
}

try {
  [].slice.apply(document.images)
  
  var arr = function(collection) {
    return [].slice.apply(collection);
  }
} catch(e) {
  var arr = function(collection) {
    var ret = [], len = collection.length;
    
    for(var i=0; i<len; i++) {
      ret[i] = collection[i];
    }
    
    return ret;
  }
}

// Does the browser use attributes as properties? (IE8- bug)
var attrsAsProps = (function(){
  var e = document.createElement('div');
  e.foo = 'bar';
  return e.getAttribute('foo') === 'bar';
})();

var self = window.ProgressPolyfill = {
  DOMInterface: {
    max: {
      get: function(){
        return parseFloat(this.getAttribute('aria-valuemax')) || 1;
      },
      
      set: function(value) {
        this.setAttribute('aria-valuemax', value);
        
        if(!attrsAsProps) {
          this.setAttribute('max', value);
        }
        
        self.redraw(this);
      }
    },
    
    value: {
      get: function(){
        return parseFloat(this.getAttribute('aria-valuenow')) || 0;
      },
      
      set: function(value) {
        this.setAttribute('aria-valuenow', value);
        
        if(!attrsAsProps) {
          this.setAttribute('value', value);
        }
        
        self.redraw(this);
      }
    },
    
    position: {
      get: function(){
        return this.hasAttribute('aria-valuenow')? this.value/this.max : -1;
      }
    },
    
    labels: {
      get: function(){
        var label = this.parentNode;
        
        while(label && !/^label$/i.test(label.nodeName)) {
          label = label.parentNode;
        }
        
        var labels = label? [label] : [];
        
        if(this.id && document.querySelectorAll) {
          var forLabels = arr(document.querySelectorAll('label[for="' + this.id + '"]'));
          
          if(forLabels.length) {
            labels = labels.concat(forLabels);
          }
        }
        
        return labels;
      }
    }
  },
  
  redraw: function redraw(progress) {
    if(!self.isInited(progress)) {
      self.init(progress);
    }
    else if(!attrsAsProps) {
      progress.setAttribute('aria-valuemax', parseFloat(progress.getAttribute('max')) || 1);
      
      if(progress.hasAttribute('value')) {
        progress.setAttribute('aria-valuenow', parseFloat(progress.getAttribute('value')) || 0);
      }
      else {
        progress.removeAttribute('aria-valuenow');
      }
    }
        
    if(progress.position !== -1) {
       progress.style.paddingRight = progress.offsetWidth * (1-progress.position) + 'px';
    }
  },
  
  isInited: function(progress) {
    return progress.getAttribute('role') === 'progressbar';
  },
  
  init: function (progress) {
    if(self.isInited(progress)) {
      return; // Already init-ed
    }
    
    // Add ARIA
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', parseFloat(progress.getAttribute('max')) || 1);
    
    if(progress.hasAttribute('value')) {
      progress.setAttribute('aria-valuenow', parseFloat(progress.getAttribute('value')) || 0);
    }
    
    // We can't add them on a prototype, as it's the same for all unknown elements
    for(var attribute in self.DOMInterface) {
      defineProperty(progress, attribute, {
        get: self.DOMInterface[attribute].get,
        set: self.DOMInterface[attribute].set
      });
    }
    
    self.redraw(progress);
  },
  
  // Live NodeList, will update automatically
  progresses: document.getElementsByTagName('progress')
};



for(var i=self.progresses.length-1; i>=0; i--) {
  self.init(self.progresses[i]);
}

// Take care of future ones too, if supported
if(document.addEventListener) {
  document.addEventListener('DOMAttrModified', function(evt) {
    var node = evt.target, attribute = evt.attrName;
    
    if(/^progress$/i.test(node.nodeName) && (attribute === 'max' || attribute === 'value')) {
      self.redraw(node);
    }
  }, false);
  
  document.addEventListener('DOMNodeInserted', function(evt) {
    var node = evt.target;
    
    if(/^progress$/i.test(node.nodeName)) {
      self.init(node);
    }
  }, false);
}

})();

// handlebars.js
// lib/handlebars/base.js

/*jshint eqnull:true*/
this.Handlebars = {};

(function(Handlebars) {

Handlebars.VERSION = "1.0.rc.2";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      return Handlebars.helpers.each(context, options);
    } else {
      return inverse(this);
    }
  } else {
    return fn(context);
  }
});

Handlebars.K = function() {};

Handlebars.createFrame = Object.create || function(object) {
  Handlebars.K.prototype = object;
  var obj = new Handlebars.K();
  Handlebars.K.prototype = null;
  return obj;
};

Handlebars.logger = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

  methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

  // can be overridden in the host environment
  log: function(level, obj) {
    if (Handlebars.logger.level <= level) {
      var method = Handlebars.logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};

Handlebars.log = function(level, obj) { Handlebars.logger.log(level, obj); };

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var i = 0, ret = "", data;

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && typeof context === 'object') {
    if(context instanceof Array){
      for(var j = context.length; i<j; i++) {
        if (data) { data.index = i; }
        ret = ret + fn(context[i], { data: data });
      }
    } else {
      for(var key in context) {
        if(context.hasOwnProperty(key)) {
          if(data) { data.key = key; }
          ret = ret + fn(context[key], {data: data});
          i++;
        }
      }
    }
  }

  if(i === 0){
    ret = inverse(this);
  }

  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context, options) {
  var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
  Handlebars.log(level, context);
});

}(this.Handlebars));
;
// lib/handlebars/compiler/parser.js
/* Jison generated parser */
var handlebars = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"root":3,"program":4,"EOF":5,"simpleInverse":6,"statements":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT":14,"COMMENT":15,"OPEN_BLOCK":16,"inMustache":17,"CLOSE":18,"OPEN_INVERSE":19,"OPEN_ENDBLOCK":20,"path":21,"OPEN":22,"OPEN_UNESCAPED":23,"OPEN_PARTIAL":24,"partialName":25,"params":26,"hash":27,"DATA":28,"param":29,"STRING":30,"INTEGER":31,"BOOLEAN":32,"hashSegments":33,"hashSegment":34,"ID":35,"EQUALS":36,"PARTIAL_NAME":37,"pathSegments":38,"SEP":39,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"OPEN_PARTIAL",28:"DATA",30:"STRING",31:"INTEGER",32:"BOOLEAN",35:"ID",36:"EQUALS",37:"PARTIAL_NAME",39:"SEP"},
productions_: [0,[3,2],[4,2],[4,3],[4,2],[4,1],[4,1],[4,0],[7,1],[7,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,3],[13,4],[6,2],[17,3],[17,2],[17,2],[17,1],[17,1],[26,2],[26,1],[29,1],[29,1],[29,1],[29,1],[29,1],[27,1],[33,2],[33,1],[34,3],[34,3],[34,3],[34,3],[34,3],[25,1],[21,1],[38,3],[38,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return $$[$0-1]; 
break;
case 2: this.$ = new yy.ProgramNode([], $$[$0]); 
break;
case 3: this.$ = new yy.ProgramNode($$[$0-2], $$[$0]); 
break;
case 4: this.$ = new yy.ProgramNode($$[$0-1], []); 
break;
case 5: this.$ = new yy.ProgramNode($$[$0]); 
break;
case 6: this.$ = new yy.ProgramNode([], []); 
break;
case 7: this.$ = new yy.ProgramNode([]); 
break;
case 8: this.$ = [$$[$0]]; 
break;
case 9: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
break;
case 10: this.$ = new yy.BlockNode($$[$0-2], $$[$0-1].inverse, $$[$0-1], $$[$0]); 
break;
case 11: this.$ = new yy.BlockNode($$[$0-2], $$[$0-1], $$[$0-1].inverse, $$[$0]); 
break;
case 12: this.$ = $$[$0]; 
break;
case 13: this.$ = $$[$0]; 
break;
case 14: this.$ = new yy.ContentNode($$[$0]); 
break;
case 15: this.$ = new yy.CommentNode($$[$0]); 
break;
case 16: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]); 
break;
case 17: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]); 
break;
case 18: this.$ = $$[$0-1]; 
break;
case 19: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]); 
break;
case 20: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1], true); 
break;
case 21: this.$ = new yy.PartialNode($$[$0-1]); 
break;
case 22: this.$ = new yy.PartialNode($$[$0-2], $$[$0-1]); 
break;
case 23: 
break;
case 24: this.$ = [[$$[$0-2]].concat($$[$0-1]), $$[$0]]; 
break;
case 25: this.$ = [[$$[$0-1]].concat($$[$0]), null]; 
break;
case 26: this.$ = [[$$[$0-1]], $$[$0]]; 
break;
case 27: this.$ = [[$$[$0]], null]; 
break;
case 28: this.$ = [[new yy.DataNode($$[$0])], null]; 
break;
case 29: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
break;
case 30: this.$ = [$$[$0]]; 
break;
case 31: this.$ = $$[$0]; 
break;
case 32: this.$ = new yy.StringNode($$[$0]); 
break;
case 33: this.$ = new yy.IntegerNode($$[$0]); 
break;
case 34: this.$ = new yy.BooleanNode($$[$0]); 
break;
case 35: this.$ = new yy.DataNode($$[$0]); 
break;
case 36: this.$ = new yy.HashNode($$[$0]); 
break;
case 37: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
break;
case 38: this.$ = [$$[$0]]; 
break;
case 39: this.$ = [$$[$0-2], $$[$0]]; 
break;
case 40: this.$ = [$$[$0-2], new yy.StringNode($$[$0])]; 
break;
case 41: this.$ = [$$[$0-2], new yy.IntegerNode($$[$0])]; 
break;
case 42: this.$ = [$$[$0-2], new yy.BooleanNode($$[$0])]; 
break;
case 43: this.$ = [$$[$0-2], new yy.DataNode($$[$0])]; 
break;
case 44: this.$ = new yy.PartialNameNode($$[$0]); 
break;
case 45: this.$ = new yy.IdNode($$[$0]); 
break;
case 46: $$[$0-2].push($$[$0]); this.$ = $$[$0-2]; 
break;
case 47: this.$ = [$$[$0]]; 
break;
}
},
table: [{3:1,4:2,5:[2,7],6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],22:[1,14],23:[1,15],24:[1,16]},{1:[3]},{5:[1,17]},{5:[2,6],7:18,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,6],22:[1,14],23:[1,15],24:[1,16]},{5:[2,5],6:20,8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,5],22:[1,14],23:[1,15],24:[1,16]},{17:23,18:[1,22],21:24,28:[1,25],35:[1,27],38:26},{5:[2,8],14:[2,8],15:[2,8],16:[2,8],19:[2,8],20:[2,8],22:[2,8],23:[2,8],24:[2,8]},{4:28,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],24:[1,16]},{4:29,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],24:[1,16]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],24:[2,12]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],24:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],24:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],24:[2,15]},{17:30,21:24,28:[1,25],35:[1,27],38:26},{17:31,21:24,28:[1,25],35:[1,27],38:26},{17:32,21:24,28:[1,25],35:[1,27],38:26},{25:33,37:[1,34]},{1:[2,1]},{5:[2,2],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,2],22:[1,14],23:[1,15],24:[1,16]},{17:23,21:24,28:[1,25],35:[1,27],38:26},{5:[2,4],7:35,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,4],22:[1,14],23:[1,15],24:[1,16]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],24:[2,9]},{5:[2,23],14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],24:[2,23]},{18:[1,36]},{18:[2,27],21:41,26:37,27:38,28:[1,45],29:39,30:[1,42],31:[1,43],32:[1,44],33:40,34:46,35:[1,47],38:26},{18:[2,28]},{18:[2,45],28:[2,45],30:[2,45],31:[2,45],32:[2,45],35:[2,45],39:[1,48]},{18:[2,47],28:[2,47],30:[2,47],31:[2,47],32:[2,47],35:[2,47],39:[2,47]},{10:49,20:[1,50]},{10:51,20:[1,50]},{18:[1,52]},{18:[1,53]},{18:[1,54]},{18:[1,55],21:56,35:[1,27],38:26},{18:[2,44],35:[2,44]},{5:[2,3],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,3],22:[1,14],23:[1,15],24:[1,16]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],24:[2,17]},{18:[2,25],21:41,27:57,28:[1,45],29:58,30:[1,42],31:[1,43],32:[1,44],33:40,34:46,35:[1,47],38:26},{18:[2,26]},{18:[2,30],28:[2,30],30:[2,30],31:[2,30],32:[2,30],35:[2,30]},{18:[2,36],34:59,35:[1,60]},{18:[2,31],28:[2,31],30:[2,31],31:[2,31],32:[2,31],35:[2,31]},{18:[2,32],28:[2,32],30:[2,32],31:[2,32],32:[2,32],35:[2,32]},{18:[2,33],28:[2,33],30:[2,33],31:[2,33],32:[2,33],35:[2,33]},{18:[2,34],28:[2,34],30:[2,34],31:[2,34],32:[2,34],35:[2,34]},{18:[2,35],28:[2,35],30:[2,35],31:[2,35],32:[2,35],35:[2,35]},{18:[2,38],35:[2,38]},{18:[2,47],28:[2,47],30:[2,47],31:[2,47],32:[2,47],35:[2,47],36:[1,61],39:[2,47]},{35:[1,62]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],24:[2,10]},{21:63,35:[1,27],38:26},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],24:[2,11]},{14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],24:[2,16]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],24:[2,19]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],24:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],24:[2,21]},{18:[1,64]},{18:[2,24]},{18:[2,29],28:[2,29],30:[2,29],31:[2,29],32:[2,29],35:[2,29]},{18:[2,37],35:[2,37]},{36:[1,61]},{21:65,28:[1,69],30:[1,66],31:[1,67],32:[1,68],35:[1,27],38:26},{18:[2,46],28:[2,46],30:[2,46],31:[2,46],32:[2,46],35:[2,46],39:[2,46]},{18:[1,70]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],24:[2,22]},{18:[2,39],35:[2,39]},{18:[2,40],35:[2,40]},{18:[2,41],35:[2,41]},{18:[2,42],35:[2,42]},{18:[2,43],35:[2,43]},{5:[2,18],14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],24:[2,18]}],
defaultActions: {17:[2,1],25:[2,28],38:[2,26],57:[2,24]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};
/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        if (this.options.ranges) this.yylloc.range = [0,0];
        this.offset = 0;
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) this.yylloc.range[1]++;

        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length-1);
        this.matched = this.matched.substr(0, this.matched.length-1);

        if (lines.length-1) this.yylineno -= lines.length-1;
        var r = this.yylloc.range;

        this.yylloc = {first_line: this.yylloc.first_line,
          last_line: this.yylineno+1,
          first_column: this.yylloc.first_column,
          last_column: lines ?
              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
              this.yylloc.first_column - len
          };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this.unput(this.match.slice(n));
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:
                                   if(yy_.yytext.slice(-1) !== "\\") this.begin("mu");
                                   if(yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0,yy_.yyleng-1), this.begin("emu");
                                   if(yy_.yytext) return 14;
                                 
break;
case 1: return 14; 
break;
case 2:
                                   if(yy_.yytext.slice(-1) !== "\\") this.popState();
                                   if(yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0,yy_.yyleng-1);
                                   return 14;
                                 
break;
case 3: yy_.yytext = yy_.yytext.substr(0, yy_.yyleng-4); this.popState(); return 15; 
break;
case 4: this.begin("par"); return 24; 
break;
case 5: return 16; 
break;
case 6: return 20; 
break;
case 7: return 19; 
break;
case 8: return 19; 
break;
case 9: return 23; 
break;
case 10: return 23; 
break;
case 11: this.popState(); this.begin('com'); 
break;
case 12: yy_.yytext = yy_.yytext.substr(3,yy_.yyleng-5); this.popState(); return 15; 
break;
case 13: return 22; 
break;
case 14: return 36; 
break;
case 15: return 35; 
break;
case 16: return 35; 
break;
case 17: return 39; 
break;
case 18: /*ignore whitespace*/ 
break;
case 19: this.popState(); return 18; 
break;
case 20: this.popState(); return 18; 
break;
case 21: yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2).replace(/\\"/g,'"'); return 30; 
break;
case 22: yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2).replace(/\\'/g,"'"); return 30; 
break;
case 23: yy_.yytext = yy_.yytext.substr(1); return 28; 
break;
case 24: return 32; 
break;
case 25: return 32; 
break;
case 26: return 31; 
break;
case 27: return 35; 
break;
case 28: yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 35; 
break;
case 29: return 'INVALID'; 
break;
case 30: /*ignore whitespace*/ 
break;
case 31: this.popState(); return 37; 
break;
case 32: return 5; 
break;
}
};
lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\{\{>)/,/^(?:\{\{#)/,/^(?:\{\{\/)/,/^(?:\{\{\^)/,/^(?:\{\{\s*else\b)/,/^(?:\{\{\{)/,/^(?:\{\{&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{)/,/^(?:=)/,/^(?:\.(?=[} ]))/,/^(?:\.\.)/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}\}\})/,/^(?:\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@[a-zA-Z]+)/,/^(?:true(?=[}\s]))/,/^(?:false(?=[}\s]))/,/^(?:[0-9]+(?=[}\s]))/,/^(?:[a-zA-Z0-9_$-]+(?=[=}\s\/.]))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:\s+)/,/^(?:[a-zA-Z0-9_$-/]+)/,/^(?:$)/];
lexer.conditions = {"mu":{"rules":[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,32],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[3],"inclusive":false},"par":{"rules":[30,31],"inclusive":false},"INITIAL":{"rules":[0,1,32],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;
function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();;
// lib/handlebars/compiler/base.js
Handlebars.Parser = handlebars;

Handlebars.parse = function(string) {
  Handlebars.Parser.yy = Handlebars.AST;
  return Handlebars.Parser.parse(string);
};

Handlebars.print = function(ast) {
  return new Handlebars.PrintVisitor().accept(ast);
};;
// lib/handlebars/compiler/ast.js
(function() {

  Handlebars.AST = {};

  Handlebars.AST.ProgramNode = function(statements, inverse) {
    this.type = "program";
    this.statements = statements;
    if(inverse) { this.inverse = new Handlebars.AST.ProgramNode(inverse); }
  };

  Handlebars.AST.MustacheNode = function(rawParams, hash, unescaped) {
    this.type = "mustache";
    this.escaped = !unescaped;
    this.hash = hash;

    var id = this.id = rawParams[0];
    var params = this.params = rawParams.slice(1);

    // a mustache is an eligible helper if:
    // * its id is simple (a single part, not `this` or `..`)
    var eligibleHelper = this.eligibleHelper = id.isSimple;

    // a mustache is definitely a helper if:
    // * it is an eligible helper, and
    // * it has at least one parameter or hash segment
    this.isHelper = eligibleHelper && (params.length || hash);

    // if a mustache is an eligible helper but not a definite
    // helper, it is ambiguous, and will be resolved in a later
    // pass or at runtime.
  };

  Handlebars.AST.PartialNode = function(partialName, context) {
    this.type         = "partial";
    this.partialName  = partialName;
    this.context      = context;
  };

  var verifyMatch = function(open, close) {
    if(open.original !== close.original) {
      throw new Handlebars.Exception(open.original + " doesn't match " + close.original);
    }
  };

  Handlebars.AST.BlockNode = function(mustache, program, inverse, close) {
    verifyMatch(mustache.id, close);
    this.type = "block";
    this.mustache = mustache;
    this.program  = program;
    this.inverse  = inverse;

    if (this.inverse && !this.program) {
      this.isInverse = true;
    }
  };

  Handlebars.AST.ContentNode = function(string) {
    this.type = "content";
    this.string = string;
  };

  Handlebars.AST.HashNode = function(pairs) {
    this.type = "hash";
    this.pairs = pairs;
  };

  Handlebars.AST.IdNode = function(parts) {
    this.type = "ID";
    this.original = parts.join(".");

    var dig = [], depth = 0;

    for(var i=0,l=parts.length; i<l; i++) {
      var part = parts[i];

      if(part === "..") { depth++; }
      else if(part === "." || part === "this") { this.isScoped = true; }
      else { dig.push(part); }
    }

    this.parts    = dig;
    this.string   = dig.join('.');
    this.depth    = depth;

    // an ID is simple if it only has one part, and that part is not
    // `..` or `this`.
    this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

    this.stringModeValue = this.string;
  };

  Handlebars.AST.PartialNameNode = function(name) {
    this.type = "PARTIAL_NAME";
    this.name = name;
  };

  Handlebars.AST.DataNode = function(id) {
    this.type = "DATA";
    this.id = id;
  };

  Handlebars.AST.StringNode = function(string) {
    this.type = "STRING";
    this.string = string;
    this.stringModeValue = string;
  };

  Handlebars.AST.IntegerNode = function(integer) {
    this.type = "INTEGER";
    this.integer = integer;
    this.stringModeValue = Number(integer);
  };

  Handlebars.AST.BooleanNode = function(bool) {
    this.type = "BOOLEAN";
    this.bool = bool;
    this.stringModeValue = bool === "true";
  };

  Handlebars.AST.CommentNode = function(comment) {
    this.type = "comment";
    this.comment = comment;
  };

})();;
// lib/handlebars/utils.js

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  Handlebars.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (!value && value !== 0) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();;
// lib/handlebars/compiler/compiler.js

/*jshint eqnull:true*/
Handlebars.Compiler = function() {};
Handlebars.JavaScriptCompiler = function() {};

(function(Compiler, JavaScriptCompiler) {
  // the foundHelper register will disambiguate helper lookup from finding a
  // function in a context. This is necessary for mustache compatibility, which
  // requires that context functions in blocks are evaluated by blockHelperMissing,
  // and then proceed as if the resulting value was provided to blockHelperMissing.

  Compiler.prototype = {
    compiler: Compiler,

    disassemble: function() {
      var opcodes = this.opcodes, opcode, out = [], params, param;

      for (var i=0, l=opcodes.length; i<l; i++) {
        opcode = opcodes[i];

        if (opcode.opcode === 'DECLARE') {
          out.push("DECLARE " + opcode.name + "=" + opcode.value);
        } else {
          params = [];
          for (var j=0; j<opcode.args.length; j++) {
            param = opcode.args[j];
            if (typeof param === "string") {
              param = "\"" + param.replace("\n", "\\n") + "\"";
            }
            params.push(param);
          }
          out.push(opcode.opcode + " " + params.join(" "));
        }
      }

      return out.join("\n");
    },

    guid: 0,

    compile: function(program, options) {
      this.children = [];
      this.depths = {list: []};
      this.options = options;

      // These changes will propagate to the other compiler components
      var knownHelpers = this.options.knownHelpers;
      this.options.knownHelpers = {
        'helperMissing': true,
        'blockHelperMissing': true,
        'each': true,
        'if': true,
        'unless': true,
        'with': true,
        'log': true
      };
      if (knownHelpers) {
        for (var name in knownHelpers) {
          this.options.knownHelpers[name] = knownHelpers[name];
        }
      }

      return this.program(program);
    },

    accept: function(node) {
      return this[node.type](node);
    },

    program: function(program) {
      var statements = program.statements, statement;
      this.opcodes = [];

      for(var i=0, l=statements.length; i<l; i++) {
        statement = statements[i];
        this[statement.type](statement);
      }
      this.isSimple = l === 1;

      this.depths.list = this.depths.list.sort(function(a, b) {
        return a - b;
      });

      return this;
    },

    compileProgram: function(program) {
      var result = new this.compiler().compile(program, this.options);
      var guid = this.guid++, depth;

      this.usePartial = this.usePartial || result.usePartial;

      this.children[guid] = result;

      for(var i=0, l=result.depths.list.length; i<l; i++) {
        depth = result.depths.list[i];

        if(depth < 2) { continue; }
        else { this.addDepth(depth - 1); }
      }

      return guid;
    },

    block: function(block) {
      var mustache = block.mustache,
          program = block.program,
          inverse = block.inverse;

      if (program) {
        program = this.compileProgram(program);
      }

      if (inverse) {
        inverse = this.compileProgram(inverse);
      }

      var type = this.classifyMustache(mustache);

      if (type === "helper") {
        this.helperMustache(mustache, program, inverse);
      } else if (type === "simple") {
        this.simpleMustache(mustache);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('pushHash');
        this.opcode('blockValue');
      } else {
        this.ambiguousMustache(mustache, program, inverse);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('pushHash');
        this.opcode('ambiguousBlockValue');
      }

      this.opcode('append');
    },

    hash: function(hash) {
      var pairs = hash.pairs, pair, val;

      this.opcode('pushHash');

      for(var i=0, l=pairs.length; i<l; i++) {
        pair = pairs[i];
        val  = pair[1];

        if (this.options.stringParams) {
          this.opcode('pushStringParam', val.stringModeValue, val.type);
        } else {
          this.accept(val);
        }

        this.opcode('assignToHash', pair[0]);
      }
    },

    partial: function(partial) {
      var partialName = partial.partialName;
      this.usePartial = true;

      if(partial.context) {
        this.ID(partial.context);
      } else {
        this.opcode('push', 'depth0');
      }

      this.opcode('invokePartial', partialName.name);
      this.opcode('append');
    },

    content: function(content) {
      this.opcode('appendContent', content.string);
    },

    mustache: function(mustache) {
      var options = this.options;
      var type = this.classifyMustache(mustache);

      if (type === "simple") {
        this.simpleMustache(mustache);
      } else if (type === "helper") {
        this.helperMustache(mustache);
      } else {
        this.ambiguousMustache(mustache);
      }

      if(mustache.escaped && !options.noEscape) {
        this.opcode('appendEscaped');
      } else {
        this.opcode('append');
      }
    },

    ambiguousMustache: function(mustache, program, inverse) {
      var id = mustache.id, name = id.parts[0];

      this.opcode('getContext', id.depth);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      this.opcode('invokeAmbiguous', name);
    },

    simpleMustache: function(mustache, program, inverse) {
      var id = mustache.id;

      if (id.type === 'DATA') {
        this.DATA(id);
      } else if (id.parts.length) {
        this.ID(id);
      } else {
        // Simplified ID for `this`
        this.addDepth(id.depth);
        this.opcode('getContext', id.depth);
        this.opcode('pushContext');
      }

      this.opcode('resolvePossibleLambda');
    },

    helperMustache: function(mustache, program, inverse) {
      var params = this.setupFullMustacheParams(mustache, program, inverse),
          name = mustache.id.parts[0];

      if (this.options.knownHelpers[name]) {
        this.opcode('invokeKnownHelper', params.length, name);
      } else if (this.knownHelpersOnly) {
        throw new Error("You specified knownHelpersOnly, but used the unknown helper " + name);
      } else {
        this.opcode('invokeHelper', params.length, name);
      }
    },

    ID: function(id) {
      this.addDepth(id.depth);
      this.opcode('getContext', id.depth);

      var name = id.parts[0];
      if (!name) {
        this.opcode('pushContext');
      } else {
        this.opcode('lookupOnContext', id.parts[0]);
      }

      for(var i=1, l=id.parts.length; i<l; i++) {
        this.opcode('lookup', id.parts[i]);
      }
    },

    DATA: function(data) {
      this.options.data = true;
      this.opcode('lookupData', data.id);
    },

    STRING: function(string) {
      this.opcode('pushString', string.string);
    },

    INTEGER: function(integer) {
      this.opcode('pushLiteral', integer.integer);
    },

    BOOLEAN: function(bool) {
      this.opcode('pushLiteral', bool.bool);
    },

    comment: function() {},

    // HELPERS
    opcode: function(name) {
      this.opcodes.push({ opcode: name, args: [].slice.call(arguments, 1) });
    },

    declare: function(name, value) {
      this.opcodes.push({ opcode: 'DECLARE', name: name, value: value });
    },

    addDepth: function(depth) {
      if(isNaN(depth)) { throw new Error("EWOT"); }
      if(depth === 0) { return; }

      if(!this.depths[depth]) {
        this.depths[depth] = true;
        this.depths.list.push(depth);
      }
    },

    classifyMustache: function(mustache) {
      var isHelper   = mustache.isHelper;
      var isEligible = mustache.eligibleHelper;
      var options    = this.options;

      // if ambiguous, we can possibly resolve the ambiguity now
      if (isEligible && !isHelper) {
        var name = mustache.id.parts[0];

        if (options.knownHelpers[name]) {
          isHelper = true;
        } else if (options.knownHelpersOnly) {
          isEligible = false;
        }
      }

      if (isHelper) { return "helper"; }
      else if (isEligible) { return "ambiguous"; }
      else { return "simple"; }
    },

    pushParams: function(params) {
      var i = params.length, param;

      while(i--) {
        param = params[i];

        if(this.options.stringParams) {
          if(param.depth) {
            this.addDepth(param.depth);
          }

          this.opcode('getContext', param.depth || 0);
          this.opcode('pushStringParam', param.stringModeValue, param.type);
        } else {
          this[param.type](param);
        }
      }
    },

    setupMustacheParams: function(mustache) {
      var params = mustache.params;
      this.pushParams(params);

      if(mustache.hash) {
        this.hash(mustache.hash);
      } else {
        this.opcode('pushHash');
      }

      return params;
    },

    // this will replace setupMustacheParams when we're done
    setupFullMustacheParams: function(mustache, program, inverse) {
      var params = mustache.params;
      this.pushParams(params);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      if(mustache.hash) {
        this.hash(mustache.hash);
      } else {
        this.opcode('pushHash');
      }

      return params;
    }
  };

  var Literal = function(value) {
    this.value = value;
  };

  JavaScriptCompiler.prototype = {
    // PUBLIC API: You can override these methods in a subclass to provide
    // alternative compiled forms for name lookup and buffering semantics
    nameLookup: function(parent, name, type) {
      if (/^[0-9]+$/.test(name)) {
        return parent + "[" + name + "]";
      } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
        return parent + "." + name;
      }
      else {
        return parent + "['" + name + "']";
      }
    },

    appendToBuffer: function(string) {
      if (this.environment.isSimple) {
        return "return " + string + ";";
      } else {
        return "buffer += " + string + ";";
      }
    },

    initializeBuffer: function() {
      return this.quotedString("");
    },

    namespace: "Handlebars",
    // END PUBLIC API

    compile: function(environment, options, context, asObject) {
      this.environment = environment;
      this.options = options || {};

      Handlebars.log(Handlebars.logger.DEBUG, this.environment.disassemble() + "\n\n");

      this.name = this.environment.name;
      this.isChild = !!context;
      this.context = context || {
        programs: [],
        aliases: { }
      };

      this.preamble();

      this.stackSlot = 0;
      this.stackVars = [];
      this.registers = { list: [] };
      this.compileStack = [];

      this.compileChildren(environment, options);

      var opcodes = environment.opcodes, opcode;

      this.i = 0;

      for(l=opcodes.length; this.i<l; this.i++) {
        opcode = opcodes[this.i];

        if(opcode.opcode === 'DECLARE') {
          this[opcode.name] = opcode.value;
        } else {
          this[opcode.opcode].apply(this, opcode.args);
        }
      }

      return this.createFunctionContext(asObject);
    },

    nextOpcode: function() {
      var opcodes = this.environment.opcodes, opcode = opcodes[this.i + 1];
      return opcodes[this.i + 1];
    },

    eat: function(opcode) {
      this.i = this.i + 1;
    },

    preamble: function() {
      var out = [];

      if (!this.isChild) {
        var namespace = this.namespace;
        var copies = "helpers = helpers || " + namespace + ".helpers;";
        if (this.environment.usePartial) { copies = copies + " partials = partials || " + namespace + ".partials;"; }
        if (this.options.data) { copies = copies + " data = data || {};"; }
        out.push(copies);
      } else {
        out.push('');
      }

      if (!this.environment.isSimple) {
        out.push(", buffer = " + this.initializeBuffer());
      } else {
        out.push("");
      }

      // track the last context pushed into place to allow skipping the
      // getContext opcode when it would be a noop
      this.lastContext = 0;
      this.source = out;
    },

    createFunctionContext: function(asObject) {
      var locals = this.stackVars.concat(this.registers.list);

      if(locals.length > 0) {
        this.source[1] = this.source[1] + ", " + locals.join(", ");
      }

      // Generate minimizer alias mappings
      if (!this.isChild) {
        var aliases = [];
        for (var alias in this.context.aliases) {
          this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
        }
      }

      if (this.source[1]) {
        this.source[1] = "var " + this.source[1].substring(2) + ";";
      }

      // Merge children
      if (!this.isChild) {
        this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
      }

      if (!this.environment.isSimple) {
        this.source.push("return buffer;");
      }

      var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

      for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
        params.push("depth" + this.environment.depths.list[i]);
      }

      if (asObject) {
        params.push(this.source.join("\n  "));

        return Function.apply(this, params);
      } else {
        var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + this.source.join("\n  ") + '}';
        Handlebars.log(Handlebars.logger.DEBUG, functionSource + "\n\n");
        return functionSource;
      }
    },

    // [blockValue]
    //
    // On stack, before: hash, inverse, program, value
    // On stack, after: return value of blockHelperMissing
    //
    // The purpose of this opcode is to take a block of the form
    // `{{#foo}}...{{/foo}}`, resolve the value of `foo`, and
    // replace it on the stack with the result of properly
    // invoking blockHelperMissing.
    blockValue: function() {
      this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      var params = ["depth0"];
      this.setupParams(0, params);

      this.replaceStack(function(current) {
        params.splice(1, 0, current);
        return "blockHelperMissing.call(" + params.join(", ") + ")";
      });
    },

    // [ambiguousBlockValue]
    //
    // On stack, before: hash, inverse, program, value
    // Compiler value, before: lastHelper=value of last found helper, if any
    // On stack, after, if no lastHelper: same as [blockValue]
    // On stack, after, if lastHelper: value
    ambiguousBlockValue: function() {
      this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      var params = ["depth0"];
      this.setupParams(0, params);

      var current = this.topStack();
      params.splice(1, 0, current);

      this.source.push("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
    },

    // [appendContent]
    //
    // On stack, before: ...
    // On stack, after: ...
    //
    // Appends the string value of `content` to the current buffer
    appendContent: function(content) {
      this.source.push(this.appendToBuffer(this.quotedString(content)));
    },

    // [append]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Coerces `value` to a String and appends it to the current buffer.
    //
    // If `value` is truthy, or 0, it is coerced into a string and appended
    // Otherwise, the empty string is appended
    append: function() {
      var local = this.popStack();
      this.source.push("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
      if (this.environment.isSimple) {
        this.source.push("else { " + this.appendToBuffer("''") + " }");
      }
    },

    // [appendEscaped]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Escape `value` and append it to the buffer
    appendEscaped: function() {
      var opcode = this.nextOpcode(), extra = "";
      this.context.aliases.escapeExpression = 'this.escapeExpression';

      if(opcode && opcode.opcode === 'appendContent') {
        extra = " + " + this.quotedString(opcode.args[0]);
        this.eat(opcode);
      }

      this.source.push(this.appendToBuffer("escapeExpression(" + this.popStack() + ")" + extra));
    },

    // [getContext]
    //
    // On stack, before: ...
    // On stack, after: ...
    // Compiler value, after: lastContext=depth
    //
    // Set the value of the `lastContext` compiler value to the depth
    getContext: function(depth) {
      if(this.lastContext !== depth) {
        this.lastContext = depth;
      }
    },

    // [lookupOnContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext[name], ...
    //
    // Looks up the value of `name` on the current context and pushes
    // it onto the stack.
    lookupOnContext: function(name) {
      this.pushStack(this.nameLookup('depth' + this.lastContext, name, 'context'));
    },

    // [pushContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext, ...
    //
    // Pushes the value of the current context onto the stack.
    pushContext: function() {
      this.pushStackLiteral('depth' + this.lastContext);
    },

    // [resolvePossibleLambda]
    //
    // On stack, before: value, ...
    // On stack, after: resolved value, ...
    //
    // If the `value` is a lambda, replace it on the stack by
    // the return value of the lambda
    resolvePossibleLambda: function() {
      this.context.aliases.functionType = '"function"';

      this.replaceStack(function(current) {
        return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
      });
    },

    // [lookup]
    //
    // On stack, before: value, ...
    // On stack, after: value[name], ...
    //
    // Replace the value on the stack with the result of looking
    // up `name` on `value`
    lookup: function(name) {
      this.replaceStack(function(current) {
        return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
      });
    },

    // [lookupData]
    //
    // On stack, before: ...
    // On stack, after: data[id], ...
    //
    // Push the result of looking up `id` on the current data
    lookupData: function(id) {
      this.pushStack(this.nameLookup('data', id, 'data'));
    },

    // [pushStringParam]
    //
    // On stack, before: ...
    // On stack, after: string, currentContext, ...
    //
    // This opcode is designed for use in string mode, which
    // provides the string value of a parameter along with its
    // depth rather than resolving it immediately.
    pushStringParam: function(string, type) {
      this.pushStackLiteral('depth' + this.lastContext);

      this.pushString(type);

      if (typeof string === 'string') {
        this.pushString(string);
      } else {
        this.pushStackLiteral(string);
      }
    },

    pushHash: function() {
      this.push('{}');

      if (this.options.stringParams) {
        this.register('hashTypes', '{}');
      }
    },

    // [pushString]
    //
    // On stack, before: ...
    // On stack, after: quotedString(string), ...
    //
    // Push a quoted version of `string` onto the stack
    pushString: function(string) {
      this.pushStackLiteral(this.quotedString(string));
    },

    // [push]
    //
    // On stack, before: ...
    // On stack, after: expr, ...
    //
    // Push an expression onto the stack
    push: function(expr) {
      this.pushStack(expr);
    },

    // [pushLiteral]
    //
    // On stack, before: ...
    // On stack, after: value, ...
    //
    // Pushes a value onto the stack. This operation prevents
    // the compiler from creating a temporary variable to hold
    // it.
    pushLiteral: function(value) {
      this.pushStackLiteral(value);
    },

    // [pushProgram]
    //
    // On stack, before: ...
    // On stack, after: program(guid), ...
    //
    // Push a program expression onto the stack. This takes
    // a compile-time guid and converts it into a runtime-accessible
    // expression.
    pushProgram: function(guid) {
      if (guid != null) {
        this.pushStackLiteral(this.programExpression(guid));
      } else {
        this.pushStackLiteral(null);
      }
    },

    // [invokeHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // Pops off the helper's parameters, invokes the helper,
    // and pushes the helper's return value onto the stack.
    //
    // If the helper is not found, `helperMissing` is called.
    invokeHelper: function(paramSize, name) {
      this.context.aliases.helperMissing = 'helpers.helperMissing';

      var helper = this.lastHelper = this.setupHelper(paramSize, name);
      this.register('foundHelper', helper.name);

      this.pushStack("foundHelper ? foundHelper.call(" +
        helper.callParams + ") " + ": helperMissing.call(" +
        helper.helperMissingParams + ")");
    },

    // [invokeKnownHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // This operation is used when the helper is known to exist,
    // so a `helperMissing` fallback is not required.
    invokeKnownHelper: function(paramSize, name) {
      var helper = this.setupHelper(paramSize, name);
      this.pushStack(helper.name + ".call(" + helper.callParams + ")");
    },

    // [invokeAmbiguous]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of disambiguation
    //
    // This operation is used when an expression like `{{foo}}`
    // is provided, but we don't know at compile-time whether it
    // is a helper or a path.
    //
    // This operation emits more code than the other options,
    // and can be avoided by passing the `knownHelpers` and
    // `knownHelpersOnly` flags at compile-time.
    invokeAmbiguous: function(name) {
      this.context.aliases.functionType = '"function"';

      this.pushStackLiteral('{}');
      var helper = this.setupHelper(0, name);

      var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');
      this.register('foundHelper', helperName);

      var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
      var nextStack = this.nextStack();

      this.source.push('if (foundHelper) { ' + nextStack + ' = foundHelper.call(' + helper.callParams + '); }');
      this.source.push('else { ' + nextStack + ' = ' + nonHelper + '; ' + nextStack + ' = typeof ' + nextStack + ' === functionType ? ' + nextStack + '.apply(depth0) : ' + nextStack + '; }');
    },

    // [invokePartial]
    //
    // On stack, before: context, ...
    // On stack after: result of partial invocation
    //
    // This operation pops off a context, invokes a partial with that context,
    // and pushes the result of the invocation back.
    invokePartial: function(name) {
      var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];

      if (this.options.data) {
        params.push("data");
      }

      this.context.aliases.self = "this";
      this.pushStack("self.invokePartial(" + params.join(", ") + ")");
    },

    // [assignToHash]
    //
    // On stack, before: value, hash, ...
    // On stack, after: hash, ...
    //
    // Pops a value and hash off the stack, assigns `hash[key] = value`
    // and pushes the hash back onto the stack.
    assignToHash: function(key) {
      var value = this.popStack();

      if (this.options.stringParams) {
        var type = this.popStack();
        this.popStack();
        this.source.push("hashTypes['" + key + "'] = " + type + ";");
      }

      var hash = this.topStack();

      this.source.push(hash + "['" + key + "'] = " + value + ";");
    },

    // HELPERS

    compiler: JavaScriptCompiler,

    compileChildren: function(environment, options) {
      var children = environment.children, child, compiler;

      for(var i=0, l=children.length; i<l; i++) {
        child = children[i];
        compiler = new this.compiler();

        this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
        var index = this.context.programs.length;
        child.index = index;
        child.name = 'program' + index;
        this.context.programs[index] = compiler.compile(child, options, this.context);
      }
    },

    programExpression: function(guid) {
      this.context.aliases.self = "this";

      if(guid == null) {
        return "self.noop";
      }

      var child = this.environment.children[guid],
          depths = child.depths.list, depth;

      var programParams = [child.index, child.name, "data"];

      for(var i=0, l = depths.length; i<l; i++) {
        depth = depths[i];

        if(depth === 1) { programParams.push("depth0"); }
        else { programParams.push("depth" + (depth - 1)); }
      }

      if(depths.length === 0) {
        return "self.program(" + programParams.join(", ") + ")";
      } else {
        programParams.shift();
        return "self.programWithDepth(" + programParams.join(", ") + ")";
      }
    },

    register: function(name, val) {
      this.useRegister(name);
      this.source.push(name + " = " + val + ";");
    },

    useRegister: function(name) {
      if(!this.registers[name]) {
        this.registers[name] = true;
        this.registers.list.push(name);
      }
    },

    pushStackLiteral: function(item) {
      this.compileStack.push(new Literal(item));
      return item;
    },

    pushStack: function(item) {
      var stack = this.incrStack();
      this.source.push(stack + " = " + item + ";");
      this.compileStack.push(stack);
      return stack;
    },

    replaceStack: function(callback) {
      var stack = this.topStack(),
          item = callback.call(this, stack);

      // Prevent modification of the context depth variable. Through replaceStack
      if (/^depth/.test(stack)) {
        stack = this.nextStack();
      }

      this.source.push(stack + " = " + item + ";");
      return stack;
    },

    nextStack: function(skipCompileStack) {
      var name = this.incrStack();
      this.compileStack.push(name);
      return name;
    },

    incrStack: function() {
      this.stackSlot++;
      if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
      return "stack" + this.stackSlot;
    },

    popStack: function() {
      var item = this.compileStack.pop();

      if (item instanceof Literal) {
        return item.value;
      } else {
        this.stackSlot--;
        return item;
      }
    },

    topStack: function() {
      var item = this.compileStack[this.compileStack.length - 1];

      if (item instanceof Literal) {
        return item.value;
      } else {
        return item;
      }
    },

    quotedString: function(str) {
      return '"' + str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r') + '"';
    },

    setupHelper: function(paramSize, name) {
      var params = [];
      this.setupParams(paramSize, params);
      var foundHelper = this.nameLookup('helpers', name, 'helper');

      return {
        params: params,
        name: foundHelper,
        callParams: ["depth0"].concat(params).join(", "),
        helperMissingParams: ["depth0", this.quotedString(name)].concat(params).join(", ")
      };
    },

    // the params and contexts arguments are passed in arrays
    // to fill in
    setupParams: function(paramSize, params) {
      var options = [], contexts = [], types = [], param, inverse, program;

      options.push("hash:" + this.popStack());

      inverse = this.popStack();
      program = this.popStack();

      // Avoid setting fn and inverse if neither are set. This allows
      // helpers to do a check for `if (options.fn)`
      if (program || inverse) {
        if (!program) {
          this.context.aliases.self = "this";
          program = "self.noop";
        }

        if (!inverse) {
         this.context.aliases.self = "this";
          inverse = "self.noop";
        }

        options.push("inverse:" + inverse);
        options.push("fn:" + program);
      }

      for(var i=0; i<paramSize; i++) {
        param = this.popStack();
        params.push(param);

        if(this.options.stringParams) {
          types.push(this.popStack());
          contexts.push(this.popStack());
        }
      }

      if (this.options.stringParams) {
        options.push("contexts:[" + contexts.join(",") + "]");
        options.push("types:[" + types.join(",") + "]");
        options.push("hashTypes:hashTypes");
      }

      if(this.options.data) {
        options.push("data:data");
      }

      params.push("{" + options.join(",") + "}");
      return params.join(", ");
    }
  };

  var reservedWords = (
    "break else new var" +
    " case finally return void" +
    " catch for switch while" +
    " continue function this with" +
    " default if throw" +
    " delete in try" +
    " do instanceof typeof" +
    " abstract enum int short" +
    " boolean export interface static" +
    " byte extends long super" +
    " char final native synchronized" +
    " class float package throws" +
    " const goto private transient" +
    " debugger implements protected volatile" +
    " double import public let yield"
  ).split(" ");

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for(var i=0, l=reservedWords.length; i<l; i++) {
    compilerWords[reservedWords[i]] = true;
  }

  JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
    if(!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(name)) {
      return true;
    }
    return false;
  };

})(Handlebars.Compiler, Handlebars.JavaScriptCompiler);

Handlebars.precompile = function(string, options) {
  if (typeof string !== 'string') {
    throw new Handlebars.Exception("You must pass a string to Handlebars.compile. You passed " + string);
  }

  options = options || {};
  if (!('data' in options)) {
    options.data = true;
  }
  var ast = Handlebars.parse(string);
  var environment = new Handlebars.Compiler().compile(ast, options);
  return new Handlebars.JavaScriptCompiler().compile(environment, options);
};

Handlebars.compile = function(string, options) {
  if (typeof string !== 'string') {
    throw new Handlebars.Exception("You must pass a string to Handlebars.compile. You passed " + string);
  }

  options = options || {};
  if (!('data' in options)) {
    options.data = true;
  }
  var compiled;
  function compile() {
    var ast = Handlebars.parse(string);
    var environment = new Handlebars.Compiler().compile(ast, options);
    var templateSpec = new Handlebars.JavaScriptCompiler().compile(environment, options, undefined, true);
    return Handlebars.template(templateSpec);
  }

  // Template is only compiled on first use and cached after that point.
  return function(context, options) {
    if (!compiled) {
      compiled = compile();
    }
    return compiled.call(this, context, options);
  };
};
;
// lib/handlebars/runtime.js
Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };

    return function(context, options) {
      options = options || {};
      return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    var options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial, {data: data !== undefined});
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;

/*
 * backgroundSize: A jQuery cssHook adding support for "cover" and "contain" to IE6,7,8
 *
 * Requirements:
 * - jQuery 1.7.0+
 *
 * Limitations:
 * - doesn't work with multiple backgrounds (use the :after trick)
 * - doesn't work with the "4 values syntax" of background-position
 * - doesn't work with lengths in background-position (only percentages and keywords)
 * - doesn't work with "background-repeat: repeat;"
 * - doesn't work with non-default values of background-clip/origin/attachment/scroll
 * - you should still test your website in IE!
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery.backgroundSize.js
 *
 * Copyright 2012 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work?
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 *
 */
(function($,window,document,Math,undefined) {

var div = $( "<div>" )[0],
  rsrc = /url\(["']?(.*?)["']?\)/,
  watched = [],
  positions = {
    top: 0,
    left: 0,
    bottom: 1,
    right: 1,
    center: .5
  };

// feature detection
if ( "backgroundSize" in div.style && !$.debugBGS ) { return; }

$.cssHooks.backgroundSize = {
  set: function( elem, value ) {
    var firstTime = !$.data( elem, "bgsImg" ),
      pos,
      $wrapper, $img;

    $.data( elem, "bgsValue", value );

    if ( firstTime ) {
      // add this element to the 'watched' list so that it's updated on resize
      watched.push( elem );

      $.refreshBackgroundDimensions( elem, true );

      // create wrapper and img
      $wrapper = $( "<div>" ).css({
        position: "absolute",
        zIndex: -1,
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        overflow: "hidden"
      });

      $img = $( "<img>" ).css({
        position: "absolute"
      }).appendTo( $wrapper ),

      $wrapper.prependTo( elem );

      $.data( elem, "bgsImg", $img[0] );

      pos = ( 
        // Firefox, Chrome (for debug)
        $.css( elem, "backgroundPosition" ) ||
        // IE8
        $.css( elem, "backgroundPositionX" ) + " " + $.css( elem, "backgroundPositionY" )
      ).split(" ");

      // Only compatible with 1 or 2 percentage or keyword values,
      // Not yet compatible with length values and 4 values.
      $.data( elem, "bgsPos", [ 
        positions[ pos[0] ] || parseFloat( pos[0] ) / 100, 
        positions[ pos[1] ] || parseFloat( pos[1] ) / 100
      ]);

      // This is the part where we mess with the existing DOM
      // to make sure that the background image is correctly zIndexed
      $.css( elem, "zIndex" ) == "auto" && ( elem.style.zIndex = 0 );
      $.css( elem, "position" ) == "static" && ( elem.style.position = "relative" );

      $.refreshBackgroundImage( elem );

    } else {
      $.refreshBackground( elem );
    }
  },

  get: function( elem ) {
    return $.data( elem, "bgsValue" ) || "";
  }
};

// The background should refresh automatically when changing the background-image
$.cssHooks.backgroundImage = {
  set: function( elem, value ) {
    // if the element has a backgroundSize, refresh its background
    return $.data( elem, "bgsImg") ?
      $.refreshBackgroundImage( elem, value ) :
      // otherwise set the background-image normally
      value;
  }
};

$.refreshBackgroundDimensions = function( elem, noBgRefresh ) {
  var $elem = $(elem),
    currDim = {
      width: $elem.innerWidth(),
      height: $elem.innerHeight()
    },
    prevDim = $.data( elem, "bgsDim" ),
    changed = !prevDim ||
      currDim.width != prevDim.width ||
      currDim.height != prevDim.height;

  $.data( elem, "bgsDim", currDim );

  if ( changed && !noBgRefresh ) {
    $.refreshBackground( elem );
  }
};

$.refreshBackgroundImage = function( elem, value ) {
  var img = $.data( elem, "bgsImg" ),
    currSrc = ( rsrc.exec( value || $.css( elem, "backgroundImage" ) ) || [] )[1],
    prevSrc = img && img.src,
    changed = currSrc != prevSrc,
    imgWidth, imgHeight;

  if ( changed ) {
    img.style.height = img.style.width = "auto";

    img.onload = function() {
      var dim = {
        width: img.width,
        height: img.height
      };

      // ignore onload on the proxy image
      if ( dim.width == 1 && dim.height == 1 ) { return; }

      $.data( elem, "bgsImgDim", dim );
      $.data( elem, "bgsConstrain", false );

      $.refreshBackground( elem );

      img.style.visibility = "visible";

      img.onload = null;
    };

    img.style.visibility = "hidden";
    img.src = currSrc;

    if ( img.readyState || img.complete ) {
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      img.src = currSrc;
    }

    elem.style.backgroundImage = "none";
  }
};

$.refreshBackground = function( elem ) {
  var value = $.data( elem, "bgsValue" ),
    elemDim = $.data( elem, "bgsDim" ),
    imgDim = $.data( elem, "bgsImgDim" ),
    $img = $( $.data( elem, "bgsImg" ) ),
    pos = $.data( elem, "bgsPos" ),
    prevConstrain = $.data( elem, "bgsConstrain" ),
    currConstrain,
    elemRatio = elemDim.width / elemDim.height,
    imgRatio = (imgDim) ? imgDim.width / imgDim.height : 1,
    delta;

  if ( value == "contain" ) {
    if ( imgRatio > elemRatio ) {
      $.data( elem, "bgsConstrain", ( currConstrain = "width" ) );

      delta = Math.floor( ( elemDim.height - elemDim.width / imgRatio ) * pos[1] );

      $img.css({
        top: delta
      });

      // when switchin from height to with constraint,
      // make sure to release contraint on height and reset left
      if ( currConstrain != prevConstrain ) {
        $img.css({
          width: "100%",
          height: "auto",
          left: 0
        });
      }

    } else {
      $.data( elem, "bgsConstrain", ( currConstrain = "height" ) );

      delta = Math.floor( ( elemDim.width - elemDim.height * imgRatio ) * pos[0] );

      $img.css({
        left: delta
      });

      if ( currConstrain != prevConstrain ) {
        $img.css({
          height: "100%",
          width: "auto",
          top: 0
        });
      }
    }

  } else if ( value == "cover" ) {
    if ( imgRatio > elemRatio ) {
      $.data( elem, "bgsConstrain", ( currConstrain = "height" ) );

      delta = Math.floor( ( elemDim.height * imgRatio - elemDim.width ) * pos[0] );

      $img.css({
        left: -delta
      });

      if ( currConstrain != prevConstrain ) {
        $img.css({
          height:"100%",
          width: "auto",
          top: 0
        });
      }

    } else {
      $.data( elem, "bgsConstrain", ( currConstrain = "width" ) );

      delta = Math.floor( ( elemDim.width / imgRatio - elemDim.height ) * pos[1] );

      $img.css({
        top: -delta
      });

      if ( currConstrain != prevConstrain ) {
        $img.css({
          width: "100%",
          height: "auto",
          left: 0
        });
      }
    }
  }
}

// Built-in throttledresize
var $event = $.event,
  $special,
  dummy = {_:0},
  frame = 0,
  wasResized, animRunning;

$special = $event.special.throttledresize = {
  setup: function() {
    $( this ).on( "resize", $special.handler );
  },
  teardown: function() {
    $( this ).off( "resize", $special.handler );
  },
  handler: function( event, execAsap ) {
    // Save the context
    var context = this,
      args = arguments;

    wasResized = true;

        if ( !animRunning ) {
          $(dummy).animate(dummy, { duration: Infinity, step: function() {
            frame++;

            if ( frame > $special.threshold && wasResized || execAsap ) {
              // set correct event type
              event.type = "throttledresize";
              $event.dispatch.apply( context, args );
              wasResized = false;
              frame = 0;
            }
            if ( frame > 9 ) {
              $(dummy).stop();
              animRunning = false;
              frame = 0;
            }
          }});
          animRunning = true;
        }
  },
  threshold: 1
};

// All backgrounds should refresh automatically when the window is resized
$(window).on("throttledresize", function() {
  $(watched).each(function() {
    $.refreshBackgroundDimensions( this );
  });
});

})(jQuery,window,document,Math);

/*
 ### jQuery XML to JSON Plugin v1.1 - 2008-07-01 ###
 * http://www.fyneworks.com/ - diego@fyneworks.com
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 ###
 Website: http://www.fyneworks.com/jquery/xml-to-json/
*//*
 # INSPIRED BY: http://www.terracoder.com/
           AND: http://www.thomasfrank.se/xml_to_json.html
                      AND: http://www.kawa.net/works/js/xml/objtree-e.html
*//*
 This simple script converts XML (document of code) into a JSON object. It is the combination of 2
 'xml to json' great parsers (see below) which allows for both 'simple' and 'extended' parsing modes.
*/
// Avoid collisions
;if(window.jQuery) (function($){
 
 // Add function to jQuery namespace
 $.extend({
  
  // converts xml documents and xml text to json object
  xml2json: function(xml, extended) {
   if(!xml) return {}; // quick fail
   
   //### PARSER LIBRARY
   // Core function
   function parseXML(node, simple){
    if(!node) return null;
    var txt = '', obj = null, att = null;
    var nt = node.nodeType, nn = jsVar(node.localName || node.nodeName);
    var nv = node.text || node.nodeValue || '';
    /*DBG*/ //if(window.console) console.log(['x2j',nn,nt,nv.length+' bytes']);
    if(node.childNodes){
     if(node.childNodes.length>0){
      /*DBG*/ //if(window.console) console.log(['x2j',nn,'CHILDREN',node.childNodes]);
      $.each(node.childNodes, function(n,cn){
       var cnt = cn.nodeType, cnn = jsVar(cn.localName || cn.nodeName);
       var cnv = cn.text || cn.nodeValue || '';
       /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>a',cnn,cnt,cnv]);
       if(cnt == 8){
        /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>b',cnn,'COMMENT (ignore)']);
        return; // ignore comment node
       }
       else if(cnt == 3 || cnt == 4 || !cnn){
        // ignore white-space in between tags
        if(cnv.match(/^\s+$/)){
         /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>c',cnn,'WHITE-SPACE (ignore)']);
         return;
        };
        /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>d',cnn,'TEXT']);
        txt += cnv.replace(/^\s+/,'').replace(/\s+$/,'');
                // make sure we ditch trailing spaces from markup
       }
       else{
        /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>e',cnn,'OBJECT']);
        obj = obj || {};
        if(obj[cnn]){
         /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>f',cnn,'ARRAY']);
         
                  // http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
                  if(!obj[cnn].length) obj[cnn] = myArr(obj[cnn]);
                  obj[cnn] = myArr(obj[cnn]);
         
                  obj[cnn][ obj[cnn].length ] = parseXML(cn, true/* simple */);
         obj[cnn].length = obj[cnn].length;
        }
        else{
         /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>g',cnn,'dig deeper...']);
         obj[cnn] = parseXML(cn);
        };
       };
      });
     };//node.childNodes.length>0
    };//node.childNodes
    if(node.attributes){
     if(node.attributes.length>0){
      /*DBG*/ //if(window.console) console.log(['x2j',nn,'ATTRIBUTES',node.attributes])
      att = {}; obj = obj || {};
      $.each(node.attributes, function(a,at){
       var atn = jsVar(at.name), atv = at.value;
       att[atn] = atv;
       if(obj[atn]){
        /*DBG*/ //if(window.console) console.log(['x2j',nn,'attr>',atn,'ARRAY']);
        
                // http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
                //if(!obj[atn].length) obj[atn] = myArr(obj[atn]);//[ obj[ atn ] ];
        obj[cnn] = myArr(obj[cnn]);
                
                obj[atn][ obj[atn].length ] = atv;
        obj[atn].length = obj[atn].length;
       }
       else{
        /*DBG*/ //if(window.console) console.log(['x2j',nn,'attr>',atn,'TEXT']);
        obj[atn] = atv;
       };
      });
      //obj['attributes'] = att;
     };//node.attributes.length>0
    };//node.attributes
    if(obj){
     obj = $.extend( (txt!='' ? new String(txt) : {}),/* {text:txt},*/ obj || {}/*, att || {}*/);
     txt = (obj.text) ? (typeof(obj.text)=='object' ? obj.text : [obj.text || '']).concat([txt]) : txt;
     if(txt) obj.text = txt;
     txt = '';
    };
    var out = obj || txt;
    //console.log([extended, simple, out]);
    if(extended){
     if(txt) out = {};//new String(out);
     txt = out.text || txt || '';
     if(txt) out.text = txt;
     if(!simple) out = myArr(out);
    };
    return out;
   };// parseXML
   // Core Function End
   // Utility functions
   var jsVar = function(s){ return String(s || '').replace(/-/g,"_"); };
   
      // NEW isNum function: 01/09/2010
      // Thanks to Emile Grau, GigaTecnologies S.L., www.gigatransfer.com, www.mygigamail.com
      function isNum(s){
        // based on utility function isNum from xml2json plugin (http://www.fyneworks.com/ - diego@fyneworks.com)
        // few bugs corrected from original function :
        // - syntax error : regexp.test(string) instead of string.test(reg)
        // - regexp modified to accept  comma as decimal mark (latin syntax : 25,24 )
        // - regexp modified to reject if no number before decimal mark  : ".7" is not accepted
        // - string is "trimmed", allowing to accept space at the beginning and end of string
        var regexp=/^((-)?([0-9]+)(([\.\,]{0,1})([0-9]+))?$)/
        return (typeof s == "number") || regexp.test(String((s && typeof s == "string") ? jQuery.trim(s) : ''));
      };
      // OLD isNum function: (for reference only)
      //var isNum = function(s){ return (typeof s == "number") || String((s && typeof s == "string") ? s : '').test(/^((-)?([0-9]*)((\.{0,1})([0-9]+))?$)/); };
                                
   var myArr = function(o){
    
        // http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
        //if(!o.length) o = [ o ]; o.length=o.length;
    if(!$.isArray(o)) o = [ o ]; o.length=o.length;
        
        // here is where you can attach additional functionality, such as searching and sorting...
    return o;
   };
   // Utility functions End
   //### PARSER LIBRARY END
   
   // Convert plain text to xml
   if(typeof xml=='string') xml = $.text2xml(xml);
   
   // Quick fail if not xml (or if this is a node)
   if(!xml.nodeType) return;
   if(xml.nodeType == 3 || xml.nodeType == 4) return xml.nodeValue;
   
   // Find xml root node
   var root = (xml.nodeType == 9) ? xml.documentElement : xml;
   
   // Convert xml to json
   var out = parseXML(root, true /* simple */);
   
   // Clean-up memory
   xml = null; root = null;
   
   // Send output
   return out;
  },
  
  // Convert text to XML DOM
  text2xml: function(str) {
   // NOTE: I'd like to use jQuery for this, but jQuery makes all tags uppercase
   //return $(xml)[0];
   var out;
   try{
    var xml = ($.browser.msie)?new ActiveXObject("Microsoft.XMLDOM"):new DOMParser();
    xml.async = false;
   }catch(e){ throw new Error("XML Parser could not be instantiated") };
   try{
    if($.browser.msie) out = (xml.loadXML(str))?xml:false;
    else out = xml.parseFromString(str, "text/xml");
   }catch(e){ throw new Error("Error parsing XML string") };
   return out;
  }
    
 }); // extend $

})(jQuery);

/**
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * @name timeago
 * @version 1.0.2
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2013, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) {
      return inWords(timestamp);
    } else if (typeof timestamp === "string") {
      return inWords($.timeago.parse(timestamp));
    } else if (typeof timestamp === "number") {
      return inWords(new Date(timestamp));
    } else {
      return inWords($.timeago.datetime(timestamp));
    }
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowFuture: false,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years",
        wordSeparator: " ",
        numbers: []
      }
    },
    inWords: function(distanceMillis) {
      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow;
        }
      }

      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      function substitute(stringOrFunction, number) {
        var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 42 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.round(days)) ||
        days < 45 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute($l.year, 1) ||
        substitute($l.years, Math.round(years));

      var separator = $l.wordSeparator || "";
      if ($l.wordSeparator === undefined) { separator = " "; }
      return $.trim([prefix, words, suffix].join(separator));
    },
    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/\.\d+/,""); // remove milliseconds
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      return new Date(s);
    },
    datetime: function(elem) {
      var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601);
    },
    isTime: function(elem) {
      // jQuery's `is()` doesn't play well with HTML5 in IE
      return $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
    }
  });

  $.fn.timeago = function() {
    var self = this;
    self.each(refresh);

    var $s = $t.settings;
    if ($s.refreshMillis > 0) {
      setInterval(function() { self.each(refresh); }, $s.refreshMillis);
    }
    return self;
  };

  function refresh() {
    var data = prepareData(this);
    if (!isNaN(data.datetime)) {
      $(this).text(inWords(data.datetime));
    }
    return this;
  }

  function prepareData(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", { datetime: $t.datetime(element) });
      var text = $.trim(element.text());
      if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
        element.attr("title", text);
      }
    }
    return element.data("timeago");
  }

  function inWords(date) {
    return $t.inWords(distance(date));
  }

  function distance(date) {
    return (new Date().getTime() - date.getTime());
  }

  // fix for IE6 suckage
  document.createElement("abbr");
  document.createElement("time");
}));

/*!
 * jQuery.ScrollTo
 * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 12/14/2012
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @author Ariel Flesler
 * @version 1.4.5 BETA
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *    The different options for target are:
 *    - A number position (will be applied to all axes).
 *    - A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *    - A jQuery/DOM element ( logically, child of the element to scroll )
 *    - A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *    - A hash { top:x, left:y }, x and y can be any kind of number/string like above.
 *    - A percentage of the container's dimension/s, for example: 50% to go to the middle.
 *    - The string 'max' for go-to-end. 
 * @param {Number, Function} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object,Function} settings Optional set of settings or the onAfter callback.
 *   @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *   @option {Number, Function} duration The OVERALL length of the animation.
 *   @option {String} easing The easing method for the animation.
 *   @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *   @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *   @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *   @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *   @option {Function} onAfter Function to be called after the scrolling ends. 
 *   @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @desc Scroll to a fixed position
 * @example $('div').scrollTo( 340 );
 *
 * @desc Scroll relatively to the actual position
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @desc Scroll using a selector (relative to the scrolled element)
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @desc Scroll to a DOM element (same for jQuery object)
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *      $('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *        alert('scrolled!!');                                   
 *      }});
 *
 * @desc Scroll on both axes, to different values
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
 */

;(function( $ ){
  
  var $scrollTo = $.scrollTo = function( target, duration, settings ){
    $(window).scrollTo( target, duration, settings );
  };

  $scrollTo.defaults = {
    axis:'xy',
    duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
    limit:true
  };

  // Returns the element that needs to be animated to scroll the window.
  // Kept for backwards compatibility (specially for localScroll & serialScroll)
  $scrollTo.window = function( scope ){
    return $(window)._scrollable();
  };

  // Hack, hack, hack :)
  // Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
  $.fn._scrollable = function(){
    return this.map(function(){
      var elem = this,
        isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

        if( !isWin )
          return elem;

      var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;
      
      return /webkit/i.test(navigator.userAgent) || doc.compatMode == 'BackCompat' ?
        doc.body : 
        doc.documentElement;
    });
  };

  $.fn.scrollTo = function( target, duration, settings ){
    if( typeof duration == 'object' ){
      settings = duration;
      duration = 0;
    }
    if( typeof settings == 'function' )
      settings = { onAfter:settings };
      
    if( target == 'max' )
      target = 9e9;
      
    settings = $.extend( {}, $scrollTo.defaults, settings );
    // Speed is still recognized for backwards compatibility
    duration = duration || settings.duration;
    // Make sure the settings are given right
    settings.queue = settings.queue && settings.axis.length > 1;
    
    if( settings.queue )
      // Let's keep the overall duration
      duration /= 2;
    settings.offset = both( settings.offset );
    settings.over = both( settings.over );

    return this._scrollable().each(function(){
      // Null target yields nothing, just like jQuery does
      if (target == null) return;

      var elem = this,
        $elem = $(elem),
        targ = target, toff, attr = {},
        win = $elem.is('html,body');

      switch( typeof targ ){
        // A number will pass the regex
        case 'number':
        case 'string':
          if( /^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ) ){
            targ = both( targ );
            // We are done
            break;
          }
          // Relative selector, no break!
          targ = $(targ,this);
          if (!targ.length) return;
        case 'object':
          // DOMElement / jQuery
          if( targ.is || targ.style )
            // Get the real position of the target 
            toff = (targ = $(targ)).offset();
      }
      $.each( settings.axis.split(''), function( i, axis ){
        var Pos = axis == 'x' ? 'Left' : 'Top',
          pos = Pos.toLowerCase(),
          key = 'scroll' + Pos,
          old = elem[key],
          max = $scrollTo.max(elem, axis);

        if( toff ){// jQuery / DOMElement
          attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

          // If it's a dom element, reduce the margin
          if( settings.margin ){
            attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
            attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
          }
          
          attr[key] += settings.offset[pos] || 0;
          
          if( settings.over[pos] )
            // Scroll to a fraction of its width/height
            attr[key] += targ[axis=='x'?'width':'height']() * settings.over[pos];
        }else{ 
          var val = targ[pos];
          // Handle percentage values
          attr[key] = val.slice && val.slice(-1) == '%' ? 
            parseFloat(val) / 100 * max
            : val;
        }

        // Number or 'number'
        if( settings.limit && /^\d+$/.test(attr[key]) )
          // Check the limits
          attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max );

        // Queueing axes
        if( !i && settings.queue ){
          // Don't waste time animating, if there's no need.
          if( old != attr[key] )
            // Intermediate animation
            animate( settings.onAfterFirst );
          // Don't animate this axis again in the next iteration.
          delete attr[key];
        }
      });

      animate( settings.onAfter );      

      function animate( callback ){
        $elem.animate( attr, duration, settings.easing, callback && function(){
          callback.call(this, target, settings);
        });
      };

    }).end();
  };
  
  // Max scrolling position, works on quirks mode
  // It only fails (not too badly) on IE, quirks mode.
  $scrollTo.max = function( elem, axis ){
    var Dim = axis == 'x' ? 'Width' : 'Height',
      scroll = 'scroll'+Dim;
    
    if( !$(elem).is('html,body') )
      return elem[scroll] - $(elem)[Dim.toLowerCase()]();
    
    var size = 'client' + Dim,
      html = elem.ownerDocument.documentElement,
      body = elem.ownerDocument.body;

    return Math.max( html[scroll], body[scroll] ) 
       - Math.min( html[size]  , body[size]   );
  };

  function both( val ){
    return typeof val == 'object' ? val : { top:val, left:val };
  };

})( jQuery );

/**
 * author Remy Sharp
 * url http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 */
(function ($) {
    function getViewportHeight() {
        var height = window.innerHeight; // Safari, Opera
        var mode = document.compatMode;

        if ( (mode || !$.support.boxModel) ) { // IE, Gecko
            height = (mode == 'CSS1Compat') ?
            document.documentElement.clientHeight : // Standards
            document.body.clientHeight; // Quirks
        }

        return height;
    }

    $(window).scroll(function () {
        var vpH = getViewportHeight(),
            scrolltop = (document.documentElement.scrollTop ?
                document.documentElement.scrollTop :
                document.body.scrollTop),
            elems = [];
        
        // naughty, but this is how it knows which elements to check for
        $.each($.cache, function () {
            if (this.events && this.events.inview) {
                elems.push(this.handle.elem);
            }
        });

        if (elems.length) {
            $(elems).each(function () {
                var $el = $(this),
                    top = $el.offset().top,
                    height = $el.height(),
                    inview = $el.data('inview') || false;

                if (scrolltop > (top + height) || scrolltop + vpH < top) {
                    if (inview) {
                        $el.data('inview', false);
                        $el.trigger('inview', [ false ]);                        
                    }
                } else if (scrolltop < (top + height)) {
                    if (!inview) {
                        $el.data('inview', true);
                        $el.trigger('inview', [ true ]);
                    }
                }
            });
        }
    });
    
    // kick the event to pick up any elements already in view.
    // note however, this only works if the plugin is included after the elements are bound to 'inview'
    $(function () {
        $(window).scroll();
    });
})(jQuery);

/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */

(function($) {
  $.transit = {
    version: "0.9.9",

    // Map of $.css() keys to values for 'transitionProperty'.
    // See https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
    propertyMap: {
      marginLeft    : 'margin',
      marginRight   : 'margin',
      marginBottom  : 'margin',
      marginTop     : 'margin',
      paddingLeft   : 'padding',
      paddingRight  : 'padding',
      paddingBottom : 'padding',
      paddingTop    : 'padding'
    },

    // Will simply transition "instantly" if false
    enabled: true,

    // Set this to false if you don't want to use the transition end property.
    useTransitionEnd: false
  };

  var div = document.createElement('div');
  var support = {};

  // Helper function to get the proper vendor property name.
  // (`transition` => `WebkitTransition`)
  function getVendorPropertyName(prop) {
    // Handle unprefixed versions (FF16+, for example)
    if (prop in div.style) return prop;

    var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
    var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

    if (prop in div.style) { return prop; }

    for (var i=0; i<prefixes.length; ++i) {
      var vendorProp = prefixes[i] + prop_;
      if (vendorProp in div.style) { return vendorProp; }
    }
  }

  // Helper function to check if transform3D is supported.
  // Should return true for Webkits and Firefox 10+.
  function checkTransform3dSupport() {
    div.style[support.transform] = '';
    div.style[support.transform] = 'rotateY(90deg)';
    return div.style[support.transform] !== '';
  }

  var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

  // Check for the browser's transitions support.
  support.transition      = getVendorPropertyName('transition');
  support.transitionDelay = getVendorPropertyName('transitionDelay');
  support.transform       = getVendorPropertyName('transform');
  support.transformOrigin = getVendorPropertyName('transformOrigin');
  support.transform3d     = checkTransform3dSupport();

  var eventNames = {
    'transition':       'transitionEnd',
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'WebkitTransition': 'webkitTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };

  // Detect the 'transitionend' event needed.
  var transitionEnd = support.transitionEnd = eventNames[support.transition] || null;

  // Populate jQuery's `$.support` with the vendor prefixes we know.
  // As per [jQuery's cssHooks documentation](http://api.jquery.com/jQuery.cssHooks/),
  // we set $.support.transition to a string of the actual property name used.
  for (var key in support) {
    if (support.hasOwnProperty(key) && typeof $.support[key] === 'undefined') {
      $.support[key] = support[key];
    }
  }

  // Avoid memory leak in IE.
  div = null;

  // ## $.cssEase
  // List of easing aliases that you can use with `$.fn.transition`.
  $.cssEase = {
    '_default':       'ease',
    'in':             'ease-in',
    'out':            'ease-out',
    'in-out':         'ease-in-out',
    'snap':           'cubic-bezier(0,1,.5,1)',
    // Penner equations
    'easeOutCubic':   'cubic-bezier(.215,.61,.355,1)',
    'easeInOutCubic': 'cubic-bezier(.645,.045,.355,1)',
    'easeInCirc':     'cubic-bezier(.6,.04,.98,.335)',
    'easeOutCirc':    'cubic-bezier(.075,.82,.165,1)',
    'easeInOutCirc':  'cubic-bezier(.785,.135,.15,.86)',
    'easeInExpo':     'cubic-bezier(.95,.05,.795,.035)',
    'easeOutExpo':    'cubic-bezier(.19,1,.22,1)',
    'easeInOutExpo':  'cubic-bezier(1,0,0,1)',
    'easeInQuad':     'cubic-bezier(.55,.085,.68,.53)',
    'easeOutQuad':    'cubic-bezier(.25,.46,.45,.94)',
    'easeInOutQuad':  'cubic-bezier(.455,.03,.515,.955)',
    'easeInQuart':    'cubic-bezier(.895,.03,.685,.22)',
    'easeOutQuart':   'cubic-bezier(.165,.84,.44,1)',
    'easeInOutQuart': 'cubic-bezier(.77,0,.175,1)',
    'easeInQuint':    'cubic-bezier(.755,.05,.855,.06)',
    'easeOutQuint':   'cubic-bezier(.23,1,.32,1)',
    'easeInOutQuint': 'cubic-bezier(.86,0,.07,1)',
    'easeInSine':     'cubic-bezier(.47,0,.745,.715)',
    'easeOutSine':    'cubic-bezier(.39,.575,.565,1)',
    'easeInOutSine':  'cubic-bezier(.445,.05,.55,.95)',
    'easeInBack':     'cubic-bezier(.6,-.28,.735,.045)',
    'easeOutBack':    'cubic-bezier(.175, .885,.32,1.275)',
    'easeInOutBack':  'cubic-bezier(.68,-.55,.265,1.55)'
  };

  // ## 'transform' CSS hook
  // Allows you to use the `transform` property in CSS.
  //
  //     $("#hello").css({ transform: "rotate(90deg)" });
  //
  //     $("#hello").css('transform');
  //     //=> { rotate: '90deg' }
  //
  $.cssHooks['transit:transform'] = {
    // The getter returns a `Transform` object.
    get: function(elem) {
      return $(elem).data('transform') || new Transform();
    },

    // The setter accepts a `Transform` object or a string.
    set: function(elem, v) {
      var value = v;

      if (!(value instanceof Transform)) {
        value = new Transform(value);
      }

      // We've seen the 3D version of Scale() not work in Chrome when the
      // element being scaled extends outside of the viewport.  Thus, we're
      // forcing Chrome to not use the 3d transforms as well.  Not sure if
      // translate is affectede, but not risking it.  Detection code from
      // http://davidwalsh.name/detecting-google-chrome-javascript
      if (support.transform === 'WebkitTransform' && !isChrome) {
        elem.style[support.transform] = value.toString(true);
      } else {
        elem.style[support.transform] = value.toString();
      }

      $(elem).data('transform', value);
    }
  };

  // Add a CSS hook for `.css({ transform: '...' })`.
  // In jQuery 1.8+, this will intentionally override the default `transform`
  // CSS hook so it'll play well with Transit. (see issue #62)
  $.cssHooks.transform = {
    set: $.cssHooks['transit:transform'].set
  };

  // jQuery 1.8+ supports prefix-free transitions, so these polyfills will not
  // be necessary.
  if ($.fn.jquery < "1.8") {
    // ## 'transformOrigin' CSS hook
    // Allows the use for `transformOrigin` to define where scaling and rotation
    // is pivoted.
    //
    //     $("#hello").css({ transformOrigin: '0 0' });
    //
    $.cssHooks.transformOrigin = {
      get: function(elem) {
        return elem.style[support.transformOrigin];
      },
      set: function(elem, value) {
        elem.style[support.transformOrigin] = value;
      }
    };

    // ## 'transition' CSS hook
    // Allows you to use the `transition` property in CSS.
    //
    //     $("#hello").css({ transition: 'all 0 ease 0' });
    //
    $.cssHooks.transition = {
      get: function(elem) {
        return elem.style[support.transition];
      },
      set: function(elem, value) {
        elem.style[support.transition] = value;
      }
    };
  }

  // ## Other CSS hooks
  // Allows you to rotate, scale and translate.
  registerCssHook('scale');
  registerCssHook('translate');
  registerCssHook('rotate');
  registerCssHook('rotateX');
  registerCssHook('rotateY');
  registerCssHook('rotate3d');
  registerCssHook('perspective');
  registerCssHook('skewX');
  registerCssHook('skewY');
  registerCssHook('x', true);
  registerCssHook('y', true);

  // ## Transform class
  // This is the main class of a transformation property that powers
  // `$.fn.css({ transform: '...' })`.
  //
  // This is, in essence, a dictionary object with key/values as `-transform`
  // properties.
  //
  //     var t = new Transform("rotate(90) scale(4)");
  //
  //     t.rotate             //=> "90deg"
  //     t.scale              //=> "4,4"
  //
  // Setters are accounted for.
  //
  //     t.set('rotate', 4)
  //     t.rotate             //=> "4deg"
  //
  // Convert it to a CSS string using the `toString()` and `toString(true)` (for WebKit)
  // functions.
  //
  //     t.toString()         //=> "rotate(90deg) scale(4,4)"
  //     t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (WebKit version)
  //
  function Transform(str) {
    if (typeof str === 'string') { this.parse(str); }
    return this;
  }

  Transform.prototype = {
    // ### setFromString()
    // Sets a property from a string.
    //
    //     t.setFromString('scale', '2,4');
    //     // Same as set('scale', '2', '4');
    //
    setFromString: function(prop, val) {
      var args =
        (typeof val === 'string')  ? val.split(',') :
        (val.constructor === Array) ? val :
        [ val ];

      args.unshift(prop);

      Transform.prototype.set.apply(this, args);
    },

    // ### set()
    // Sets a property.
    //
    //     t.set('scale', 2, 4);
    //
    set: function(prop) {
      var args = Array.prototype.slice.apply(arguments, [1]);
      if (this.setter[prop]) {
        this.setter[prop].apply(this, args);
      } else {
        this[prop] = args.join(',');
      }
    },

    get: function(prop) {
      if (this.getter[prop]) {
        return this.getter[prop].apply(this);
      } else {
        return this[prop] || 0;
      }
    },

    setter: {
      // ### rotate
      //
      //     .css({ rotate: 30 })
      //     .css({ rotate: "30" })
      //     .css({ rotate: "30deg" })
      //     .css({ rotate: "30deg" })
      //
      rotate: function(theta) {
        this.rotate = unit(theta, 'deg');
      },

      rotateX: function(theta) {
        this.rotateX = unit(theta, 'deg');
      },

      rotateY: function(theta) {
        this.rotateY = unit(theta, 'deg');
      },

      // ### scale
      //
      //     .css({ scale: 9 })      //=> "scale(9,9)"
      //     .css({ scale: '3,2' })  //=> "scale(3,2)"
      //
      scale: function(x, y) {
        if (y === undefined) { y = x; }
        this.scale = x + "," + y;
      },

      // ### skewX + skewY
      skewX: function(x) {
        this.skewX = unit(x, 'deg');
      },

      skewY: function(y) {
        this.skewY = unit(y, 'deg');
      },

      // ### perspectvie
      perspective: function(dist) {
        this.perspective = unit(dist, 'px');
      },

      // ### x / y
      // Translations. Notice how this keeps the other value.
      //
      //     .css({ x: 4 })       //=> "translate(4px, 0)"
      //     .css({ y: 10 })      //=> "translate(4px, 10px)"
      //
      x: function(x) {
        this.set('translate', x, null);
      },

      y: function(y) {
        this.set('translate', null, y);
      },

      // ### translate
      // Notice how this keeps the other value.
      //
      //     .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
      //
      translate: function(x, y) {
        if (this._translateX === undefined) { this._translateX = 0; }
        if (this._translateY === undefined) { this._translateY = 0; }

        if (x !== null && x !== undefined) { this._translateX = unit(x, 'px'); }
        if (y !== null && y !== undefined) { this._translateY = unit(y, 'px'); }

        this.translate = this._translateX + "," + this._translateY;
      }
    },

    getter: {
      x: function() {
        return this._translateX || 0;
      },

      y: function() {
        return this._translateY || 0;
      },

      scale: function() {
        var s = (this.scale || "1,1").split(',');
        if (s[0]) { s[0] = parseFloat(s[0]); }
        if (s[1]) { s[1] = parseFloat(s[1]); }

        // "2.5,2.5" => 2.5
        // "2.5,1" => [2.5,1]
        return (s[0] === s[1]) ? s[0] : s;
      },

      rotate3d: function() {
        var s = (this.rotate3d || "0,0,0,0deg").split(',');
        for (var i=0; i<=3; ++i) {
          if (s[i]) { s[i] = parseFloat(s[i]); }
        }
        if (s[3]) { s[3] = unit(s[3], 'deg'); }

        return s;
      }
    },

    // ### parse()
    // Parses from a string. Called on constructor.
    parse: function(str) {
      var self = this;
      str.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(x, prop, val) {
        self.setFromString(prop, val);
      });
    },

    // ### toString()
    // Converts to a `transition` CSS property string. If `use3d` is given,
    // it converts to a `-webkit-transition` CSS property string instead.
    toString: function(use3d) {
      var re = [];

      for (var i in this) {
        if (this.hasOwnProperty(i)) {
          // Don't use 3D transformations if the browser can't support it.
          if ((!support.transform3d) && (
            (i === 'rotateX') ||
            (i === 'rotateY') ||
            (i === 'perspective') ||
            (i === 'transformOrigin'))) { continue; }

          if (i[0] !== '_') {
            if (use3d && (i === 'scale')) {
              re.push(i + "3d(" + this[i] + ",1)");
            } else if (use3d && (i === 'translate')) {
              re.push(i + "3d(" + this[i] + ",0)");
            } else {
              re.push(i + "(" + this[i] + ")");
            }
          }
        }
      }

      return re.join(" ");
    }
  };

  function callOrQueue(self, queue, fn) {
    if (queue === true) {
      self.queue(fn);
    } else if (queue) {
      self.queue(queue, fn);
    } else {
      fn();
    }
  }

  // ### getProperties(dict)
  // Returns properties (for `transition-property`) for dictionary `props`. The
  // value of `props` is what you would expect in `$.css(...)`.
  function getProperties(props) {
    var re = [];

    $.each(props, function(key) {
      key = $.camelCase(key); // Convert "text-align" => "textAlign"
      key = $.transit.propertyMap[key] || $.cssProps[key] || key;
      key = uncamel(key); // Convert back to dasherized

      if ($.inArray(key, re) === -1) { re.push(key); }
    });

    return re;
  }

  // ### getTransition()
  // Returns the transition string to be used for the `transition` CSS property.
  //
  // Example:
  //
  //     getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
  //     //=> 'opacity 500ms ease, -webkit-transform 500ms ease'
  //
  function getTransition(properties, duration, easing, delay) {
    // Get the CSS properties needed.
    var props = getProperties(properties);

    // Account for aliases (`in` => `ease-in`).
    if ($.cssEase[easing]) { easing = $.cssEase[easing]; }

    // Build the duration/easing/delay attributes for it.
    var attribs = '' + toMS(duration) + ' ' + easing;
    if (parseInt(delay, 10) > 0) { attribs += ' ' + toMS(delay); }

    // For more properties, add them this way:
    // "margin 200ms ease, padding 200ms ease, ..."
    var transitions = [];
    $.each(props, function(i, name) {
      transitions.push(name + ' ' + attribs);
    });

    return transitions.join(', ');
  }

  // ## $.fn.transition
  // Works like $.fn.animate(), but uses CSS transitions.
  //
  //     $("...").transition({ opacity: 0.1, scale: 0.3 });
  //
  //     // Specific duration
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500);
  //
  //     // With duration and easing
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in');
  //
  //     // With callback
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, function() { ... });
  //
  //     // With everything
  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { ... });
  //
  //     // Alternate syntax
  //     $("...").transition({
  //       opacity: 0.1,
  //       duration: 200,
  //       delay: 40,
  //       easing: 'in',
  //       complete: function() { /* ... */ }
  //      });
  //
  $.fn.transition = $.fn.transit = function(properties, duration, easing, callback) {
    var self  = this;
    var delay = 0;
    var queue = true;

    // Account for `.transition(properties, callback)`.
    if (typeof duration === 'function') {
      callback = duration;
      duration = undefined;
    }

    // Account for `.transition(properties, duration, callback)`.
    if (typeof easing === 'function') {
      callback = easing;
      easing = undefined;
    }

    // Alternate syntax.
    if (typeof properties.easing !== 'undefined') {
      easing = properties.easing;
      delete properties.easing;
    }

    if (typeof properties.duration !== 'undefined') {
      duration = properties.duration;
      delete properties.duration;
    }

    if (typeof properties.complete !== 'undefined') {
      callback = properties.complete;
      delete properties.complete;
    }

    if (typeof properties.queue !== 'undefined') {
      queue = properties.queue;
      delete properties.queue;
    }

    if (typeof properties.delay !== 'undefined') {
      delay = properties.delay;
      delete properties.delay;
    }

    // Set defaults. (`400` duration, `ease` easing)
    if (typeof duration === 'undefined') { duration = $.fx.speeds._default; }
    if (typeof easing === 'undefined')   { easing = $.cssEase._default; }

    duration = toMS(duration);

    // Build the `transition` property.
    var transitionValue = getTransition(properties, duration, easing, delay);

    // Compute delay until callback.
    // If this becomes 0, don't bother setting the transition property.
    var work = $.transit.enabled && support.transition;
    var i = work ? (parseInt(duration, 10) + parseInt(delay, 10)) : 0;

    // If there's nothing to do...
    if (i === 0) {
      var fn = function(next) {
        self.css(properties);
        if (callback) { callback.apply(self); }
        if (next) { next(); }
      };

      callOrQueue(self, queue, fn);
      return self;
    }

    // Save the old transitions of each element so we can restore it later.
    var oldTransitions = {};

    var run = function(nextCall) {
      var bound = false;

      // Prepare the callback.
      var cb = function() {
        if (bound) { self.unbind(transitionEnd, cb); }

        if (i > 0) {
          self.each(function() {
            this.style[support.transition] = (oldTransitions[this] || null);
          });
        }

        if (typeof callback === 'function') { callback.apply(self); }
        if (typeof nextCall === 'function') { nextCall(); }
      };

      if ((i > 0) && (transitionEnd) && ($.transit.useTransitionEnd)) {
        // Use the 'transitionend' event if it's available.
        bound = true;
        self.bind(transitionEnd, cb);
      } else {
        // Fallback to timers if the 'transitionend' event isn't supported.
        window.setTimeout(cb, i);
      }

      // Apply transitions.
      self.each(function() {
        if (i > 0) {
          this.style[support.transition] = transitionValue;
        }
        $(this).css(properties);
      });
    };

    // Defer running. This allows the browser to paint any pending CSS it hasn't
    // painted yet before doing the transitions.
    var deferredRun = function(next) {
        this.offsetWidth; // force a repaint
        run(next);
    };

    // Use jQuery's fx queue.
    callOrQueue(self, queue, deferredRun);

    // Chainability.
    return this;
  };

  function registerCssHook(prop, isPixels) {
    // For certain properties, the 'px' should not be implied.
    if (!isPixels) { $.cssNumber[prop] = true; }

    $.transit.propertyMap[prop] = support.transform;

    $.cssHooks[prop] = {
      get: function(elem) {
        var t = $(elem).css('transit:transform');
        return t.get(prop);
      },

      set: function(elem, value) {
        var t = $(elem).css('transit:transform');
        t.setFromString(prop, value);

        $(elem).css({ 'transit:transform': t });
      }
    };

  }

  // ### uncamel(str)
  // Converts a camelcase string to a dasherized string.
  // (`marginLeft` => `margin-left`)
  function uncamel(str) {
    return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
  }

  // ### unit(number, unit)
  // Ensures that number `number` has a unit. If no unit is found, assume the
  // default is `unit`.
  //
  //     unit(2, 'px')          //=> "2px"
  //     unit("30deg", 'rad')   //=> "30deg"
  //
  function unit(i, units) {
    if ((typeof i === "string") && (!i.match(/^[\-0-9\.]+$/))) {
      return i;
    } else {
      return "" + i + units;
    }
  }

  // ### toMS(duration)
  // Converts given `duration` to a millisecond string.
  //
  //     toMS('fast')   //=> '400ms'
  //     toMS(10)       //=> '10ms'
  //
  function toMS(duration) {
    var i = duration;

    // Allow for string durations like 'fast'.
    if ($.fx.speeds[i]) { i = $.fx.speeds[i]; }

    return unit(i, 'ms');
  }

  // Export some functions for testable-ness.
  $.transit.getTransitionValue = getTransition;
})(jQuery);

// @todo: remove all these comments
// restore $ to whatever other jQuery's there were/are
// at this point, since when jQuery is loaded above it saves the older version
//      we can then revert it back
// console.log("jquery current version: ", window.$.fn.jquery);

var $boost = (window.$ !== undefined) ? jQuery.noConflict(true) : jQuery;

// console.log("jQuery values: ", jQuery.fn.jquery, $.fn.jquery, $boost.fn.jquery);

// WARNING: THIS IS A HACKED VERSION OF THE EASING SCRIPT MODIFIED FOR OUR PURPOSES
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
$boost.easing['jswing'] = $boost.easing['swing'];

$boost.extend( $boost.easing,
{
  def: 'easeOutQuad',
  swing: function (x, t, b, c, d) {
    //alert($boost.easing.default);
    //console.log('$boost EASING versions: $boost.fn.jquery: ', $boost.fn.jquery, ' $.fn.jquery: ', $.fn.jquery);
    return $boost.easing[$boost.easing.def](x, t, b, c, d);
  },
  easeInQuad: function (x, t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInCubic: function (x, t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },
  easeInQuint: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInSine: function (x, t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  },
  easeOutSine: function (x, t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  easeInOutSine: function (x, t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  },
  easeInExpo: function (x, t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  },
  easeOutExpo: function (x, t, b, c, d) {
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  },
  easeInOutExpo: function (x, t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  },
  easeOutCirc: function (x, t, b, c, d) {
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  },
  easeInOutCirc: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  },
  easeInElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158; 
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (x, t, b, c, d) {
    return c - $boost.easing.easeOutBounce (x, d-t, 0, c, d) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {  
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (x, t, b, c, d) {
    if (t < d/2) return $boost.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
    return $boost.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
  },
  boomerang: function(x,t,b,c,d){
    return -1/231 * Math.pow((t-350), 2) + 600;
  }
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */