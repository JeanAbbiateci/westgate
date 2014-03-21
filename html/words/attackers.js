
// load everything from json
d3.json("wordsDay.json", function(error, json) {
	if (error) return console.warn(error);
	data = json;
});
	
d3.json("wordsDayTotal.json", function(error, json) {
	if (error) return console.warn(error);
	dataTotal = json;
	visualizeitTotal();
});


function visualizeitTotal(){
	
	// bring date to the correct format
	parseDate = d3.time.format("%Y-%m-%d").parse;
	dataTotal.forEach(function(d) {	
		d.date = parseDate(d.date);
	});
	
	
	checkClicked = [0,0,0,0,0,1,1,1,1,1,1,1,1];
	/*data.forEach(function(d) {
		checkClicked.push(1);
	});*/
	
	// transform data to percentage
	var y_maxa=[];
	data.forEach(function(b,j) {
		if (checkClicked[j] != 0){
			y_maxa.push(d3.max(b.occurs, function(d,i) { return d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000; }));
		}
	});

	
	barPadding = 10;
	padding = 50;
	axisPadding = 40;
	axisPaddingX = 45;
	monthsPadding = 27;
	
	margin = {top: 10, right: 10, bottom: 10, left: 10},
    w = 900 - margin.left - margin.right,
    h = 500 - margin.top - margin.bottom;
	
	// scalling
	xScale = d3.time.scale().range([padding, w-padding]);
	xScale.domain(d3.extent(dataTotal, function(d) {return d.date; }));
	
	yScale = d3.scale.linear()
			.range([h - padding, padding]);
	yScale.domain([0, d3.max(y_maxa, function(d) { return d; })]);
	
	// Axis
	xAxis = d3.svg.axis().scale(xScale)
    .orient("bottom").ticks(4);
	
	yAxis = d3.svg.axis()
		  .scale(yScale)
		  .orient("left")
		  .tickFormat(d3.format(".0%"))
		  .ticks(4);
		  
		  
	line = d3.svg.line();
	
	// svg container for linechart
	svgContainer = d3.select("body").append("svg")
									.attr("width", w)
									.attr("height", h)
									.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		

	// svg container for legend
	wlegend = 250;
	hlegend = 350;

	svg2 = d3.select("body").append("svg")
								.attr("width", wlegend)
								.attr("height", 420);

	// setting the grid for y axis
	gridy = svgContainer.append("g")			
						.attr("class", "grid")
						.attr("transform", "translate(" + axisPadding + ",0)")
						.call(make_y_axis()
							.tickSize(-w, 0, 0)
							.tickFormat("")
						)									
									
	// create the vertical lines
	dataTotal.forEach(function(b,j) {									

		svgContainer.selectAll("rect.lines")
						.data(dataTotal)
						.enter()
						.append("rect")
						.attr("x",  xScale(b.date)-1 )
						.attr("y", padding)
						.attr("width", 2)
						.attr("height", h-padding-50)
						.attr("class", "lala")
						.style("opacity", 0)
						.attr("id", "verlines-" + j)
	});
									
	
	// line "holder" for the mouse over event
	svgContainer.selectAll("rect.linesholders")
							.data(dataTotal)
							.enter()
							.append("rect")
							.attr("x",  function(d,i) { return xScale(dataTotal[i].date)-80;})
							.attr("y", padding)
							.attr("width", 160)
							.attr("height", h-padding-50)
							.attr("class", "linesholders")
							.style("fill", "#000")
							.style("opacity", 0)
							.on("mouseover",function(d, i) {      
								svgContainer.select("#verlines-" + i).transition()        
																	.duration(100)      
																	.style("opacity", .4)
																	.style("visibility", "visible");    
				
								div.transition()        
									.duration(100)      
									.style("opacity", .9);      
								
								div .html( buildTooltipData(d,i))  
										.style("visibility", "visible");    
							})                
				
				
						.on("mousemove", function(){return div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
				
				.on("mouseout", function(d,i) {       
            svgContainer.select("#verlines-" + i).transition()        
                .duration(120)      
                .style("opacity", 0); 
				
				div.transition()        
                .duration(120)      
                .style("opacity", 0); });	
				
				

	// labels
	labels = ["al-Shabaab", "Terrorists", "Gunmen", "Thugs", "Militants", "Criminals", "Gangsters", "Robbers", "Jihadists", "Murderers", "Extremists", "Islamists", "Enemies"];			
	// colors				
	colors = ["#DB3D3D", "#FCA43A", "#008DAA", "#91399E", "#9467bd", "#8c564b", "#e377c2", "#ff7f0e","#98df8a", "#b34228", "#ff9896", "#17becf", "#c5b0d5"];

	// build lines, dots, and legend
	data.forEach(function(b,j) {

		// legend rectangles 
		svg2.append("rect")
				.attr("x",  40)
				.attr("y", j *(hlegend/data.length)+5)
				.attr("width", 10)
				.attr("height", 10)
				.attr("id", "rect-" + j)
				.style("fill","#fff")
				.style("stroke", colors[j])
				.attr("rx",2)
				.attr("ry",2)
				.style("stroke-width" ,2)
				.on("click", function() { onclickfunc(j); });
		
		// legend labels
		svg2.append("text")
				.attr("x",  60)
				.attr("y", j *(hlegend/data.length)+10)
				.attr("dy", ".35em")
				.text(labels[j])
				.on("mouseover", function() {hideLinesFunc(j)})
				.on("mouseout", function() {showLinesFunc(j)});
	
		// if on checkClicked list then take occurances of of word
		if (checkClicked[j] != 0){
			// take occurances of each word for all days
			sData = b.occurs;
			
			// lines
			line
				.x(function(d, i) { 
					return xScale(dataTotal[i].date); })
				.y(function(d,i) { 
					d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000;
					return yScale(d); });			
						
			svgContainer.append("path")
							.attr("class", "grammes") 
							.attr("d",line(sData))
							.attr("id", "lines-" + j)
							.style("stroke",colors[j]);

			// circles to the lines	
			circles = svgContainer.selectAll("dot")
									.data(sData)
									.enter()
									.append("circle")
									.attr("r", 3)
									.attr("cx", function(d, i) { return xScale(dataTotal[i].date); })
									.attr("cy", function(d,i) { 
													d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000;
													return yScale(d); 
												})
									.attr("id", "circles-" + j)
									.style("fill","#000")
									.style("fill",colors[j]);
				
				
			svg2.select("#rect-" + j).style("fill",colors[j]);	
		}
		
	});

	// tooltip div
	div = d3.select("body").append("div")   
							.attr("class", "tooltip")               
							.style("opacity", 0)
							.attr("z-index",1000);
	// axis
	axiss = svgContainer.append("g")
							.attr("class", "axis")  
							.attr("transform", "translate(" + axisPadding + ",0)")
							.call(yAxis);
	
	
	axissX = svgContainer.append("g")
					.attr("class", "x axis")  
					.attr("transform", "translate(0," + (h - axisPaddingX) + ")")
					.call(xAxis);
					
	// text label for x axis
	svgContainer.append("text")                
        .attr("transform", "translate(" + (w / 2) + " ," + (h - margin.bottom) + ")")
        .style("text-anchor", "middle")
		.attr("font-family", "sans-serif")
					.attr("font-size", "14px")
					.attr("font-weight", "bold")
					.attr("fill", "#8A93A5")
        .text("Date");	
					
	// text label for y axis				
	svgContainer.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", (0 - margin.left))
					.attr("x",0 - (h / 2))
					.attr("dy", "1em")
					.style("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("font-size", "14px")
					.attr("font-weight", "bold")
					.attr("fill", "#8A93A5")
					.text("Frequency");


}

// hide lines and dots on mouseover	
function hideLinesFunc(pos){
	data.forEach(function(b,j) {
		if ((pos != j) && (checkClicked[pos] != 0)){
			svgContainer.select("#lines-" + j)
						.transition()
							.duration(250)
							.style("opacity", .1);
			
			svgContainer.selectAll("#circles-" + j)
							.transition()
								.duration(250)
								.style("opacity", .1);	
		
		}
	});
}
	
// show lines and dots on mouseout	
function showLinesFunc(pos){
	data.forEach(function(b,j) {
		if (pos != j){
			svgContainer.select("#lines-" + j)
							.transition()
								.duration(250)
								.style("opacity", 1);
			
			svgContainer.selectAll("#circles-" + j)
							.transition()
								.duration(250)
								.style("opacity", 1);	
		
		}
	});
}

// build tooltip
function buildTooltipData(d,i){
	
	// take a list of all words and their occurances for day i
	dayView = [];
	data.forEach(function(b,j) {
		if (checkClicked[j] != 0)
			dayView.push([colors[j],labels[j], b.occurs[i]]);
	});
	
	// sort the list
	sortedDayView = dayView.sort(function(a,b){ return b[2]-a[2];});
	
	// build the html code
	head = "<table ><tr><td class='tableHead' colspan='3'><b>Day "+ (i+1) + ".</b> Total: " + d.occurs +"</td></tr>";
	rest = "";
	sortedDayView.forEach(function(b,j) {
		rest = rest + "<tr><td> <FONT size='4' COLOR='"+b[0]+"'><b>- </b></FONT>"+b[1]+"</td><td>"+b[2]+"</td></tr>"
	});
	
	return head+rest+"</table>"
	
}
	
/*	
function make_x_axis() {		
    return d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5)
}
*/

// make grid for y axis
function make_y_axis() {		
    return d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(4)
}
	
// legend-rechtangles on click 	
function onclickfunc(pos){
	
	// remove or add the word in this pos to the list
	if (checkClicked[pos] == 0){
		checkClicked[pos] = 1;
		
		// rebuild the line
		svgContainer.append("path")
			.attr("class", "grammes") 
			.attr("d",line(sData))
			.attr("id", "lines-" + pos)
			.style("stroke",colors[pos]);
		
		// rebuild circles
		svgContainer.selectAll("dot")
			.data(sData)
			.enter()
			.append("circle")
			.attr("r", 3)
			.attr("cx", function(d, i) { return xScale(dataTotal[i].date); })
			.attr("cy", function(d,i) { 
							d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000;
							return yScale(d); 
						})
			.attr("id", "circles-" + pos)
			.style("fill",colors[pos]);	
		
		// rebuild rect
		svg2.select("#rect-" + pos).style("fill",colors[pos]);
	}
	else {
		checkClicked[pos] = 0;
		// remove line
		svgContainer.select("#lines-" + pos).remove();
		// remove circles
		svgContainer.selectAll("#circles-" + pos).remove();
		// remove rect
		svg2.select("#rect-" + pos).style("fill","#fff");
	}
	
	// re-calculate max value for y axis
	var y_max=[];
	data.forEach(function(b,j) {
		if (checkClicked[j] != 0){
			y_max.push(d3.max(b.occurs, function(d,i) { return d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000; }));
		}
	});
	
	// update scale for y axis
	yScale.domain([0, d3.max(y_max, function(d) { return d; })]);
	
	yAxis.scale(yScale);
		
	axiss.transition()
			.duration(750)
			.call(yAxis);
	
	// update y grid
	gridy.transition()
			.duration(750)
			.call(make_y_axis()
            .tickSize(-w, 0, 0)
            .tickFormat(""));
		
	// update lines 
	data.forEach(function(b,j) {	
		
		// if still on checkClicked list then take occurances of of word
		if (checkClicked[j] != 0){
			sData = b.occurs;
		
			// transition for lines and circles
			svgContainer.select("#lines-" + j)
						.transition()
							.duration(750)
							.attr("d",line(sData))
							.style("stroke",colors[j]);
				
				
			svgContainer.selectAll("#circles-" + j)
						.data(sData)
						.transition()
							.duration(750)
							.attr("r", 3)
							.attr("cx", function(d, i) { return xScale(dataTotal[i].date); })
							.attr("cy", function(d,i) { 
											d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000;
											return yScale(d); 
										})
							.style("fill",colors[j]);	
		
				
		}
		
	});
}
