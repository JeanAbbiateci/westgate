var pageHeight = 0,                             // height of the slides in the page
    pagesList = [],
    ti = 0,
    currentPageIndex = 0,
    currentPage = pagesList[currentPageIndex],  // current page ID the user is seeing
    headerHeight = $('#story-nav').height(),    // header height. Should be dinamix => fix!
    $pagesContainer = $('#pages-container'),
    documentHeight = $pagesContainer.height(),
    documentWidth = $pagesContainer.width();

//Collect pages id
$('.page').each(function(i) {
    var currentID = this.id || i;
    pagesList.push(currentID);
});

window.load = (function() {

    var submenulengths = [8, 4, 4, 3, 2], //slides in each chapters
    $chapters = $('#chapters'),
    $main = $( '#pages-container' ),
    $pages = $main.children( 'div.page' ),
    $bg = $('#bg-images'),
    $bgImg = undefined,
    $arrowL = $('#arrow-left'),
    $arrowR = $('#arrow-right'),
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

        //Add nav switches to the dots
        $('.dot').each( function(i,v) {
            $(v).on('click', function(){
                switchPage(i+1);
            });
        });

        //Add controls to arrows
        $('#arrow-left').on('click', function(){ switchPage(currentPageIndex-1); });
        $('#arrow-right').on('click', function(){ switchPage(currentPageIndex+1); });

        //Add switch to logo
        $('#logo').on('click', function(){ switchPage(0); });


        //Add backgrounds
        $pages.each( function(z) {
            z = z -100;
            var $page = $( this );
            $page.data( 'originalClassList', $page.attr( 'class' ) );
            var bg = $page.attr('bg') || "";
            $bg.append('<img src="' + bg + '" style="z-index:'+z+'; opacity:0" class="bg-image gray" />');
        } );
        $bgImg =  $('.bg-image'); //update bg variable

        requestAnimationFrame(setBgImgSizes) //update positions of backgrounds

        //Disable left arrow
        updateControls.disabledArrow = $arrowL;

        //Initiate first active page
        $pages.eq( currentPageIndex ).addClass( 'current-page' );
        $bgImg.eq(0).addClass('add-opacity').removeClass('gray');

        //Set arrow keys for navigation
        $(window).on('keydown', function(e){
            if(!isAnimating){
                if(e.keyCode === 39 && currentPageIndex < pagesList.length-1) switchPage(currentPageIndex+1);
                if(e.keyCode === 37 && currentPageIndex > 0) switchPage(currentPageIndex-1);
            }
        });
    }

    function updateControls(){
        hide_show_slider(currentPageIndex);

        //update dots
        $('.dot.active').removeClass('active');
        if(currentPageIndex > 0) $('.dot').eq(currentPageIndex-1).addClass('active');

        //update arrows
        if (currentPageIndex === 0 ) {
            $arrowL.css('display','none');
            updateControls.disabledArrow = $arrowL;
        }
        else if(currentPageIndex >= pagesList.length -1 ) {
            $arrowR.css('display','none');
            updateControls.disabledArrow = $arrowR;
        }
        else{
            if(updateControls.disabledArrow){
                updateControls.disabledArrow.css('display','block');
                updateControls.disabledArrow = false;
            }
        }
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

        //Animate Background
        $bgImg.eq(currentPageIndex).removeClass('add-opacity');
        $bgImg.eq(goToSlide).addClass('add-opacity');
        $bgImg.eq(goToSlide).removeClass('gray');
        $bgImg.eq(currentPageIndex).addClass('gray').removeClass('add-opacity');
        currentPageIndex = goToSlide;
        updateControls();
    }

    function setBgImgSizes(){
        $bg.find('.bg-image').each(function(){
            var $item = $(this);
            $item.load(function(){
                var w = $item.width(),
                    h = $item.height(),
                    wr = w / documentWidth,
                    hr = h / documentHeight;
                if (wr < hr || wr === hr){
                    $item.width(documentWidth);
                }
                if (wr > hr){
                    $item.height(documentHeight);
                }

            });
        });
    }

    function resetPage( $outpage, $inpage ) {
        $outpage.attr( 'class', $outpage.data( 'originalClassList' ) );
        $inpage.attr( 'class', $inpage.data( 'originalClassList' ) + ' current-page' );
    }

     function hide_show_slider(goToSlide) {
        if( currentPageIndex === 11 || currentPageIndex === 12 ) {
            sliderModule.stop();
            if(!$('#slider').hasClass('show-slider')) $('#slider').addClass('show-slider');
            var displayProp = currentPageIndex === 11 ? 'block' : 'none';
            $('#startstop').css('display', displayProp);
        }
        else if ($('#slider').hasClass('show-slider')) $('#slider').removeClass('show-slider');

        if( currentPageIndex === 11)
            sliderModule.drawDots();
        if( currentPageIndex === 12)
            bubble(ti, get_current_view());
    }

    init();
})();
