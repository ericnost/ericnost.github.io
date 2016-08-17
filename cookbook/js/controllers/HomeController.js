app.controller('HomeController', ['$scope', 'photos', function($scope, photos) {
  photos.success(function(data) {
    $scope.photos = data;
    for (var x = 0; x<$scope.photos.length; x++){
    	if ($scope.photos[x].url == "") {$scope.photos[x].url = "data/img/default.jpg"} //could be slow; find more efficient way
    }
  });
}]);