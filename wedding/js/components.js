var app = angular.module('GalleryApp', ['ui.router', 'ui.bootstrap']);

app.config(function($stateProvider) { 
  //create our different views as objects
  var mainState ={
    name: 'home', //name of the object
    url: '/', //url to point to, or that causes this view to be triggered
    component: 'home'
  },directionsState = {
    name: 'directions', //create the right hand info panel as an object/child of the main view
    url: '/directions', //point to this url when this view is triggered
    component: 'directions'
  },hotelState = {
    name: 'hotel', //create the right hand info panel as an object/child of the main view
    url: '/hotel', //point to this url when this view is triggered
    component: 'hotel'
  },giftsState = {
    name: 'gifts', //create the right hand info panel as an object/child of the main view
    url: '/gifts', //point to this url when this view is triggered
    component: 'gifts'
  }
  //call the states
  $stateProvider.state(mainState); 
  $stateProvider.state(directionsState);
  $stateProvider.state(hotelState);
  $stateProvider.state(giftsState);
})


app.component('home', {
  bindings: { data: '<'}, //make the data we loaded into the view from the factory available to this component
  templateUrl: 'views/home.html', //this is the html that we will plug our data into
  controller: function () {
    console.log(this)
    /*this.data.forEach(function(d,i){
      if (d.url == "") {d.url = "data/img/default.jpg"}
        //change all this in the data
        var bg = d.speciality.toLowerCase() == "yes" ? "#ccac00" : "#445768" 
        d.bg = bg
        d.speciality = d.speciality.toLowerCase() == "yes" ? true : false
        if (d.veg.toLowerCase() == "yes") {d.veg = true} else if (d.veg.toLowerCase() == "no" || d.veg == "") {d.veg = false}
        if (d.vegan.toLowerCase() == "yes") {d.vegan = true} else if (d.vegan.toLowerCase() == "no"|| d.vegan == "") {d.vegan = false}
        if (d.GF.toLowerCase() == "yes") {d.GF = true} else if (d.GF.toLowerCase() == "no"|| d.GF == "") {d.GF = false}
        d.textSearch = d.text
      if (d.text) {d.text = d.text.split(/\r\n|\r|\n/g);} else {d.text = [" ","Recipe coming soon!"]}
      d.author = d.author.length > 0 ? d.author : "Not Available..."
      d.title = ucFirstAllWords(d.title)
      d.season = ucFirstAllWords(d.season)
    
    })

    function ucFirstAllWords( str )
    {
        var pieces = str.split(" ");
        for ( var i = 0; i < pieces.length; i++ )
          {
              var j = pieces[i].charAt(0).toUpperCase();
              pieces[i] = j + pieces[i].substr(1);
          }
        return pieces.join(" ");
    }

    this.checkModel = {
      veg: false,
      vegan: false,
      gf: false
    };

    $('#seasonUL li a').on('click', function(){
      var x = $(this).html()
      $('#season').html(x+" <span class='caret'></span>");
    });
    $('#mealUL li a').on('click', function(){
      var x = $(this).html()
      $('#meal').html(x+" <span class='caret'></span>");
    }); //#ffd700
    
    this.w = window.innerWidth < 500 ? "100%" : "50%"

    var checkGlobal=this.checkModel
    this.filterStuff=function(recipe){
      //console.log(recipe, checkGlobal)
     if (checkGlobal.veg == false && checkGlobal.vegan == false && checkGlobal.gf == false){return recipe}
      else if (checkGlobal.veg == true && checkGlobal.vegan == false && checkGlobal.gf == false){return recipe.veg}
      else if (checkGlobal.veg == false && checkGlobal.vegan == true && checkGlobal.gf == false){return recipe.vegan}
      else if (checkGlobal.veg == true && checkGlobal.vegan == true && checkGlobal.gf == false){return recipe.veg && recipe.vegan}
        else if (checkGlobal.veg == false && checkGlobal.vegan == false && checkGlobal.gf == true){return recipe.GF}
      else if (checkGlobal.veg == true && checkGlobal.vegan == false && checkGlobal.gf == true){return recipe.veg && recipe.GF}
        else if (checkGlobal.veg == false && checkGlobal.vegan == true && checkGlobal.gf == true){return recipe.vegan && recipe.GF}
      else if (checkGlobal.veg == true && checkGlobal.vegan == true && checkGlobal.gf == true){return  recipe.veg && recipe.vegan && recipe.GF}
      //return recipe.title.includes("Quick")
    }
    this.button = "Filter by season";
    this.actions = [
      "Fall", "Winter", "Spring", "Summer"
    ];
    this.change = function(name){
      this.button = name;
    }

    this.checkResults = [];
    this.changer = function(clicked){
      console.log(this)
      var dump = this.checkModel[clicked]
      this.checkModel[clicked] = dump
    }

    this.$watchCollection("checkModel",function () {
      this.checkResults = [];

      angular.forEach(this.checkModel, function (value, key) {
        if (value) {
          console.log(value)
          this.checkResults.push(key);
        }
      });
    })*/
  }
});


app.component('directions', {
  templateUrl: 'views/directions.html',
  bindings: { data: '<' },      
  controller: function () {
    console.log(this)
    //banner click to return to
  }
})
app.component('hotel', {
  templateUrl: 'views/hotel.html',
  bindings: { data: '<' },      
  controller: function () {
    console.log(this)
    //banner click to return to
  }
})
app.component('gifts', {
  templateUrl: 'views/gifts.html',
  bindings: { data: '<' },      
  controller: function () {
    console.log(this)
    //banner click to return to
  }
})

