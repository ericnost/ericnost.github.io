app.filter('vegFilter', function() {      
        return function(input) {
            if (input == "yes") {
                return "data/vegetarian-mark.svg";
            } else { 
                return "";
            }
        };
});
app.filter('veganFilter', function() {      
        return function(input) {
            if (input == "yes") {
                return "data/vegan.svg";
            } else { 
                return "";
            }
        };
});
app.filter('gfFilter', function() {      
        return function(input) {
            if (input == "yes") {
                return "data/gf.png";
            } else { 
                return "";
            }
        };
});