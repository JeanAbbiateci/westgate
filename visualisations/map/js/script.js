/* 
---------------------
Declaring Variables 
---------------------
*/

var years = [264, 265, 266, 267, 268],
        h = window.innerHeight, w = window.innerWidth, bp = 1,
        t_style = "linear", ti = 0,
        timelapse, tweets, tweets_per_location, tweets_per_hour, times, dates = new Array();

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
            .range([0, 20]);


    // Define Projection for lat/lng to pixel coordinates.
    projection = d3.geo.mercator()
            .scale((w + 1) / 2.2 / Math.PI)
            .center([0, 20])
            .translate([w / 2, h / 2])
            .precision(.1);

    path = d3.geo.path()
            .projection(projection);


    // Append SVG to body
    svg = d3.select("body").append("svg")
            .attr("width", w)
            .attr("height", h -80);

    svgbar = d3.select("body").append("svg")
            .attr("width", w)
            .attr("height", 70)
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
            .style("stop-color", "#FDDCDC")
            .style("stop-opacity", 0.8)

    gradient.append("stop")
            .attr("offset", "30%")
            .style("stop-color", "#FF8A66")
            .style("stop-opacity", 0.3)

    gradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", "#FF6666")
            .style("stop-opacity", 0.2)

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

    // d3.tip
    tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.number_of_tweets; });
    svg.call(tip);

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
    drawDots();

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

    //timeset
    var currenttime = tweets_per_location[ti].key;
    textd.text(dates[currenttime.substring(0, 3)]);
    textt.text(currenttime.substring(4, 6) + ":00");

    //remove
    temp_g.exit().remove();

    // change current bar
    fillCurrentBar();
}

/* 
---------------------
Functions for the Barchart.
---------------------
*/

function loadBarchart ()
{

    yScale = d3.scale.linear()
    .domain([0, 21322])
    .range([70, 0]);

    var bars = svgbar.selectAll("rect")
        .data(tweets_per_hour)
        .enter()
        .append("rect")
        .on("click", function(d,i) {

            stopAnimate();
            ti = i;
            drawDots();

        })

    var barAttributes = bars
        .attr("width", (w-400) / tweets_per_hour.length - bp )
        .attr("height", function (d) {return h - yScale(d.number_of_tweets);} )
        .attr("x", function (d, i) {
            return 200 + i * (w-400) / tweets_per_hour.length ; 
        })
        .attr("id", function(d,i){
            return "bar_" + i;
        })
        .attr("y", function(d,i) {return yScale(d.number_of_tweets);})
}

function fillCurrentBar ()
{
    d3.selectAll("#barchart rect").classed("currentbar", false)
    d3.select("#bar_" + ti).classed("currentbar", true)
}





