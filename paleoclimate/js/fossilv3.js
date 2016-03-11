//global variables

var svg, width100, height100,colorKey,tooltip
var defaultStroke = {"stroke": "black", "opacity": 1} //{"stroke": "red", "stroke-width": ".5px"}
var highlighted = {"opacity": .2}
var flanneryScale;
var u
var format = d3.format("0,000");
var bannerHeight = 30;
var sites, filterTaxa, selections=[], filterWidth, filterHeight, globalData, firstTime=true, color, sitesData = [], years=[], yearlegend=[], commons = [], nameType = "Scientific"
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 100])
    .on("zoom",zoomer);

//begin script when window loads 
window.onload = initialize(); 

//the first function called once the html is loaded 
function initialize(){

  //define width variables
  height100 = window.innerHeight
  width100 = window.innerWidth

  //banner
  var banner = d3.select("body").append("div").attr("class", "banner").text("FossilFinder")

  //create map svg
  svg = d3.select("body").append("svg")
    .style({"height": height100-bannerHeight, "width": width100, "position": "absolute"})
  
  function updateWindow(){
    x = window.innerWidth
    y = window.innerHeight
    svg.style({"width": x, "height": y});
  }
  window.onresize = updateWindow;

  //create map projection
  projection = d3.geo.albers()
  .center([5,39])
  //.rotate([100,0])
  .scale((height100)/3)
  .translate([(width100)/3, (height100-bannerHeight)/2]);

  setMap()

  //set map
  function setMap() {
    var path = d3.geo.path()
      .projection(projection);

    u = svg.append("g")

    queue()
      .defer(d3.json, "data/na.json")
      .await(callback);

      function callback(error, na, epa, borders){
        svg.call(zoom);

        u.selectAll("path")
          .data(topojson.feature(na, na.objects.na).features)
          .enter().append("path")
            .attr("d", path)
            .attr("class", "land")
      }
    }

  //create common names lookup
  d3.csv("data/common.csv", function(data) {
    data.map(function(d){return commons[d.ScientificName] = d.CommonNames})
    escaped(commons)
  });

  function escaped(x){
    return
  }

  d3.csv("data/all.csv", function(data) {
    data.forEach(function(d){
      d.id = d.siteID
      d.lat = +d.lat // convert string to number
      d.long = +d.lng
      d.year = +d.AgeYBP
      d.pollen = +d.pollenPct
      d.site = d.siteName
      d.genus = d.genus
      d.taxa = d.taxonName
      d.alt = +d.altitude
    });

    //make data globally accessible
    globalData = data //pass data off to global variable

    //global attributes for map (color, size)
    filterTaxa = data.map(function(d){return d.taxa}) //array of taxa from data
    filterTaxa = d3.set(filterTaxa).values().sort()//need to eliminate redundancies

    color = d3.scale.category20()
      .domain(filterTaxa)
      //.range(['#edf8e9', '#bdd7e7','#6baed6','#3182bd','#08519c']); //inappropriate color scheme

    filterSelectorCreator()

    locator(data) //rollup sites for mapping

    loadSites(data)
    paleoplaces()
  }) 
 }

 function locator(data){
  //rollup sites
  var allSites = d3.nest() //rollup unique taxa by genus
    .key(function(d) { return d.site})
    .map(data);
  var y = d3.keys(allSites)
  sitesData=[]
  for (p=0; p<y.length;p++){
    var pollen = d3.sum(allSites[y[p]], function(d){return d.pollen})
    var alt =  d3.mean(allSites[y[p]], function(d){return d.alt})
    var taxar = allSites[y[p]].map(function(d){return d.taxa})
    taxar = d3.set(taxar).values().sort()
    if (taxar.length > 1) {var sitecolor ="Multiple taxa"} else {var sitecolor = taxar[0]}
     // if allSites[y[p]] contains more than one kind, color differently
    sitesData.push({"name":y[p], "lat":allSites[y[p]][0].lat, "long":allSites[y[p]][0].long, "pollen":pollen, "alt":alt, "id":allSites[y[p]][0].id, "color": sitecolor})
  }
 }

function filterSelectorCreator(){
  //create a div for the filter controls
  filterWidth = width100/5
  filterHeight = height100/3
  d3.select("body") //or svg?
    .append("div")
    .attr("class", "filterSelector")
    .style({"width": filterWidth+"px", "top": height100/10+"px", "right": "30px"})
  d3.select(".filterSelector") //or svg?
    .append("div")
    .attr("class", "resetter")
    .style({"cursor": "pointer"})
    .html("Reset")
    .on("click", reset)
  d3.select("body").append("div").attr("class", "yearchart").style({"background-color": "#d3d3d3", "top": height100/1.5+"px", "right": "30px", "width": filterWidth*1.5+"px", "height": filterHeight+"px"})
}

function loadSites(data){
  tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-5, 0])
    .html(function(d) {console.log(d);
      return "<span style='color:white'>" + d.name + "<br>Average altitude: "+d.alt+"</span>";
    })
  svg.call(tooltip)

  //for adjusting circle size...
  var max = d3.max(sitesData, function(d) {return d.pollen});
  var flanMax = calcFlanneryRadius(max);
  flanneryScale = d3.scale.linear().domain([0, flanMax]).range([5, 20]);
  sitesData.sort(function(a,b){return b.pollen - a.pollen}) //sort data so 'smaller' sites are drawn last

  sites = svg.append("g")
  sites.selectAll("circle")
    .data(sitesData)
    .enter().append("circle")
    .attr("class", function(d) {return d.id})
    //.attr("id", "")
    .style("fill", function(d){if (firstTime){return "red"} else{return color(d.color)}})
    .style(defaultStroke)
    .attr("cx", function(d) {return projection([d.long, d.lat])[0]; }) 
    .attr("cy", function(d) { return projection([d.long, d.lat])[1]; })
    .attr("r", function(d){if (firstTime){return 3} else{return radiusFlannery(d.pollen)}})
    .on("mouseover", function(d){
      tooltip.show(d);
      highlight(d);
    })
    .on("mouseout", function(d){
      tooltip.hide(d);
      dehighlight(d);
    })
  //shift for being zoomed in
    sites.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("circle").attr("r", function (d){if (firstTime){return 3/zoom.scale()} else{return radiusFlannery(d.pollen)/(zoom.scale())}}).style("stroke-width", 1 / zoom.scale() + "px" )

  //call controls
  setControls(data);
}  
    
function setControls(data){
  console.log(commons)

  //implement color scale switcher here

  //taxa selector. may need to make into global function for reloading...
  d3.select('#filterTaxaSelect').remove()
  var form = d3.select(".filterSelector").append("form").attr("id", "filterTaxaSelect"), j=0;//use j to make default taxa?
  form.append("text")
    .attr("class", "viewerCategory")
    .text("Select Taxa")
  var labels = form.append("select")
    .attr({
      multiple: true,
      size: 8
    })
    .on("change", function(){
      //find selected
      var yyy = this.options
      selections = []
      for (x=0;x<yyy.length;x++){if (yyy[x].selected){selections.push(yyy[x].value)}}

      //reload
      reload(selections) //reload everything selected
    })
    .selectAll("option")
    .data(filterTaxa)
    .enter().append("option")
    .attr({
        type: "option",
        selected: function(d){
          if (selections.includes(d)){return true}
        },
        value: function(d) {return d;}
    })
    .text(function(d){
      if (nameType == "Scientific"){return d}
      else {if (commons[d]){return commons[d]} else {return d}}
    })
  
  //implement common/sci name switcher
  d3.select("#nameSwitch").remove()
  var form = d3.select(".filterSelector").append("form").attr('id', 'nameSwitch'), j=0;//use j to make default taxa?
  form.append("text")
    .attr("class", "viewerCategory")
    .html("<br>Name as:")
  var labels = form.selectAll("span")
    .data(['Scientific', 'Common'])
    .enter().append("span")
  labels.append('input')
    .attr({
        type: "radio",
        name: 'mode',
        value: function(d,i) {return i;}
    })
    .property("checked", function(d) {return d == nameType;})
    .on("click", function(d){
      if (d == "Common"){nameType = "Common"; setControls(data)}
      if (d == "Scientific"){nameType = "Scientific"; setControls(data)}
    })
  labels.append("label").text(function(d) {return d;})

  //year chart 
  var filterYear = data.map(function(d){return d.year})
  yearlegend['upper'] = d3.max(filterYear), yearlegend['lower'] = d3.min(filterYear)
  
  d3.select(".yearchart").selectAll("svg").remove()

  var margin = {top: 10, right: 30, bottom: 10, left: 10}
  var w = filterWidth*1.5 - margin.left - margin.right
  var h = filterHeight - margin.top - margin.bottom

  var maxx = d3.max(filterYear), minx= (firstTime) ? 0 : d3.min(filterYear)

  var x = d3.scale.linear()
    .domain([minx,maxx])
    .range([0,w])

  //programmatically define the number of bins. 5 if filterYear.length >=70, 3 between 20 and 70, 2 if less
  var binnies = (filterYear.length >= 50) ? 7 : 5

  var p2 = d3.layout.histogram()
    .bins(x.ticks(binnies))
    (filterYear)
  //p2.sort(function(a,b){return a.x-b.x})

  var max = d3.max(p2, function(d){return d.y}), min = d3.min(p2, function(d){return d.y})

  //programmatically choose log vs. linear scale?
  var y = d3.scale.log()
    .domain([min+1,max])
    .range([h,0]);
  
  var t = d3.select(".yearchart").append("svg")
    .attr("width", w+margin.left+margin.right)
    .attr("height", h+margin.top+margin.bottom)
   .append('g')
    .attr('transform", "translate(' +margin.left+","+margin.top+")")
  var bar = d3.select('.yearchart').select('svg').selectAll(".bar")
      .data(p2)
    .enter().append('g')
      .attr('class', 'bar')
      .attr("transform", function(d){return "translate("+x(d.x)+","+y(d.y)+")"})
  bar.append('rect')
      .attr('id', function(d){return "r"+d.x})
      .attr("x", -1)
      .attr("width",  (w/binnies)-15)
      .attr("height", function(d){return h-y(d.y)}) //console.log(d); var barh = (h - y(d.y) < 5 && h - y(d.y) > 0) ? 5 : h - y(d.y); return barh
      .style("fill", "#636363")
      .on("mouseover", function(d){
        bar.selectAll("#"+this.id).style({"fill": "blue", "cursor": "pointer"})
      })
      .on("mouseout", function(d){
        bar.selectAll("#"+this.id).style("fill", "#636363")
      })
      .on("click", function(d){
        // reload based on years
        var a = d.x+"-"+(d.x+d.dx)
        years['upper']=d.x+d.dx, years['lower']=d.x
        reload()
      })

  var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(binnies)
    .tickSize(-h)
    .orient("bottom")

  var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(6)
    .orient("right");

  d3.select('.yearchart').select('svg').append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis)
    .selectAll("text")
    .attr("x", 1)
    .style("text-anchor", "start");

  d3.select('.yearchart').select('svg').append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + w + ",0)")
      .call(yAxis);

  legend(selections)

}

function legend(selections){
  var r =[]
  var q = sitesData.map(function(d){return d.color})
  if (q.includes("Multiple taxa")){r.push("Multiple taxa")}
  var legselections = r.concat(selections)
  if (firstTime){legselections = ["All sites"]}

  d3.select(".legend").remove()
  d3.select("#yearleg").remove()
  var l = d3.select(".filterSelector").append('svg').attr("class", "legend").append('g')
  l.selectAll("rect")
      .data(legselections)
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", function(d,i) { return i*16+15 })
      .attr("width", 16) //scale years?
      .attr("height", 16)
      .style("fill", function(d){if (firstTime){return "red"}else {return color(d)}})
  l.selectAll("text")
      .data(legselections)
      .enter()
      .append("text")
      .text(function(d){
        if (nameType == "Scientific"){return d}
        else {if (commons[d]){return commons[d]} else {return d}}
      })
      .attr("x", 16)
      .attr("y", function(d,i){return i*16+30})
  //year legend
  d3.select('.filterSelector').append('text').attr('id', "yearleg").attr('class', 'legend').text("Years selected: "+yearlegend.lower+"-"+yearlegend.upper+" years before present")

}

function reset(){
  selections=filterTaxa; years=[]
  reload()
}
//reload data
function reload (){

  if(firstTime && years.upper){selections=filterTaxa} //if first click is on year chart, everything is selected

  //console.log(filterTaxa,selections, years.upper)
  //reload sites
  svg.selectAll("circle").remove()
  var reload = globalData.filter(function(d){return selections.includes(d.taxa)})
  if (years.upper){
    //
    reload=reload.filter(function(d){
      if (d.year <= years.upper && d.year >= years.lower){return d}
    })
  }//return if in year range
 
  firstTime = false
  locator(reload)//get coordinates
  loadSites(reload) //then load circle creator again...
}

function highlight(data){
  svg.selectAll("circle")
    .transition().duration(500) 
    .style({"opacity": ".2"})
  svg.selectAll("."+data.id) 
    .transition().duration(500) 
    .style({"opacity": "1"})
}

function dehighlight(data){
  svg.selectAll("circle") 
    .transition().duration(500) 
    .style({"opacity": "1"})
};


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

function zoomer() {
  //if (zoom.scale() > 1) {zoomed = true} else {return zoom.translate([0,0]); zoom.scale(1)} //control slippiness for arcgroup

  u.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
  sites.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("circle").attr("r", function (d){if (firstTime){return 3/zoom.scale()} else{return radiusFlannery(d.pollen)/(zoom.scale())}}).style("stroke-width", 1 / zoom.scale() + "px" )

}

function paleoplaces(){
  //d3.range([11500, 12500])
  year = [11500, 12500]
  d3.json("data/neotoma.json", function(sitedata) {

  d3.csv("data/all_pollen_final.csv", function(pollendata) {
    pollendata.forEach(function(d){
      d.Latitude=+d.Latitude
      d.Age =+ d.Age
      d.Pct =+ d.Pct
    });
   
  var sitekeys = sitedata.data.map(function(d){return d.LatitudeNorth}) // sites from nemotoma
  var pollenSites = pollendata.filter(function(d){return sitekeys.includes(d.Latitude)}).filter(function(d){return d.Age > year[0] && d.Age < year[1]}) //all pollen sites
  
  //for (x=0; x<sitekeys.length;x++) {
  var pollenNest = d3.nest()
    .key(function(d) { return d.Taxon})
    .map(pollenSites);
  
  var taxKeys = d3.keys(pollenNest)
  var dump =[]
  for (n=0; n<taxKeys.length; n++){
    console.log(pollenNest[taxKeys[n]])
    mean = d3.mean(pollenNest[taxKeys[n]], function(d){return d.Pct})
    dump[taxKeys[n]] = mean
  }
  console.log(dump)
  //var pollen = d3.mean(allSites[y[p]], function(d){return d.pollen})
  
  //nest data by site again
 // var y = y.filter(function(d){return })//get matches
  //then look back up in the data
  //then nest pollen
  //then do interporlations
  })
  })
}







