var pageHeight = 0;                             // height of the slides in the page
var pagesList = [];
var currentPageIndex = 0;
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

        //Add slide index to dots
        $('.dot').each( function(i,v) {
            $(v).attr('slide', i+2);
            $(v).on('click', function(){
                switchPage(i);
                $('dot').addClass('current-dot');
            });
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
        $pages.eq( currentPageIndex ).addClass( 'current-page' );
        $bgImg.eq(0).animate({opacity:opacityVal}, function(){
            $(this).removeClass('gray');
        });

        //Set arrow keys
        $(window).on('keydown', function(e){
            if(e.keyCode === 39 && currentPageIndex < pagesList.length-1) switchPage(currentPageIndex+1);
            if(e.keyCode === 37 && currentPageIndex > 0) switchPage(currentPageIndex-1);
        });
    }

    function onEndAnimation( $outpage, $inpage ) {
        endCurrPage = false;
        endNextPage = false;
        resetPage( $outpage, $inpage );
        isAnimating = false;
    }

    function switchPage( goToSlide ) {

        if( isAnimating ) {
            return false;
        }

        isAnimating = true;

        var $currPage = $pages.eq( currentPageIndex );
        var $nextPage = $pages.eq( goToSlide ).addClass( 'current-page' );

        var inClass = goToSlide > currentPageIndex ? 'pt-page-moveToLeftFade' : 'pt-page-moveToRightFade';
        var outClass = goToSlide > currentPageIndex ? 'pt-page-moveFromRightFade' : 'pt-page-moveFromLeftFade';

        $currPage.addClass( inClass ).on( animEndEventName, function() {
            $currPage.off( animEndEventName );
            endCurrPage = true;
            if( endNextPage ) {
                onEndAnimation( $currPage, $nextPage );
            }
        } );

        $nextPage.addClass( outClass ).on( animEndEventName, function() {
            $nextPage.off( animEndEventName );
            endNextPage = true;
            if( endCurrPage ) {
                onEndAnimation( $currPage, $nextPage );
            }
        } );

        if( !support ) {
            onEndAnimation( $currPage, $nextPage );
        }

        console.log(currentPageIndex,goToSlide);
        $bgImg.eq(currentPageIndex).animate({opacity:0, easing: 'easein'},300, function(){
            $bgImg.eq(goToSlide).animate({opacity: opacityVal, easing:'easeout'},1200);
            $bgImg.eq(goToSlide).removeClass('gray current-bg');
            $bgImg.eq(currentPageIndex).addClass('gray current-bg');
            currentPageIndex = goToSlide;
        });
    }

    function resetPage( $outpage, $inpage ) {
        $outpage.attr( 'class', $outpage.data( 'originalClassList' ) );
        $inpage.attr( 'class', $inpage.data( 'originalClassList' ) + ' current-page' );
    }

    init();
})();
