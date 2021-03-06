(function(pageHeight) {

    var height = window.innerHeight, width = window.innerWidth;
    var bodySelection = d3.select("#page-intro .container");
    var svgHeight = 400;
    var svgWidth = 975;
    var svg = bodySelection.append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);




    function loadData() {
        d3.json("data/updated_massmedianewsfeed.json", function(error, json) {
            if (error)
                return console.warn(error);
            data = json;
            visualizeit();
        });
    }

    function visualizeit() {

        var hoursData = [];
        for(var j=0;j<2;j++)
            for (var i = 0; i < 12; i++) {
                hoursData.push(i);
            }

        var dayNameBarWidth = 100,
                barWidth = (svgWidth - dayNameBarWidth) / 24;
        var xAxis = d3.scale.linear()
                .range([0, barWidth]);
        var y = d3.scale.ordinal().rangeRoundBands([0, 300]);
        var yAxis = d3.svg.axis().scale(y).orient("left");
        y.domain(data.map(function(d) {
            return findDay(d);
        }));
        // tooltip div
        tooltip = d3.select(".tooltip");


        svg.selectAll("rect")
                .data(hoursData)
                .enter()
                .append("rect")
                .attr("class", function(d, i) {
            if (i % 2 === 0) {
                return "hour hour-light";
            } else {
                return "hour hour-dark";
            }
        })
                .attr("x", function(d, i) {
            return xAxis(i) + dayNameBarWidth;
        })
                .attr("y", function(d) {
            return -36;
        })
                .attr("width", function(d, i) {
            return barWidth;
        })
                .attr("height", svgHeight - 70);

        // months grid labels
        svg.selectAll(".lbls")
                .data(hoursData)
                .enter()
                .append("text")
                .attr("class", "hourLabel")
                .attr("x", function(d, i) {
            return xAxis(i) + dayNameBarWidth;
        })
                .attr("y", 0)
                .attr("dx", function(d, i) {
            return barWidth / 2;
        })
                .attr("dy", 17)
                .attr("text-anchor", "middle")
                .text(function(d, i) {
            return d;
        });



        function make_y_axis() {
            return d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(5);
        }

        svg.append("g")
                .attr("class", "grid").attr("transform", "translate(" + dayNameBarWidth + ", 0)")
                .call(make_y_axis()
                .tickSize(-(svgWidth - dayNameBarWidth), 0, 0)
                .tickFormat("")

                );

        // y-axis grid
        svg.append("g")
                .attr("class", "y axis")

                .attr("transform", "translate(" + (dayNameBarWidth - 40) + ",0)")
                .call(yAxis);
        d3.selectAll('.y text')
                .style('text-anchor', "middle");


        circles = svg.selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("r", 0)
                .attr("cx", function(d) {
            if (d[0] instanceof Array)
                time = d[0][0];
            else
                time = d[0];

            return xAxis((time + 12) % 24) + dayNameBarWidth + 22;
        })
                .attr("cy", function(d, i) {
            sday = findDay(d);
            return y(sday) + 38;
        })
                .style("fill", "#db3d3c")
                .on("mouseover", function(d, i) {

				
				d3.select(this)
					.transition()
					.duration(220)
					.style("fill","#af3130");
				
            var y = d3.event.pageY;
			
            tooltip = tooltip.style("left", (d3.event.pageX + 20) + "px").style("top", (y - 160) + "px").html(buildTooltipData(d, i)).style("opacity", 0).style("bottom", null);
            tooltip = tooltip.style("top", (y-$(".tooltip").outerHeight()-15)+"px").style("display", "block").style("opacity",1);
        })
		.on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })

                .on("mouseout", function(d, i) {
				
				d3.select(this)
					.transition()
					.duration(220)
					.style("fill","#db3d3c");
				
            tooltip.style("opacity", 0).style("display","none");
        });




        showCirclesAnimation();
    }



    function findDay(d) {
        day = "";
        if (d[0] instanceof Array) {
            day = d[0][1];
        }
        else {
            day = d[1];
        }

        if (day.substring(day.length -5, day.length - 3) == "21") {
            sday = "Sat 21 ";
        }
        else if (day.substring(day.length -5, day.length - 3) == "22") {
            sday = "Sun 22";
        }
        else if (day.substring(day.length -5, day.length - 3) == "23") {
            sday = "Mon 23";
        }
        else if (day.substring(day.length -5, day.length - 3) == "24") {
            sday = "Tue 24";
        }
        else {
            sday = "Wed 25";
        }
        return sday;
    }

    function buildTooltipData(d, i) {
        var hour = "";
        var text = [];
        if (d[0] instanceof Array) {
            for (var i = 0; i < d.length; i++){
                hour = d[i][1].split(",");
                text = text + "<p>" + hour[0] + " - <strong>" + d[i][2] + "</strong></br><small>" +d[i][3]+ "</small><br />" + d[i][4] + "</br" + d[i][3] + "</p>";
            }
        }
        else{
            hour = d[1].split(",");
            text = "<p>" + hour[0] + " - <strong>" + d[2] + "</strong></br><small>" +d[3]+ "</small></br>" + d[4] + "</br" + d[3] + "</p>";
        }
        return text;
    }

    function showCirclesAnimation() {
        circles.transition()
                .duration(720)
                .attr("r", 10);
    }

    loadData();

}(pageHeight));

