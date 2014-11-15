var keyArray = ["wellDensitySqMi", "pipelineDensity", "permitDensity", "leveesNormalizedSQMI", "spoilBanksAreaNormalizedSQMI"];
var expressed = keyArray[0]; 
var labelArray = {"wellDensitySqMi": "Wells per mi^2", "pipelineDensity": "Pipelines per mi^2", "permitDensity": "Drilling permits per mi^2", "leveesNormalizedSQMI": "Levee length per mi^2", "spoilBanksAreaNormalizedSQMI": "Spoil bank length per mi^2"};
var textKey = {
	"wellDensitySqMi": "Oil wells contribute to land loss through subsidence.",
	"pipelineDensity": "Many offshore drilling operations have laid pipeline through coastal areas", 
	"permitDensity": "Since the 1950s, oil/gas operators have been required to obtain various permits from the state.", 
	"leveesNormalizedSQMI": "The Army Corps of Engineers has built and maintained miles of levees in the region for flood and navigation purposes.", 
	"spoilBanksAreaNormalizedSQMI": "Spoil banks are created from dredging canals. They change an area's hydrological regime, impounding water upgradient and drying soils downgradient."};
var colorize;
var Ssvg;
var chartWidth = 350, chartHeight = 250;

//begin script when window loads 
window.onload = initialize(); 

//the first function called once the html is loaded 

function initialize(){ 
	//landLossChart();
	setMap(); 
	
}; 


//set choropleth map parameters 
function setMap(){

	//map frame dimensions 
	var width = 700; 
	var height = 400; 

	//create a new svg element with the above dimensions 
	var map = d3.select("body") 
		.append("svg") 
		.attr("width", width) 
		.attr("height", height) 
		.attr("class", "map");

	//create Europe Albers equal area conic projection, centered on France 
	var projection = d3.geo.mercator()
		.center([-91.3, 30])
		//.rotate([20, 0])  
		//.parallels([29, 31]) 
		.scale(7550) 
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
		.defer(d3.json, "data/coast.json")
		.defer(d3.json, "data/riversLA.json") //load geometry from topojson
		.await(callback); //trigger callback function once data is loaded 


	function callback(error, csvData, coast, riversLA){

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

		var rivers = map.append("path")
	      .datum(topojson.feature(riversLA, riversLA.objects.riversLA2))
	      .attr("class", "rivers")
	      .attr("d", path);

		var subbasins = map.selectAll(".subbasins")
			.data(topojson.feature(coast, coast.objects.subbasins).features)
			.enter() //create elements
			.append("g")
			.attr("class", "subbasins") //assign class for additional styling
			.append("path") //append elements to svg
			.attr("class", function(d) { return d.properties.id })
			.attr("d", path) //project data as geometry in svg
			.style({"fill": function(d) { //color enumeration units
				return choropleth(d, colorize);
			}, "fill-opacity": .75})
			.on("mouseover", highlight)
			.on("mouseout", dehighlight)
			.on("mousemove", moveLabel);
			/*.append("desc") //append the current color
				.text(function(d) {
					return choropleth(d, colorize);
				});*/
		
		

		menu(csvData);
		setChart(csvData, colorize);
		scatPlot(csvData);
	}; 
};


function menu(csvData) {
    $( ":button")
    	//.css({"position":"absolute", "left":"100px"})
    	//.find(".pipelineDensity")// #wellDensitySqMi, #hydrocarbonFieldDensity, #spoilBanksAreaNormalizedSQMI, #leveesNormalizedSQMI, #permitDensity, #restorationProjectsDensity`")
    	.click( function() {
        	changeAttribute(this.id, csvData);
        	$("#text").html(textKey[this.id]);
        	return false;
      });
  };

/*function createDropdown(csvData){
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
};*/

function setChart(csvData, colorize){

	//create a second svg element to hold the bar chart
	var chart = d3.select("body")
		.append("svg")
		.attr("width", chartWidth + 30)
		.attr("height", chartHeight + 30)
		.attr("class", "chart")
		.append('g')
		 .attr("transform", "translate(" + 30 + "," + 30 + ")");

	//create a text element for the chart title
	var title = chart.append("text")
		.attr("x", 0)
		.attr("y", -15)
		.attr("class", "chartTitle");

	//set bars for each province
	var barz = chart.selectAll(".barz")
		.data(csvData)
		.enter()
		.append("rect")
		.sort(function(a, b){return b[expressed]-a[expressed]})
		.attr("class", function(d){
			return "barz " + d.id;
		})
		.attr("height", chartHeight / csvData.length - 1)
		.on("mouseover", highlight)
		.on("mouseout", dehighlight)
		.on("mousemove", moveLabel);

	//adjust bars according to current attribute
	updateChart(barz, csvData.length, csvData);
};

function colorScale(csvData){
	
	//create quantile classes with color scale
	var color = d3.scale.quantile() //designate quantile scale generator
		.range(['rgb(240,249,232)','rgb(186,228,188)','rgb(123,204,196)','rgb(67,162,202)','rgb(8,104,172)']);
	

	
	var domainArray = [];
	for (var i in csvData){
		domainArray.push(Number(csvData[i][expressed]));
	};
	
	//for equal-interval scale, use min and max expressed data values as domain
	// color.domain([
	// 	d3.min(csvData, function(d) { return Number(d[expressed]); }),
	// 	d3.max(csvData, function(d) { return Number(d[expressed]); })
	// ]);

	//for quantile scale, pass array of expressed values as domain
	color.domain(domainArray);
	
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
	console.log(attribute);

	//change the expressed attribute
	expressed = attribute;
	colorize = colorScale(csvData);
	
	//recolor the map
	d3.selectAll(".subbasins") //select every province
		.select("path")
		.style("fill", function(d) { //color enumeration units
			return choropleth(d, colorize); //->
		})
		/*.select("desc") //replace the color text in each province's desc element
			.text(function(d) {
				return choropleth(d, colorize); //->
			});*/

	//re-sort the bar chart
	var barz = d3.selectAll(".barz")
		.sort(function(a, b){
			return b[expressed]-a[expressed];
		})
		.transition() //this adds the super cool animation
		.delay(function(d, i){
			return i * 45 
		});

	//update bars according to current attribute
	updateChart(barz, csvData.length, csvData);
	Ssvg.remove();
	scatPlot(csvData);
};

function updateChart(barz, numbars, csvData){
	//scale the chart size to fit the largest bar
	var BxScale = d3.scale.linear().range([0, chartWidth]);
  	BxScale.domain([0, d3.max(csvData, function(d) { return Number(d[expressed]); })]);

	//style the bars according to currently expressed attribute
	barz.attr("width", function(d, i){
			return BxScale(Number(d[expressed]));
		})
		.attr("x", 0)
		.attr("y", function(d, i){
			return i * (chartHeight / numbars);
		})
		.style("fill", function(d){
			return choropleth(d, colorize);
		});

	//update chart title
	d3.select(".chartTitle")
		.text(labelArray[expressed]+
			" for each subbasin");
};


function highlight(data){
	console.log(labelArray);
	//json or csv properties
	var props = data.properties ? data.properties : data;
	d3.selectAll("."+props.id) //select the current province in the DOM
		.style({"stroke": "#ffff00", "stroke-width": "5px"}); //set the enumeration unit fill to black


	var labelAttribute = "<h1>"+props[expressed]+"</h1><br><b>"+labelArray[expressed]+"</b><br>"; //label content
	var labelName = props.basinName ? props.basinName : props.BASIN_NAME; //html string for name to go in child div
	
	//create info label div
	var infolabel = d3.select("body")
		.append("div") //create the label div
		.attr("class", "infolabel")
		.attr("id", props.id+"label") //for styling label
		.html(labelAttribute) //add text
		.append("div") //add child div for feature name
		.attr("class", "labelName") //for styling name
		.html(labelName); //add feature name to label
};

function dehighlight(data){
	
	//json or csv properties
	var props = data.properties ? data.properties : data;
	var subb = d3.selectAll("."+props.id); //designate selector variable for brevity
	//var fillcolor = subb.select("desc").text(); //access original color from desc
	subb.style({"stroke": "#000", "stroke-width": "0px"}); //reset enumeration unit to orginal color
	
	d3.select("#"+props.id+"label").remove(); //remove info label
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

/*
function landLossChart() {
// adapted from Mike Bostock's multi-line series graph: http://bl.ocks.org/mbostock/3884955
	var margin = {top: 500, right: 120, bottom: 50, left: 50},
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
		data.forEach(function(d) {
		    d.date = parseDate(d.date);
		  });

		color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));


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
		    .style("font-size", "14px");

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
		    .text(function(d) { return d.name; });
	});
}; */


//adapted from weiglemc scatter plot: http://bl.ocks.org/weiglemc/6185069

function scatPlot(data){
var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 300
    height = 300

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 
var xValue = function(d) { return d[expressed];}, // data -> value
    xScale = d3.scale.linear().range([width, 0]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(1);

// setup y
var yValue = function(d) { return d.landloss;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("right").tickSize(0);


// add the graph canvas to the body of the webpage
Ssvg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "boxplot")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
      .style("font-size", "12px")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", 0)
      .attr("y", -6)
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .text(expressed);

  // y-axis
  Ssvg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + " ,0)")   
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", -10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("% of 1932 land");

  // draw dots
  Ssvg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .attr("class", function(d){
			return "dot " + d.id;
		})
      .style("fill", function(d){
			return choropleth(d, colorize);
		}) 
      .on("mouseover", highlight)
	  .on("mouseout", dehighlight)
      .on("mousemove", moveLabel);

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
		
		/*//make trendline optional...
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
			.attr("stroke-width", 2);
		
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
			.attr("x", 60)
			.attr("y", 10);*/

 /*// draw legend
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
      .text(function(d) { return d;})*/
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