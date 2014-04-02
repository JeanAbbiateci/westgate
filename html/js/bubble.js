function bubble(hour, current_view) {
    var BubbleChart, root,
            __bind = function(fn, me) {
        return function() {
            return fn.apply(me, arguments);
        };
    };

    BubbleChart = (function() {
        function BubbleChart(data) {
            this.hide_details = __bind(this.hide_details, this);
            this.show_details = __bind(this.show_details, this);
            this.move_towards_outer = __bind(this.move_towards_outer, this);
            this.display_by_type = __bind(this.display_by_type, this);
            this.move_towards_center = __bind(this.move_towards_center, this);
            this.display_group_all = __bind(this.display_group_all, this);
            this.start = __bind(this.start, this);
            this.create_vis = __bind(this.create_vis, this);
            this.create_nodes = __bind(this.create_nodes, this);
            this.data = data;
            var max_amount;
            this.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            this.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            this.center = {
                x: this.width / 2,
                y: (this.height - 171) / 2
            };
            this.centers = {
                'Verified users': {
                    x: this.width / 3 + 75,
                    y: (this.height - 171) / 2
                },
                'Normal users': {
                    x: 2 * this.width / 3 - 75,
                    y: (this.height - 171) / 2
                }
            };
            this.layout_gravity = -0.005;
            this.damper = 0.1;
            this.vis = null;
            this.nodes = [];
            this.force = null;
            this.circles = null;
            max_amount = 2233
            min_amount = 7
            this.radius_scale = d3.scale.pow().exponent(0.6).domain([min_amount, max_amount]).range([5, 100]);
            this.create_nodes();
            this.create_vis();
        }

        BubbleChart.prototype.create_nodes = function() {
            var _this = this;
            this.data.forEach(function(d) {
                var node;
                if (this.authors[d.user]) {
                    v = this.authors[d.user].verified;
                } else {
                    v = false;
                }
                ;
                node = {
                    id: d.tweet_id,
                    radius: _this.radius_scale(d.amount),
                    tweet: d.tweet,
                    value: d.amount,
                    name: d.user,
                    org: d.organization,
                    verified: v,
                    group: 1,
                    year: 1,
                    x: Math.random() * 900,
                    y: Math.random() * 800
                };
                return _this.nodes.push(node);
            });
            return this.nodes.sort(function(a, b) {
                return b.value - a.value;
            });

        };

        BubbleChart.prototype.create_vis = function() {
            var that,
                    _this = this;
            d3.select('#bubble').selectAll("svg").remove()
            this.vis = d3.select("#bubble").append("svg").attr("width", this.width).attr("height", this.height - 80).attr("id", "svg_vis");
            this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
                return d.id;
            });
            that = this;
            this.circles.enter().append("circle").attr("r", 0).attr("class", function(d) {
                if (d.verified) {
                    return 'bubble verified';
                }
                return 'bubble';
            }).attr("stroke-width", 2).attr("stroke", function(d) {
                return '#777';
            }).attr("id", function(d) {
                return "bubble_" + d.id;
            }).on("mouseover", function(d, i) {
                return that.show_details(d, i, this);
            }).on("mouseout", function(d, i) {
                return that.hide_details(d, i, this);
            });
            return this.circles.transition().duration(2000).attr("r", function(d) {
                return d.radius;
            });
        };

        BubbleChart.prototype.charge = function(d) {
            return -Math.pow(d.radius, 2.0) / 8;
        };

        BubbleChart.prototype.start = function() {
            return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
        };

        BubbleChart.prototype.display_group_all = function() {
            var _this = this;
            this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", function(e) {
                return _this.circles.each(_this.move_towards_center(e.alpha)).attr("cx", function(d) {
                    return d.x;
                }).attr("cy", function(d) {
                    return d.y;
                });
            });
            this.force.start();
        };

        BubbleChart.prototype.move_towards_center = function(alpha) {
            var _this = this;
            return function(d) {
                d.x = d.x + (_this.center.x - d.x) * (_this.damper + 0.02) * alpha;
                return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
            };
        };

        BubbleChart.prototype.display_by_type = function() {
            var _this = this;
            this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", function(e) {
                return _this.circles.each(_this.move_towards_outer(e.alpha)).attr("cx", function(d) {
                    return d.x;
                }).attr("cy", function(d) {
                    return d.y;
                });
            });
            this.force.start();
        };

        BubbleChart.prototype.move_towards_outer = function(alpha) {
            var _this = this;
            return function(d) {
                var target;
                if (d.verified) {
                    target = _this.centers['Verified users'];
                } else {
                    target = _this.centers['Normal users'];
                }
                d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
                return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
            };
        };

        BubbleChart.prototype.show_details = function(data, i, element) {
            var content;
            el = d3.select(element)
            el.attr("stroke", "black");
            content = data.name + " tweeted : <br/>";
            content += urlize(data.tweet) + "<br/>";
            content += "It was retweeted " + data.value + " times";

            var y = d3.event.pageY;
            var tooltip = d3.select('.tooltip').style("left", (d3.event.pageX - 125) + "px").style("bottom", null).style("top", (y - 160) + "px").html("<p>" + content + "</p>");
            tooltip = tooltip.style("top", (y - $(".tooltip").outerHeight() - 15) + "px").style("display", "block").style("opacity", 1);
        };

        BubbleChart.prototype.hide_details = function(data, i, element) {
            d3.select(".tooltip").style("opacity", 0).style("display", "none");
            d3.select(element).attr("stroke", function(d) {
                return "#777";
            });
        };

        return BubbleChart;

    })();

    root = typeof exports !== "undefined" && exports !== null ? exports : this;

    visualize = function(authors, hour, current_view) {
        var chart, render_vis,
                _this = this;
        chart = null;
        render = function(json) {
            j = json[hour]
            chart = new BubbleChart(j);
            chart.start();
            if (current_view == 'all') {
                root.display_all();
            } else {
                root.display_type();
            }
            this.current_view = current_view
        }

        root.display_all = function() {
            return chart.display_group_all();
        };
        root.display_type = function() {
            return chart.display_by_type();
        };
        root.toggle_view = function(type) {
            if (type == 'type') {
                this.current_view = 'type';
                return root.display_type();
            } else {
                this.current_view = 'all';
                return root.display_all();
            }
        };
        root.get_current_view = function() {
            return this.current_view
        }
        root.authors = authors
        return d3.json("data/popular_tweets.json", render);
    }

    d3.json("data/user_profiles.json", function(authors) {
        visualize(authors, hour, current_view)
    })

}

function urlize(content) {
    if (content.length > 0) {
        var list = content.match(/\b(http:\/\/|www\.|http:\/\/www\.)[^ <]{2,200}\b/g);
        if (list) {
            for (i = 0; i < list.length; i++) {
                var prot = list[i].indexOf('http://') === 0 || list[i].indexOf('https://') === 0 ? '' : 'http://';
                content = content.replace(list[i], "<a target='_blank' href='" + prot + list[i] + "'>" + list[i] + "</a>");
            }
        }
    }
    return content
}

function moveMarker(el) {
    rect = el.getBoundingClientRect()
    options_rect = document.getElementById('options').getBoundingClientRect()
    left = rect.left - options_rect.left - 5
    size = rect.right - rect.left + 10
    marker.transition().duration(1000).style('left', left + 'px').style('width', size + 'px')
}

function makeFirst(el) {
    rect = el.getBoundingClientRect()
    options_rect = document.getElementById('options').getBoundingClientRect()
    left = rect.left - options_rect.left - 10
    size = rect.right - rect.left + 18
    marker.transition().duration(1000).style('left', left + 'px').style('width', size + 'px')
}

function createButton() {
    options = d3.select('#options')
    marker = options.append('div').attr("id",'marker')
    types = [{type: 'type', html: 'By user group'},{type: 'all', html: 'Combined view'}]
    buttons = options.selectAll('.bubble-button').data(types).enter().append('div')
            .attr('class', 'bubble-button')
            .attr('id', function(d) {
        return d.type
    })
            .html(function(d) {
        return d.html
    })
            .on('click', function(d) {
        moveMarker(this)
        toggle_view(d.type);
    })
    first = document.getElementById('all');
    makeFirst(first)
}


bubble(0, 'all');
createButton();
