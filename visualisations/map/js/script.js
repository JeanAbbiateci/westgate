var years = [264, 265, 266, 267, 268],
        h = window.innerHeight, w = window.innerWidth,
        t_style = "linear", ti = 0,
        timelapse, tweets, tweets_per_hour = new Array(), times, dates = new Array();

dates[264] = "21-09-2013"
dates[265] = "22-09-2013"
dates[266] = "23-09-2013"
dates[267] = "24-09-2013"
dates[268] = "25-09-2013"

//Events
document.onkeydown = checkKey;

//reset the slider position
d3.select("#slider").property("value", 0);

// Check key when Pressed
function checkKey(e) {

    if (e.keyCode == '37' && ti > 0) {
        stopAnimate();
        ti--;
        d3.select("#slider").property("value", ti);
        drawDots();
    }
    else if (e.keyCode == '39' && ti < (tweets_per_hour.length - 1)) {
        stopAnimate();
        ti++;
        d3.select("#slider").property("value", ti);
        drawDots();
    }
}

//When slider changes
function sliderChanged(value)
{
    stopAnimate();
    ti = value;
    drawDots();
}

// Create Logaritmic Scale.
var logscale = d3.scale.log()
        .domain([1, 200])
        .range([0, 20]);


// Define Projection for lat/lng to pixel coordinates.
var projection = d3.geo.mercator()
        .scale((w + 1) / 2.2 / Math.PI)
        .center([0, 20])
        .translate([w / 2, h / 2])
        .precision(.1);

var path = d3.geo.path()
        .projection(projection);



// Append SVG to body
var svg = d3.select("body").append("svg")
        .attr("width", w)
        .attr("height", h);


// Append Gradient to SVG
var defs = svg.append("defs");

var gradient = defs.append("radialGradient")
        .attr("id", "gradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")

gradient.append("stop")
        .attr("offset", "0%")
        .style("stop-color", "white")
        .style("stop-opacity", 1)

gradient.append("stop")
        .attr("offset", "40%")
        .style("stop-color", "#FF6666")
        .style("stop-opacity", 0.1)

gradient.append("stop")
        .attr("offset", "90%")
        .style("stop-color", "#FF6666")
        .style("stop-opacity", 0.1)

gradient.append("stop")
        .attr("offset", "100%")
        .style("stop-color", "#444")
        .style("stop-opacity", 0.9)

// Append TEXT to SVG
var textd = svg.append("text")
        .attr("x", w * 0.15)
        .attr("y", h * 0.75)
        .text("LOADING...")

var textt = svg.append("text")
        .attr("x", w * 0.15)
        .attr("y", h * 0.75 + 20)
        .text("")

// Append G to SVG for world map.
var g = svg.append("g");

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


// Load tweets from JSON
function loadTweets() {
    // DRAW TWEETS ON MAP.
    d3.json("data/locations.json", function(error, tweet_locations) {
        tweets = tweet_locations;
        tweets_per_hour = d3.nest()
                .key(function(d) {
            return d.Time;
        })
        .entries(tweets.RECORDS);
        drawDots();
        //timelapse = setInterval(drawDots,2000);
    });
}


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
    if (ti >= (tweets_per_hour.length))
    {
        stopAnimate();
    }
    d3.select("#slider").property("value", ti);
    drawDots();

}

/**
* Draw a circle in the map 
*
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
    .attr("style", "fill:url(#gradient)"); //Firefox fix

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
console.log(tweets_per_hour);
    if (ti == 0)
        temp_g = svg.append("g").attr("id", "avc");
    else
        temp_g = svg.select("#avc");

    temp_g = temp_g.selectAll("circle")
            .data(tweets_per_hour[ti].values, function(d) { return d.lat + "-" + d.lng; });

    //update
    drawDot(temp_g, false);

    //enter
    drawDot(temp_g.enter().append("circle"), true);

    //timeset
    var currenttime = tweets_per_hour[ti].key;
    textd.text(dates[currenttime.substring(0, 3)]);
    textt.text(currenttime.substring(4, 6) + ":00");

    //remove
    temp_g.exit().remove();
}

