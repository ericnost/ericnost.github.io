angular.module('myApp').filter('map_colour', [function () {
    return function (input) {
     // console.log(input)
        var b = Math.floor(Math.random() * 255); //console.log(b,input)
        var g = Math.floor(Math.random() * 255);
        return "rgba(255," + g + "," + b + ",1)";
    }
}]);

angular.module('myApp').filter('projection', [function () {
    return function (path) {
             var width = $(".map").width()
        var height = $(".map").height()
      
       var proj = d3.geo.albers()
          .center([0,40])
          //.rotate([100,0])
          .scale(height*2) 
          .translate([width/2, height/2]);
        var pathz = d3.geo.path().projection(proj);
          return pathz(path)
    }
}]);

angular.module('myApp').filter('lat', [function () {
    return function (input) {

      var width = $(".map").width()
      var height = $(".map").height()

      var projection = d3.geo.albers()
       // .center([0,40])
        //.rotate([100,0])
        .scale(height*2) //491, 578 . at 578, 750 is fine. at 491, not so much.
        .translate([width/2, height/2]);

      return projection([input.longitude, input.latitude])[0]
    }
}]);

angular.module('myApp').filter('long', [function () {
    return function (input) {

      var width = $(".map").width()
      var height = $(".map").height()

      var projection = d3.geo.albers()
        .center([0,40])
        //.rotate([100,0])
        .scale(height*2) //491, 578 . at 578, 750 is fine. at 491, not so much.
        .translate([width/2, height/2]);

      return projection([input.longitude, input.latitude])[1]
    }
}]);

angular.module('myApp').filter("radius", [function(){
    return function (input) {
      //console.log(input)
      var flanMax = calcFlanneryRadius(40000000); //change 10,000 dynamically to max
      var flanneryScale = d3.scale.linear().domain([30, flanMax]).range([10, 35]);
      function calcFlanneryRadius(x){
        var flannery = 0.57;
        var log = Math.log(x);
        var r = log * flannery;
        r = Math.exp(r)
        return r
      }
      return (flanneryScale(calcFlanneryRadius(input)));
    }
}]);

angular.module('myApp').filter("radiusSmall", [function(){
    return function (input) {
      //console.log(input)
      var flanMax = calcFlanneryRadius(40000000); //change 10,000 dynamically to max
      var flanneryScale = d3.scale.linear().domain([30, flanMax]).range([10, 35]);
      function calcFlanneryRadius(x){
        var flannery = 0.57;
        var log = Math.log(x);
        var r = log * flannery;
        r = Math.exp(r)
        return r
      }
      return flanneryScale(calcFlanneryRadius(input))/4;
    }
}]);

angular.module('myApp').filter("bar", [function(){
    return function (input) {
      //console.log(input)
      input = Math.floor((input/143578771)*100) //change 10,000 dynamically to max
      input = input.toString()
      input = input + "%"
      return input
      }
}]);

angular.module('myApp').filter("barDetail", [function(){
    return function (input) {
      //console.log(input)
      input = Math.floor((input.value/input.detail.total_waste)*100) //change 10,000 dynamically to max
      input = input.toString()
      input = input + "%"
      return input
      }
}]);




