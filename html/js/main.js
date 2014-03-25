
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


var pageHeight = 0;                         // height of the slides in the page
var pagesList = ["page-intro", "tweet-map", "bubble-page", "network", "word-chart", "photo-gallery"];
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
console.log(pastPos+" "+top);
        var element = null;
        if (isUserGoingUp){
            index = selectPage(parseInt(top / pageHeight));
            console.log("going to" + pagesList[index]);
            element = $("#" + pagesList[index]);
        } else{
            index = selectPage(parseInt(top / pageHeight)+1);
            console.log("going to" + pagesList[index]);
            element = $("#" + pagesList[index]);
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
            var index = parseInt(top / pageHeight);
            
            currentPage = pagesList[selectPage(index)];
        });
    }
    
    function selectPage(index){
        if (index >= pagesList.length)
                index = pagesList.length-1;
            else if (index < 0)
                index = 0;
        return index;
    }
    currentPageHandler();

}());

