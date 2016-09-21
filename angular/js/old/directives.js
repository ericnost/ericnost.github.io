/* Angular-specific code */
var app = angular.module('myApp', ['ui.router']);


app.config(function($stateProvider) {
  //
  // For any unmatched url, redirect to /state1
 // $urlRouterProvider.when("photos/", "/photos?id");
  //

  var mainState ={
    name: 'main',
    url: '',
   component: 'home',
    resolve: {
      main: function(Resource) {
        return Resource.getAllPeople()
      },
      appPromiseObj2: function(Resource2) { //loads base map
        return Resource2.getApps()
      }
    }
  },
    detailState = {
    name: 'main.viewer',
    url: '/{siteID}',
    component: 'infoPanel',
      resolve: {
        site: function(main, $stateParams) {
          console.log($stateParams)
          return main.find(function(site) { 
            return site.importer_name === $stateParams.siteID;
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

  $stateProvider.state(mainState)
  $stateProvider.state(detailState);
  $stateProvider.state(displayState);
  // Now set up the states
 /* $stateProvider
     .state('display', {
      url: '/photos/:id?show',
      views:{"details": {templateUrl: 
        function ($stateParams){
          var link = $stateParams.show == "Overview" ? 'views/photo.html' : 'views/' + $stateParams.show.toLowerCase() + '.html'
          return link;
        },
        controller: "DetailCtrl"},"main": {templateUrl: "views/home.html", controller: "mainCtrl"}}
    })
    .state('detail', {
      url: '/photos?id',
      views:{"details": {templateUrl: "views/photo.html", controller: "DetailCtrl"},"main": {templateUrl: "views/home.html", controller: "mainCtrl"}}
    })

    .state('index', {
      url: "",
      views:{"main": {templateUrl: "views/home.html", controller: "mainCtrl"}}
      
    })*/
})
app.factory('Resource', function ($http) {
      var service = {
    getAllPeople: function() {
      return $http.get('data/data.json', { cache: true }).then(function(resp) {
        //console.log(resp)
        return resp.data;
      });
    },
    
    getPerson: function(id) {
      function siteMatchesParam(site) {
        console.log(site, id)
        return site.importer_name === id;
      }
      
      return service.getAllPeople().then(function (main) {

        return main.find(siteMatchesParam)
      });
    }
  }
  
  return service;
})

/*app.factory('Resource2', function($http){
  var Resource2 = {};
  Resource2.loadData = function(){
    return $http.get('data/nam.json');
  }

  return Resource2;
})
*/

app.factory('Resource2', function ($http) {
    var appFac = {
        apps: []
    };

    /*
    appFac.getApps1 = function () {
        promiseObj = $http.get('http://localhost:4567/applications')
          .success(function (data) {
           console.log("success calling http");
           angular.copy(data, appFac.apps);
        });
        
        return promiseObj;
    */
        
    appFac.getApps = function () {
        return $http
          //.get('http://localhost:4567/applications')
          .get('data/nam.json')
          .success(function (result) {
           console.log("success calling nam");
           angular.copy(result.data, appFac.apps);
           return appFac.apps
        });
        
        //return promiseObj;
         
    };
    return appFac;
});

app.factory('ECHO', function($http){
  var ECHO = {};
  ECHO.loadData = function(site){
    var link = "https://ofmpub.epa.gov/echo/dfr_rest_services.get_dfr?output=JSON&p_id="+site
    return $http.get(link);
  }

  return ECHO;
})

app.controller('mainCtrl', function ($scope, appPromiseObj) {
     $scope.dummyData = appPromiseObj.data;

     console.log($scope)

     $scope.changeHoverSite = function (site) { 
        $scope.hoverSite = site;              
      };
      
     $scope.siteClick = function (site) {
        window.location = "#/photos?id="+site
     };
 
  })


app.component('home', {
  bindings: { main: '<' , appPromiseObj2: '<' },
  templateUrl: 'views/home.html',
  controller: function () {
    console.log(this)
    this.geography = this.appPromiseObj2.data.features
    this.dummyData = this.main
    this.changeHoverSite = function (site) { 
          this.hoverSite = site;              
        };
    this.siteClick = function (site) {
          window.location = "#/"+site
     }
/*      $scope.dummyData = appPromiseObj.data;

    

     $scope.changeHoverSite = function (site) { 
        $scope.hoverSite = site;              
      };
      
     $scope.siteClick = function (site) {
        window.location = "#/photos?id="+site
     };*/

 
  }//,templateUrl: 'views/home.html'
})
app.component('infoPanel', {
  templateUrl: 'views/photo.html',
     bindings: { site: '<' },      
  controller: function () {
  //console.log($stateParams)
  console.log(this)

    }
  })

app.component('display', {
  templateUrl: 'views/demographics.html',
     bindings: { ej: '<' },      
  controller: function () {
  $(".info").remove()
  console.log(this)

    }
  })
    
app.component('displayDetailedStuff', {
  templateUrl: 
        function ($stateParams){
          var link = $stateParams.show == "Overview" ? 'views/photo.html' : 'views/' + $stateParams.show.toLowerCase() + '.html'
          return link;
        },
           
  controller: function ($http, $scope, $stateParams, Resource, ECHO) {
  //console.log($stateParams)
      Resource.loadData().then(function(result){
        var data = result.data
        $scope.detail = data.filter(function(d){return d.importer_name == $stateParams.id})[0]; //access it
        $scope.id = $stateParams.id
        $scope.show = $stateParams.show
      });
    }
  })

app.controller('DetailCtrl', function ($http, $scope, $stateParams, Resource, ECHO) {
  //console.log($stateParams)

      Resource.loadData().then(function(result){
        var data = result.data
        $scope.detail = data.filter(function(d){return d.importer_name == $stateParams.id})[0]; //access it
        $scope.id = $stateParams.id
        $scope.show = $stateParams.show ? $stateParams.show : null
        if ($stateParams.show == "Enforcement"){console.log("echo");ECHO.loadData($scope.detail.name).then(function(result){
          if (result.data.Results.RCRACompliance.Sources[0].Status){
             $scope.ECHO = result.data.Results.RCRACompliance.Sources[0].Status
          }
            console.log($scope.ECHO)
        });
        }
      });
      
  });

app.controller('ECHOCtrl', function ($http, $scope, $stateParams, Resource, ECHO) {
  //console.log($stateParams)
      Resource.loadData().then(function(result){
        var data = result.data
        $scope.detail = data.filter(function(d){return d.importer_name == $stateParams.id})[0]; //access it
        $scope.id = $stateParams.id
        $scope.show = $stateParams.show ? $stateParams.show : null
        console.log($scope)
      });
      ECHO.loadData($scope.detail.name).then(function(result){
          $scope.ECHO = result.data
          console.log($scope)
      });
  });

app.controller('DisplayCtrl', function ($http, $scope, $stateParams, Resource) {
  console.log($stateParams)
      Resource.loadData().then(function(result){
        var data = result.data
        $scope.detail = data.filter(function(d){return d.importer_name == $stateParams.id})[0]; //access it
        $scope.id = $stateParams.id
        $scope.show = $stateParams.show
      });

  });

        app.directive(
            "bnDigest",
            function() {
                // I bind the JavaScript events to the scope.
                function link( $scope, element, attributes ) {
                    // I determine if the target element is hot.
                    $scope.hoverSite = null;
                    // I activate the element on mouse-enter.
                    element.on('mouseenter',
                        function() {
                            $scope.hoverSite = $scope.$parent.value.importer_name;
                            console.log($scope)
                            // NOTE: By calling the $digest() instead of the more typical
                            // $apply() method, we will only trigger watchers on the local
                            // scope (and its children). We will NOT trigger any watchers
                            // on the parent scope.

                            //find matching div or circle
                              //findmatching div
                            $scope.$digest();
                        }
                    );
                    // I deactivate the element on mouse-leave.
                    element.on('mouseleave',
                        function() {
                            $scope.hoverSite = null;
                            // NOTE: By calling the $digest() instead of the more typical
                            // $apply() method, we will only trigger watchers on the local
                            // scope (and its children). We will NOT trigger any watchers
                            // on the parent scope.
                            $scope.$digest();
                        }
                    );
                }
                // NOTE: By setting scope to TRUE, the directive creates a new child scope
                // that separates it from the parent scope (creating a isolated part of
                // the scope chain).
                return({
                    link: link,
                    restrict: "A",
                    scope: true
                });
            }
        );


/*app.directive ('myField', function ($compile) {
    return {
        templateUrl: "data/us.svg",
        link: function (scope, element, attrs) {
            //console.log(scope.$parent)
            
            var circles = element[0].querySelectorAll('.site');
            angular.forEach(circles, function (path, key) {
                var siteElement = angular.element(path);
                siteElement.attr("sites", "");
                siteElement.attr("dummy-data", "dummyData");
                siteElement.attr("hover-site", "hoverSite");
                $compile(siteElement)(scope);
            }); 
        }
    };
});

app.directive ('sites', function ($compile) {
    return {
        scope: {dummyData: '='},
        link: function (scope, element, attrs) {
           // console.log(scope)
            scope.elementId = element.attr("id");
            scope.siteClick = function () {
                window.location = "#/photos?id="+scope.elementId
            };
            scope.siteMouseOver = function () {  

                scope.hoverSite = scope.elementId       
                element[0].parentNode.appendChild(element[0]); 
            }; 
            scope.siteMouseOut = function () {            
                scope.hoverSite = null  
            }; 
            //console.log(scope)
            //scope.$parent.$parent.model.sites = scope.dummyData
            //console.log(element,scope)
            //console.log(scope.$parent.$parent.model.sites)
            //element.attr("ng-repeat", "site in dummyData")
            element.attr("ng-click", "siteClick()");
            element.attr("ng-mouseover", "siteMouseOver()");
            element.attr("ng-mouseout", "siteMouseOut()");
            element.attr("ng-class", "{active:hoverSite==elementId}");
            element.attr("ng-attr-fill", "{{dummyData[elementId].total_waste | map_colour}}");
            element.attr("ng-attr-cx", "{{dummyData[elementId] | lat}}");
            element.attr("ng-attr-cy", "{{dummyData[elementId] | long}}");
            element.attr("ng-attr-r", "{{dummyData[elementId].total_waste| radius }}");
            element.removeAttr("sites");
            //console.log(scope)
            $compile(element)(scope);
        }
        }
});

app.directive('parentDirective', function(Resource, $compile){
  return {
    restrict: 'E',
    link: function(scope, elem, attrs){
       // console.log(scope,elem)
      Resource.loadData().then(function(result){
        var dataTemp=[]
       var data = result.data 
                var sites = data.map(function(d){return d.importer_name})
                angular.forEach(sites, function (site, key) {
                    var x = data.filter(function(d){return d.importer_name == site})[0];
                    dataTemp[x.importer_name]=x
                });
            scope.dummyData = dataTemp  
            //console.log(scope)


        
        var htm = '<div class="col-md-8 map"><my-field></my-field></div>';
        var compiled = $compile(htm)(scope);
        elem.append(compiled);
      });
    }
  }
})*/