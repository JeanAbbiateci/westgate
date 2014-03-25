
(function($) {
    var uniqueCntr = 0;
    $.fn.scrolled = function(waitTime, fn) {
        if (typeof waitTime === "function") {
            fn = waitTime;
            waitTime = 100;
        }
        var tag = "scrollTimer" + uniqueCntr++;
        this.scroll(function() {
            var self = $(this);
            var timer = self.data(tag);
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function() {
                self.removeData(tag);
                fn.call(self[0]);
                pastPos = $(window).scrollTop();
            }, waitTime);
            self.data(tag, timer);
        });
    };
})(jQuery);


var pageHeight = 0;                             // height of the slides in the page
var pagesList = ["page-intro", "tweet-map", "bubble-page", "network", "word-chart", "photo-gallery"];
var pastPos = 0;                                // past position for the scrollHandler
var currentPageIndex = 0;                       // current Pagelist index
var currentPage = pagesList[currentPageIndex];  // current page ID the user is seeing
var headerHeight = 71;                          // header height. Should be dinamix => fix!

window.load = (function() {
    var pages = document.querySelectorAll('.page');

    function setPagesHeight() {
        pageHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0, 700);
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
        console.log(currentPageIndex);
        if (currentPage !== pagesList[currentPageIndex]) {
            currentPage = pagesList[currentPageIndex];

            var pos = $("#" + currentPage).offset().top;
            // If it's not the first one, we need to subtract the header height
            if (currentPageIndex !== 0)
                pos -= headerHeight;
            $("html").stop(true, true).animate({
                scrollTop: pos
            }, 1000);
        }
    });

    function selectPage(index) {
        if (index >= pagesList.length)
            index = pagesList.length - 1;
        else if (index < 0)
            index = 0;
        return index;
    }

}());

