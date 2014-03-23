(function(pageHeight) {

    var height = window.innerHeight, width = window.innerWidth;
    var bodySelection = d3.select("#page-intro .container");
    var svgHeight = 500;
    var svgWidth = 1140;
    var svg = bodySelection.append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

    var data = [
        ["Saturday", "12:31", "title", "text"],
        ["Saturday", "12:31", "title", "text"],
        ["Sunday", "12:31", "title", "text"],
        ["Monday", "12:31", "title", "text"],
        ["Wednsday", "13:31", "title", "text"],
        ["Wednsday", "16:31", "title", "text"]
    ];

    var hoursData = [];
    for (var i = 0; i < 24; i++) {
        hoursData.push(i);
    }

    var dayNameBarWidth = 100,
            barWidth = (svgWidth - dayNameBarWidth) / 24;
    var xAxis = d3.scale.linear()
            .range([0, barWidth]);
    var y = d3.scale.ordinal().rangeRoundBands([0, 400]);
    var yAxis = d3.svg.axis().scale(y).orient("left");
    y.domain(data.map(function(d) {
        return d[0];
    }));


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


}(pageHeight));

