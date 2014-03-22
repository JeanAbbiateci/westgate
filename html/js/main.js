
var pageHeight = 0;


window.load = (function(){
    var pagesContainer = document.querySelector('#pages');
    var pages = document.querySelectorAll('.page');
    pagesContainer.style.webkitTransform = 'translateX(0)';
    
    function setPagesHeight(){
        pageHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        for(var i=0; i < pages.length; i++) {
            pages.item(i).style.height = pageHeight +'px';
        }
    }

    setPagesHeight();
    window.onresize = setPagesHeight;
    /*function alignPages(){
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        for(var i=0; i < pages.length; i++) {
            pages.item(i).setAttribute('style', 'left:'+i * w + 'px; width:'+ w +'px');
        }
        pagesContainer.style.width = w * pages.length +'px';
    }
    function nextPage(){
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var position = parseFloat(pagesContainer.style.webkitTransform.match(/\d+/)[0]);
        pagesContainer.style.webkitTransform = 'translateX(-' + (position + w) + 'px)';
    }
    function prevPage(){
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var position = parseFloat(pagesContainer.style.webkitTransform.match(/\d+/)[0]);
        pagesContainer.style.webkitTransform = 'translateX(-' + (position - w) + 'px)';
    }
    function checkKey(e){
        e = e || window.event;
        if (e.keyCode === 37) prevPage();
        if (e.keyCode === 39) nextPage();
    }

    document.querySelector('#arrow-right').addEventListener('click', nextPage);
    document.querySelector('#arrow-left').addEventListener('click', prevPage);
    document.onkeydown = checkKey;
    alignPages();
    window.onresize = alignPages;*/
}());