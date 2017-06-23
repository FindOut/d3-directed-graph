var d3 = require('d3');
var _ = require('lodash');

var r = 20,
width = 800,
height = 300;

var svg = d3.select('#graph').append('svg')
    .attr('width', width).attr('height', height);

svg.append('defs').append('marker')
  .attr("id", 'markerArrowEnd')
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 10)
  .attr("refY", 0)
  .attr("markerWidth", 8)
  .attr("markerHeight", 8)
  .attr("orient", "auto")
  .append("path")
    .attr("d", 'M0,-5 L10,0 L0,5')
    .attr('fill', 'black');


var force = d3.layout.force()
    .charge(-120)
    .linkDistance(70)
    .size([width, height]);

function render() {
  d3.json('model.json', function(error, data) {
    var nodeById = _.keyBy(data.nodes, 'id');

    // run autolayout
    force
        .nodes(data.nodes)
        .links(_.map(data.links, function(link) {
            return {source: nodeById[link.from],
                    target: nodeById[link.to]}}))
        .start();

    // render nodes
    var nodes = svg.selectAll('.node').data(data.nodes, function(d) {return d.id});
    var nodesEnter = nodes.enter().append('g')
        .attr('class', 'node')
        .attr('transform', 'translate(50, 50)');
    nodesEnter.append('circle')
        .attr('r', r);
    nodesEnter.append('text');
    nodes.select('text').text(function(d) {return d.label});
    nodes.select('text').each(function(d) {
      var bbox = this.getBBox();
      d3.select(this).attr({x: -bbox.x - bbox.width / 2, y: -bbox.y - bbox.height / 2});
    });
    nodes.exit().remove();

    // render links
    var links = svg.selectAll('.link').data(data.links, function(d) {return String(d.from) + '_' + String(d.to)});
    var linksEnter = links.enter().append('line')
    .attr('class', 'link')
    .attr('marker-end', 'url(#markerArrowEnd)');
    links.exit().remove();

    // returns {from: {x, y}, to: {x, y}} that goes between
    // edge of circles with the supplied center points
    function adjustEnds(fromCenterPoint, toCenterPoint, r) {
      var dx = toCenterPoint.x - fromCenterPoint.x,
        dy = toCenterPoint.y - fromCenterPoint.y,
        length = Math.sqrt(dx * dx + dy * dy);
      dx = dx / length * r;
      dy = dy / length * r;
      return {from: {x: fromCenterPoint.x + dx, y: fromCenterPoint.y + dy}, to: {x: toCenterPoint.x - dx, y: toCenterPoint.y - dy}};
    }

    // autolayout animation
    force.on("tick", function() {
      nodes.each(function(d) {
        d3.select(this).attr('transform', 'translate(' + d.x + ', ' + d.y + ')');
      });
      links.each(function(d) {
        var adjustedEnds = adjustEnds(nodeById[d.from], nodeById[d.to], r);
        d3.select(this)
        .attr("x1", function(d) { return adjustedEnds.from.x; })
        .attr("y1", function(d) { return adjustedEnds.from.y; })
        .attr("x2", function(d) { return adjustedEnds.to.x; })
        .attr("y2", function(d) { return adjustedEnds.to.y; });
      });
    });
  });
}

render();
