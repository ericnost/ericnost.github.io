var map;
var keyArray = ["percentLandChange","wellDensitySqMi","hydrocarbonFieldDensity","pipelineDensity","restorationProjectsDensity","permitDensity","leveesNormalizedSQMI", "spoilBanksAreaNormalizedSQMI"];
var expressed = keyArray[0]; 

//begin script when window loads 
window.onload = initialize(); 

//the first function called once the html is loaded 
function initialize(){ 
	setMap(); 
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
	
	//set min and max data values as domain
	color.domain([
		d3.min(csvData, function(d) { return Number(d[expressed]); }),
		d3.max(csvData, function(d) { return Number(d[expressed]); })
	]);
	
	return color; //return the color scale generator
}
	
function choropleth(d, recolorMap){
	
	//get data value
	var value = d.properties[expressed];
	//if value exists, assign it a color; otherwise assign gray
	if (value) {
		return recolorMap(value);
	} else {
		return "#ccc";
	};
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
		.scale(5000) 
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

		var recolorMap = colorScale(csvData);

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
			.append("path") //append elements to svg
			.attr("class", "subbasins") //assign class for additional styling
			.attr("id", function(d) { return d.properties.id })
			.attr("d", path) //project data as geometry in svg
			.style("fill", function(d) { //color enumeration units
				return choropleth(d, recolorMap);
			});
		createDropdown(csvData);
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
			d = d[0].toUpperCase() + d.substring(1,3) + " " + d.substring(3);
			return d
		});
}; 