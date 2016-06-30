$(document).ready(function () {
	var allTexts = ["dg.txt", "nost.txt", "grammatology.txt", "foucault.txt", "marx.txt", "butler.txt", "haraway.txt", "rand.txt", "mandelman.txt", "moose.txt"];
	var k = Math.round((Math.random() * 10));
	var text = allTexts[k];
	var title = ["A Thousand Plateaus: Capitalism and Schizophrenia, Deleuze and Guattari", "Counting on the Environment: Measuring and Marketing Ecosystem Services in Oregon, Nost", "Of Grammatology, Derrida", "The Order of Things, Foucault","The German Ideology, Marx", "Gender Trouble, Butler", "When Species Meet, Haraway", "The Objectivist Ethics, Rand", "Unstrategic Essentialism: material cultures and Hawaiian articulations of indigenity, Mandelman", "Moose"];
	var pic = ["deleuze.jpg", "nost.jpg", "derrida.jpg", "foucault.jpg", "marx.jpg", "butler.jpg", "haraway.jpg", "rand.jpg", "mandelman.jpg", "moose.jpg"];
	var pick = pic[k];
	var delay=20000;
    $.get(text, function (data) {
        var quotes = data.split(".");
        var idx = Math.floor(quotes.length * Math.random());
		var quote = quotes[idx];
        $('div.text').html("\""+quote+".\"");
		});
    setTimeout(function(){
    $("div.source").html(title[k]);
	$("div.pic").html("<img src="+pick+"></img>");
    },delay); 
});
