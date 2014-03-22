
function wordsChart(pageID) {
    this.pageID = pageID;

    this.dataTotal = [];
    this.data = [];
    this.svgContainer = null;
    this.tooltip = null;
    this.checkClicked = null;
    // labels
    this.labels = ["al-Shabaab", "Terrorists", "Gunmen", "Thugs", "Militants", "Criminals", "Gangsters", "Robbers", "Jihadists", "Murderers", "Extremists", "Islamists", "Enemies"];
    // colors				
    this.colors = ["#DB3D3D", "#FCA43A", "#008DAA", "#91399E", "#9467bd", "#8c564b", "#e377c2", "#ff7f0e", "#98df8a", "#b34228", "#ff9896", "#17becf", "#c5b0d5"];
    this.sData = null;
}

// load everything from json
wordsChart.prototype.loadData = function() {
    d3.json("data/wordsDay.json", function(error, json) {
        if (error)
            return console.warn(error);
        chart.data = json;

        d3.json("data/wordsDayTotal.json", function(error, json) {
            if (error)
                return console.warn(error);
            chart.dataTotal = json;
            chart.visualizeitTotal();
        });
    });


};


wordsChart.prototype.visualizeitTotal = function() {

    // bring date to the correct format
    var parseDate = d3.time.format("%Y-%m-%d").parse;
    this.dataTotal.forEach(function(d) {
        d.date = parseDate(d.date);
    });


    this.checkClicked = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1];
    /*data.forEach(function(d) {
     checkClicked.push(1);
     });*/

    // transform data to percentage
    var y_maxa = [];
    this.data.forEach(function(b, j) {
        if (chart.checkClicked[j] !== 0) {
            y_maxa.push(d3.max(b.occurs, function(d, i) {
                return d = Math.round((d * 100 / chart.dataTotal[i].occurs) * 10) / 1000;
            }));
        }
    });


    this.padding = 50;
    this.axisPadding = 40;
    this.axisPaddingX = 45;
    this.monthsPadding = 27;

    this.margin = {top: 10, right: 10, bottom: 10, left: 10};
    this.w = 900 - this.margin.left - this.margin.right;
    this.h = 500 - this.margin.top - this.margin.bottom;

    // scalling
    var xScale = d3.time.scale().range([this.padding, this.w - this.padding]);
    xScale.domain(d3.extent(chart.dataTotal, function(d) {
        return d.date;
    }));

    var yScale = d3.scale.linear()
            .range([this.h - this.padding, this.padding]);
    yScale.domain([0, d3.max(y_maxa, function(d) {
            return d;
        })]);

    // Axis
    var xAxis = d3.svg.axis().scale(xScale)
            .orient("bottom").ticks(4);

    var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .tickFormat(d3.format(".0%"))
            .ticks(4);


    this.line = d3.svg.line();

    // svg container for linechart
    var container = d3.select("#word-chart .container");
    this.svgContainer = container.append("svg")
            .attr("width", this.w)
            .attr("height", this.h)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    // svg container for legend
    var wlegend = 250;
    var hlegend = 350;


    this.legendsvg = container.append("svg")
            .attr("width", wlegend)
            .attr("height", 420);

    // setting the grid for y axis
    var gridy = this.svgContainer.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(" + this.axisPadding + ",0)")
            .call(this.make_y_axis(yScale)
            .tickSize(-w, 0, 0)
            .tickFormat("")
            );

    // create the vertical lines
    this.dataTotal.forEach(function(b, j) {

        chart.svgContainer.selectAll("rect.lines")
                .data(chart.dataTotal)
                .enter()
                .append("rect")
                .attr("x", xScale(b.date) - 1)
                .attr("y", this.padding)
                .attr("width", 2)
                .attr("height", this.h - this.padding - 50)
                .attr("class", "lala")
                .style("opacity", 0)
                .attr("id", "verlines-" + j);
    });


    // line "holder" for the mouse over event
    this.svgContainer.selectAll("rect.linesholders")
            .data(chart.dataTotal)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
        return xScale(chart.dataTotal[i].date) - 80;
    })
            .attr("y", this.padding)
            .attr("width", 160)
            .attr("height", this.h - this.padding - 50)
            .attr("class", "linesholders")
            .style("fill", "#000")
            .style("opacity", 0)
            .on("mouseover", function(d, i) {

        chart.svgContainer.select("#verlines-" + i).transition()
                .duration(100)
                .style("opacity", .4)
                .style("visibility", "visible");

        chart.tooltip.transition()
                .duration(100)
                .style("opacity", .9);

        chart.tooltip.html(chart.buildTooltipData(d, i))
                .style("visibility", "visible");
    })


            .on("mousemove", function() {
        return chart.tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
    })

            .on("mouseout", function(d, i) {
        chart.svgContainer.select("#verlines-" + i).transition()
                .duration(120)
                .style("opacity", 0);

        chart.tooltip.transition()
                .duration(120)
                .style("opacity", 0);
    });




    // build lines, dots, and legend
    this.data.forEach(function(b, j) {

        // legend rectangles 
        chart.legendsvg.append("rect")
                .attr("x", 40)
                .attr("y", j * (hlegend / chart.data.length) + 5)
                .attr("width", 10)
                .attr("height", 10)
                .attr("id", "rect-" + j)
                .style("fill", "#fff")
                .style("stroke", chart.colors[j])
                .attr("rx", 2)
                .attr("ry", 2)
                .style("stroke-width", 2)
                .on("click", function() {
            chart.onclickfunc(j, xAxis, yAxis, xScale, yScale, gridy);
        });

        // legend labels
        chart.legendsvg.append("text")
                .attr("x", 60)
                .attr("y", j * (hlegend / chart.data.length) + 10)
                .attr("dy", ".35em")
                .text(chart.labels[j])
                .on("mouseover", function() {
            chart.hideLinesFunc(j);
        })
                .on("mouseout", function() {
            chart.showLinesFunc(j);
        });

        // if on checkClicked list then take occurances of of word
        if (chart.checkClicked[j] !== 0) {
            // take occurances of each word for all days
            chart.sData = b.occurs;

            // lines
            chart.line
                    .x(function(d, i) {
                return xScale(chart.dataTotal[i].date);
            })
                    .y(function(d, i) {
                d = Math.round((d * 100 / chart.dataTotal[i].occurs) * 10) / 1000;
                return yScale(d);
            });

            chart.svgContainer.append("path")
                    .attr("class", "grammes")
                    .attr("d", chart.line(chart.sData))
                    .attr("id", "lines-" + j)
                    .style("stroke", chart.colors[j]);

            // circles to the lines	
            circles = chart.svgContainer.selectAll("dot")
                    .data(chart.sData)
                    .enter()
                    .append("circle")
                    .attr("r", 3)
                    .attr("cx", function(d, i) {
                return xScale(chart.dataTotal[i].date);
            })
                    .attr("cy", function(d, i) {
                d = Math.round((d * 100 / chart.dataTotal[i].occurs) * 10) / 1000;
                return yScale(d);
            })
                    .attr("id", "circles-" + j)
                    .style("fill", "#000")
                    .style("fill", chart.colors[j]);


            chart.legendsvg.select("#rect-" + j).style("fill", chart.colors[j]);
        }

    });

    // tooltip div
    chart.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("height", "auto")
            .style("opacity", 0)
            .attr("z-index", 1000);
    // axis
    axiss = this.svgContainer.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + this.axisPadding + ",0)")
            .call(yAxis);


    axissX = this.svgContainer.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (this.h - this.axisPaddingX) + ")")
            .call(xAxis);

    // text label for x axis
    this.svgContainer.append("text")
            .attr("transform", "translate(" + (this.w / 2) + " ," + (this.h - this.margin.bottom) + ")")
            .style("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#8A93A5")
            .text("Date");

    // text label for y axis				
    this.svgContainer.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", (0 - this.margin.left))
            .attr("x", 0 - (this.h / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#8A93A5")
            .text("Frequency");


};

// hide lines and dots on mouseover	
wordsChart.prototype.hideLinesFunc = function(pos) {
    this.data.forEach(function(b, j) {
        if ((pos !== j) && (chart.checkClicked[pos] !== 0)) {
            chart.svgContainer.select("#lines-" + j)
                    .transition()
                    .duration(250)
                    .style("opacity", .1);

            chart.svgContainer.selectAll("#circles-" + j)
                    .transition()
                    .duration(250)
                    .style("opacity", .1);

        }
    });
};

// show lines and dots on mouseout	
wordsChart.prototype.showLinesFunc = function(pos) {
    this.data.forEach(function(b, j) {
        if (pos !== j) {
            chart.svgContainer.select("#lines-" + j)
                    .transition()
                    .duration(250)
                    .style("opacity", 1);

            chart.svgContainer.selectAll("#circles-" + j)
                    .transition()
                    .duration(250)
                    .style("opacity", 1);

        }
    });
};

// build tooltip
wordsChart.prototype.buildTooltipData = function(d, i) {

    // take a list of all words and their occurances for day i
    dayView = [];
    chart.data.forEach(function(b, j) {
        if (chart.checkClicked[j] !== 0)
            dayView.push([chart.colors[j], chart.labels[j], b.occurs[i]]);
    });

    // sort the list
    sortedDayView = dayView.sort(function(a, b) {
        return b[2] - a[2];
    });

    // build the html code
    head = "<table ><tr><td class='tableHead' colspan='3'><b>Day " + (i + 1) + ".</b> Total: " + d.occurs + "</td></tr>";
    rest = "";
    sortedDayView.forEach(function(b, j) {
        rest = rest + "<tr><td> <FONT size='4' COLOR='" + b[0] + "'><b>- </b></FONT>" + b[1] + "</td><td>" + b[2] + "</td></tr>";
    });

    return head + rest + "</table>";

};

/*	
 function make_x_axis() {		
 return d3.svg.axis()
 .scale(xScale)
 .orient("bottom")
 .ticks(5)
 }
 */

// make grid for y axis
wordsChart.prototype.make_y_axis = function(yScale) {
    return d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(4);
};

// legend-rechtangles on click 	
wordsChart.prototype.onclickfunc = function(pos, xAxis, yAxis, xScale, yScale, gridy) {

    // remove or add the word in this pos to the list
    if (chart.checkClicked[pos] === 0) {
        chart.checkClicked[pos] = 1;

        // rebuild the line
        this.svgContainer.append("path")
                .attr("class", "grammes")
                .attr("d", this.line(this.sData))
                .attr("id", "lines-" + pos)
                .style("stroke", this.colors[pos]);

        // rebuild circles
        this.svgContainer.selectAll("dot")
                .data(this.sData)
                .enter()
                .append("circle")
                .attr("r", 3)
                .attr("cx", function(d, i) {
            return xScale(chart.dataTotal[i].date);
        })
                .attr("cy", function(d, i) {
            d = Math.round((d * 100 / chart.dataTotal[i].occurs) * 10) / 1000;
            return yScale(d);
        })
                .attr("id", "circles-" + pos)
                .style("fill", this.colors[pos]);

        // rebuild rect
        this.legendsvg.select("#rect-" + pos).style("fill", this.colors[pos]);
    }
    else {
        chart.checkClicked[pos] = 0;
        // remove line
        this.svgContainer.select("#lines-" + pos).remove();
        // remove circles
        this.svgContainer.selectAll("#circles-" + pos).remove();
        // remove rect
        this.legendsvg.select("#rect-" + pos).style("fill", "#fff");
    }

    // re-calculate max value for y axis
    var y_max = [];
    this.data.forEach(function(b, j) {
        if (chart.checkClicked[j] !== 0) {
            y_max.push(d3.max(b.occurs, function(d, i) {
                return d = Math.round((d * 100 / chart.dataTotal[i].occurs) * 10) / 1000;
            }));
        }
    });

    // update scale for y axis
    yScale.domain([0, d3.max(y_max, function(d) {
            return d;
        })]);

    yAxis.scale(yScale);

    axiss.transition()
            .duration(750)
            .call(yAxis);

    // update y grid
    gridy.transition()
            .duration(750)
            .call(this.make_y_axis(yScale)
            .tickSize(-this.w, 0, 0)
            .tickFormat(""));

    // update lines 
    this.data.forEach(function(b, j) {

        // if still on checkClicked list then take occurances of of word
        if (chart.checkClicked[j] !== 0) {
            chart.sData = b.occurs;

            // transition for lines and circles
            chart.svgContainer.select("#lines-" + j)
                    .transition()
                    .duration(750)
                    .attr("d", chart.line(chart.sData))
                    .style("stroke", chart.colors[j]);


            chart.svgContainer.selectAll("#circles-" + j)
                    .data(chart.sData)
                    .transition()
                    .duration(750)
                    .attr("r", 3)
                    .attr("cx", function(d, i) {
                return xScale(chart.dataTotal[i].date);
            })
                    .attr("cy", function(d, i) {
                d = Math.round((d * 100 / chart.dataTotal[i].occurs) * 10) / 1000;
                return yScale(d);
            })
                    .style("fill", chart.colors[j]);


        }

    });
};





var chart = new wordsChart("#word-chart");
chart.loadData();