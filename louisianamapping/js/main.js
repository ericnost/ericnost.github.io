var keyArray = ["wellDensitySqMi", "pipelineDensity", "permitDensity", "leveesNormalizedSQMI", "spoilBanksAreaNormalizedSQMI"];
var expressed = keyArray[0]; 
var labelArray = {"wellDensitySqMi": "Wells per sq. mi.", "pipelineDensity": "Pipelines per sq. mi.", "permitDensity": "Drilling permits per sq. mi.", "leveesNormalizedSQMI": "Levee length per sq. mi.", "spoilBanksAreaNormalizedSQMI": "Spoil bank length per sq. mi."};
var textKey = {
	"wellDensitySqMi": "Oil wells contribute to land loss through subsidence.",
	"pipelineDensity": "Many offshore drilling operations have laid pipeline through coastal areas", 
	"permitDensity": "Since the 1950s, oil/gas operators have been required to obtain various permits from the state.", 
	"leveesNormalizedSQMI": "The Army Corps of Engineers has built and maintained miles of levees in the region for flood and navigation purposes.", 
	"spoilBanksAreaNormalizedSQMI": "Spoil banks are created from dredging canals. They change an area's hydrological regime, impounding water upgradient and drying soils downgradient."};
var colorize;
var Ssvg;
var fullWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var fullHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var chartWidth = fullWidth/4, chartHeight = fullHeight/2;


//begin script when window loads 
window.onload = initialize(); 

//the first function called once the html is loaded 

function initialize(){ 
	d3.select("body").append("div")
		.attr("class", "topContent")
	d3.select(".topContent").append("div")
		.attr("class", "map")
	d3.select(".topContent").append("div")
		.attr("class", "bars")
	d3.select(".topContent").append("div")
		.attr("class", "chart")

	d3.select("body").append("hr")
		.attr("id", "topHR")
	d3.select("body").append("hr")
		.attr("id", "midHR")
	d3.select("body").append("hr")
		.attr("id", "bottomHR")

	d3.select("body").append("div")
		.attr("class", "bottomContent")
	d3.select(".bottomContent").append("div")
		.attr("class", "landLossChart")
	d3.select(".bottomContent").append("div")
		.attr("class", "landLossText")
		//.append("text")
		.html("<p>At some point in the past 80 years, every region in the coast has experienced some degree of land loss, with some areas more drastic than others. At points, basins will start to regain land, only to possibly lose it again from increased impacts. One notable exception is the Atchafalay basin, which has steadily been gaining land since coastal restoration came into full force in the 1980s. <a href='http://www.nola.com/environment/index.ssf/2014/07/wax_lake_outlets_growing_wetla.html' target='_blank'>The Wax Lake Delta</a> there has proven a model for the kinds of restoration projects the state wants to invest in.")
	d3.select(".bottomContent").append("div")
		.attr("class", "canalText")
		.html("Canals are at the center of what has been called <a href='http://www.nytimes.com/interactive/2014/10/02/magazine/mag-oil-lawsuit.html?_r=0' target='_blank'>'the most ambitious environmental lawsuit ever.'</a> The levee board responsible for protecting New Orleans has filed suit against nearly 100 oil and gas firms, claiming that they failed to meet the conditions of their environmental permits to fill-in canals after extraction operations ceased. The case of Delacroix has featured prominently in the suit.")
	d3.select(".bottomContent").append("div")
		.attr("class", "canalImg")
		.html("<img src='img/SLFPRAE larger.gif'></img>")
	d3.select(".bottomContent").append("div")
		.attr("id", "map")
	d3.select(".bottomContent").append("div")
		.attr("id", "text")
		.html('Over the past century, the State of Louisiana has permitted hundreds of thousands of wells for extracting oil and gas. While in boom years these wells provided jobs and income to many, not only do modern wells operating today <a href="http://www.npr.org/2014/04/19/304707516/telltale-rainbow-sheens-show-thousands-of-spills-across-the-gulf" target="_blank">impact a variety of ecosystems</a>, old wells <a href="http://harpers.org/archive/2013/11/dirty-south/" target="_blank">have left their own legacy</a>. Many leak, contaminating nearby property, while others have been implicated in the <a href="http://projects.propublica.org/louisiana/" target="_blank">tremendous land loss the state is experiencing</a>. This map shows how many wells were permitted in each parish (or, county) in the state in the past 100 or so years. By clicking on the icons below, you can focus in on a particular "boom."')
	d3.select(".bottomContent").append("div")
		.attr("id", "links")

	wellsMap();
	landLossChart();
	setMap(); 

}; 


//set choropleth map parameters 
function setMap(){

	//map frame dimensions 
	var width = fullWidth*.5; 
	var height = fullHeight/2; 

	//create a new svg element with the above dimensions 
	var map = d3.select(".map") 
		.append("svg") 
		.attr("width", width) 
		.attr("height", height);

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
        	$("#text1").html(textKey[this.id]);
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
	var chart = d3.select(".bars")
		.append("svg")
		.attr("width", chartWidth)
		.attr("height", chartHeight+30)
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
		.attr("height", chartHeight / csvData.length - 10)
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
	var x = d3.event.clientX < window.innerWidth - 30 ? d3.event.clientX+10 : d3.event.clientX-10; 
	//vertical label coordinate
	var y = d3.event.clientY < window.innerHeight - 30 ? d3.event.clientY-250 : d3.event.clientY-250; 
	
	d3.select(".infolabel") //select the label div for moving
		.style("margin-left", x+"px") //reposition label horizontal
		.style("margin-top", y+"px"); //reposition label vertical
};


function landLossChart() {
// adapted from Mike Bostock's multi-line series graph: http://bl.ocks.org/mbostock/3884955
	var margin = {top: 0, right: 120, bottom: 50, left: 50},
	    width = fullWidth*3/4 - margin.left - margin.right,
	    height = fullHeight*.67;

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

	var svg = d3.select(".landLossChart").append("svg")
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
		      .attr("class", "xaxis")
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
}; 


//adapted from weiglemc scatter plot: http://bl.ocks.org/weiglemc/6185069

function scatPlot(data){
var margin = {top: 15, right: 35, bottom: 35, left: 15},
    width = fullWidth*.3
    height = fullHeight/2

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
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(1).tickFormat(d3.format(",0f"));

// setup y
var yValue = function(d) { return d.landloss;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("right").tickSize(0);


// add the graph canvas to the body of the webpage
Ssvg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
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
      .attr("y", 25)
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .text(labelArray[expressed]);

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
      .attr("r", 14)
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

};


function wellsMap(){
	var cities;
	 var slider; 
	 var placeholder; /* placeholder is a global variable to hold the parsed oilgaswells data outside of the .getJSON function */
	 var overlay;
	 
	  var OpenStreetMap_BlackAndWhite = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
	});
	 
	 var map = L.map('map', { 
	    center: [31.14, -91.13],
	 	zoom: 7, 
	 	minZoom: 7,
	 	layers: [OpenStreetMap_BlackAndWhite]
	 	//maxBounds: bounds
	 }); 
 	
	// parish polygons
	var style = {
    "color": "#000",
    "weight": 5,
    "opacity": .1
	};
	
 	$.getJSON("data/parishes.geojson")
 		.done(function(parishdata) { 
		overlay = L.geoJson(parishdata, {
		    style: style
		});
		var overlayToggle = {
		"Parish boundaries": overlay
		};
		L.control.layers(null, overlayToggle, {collapsed: false}).addTo(map);
	});
	
	$.getJSON("data/oilgaswells.geojson")
	 .done(function(data) { 
	 	console.log(data);
	 	var info = processData(data); 
	 	createPropSymbols(info.timestamps, data);
	 	createLegend(info.min,info.max);
	 	createSliderUI(info.timestamps);
	 	placeholder = info.timestamps;
	 }) 
	 .fail(function() { alert("There has been a problem loading the data.")}); 

	//The following code has been adpated from the GEO575 lab file "time-series-prop-map-code"
	function processData(data) {

		var timestamps = [];
		var	min = Infinity;
		var	max = -Infinity;

		for (var feature in data.features) {

			var properties = data.features[feature].properties;

			for (var attribute in properties) {

				if ( attribute != 'id' &&
					 attribute != 'name' &&
					 attribute != 'lat' &&
					 attribute != 'long' )
				{
					if ( $.inArray(attribute,timestamps) ===  -1) {
						timestamps.push(attribute);
					}
					if (properties[attribute] < min) {
						min = properties[attribute];
					}
					if (properties[attribute] > max) {
						max = properties[attribute];
					}
				}
			}
		}
		console.log(min, max, timestamps);
		return {
			timestamps : timestamps,
			min : min,
			max : max
		}
	}  // end processData()
	function createPropSymbols(timestamps, data) {

		cities = L.geoJson(data, {

			pointToLayer: function(feature, latlng) {

				return L.circleMarker(latlng, {

				    fillColor: "#2E2E2E",
				    color: '#2E2E2E',
				    weight: 1,
				    fillOpacity: 0.6,
				     
				}).on({

					mouseover: function(e) {
						this.openPopup();
						this.setStyle({color: 'yellow'});
					},
					mouseout: function(e) {
						this.closePopup();
						this.setStyle({color: '#537898'});

					}
				})				
			}
		}).addTo(map);
		updatePropSymbols(timestamps[timestamps.length-1]);
	} // end createPropSymbols()
	function updatePropSymbols(timestamp) {

		cities.eachLayer(function(layer) {

			var props = layer.feature.properties;
			var	radius = calcPropRadius(props[timestamp]);
			var	popupContent = "<b>" + String(props[timestamp]) + " wells</b><br>" +
							   "in <i>" + props.name + "</i> parish" +
							   "<br>in " + timestamp + "</i>";
			layer.setRadius(radius);
			layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });

		});
	} // end updatePropSymbols
	function calcPropRadius(attributeValue) {

		var scaleFactor = 5,
			area = attributeValue * scaleFactor;

		return Math.sqrt(area/Math.PI);

	} // end calcPropRadius
	function createLegend(min, max) {

		

		function roundNumber(inNumber) {

       		return (Math.round(inNumber/10) * 10);
		}

		var legend = L.control( { position: 'bottomright' } );

		legend.onAdd = function(map) {

			var legendContainer = L.DomUtil.create("div", "legend");
			var	symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
			var	classes = [roundNumber((max/8)), roundNumber((max-min)/2), roundNumber(max)];
			var	legendCircle;
			var	lastRadius = 0;
			var  currentRadius;
			var  margin;

			L.DomEvent.addListener(legendContainer, 'mousedown', function(e) {
				L.DomEvent.stopPropagation(e);
			});

			$(legendContainer).append("<h2 id='legendTitle'>Wells Permitted</h2>");

			for (var i = 0; i <= classes.length-1; i++) {

				legendCircle = L.DomUtil.create("div", "legendCircle");

				currentRadius = calcPropRadius(classes[i]);

				margin = -currentRadius - lastRadius - 2;

				$(legendCircle).attr("style", "width: " + currentRadius*2 +
					"px; height: " + currentRadius*2 +
					"px; margin-left: " + margin + "px" );

				$(legendCircle).append("<span class='legendValue'>"+classes[i]+"<span>");

				$(symbolsContainer).append(legendCircle);

				lastRadius = currentRadius;

			}

			$(legendContainer).append(symbolsContainer);

			return legendContainer;

		};

		legend.addTo(map);
	} // end createLegend()
	function createSliderUI(timestamps) {

		var sliderControl = L.control({ position: 'bottomleft'} );

		sliderControl.onAdd = function(map) {

			slider = L.DomUtil.create("input", "range-slider");

			L.DomEvent.addListener(slider, 'mousedown', function(e) {

				L.DomEvent.stopPropagation(e);

			});


			return slider;
		}

		sliderControl.addTo(map);
		setSlider(timestamps);
		createTemporalLegend(timestamps[timestamps.length-1]);
	} // end createSliderUI()
	function setSlider(timestamps, values){
		values = values || timestamps[timestamps.length-1];
		$(slider)
				.attr({'type':'range', 'max': timestamps[timestamps.length-1], 'min':timestamps[0], 'step': 1,'value': values})
		        .on('input change', function() {
		        	updatePropSymbols($(this).val().toString());
		            $(".temporal-legend").text(this.value);
		        });
		slider.value = values; 	 
	};
	function createTemporalLegend(startTimestamp) {

		var temporalLegend = L.control({ position: 'bottomleft' });

		temporalLegend.onAdd = function(map) {

			var output = L.DomUtil.create("output", "temporal-legend");

			return output;
		}

		temporalLegend.addTo(map);
		$(".temporal-legend").text(startTimestamp);
	};

	/*create bottom nav links*/
	var spacing ="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

	$('<img>',{
    src: "img/coastal.jpg",
    alt: "Delta boom 1960-1990",
    width: "200px",
    height: "100px",
    border: "1px",
    onHover: function(){
    	$(this).css("cursor", "pointer");
    	return false;
    },
    click: function(){ 
    	map.setView([29.68, -90.04], 8);
    	$("#text").html("The period from 1960-1990 was truly the heyday of oil drilling and transportation in the Delta, before offshore platforms came online. However, the boom came at a cost as parishes like Terrebonne and Plaquemines have experienced some of the highest rates of wetland loss due to the industry's canals for laying pipeline and moving equipment");
    	setSlider(placeholder, placeholder[46]);
    	updatePropSymbols(placeholder[46]);
    	$(".temporal-legend").text(placeholder[46]);
    	return false;
    }
	}).appendTo('#links');
	$("#links").append(spacing);

	$('<img>',{
    src: "img/chenier.jpg",
    alt: "Chenier plain boom 1930-1960",
    width: "200px",
    height: "100px",
    border: "1px",
    onHover: function(){
    	$(this).css("cursor", "pointer");
    	return false;
    },
    click: function(){ 
    	map.setView([30.28, -92.34], 8);
    	$("#text").html("The Chenier Plain is where oil was first discovered in Louisiana, in the area around Lake Charles. This area is physically distinct from the Delta region of the coast. Much of the early drilling occured here but the region was later surpassed as Delta wells and offshore wells came online.");
    	setSlider(placeholder, placeholder[16]);
    	updatePropSymbols(placeholder[16]);
    	$(".temporal-legend").text(placeholder[16]);
    	return false;
    }
	}).appendTo('#links');
	$("#links").append(spacing);

	$('<img>',{
    src: "img/shreve.jpg",
    alt: "Shreveport boom 1980-1990",
    width: "200px",
    height: "100px",
    border: "1px",
    onHover: function(){
    	$(this).css("cursor", "pointer");
    	return false;
    },
    click: function(){ 
    	map.setView([32.28, -93.14], 8);
    	$("#text").html("There have been several booms in the area around Shreveport. Indeed, natural gas in the state was first discovered here, with major fields opening up in the 1910s and 20s. During the 80s, gas extraction in the area expanded significantly. It then dropped, but hydraulic fracturing techniques, or fracking, have increased production in more recent years.");
    	setSlider(placeholder, placeholder[66]);
    	updatePropSymbols(placeholder[66]);
    	$(".temporal-legend").text(placeholder[66]);
    	return false;
    }
	}).appendTo('#links');
	$("#links").append(spacing);

	$('<img>',{
    src: "img/undo.jpg",
    alt: "Reset",
    width: "50px",
    height: "50px",
    onHover: function(){
    	$(this).css("cursor", "pointer");
    	return false;
    },
    click: function(){ 
    	map.setView([30.98, -90.94], 7);
    	$("#text").html("This map shows how many wells were permitted in each parish (or, county) in the state in the past 100 or so years. By clicking on the icons below, you can focus in on a particular 'boom.'");
    	setSlider(placeholder, placeholder[placeholder.length-1]);
    	updatePropSymbols(placeholder[placeholder.length-1]);
    	$(".temporal-legend").text(placeholder[placeholder.length-1]);
    	return false;
    }
	}).appendTo('#links');

};