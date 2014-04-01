var pageHeight = 0;                             // height of the slides in the page
var pagesList = [];
var pastPos = 0;                                // past position for the scrollHandler
var currentPageIndex = 0;                       // current Pagelist index
var currentPage = pagesList[currentPageIndex];  // current page ID the user is seeing
var headerHeight = 50;                          // header height. Should be dinamix => fix!
var keyboardUseCorrection = 23;                 // mha!

//Collect pages id
$('.page').each(function(i) {
    var currentID = this.id || i;
    pagesList.push(currentID);
});

$(document).ready(function(){
    $(this).scrollTop(0);
});


/*
window.load = (function() {
    var pages = document.querySelectorAll('.page');

    function setPagesHeight() {
        pageHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        for (var i = 0; i < pages.length; i++) {
            pages.item(i).style.height = pageHeight + 'px';
        }
    }
    setPagesHeight();
    window.onresize = setPagesHeight;


    // currentPage fix (for refresh scroll)
    var top = $(window).scrollTop();
    currentPageIndex = selectPage(parseInt(top / pageHeight));
    currentPage = pagesList[currentPageIndex];

    $(document).keyup(function(event) {
        if (event.which === 38)
            currentPageIndex = selectPage(currentPageIndex - 1);
        else if (event.which === 40)
            currentPageIndex = selectPage(currentPageIndex + 1);
        pageChanged(keyboardUseCorrection);
        updateMenu();

    });

    function pageChanged(correction)
    {
        if (currentPage !== pagesList[currentPageIndex]) {
            currentPage = pagesList[currentPageIndex];

            var pos = pageHeight;
            */
/*If it's not the first one, we need to subtract the header height
            if (currentPageIndex !== 0) {
                pos -= (headerHeight - correction); //Don't ask me why the -23
            }*//*

            pos = pos * currentPageIndex;
            pos = -(pos);

            hide_show_slider();

            d3.select(".tooltip").style("opacity", 0).style("display", "none");

            $("#pages").css("transform", "translate(0," + pos + "px)");
        }
    }


    function selectPage(index) {
        if (index >= pagesList.length)
            index = pagesList.length - 1;
        else if (index < 0)
            index = 0;
        return index;

    }

    function hide_show_slider() {

        if (currentPage === "tweet-map" || currentPage === "bubble-page")
        {
            d3.select("#slider").transition().duration(200).style("display", "block").style("opacity", 1);
            if(currentPage === "tweet-map")
                d3.select("#startstop").style("display", "block");
            else
                d3.select("#startstop").style("display", "none");
        }
        else
        {
            d3.select("#slider").transition().duration(200).style("opacity", 0).style("display", "none");
        }

    }

    var submenulengths = [8, 4, 4, 3, 2];
    var menuIDs = [0, 9, 13, 16, 18];

    //Build menu
    function makemenu()
    {
        var total = 1;
        var pageindexes = range(0, pagesList.length);
        for (var i = 0; i < submenulengths.length; i++)
        {
            d3.select("#menu" + i).selectAll('a').attr("id",'nav_id'+total)
                .on("click", function(){
                    id = d3.event.toElement.id
                    to_id = +id.substring("nav_id".length,id.length)
                    currentPageIndex = to_id;
                    pageChanged(headerHeight);
                    updateMenu();
                    return false;
                })
				.on("mouseover", function() {
					d3.select(this)
					.style("color", "#dbe1e7");
				})
				.on("mouseout", function() {
					d3.select(this)
					.style("color", "#8d94a5");
				});

            var subm = submenulengths[i];
            var currentmenu = d3.select("#menu" + i);
            currentmenu.select("ul").selectAll("li")
                    .data(pageindexes.slice(total, total + subm))
                    .enter()
                    .append("li")
                    .attr("class", "dot")
                    .attr("id", function(d) {
                return "dot" + d;
            })
                    .on("click", function(d)
            {
                //Remove all color and then color current div
                currentPageIndex = d;
                pageChanged(headerHeight);
                updateMenu();
                return false;
            });

            total = total + subm;
        }


    }

    makemenu();

    function updateMenu()
    {
        d3.selectAll(".dot").classed("active", false);
        d3.select("#dot" + currentPageIndex).classed("active", true);
    }
    updateMenu();


    //Range helper function
    function range(start, end)
    {
        var array = new Array();
        for (var i = start; i < end; i++)
        {
            array.push(i);
        }
        return array;
    }

}());

*/

var PageTransitions = (function() {

        var $main = $( '.pages-container' ),
        $pages = $main.children( 'div.page' ),
        $bg = $('#bg-images'),
        $bgImg = undefined,
        $iterate = $( '#iterateEffects' ),
        animcursor = 1,
        pagesCount = $pages.length,
        current = 0,
        isAnimating = false,
        endCurrPage = false,
        endNextPage = false,
        opacityVal = 0.2;
        animEndEventNames = {
            'WebkitAnimation' : 'webkitAnimationEnd',
            'OAnimation' : 'oAnimationEnd',
            'msAnimation' : 'MSAnimationEnd',
            'animation' : 'animationend'
        },
    // animation end event name
        animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
    // support css animations
        support = Modernizr.cssanimations;

    function init() {

        $pages.each( function(z) {
            z = z -100;
            var $page = $( this );
            $page.data( 'originalClassList', $page.attr( 'class' ) );
            var bg = $page.attr('bg') || "";
            $bg.append('<div style="' + bg + ' ; z-index:'+z+'; opacity:0" class="bg-image gray"></div>');
        } );

        $pages.eq( current ).addClass( 'current-page' );
        $bgImg = $('.bg-image');
        $bgImg.eq(0).animate({opacity:opacityVal}, function(){
            $(this).removeClass('gray');
        });
    }

    $(window).on('keydown', function(e){
       if(e.keyCode === 39) nextPage(9, 1)
       if(e.keyCode === 37) nextPage(10, -1)
    });

    function onEndAnimation( $outpage, $inpage ) {
        endCurrPage = false;
        endNextPage = false;
        resetPage( $outpage, $inpage );
        isAnimating = false;
    }

    function nextPage( animation, direction ) {

        if( isAnimating ) {
            return false;
        }

        isAnimating = true;

        var $currPage = $pages.eq( current );

        if( current < pagesCount - 1 ) {
            current += direction;
        }
        else {
            current = 0;
        }

        var $nextPage = $pages.eq( current ).addClass( 'current-page' ),
            outClass = '', inClass = '';

        switch( animation ) {

            case 9:
                outClass = 'pt-page-moveToLeftFade';
                inClass = 'pt-page-moveFromRightFade';
                break;
            case 10:
                outClass = 'pt-page-moveToRightFade';
                inClass = 'pt-page-moveFromLeftFade';
                break;
        }

        $currPage.addClass( outClass ).on( animEndEventName, function() {
            $currPage.off( animEndEventName );
            endCurrPage = true;
            if( endNextPage ) {
                onEndAnimation( $currPage, $nextPage );
            }
        } );

        $nextPage.addClass( inClass ).on( animEndEventName, function() {
            $nextPage.off( animEndEventName );
            endNextPage = true;
            if( endCurrPage ) {
                onEndAnimation( $currPage, $nextPage );
            }
        } );

        if( !support ) {
            onEndAnimation( $currPage, $nextPage );
        }

        $bgImg.eq(current - direction).animate({opacity:0,easing: 'easein'},400, function(){
            $bgImg.eq(current).animate({opacity: opacityVal, easing:'easeout'},1400);
            $bgImg.eq(current).removeClass('gray');
            $bgImg.eq(current-direction).addClass('gray');
        });
    }

    function resetPage( $outpage, $inpage ) {
        $outpage.attr( 'class', $outpage.data( 'originalClassList' ) );
        $inpage.attr( 'class', $inpage.data( 'originalClassList' ) + ' current-page' );
    }

    init();

    return { init : init };

})();
