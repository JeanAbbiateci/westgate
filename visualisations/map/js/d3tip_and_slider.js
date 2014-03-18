// d3.tip
// Copyright (c) 2013 Justin Palmer
//
// Tooltips for d3.js SVG visualizations

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module with d3 as a dependency.
    define(['d3'], factory)
  } else {
    // Browser global.
    root.d3.tip = factory(root.d3)
  }
}(this, function (d3) {

  // Public - contructs a new tooltip
  //
  // Returns a tip
  return function() {
    var direction = d3_tip_direction,
        offset    = d3_tip_offset,
        html      = d3_tip_html,
        node      = initNode(),
        svg       = null,
        point     = null,
        target    = null
  
    function tip(vis) {
      svg = getSVGNode(vis)
      point = svg.createSVGPoint()
      document.body.appendChild(node)
    }
  
    // Public - show the tooltip on the screen
    //
    // Returns a tip
    tip.show = function() {
      var args = Array.prototype.slice.call(arguments)
      if(args[args.length - 1] instanceof SVGElement) target = args.pop()
  
      var content = html.apply(this, args),
          poffset = offset.apply(this, args),
          dir     = direction.apply(this, args),
          nodel   = d3.select(node),
          i       = directions.length,
          coords
  
      nodel.html(content)
        .style({ opacity: 1, 'pointer-events': 'all' })
  
      while(i--) nodel.classed(directions[i], false)
      coords = direction_callbacks.get(dir).apply(this)
      nodel.classed(dir, true).style({
        top: (coords.top +  poffset[0]) + 'px',
        left: (coords.left + poffset[1]) + 'px'
      })
  
      return tip
    }
  
    // Public - hide the tooltip
    //
    // Returns a tip
    tip.hide = function() {
      nodel = d3.select(node)
      nodel.style({ opacity: 0, 'pointer-events': 'none' })
      return tip
    }
  
    // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
    //
    // n - name of the attribute
    // v - value of the attribute
    //
    // Returns tip or attribute value
    tip.attr = function(n, v) {
      if (arguments.length < 2 && typeof n === 'string') {
        return d3.select(node).attr(n)
      } else {
        var args =  Array.prototype.slice.call(arguments)
        d3.selection.prototype.attr.apply(d3.select(node), args)
      }
  
      return tip
    }
  
    // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
    //
    // n - name of the property
    // v - value of the property
    //
    // Returns tip or style property value
    tip.style = function(n, v) {
      if (arguments.length < 2 && typeof n === 'string') {
        return d3.select(node).style(n)
      } else {
        var args =  Array.prototype.slice.call(arguments)
        d3.selection.prototype.style.apply(d3.select(node), args)
      }
  
      return tip
    }
  
    // Public: Set or get the direction of the tooltip
    //
    // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
    //     sw(southwest), ne(northeast) or se(southeast)
    //
    // Returns tip or direction
    tip.direction = function(v) {
      if (!arguments.length) return direction
      direction = v == null ? v : d3.functor(v)
  
      return tip
    }
  
    // Public: Sets or gets the offset of the tip
    //
    // v - Array of [x, y] offset
    //
    // Returns offset or
    tip.offset = function(v) {
      if (!arguments.length) return offset
      offset = v == null ? v : d3.functor(v)
  
      return tip
    }
  
    // Public: sets or gets the html value of the tooltip
    //
    // v - String value of the tip
    //
    // Returns html value or tip
    tip.html = function(v) {
      if (!arguments.length) return html
      html = v == null ? v : d3.functor(v)
  
      return tip
    }
  
    function d3_tip_direction() { return 'n' }
    function d3_tip_offset() { return [0, 0] }
    function d3_tip_html() { return ' ' }
  
    var direction_callbacks = d3.map({
      n:  direction_n,
      s:  direction_s,
      e:  direction_e,
      w:  direction_w,
      nw: direction_nw,
      ne: direction_ne,
      sw: direction_sw,
      se: direction_se
    }),
  
    directions = direction_callbacks.keys()
  
    function direction_n() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.n.y - node.offsetHeight,
        left: bbox.n.x - node.offsetWidth / 2
      }
    }
  
    function direction_s() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.s.y,
        left: bbox.s.x - node.offsetWidth / 2
      }
    }
  
    function direction_e() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.e.y - node.offsetHeight / 2,
        left: bbox.e.x
      }
    }
  
    function direction_w() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.w.y - node.offsetHeight / 2,
        left: bbox.w.x - node.offsetWidth
      }
    }
  
    function direction_nw() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.nw.y - node.offsetHeight,
        left: bbox.nw.x - node.offsetWidth
      }
    }
  
    function direction_ne() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.ne.y - node.offsetHeight,
        left: bbox.ne.x
      }
    }
  
    function direction_sw() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.sw.y,
        left: bbox.sw.x - node.offsetWidth
      }
    }
  
    function direction_se() {
      var bbox = getScreenBBox()
      return {
        top:  bbox.se.y,
        left: bbox.e.x
      }
    }
  
    function initNode() {
      var node = d3.select(document.createElement('div'))
      node.style({
        position: 'absolute',
        top: 0,
        opacity: 0,
        'pointer-events': 'none',
        'box-sizing': 'border-box'
      })
  
      return node.node()
    }
  
    function getSVGNode(el) {
      el = el.node()
      if(el.tagName.toLowerCase() == 'svg')
        return el
  
      return el.ownerSVGElement
    }
  
    // Private - gets the screen coordinates of a shape
    //
    // Given a shape on the screen, will return an SVGPoint for the directions
    // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
    // sw(southwest).
    //
    //    +-+-+
    //    |   |
    //    +   +
    //    |   |
    //    +-+-+
    //
    // Returns an Object {n, s, e, w, nw, sw, ne, se}
    function getScreenBBox() {
      var targetel   = target || d3.event.target,
          bbox       = {},
          matrix     = targetel.getScreenCTM(),
          tbbox      = targetel.getBBox(),
          width      = tbbox.width,
          height     = tbbox.height,
          x          = tbbox.x,
          y          = tbbox.y,
          scrollEl   = document.documentElement? document.documentElement : document.body,
          scrollTop  = scrollEl.scrollTop,
          scrollLeft = scrollEl.scrollLeft
  
  
      point.x = x + scrollLeft
      point.y = y + scrollTop
      bbox.nw = point.matrixTransform(matrix)
      point.x += width
      bbox.ne = point.matrixTransform(matrix)
      point.y += height
      bbox.se = point.matrixTransform(matrix)
      point.x -= width
      bbox.sw = point.matrixTransform(matrix)
      point.y -= height / 2
      bbox.w  = point.matrixTransform(matrix)
      point.x += width
      bbox.e = point.matrixTransform(matrix)
      point.x -= width / 2
      point.y -= height / 2
      bbox.n = point.matrixTransform(matrix)
      point.y += height
      bbox.s = point.matrixTransform(matrix)
  
      return bbox
    }
  
    return tip
  };

}));




/*
    D3.js Slider
    Inspired by jQuery UI Slider
    Copyright (c) 2013, Bjorn Sandvik - http://blog.thematicmapping.org
    BSD license: http://opensource.org/licenses/BSD-3-Clause
*/

d3.slider = function module() {
  "use strict";

  // Public variables width default settings
  var min = 0,
      max = 100,
      step = 1, 
      animate = true,
      orientation = "horizontal",
      axis = false,
      margin = 50,
      value,
      div,
      scale; 

  // Private variables
  var axisScale,
      dispatch = d3.dispatch("slide"),
      formatPercent = d3.format(".2%"),
      tickFormat = d3.format(".0"),
      sliderLength;

  function slider(selection) {
    selection.each(function() {

      // Create scale if not defined by user
      if (!scale) {
        scale = d3.scale.linear().domain([min, max]);
      }  

      // Start value
      value = value || scale.domain()[0]; 

      // DIV container
      div = d3.select(this).classed("d3-slider d3-slider-" + orientation, true);

      var drag = d3.behavior.drag();

      // Slider handle
      var handle = div.append("a")
          .classed("d3-slider-handle", true)
          .attr("xlink:href", "#")
          .on("click", stopPropagation)
          .call(drag);

      // Horizontal slider
      if (orientation === "horizontal") {

        div.on("click", onClickHorizontal);
        drag.on("drag", onDragHorizontal);
        handle.style("left", formatPercent(scale(value)));
        sliderLength = parseInt(div.style("width"), 10);

      } else { // Vertical

        div.on("click", onClickVertical);
        drag.on("drag", onDragVertical);
        handle.style("bottom", formatPercent(scale(value)));
        sliderLength = parseInt(div.style("height"), 10);

      }
      
      if (axis) {
        createAxis(div);
      }


      function createAxis(dom) {

        // Create axis if not defined by user
        if (typeof axis === "boolean") {

          axis = d3.svg.axis()
              .ticks(Math.round(sliderLength / 100))
              .tickFormat(tickFormat)
              .orient((orientation === "horizontal") ? "bottom" :  "right");

        }      

        // Copy slider scale to move from percentages to pixels
        axisScale = scale.copy().range([0, sliderLength]);
          axis.scale(axisScale);

          // Create SVG axis container
        var svg = dom.append("svg")
            .classed("d3-slider-axis d3-slider-axis-" + axis.orient(), true)
            .on("click", stopPropagation);

        var g = svg.append("g");

        // Horizontal axis
        if (orientation === "horizontal") {

          svg.style("left", -margin);

          svg.attr({ 
            width: sliderLength + margin * 2, 
            height: margin
          });  

          if (axis.orient() === "top") {
            svg.style("top", -margin);  
            g.attr("transform", "translate(" + margin + "," + margin + ")")
          } else { // bottom
            g.attr("transform", "translate(" + margin + ",0)")
          }

        } else { // Vertical

          svg.style("top", -margin);

          svg.attr({ 
            width: margin, 
            height: sliderLength + margin * 2
          });      

          if (axis.orient() === "left") {
            svg.style("left", -margin);
            g.attr("transform", "translate(" + margin + "," + margin + ")")  
          } else { // right          
            g.attr("transform", "translate(" + 0 + "," + margin + ")")      
          }

        }

        g.call(axis);  

      }


      // Move slider handle on click/drag
      function moveHandle(pos, val) {
        var newValue;
        
        if(typeof val != "undefined")
            newValue = val;
        else
            newValue = stepValue(scale.invert(pos / sliderLength));

        if (value !== newValue) {
          var oldPos = formatPercent(scale(stepValue(value))),
              newPos = formatPercent(scale(stepValue(newValue))),
              position = (orientation === "horizontal") ? "left" : "bottom";
          if (d3.event != null)
          {
            dispatch.slide(d3.event.sourceEvent || d3.event, value = newValue);
          }
          else 
          {
            dispatch.slide(null, value = newValue)
          }

          if (animate) { 
            handle.transition()
                .styleTween(position, function() { return d3.interpolate(oldPos, newPos); })
                .duration((typeof animate === "number") ? animate : 100);
          } else {
            handle.style(position, newPos);          
          }
        }

      }


      // Calculate nearest step value
      function stepValue(val) {

        var valModStep = (val - scale.domain()[0]) % step,
            alignValue = val - valModStep;

        if (Math.abs(valModStep) * 2 >= step) {
          alignValue += (valModStep > 0) ? step : -step;
        }

        return alignValue;

      }


      function onClickHorizontal(val) {
        if (d3.event != null)
        {
            moveHandle(d3.event.offsetX || d3.event.layerX, val);
        }
        else 
        {
          moveHandle(null, val)
        }
      }
      function onClickVertical(val) {
        moveHandle(sliderLength - d3.event.offsetY || d3.event.layerY, val);
      }

      function onDragHorizontal() {
        moveHandle(Math.max(0, Math.min(sliderLength, d3.event.x)));
      }

      function onDragVertical() {
        moveHandle(sliderLength - Math.max(0, Math.min(sliderLength, d3.event.y)));
      }      

      function stopPropagation() {
        d3.event.stopPropagation();
      }

    });

  } 

  // Getter/setter functions
  slider.min = function(_) {
    if (!arguments.length) return min;
    min = _;
    return slider;
  } 

  slider.max = function(_) {
    if (!arguments.length) return max;
    max = _;
    return slider;
  }     

  slider.step = function(_) {
    if (!arguments.length) return step;
    step = _;
    return slider;
  }   

  slider.animate = function(_) {
    if (!arguments.length) return animate;
    animate = _;
    return slider;
  } 

  slider.orientation = function(_) {
    if (!arguments.length) return orientation;
    orientation = _;
    return slider;
  }     

  slider.axis = function(_) {
    if (!arguments.length) return axis;
    axis = _;
    return slider;
  }     

  slider.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return slider;
  }  

  slider.value = function(_) {
    if (!arguments.length) return value;
    value = _;
    return slider;
  }  

  slider.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return slider;
  } 
  
  slider.slide_to = function(newValue) {
    if(newValue > max)
      newValue = max;
    else if(newValue < min)
      newValue = min;
    div.on("click")(newValue);
  }   

  d3.rebind(slider, dispatch, "on");

  return slider;

}