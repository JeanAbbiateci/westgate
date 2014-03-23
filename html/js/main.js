
var pageHeight = 0;


window.load = (function() {
    var pagesContainer = document.querySelector('#pages');
    var pages = document.querySelectorAll('.page');
    pagesContainer.style.webkitTransform = 'translateX(0)';

    function setPagesHeight() {
        pageHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        for (var i = 0; i < pages.length; i++) {
            pages.item(i).style.height = pageHeight + 'px';
        }
    }

    setPagesHeight();
    window.onresize = setPagesHeight;
}());