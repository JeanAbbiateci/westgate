var width = 1000,
    height = 680;

var color = d3.scale.category20();

var linkramp=d3.scale.linear().domain([0,3000]).range([100,50]).clamp(true);

var force = d3.layout.force()
    .charge(function(d) {return 3*-Math.sqrt(d.amount)})
    .linkDistance(function (d) {return linkramp(d.source.amount + d.target.amount)})
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
		
function mouseover() {
  text = d3.select(this).select('.nodetext')
  text.transition()
      .duration(750)
      .style("opacity", 1);
}

function mouseout() {
  text = d3.select(this).select('.nodetext')
  text.transition()
      .duration(750)
      .style("opacity", 0);
}

d3.json("mentions_top100.json", function(Error, graph) {
	graph = graph['1']
	
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  var g = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
		

			
  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return 2});
	
	
	var node = g.append("circle")	
      .attr("class", "node")
      .attr("r", function(d) { return 1/8*Math.sqrt(d.amount)})
			.style("fill",function() {
			    return "hsl(" + Math.random() * 360 + ",25%,50%)";
			    })
      .call(force.drag);

	var text = g.append("text")
      .attr("class", "nodetext")
      .text(function(d) { return d.name })
      .style("opacity",0)


  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    text.attr("x", function(d){return d.x})
        .attr("y", function(d){return d.y})
  });
});
