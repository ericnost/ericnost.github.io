//global variables

var svg, zoomer, path, projection, width100, height100, expressed, colorize, color, csvname
var defaultColor = "#f7f7f7";
var exDefaultColor = "#969696"
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom",zoomer);
var defaultStroke = {"stroke": "black", "opacity": 1} //{"stroke": "red", "stroke-width": ".5px"}
var u, b
var files = ["race", "publicassistance", "otherincome", "occupancy"]

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
  projection = d3.geo.mercator()
    .center([-90.091020, 29.967810])
    //.rotate([20, 0])  
    //.parallels([29, 31]) 
    .scale(100000) 
    .translate([width100 / 2, height100 / 2]); 

  function updateWindow(){
    x = window.innerWidth
    y = window.innerHeight
    svg.style({"width": x, "height": y});
  }
  window.onresize = updateWindow;

  path = d3.geo.path()
    .projection(projection);

  setData("race")
}

function setData(selectedCSV){
  csvname = selectedCSV
  queue() 
    .defer(d3.csv, "data/"+selectedCSV+".csv") //load attributes from csv 
    .defer(d3.json, "blocks.json")
    .defer(d3.json, "riversLA.json") //load geometry from topojson
    .await(callback); //trigger callback function once data is loaded 


  function callback(error, selectedCSV, blocks, riversLA){
      svg.call(zoom);

      expressed = d3.keys(selectedCSV[0])[5]
      colorize = colorScale(selectedCSV);

      //variables for csv to json data transfer
      var censusblocks = blocks.objects.blocks.geometries;

      //loop through csv to assign each csv values to json province
      for (var i=0; i<selectedCSV.length; i++) {
        var block = selectedCSV[i]; //the current block group row
        var blockID = block.Id; //adm code
        //loop through json provinces to find right province
        for (var a=0; a<censusblocks.length; a++){
          //where adm1 codes match, attach csv to json object
          if (censusblocks[a].properties.AFFGEOID == blockID){
            // assign key/value pairs
            var keys = d3.keys(selectedCSV[0])
            keys = keys.filter(function(d){return d.includes("Estimate")}) //get rid of margin estimates

            for (var n=0; n<keys.length; n++){
              var attr = keys[n];
              var val = parseFloat(block[attr]);
              censusblocks[a].properties[attr] = val;
            };
          break; //stop looking through the json provinces
          };
        };
      };
    
    var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-5, 0])
    .html(function(d) {console.log(d); 
      return "<span style='color:white'>" + d.properties.GEOID + "<br>" +d.properties[expressed]/d.properties["Estimate; Total:"]+"</span>";
    })

    svg.call(tooltip)

    var blocks = svg.selectAll(".blocks")
      .data(topojson.feature(blocks, blocks.objects.blocks).features)
      .enter() //create elements
      .append("g")
      .attr("class", "blocks") //assign class for additional styling
      .append("path") //append elements to svg
      .attr("id", function(d) { return d.properties.Id })
      .attr("d", path) //project data as geometry in svg
      .style({"fill": function(d) { //color enumeration units
        return choropleth(d, colorize);
      }, "fill-opacity": 1})
      .on("mouseover", function(d){ highlight(d); tooltip.show(d)})
      .on("mouseover", function(d){ dehighlight(d); tooltip.show(d)})

    var rivers = svg.append("path")
        .datum(topojson.feature(riversLA, riversLA.objects.riversLA2))
        .attr("class", "rivers")
        .attr("d", path);

//attribute selector
    svg.selectAll("rect")
      .data(keys)
      .enter()
      .append("rect")
      .attr("class", "selectorz")
      .style("fill", function (d){if (d == expressed){return "blue"}else{return "d3d3d3"}})
      .attr("width", 16)
      .attr("height", 16)
      .attr("y", function(d, i){return  (height100/3) + i*18 - 16}) 
      .attr("x", 5)
      .on('click', function(d){
        changeAttribute(d, selectedCSV)
        legend()
      })

    svg.selectAll("text")
      .data(keys)
       .enter()
       .append("text")
       .text(function(d){return d})
       .attr("class", "selectorz")
       .attr("text-anchor", "right")
       .attr("y", function(d, i){return height100/3 + i*18}) 
       .attr("x", 21) 
       .attr("font-size", "12px")
       .attr("fill", "white")
       .on('click', function(d){
         changeAttribute(d, selectedCSV)
         legend()
        })

//table selector
    svg.selectAll(".master")
      .data(files)//eventually, loop folder to find...
      .enter()
      .append("rect")
      .attr("class", "selectorz")
      .style("fill", function (d){console.log(d, csvname);if (d == csvname){return "blue"}else{return "d3d3d3"}})
      .attr("width", 16)
      .attr("height", 16)
      .attr("y", function(d, i){return  25 + i*18 - 16}) 
      .attr("x", 5)
      .on('click', function(d){
        d3.selectAll(".blocks, rect, text").remove()
        setData(d)
      })

    svg.selectAll(".mastertext")
      .data(files)
       .enter()
       .append("text")
       .text(function(d){return d})
       .attr("class", "selectorz")
       .attr("text-anchor", "right")
       .attr("y", function(d, i){return 25 + i*18}) 
       .attr("x", 21) 
       .attr("font-size", "12px")
       .attr("fill", "white")
       .on('click', function(d){
         d3.selectAll(".blocks, rect, text").remove()
         setData(d)
        })
  legend()
}
}

function legend(){
  //legend

    svg.selectAll(".legrect").remove()
    svg.selectAll("legrect")
      .data(color.quantiles())
      .enter()
      .append("rect")
      .attr("class", "legrect")
      .style("fill", function(d){return colorize(d)})
      .attr("width", 16)
      .attr("height", 16)
      .attr("y", function(d, i){return  (height100/1.3) + i*16 - 16}) 
      .attr("x", 5) 

    svg.selectAll(".legtext").remove()
    svg.selectAll("legtext")
      .data(color.quantiles())
       .enter()
       .append("text")
       .text(function(d){return d})
       .attr("class", "legtext")
       .attr("text-anchor", "right")
        .attr("y", function(d, i){return height100/1.3 + i*16}) 
        .attr("x", 21) 
       .attr("font-size", "12px")
       .attr("fill", "white")
}

function changeAttribute(attribute, csvData){
  //change the expressed attribute
  expressed = attribute;
  colorize = colorScale(csvData);
  
  //recolor the map
  d3.selectAll(".blocks") //select every province
    .select("path")
    .style("fill", function(d) { //color enumeration units
      return choropleth(d, colorize); //->
    })
}

function choropleth(d, colorize){
  //get data value
  var value = d.properties[expressed]/d.properties["Estimate; Total:"];

  //if value exists, assign it a color; otherwise assign gray
  if (value) {
    return colorize(value); //colorize holds the colorScale generator
  } else {
    return "#ccc";
  };
};

function colorScale(csvData){
  
  //create quantile classes with color scale
  color = d3.scale.quantile() //designate quantile scale generator
    .range(['rgb(240,249,232)','rgb(186,228,188)','rgb(123,204,196)','rgb(67,162,202)','rgb(8,104,172)']);
  
/*  var domainArray = [];
  for (var i in csvData){
    domainArray.push(Number(csvData[i][expressed]));
  };

*/
  
  //for equal-interval scale, use min and max expressed data values as domain
  // color.domain([
  //  d3.min(csvData, function(d) { return Number(d[expressed]); }),
  //  d3.max(csvData, function(d) { return Number(d[expressed]); })
  // ]);

  //for quantile scale, pass array of expressed values as domain
  color.domain(csvData.map(function(d){return d[expressed]/d["Estimate; Total:"]})); //this is where we calculate percentage....
  return color; //return the color scale generator
}


function filter() {
/*   svg.selectAll('circle')
    .filter(function (d){return d.namer.indexOf("CLEAN HARBOR") == -1}) // >-1
    .style("fill", "blue")
    //.remove()
*/
}

function zoomer() {
  svg.selectAll(".blocks").attr("transform", "translate(" +  zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
 }

function highlight(data){
  svg.selectAll(".blocks")
    .transition().duration(500) 
    .style({"opacity": ".2"})
  svg.selectAll("#"+data.Id) 
    .transition().duration(500) 
    .style({"opacity": "1"})
}

function dehighlight(data){
  svg.selectAll(".blocks") 
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
