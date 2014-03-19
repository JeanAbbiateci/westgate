//"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files
	
d3.json("wordsDay.json", function(error, json) {
	if (error) return console.warn(error);
	data = json;
	//console.log(data.occurs);
});
	
d3.json("wordsDayTotal.json", function(error, json) {
	if (error) return console.warn(error);
	dataTotal = json;
	visualizeitTotal();
});

function visualizeitTotal(){
	
	
	parseDate = d3.time.format("%Y-%m-%d").parse;
	
	dataTotal.forEach(function(d) {
	
		d.date = parseDate(d.date);
		
		
        //d.occurs = +d.occurs;
    });
	
	
	checkClicked = [];
	data.forEach(function(d) {
		//console.log("lala" +d.occurs[0][1]);
		checkClicked.push(1);
	});
	
	var y_maxa=[];
	data.forEach(function(b,j) {
	
		y_maxa.push(d3.max(b.occurs, function(d,i) { return d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000; }));
		
	});
	console.log(y_maxa);
		
	
	
	barPadding = 10;
	padding = 50;
	axisPadding = 40;
	axisPaddingX = 45;
	monthsPadding = 27;
	
	margin = {top: 10, right: 10, bottom: 10, left: 10},
    w = 900 - margin.left - margin.right,
    h = 500 - margin.top - margin.bottom;
	
	color = d3.scale.category10();
	
	
	
	xScale = d3.time.scale().range([padding, w-padding]);
	xScale.domain(d3.extent(dataTotal, function(d) {return d.date; }));
	
	yScale = d3.scale.linear()
			.range([h - padding, padding]);
	yScale.domain([0, d3.max(y_maxa, function(d) { return d; })]);
	
	var xAxis = d3.svg.axis().scale(xScale)
    .orient("bottom").ticks(4);
	
	yAxis = d3.svg.axis()
		  .scale(yScale)
		  .orient("left")
		  .tickFormat(d3.format(".0%"))
		  .ticks(4);
		  
		  

	line = d3.svg.line();

		  
	svgContainer = d3.select("body").append("svg")
									.attr("width", w)
									.attr("height", h)
									.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		

		wlegend = 150;
		hlegend = 300;

svg2 = d3.select("body").append("svg")
									.attr("width", wlegend)
									.attr("height", 400);

 gridy = svgContainer.append("g")			
        .attr("class", "grid")
		.attr("transform", "translate(" + axisPadding + ",0)")
        .call(make_y_axis()
            .tickSize(-w, 0, 0)
            .tickFormat("")
        )									
									
									
dataTotal.forEach(function(b,j) {									

svgContainer.selectAll("rect.lines")
.data(dataTotal)
							.enter()
							.append("rect")
		
							.attr("x",  xScale(b.date)-1 )
							//return i * (w / theData.length);
							
							.attr("y", padding)
						.attr("width", 2)
						//.attr("width", w / theData.length - barPadding)
						.attr("height", h-padding-50)
						.attr("class", "lala")
						.style("opacity", 0)
						.attr("id", "verlines-" + j)
						
						
				
});
									
									
//dataTotal.forEach(function(b,j) {

svgContainer.selectAll("rect.linesholders")
							.data(dataTotal)
							.enter()
							.append("rect")
							.attr("x",  function(d,i) { return xScale(dataTotal[i].date)-80;})
							.attr("y", padding)
						.attr("width", 160)
						//.attr("width", w / theData.length - barPadding)
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
                .duration(200)      
                .style("opacity", 0); 
				
				div.transition()        
                .duration(200)      
                .style("opacity", 0); });	
				
				
				






				
				
				
				
colors = ["#DB3D3D", "#FCA43A", "#008DAA", "#91399E", "#9467bd", "#8c564b", "#e377c2", "#ff7f0e"];
g = 10;
data.forEach(function(b,j) {

		
		
		sData = b.occurs;
		
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
			
			
	circles = svgContainer.selectAll("dot")
        .data(sData)
    .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d, i) { return xScale(dataTotal[i].date); })
        .attr("cy", function(d,i) { 
			d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000;
		return yScale(d); })
		.attr("id", "circles-" + j)
		.style("fill","#000")
		.style("fill",colors[j]);
		
	
	
	 legend = svg2

							.append("rect")
							.attr("x",  10)
							.attr("y", j *(hlegend/data.length)+1)
						.attr("width", 10)
						//.attr("width", w / theData.length - barPadding)
						.attr("height", 10)
						.attr("id", "rect-" + j)
						.style("fill",colors[j])
						.style("stroke", colors[j])
						.attr("rx",2)
						.attr("ry",2)
						.style("stroke-width" ,2)
						.on("click", function() { // drect refers to the data bound to the rect
        onclickfunc(j);       // dbar.key will be either 'likes' or 'dislikes'
      });
						
						svg2
						.append("text")
						.attr("x",  30)
							//return i * (w / theData.length);
							
							.attr("y", j *(hlegend/data.length)+5)
							.attr("dy", ".35em")
							.text(b.word);
	});

		
		
		
		
		div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0)
	.attr("z-index",1000);
		
		div2 = d3.select("body").append("div")   
    .attr("class", "tooltipline")               
    .style("opacity", 0);

	
	
		
	axiss = svgContainer.append("g")
					.attr("class", "axis")  //Assign "axis" class
					.attr("transform", "translate(" + axisPadding + ",0)")
					.call(yAxis);
	
	
	axissX = svgContainer.append("g")
					.attr("class", "x axis")  //Assign "axis" class
					.attr("transform", "translate(0," + (h - axisPaddingX) + ")")
					.call(xAxis);
					
	
	svgContainer.append("text")                // text label for the x axis
        .attr("transform", "translate(" + (w / 2) + " ," + (h - margin.bottom) + ")")
        .style("text-anchor", "middle")
		.attr("font-family", "sans-serif")
					.attr("font-size", "14px")
					.attr("font-weight", "bold")
					.attr("fill", "#8A93A5")
        .text("Date");	
					
					
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
					
		//buildPie();
		
		//setView();
		
		
		// LEGEND
		
		
		
		
	

	}
	
	
	function buildTooltipData(d,i){
	
		
		head = "<table ><tr><td class='tableHead' colspan='3'>Day "+ (i+1) + ": <b>" + d.occurs +"</b></td></tr>";
		rest = "";
		data.forEach(function(b,j) {
			if (checkClicked[j] != 0)
				rest = rest + "<tr><td> <FONT size='4' COLOR='"+colors[j]+"'><b>- </b></FONT>"+b.word+"</td><td>"+b.occurs[i]+"</td></tr>"
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
function make_y_axis() {		
    return d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(4)
}
	
	
function onclickfunc(pos){
		
	//svgContainer.selectAll("path.grammes").remove();	
	//svgContainer.selectAll("circle").remove();		
	
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
    .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d, i) { return xScale(dataTotal[i].date); })
        .attr("cy", function(d,i) { 
			d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000;
		return yScale(d); })
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
	
	
	
	console.log(checkClicked);
	
	
	var y_max=[];
	data.forEach(function(b,j) {
		if (checkClicked[j] != 0){
			console.log("prits"+b.occurs);
			y_max.push(d3.max(b.occurs, function(d,i) { return d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000; }));
		}
	});
	console.log(y_max);
	//console.log(d3.max(y_max, function(d) { return d; }));
		yScale.domain([0, d3.max(y_max, function(d) { console.log(d);return d; })]);
	
	
	yAxis.scale(yScale);
		
		axiss
		.transition()
			.duration(750)
		.call(yAxis);
		
		gridy
		.transition()
			.duration(750)
			.call(make_y_axis()
            .tickSize(-w, 0, 0)
            .tickFormat(""));
		
	data.forEach(function(b,j) {	
		
		if (checkClicked[j] != 0){
			sData = b.occurs;
			
		
		//console.log(y_max);
			
		
	svgContainer.select("#lines-" + j)
	.transition()
			.duration(750)
			.attr("d",line(sData))
			.style("stroke",colors[j]);
			
			/*
			svgContainer.selectAll("circle")
		.data(sData)
		.transition()
        
			
			.attr("cy", function(d,i) { 
			d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000;
		return yScale(d); });*/
			
			
	svgContainer.selectAll("#circles-" + j)
	.data(sData)
	.transition()
			.duration(750)
        .attr("r", 3)
        .attr("cx", function(d, i) { return xScale(dataTotal[i].date); })
        .attr("cy", function(d,i) { 
			d = Math.round((d * 100/dataTotal[i].occurs) *10)/1000;
		return yScale(d); })
				.style("fill",colors[j]);	
		
				
				}
		
		});
		
		
		
	}
/*
function showAll(){

	flag = false;
	tooltip.
			text(setText());

	barsRest
	.on("mouseover", function(d, i) {      
            div.transition()        
                .duration(100)      
                .style("opacity", .9);      
            div .html("Total references of the attackers, <br/> day "+ (i+1) + ": <b>" + d.occurs +"</b>")  
                .style("visibility", "visible");    
            })
		.data(dataTotal)
		.transition()
		.duration(750)
		.attr("y", function(d) {
			return yScale(d.occurs);
		})
		//.attr("width", w / theData.length - barPadding)
		.attr("height", function(d) {
			return h - padding - yScale(d.occurs);
		})
		.style("fill","#3BB9FF");
		
		
		foreground.transition()
			.duration(750)
			.call(arcTween, myScale(totalRefs));
			
		occursWordText
						.transition()
						.duration(750)
						.text(totalRefs);
						
		occursWordTextRest
						.transition()
						.duration(750)
						.text("All others: " + (totalRefs-totalRefs));
}			


function setView(){

	flag = false;
	
	barsRest
		.transition()
		.duration(750)
		.attr("y", function(d) {
			return yScale(d.occurs);
		})
		.attr("height", function(d) {
			return h - padding - yScale(d.occurs);
		})
		.style("fill","#3BB9FF");
		
		
	foreground.transition()
			.duration(750)	
			.call(arcTween, myScale(totalRefs));


/*	
	var buttons = document.getElementsByTagName("button");
	var buttonsCount = buttons.length;
	for (var i = 0; i <= buttonsCount; i += 1) {
		buttons.innerHTML="prits";
	}
	
}
*/
function setButtons(){

}

function visualizeit(){
	console.log(data);
	}
	
