<div id="videoverlay" style="display:none">
    <div id="video">

          <div id="player"></div>
        <span id="vid_cls"></span>

    </div>
    <!--//#video-->
</div>
<!--//#videoverlay -->

<!-- @index -->
<script type="text/x-handlebars-template" id="reviewTemplate">
    {{#articles}}
    <div class="tile box{{{indexer @index}}}of3">
    <div class="boxInner">

        <div class="media">
            <div class="source">
                <!-- <img src="{{source}}" alt="" /> -->
            </div>

            <a href="{{allinurl}}" class="gotoLink" data-story-id="" data-tracking-elem="" data-tracking-item="">
                <img src="{{banner}}" alt=""></a>
        </div>

        <div class="content">
            <ul class="tags cf">
                {{#tagHandler tags}}
                    <li class="normalTag">
                        <a href="{{../tagrooturl}}{{this}}" class="tagLabel">{{this}}</a>
                    </li> 
                {{/tagHandler}}
            </ul>
            <h4>{{segmentTitle}}</h4>
            <div class="borderDotted"></div>
            <h5>
                <a href="{{allinurl}}" class="gotoLink" data-story-id="" data-tracking-elem="" data-tracking-item="">{{articleTitle}}</a>
            </h5>
        </div>

        <div class="meta left">
            <div class="left">
                <div class="wrap">
                    POSTED:
                    <span class="post_time timeago" style="">{{publishDate}}</span>
                </div>
            </div>

            <div class="right">
                <span class="comments_count">
                    <a href="" data-story-id="">
                        <span class="icon_bubble"></span>
                    </a>
                    <span class="numberOfComments">{{comments}}</span>
                </span>
                <span class="views_count" rel="{{tridionId}}">
                    <span class="icon_eye"></span>
                    <span class="numberOfViews">{{views}}</span>
                </span>
            </div>

            <div class="clear">&nbsp;</div>
        </div>
    </div>
    </div>
    {{/articles}}
</script>
<!-- /handlebars template -->
