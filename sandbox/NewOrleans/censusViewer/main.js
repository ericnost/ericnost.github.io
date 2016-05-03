//global variables

var svg, zoomer, path, projection, width100, height100, expressed, colorize, color, csvname
var defaultColor = "#f7f7f7";
var exDefaultColor = "#969696"
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom",zoomer);
var defaultStroke = {"stroke": "black", "stroke-width": .1} //{"stroke": "red", "stroke-width": ".5px"}
var u, b
var files = ["race", "publicassistance", "otherincome", "occupancy"]
var format = d3.format(",.2%")  ;
var filterer = []

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
      //svg.call(zoom);

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
    keys.splice(0,1)
    
    var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-50, 0])
    .html(function(d) { 
      return "<span style='color:white'> Census block: " + d.properties.GEOID + "<br>" +format(d.properties[expressed]/d.properties["Estimate; Total:"])+" " + expressed.replace("Estimate; Total: - ", "") + "</span>";
    })

    svg.call(tooltip)

    var blocks = svg.selectAll(".blocks")
      .data(topojson.feature(blocks, blocks.objects.blocks).features)
      .enter() //create elements
      .append("g")
       .attr("class", "blocks") //assign class for additional styling
      .attr("id", function(d) { return d.properties.LSAD+d.properties.GEOID })
      .append("path") //append elements to svg
     

      .attr("d", path) //project data as geometry in svg
      .style({"fill": function(d) { //color enumeration units
        return choropleth(d, colorize);
      }, "fill-opacity": 1})
      .style(defaultStroke)
      .on("mouseover", function(d){if (d.properties[expressed]){highlight(d); tooltip.show(d)}})
      .on("mouseout", function(d){ dehighlight(d); tooltip.hide(d)})

    var rivers = svg.append("path")
        .datum(topojson.feature(riversLA, riversLA.objects.riversLA2))
        .attr("class", "rivers")
        .attr("d", path);

//attribute selector
    svg.selectAll(".att")
      .data(keys)
      .enter()
      .append("rect")
      .attr("class", "selectorz att")
      .style("fill", function (d){if (d == expressed){return "blue"}else{return "d3d3d3"}})
      .attr("width", 16)
      .attr("height", 16)
      .attr("y", function(d, i){return  (height100/3) + i*18 - 16}) 
      .attr("x", 5)
      .on('click', function(d){
        filterer = []
        changeAttribute(d, selectedCSV)
        legend()
      })

    svg.selectAll("text")
      .data(keys)
       .enter()
       .append("text")
       .text(function(d){return d.replace("Estimate; Total: -", "")})
       .attr("class", "selectorz")
       .attr("text-anchor", "right")
       .attr("y", function(d, i){return height100/3 + i*18}) 
       .attr("x", 21) 
       .attr("font-size", "12px")
       .attr("fill", "white")
       .on('click', function(d){
        filterer = []
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
         filterer = []
         setData(d)
        })
  legend()
}
}

function legend(){
  //legend
    x = color.copy()
    x.quantiles().unshift(0)


    svg.selectAll(".legrect").remove()
    svg.selectAll("legrect")
      .data(x.quantiles())
      .enter()
      .append("rect")
      .attr("class", "legrect")
      .style("fill", function(d){return colorize(d)})
      .attr("width", 16)
      .attr("height", 16)
      .attr("y", function(d, i){return  (height100/1.3) + i*16 - 16}) 
      .attr("x", 5) 
      .on('click', function(d){filter(d)})


    svg.selectAll(".legtext").remove()
    svg.selectAll("legtext")
      .data(x.quantiles())
       .enter()
       .append("text")
       .text(function(d, i){return format(d)+" - "+format(x.quantiles()[i+1])})
       .attr("class", "legtext")
       .attr("text-anchor", "right")
        .attr("y", function(d, i){return height100/1.3 + i*16}) 
        .attr("x", 21) 
       .attr("font-size", "12px")
       .attr("fill", "white")
       .on('click', function(d){filter(d)})

var margin = {top: 100, right: 25, bottom: 100, left: 25},
    width = width100/2 - margin.left - margin.right,
    height = height100/1.5
var x = d3.scale.linear()
    .domain([d3.min(color.domain()), d3.max(color.domain())])
    .range([margin.left, width])

d3.selectAll(".axis, .filtercircles, .brush").remove()
var brush = d3.svg.brush()
    .x(x)
    .extent([d3.min(color.domain()), d3.max(color.domain())])
    .on("brushstart", brushstart)
    .on("brush", brushmove)
    .on("brushend", brushend);

var arc = d3.svg.arc()
    .outerRadius(height / 50)
    .startAngle(0)
    .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + 0 + ")");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate("+0+"," + height + ")")
    .call(d3.svg.axis().scale(x).orient("bottom").ticks(20).tickFormat(d3.format("%")));

var circle = svg.append("g").selectAll("circles")
    .data(color.domain())
  .enter().append("circle")
    .attr('class', "filtercircles")
    .attr("transform", function(d) { return "translate(" + x(d) + "," + height + ")"; })
    .attr("fill", function(d){return colorize(d)})
    .attr("r", height/50);

var brushg = svg.append("g")
    .attr("class", "brush")
    .call(brush);

brushg.selectAll(".resize").append("path")
    .attr("transform", "translate(0," +  height + ")")
    .attr("d", arc);



brushstart();
brushmove();

function brushstart() {
  svg.classed("selecting", true);
}

function brushmove() {
  var s = brush.extent();
  circle.classed("selected", function(d) { return s[0] <= d && d <= s[1]; });
  filter(s)
}

function brushend() {
  svg.classed("selecting", !d3.event.target.empty());
}




}

function changeAttribute(attribute, csvData){
  //change the expressed attribute
  expressed = attribute;
  colorize = colorScale(csvData);
  
  d3.selectAll(".att")
      .style("fill", function (d){if (d == expressed){return "blue"}else{return "d3d3d3"}})
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
    return "#ddd";
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


function filter(data) {
//return s[0] <= d && d <= s[1]; 
//do math to get range
 svg.selectAll('.blocks')
    .select('path')
    .style("fill", function(d){
      if (d.properties[expressed]/d.properties["Estimate; Total:"] <= data[0] || d.properties[expressed]/d.properties["Estimate; Total:"] >= data[1]){console.log('true');return "#ddd"}
      else {return choropleth(d, colorize)}
    })
}

/*function zoomer() {
  svg.selectAll(".blocks").attr("transform", "translate(" +  zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
 }*/

function highlight(data){
  svg.selectAll(".blocks")
    .select("path")
    .style('fill-opacity', .75)
  svg.select("#"+data.properties.LSAD+data.properties.GEOID) 
    .select('path')
    //.transition().duration(500) 
    .style('fill-opacity', 1)
}

function dehighlight(data){
  svg.selectAll(".blocks")
    .select("path")
    .style('fill-opacity', 1)
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
