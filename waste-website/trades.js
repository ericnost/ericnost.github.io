var graph;
var vis;


var w = 1000,
    h = 800,
    fill = d3.scale.category20();
        
vis = d3.select("#chart")
  .append("svg:svg")
    .attr("width", w)
    .attr("id","old")
    .attr("height", h)
      .attr("pointer-events", "all")
  .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", redraw))
  .append('svg:g');
  
  vis.append('svg:rect')
    .attr('width', w)
    .attr('height', h)
    .attr('fill', 'white');

function redraw() {
  //console.log("here", d3.event.translate, d3.event.scale);
  vis.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}
  
    
var file="trades.json";


d3.json(file, function(json) {

  var force = d3.layout.force()
      .charge(-75)
      .linkDistance(75)
      .nodes(json.nodes)
      .links(json.links)
      .size([w, h])
      .start();

  var link = vis.selectAll("line.link")
      .data(json.links)
    .enter().append("svg:line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); })
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  var node = vis.selectAll("g.node")
      .data(json.nodes)
    .enter().append("svg:g")
      .attr("class", "node")

  	node.append("svg:circle")
      .attr("r", 5)
      .style("fill", function(d) { return fill(d.group); })
      .call(force.drag) 

  node.append("svg:text")
    .attr("class", "nodetext")
    .attr("dx", 4)
	  .attr("dy", ".35em")
	.text(function(d) { return d.name; })
    .attr("legendText")

  node.append("svg:title")
    .text(function(d) { return d.name; });

  vis.style("opacity", 1e-6)
    .transition()
      .duration(1000)
      .style("opacity", 1);

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  
  graph = json;
  });
  
});

