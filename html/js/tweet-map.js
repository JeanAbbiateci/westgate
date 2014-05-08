
var sliderModule = (function(pageHeight) {
    // ... all vars and functions are in this scope only
    // still maintains access to all globals

    /* 
     ---------------------
     Declaring Variables 
     ---------------------
     */

    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0), w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            t_style = "linear",
            timelapse, tweets_per_location, newsfeed, tweets_per_hour, dates = new Array(),
            barchartheight = 100,
            animationSpeed = 700,
            isPlaying = false,
            zoomed = false;

    /* 
     ---------------------
     Initialize
     ---------------------
     */
    init();

    /** /
     * Initialize Scale, Projection, SVG, Gradients etc.
     * 
     * @return {undefined}
     */
    function init()
    {
        logscale = d3.scale.log()
                .domain([1, 200])
                .range([0, 15]);


        // Define Projection for lat/lng to pixel coordinates.
        projection = d3.geo.mercator()
                .scale((w + 1) / 3 / Math.PI)
                .center([0, 0])
                .translate([w / 2, h / 2])
                .precision(.1);

        path = d3.geo.path()
                .projection(projection);

        // Append SVG to body
        svg = d3.select("#tweet-map").append("svg")
                .attr("width", '100%')
                .attr("height",'100%')
                .attr("id", "map")
                .on("click", zooming);


        // Append Gradient to SVG
        defs = svg.append("defs");

        gradient = defs.append("radialGradient")
                .attr("id", "gradient")
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "50%");


        gradient.append("stop")
                .attr("offset", "0%")
                .style("stop-color", "#f7828e")
                .style("stop-opacity", 0.8);

        gradient.append("stop")
                .attr("offset", "30%")
                .style("stop-color", "#db3d3c")
                .style("stop-opacity", 0.5);

        gradient.append("stop")
                .attr("offset", "100%")
                .style("stop-color", "#db3d3c")
                .style("stop-opacity", 0.5);

        // Append G to SVG for world map.
        g = svg.append("g");

        loadWorld();

        // Tooltip Map
        tipdiv = d3.select(".tooltip");


    }

    function zooming() {
  var x, y,
    x = d3.event.pageX,
    y = d3.event.pageY;

    if (zoomed)
    {
        svg.selectAll("g").transition()
        .duration(750)
        .attr("transform", "translate(0,0)scale(" + 1 + ")")
    }

    else
    {
        svg.selectAll("g").transition()
        .duration(750)
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")scale(" + 4 + ")translate(" + -x + "," + -y + ")")
    }
    if (zoomed) zoomed = false;
    else zoomed = true;
}


    /* 
     ---------------------
     Loading JSON
     ---------------------
     */

    /** /
     * Load the map
     * @return {undefined}
     */
    function loadWorld()
    {
        // load and display the World
        d3.json("data/world-110m2.json", function(error, topology) {
            topology2 = topology;
            g.selectAll("path")
                    .data(topojson.feature(topology, topology.objects.countries)
                    .features)
                    .enter()
                    .append("path")
                    .attr("d", path);

            loadTweetHours();
            
        });

    }

    // Tweets
    function loadTweets() {
        // DRAW TWEETS ON MAP.
        d3.json("data/compressed.json", function(error, tweet_locations) {
            tweets_per_location = d3.nest()
                    .key(function(d) {
                return d[0];
            })
            .entries(tweet_locations);
            drawDots();
            settime();
        });
    }

    // Tweets per hour for barchart.
    function loadTweetHours() {
        // DRAW TWEETS ON MAP.
        d3.json("data/tweets_per_hour.json", function(error, tweet_hour) {
            tweets_per_hour = tweet_hour.RECORDS;
            loadNewsItems();
        });
    }

    // News Items
    function loadNewsItems() {
        // DRAW TWEETS ON MAP.
        d3.json("data/updated_massmedianewsfeed.json", function(error, news_feed) {
            newsfeed = news_feed;
            loadBarchart();
            loadTweets();
        });
    }


    /* 
     ---------------------
     Functions Handling Animation
     ---------------------
     */

    function startAnimate() {
        if(!isPlaying){
            $('#play-button').addClass('play');
            timelapse = setInterval(animate, animationSpeed);
            isPlaying = true;
        }
    }


    function stopAnimate() {
        if(isPlaying){
            $('#play-button').removeClass('play');
            clearInterval(timelapse);
            isPlaying = false;
        }
    }


    function animate() {
        ti++;
        if (ti >= (tweets_per_location.length))
        {
            stopAnimate();
        }
        else
        {
            drawDots();
            settime();
        }

    }

    
    /**
    * Method that draw a single circle inside the map
    *
    * @method drawDot
    * @param {Object} dotsList A list of object to be inserted in the map
    * @param {Boolean} animate indicates if the circle needs to be animated or only inserted
    * @return {Null} 
    */
    function drawDot(dotsList, animate) {
        dotsList.attr("cx", function(d) {
            return projection([d[1], d[2]])[0];
        })
                .attr("cy", function(d) {
            return projection([d[1], d[2]])[1];
        })
                .on("mouseover", function(d) {
            tipdiv
                    .style("opacity", 1)
                    .style("display", "block");
            tipdiv.html("<strong>" + d[4] + "</strong>: " + d[3] + " tweets")
                    .style("left", (d3.event.pageX) - 25 + "px")
                    .style("bottom", null)
                    .style("top", (d3.event.pageY - 50) + "px");
        })
                .on("mouseout", function(d) {
            tipdiv.style("opacity", 0).style("display", "none");
        });

        if (animate) {
            dotsList.attr("r", function(d) {
                return 0;
            });
        }

        dotsList.transition()
                .ease(t_style)
                .duration(600).attr("r", function(d) {
            return logscale(d[3]);
        });

    }

    // Draw dots from current hour based on ti.
    /**
    * Method that draw all the dots based on the actual ti (=time)
    *
    * @method drawDots
    * @return {Null} 
    */
    function drawDots() {
        var temp_g;
        if (ti === 0)
            temp_g = svg.append("g").attr("id", "avc");
        else
            temp_g = svg.select("#tweet-map #avc");

        temp_g = temp_g.selectAll("circle")
                .data(tweets_per_location[ti].values, function(d) {
            return d[1] + "-" + d[2];
        });

        //update
        drawDot(temp_g, false);

        //enter
        drawDot(temp_g.enter().append("circle"), true);

        //remove
        temp_g.exit().remove();

        //set slider
        slider.slide_to(ti);

    }

    function settime()
    {
        //timeset
        var currenttime = tweets_per_location[ti].key;
        var timeobject = moment(currenttime.substring(4, 6) + "-" + currenttime.substring(0, 3) + "-2013+0000", "HH-DDD-YYYY+Z");
        timediv.html("<h1>" + timeobject.zone(-3).format("dddd D, h:mm a") + "</h1>");
    }

    /* 
     ---------------------
     Functions for the Barchart.
     ---------------------
     */
    
    /** /
     * 
     * @return {undefined}
     */
    function loadBarchart()
    {   
        // VARIABLES
        var topmargin = 8;
        var playPauseWidth = 70;
        var left_rightmargin = 200 + playPauseWidth / 2;
        var barwidth = w - left_rightmargin * 2;
        var barheight = barchartheight - 30;


        // DIV FOR SLIDER AT CORRECT LOCATION.
        slidercontainer = d3.select("body").append("div")
                .attr("id", "slider")
                .style("width", function(d) {
            return barwidth - 10 + "px";
        })
                .style("height", function(d) {
            return barheight + "px";
        })
                .style("left", function(d) {
            return left_rightmargin + "px";
        });

        var playPause = d3.select("#slider").append("div")
            .attr("id", "startstop")
            .append("a")
            .attr("id", "play-button");

        playPause.on('click', function(e) {
            isPlaying ? stopAnimate() : startAnimate();
        });

        sliderdiv = slidercontainer.append("div");

        slider = d3.slider()
                .min(0)
                .animate(animationSpeed)
                .max(tweets_per_hour.length - 1)
                .step(1)
                .on("slide", function(evt, value) {
                    ti = value;
                    if(currentPageIndex === 11)
                        drawDots();
                    else
                        bubble(ti, get_current_view());

                    settime();
                });
        // CREATE SLIDER
        sliderdiv
                .call(slider)

        svgbar = sliderdiv.append("svg")
                .attr("width", barwidth - playPauseWidth)
                .attr("height", barheight)
                .attr("id", "barchart");

        //SCALE FOR NUMBER OF TWEETS VALUE TO PIXELS
        yScale = d3.scale.linear()
                .domain([0, 21322])
                .range([barheight, topmargin]);

        //FILL BACKGROUND OF LINE
        svgbar.append("rect")
                .attr("x", 0)
                .attr("y", topmargin)
                .attr("width", barwidth)
                .attr("height", barheight - topmargin - 1);

        //LINEFUNCTION
        var lineFunction = d3.svg.line()
                .x(function(d, i) {
            return i * barwidth / tweets_per_hour.length;
        })
                .y(function(d, i) {
            return yScale(d.number_of_tweets);
        })
                .interpolate("linear");


        // DIAGRAM WITH LINE
        svgbar.append("path")
                .attr("d", lineFunction(tweets_per_hour))
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("fill", "none");


        // Circles for news events
        svgbar.selectAll("circle")
                .data(newsfeed)
                .enter()
                .append("circle")
                .attr("cx", function(d, i) {
                    if (d[0] instanceof Array)
                        time = d[0][0];
                    else
                        time = d[0];
            return time * (barwidth - playPauseWidth) / tweets_per_hour.length + (barwidth / tweets_per_hour.length) / 2;
        })
                .attr("cy", function(d, i) {
            return 4;
        })
                .attr("r", 4)
                .on("mouseover", function(d,i) {


            tooltip.html(buildTooltipData(d,i))
                    .style("left", (d3.event.pageX - 200) + "px")
                    .style("top", null)
                    .style("bottom", (h - d3.event.pageY + 6) + "px")
                    .style("opacity", 0)
                    .style("display", "block")
                    .style("opacity", 1);

        })
                .on("mouseout", function(d) {
            tooltip.style("opacity", 0).style("display", "none")
                    
        });

        // TimeDiv
        timediv = slidercontainer.append("div")
                .attr("class", "timediv")
                .html("<h1>LOADING...</h1>");

    }

    function buildTooltipData(d, i) {

        var text = [];
        if (d[0] instanceof Array) {
            for (var i = 0; i < d.length; i++)
                text = text + "<p>" + d[i][1] + " - " + d[i][2] + "</br>" + d[i][4] + "</br" + d[i][3] + "</p>";
        }
        else
            text = "<p>" + d[1] + " - " + d[2] + "</br>" + d[4] + "</br" + d[3] + "</p>";
        return text;
    }

    return {stop: stopAnimate, play: animate, drawDots: drawDots}
}(pageHeight));
