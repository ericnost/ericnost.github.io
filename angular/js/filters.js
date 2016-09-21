angular.module('myApp').filter('projection', [function () {
    return function (input) {
      var width = $(".col-md-8").width()
      var height = $(".map").height()
      var proj = d3.geo.albers() //we call on d3 to make our projections for us.
        .center([0,40])
        //.rotate([100,0])
        .scale(height*2) 
        .translate([width/2, height/2]);
      var path = d3.geo.path().projection(proj);
      return path(input)
    }
}]);

angular.module('myApp').filter('coords', [function () {
    return function (input, type) {
      var width = $(".col-md-8").width()
      var height = $(".map").height()
      var proj = d3.geo.albers()
        .center([0,40])
        //.rotate([100,0])
        .scale(height*2) 
        .translate([width/2, height/2]);
      var accessor = type == "lat" ? 0 : 1
      return proj([input.longitude, input.latitude])[accessor]
    }
}]);

angular.module('myApp').filter("radius", [function(){
    return function (input, type) {
      //console.log(input)
      var flanMax = calcFlanneryRadius(44673759); //change dynamically to max
      var flanneryScale = d3.scale.linear().domain([30, flanMax]).range([10, 35]);
      function calcFlanneryRadius(x){
        var flannery = 0.57;
        var log = Math.log(x);
        var r = log * flannery;
        r = Math.exp(r)
        return r
      }
      var accessor = type == "map" ? 1:4
      return flanneryScale(calcFlanneryRadius(input))/accessor;
    }
}]);


angular.module('myApp').filter("bar", [function(){
    return function (input) {
      //console.log(input)
      input = Math.floor((input/143578771)*100) //change dynamically to max
      input = input.toString()
      input = input + "%"
      return input
      }
}]);

angular.module('myApp').filter("barDetail", [function(){
    return function (input, total) {
     // console.log(input, total)
      input = Math.floor((input/total)*100)
      input = input.toString()
      input = input + "%"
      return input
      }
}]);




