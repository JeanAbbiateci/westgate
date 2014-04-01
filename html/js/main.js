var pageHeight = 0;                             // height of the slides in the page
var pagesList = [];
var currentPageIndex = 0;                       // current Pagelist index
var currentPage = pagesList[currentPageIndex];  // current page ID the user is seeing
var headerHeight = $('#story-nav').height();    // header height. Should be dinamix => fix!

//Collect pages id
$('.page').each(function(i) {
    var currentID = this.id || i;
    pagesList.push(currentID);
});

window.load = (function() {

    var submenulengths = [8, 4, 4, 3, 2], //slides in each chapters
    $chapters = $('#chapters'),
    $main = $( '.pages-container' ),
    $pages = $main.children( 'div.page' ),
    $bg = $('#bg-images'),
    $bgImg = undefined,
    pagesCount = $pages.length,
    current = 0,
    isAnimating = false,
    endCurrPage = false,
    endNextPage = false,
    opacityVal = 0.2,
    animEndEventNames = {
        'WebkitAnimation' : 'webkitAnimationEnd',
        'OAnimation' : 'oAnimationEnd',
        'msAnimation' : 'MSAnimationEnd',
        'animation' : 'animationend'
    },
    animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ], // animation end event name
    support = Modernizr.cssanimations; // support css animations

    function init() {
        //Create dots
        $.each(submenulengths, function(ind,val){
            for(var j = 0; j < val; j++) $chapters.find('li > ul').eq(ind).append('<li class="dot"></li>');
        });

        //Add backgrounds
        $pages.each( function(z) {
            z = z -100;
            var $page = $( this );
            $page.data( 'originalClassList', $page.attr( 'class' ) );
            var bg = $page.attr('bg') || "";
            $bg.append('<div style="' + bg + ' ; z-index:'+z+'; opacity:0" class="bg-image gray"></div>');
        } );
        $bgImg =  $('.bg-image'); //update bg variable

        //Initiate first active page
        $pages.eq( current ).addClass( 'current-page' );
        $bgImg.eq(0).animate({opacity:opacityVal}, function(){
            $(this).removeClass('gray');
        });

        //Set arrow keys
        $(window).on('keydown', function(e){
            if(e.keyCode === 39) nextPage(9, 1)
            if(e.keyCode === 37) nextPage(10, -1)
        });
    }

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
})();
