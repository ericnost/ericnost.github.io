function initialize(){
	jsAjax();
	jQueryAjax();
	d3Ajax();
};

/* AJAX using JavaScript */
function jsAjax(){
	//define the request
	var ajaxRequest = new XMLHttpRequest();
	//create an event handler for when we get the data
	ajaxRequest.onreadystatechange = function(){
		console.log("readystate is:", ajaxRequest.readyState);
		if (ajaxRequest.readyState === 4){
			//look at the data
			console.log("JS response:", ajaxRequest.response);
			//execute callback function to use the data
			jsCallback(ajaxRequest.response);
		};
	};
	//open and send the AJAX request
	ajaxRequest.open("GET", "data/individualsInPoverty_Nost.geojson", true);
	//set the data type
	ajaxRequest.responseType = "json";
	//send request
	ajaxRequest.send(null);
};

function jsCallback(response){
	//do stuff with data here
	var htmlString = "<hr/><h3>JavaScript Ajax Response</h3>"; //create a header
	htmlString += JSON.stringify(response); //tack data onto header
	var p = document.createElement("p"); //make a para
	p.innerHTML = htmlString; //give para the html
	document.getElementById("content").appendChild(p); // add paragraph to the page
};

/*jQuery AJAX*/
function jQueryAjax(){
	$.ajax("data/individualsInPoverty_Nost.geojson",{
		dataType: "json",
		success: jQueryCallback
	})
}

function jQueryCallback(response){
	//look at the data
	console.log("jQuery response:", response);
	//put the data in the page
	var htmlString = "<hr/><h3>JQ Ajax Response</h3>";
	htmlString += JSON.stringify(response);
	$("#content").append("<p>");
	$("#content p:last").html(htmlString);
}

/*d3 AJAX*/
function d3Ajax(){
	d3.json("data/individualsInPoverty_Nost.geojson", d3Callback);
};

function d3Callback(error, response){
	console.log("d3 data:", response);
	//put it on the page
	var htmlString = "<hr/><h3>d3 Ajax Response</h3>";
	htmlString += JSON.stringify(response);
	d3.select("#content")
		.append("p")
		.html(htmlString);
}

window.onload=initialize();


