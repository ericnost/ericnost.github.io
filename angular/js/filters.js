angular.module('myApp').filter("barDetail", [function(){
    return function (input, total) {
     // console.log(input, total)
      input = Math.floor((input/total)*100)
      input = input.toString()
      input = input + "%"
      return input
      }
}]);




