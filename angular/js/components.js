var app = angular.module('myApp', ['ui.router']); //makes a call to the Angular API to create our app, configured with the ui.router plug-in

//configure our view router
app.config(function($stateProvider) { 

  //create our different views as objects
  var mainState ={
    name: 'main', //name of the object
    url: '', //url to point to, or that causes this view to be triggered
    component: 'home', //component that works with the data, loads the template
    resolve: { //data to bind to our component
      main: function(Resource) {
        return Resource.getAllData() //make an async call to get our site data from data.json
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
        site: function(main, $stateParams) {
          return main.find(function(site) { 
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
    getAllData: function() {
      return $http.get('data/data.json', { cache: true }).then(function(resp) {
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
      return service.getAllData().then(function (main) {
        return main.find(siteMatchesParam)
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
  bindings: { main: '<' , geoData: '<' }, //make the data we loaded into the view from the factory available to this component
  templateUrl: 'views/home.html', //this is the html that we will plug our data into
  controller: function () {
    console.log(this)
    this.geography = this.geoData.features
    this.data = this.main
    //calculate colors for the circles
    this.data.forEach(function(d){
      var b = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      d.color = "rgba(255," + g + "," + b + ",1)";
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