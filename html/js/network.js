function network(){

  var treshold = 10

  var height = 650,
    width =  Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  var sqrtScale = d3.scale.pow().exponent(.05)
    .range([5,40])
    .domain([627,33135]);

  var logScale = d3.scale.log()
    .range([1,10])
    .domain([treshold,266]);

  var chargeScale = d3.scale
    .linear()
    .range([-100,-125])
    .domain([627,33135]);

  var linkramp = d3.scale.sqrt()
    .domain([627 + 627 ,33135 + 33135])
    .range([50,100])
    .clamp(true);

  var force = d3.layout.force()
    .charge(function(d){return chargeScale(d.value)})
    .linkDistance(function(d) { return linkramp(d.source.value + d.target.value )})
    .size([width, height])

  var svg = d3.select("#network").append("svg")
      .attr("width", width)
      .attr("height", height);
      
  function showTooltip(data) {
    var content;
    content = "User: " + data.name + "<br/>";
    content += "Amount of mentions/retweets: " + data.value;
    var y = d3.event.pageY;
    var x = d3.event.pageX;
    var tooltip = d3.select('.tooltip').style("left", (x - 50) + "px").style("top", (y - 160) + "px").html("<p>" + content + "</p>").style("opacity", 0);
    tooltip = tooltip.style("top", (y-$(".tooltip").outerHeight()-15)+"px").style("display", "block");
    tooltip.transition().duration(1000).style("opacity",1);
  }

  function hideTooltip(d) {
    tooldiv.style("opacity", 0).style("display", "none")
  }

   function showLinkTooltip(data) {
    var content;
    content = data.source.name + ' & ' + data.target.name + " mentioned each other " + data.value + " times";
    var y = d3.event.pageY;
    var x = d3.event.pageX;
    var tooltip = d3.select('.tooltip').style("left", (x - 50) + "px").style("top", (y - 160) + "px").html("<p>" + content + "</p>").style("opacity", 0);
    tooltip = tooltip.style("top", (y-$(".tooltip").outerHeight()-15)+"px").style("display", "block");
    tooltip.transition().duration(1000).style("opacity",1);
  }

  function hideLinkTooltip(d) {
    d3.select(".tooltip").transition().duration(1000).style("opacity",0).style("display", "none");
  }

  function drawNetwork(graph){
    links = graph.links.slice()
    for(var i = links.length - 1; i >= 0; i--) {
      if(links[i].value < treshold) {
        links.splice(i, 1);
      }
    }

    force
      .nodes(graph.nodes.slice())
      .links(links)
      .start();

    var linkGroup = svg.append('g').attr('class','linkGroup')
    var link = linkGroup.selectAll(".link")
      .data(links)
      .enter().append("line")
      .attr("class","link")
      .attr("stroke","#343A45")
      .attr("stroke-width", function(d){return logScale(d.value)})
      .on("mouseover", function(d) {
        return showLinkTooltip(d);
      }).on("mouseout", function(d) {
        return hideLinkTooltip(d);
      });

    var nodeGroup = svg.append('g').attr('class','nodeGroup')
    var g = nodeGroup.selectAll(".group")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "group")
      .on("mouseover", function(d) {
        return showTooltip(d);
      }).on("mouseout", function(d) {
        return hideTooltip(d);
      });

    var node = g.append("circle") 
      .attr("class", "bubble")
      .attr("r", function(d) {return sqrtScale(d.value)})
      .attr("class",function(d) {
        for(e in authors){
          a = authors[e]
          if(a.name == d.name){
            if(a.verified){
              return 'bubble verified'
            }
          }
        }
        return 'bubble'
      })
      .call(force.drag);

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

    });
  }


  var request = new XMLHttpRequest();
  request.open("GET", "data/userProfiles.json", false);
  request.send(null)
  var authors = JSON.parse(request.responseText);

  var request = new XMLHttpRequest();
  request.open("GET", "data/final_mentions.json", false);
  request.send(null)
  this.ORIGINAL_DATA = JSON.parse(request.responseText);
  var i = 1
  drawNetwork(this.ORIGINAL_DATA)

  return this
}

window.onload = function(){
  n = network()
  updateNetwork = n.updateNetwork
}
