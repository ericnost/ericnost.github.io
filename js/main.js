var keyArray = ["wellDensitySqMi", "hydrocarbonFieldDensity", "pipelineDensity", "restorationProjectsDensity", "permitDensity", "leveesNormalizedSQMI", "spoilBanksAreaNormalizedSQMI"];
var expressed = keyArray[0]; 
var colorize;
var bar;
var Bsvg;
var Ssvg;
var chartWidth = 550, chartHeight = 450;

//begin script when window loads 
window.onload = initialize(); 

//the first function called once the html is loaded 



function initialize(){ 
	setMap(); 
}; 


//set choropleth map parameters 
function setMap(){

	var title = d3.select("body")
		.append("h1")
		.text("Louisiana Land Loss");

	//map frame dimensions 
	var width = 960; 
	var height = 460; 

	//create a new svg element with the above dimensions 
	var map = d3.select("body") 
		.append("svg") 
		.attr("width", width) 
		.attr("height", height) 
		.attr("class", "map");

	//create Europe Albers equal area conic projection, centered on France 
	var projection = d3.geo.mercator()
		.center([-91, 30])
		//.rotate([20, 0])  
		//.parallels([29, 31]) 
		.scale(9000) 
		.translate([width / 2, height / 2]); 
	
	//create svg path generator using the projection 
	var path = d3.geo.path() 
		.projection(projection); 

	//gratlines
	//create graticule generator
	var graticule = d3.geo.graticule()
	
	//create graticule background (water)
	var gratBackground = map.append("path")
		.datum(graticule.outline) //bind graticule background
		.attr("class", "gratBackground") //assign class for styling
		.attr("d", path) //project graticule

	//use queue.js to parallelize asynchronous data loading 
	queue() 
		.defer(d3.csv, "data/d3Data.csv") //load attributes from csv 
		.defer(d3.json, "data/coast.json") //load geometry from topojson 
		.await(callback); //trigger callback function once data is loaded 

	function callback(error, csvData, coast){

		colorize = colorScale(csvData);

		//variables for csv to json data transfer
		var jsonBasins = coast.objects.subbasins.geometries;
	
		//loop through csv to assign each csv values to json province
		for (var i=0; i<csvData.length; i++) {
			var csvBasins = csvData[i]; //the current province
			var csvID = csvBasins.id; //adm1 code
	
			//loop through json provinces to find right province
			for (var a=0; a<jsonBasins.length; a++){
	
				//where adm1 codes match, attach csv to json object
				if (jsonBasins[a].properties.id == csvID){
	
					// assign all five key/value pairs
					for (var key in keyArray){
						var attr = keyArray[key];
						var val = parseFloat(csvBasins[attr]);
						jsonBasins[a].properties[attr] = val;
					};
				jsonBasins[a].properties.name = csvBasins.name; //set prop
				break; //stop looking through the json provinces
				};
			};
		};

		//add Europe countries geometry to map 
		var states = map.append("path") //create SVG path element 
			.datum(topojson.feature(coast, coast.objects.states)) 
			.attr("class", "states") //class name for styling 
			.attr("d", path); //project data as geometry in svg

		var subbasins = map.selectAll(".subbasins")
			.data(topojson.feature(coast, coast.objects.subbasins). features)
			.enter() //create elements
			.append("g")
			.attr("class", "subbasins") //assign class for additional styling
			.append("path") //append elements to svg
			.attr("class", function(d) { return d.properties.id })
			.attr("d", path) //project data as geometry in svg
			.style("fill", function(d) { //color enumeration units
				return choropleth(d, colorize);
			})
			.on("mouseover", highlight)
			.on("mouseout", dehighlight)
			.on("mousemove", moveLabel)
			.append("desc") //append the current color
				.text(function(d) {
					return choropleth(d, colorize);
				});
		createDropdown(csvData);
		updateTheChart(csvData);
		scatPlot(csvData);
	}; 
};

function createDropdown(csvData){
	//add a select element for the dropdown menu
	var dropdown = d3.select("body")
		.append("div")
		.attr("class","dropdown") //for positioning menu with css
		.html("<h3>Select Variable:</h3>")
		.append("select")
		.on("change", function(){ changeAttribute(this.value, csvData) }); //changes expressed attribute
	
	//create each option element within the dropdown
	dropdown.selectAll("options")
		.data(keyArray)
		.enter()
		.append("option")
		.attr("value", function(d){ return d })
		.text(function(d) {
			//d = d[0].toUpperCase() + d.substring(1,3) + " " + d.substring(3);
			return d
		});
};

function setChart(csvData, colorize){

	//create a second svg element to hold the bar chart
	var chart = d3.select("body")
		.append("svg")
		.attr("width", chartWidth)
		.attr("height", chartHeight)
		.attr("class", "chart");

	//create a text element for the chart title
	var title = chart.append("text")
		.attr("x", 20)
		.attr("y", 40)
		.attr("class", "chartTitle");

	//set bars for each province
	var barz = chart.selectAll(".barz")
		.data(csvData)
		.enter()
		.append("rect")
		.sort(function(a, b){return a[expressed]-b[expressed]})
		.attr("class", function(d){
			return "barz " + d.id;
		})
		.attr("width", chartWidth / csvData.length - 1)
		.on("mouseover", highlight)
		.on("mouseout", dehighlight)
		.on("mousemove", moveLabel);

	//adjust bars according to current attribute
	updateChart(barz, csvData.length);
};

function colorScale(csvData){
	
	//create quantile classes with color scale
	var color = d3.scale.quantile() //designate quantile scale generator
		.range([
			"#D4B9DA",
			"#C994C7",
			"#DF65B0",
			"#DD1C77",
			"#980043"
		]);
	

	
	//for equal-interval scale, use min and max expressed data values as domain
	color.domain([
		d3.min(csvData, function(d) { return Number(d[expressed]); }),
		d3.max(csvData, function(d) { return Number(d[expressed]); })
	]);
	
	return color; //return the color scale generator
}
	
function choropleth(d, colorize){
	
	//get data value
	var value = d.properties ? d.properties[expressed] : d[expressed];
	//if value exists, assign it a color; otherwise assign gray
	if (value) {
		return colorize(value); //colorize holds the colorScale generator
	} else {
		return "#ccc";
	};
};


function changeAttribute(attribute, csvData){

	//change the expressed attribute
	expressed = attribute;
	colorize = colorScale(csvData);
	
	//recolor the map
	d3.selectAll(".subbasins") //select every province
		.select("path")
		.style("fill", function(d) { //color enumeration units
			return choropleth(d, colorize); //->
		})
		.select("desc") //replace the color text in each province's desc element
			.text(function(d) {
				return choropleth(d, colorize); //->
			});

//re-sort the bar chart
		/*bar.sort(function(a, b){
			return a[expressed]-b[expressed];
		})
		.transition() //this adds the super cool animation
		.delay(function(d, i){
			return i * 30 
		});*/
	Ssvg.remove();
	Bsvg.remove();
	//update bars according to current attribute
	updateTheChart(csvData);
	scatPlot(csvData);
};

function updateChart(barz, numbars){
	//style the bars according to currently expressed attribute
	barz.attr("height", function(d, i){
			return Number(d[expressed])*3;
		})
		.attr("y", function(d, i){
			return chartHeight - Number(d[expressed])*3;
		})
		.attr("x", function(d, i){
			return i * (chartWidth / numbars);
		})
		.style("fill", function(d){
			return choropleth(d, colorize);
		});

	//update chart title
	d3.select(".chartTitle")
		.text("Number of "+ 
			expressed+
			" In Each Subbasin");
};


function highlight(data){

	//json or csv properties
	var props = data.properties ? data.properties : data;

	d3.selectAll("."+props.adm1_code) //select the current province in the DOM
		.style("fill", "#000"); //set the enumeration unit fill to black

	var labelAttribute = "<h1>"+props[expressed]+
		"</h1><br><b>"+expressed+"</b>"; //label content
	var labelName = props.name //html string for name to go in child div
	
	//create info label div
	var infolabel = d3.select("body")
		.append("div") //create the label div
		.attr("class", "infolabel")
		.attr("id", props.adm1_code+"label") //for styling label
		.html(labelAttribute) //add text
		.append("div") //add child div for feature name
		.attr("class", "labelname") //for styling name
		.html(labelName); //add feature name to label
};

function dehighlight(data){
	
	//json or csv properties
	var props = data.properties ? data.properties : data;
	var prov = d3.selectAll("."+props.adm1_code); //designate selector variable for brevity
	var fillcolor = prov.select("desc").text(); //access original color from desc
	prov.style("fill", fillcolor); //reset enumeration unit to orginal color
	
	d3.select("#"+props.adm1_code+"label").remove(); //remove info label
};

function moveLabel() {

	//horizontal label coordinate based mouse position stored in d3.event
	var x = d3.event.clientX < window.innerWidth - 245 ? d3.event.clientX+10 : d3.event.clientX-210; 
	//vertical label coordinate
	var y = d3.event.clientY < window.innerHeight - 100 ? d3.event.clientY-75 : d3.event.clientY-175; 
	
	d3.select(".infolabel") //select the label div for moving
		.style("margin-left", x+"px") //reposition label horizontal
		.style("margin-top", y+"px"); //reposition label vertical
};


// adapted from Mike Bostock's multi-line series graph: http://bl.ocks.org/mbostock/3884955
var margin = {top: 600, right: 120, bottom: 50, left: 50},
    width = 960 - margin.left - margin.right,
    height = 400;

var parseDate = d3.time.format("%Y%m%d").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/dataLandLoss.csv", function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  var cities = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, temperature: +d[name]};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -150)
      .attr("dy", ".3em")
      .style("text-anchor", "end")
      .text("% of 1932 Land Area");

  var city = svg.selectAll(".city")
      .data(cities)
    .enter().append("g")
      .attr("class", "city");

  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

  city.append("text")
 	  .attr("class", "chartLabels")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
      .attr("x", 3)
      .attr("dy", ".5em")
      .text(function(d) { return d.name; })
      ;
});

//following code adapted from Mike Bostock's bar chart:



function updateTheChart (data) {
	var m = [1200, 120, 50, 200],
    w = 960 - m[1] - m[3],
    h = 400;

	var Bformat = d3.format(".2r");

	var Bx = d3.scale.linear().range([0, w]),
	    By = d3.scale.ordinal().rangeRoundBands([0, h], .1);

	var BxAxis = d3.svg.axis().scale(Bx).orient("top").tickSize(-h),
	    ByAxis = d3.svg.axis().scale(By).orient("left").tickSize(0);

	Bsvg = d3.select("body").append("svg")
	    .attr("width", w + m[1] + m[3])
	    .attr("height", h + m[0] + m[2])
	  .append("g")
	    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");


  // Parse numbers, and sort by value.
  data.forEach(function(d) { d[expressed] = +d[expressed]; });
  data.sort(function(a, b) { return b[expressed] - a[expressed]; });

  // Set the scale domain.
  Bx.domain([0, d3.max(data, function(d) { return Number(d[expressed]); })]);
  By.domain(data.map(function(d) { return d.basinName; }));

  bar = Bsvg.selectAll("g.bar")
      .data(data)
      .enter().append("g")
      .attr("transform", function(d) { return "translate(0," + By(d.basinName) + ")"; })
      .style("fill", function(d){
			return choropleth(d, colorize);
		});
 

  bar.append("rect")
      .attr("width", function(d) { return Bx(Number(d[expressed])); })
      .attr("height", By.rangeBand());

  bar.append("text")
      .attr("class", "value")
      .attr("x", function(d) { return Bx(Number(d[expressed])); })
      .attr("y", By.rangeBand() / 2)
      .attr("dx", -3)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(function(d) { return Bformat(Number(d[expressed])); });

  Bsvg.append("g")
      .attr("class", "bx")
      .call(BxAxis);

  Bsvg.append("g")
      .attr("class", "by")
      .call(ByAxis);
}; 


//adapted from weiglemc scatter plot: http://bl.ocks.org/weiglemc/6185069

function scatPlot(data){
var margin = {top: 1600, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 
var xValue = function(d) { return d[expressed];}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d.landloss;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color
var cValue = function(d) { return d.basinName;},
    color = d3.scale.category10();

// add the graph canvas to the body of the webpage
Ssvg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d[expressed] = +d[expressed];
    d.landloss = +d.landloss;

  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);


  // x-axis
  Ssvg.append("g")
      .attr("class", "XXXaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(expressed);

  // y-axis
  Ssvg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("% of 1932 land");

  // draw dots
  Ssvg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));}) 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d.basinName + "<br/> (" + xValue(d) 
	        + ", " + yValue(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

   // from http://bl.ocks.org/benvandyke/8459843
  // get the x and y values for least squares
  var decimalFormat = d3.format("0.2f");
  var xLabels = data.map(function (d) { return d[expressed]; })
		var xSeries = d3.range(1, xLabels.length + 1);
		var ySeries = data.map(function(d) { return parseFloat(d.landloss); });
		
		var leastSquaresCoeff = leastSquares(xSeries, ySeries);
		
		// apply the reults of the least squares regression
		var x1 = xLabels[0];
		var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
		var x2 = xLabels[xLabels.length - 1];
		var y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1];
		var trendData = [[x1,y1,x2,y2]];
		
		var trendline = Ssvg.selectAll(".trendline")
			.data(trendData);
			
		trendline.enter()
			.append("line")
			.attr("class", "trendline")
			.attr("x1", function(d) { return xScale(d[0]); })
			.attr("y1", function(d) { return yScale(d[1]); })
			.attr("x2", function(d) { return xScale(d[2]); })
			.attr("y2", function(d) { return yScale(d[3]); })
			.attr("stroke", "black")
			.attr("stroke-width", 1);
		
		// display equation on the chart
		Ssvg.append("text")
			.text("eq: " + decimalFormat(leastSquaresCoeff[0]) + "x + " + 
				decimalFormat(leastSquaresCoeff[1]))
			.attr("class", "text-label")
			.attr("x", function(d) {return xScale(x2) - 60;})
			.attr("y", function(d) {return yScale(y2) - 30;});
		
		// display r-square on the chart
		Ssvg.append("text")
			.text("r-sq: " + decimalFormat(leastSquaresCoeff[2]))
			.attr("class", "text-label")
			.attr("x", function(d) {return xScale(x2) - 60;})
			.attr("y", function(d) {return yScale(y2) - 10;});

  // draw legend
  var legend = Ssvg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})
};

//from http://bl.ocks.org/benvandyke/8459843
// returns slope, intercept and r-square of the line
function leastSquares(xSeries, ySeries) {
		var reduceSumFunc = function(prev, cur) { return prev + cur; };
		
		var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
		var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

		var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
			.reduce(reduceSumFunc);
		
		var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
			.reduce(reduceSumFunc);
			
		var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
			.reduce(reduceSumFunc);
			
		var slope = ssXY / ssXX;
		var intercept = yBar - (xBar * slope);
		var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);
		
		return [slope, intercept, rSquare];
};