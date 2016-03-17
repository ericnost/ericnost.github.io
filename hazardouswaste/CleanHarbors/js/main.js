//global variables

var svg, zoomer, projection, width100, height100, globalMin, globalMax, arcGroup, exGlobalMin, exGlobalMax
var defaultColor = "#f7f7f7";
var exDefaultColor = "#969696"
var defaultStroke = {"stroke": "black", "opacity": 1} //{"stroke": "red", "stroke-width": ".5px"}
var u, b, imp, exp;
var tooltip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
    return "<span style='color:white'>" + d.namer + "</span>";
  })
var flanneryScale;

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
    .defer(d3.json, "data/new jsons/na.json")
    .defer(d3.json, "data/new jsons/borders.json")
    .await(callback);

    function callback(error, na, borders){
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

  d3.csv("data/total.csv", function(data) {
    data.forEach(function(d){
      d.totalQuantityinShipment = +d.totalQuantityinShipment // convert the quantity of waste from string to number
      d.exporterLAT = +d.exporterLAT
      d.exporterLONG = +d.exporterLONG 
      d.receivingLat = +d.latitude
      d.receivingLong = +d.longitude
      d.receivingFacilityZipCode = +d.receivingfacilityzipcode
      d.hazWasteDesc = d.hazWasteDesc
      d.exporter_key = d.exporter_key
      d.un = d.un
      d.mgmt = d.mgmt
      d.rcra = d.rcra
      d.ExpectedManagementMethod = d.ExpectedManagementMethod
    });

    var totalShipments = data.length

    data = data.filter(function(row){
      return row["exporter_name"].includes("CLEAN HARBOR") && row["importer_name"].includes("CLEAN HARBOR")
    })

    var CHShipments = [data.length, (data.length/totalShipments)*100]
    console.log(CHShipments)

    var latlongs = d3.nest() //rollup unique exportlatlongs
    .key(function(d) {return d.exporterLONG;})
    .entries(data);

    var latlongsR = d3.nest() //rollup unique receivinglatlongs
    .key(function(d) {return d.receivingLong;})
    .entries(data);

    var nest = d3.nest() 
    .key(function(d) {return d.receivingLong;})
    .key(function(d) {return d.exporterLONG;})    
    .map(data);

    latlongRdump=[];
    //get facility data ready to project
     for (var i=0; i<latlongsR.length; i++) {
              latlongRdump.push({"zip": latlongsR[i]["values"][0]["receivingFacilityZipCode"], "long": latlongsR[i]["values"][0]["longitude"], "lat": latlongsR[i]["values"][0]["latitude"], "id": latlongsR[i]["values"][0]["ReceivingFacilityEPAIDNumber"], "name": latlongsR[i]["values"][0]["importer_name"], "address": latlongsR[i]["values"][0]["importer_address"], "city": latlongsR[i]["values"][0]["importer_city"], "state": latlongsR[i]["values"][0]["importer_state"], "shipments": latlongsR[i]["values"].length, "years": [], "rank": [], "types": [], "units": latlongsR[i]["values"][0]["units_final"]}) 
      };

  var max = d3.max(latlongRdump, function(d) {return d.shipments}),
  min = d3.min(latlongRdump, function(d) {return d.shipments})

  globalMax = max, globalMin = min

  var flanMax = calcFlanneryRadius(max);
  flanneryScale = d3.scale.linear().domain([0, flanMax]).range([10, 35]);

  var tooltip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
    return "<span style='color:white'>" + d.id + "</span>";
  })

  svg.call(tooltip)

    imp = svg.append("g")
    imp.selectAll("circle")
      .data(latlongRdump)
      .enter().append("circle")
      //.attr("class", function(d) {return d.id+" "+d.state+d.years+" "+d.name})
      .attr("id", function(d){return d.id})
      .style("fill", defaultColor)
      .style(defaultStroke)
      .attr("cx", function(d) {return projection([d.long, d.lat])[0]; }) 
      .attr("cy", function(d) { return projection([d.long, d.lat])[1]; })
      .on("mouseover", function(d){
        tooltip.show(d);
        highlight(d);
      })
      .on("mouseout", function(d){
        tooltip.hide(d);
        dehighlight(d);
      })
      .on("click", function(d){
        exportThis(d, latlongs, nest)
      })
    imp.selectAll("circle")
      .transition()
      .duration(1000)
      .attr("r", function(d){return radiusFlannery(d.shipments)})

    latlongExDump=[];
      //get facility data ready to project
     for (var i=0; i<latlongs.length; i++) {
              latlongExDump.push({"long": latlongs[i]["values"][0]["exporterLONG"], "lat": latlongs[i]["values"][0]["exporterLAT"], "name": latlongs[i]["values"][0]["exporter_name"], "id": latlongs[i]["values"][0]["exporter_key"], "address": latlongs[i]["values"][0]["exporter_address"], "city": latlongs[i]["values"][0]["exporter_city"], "state": latlongs[i]["values"][0]["exporter_state"],"units": latlongs[i]["values"][0]["units_final"], "shipments":latlongs[i]["values"].length, "types": [], "rank": []})
      };

  var max = d3.max(latlongExDump, function(d) {return d.shipments}),
  min = d3.min(latlongExDump, function(d) {return d.shipments})

  exGlobalMax = max
  exGlobalMin = min

  var flanMax = calcFlanneryRadius(max);
  flanneryScale = d3.scale.linear().domain([0, flanMax]).range([10, 35]);


    exp = svg.append("g")
    exp.selectAll("circle")
      .data(latlongExDump)
      .enter().append("circle")
      //.attr("class", function(d) {return d.id+" "+d.state+d.years+" "+d.name})
      .attr("id", function(d){return d.id})
      .style("fill", exDefaultColor)
      .style(defaultStroke)
      .attr("cx", function(d) {return projection([d.long, d.lat])[0]; }) 
      .attr("cy", function(d) { return projection([d.long, d.lat])[1]; })
      .on("mouseover", function(d){
        tooltip.show(d);
        highlight(d);
      })
      .on("mouseout", function(d){
        tooltip.hide(d);
        dehighlight(d);
      })
    exp.selectAll("circle")
      .transition()
      .duration(1000)
      .attr("r", function(d){return radiusFlannery(d.shipments)})
  
  var flanMax = calcFlanneryRadius(globalMax);
  flanneryScale = d3.scale.linear().domain([0, flanMax]).range([10, 35]);

  var stringwork2 = ["Importers","Exporters"]
  var circleData = [[globalMax, defaultColor], [globalMin, defaultColor], [exGlobalMax, exDefaultColor], [exGlobalMin, exDefaultColor]]
  //var circleSpot = [34, 53, 58, 34, 54, 57] 

  var legendKey = ["Max", "Minimum","Max", "Minimum"]

  leg = svg.append("g")
  leg.selectAll("rect")
    .data([0])
    .enter()
    .append("rect")
    .attr("y", (height100/6)-10) 
    .attr("x", 5)
    .attr("width", 175)
    .attr("height", 175)
    .attr("fill", "grey")
  leg.selectAll("circle")
    .data(circleData)
    .enter()
    .append("circle")
    //.attr("class", function(d) {return data.parent.name})
    .style("fill", function(d){return d[1]})
    .style(defaultStroke)
    .attr("r", function(d){return radiusFlannery(d[0])})
    .attr("cy", (height100/4)-10) 
    .attr("cx", function(d, i){
      if (i <= 1) {return 45} else {return 115}
      })
 leg.selectAll("text")
    .data(stringwork2)
     .enter()
     .append("text")
     .text(function(d){return d})
     .attr("text-anchor", "middle")
     .attr("x",  function(d, i){
        if (i == 0) {return 45} else {return 115}
      })
     .attr("y", (height100/4)+33)
     .attr("font-size", "12px")
     .attr("fill", "white")

  leg.selectAll("line")
    .data([globalMin, globalMax])
    .enter()
    .append("rect")
    //.attr("class", function(d) {return data.parent.name})
    .style("fill", function(d){return "#252525"})
    .attr("width", 100)
    .attr("height", function(d,i){if(i==0){return 2}else{return 15}})
    .attr("y", function(d,i){if(i==0){return (height100/6) + 110}else{return (height100/6) + 140}}) 
    .attr("x", 5)
  leg.selectAll("texts")
    .data([globalMin, globalMax])
    .enter()
    .append('text')
    .attr("x", 5)
    .attr("y", function(d,i){if(i==0){return (height100/6) + 105}else{return (height100/6) + 135}}) 
    .text(function(d, i){if(i==0){return "Minimum # of shipments: "+ globalMin}else{return "Maximum: "+globalMax}})
    .attr("font-size", "12px")
    .attr("fill", "white")

  });
  arcGroup = svg.append('g');

};

function filter() {
/*   svg.selectAll('circle')
    .filter(function (d){return d.namer.indexOf("CLEAN HARBOR") == -1}) // >-1
    .style("fill", "blue")
    //.remove()
*/
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

function drawLinesOver(data, base){
  //var max = d3.max(data, function(d) {return d.total_waste}),
  //min = d3.min(data, function(d) {return d.total_waste})

  lineStroke = d3.scale.sqrt()
    .domain([globalMin, globalMax]) 
    .range([2, 15])

  //based on: http://bl.ocks.org/enoex/6201948
  
  var path = d3.geo.path()
    .projection(projection);

// --- Helper functions (for tweening the path)
        var lineTransition = function lineTransition(path) {
            path.transition()
                //NOTE: Change this number (in ms) to make lines draw faster or slower
                .duration(1500)
                .attrTween("stroke-dasharray", tweenDash)
                .each("end", function(d,i) { 
                    ////Uncomment following line to re-transition
                    //d3.select(this).call(transition); 
                    
                    //We might want to do stuff when the line reaches the target,
                    //  like start the pulsating or add a new point or tell the
                    //  NSA to listen to this guy's phone calls
                    //doStuffWhenLineFinishes(d,i);
                });
        };
        var tweenDash = function tweenDash() {
            //This function is used to animate the dash-array property, which is a
            //  nice hack that gives us animation along some arbitrary path (in this
            //  case, makes it look like a line is being drawn from point A to B)
            var len = this.getTotalLength(),
                interpolate = d3.interpolateString("0," + len, len + "," + len);

            return function(t) { return interpolate(t); };
        };

var links = [];
for(var i=0, len=data.length; i<len; i++){
    // (note: loop until length - 1 since we're getting the next
    //  item with i+1)
        links.push({
            type: "LineString",
            coordinates: [
                [ data[i].long, data[i].lat ],
                [ base.long, base.lat ]
            ],
            shipments: data[i].shipments
        });
    }
var pathArcs = arcGroup.selectAll("arc")
            .data(links);

        //enter
        pathArcs.enter()
            .append("path")
            .style({ 
                fill: 'none',
            });

        //update
        pathArcs.attr({
                //d is the points attribute for this path, we'll draw
                //  an arc between the points using the arc function
                d: path
            })
            .style("stroke", "#252525")
            .style('stroke-width', function(d) {return lineStroke(d.shipments)})
                //'stroke-dasharray': '5'
            .call(lineTransition); //at end of function call positions?
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

function exportThis(data, latlongs, nest){
  latlongdump = [];
  var p = nest[data.long]
  var keys = d3.keys(p)
  for (var k=0; k<keys.length; k++){
    latlongdump.push({"lat": p[keys[k]][0].exporterLAT, "long": p[keys[k]][0].exporterLONG, "shipments":p[keys[k]].length})
  }
  //draw lines between exporters and this site
  drawLinesOver(latlongdump, data);
}