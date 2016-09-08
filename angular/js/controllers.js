var app = angular.module('SvgMapApp', ['ngRoute'])
	.factory('photos', ['$http', function($http) {
  		return $http.get('data/data.json') //get site data
         .success(function(data) {
           return data;
         })
         .error(function(data) {
           alert("error")
         });
	}])
app.config(function ($routeProvider) { 
    $routeProvider 
      .when('/', { 
        controller: 'MainCtrl', 
        templateUrl: 'views/home.html' 
      }) 
    .when('/photos/:id',{
      controller: 'DetailCtrl',
      templateUrl:'views/photo.html'
    })
    .otherwise({ 
      redirectTo: '/' 
    }); 
  })
app.controller('MainCtrl', function ($scope, $http) {
/*    var states = ["AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", "IL",
        "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
        "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI"mp;mp;mp;mp;mp;mp;mp;mp;mp;mp;mp;mp;mp;, "VA",
        "WA", "WV", "WI", "WY"];*/
        $scope.model = {
          promise: $http.get('data/data.json'),
          somethingelse: 1123
        };
        console.log($scope.model)
    
    /*var dataTemp=[];
     $scope.dummyData ="XXX"
      photos.success(function(data) {
        var sites = data.map(function(d){return d.importer_name})
        angular.forEach(sites, function (site, key) {
	    	var x = data.filter(function(d){return d.importer_name == site})[0];
	    	dataTemp.push(x)
			 });
      });
    $scope.dummyData = dataTemp;
    console.log($scope.dummyData)
    $scope.changeHoverSite = function (site) {  
      $scope.hoverSite = site;              
    }; */
	})
app.controller('DetailCtrl', ['$scope', 'photos', '$routeParams', function ($scope, photos, $routeParams) {
    photos.success(function(data) {
      $scope.detail = data.filter(function(d){return d.importer_name == $routeParams.id})[0]; //access it
    });
  }]);




