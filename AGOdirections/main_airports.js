L.control.locate({locateOptions: {enableHighAccuracy: true}}).addTo(map);	

//no editing needed in this section, just edit csv file with airport's markers		
var markersLayer = omnivore.csv(data)
	.on('ready', function(layer) {

        this.eachLayer(function(marker) {
       		var title = marker.toGeoJSON().properties.title,
        		type = marker.toGeoJSON().properties.type,
				icon = marker.toGeoJSON().properties.iconURL,
				desc = marker.toGeoJSON().properties.description,
				image = marker.toGeoJSON().properties.imageBelow,
				popupImg = marker.toGeoJSON().properties.image;
				latlng = marker.toGeoJSON().properties.latlng;
				
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
						document.getElementById("directionsButton").innerHTML = "";
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
						document.getElementById("directionsButton").innerHTML = "";
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
						document.getElementById("directionsButton").innerHTML = "";
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
						document.getElementById("directionsButton").innerHTML = "";
						document.getElementById("mainText").innerHTML = desc;
						document.getElementById("mainImg").innerHTML = "";
       				});                	
       				
       				}                   
        	});
        
    });

//add layers to initial map view, can turn off if there are too many markers      
markersLayer.addTo(map);


map.on('zoomend', function () {
if (map.getZoom() > 15 && map.hasLayer(markersLayer) == false) {
    map.addLayer(markersLayer);
}
if (map.getZoom() < 16 && map.hasLayer(markersLayer))
{
    map.removeLayer(markersLayer);
}   
}); 
