$(document).ready(function () {
    var slide = ["Background", "Conclusion", "Me in the field", "Research subjects", "Conclusions", "Introduction", "Theory", "Study site", "Methods", "Discussion", "Literature Review", "Context", "Interviews", "Methodology", "Results", "What I learned", "Acknowledgments"];
    var minlat = Math.round((Math.random() * 60)) + 1;
    var maxlat = minlat + 3;
    var minlon = Math.round((Math.random() * 130)) + 1;
    var maxlon = minlon + 5;
	var marklat = minlat + 1.5;
	var marklon = minlon + 2.5;
    var bbox = "" + minlon + "%2C" + minlat + "%2C" + maxlon + "%2C" + maxlat + "";
    var i = Math.round((Math.random() * 10));
    var j = Math.round((Math.random() * 17));
    var url = "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6189c0a953c20fb21c515b2fbc4b6879&bbox=" + bbox + "&format=json&jsoncallback=?";
    var moose = "http://i167.photobucket.com/albums/u154/imhch/cid.jpg";
	var map = "http://maps.googleapis.com/maps/api/staticmap?size=300x300&key=AIzaSyAV21sw7AxSaii7Bo1qxyT7qTkHM8fgPeo&scale=1&zoom=6&maptype=roadmap&markers=color:blue%7Clabel:BnL%7C"+marklat+","+ marklon +"&sensor=false"
    var pic;
    var item;
	var allTexts = ["dg.txt", "nost.txt", "grammatology.txt", "foucault.txt", "marx.txt", "butler.txt", "haraway.txt", "rand.jpg"];
	var k = Math.round((Math.random() * 8));
	var text = allTexts[k];
	var TUrl = "https://api.twitter.com/1.1/search/tweets.json?q=%20&geocode=43%2C-89%2C10mi";
    //$("div.bug1").html(url);
    $("div.slide-title").html(slide[j]);
    $.getJSON(url, function (data) {
        //$("div.bug2").html(data.photos.photo.length);
        item = data.photos.photo[i];
        if (data.photos.photo.length < i) {
			$("div.images").html("<img src="+moose+"</img>");
        };
        if (data.photos.photo.length > i){
            pic = "http://farm" + item.farm + ".static.flickr.com/" + item.server + "/" + item.id + "_" + item.secret + ".jpg";
			//$("div.bug3").html(pic);
			$("div.images").html("<img src="+pic+"></img>");
			$("div.map").html("<img src="+map+"></img>");
        };
    });
    $.get(text, function (data) {
        var quotes = data.split(".");
        var idx = Math.floor(quotes.length * Math.random());
		var quote = quotes[idx];
        $('div.text').html("\""+quote+".\"");
    });
});