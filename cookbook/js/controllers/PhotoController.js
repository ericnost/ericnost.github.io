app.controller('PhotoController', ['$scope', 'photos', '$routeParams', function($scope, photos, $routeParams) {
//console.log($routeParams)
  photos.success(function(data) {
  	//console.log($routeParams)
    $scope.detail = data.filter(function(d){return d.title == $routeParams.id})[0]; //access it
    //console.log($scope.detail)
  });

}]);