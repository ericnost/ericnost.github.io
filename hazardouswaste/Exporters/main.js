//global variables

var svg, zoomer, projection, width100, height100, dataz, max;
var defaultColor = "#f7f7f7";
var exDefaultColor = "#969696"
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 12])
    .on("zoom",zoomer);
var defaultStroke = {"stroke": "black", "opacity": 1} //{"stroke": "red", "stroke-width": ".5px"}
var u, b, imp, exp;
var tooltip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
    return "<span style='color:white'>" + dataz[d.key].name + ": "+ format(d.values.total_waste)+ " "+ phase.selected +"</span>";
  })
var flanneryScale;
var phase = {"selected":"kg", "unselected": "l"}
var format = d3.format(",.0f")  ;

//begin script when window loads 
window.onload = initialize(); 

//the first function called once the html is loaded 
function initialize(){

  height100 = window.innerHeight
  width100 = window.innerWidth

  svg = d3.select("body").append("svg")
    .attr("id", "mapSVG")
    .style({"top": 50, "height": height100-50, "width": width100, "position": "absolute"})
  
  //create map projection
  projection = d3.geo.albers()
  .center([2,38])
  .scale(height100*2)
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
    .defer(d3.json, "borders.json")
    .await(callback);

    function callback(error, na, borders){
      svg.call(zoom);

      b.selectAll('path')
        .data(topojson.feature(borders, borders.objects.borders).features)
        .enter().append("path")
          .attr("d", path)
          .attr("class", "borders")


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
    };
  setData(); 
}

function setData(){
  svg.call(tooltip)

  d3.select(".title").remove()

  d3.csv("USExporters_3-10-16.csv", function(ExporterData) {
    ExporterData.forEach(function(d){
      d.namer = d.USExporterSiteName 
      d.id = d.id
      d.latitude = +d.latitude
      d.longitude = +d.longitude
    });
    
    dataz = []
    for (r =0; r<ExporterData.length; r++){dataz[ExporterData[r].id] = {"name": ExporterData[r].namer, "latitude": ExporterData[r].latitude, "longitude": ExporterData[r].longitude}}

      d3.csv("export-data.csv", function(exData){
      exData.forEach(function(d){
        d.exporterID = d.exporterID
        d.quantity = +d.quantity
      })
    
        exData = exData.filter(function(d){return d.units_final==phase.selected})

        //nest by receiving facility id
        var exfacilitySum = d3.nest()
          .key(function(d) { return d.exporterID; }) // EPA ID number
          .rollup(function(leaves) { return {"total_waste": d3.sum(leaves, function(d) {return d.quantity;})} }) // sum by receiving facility code
          .entries(exData);

        //Imports side (right)
        max = d3.max(exfacilitySum, function(d){return d.values.total_waste});
        min = d3.min(exfacilitySum, function(d){return d.values.total_waste})
        mean = d3.mean(exfacilitySum, function(d){return d.values.total_waste})


        var flanMax = calcFlanneryRadius(max);
        flanneryScale = d3.scale.linear().domain([0, flanMax]).range([10, 35]);

        exfacilitySum.sort(function(a, b){return b.values.total_waste-a.values.total_waste})

        var exp = svg.append("g")
        exp.selectAll("circle")
          .data(exfacilitySum)
          .enter().append("circle")
          .attr("class", "exporter")
          .attr("id", function(d){return d.key})
          .style("fill", exDefaultColor)
          .style(defaultStroke)
          .attr("cx", function(d) {return projection([dataz[d.key].longitude, dataz[d.key].latitude])[0]; }) 
          .attr("cy", function(d) { return projection([dataz[d.key].longitude, dataz[d.key].latitude])[1]; })
          .on("mouseover", function(d){
            tooltip.show(d);
            highlight(d);
          })
          .on("mouseout", function(d){
            tooltip.hide(d);
            dehighlight(d);
          })
          .on('click', function(d){
            redraw(d);
          })

        exp.selectAll("circle")
          .transition()
          .duration(1000)
          .attr("r", function(d){return radiusFlannery(d.values.total_waste)})

        d3.select("body").append('div')
          .attr('class', 'title')
          .html("US sites with exports 2007-2012 ("+phase.selected+")"+" <span class ='phaser'>"+phase.unselected)
          .on('click', function(){
            var temp = phase.selected
            phase.selected = phase.unselected
            phase.unselected = temp
            svg.selectAll("circle, text").remove()
            setData()
          })

        var leg = svg.append("g")
        leg.selectAll("text")
            .data(["Legend"]).enter().append('text')
            .attr("x", function(){return projection([-74.672189, 30.967841])[0]-radiusFlannery(mean)-5; }) 
            .attr("y", function(){return projection([-74.672189, 30.967841])[1]-radiusFlannery(max)-5; })
            .html(function (d){return d})
        leg.selectAll("circle")
          .data([max, mean, min])
          .enter().append("circle")
          .style("fill", exDefaultColor)
          .style(defaultStroke)
          .attr("cx", function(){return projection([-74.672189, 30.967841])[0]; }) 
          .attr("cy", function(){return projection([-74.672189, 30.967841])[1]; })
        leg.selectAll("circle")
          .transition()
          .duration(1000)
          .attr("r", function(d){return radiusFlannery(d)})
        leg.selectAll("attributes")
            .data(["max", "mean", "min"]).enter().append('text')
            .attr("x", function(){return projection([-74.672189, 30.967841])[0]+radiusFlannery(max)+10; }) 
            .attr("y", function(d, i){return projection([-74.672189, 30.967841])[1]-radiusFlannery(min)+i*10; })
            .html(function (d){return d+": "+format(window[d])+" "+phase.selected})

  });//end work with data
})
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
  u.attr("transform", "translate(" +  zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
  b.attr("transform", "translate(" +  zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
  svg.selectAll("circle").attr("transform", "translate(" +  zoom.translate() + ")scale(" + zoom.scale() + ")")
      .attr("r", function (d){
      var flanMax = calcFlanneryRadius(max)
      flanneryScale = d3.scale.linear().domain([0, flanMax]).range([10, 35]);
      return radiusFlannery(d.values.total_waste)/(zoom.scale())
      })
      .style("stroke-width", 1 / zoom.scale() + "px" ) 
 }

//various helper functions here: calculating flannery's compensation, and svg z-indexing.
//flannery compensation for circles. modified from here: http://codepen.io/mxfh/pen/pggXoW
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


function highlight(data){
  svg.selectAll("circle")
    .transition().duration(500) 
    .style({"opacity": ".2"})
  svg.selectAll("#"+data.key) 
    .transition().duration(500) 
    .style({"opacity": "1"})
}

function dehighlight(data){
  svg.selectAll("circle") 
    .transition().duration(500) 
    .style({"opacity": "1"})
};

function redraw (base){
  svg.selectAll("circle").sort(function (a, b) {
    if (a != base) return 0;               // a is not the hovered element, send "a" to the back
    else return 1;                             // a is the hovered element, bring "a" to the front
  });
}