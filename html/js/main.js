var pageHeight = 0;                             // height of the slides in the page
var pagesList = [];
var pastPos = 0;                                // past position for the scrollHandler
var currentPageIndex = 0;                       // current Pagelist index
var currentPage = pagesList[currentPageIndex];  // current page ID the user is seeing
var headerHeight = 71;                          // header height. Should be dinamix => fix!

//Collect pages id
$('.page').each(function(i){
    var currentID = this.id || i;
    pagesList.push(currentID);
});

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
        pageChanged();
        updateMenu();

    });

    function pageChanged()
    {
        if (currentPage !== pagesList[currentPageIndex]) {
            currentPage = pagesList[currentPageIndex];

            //var pos = $("#" + currentPage).offset().top;
            var pos = pageHeight*currentPageIndex;
            // If it's not the first one, we need to subtract the header height
           
                pos = -(pos);
            /*if (currentPageIndex !== 0)
                pos -= headerHeight;*/
            hide_show_slider();
            
            d3.select(".tooltip").style("opacity",0).style("display", "none");

            $("#pages").css("transform", "translate(0,"+pos+"px)");
            /*$("html, body").stop(true).animate({
                scrollTop: pos
            }, 1000);*/
        }
        return;
    }


    function selectPage(index) {
        if (index >= pagesList.length)
            index = pagesList.length - 1;
        else if (index < 0)
            index = 0;
        return index;
        
    }

    function hide_show_slider(){

        if (currentPage === "tweet-map" || currentPage === "bubble-page")
            {d3.select("#slider").transition().duration(200).style("display", "block").style("opacity", 1);
            }
        else
            {d3.select("#slider").transition().duration(200).style("opacity", 0).style("display", "none");
            }

    }

    var submenulengths = [8,4,4,3,2];

    //Build menu
    function makemenu()
    {
        var total = 0;
        var pageindexes = range(0, pagesList.length);
        for (var i=0;i<submenulengths.length;i++)
        { 
            var subm = submenulengths[i]
            var items = range(0,subm);
            var currentmenu = d3.select("#menu"+i);
            currentmenu.select("ul").selectAll("li")
            .data(pageindexes.slice(total, total+ subm))
            .enter()
            .append("li")
            .attr("class","dot")
            .attr("id", function(d){return "dot"+d})
            .on("click", function(d)
            {   
                //Remove all color and then color current div
                currentPageIndex = d;
                pageChanged();
                updateMenu();
            });

            total = total + subm;
        }
    }

    makemenu();

    function updateMenu()
    {
        d3.selectAll(".dot").classed("active",false);
        d3.select("#dot"+currentPageIndex).classed("active",true);
    }
    updateMenu();


    //Range helper function
    function range(start, end)
    {
        var array = new Array();
        for(var i = start; i < end; i++)
        {
            array.push(i);
        }
        return array;
    }

}());

