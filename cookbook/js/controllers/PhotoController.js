app.controller('PhotoController', ['$scope', 'photos', '$routeParams', function($scope, photos, $routeParams) {

  photos.success(function(data) {
  	console.log($routeParams)
    $scope.detail = data.filter(function(d){console.log(d); return d.title == $routeParams.id})[0]; //access it
    console.log($scope.detail)
    $(".welcome").remove()
  });

}]);