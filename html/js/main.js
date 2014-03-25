
(function($) {
    var uniqueCntr = 0;
    $.fn.scrolled = function(waitTime, fn) {
        if (typeof waitTime === "function") {
            fn = waitTime;
            waitTime = 300;
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


var pageHeight = 0;                         // height of the slides in the page
var pagesList = ["page-intro", "tweet-map", "bubble-page", "network", "word-chart"];
var pastPos = 0;                            // past position for the scrollHandler
var currentPage = pagesList[0];             // current page ID the user is seeing

window.load = (function() {
    var pages = document.querySelectorAll('.page');
    
    function setPagesHeight() {
        pageHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0, 700);
        for (var i = 0; i < pages.length; i++) {
            pages.item(i).style.height = pageHeight + 'px';
        }
    }

    var fixUserScrollPosition = function(top) {
        var isUserGoingUp = false;
        if (pastPos > top)
            isUserGoingUp = true;

        var element = null;
        if ((isUserGoingUp && top % (pageHeight) < pageHeight * 3 / 5)
                || (!isUserGoingUp && top % (pageHeight) < pageHeight * 2 / 3)) {
            console.log("going to" + pagesList[parseInt(top / pageHeight)]);
            element = $("#" + pagesList[parseInt(top / pageHeight)]);
        } else if (!isUserGoingUp && top % (pageHeight) > pageHeight * 2 / 3) {
            console.log("going to" + pagesList[parseInt(top / pageHeight) + 1]);
            element = $("#" + pagesList[parseInt(top / pageHeight) + 1]);
        }

        if (element) {
            $(window).off('scroll');


            $("html").stop(true, true).animate({
                scrollTop: $(element).offset().top
            }, 1000, function() {
                // Animation complete.
                console.log("finished");
                $(window).scrolled(function() {
                    var top = $(window).scrollTop();
                    fixUserScrollPosition(top);
                });
                currentPageHandler();
            });
        }
    };

    setPagesHeight();
    window.onresize = setPagesHeight;

    $(window).scrolled(function() {
        var top = $(window).scrollTop();
        fixUserScrollPosition(top);
    });

    function currentPageHandler() {
        $(window).scroll(function() {
            var top = $(window).scrollTop();
            currentPage = pagesList[parseInt(top / pageHeight)];
        });
    }
    currentPageHandler();

}());

