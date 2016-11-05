markers = L.markerClusterGroup({disableClusteringAtZoom: 2}); 
L.control.locate({locateOptions: {enableHighAccuracy: true}}).addTo(map);	
	
if (seaportData === undefined){

} else {

	var seaportLayer = omnivore.csv(seaportData)
	.on('ready', function(layer) {
		
		
        this.eachLayer(function(marker) {
        	var title = marker.toGeoJSON().properties.title,
        		type = marker.toGeoJSON().properties.type,
				icon = marker.toGeoJSON().properties.iconURL,
				desc = marker.toGeoJSON().properties.description,
				image = marker.toGeoJSON().properties.imageBelow,
				popupImg = marker.toGeoJSON().properties.image,
				googleLink = marker.toGeoJSON().properties.google_maps;

			marker._leaflet_id = marker.feature.properties.title

        	if (marker.toGeoJSON().properties.type === 'Airport') {
        			marker.setIcon(L.icon({
        				'iconUrl': icon,
                    	'iconSize': [124, 27]
                    })),
                	marker.bindPopup("<img id='popupImg' src='"+popupImg+"'/> <p id='popupTxt'>" +title+"<br><br><a href='http://airguideonline.com/airport-guide/miami-international-airport-mia/' target='_blank'>Go to MIA airport map</a></p>");
            } else if (type === 'featured'){
                    
                marker.setIcon(L.icon({
                    'iconUrl': icon,
                    'iconAnchor': [13, 13],
                    'popupAnchor': [0, -10],
                    'iconSize': [26, 26]                 	
                })),
                
                marker.on('click', function(){
                	$('#popupModal').modal('show');
        			document.getElementById("iconImg").innerHTML = "<img src='"+icon+"' height='26px' width='26px'></img>";	
                	document.getElementById("titleText").innerHTML = title;
					document.getElementById("address").innerHTML = "";
					document.getElementById("urlLink").innerHTML = "";
					document.getElementById("telLink").innerHTML = "";
					document.getElementById("directionsButton").innerHTML = googleLink+"<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
					document.getElementById("mainText").innerHTML = desc;
					document.getElementById("mainImg").innerHTML = "<img   src='"+image+"'></img>";
        		});

            } else {
                    
                marker.setIcon(L.icon({
            		'iconUrl': icon,
              		'iconAnchor': [13, 13],
            		'popupAnchor': [0, -10],
                    'iconSize': [26, 26]
                    	
                })),
				
				marker.on('click', function(){
					$('#popupModal').modal('show');
        			document.getElementById("iconImg").innerHTML = "<img src='"+icon+"' height='26px' width='26px'></img>";	
                	document.getElementById("titleText").innerHTML = title;
					document.getElementById("address").innerHTML = "";
					document.getElementById("urlLink").innerHTML = "";
					document.getElementById("telLink").innerHTML = "";
					document.getElementById("directionsButton").innerHTML = googleLink+"<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
					document.getElementById("mainText").innerHTML = desc;
					document.getElementById("mainImg").innerHTML = "";
        		});                	                   
        	}
        });
        
        
        markers.addLayer(seaportLayer);
    });



}

if (cityData === undefined){

} else {
	//no editing needed in this section, just edit csv file with airport's markers		
	wcitiesLayer = omnivore.csv(cityData)
	active = wcitiesLayer //set wcitieslayer as default
	
	.on('ready', function(layer) {
		this.eachLayer(function(marker) {
			var title = marker.toGeoJSON().properties.title,
				cat = marker.toGeoJSON().properties.Category,
				icon = marker.toGeoJSON().properties.icon_image,
				desc = marker.toGeoJSON().properties.Long_Desc,
				phone = marker.toGeoJSON().properties.Phone,
				url = marker.toGeoJSON().properties.Url,
				address = marker.toGeoJSON().properties.Address1,
				image = marker.toGeoJSON().properties.lres_image,
				googleLink = marker.toGeoJSON().properties.google_maps;
				

			marker._leaflet_id = marker.feature.properties.title

			if (phone !== "" && url !==""){
				marker.setIcon(L.icon({
        			'iconUrl': icon,
            		'iconSize': [26, 26]
        		})),
        		
				marker.on('click', function(){
					$('#popupModal').modal('show');
        			document.getElementById("iconImg").innerHTML = "<img src='"+icon+"' height='26px' width='26px'></img>";	
					document.getElementById("titleText").innerHTML = title;
					document.getElementById("address").innerHTML = address;
					document.getElementById("urlLink").innerHTML = "<p id=urlLink>Website: <a href='"+url+"'target='_blank'>"+url+"</a></p>";
					document.getElementById("telLink").innerHTML = "<p id=urlLink>Phone: <a href='tel:"+phone+"'target='_blank'>"+phone+"</a></p>";
					document.getElementById("directionsButton").innerHTML = googleLink+"<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
					document.getElementById("mainText").innerHTML = desc;
					document.getElementById("mainImg").innerHTML = "<img   src='"+image+"'></img>";
				});
    		
    		}else if (phone !== ""){
    			marker.setIcon(L.icon({
        			'iconUrl': icon,
            		'iconSize': [26, 26]
        		})),
				marker.on('click', function(){
					$('#popupModal').modal('show');
        			document.getElementById("iconImg").innerHTML = "<img src='"+icon+"' height='26px' width='26px'></img>";	
					document.getElementById("titleText").innerHTML = title;
					document.getElementById("address").innerHTML = address;
					document.getElementById("urlLink").innerHTML = "";
					document.getElementById("telLink").innerHTML = "<p id=urlLink>Phone: <a href='tel:"+phone+"'target='_blank'>"+phone+"</a></p>";
					document.getElementById("directionsButton").innerHTML = googleLink+"<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
					document.getElementById("mainText").innerHTML = desc;
					document.getElementById("mainImg").innerHTML = "<img   src='"+image+"'></img>";
				});
    		
    		}else if (url !== ""){
    			marker.setIcon(L.icon({
        			'iconUrl': icon,
            		'iconSize': [26, 26]
        		})),
				marker.on('click', function(){
					$('#popupModal').modal('show');
        			document.getElementById("iconImg").innerHTML = "<img src='"+icon+"' height='26px' width='26px'></img>";	
					document.getElementById("titleText").innerHTML = title;
					document.getElementById("address").innerHTML = address;
					document.getElementById("urlLink").innerHTML = "<p id=urlLink>Website: <a href='"+url+"'target='_blank'>"+url+"</a></p>";
					document.getElementById("telLink").innerHTML = "";
					document.getElementById("directionsButton").innerHTML = googleLink+"<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
					document.getElementById("mainText").innerHTML = desc;
					document.getElementById("mainImg").innerHTML = "<img   src='"+image+"'></img>";
				});
			}else{
    			marker.setIcon(L.icon({
        			'iconUrl': icon,
            		'iconSize': [26, 26]
        		})),
				marker.on('click', function(){
					$('#popupModal').modal('show');
        			document.getElementById("iconImg").innerHTML = "<img src='"+icon+"' height='26px' width='26px'></img>";	
					document.getElementById("titleText").innerHTML = title;
					document.getElementById("address").innerHTML = address;
					document.getElementById("urlLink").innerHTML = "";
					document.getElementById("telLink").innerHTML = "";
					document.getElementById("directionsButton").innerHTML = googleLink+"<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
					document.getElementById("mainText").innerHTML = desc;
					document.getElementById("mainImg").innerHTML = "<img   src='"+image+"'></img>";
				});
    		}			    	
    	
    	});
    	
        markers.addLayer(wcitiesLayer);
        
    });

}


if (airportData === undefined){

} else {
	//no editing needed in this section, just edit csv file with airport's markers		
	var airportLayer = omnivore.csv(airportData)
	.on('ready', function(layer) {
        this.eachLayer(function(marker) {
       		var title = marker.toGeoJSON().properties.title,
        		type = marker.toGeoJSON().properties.type,
				icon = marker.toGeoJSON().properties.iconURL,
				desc = marker.toGeoJSON().properties.description,
				image = marker.toGeoJSON().properties.imageBelow,
				popupImg = marker.toGeoJSON().properties.image;
				latlng = marker.toGeoJSON().properties.latlng;
				
				marker._leaflet_id = marker.feature.properties.title
				
        		if (type === 'Security Checkpoint') {
        			marker.setIcon(L.icon({
        				'iconUrl': icon,
        				'popupAnchor': [0, -10],
                    	'iconSize': [29, 29]
                    })),
					marker.on('click', function(){
						$('#popupModal').modal('show');
        				document.getElementById("iconImg").innerHTML = "<img src='"+icon+"' height='26px' width='26px'></img>";	
                		document.getElementById("titleText").innerHTML = title;
						document.getElementById("address").innerHTML = "";
						document.getElementById("urlLink").innerHTML = "";
						document.getElementById("telLink").innerHTML = "";
						document.getElementById("directionsButton").innerHTML = "<a href='https://www.google.com/maps/dir/Current+Location/" +latlng+ "'target='_blank'>Get directions</a><span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
						document.getElementById("mainText").innerHTML = desc;
						document.getElementById("mainImg").innerHTML = "";
        			});     
        			           	                    
                    } else if (type === 'Gate'){
                    
                		marker.setIcon(L.divIcon({
                    		'className': "gateLabels",
                    		'html': title                    	
                		}));    
  
                	} else if (type === 'Airline Club'){
                    
                		marker.setIcon(L.icon({
                    		'iconUrl': icon,
                    		'iconAnchor': [13, 13],
                    		'popupAnchor': [0, -10],
                    		'iconSize': [26, 26]                 	
                		})),
                		marker.on('click', function(){
						$('#popupModal').modal('show');
                		document.getElementById("iconImg").innerHTML = "<img src='"+popupImg+"' ></img>";	
               			document.getElementById("titleText").innerHTML = title;
						document.getElementById("address").innerHTML = "";
						document.getElementById("urlLink").innerHTML = "";
						document.getElementById("telLink").innerHTML = "";
						document.getElementById("directionsButton").innerHTML = "<a href='https://www.google.com/maps/dir/Current+Location/" +latlng+ "'target='_blank'>Get directions</a><span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
						document.getElementById("mainText").innerHTML = desc;
						document.getElementById("mainImg").innerHTML = "";
                	});	   
                	} else if (marker.toGeoJSON().properties.type === 'featured'){
                    
                		marker.setIcon(L.icon({
                    		'iconUrl': marker.toGeoJSON().properties.iconURL,
                    		'iconAnchor': [13, 13],
                    		'popupAnchor': [0, -10],
                    		'iconSize': [26, 26]                 	
                		})),
					marker.on('click', function(){
						$('#popupModal').modal('show');
        				document.getElementById("iconImg").innerHTML = "<img src='"+popupImg+"'max-width='100px' padding-bottom='5px'></img>";	
               			document.getElementById("titleText").innerHTML = title;
						document.getElementById("address").innerHTML = "";
						document.getElementById("urlLink").innerHTML = "";
						document.getElementById("telLink").innerHTML = "";
						document.getElementById("directionsButton").innerHTML = "<a href='https://www.google.com/maps/dir/Current+Location/" +latlng+ "'target='_blank'>Get directions</a><span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
						document.getElementById("mainText").innerHTML = desc;
						document.getElementById("mainImg").innerHTML = "<img   src='"+image+"'></img>";
       				});  
       				              		 
      	            } else {
                    
                		marker.setIcon(L.icon({
                    		'iconUrl': marker.toGeoJSON().properties.iconURL,
                    		'iconAnchor': [13, 13],
                    		'popupAnchor': [0, -10],
                    		'iconSize': [26, 26]
                    	
                		})),
					marker.on('click', function(){
						$('#popupModal').modal('show');
        				document.getElementById("iconImg").innerHTML = "<img src='"+icon+"' height='26px' width='26px'></img>";	
               			document.getElementById("titleText").innerHTML = title;
						document.getElementById("address").innerHTML = "";
						document.getElementById("urlLink").innerHTML = "";
						document.getElementById("telLink").innerHTML = "";
						document.getElementById("directionsButton").innerHTML = "<a href='https://www.google.com/maps/dir/Current+Location/" +latlng+ "'target='_blank'>Get directions</a><span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
						document.getElementById("mainText").innerHTML = desc;
						document.getElementById("mainImg").innerHTML = "";
       				});                	
       				
       				}                   
        	});
        
      markers.addLayer(airportLayer);
        
        
    });

}

map.addLayer(markers);
	
var controlSearch = new L.Control.Search({layer: markers, initial: false});

map.addControl( controlSearch );

