var app = angular.module('myApp', ['ui.router']); //makes a call to the Angular API to create our app, configured with the ui.router plug-in

//configure our view router
app.config(function($stateProvider) { 

  //create our different views as objects
  var mainState ={
    name: 'main', //name of the object
    url: '', //url to point to, or that causes this view to be triggered
    component: 'home', //component that works with the data, loads the template
    resolve: { //data to bind to our component
      data: function(Resource) {
        return Resource.getImporters() //make an async call to get our site data from data.json
      },
      exporters: function(Resource) {
        return Resource.getExporters() //make an async call to get our site data from data.json
      },
      geoData: function(Resource) { 
        return Resource.getGeoData() //loads base map geo data
      }
    }
  },
    detailState = {
    name: 'main.viewer', //create the right hand info panel as an object/child of the main view
    url: '/{siteID}', //point to this url when this view is triggered
    component: 'infoPanel',
      resolve: {
        site: function(data, $stateParams) {
          return data.find(function(site) { 
            return site.importer_name === $stateParams.siteID; //pull only the site data for the site clicked on
          });
        }
      }
  },
    displayState = {
    name: 'main.viewer.display',
    url: '/{detail}',
    component: 'display',
    resolve:{
      ej: function(site, $stateParams){
        return site
        }
      }
  }
  //call the states
  $stateProvider.state(mainState); 
  $stateProvider.state(detailState);
  $stateProvider.state(displayState);
})

//factories make our http requests for us (including local ones) to handle data promises
app.factory('Resource', function ($http) {
  var service = {
    getImporters: function() {
      return $http.get('data/importers.json', { cache: true }).then(function(resp) {
        return resp.data;
      });
    },
    getExporters: function() {
      return $http.get('data/exporters.json', { cache: true }).then(function(resp) {
        return resp.data;
      });
    },
    getGeoData: function() {
      return $http.get('data/nam.json', { cache: true }).then(function(resp) {
        return resp.data;
      });
    },   
    getSite: function(id) {
      function siteMatchesParam(site) {
        return site.importer_name === id;
      }
      return service.getImporters().then(function (main) {
        return data.find(siteMatchesParam)
      });
    }
  }
  return service;
})



/*app.factory('ECHO', function($http){
  var ECHO = {};
  ECHO.loadData = function(site){
    var link = "https://ofmpub.epa.gov/echo/dfr_rest_services.get_dfr?output=JSON&p_id="+site
    return $http.get(link);
  }

  return ECHO;
})*/

app.component('home', {
  bindings: { data: '<' , exporters: '<', geoData: '<' }, //make the data we loaded into the view from the factory available to this component
  templateUrl: 'views/home.html', //this is the html that we will plug our data into
  controller: function () {
    console.log(this)

    this.geography = this.geoData.features
    //this.data = this.main

    //variables for geo calculations
    var width = $(".col-md-8").width()
    var height = $(".map").height()
    var proj = d3.geo.albers() //we call on d3 to make our projections for us.
      .center([0,40])
      .scale(height*2) 
      .translate([width/2, height/2]);
    var path = d3.geo.path().projection(proj);

    //variables for circle size
    var totals = this.data.map(function(d){return d.total_waste}) //get all the total waste values 
    var max = d3.max(totals)
    var sum = d3.sum(totals)
    var flanMax = calcFlanneryRadius(max);
    var flanneryScale = d3.scale.linear().domain([30, flanMax]).range([10, 35]);
    function calcFlanneryRadius(x){
      var flannery = 0.57;
      var log = Math.log(x);
      var r = log * flannery;
      r = Math.exp(r)
      return r
    }

    //calculate paths for basemap
    this.geography.forEach(function(d){
      d.calculatedPath = path(d)
    })

    
    //calculate colors, positions, radii, for the circles, widths for the chart
    this.data.forEach(function(d){
      //colors
      var b = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      d.color = "rgba(255," + g + "," + b + ",1)";

      //positions
      d.x = proj([d.longitude, d.latitude])[0]
      d.y = proj([d.longitude, d.latitude])[1]

      //radii
      d.chartCircle = flanneryScale(calcFlanneryRadius(d.total_waste))/4
      d.mapCircle = flanneryScale(calcFlanneryRadius(d.total_waste))

      //width for bar chart
      var input = Math.floor((d.total_waste/sum)*100) 
      input = input.toString()
      d.barChartWidth = input + "%"
    })

    //calculations for exporters
    this.exporters.forEach(function(d){
      d.color = "#969696"

      //positions
      d.x = proj([d.exporterLONG, d.exporterLAT])[0]
      d.y = proj([d.exporterLONG, d.exporterLAT])[1]

      //radii
      d.chartCircle = flanneryScale(calcFlanneryRadius(d.total_waste))/4 //will need to change flan scale for exporters
      d.mapCircle = flanneryScale(calcFlanneryRadius(d.total_waste))

    })


    //generate functions that we will bind as objects to each data object so that they can be accessed
    this.changeHoverSite = function (site) { 
      this.hoverSite = site;  //make the hover site active         
    };


    this.siteClick = function (site) {
      this.selectedSite = null //clear selected sites
      this.selectedSite = site //make the clicked site selected

      var selection = angular.element(document.getElementsByClassName('mapCircles')) //make all sites white again
      selection.css('fill', "white") 
      
      selection = angular.element(document.getElementsByClassName(site)) //find the site we clicked and color it
      var color = this.data.filter(function(d){return d.importer_name==site})[0]
      color=color.color
      selection.css('fill', color)

      window.location = "#/"+site
     }
  }
})
app.component('infoPanel', {
  templateUrl: 'views/site.html',
  bindings: { site: '<' },      
  controller: function () {
  }
})

app.component('display', {
  templateUrl: 'views/demographics.html',
  bindings: { ej: '<' },      
  controller: function () {
    $(".info").remove() //remove the info panel's previous view and load the demographics view
  }
})