//global variables

var svg, zoomer, projection, width100, height100, flanneryScale, coords =[]
var defaultColor = "#f7f7f7";
var exDefaultColor = "#969696"
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom",zoomer);
var defaultStroke = {"stroke": "black", "opacity": 1} //{"stroke": "red", "stroke-width": ".5px"}
var u, b
var tooltip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
    return "<span style='color:white'>" + d.id +"<p>"+d.percent+"</span>";
  })


//begin script when window loads 
window.onload = initialize(); 

//the first function called once the html is loaded 
function initialize(){

  height100 = window.innerHeight
  width100 = window.innerWidth

  svg = d3.select("body").append("svg")
    .attr("id", "mapSVG")
    .style({"height": height100, "width": width100, "position": "absolute"})
  
  //create map projection
  projection = d3.geo.albers()
  .center([2,38])
  .scale(height100*1.5)
  .translate([(width100)/2, (height100)/2]);

  function updateWindow(){
    x = window.innerWidth
    y = window.innerHeight
    svg.style({"width": x, "height": y});
  }
  window.onresize = updateWindow;

  var path = d3.geo.path()
    .projection(projection);

  u = svg.append("g")
  b = svg.append("g")

  queue()
    .defer(d3.json, "na.json")
    .defer(d3.json, "urbanAreas.json")
    .await(callback);

    function callback(error, na, urb){
      svg.call(zoom);

      b.selectAll('path')
        .data(topojson.feature(urb, urb.objects.urbs).features)
        .enter().append("path")
          .attr("d", path)
          .attr("class", "borders")
          .attr("id", function (d){
            var c = path.centroid(d)
            coords[d.properties.AFFGEOID10] = c
            return d.properties.AFFGEOID10
          })


      u.selectAll("path")
        .data(topojson.feature(na, na.objects.na).features)
        .enter().append("path")
          .attr("d", path)
          .attr("class", function (d){
            return d.properties.gu_a3
          })
          .attr("id", function (d){
            return d.properties.postal
          })
      setData(); 
    };
  
}

function setData(){
  svg.call(tooltip)

  d3.csv("data.csv", function(data) {
    data.forEach(function(d){
      d.percent = +d.percent
      d.id = d.GEOlabel
    });

    var max = d3.max(data, function(d) {return d.percent}),
    min = d3.min(data, function(d) {return d.percent})

    var color = d3.scale.quantile()
      .domain([0,50,100])
      .range(['#67a9cf','#f7f7f7','#ef8a62']);

    var city = svg.append("g")
    city.selectAll("circle")
      .data(data)
      .enter().append("circle")
      //.attr("class", function(d) {return d.id+" "+d.state+d.years+" "+d.name})
      .attr("id", function(d){return d.id})
      //.style("fill", exDefaultColor)
      .style("fill", function(d){return color(d.percent)})
      .style(defaultStroke)
      .attr("cx", function(d) {
        //find d in geojson
        return coords[d.geoid][0]
      }) 
      .attr("cy", function(d) { 
        return coords[d.geoid][1]
      })
      .on("mouseover", function(d){
        tooltip.show(d);
        //highlight(d);
      })
      .on("mouseout", function(d){
        tooltip.hide(d);
        //dehighlight(d);
      })

    var flanMax = calcFlanneryRadius(max);
    flanneryScale = d3.scale.linear().domain([0, flanMax]).range([1, 5]);

    city.selectAll("circle")
      .transition()
      .duration(1000)
      .attr("r", 6)
      //.attr("r", function (d){return radiusFlannery(d.percent)})
  });

/*  svg.append('g').selectAll("rect").data("Click me").enter().append("rect")
    .attr({"fill": "blue", "width": 20, "height": 20, "x": width100/3, "y": height100/2})
    .on('click', filter)*/
};

function filter() {
/*   svg.selectAll('circle')
    .filter(function (d){return d.namer.indexOf("CLEAN HARBOR") == -1}) // >-1
    .style("fill", "blue")
    //.remove()
*/
}

function zoomer() {
  /*u.attr("transform", "translate(" +  zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
  b.attr("transform", "translate(" +  zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
  svg.selectAll("circle").attr("transform", "translate(" +  zoom.translate() + ")scale(" + zoom.scale() + ")")
      .attr("r", 10/(zoom.scale())).style("stroke-width", 1 / zoom.scale() + "px" ) */
 }

function highlight(data){
  svg.selectAll("circle")
    .transition().duration(500) 
    .style({"opacity": ".2"})
  svg.selectAll("#"+data.id) 
    .transition().duration(500) 
    .style({"opacity": "1"})
}

function dehighlight(data){
  svg.selectAll("circle") 
    .transition().duration(500) 
    .style({"opacity": "1"})
};

function redraw (base){
  /*svg.selectAll("circle").sort(function (a, b) {
    if (a != base) return 0;               // a is not the hovered element, send "a" to the back
    else return 1;                             // a is the hovered element, bring "a" to the front
  });*/
}

var calcFlanneryRadius = function(x, max) {
  // Flannery Compensation formula as described here:
  //http://www.scribd.com/doc/33408233/SUG243-Cartography-Proportional-Symbol#scribd
  // log x * 0.57
  // anti log
  var flannery = 0.57;
  var log = Math.log(x);
  var r = log * flannery;
  r = Math.exp(r);
  return (r);
};

var radiusFlannery = function(x) {
  return flanneryScale(calcFlanneryRadius(x));
};
