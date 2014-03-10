var h = window.innerHeight * 0.7,
	w = window.innerWidth * 0.8,
	bp = 3,
	pad = 30,
	dataPerYearMonth = new Array(),
	t_style = "bounce",
	svgContainer, yScale, yAxis;

var data = [78, 20, 34, 61, 93, 55, 76, 94, 85, 8, 11, 16, 56, 1, 28, 96, 67, 10, 99, 35, 69, 40, 23, 89, 47, 18, 98, 81, 45, 2, 87, 5, 3, 14, 13, 39, 36, 29, 97, 66, 86, 15, 73, 49, 38, 12, 44, 24, 79, 19, 62, 92, 4, 7, 68, 82, 31, 43, 83, 6, 25, 9, 37, 26, 64, 27, 71, 32, 50, 54, 88, 91, 80, 59, 75, 51, 48, 63, 65, 42, 70, 41, 100, 58, 22, 33, 17, 46, 30, 84, 21, 77, 90, 95, 72, 52, 74, 57, 53, 60];
var data2 = [27, 89, 96, 6, 4, 30, 81, 53, 46, 21, 15, 33, 76, 65, 9, 95, 48, 86, 26, 19, 67, 97, 12, 5, 61, 44, 23, 56, 2, 70, 60, 40, 99, 77, 100, 41, 36, 14, 78, 59, 37, 39, 68, 20, 47, 50, 22, 34, 57, 58, 69, 90, 43, 49, 64, 98, 28, 1, 7, 94, 42, 71, 24, 45, 82, 32, 73, 16, 92, 35, 31, 11, 18, 88, 63, 62, 55, 93, 17, 29, 38, 66, 8, 10, 91, 25, 54, 87, 83, 74, 85, 72, 79, 75, 3, 51, 13, 80, 84, 52];
var currentdata = data;

// ADD EVENTS TO ARROW KEYS
document.onkeydown = checkKey;


function checkKey(e) {

    if (e.keyCode == '37') {
    	currentdata = data;
    }
    else if (e.keyCode == '39') {
        currentdata = data2;
    }
    updateVis();
}

// ONCHANGE WINDOW SIZE
window.onresize = function(event) {
    d3.select("svg")
    .remove();
    draw(false)
};


// CALLS ALL FUNCTIONS TO DRAW.
function draw(first){
	h = window.innerHeight * 0.7;
	w = window.innerWidth * 0.8; 
    svgContainer = d3.select("body").append("svg").attr("width", w + pad).attr("height", h + pad);
    makeScale();
    generateVis(first);
}

// MAKE SCALE BASED ON YEAR'S DATA.
function makeScale ()
{
	yScale = d3.scale.linear()
	.domain([0, (d3.max(currentdata)) + 3])
	.range([h, 0]);

	yAxis = d3.svg.axis()
   	.scale(yScale)
    .orient("left")
    .ticks(10);
}

// GENERATE THE VISUALISATION
function generateVis (first) {
var bars = svgContainer.selectAll("rect")
	.data(currentdata)
	.enter()
	.append("rect");

var barAttributes = bars
	.attr("width", w / currentdata.length - bp )
	.attr("height", 0 )
	.attr("x", function (d, i) { return pad + i * w / currentdata.length ; })
	.attr("y", h);  

var textvalue = svgContainer.selectAll("text.values")
	.data(currentdata)
	.enter()
	.append("text");   

/*
var textAttributes = textvalue
	.text(function(d) {
        return d.toFixed(1);
    })
	.attr("x", function(d, i) {
		return pad + i * w / currentdata.length + (w / currentdata.length - bp) / 2;
	})
   .attr("y", h)
   .attr("class", "values")

var textmonth = svgContainer.selectAll("text.month")
	.data(currentdata)
	.enter()
	.append("text"); 

var textMonthAttributes = textmonth
	.text(function(d) {
        return d;
    })
	.attr("x", function(d, i) {
		return pad + i * w / currentdata.length + (w / currentdata.length - bp) / 2;
	})
   .attr("y", function(d) {
        return h + 15;
   }) */

   svgContainer.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (0.7*pad) + ",0)")
    .call(yAxis);

    if (first)
    {
	    bars = bars
	    .transition()
		.ease(t_style)
		.duration(2000) 
		/*
		textvalue = textvalue
		.transition()
		.ease(t_style)
		.duration(2000)  */
    }
    	bars
    	.attr("height", function (d) {return h - yScale(d);} )
		.attr("y", function(d,i) {return yScale(d);});  

		/*
		textvalue
		.attr("y", function(d) {
        return (yScale(d)) + 17;
   		});*/
}


//UPDATE THE VISUALISATION.
function updateVis(){
	makeScale()

	//Update Bars
	svgContainer.selectAll("rect")
   .data(currentdata)
   .transition()
   .ease(t_style)
   .duration(2000)
   .attr("y", function(d) {
        return yScale(d);
   })
   .attr("height", function(d) {
        return h- yScale(d);
   });

   /*
   svgContainer.selectAll("text.values")
   .data(currentdata)
   .transition()
   .ease(t_style)
   .duration(2000)
   .text(function(d) {
        return d.toFixed(1);
    })
	.attr("y", function(d) {
        return (yScale(d)) + 17;
   }) */

	d3.select("g.axis")
	.transition()
   	.ease(t_style)
   	.duration(2000)
   	.call(yAxis)
}

draw(true);
