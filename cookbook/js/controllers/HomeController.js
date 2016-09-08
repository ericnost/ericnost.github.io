app.controller('HomeController', ['$scope', 'photos', function($scope, photos) {
	console.log($scope)
  photos.success(function(data) {
    $scope.photos = data;
    for (var x = 0; x<$scope.photos.length; x++){
    	if ($scope.photos[x].url == "") {$scope.photos[x].url = "data/img/default.jpg"} //could be slow; find more efficient way
    	//if ($scope.photos[x].veg == "yes") {$scope.photos[x].veg = "data/vegetarian-mark.svg"}  
    	//if ($scope.photos[x].vegan == "yes") {$scope.photos[x].vegan = "data/vegan.svg"}
    	//if ($scope.photos[x].GF == "yes") {$scope.photos[x].GF = "data/gf.png"} 
    	if ($scope.photos[x].text.length > 150) {$scope.photos[x].textShort = $scope.photos[x].text.slice(0,147)+"..."} else {$scope.photos[x].textShort = $scope.photos[x].text} 
    }

  });

  $scope.checkModel = {
    veg: false,
    vegan: false,
    gf: false
  };

  $scope.checkResults = [];

  $scope.$watchCollection('checkModel', function () {
    $scope.checkResults = [];

    angular.forEach($scope.checkModel, function (value, key) {
      if (value) {
        $scope.checkResults.push(key);
      }
    });
  });
}]);