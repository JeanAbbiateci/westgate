/* 
---------------------
Declaring Variables 
---------------------
*/

var years = [264, 265, 266, 267, 268],
        h = window.innerHeight, w = window.innerWidth, bp = 1,
        t_style = "linear", ti = 0,
        timelapse, tweets, tweets_per_location, newsfeed, tweets_per_hour, times, dates = new Array(),
        barchartheight = 110,
        animationSpeed = 700;

dates[264] = "21-09-2013";
dates[265] = "22-09-2013";
dates[266] = "23-09-2013";
dates[267] = "24-09-2013";
dates[268] = "25-09-2013";


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
//reset the slider position
d3.select("#slider").property("value", 0);

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

document.onkeydown = checkKey;

var playPauseElement = d3.select('#startstop a');
playPauseElement.on('click', function() { 
    if(!this.classList.contains("play")){
        stopAnimate();

        playPauseElement.transition()
        .duration(300)
        .style("opacity", 0).each("end", function(){
            playPauseElement.classed("play", true).transition().duration(100).style("opacity", 1);
        });
    }else{
        startAnimate();

        playPauseElement.transition()
        .duration(300)
        .style("opacity", 0).each("end", function(){
            playPauseElement.classed("play", false).transition().duration(100).style("opacity", 1);
        });
    }
     
});

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

    // Append TEXT to SVG
    textd = svg.append("text")
            .attr("x", w * 0.15)
            .attr("y", h * 0.75)
            .text("LOADING...");

    textt = svg.append("text")
            .attr("x", w * 0.15)
            .attr("y", h * 0.75 + 20)
            .text("");

    // Append G to SVG for world map.
    g = svg.append("g");

    loadWorld();

    // Tooltip Map
    tipdiv = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

    // Tooltip News
    newstipdiv = d3.select("body").append("div")   
    .attr("class", "newstip")               
    .style("opacity", 0);
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
    d3.json("data/newsfeed.json", function(error, news_feed) {
        console.log(error);
        newsfeed = news_feed;
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
    timelapse = setInterval(animate, animationSpeed);
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
        return projection([d[1], d[2]])[0];
    })
    .attr("cy", function(d) {
        return projection([d[1], d[2]])[1];
    })
    .attr("style", "fill:url(#gradient)") //Firefox fix
    .on("mouseover", function(d) {      
            tipdiv.transition()        
                .duration(500)      
                .style("opacity", .7);      
            tipdiv .html(d[4] + ": " + d[3] + " tweets")  
                .style("left", (d3.event.pageX) - 25 + "px")     
                .style("top", (d3.event.pageY - 40) + "px");    
            })                  
        .on("mouseout", function(d) {       
            tipdiv.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });

    if(animate){
      dotsList.attr("r", function(d) {
        return 0;
      })
    }

    dotsList.transition()
    .ease(t_style)
    .duration(600).attr("r", function(d) {
        return logscale(d[3]);
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
            .data(tweets_per_location[ti].values, function(d) { return d[1] + "-" + d[2]; });

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
    slider.slide_to(ti);

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
    var playPauseWidth = 80;
    var barwidth = w - playPauseWidth - left_rightmargin * 2;
    var barheight = barchartheight - 40;


    //SCALE FOR NUMBER OF TWEETS VALUE TO PIXELS
    yScale = d3.scale.linear()
    .domain([0, 21322])
    .range([barheight, topmargin]);

    //FILL BACKGROUND OF LINE
    var rectangle = svgbar.append("rect")
    .attr("x", left_rightmargin)
    .attr("y", topmargin)
    .attr("width", barwidth)
    .attr("height", barheight - topmargin - 1);

    //LINEFUNCTION
    var lineFunction = d3.svg.line()
    .x(function(d,i) { return left_rightmargin + i * barwidth/ tweets_per_hour.length +(barwidth / tweets_per_hour.length - bp); })
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
    .style("height", function(d){return barheight - topmargin + "px"})
    .style("position", "absolute")
    .style("left", function(d){return left_rightmargin + "px"})
    .style("top", function(d){return (h - barchartheight) + topmargin + "px"})
    .append("div");

    slider = d3.slider()
        .min(0)
        .animate(animationSpeed)
        .max(tweets_per_hour.length - 1)
        .step(1)
        .on("slide", function(evt, value) {
            ti = value;
            console.log(ti)
            drawDots();
        });
    // CREATE SLIDER
    d3.select('#slider div')
    .call(slider);

    d3.select("#startstop")
    .style("left", function(d){return left_rightmargin - playPauseWidth + "px"})
    .style("top", function(d){return (h - barchartheight -2)+ topmargin + "px"});



    var circles = svgbar.selectAll("circle")
        .data(newsfeed)
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {
            return 200 + d[0] * barwidth / tweets_per_hour.length + (barwidth / tweets_per_hour.length - bp) / 2;
        })
        .attr("cy", function(d, i) {
            return 7;
        })
        .attr("r", 4)
        .on("mouseover", function(d) {      
            newstipdiv.transition()        
                .duration(500)      
                .style("opacity", .7);      
            newstipdiv .html(
                // Source + Time
                '<p class="time">' + d[2] + ":" + d[1] + "</p>" +
                // Content
                '<p class="content">' + d[3] + "</p>" +
                // link
                '<p>Click on dot to open</p>'
                )  
                .style("left", (d3.event.pageX) - 100 + "px")     
                .style("bottom", (h - d3.event.pageY) + "px")
            })      
        .on("mouseout", function(d) {       
            newstipdiv.transition()        
                .duration(500)      
                .style("opacity", 0);   
        })
        .on("click", function(d){
            window.location = d[4];
        });
    


}





