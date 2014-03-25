function network(){
  var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    width =  Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  var sqrtScale = d3.scale.pow()
    .range([1,20])

  var logScale = d3.scale.log()
    .range([1,1])

  var linkramp = d3.scale.sqrt()
    .domain([0,100])
    .range([10,40])
    .clamp(true)

  var force = d3.layout.force()
    .charge(-150)
    .linkDistance(function(d) { return linkramp(d.source.value + d.target.value )})
    .size([width, height])

  var svg = d3.select("#network").append("svg")
      .attr("width", width)
      .attr("height", height);
      
  function showTooltip(data,i) {
    var content;
    content = "User: " + data.name + "<br/>";
    content += "Amount of retweets: " + data.value;
    d3.select('.newstip').style("left", (d3.event.pageX - 50) + "px").style("top", (d3.event.pageY - 160) + "px").html("<p>" + content + "</p>").transition().duration(1000).style("display", "block").style("opacity",1);
  }

  function hideTooltip(d,i) {
    d3.select(".newstip").transition().duration(1000).style("opacity",0).style("display", "none");
  }

  function drawNetwork(graph){
    links = graph.links.slice()

    force
      .nodes(graph.nodes.slice())
      .links(links)
      .start();

    maxNodes = 0
    minNodes = 100000
    graph.nodes.forEach(function(n){
      if(n.value > maxNodes){
        maxNodes = n.value
      }
      if(n.value < minNodes){
        minNodes = n.value
      }
    })

    maxLinks = 0
    minLinks = 100000
    links.forEach(function(l){
      if(l.value > maxLinks){
        maxLinks = l.value
      }
      if(l.value < minNodes && l.value > 0){
        minNodes = l.value
      }
    })

    sqrtScale.domain([minNodes,maxNodes])
    logScale.domain([minLinks,maxLinks])

    var linkGroup = svg.append('g').attr('class','linkGroup')
    var link = linkGroup.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class","link")
      .attr("stroke","#343A45")
      .attr("stroke-width", function(d){return logScale(d.value)})

    var nodeGroup = svg.append('g').attr('class','nodeGroup')
    var g = nodeGroup.selectAll(".group")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "group")
      .on("mouseover", function(d, i) {
        return showTooltip(d, i);
      }).on("mouseout", function(d, i) {
        return hideTooltip(d, i);
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

    this.latestI = i
  }

  this.updateNetwork = function(hour){
    i = Math.floor(hour/24) + 1
    if(i == latestI){return};

    newGraph = {'nodes' : ORIGINAL_DATA[i].nodes.slice(), 'links' : ORIGINAL_DATA[i].links.slice()}

    var maxNodes = 0
    var minNodes = 100000
    newGraph.nodes.forEach(function(n){
      if(n.value > maxNodes){
        maxNodes = n.value
      }
      if(n.value < minNodes){
        minNodes = n.value
      }
    })

    maxLinks = 0
    minLinks = 100000
    newGraph.links.forEach(function(l){
      if(l.value > maxLinks){
        maxLinks = l.value
      }
      if(l.value < minNodes){
        minNodes = l.value
      }
    })

    sqrtScale.domain([minNodes,maxNodes])
    logScale.domain([minLinks,maxLinks])
    var link = svg.select('.linkGroup').selectAll(".link")
      .data(newGraph.links)
    
    link.enter().append("line")
      .attr("class","link")
      .attr("stroke","#343A45")
      .attr("stroke-width", function(d){return logScale(d.value)})

    link.exit().remove()

    var nodes = svg.select('.nodeGroup').selectAll('.bubble')
    nodes.data().map(function(d){
      d.value = newGraph.nodes[d.index].value
    });
    nodes.attr("r", function(d) {return sqrtScale(d.value)})
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

    force.links(newGraph.links).nodes(nodes.data()).start()

    force.on("tick", function() {
      
      link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      nodes.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    });
    this.latestI = i
  }


  var request = new XMLHttpRequest();
  request.open("GET", "data/userProfiles.json", false);
  request.send(null)
  var authors = JSON.parse(request.responseText);

  var request = new XMLHttpRequest();
  request.open("GET", "data/new_mentions_top100.json", false);
  request.send(null)
  this.ORIGINAL_DATA = JSON.parse(request.responseText);
  var i = 1
  drawNetwork(this.ORIGINAL_DATA[i])

  return this
}

window.onload = function(){
  n = network()
  updateNetwork = n.updateNetwork
}
