/* 
---------------------
Declaring Variables 
---------------------
*/

var years = [264, 265, 266, 267, 268],
        h = window.innerHeight, w = window.innerWidth, bp = 1,
        t_style = "linear", ti = 0,
        timelapse, tweets, tweets_per_location, tweets_per_hour, times, dates = new Array(),
        barchartheight = 80;

dates[264] = "21-09-2013"
dates[265] = "22-09-2013"
dates[266] = "23-09-2013"
dates[267] = "24-09-2013"
dates[268] = "25-09-2013"


/* 
---------------------
Initialize
---------------------
*/
init();


/* 
---------------------
Handling controls & events 
---------------------
*/

document.onkeydown = checkKey;


// Check key when Pressed
function checkKey(e) {

    if (e.keyCode == '37' && ti > 0) {
        stopAnimate();
        ti--;
        drawDots();
    }
    else if (e.keyCode == '39' && ti < (tweets_per_location.length - 1)) {
        stopAnimate();
        ti++;
        drawDots();
    }
}





/* 
---------------------
Initialize Scale, Projection, SVG, Gradients etc.
---------------------
*/

function init ()
{
    logscale = d3.scale.log()
            .domain([1, 200])
            .range([0, 15]);


    // Define Projection for lat/lng to pixel coordinates.
    projection = d3.geo.mercator()
            .scale((w + 1) / 2.5 / Math.PI)
            .center([0, 5])
            .translate([w / 2, h / 2])
            .precision(.1);

    path = d3.geo.path()
            .projection(projection);

    // Append SVG to body
    svg = d3.select("body").append("svg")
            .attr("width", w)
            .attr("height", h - barchartheight);

    svgbar = d3.select("body").append("svg")
            .attr("width", w)
            .attr("height", barchartheight)
            .attr("id", "barchart");


    // Append Gradient to SVG
    defs = svg.append("defs");

    gradient = defs.append("radialGradient")
            .attr("id", "gradient")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%")


    gradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", "#f7828e")
            .style("stop-opacity", 0.8)

    gradient.append("stop")
            .attr("offset", "30%")
            .style("stop-color", "#db3d3c")
            .style("stop-opacity", 0.5)

    gradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", "#db3d3c")
            .style("stop-opacity", 0.5)

    // Append TEXT to SVG
    textd = svg.append("text")
            .attr("x", w * 0.15)
            .attr("y", h * 0.75)
            .text("LOADING...")

    textt = svg.append("text")
            .attr("x", w * 0.15)
            .attr("y", h * 0.75 + 20)
            .text("")

    // Append G to SVG for world map.
    g = svg.append("g");


    // D3 tip
    tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.number_of_tweets; });
    svg.call(tip);

    // Hidden DIV for information
        infodiv = d3.select("body").append("div")
        .attr("class", "infodiv")
        .style("width", 500);
    

    loadWorld();
    loadTweetHours();
}




/* 
---------------------
Loading JSON
---------------------
*/

// World
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

        loadTweets();
    });

}

// Tweets
function loadTweets() {
    // DRAW TWEETS ON MAP.
    d3.json("data/locations.json", function(error, tweet_locations) {
        tweets_per_location = d3.nest()
                .key(function(d) {
            return d.Time;
        })
        .entries(tweet_locations.RECORDS);
        drawDots();
    });
}


// Tweets per hour for barchart.
function loadTweetHours() {
    // DRAW TWEETS ON MAP.
    d3.json("data/tweets_per_hour.json", function(error, tweet_hour) {
        tweets_per_hour = tweet_hour.RECORDS;
        loadBarchart();
    });
}



/* 
---------------------
Functions Handling Animation
---------------------
*/

function startAnimate()
{
    timelapse = setInterval(animate, 400);
}


function stopAnimate()
{
    clearInterval(timelapse);
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
    }
    
}







/* 
---------------------
Functions for Drawing dots on map. 
---------------------

* @method methodName
* @param {Object} dotsList A list of object to be inserted in the map
* @param {Boolean} animate indicates if the circle needs to be animated or only inserted
* @return {Null} 
*/

function drawDot(dotsList, animate){
  dotsList.attr("cx", function(d) {
        return projection([d.lat, d.lng])[0];
    })
    .attr("cy", function(d) {
        return projection([d.lat, d.lng])[1];
    })
    .attr("style", "fill:url(#gradient)") //Firefox fix
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

    if(animate){
      dotsList.attr("r", function(d) {
        return 0;
      })
    }

    dotsList.transition()
    .ease(t_style)
    .duration(600).attr("r", function(d) {
        return logscale(d.number_of_tweets);
    });
    
}

// Draw dots from current hour based on ti.
function drawDots() {

    var temp_g;
    if (ti == 0)
        temp_g = svg.append("g").attr("id", "avc");
    else
        temp_g = svg.select("#avc");

    temp_g = temp_g.selectAll("circle")
            .data(tweets_per_location[ti].values, function(d) { return d.lat + "-" + d.lng; });

    //update
    drawDot(temp_g, false);

    //enter
    drawDot(temp_g.enter().append("circle"), true);

    //remove
    temp_g.exit().remove();

    //timeset
    var currenttime = tweets_per_location[ti].key;
    textd.text(dates[currenttime.substring(0, 3)]);
    textt.text(currenttime.substring(4, 6) + ":00");

    //set slider
    slider.slide_to(ti)

}

/* 
---------------------
Functions for the Barchart.
---------------------
*/

function loadBarchart ()
{
    // VARIABLES
    var left_rightmargin = 200
    var topmargin = 10;
    var barwidth = w - left_rightmargin * 2;
    var barheight = barchartheight - 20;


    //SCALE FOR NUMBER OF TWEETS VALUE TO PIXELS
    yScale = d3.scale.linear()
    .domain([0, 21322])
    .range([barheight, 0]);

    //FILL BACKGROUND OF LINE
    var rectangle = svgbar.append("rect")
    .attr("x", left_rightmargin)
    .attr("y", 0)
    .attr("width", barwidth)
    .attr("height", barheight - 1);

    //LINEFUNCTION
    var lineFunction = d3.svg.line()
    .x(function(d,i) { return left_rightmargin + i * barwidth/ tweets_per_hour.length; })
    .y(function(d,i) { return yScale(d.number_of_tweets); })
    .interpolate("linear");


    // DIAGRAM WITH LINE
    var lineGraph = svgbar.append("path")
    .attr("d", lineFunction(tweets_per_hour))
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("fill", "none");


    // DIV FOR SLIDER AT CORRECT LOCATION.
    sliderdiv = d3.select("body").append("div")
    .attr("id", "slider")
    .style("width", function(d){return barwidth + "px"})
    .style("height", function(d){return barheight + "px"})
    .style("position", "absolute")
    .style("left", function(d){return left_rightmargin + "px"})
    .style("top", function(d){return (h - barchartheight) + "px"})
    .append("div");

    slider = d3.slider()
        .min(0)
        .max(tweets_per_hour.length - 1)
        .step(1)
        .on("slide", function(evt, value) {
            ti = value;
            drawDots();
        })
    // CREATE SLIDER
    d3.select('#slider div')
    .call(slider);


pos = 0;
    d3.select('#slider-button').on('click', function() { slider.slide_to(++pos); });
    /*
    var circles = svgbar.selectAll("circle")
        .data(tweets_per_hour)
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {
            return 200 + i * barwidth / tweets_per_hour.length + (barwidth / tweets_per_hour.length - bp) / 2;
        })
        .attr("cy", function(d, i) {
            return yScale(d.number_of_tweets) - 8;
        })
        .attr("r", function(d,i) {
            return (barwidth / tweets_per_hour.length - bp) / 2 - 1;
        })
    .on('mouseover', function(d,i) {
        infodiv.transition().style("display","block");
    })
    .on('mouseout', function(d,i) {
        infodiv.transition().style("display","none");
    });
    */


}





