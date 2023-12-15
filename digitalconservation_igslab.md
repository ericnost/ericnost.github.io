---

layout: default
title: Digital Conservation - Guelph's Informal Green Spaces Lab

---
Informal greenspaces (IGS) are outdoor places people use for recreational purposes, but which aren’t formally protected as parks. In the context of an urban area, this may include a variety of private and public land that is not designated as a city park, conservation authority land that isn’t meant for recreational uses, and so on.

Determining where informal greenspaces are may help to identify places that need to be protected since these are often at risk to development in ways that certain areas – e.g. Greenbelt zones areas – aren’t (not to say Greenbelt areas are well-protected!) In a world where the COVID pandemic has made us realize the benefits of nature recreation for well-being, we should realize that this is possible not just through urban national/provincial parks and large-scale conservation, but pocket parks and even those areas that are not on the map.

But how do we find out where these places are? By definition, IGS are about use and not use by birds or animals, but by people. So we need people data. Volunteered geographic information (VGI) is exactly that. This is sometimes known as “crowdsourced” data and it comes from a variety of general and specific purpose social media sources. For instance, Open Street Map is an open source equivalent to Google Maps, in which volunteers contribute the map data. They add a variety of information, like the location of restaurants or even backyard swimming pools (drawn from satellite imagery). In our case, there may be locally-contributed trails or informal parks that we can glean from Open Street Map that may not be visible on Google. Other sources may be more specifically-tailored to nature and/or recreation. For instance, Strava is an app that enables users to record their geographic location as they walk, hike, run, bike, or otherwise exercise. eBird and iNaturalist are popular nature observation apps where users can record the geographic locations of birds, animals, and plants they come across.

This lab will help us to get to know two key conservation technologies – GIS and VGI  – through the context of an underexplored conservation issue: informally used spaces. Credit to Zo Ross for developing the idea and to the SSHRC Insight Development program for support. 

### Requirements
To complete this lab, you will need the following:
* Access to [QGIS](https://www.qgis.org/en/site/forusers/download.html) - free, open access mapping software
* Access to the datasets (linked to in the Instructions below)

### Learning Objectives
1.  become familiar with VGI
2.  become familiar with GIS
3.  become familiar with IGS
4.  consider some of the practical and ethical considerations in GIS and VGI

## Instructions
1. Log on to the computer lab computers using your Guelph credentials
2. Start QGIS, a free and open access desktop mapping tool
3. Open a browser such as Google Chrome and navigate to Courselink.uoguelph.ca Log on using your Guelph credentials. Access our course’s page and under the Conent tab, select Monday. Download the files. This is the data that we will be working with today, from eBird and iNaturalist, as well as the City of Guelph (formal park boundaries and property lines). Your own city probably has a similar GIS hub if you want to explore that.
* Property lines from: https://geodatahub-cityofguelph.opendata.arcgis.com/datasets/cityofguelph::property-lines/explore?location=43.532318%2C-80.226850%2C12.97 Property lines will help us map out IGS on a property parcel basis. If we can identify the public and private properties that IGS are on, we can then advocate for them through landowner outreach or otherwise.
* Park boundaries from: https://geodatahub-cityofguelph.opendata.arcgis.com/datasets/cityofguelph::city-parks/explore?location=43.538239%2C-80.241150%2C13.81
* eBird from: https://www.gbif.org/occurrence/download/0208115-230224095556074 (observations in the city limits since 2020)
* iNaturalist from: https://www.gbif.org/occurrence/download/0208125-230224095556074 (research-grade observation in the city limits since 2020)
4. Unzip these data files…
5. Return to QGIS. Let’s get familiar with it. First, add a basemap. To do this, find the “Browser” panel.  You may have to go to View -> Panels -> Browser to open it. Look for XYZ Tiles. XYZ tiles are “basemaps” that are like what you see on Google Maps. Indeed, you can add Google Maps to QGIS! But let’s stick with OpenStreetMap. Drag that XYZ tile onto the blank space in the middle of the software. You should see the outline of the world appear. Zoom into Guelph by using the Zoom button or by scrolling the mouse. You’ll also notice that the OpenStreetMap XYZ tile layer has been added to the list of Layers.
6. Add the unzipped data files. For the City data, drag each .shp file from your folder to the map pane “onto” the basemap. For the eBird and iNaturalist data, go to Layer -> Add Layer -> Add Delimited Text Layer. From the file name box navigate to the correct file. Then, you may need to select Custom Delimiters and check Tab. The rest should fall into place. Click Add. 
7. Once you have the data on the map, you may wish to reorder the map layers and resymbolize them in order to make things clearer. First, you can resymbolize each layer by right clicking on it in the Layers menu, selecting Properties, and then choosing Symbology. Your main options are color and opacity. You can also move layers up and down in the “drawing order” so that, for instance, the “polygon” layers – the parks and the property boundaries” are at the bottom, and the “points” – the ebird and inaturalist observations, are at the top. You could then make the parks and property boundaries less opaque in order to see the underlying basemap. 
8. Now that we have some context – where people might be recreating (via ebird and inaturalist) and where existing formal parks are - we are going to use the QuickOSM plugin to help us further narrow our search for IGS. Install the QuickOSM plugin. Plugins are extra bits of software that users have written to help each other do more specialized tasks with software tools. In this case, QGIS plugins help us do different kinds of analyses. QuickOSM allows us to retrieve the underlying OSM data. This will help us interact with additional features of the landscape, such as areas determined to be residential, industrial, and/or commercial – areas we do not expect to be IGS.
9. Open QuickOSM an do searches https://wiki.openstreetmap.org/wiki/Map_features#Leisure
* Add landuse:brownfield
* Add landuse:greenfield
* The above two help us with context. It’s likely but not strictly necessary that IGS will occur in brown or greenfields. 
* Investigate what Map Features OSM contributors have categorized and catalogued and then see if there are any other elements you might want to add.
10. We are going to define IGS based on a mix of existing landuse types and nature observations, recognizing that this is a limited approach (consider who makes nature observations, what about other indicators of nature recreation like Strava, etc.) We will start through a process of elimination. We will eliminate properties that are in or near buildings and parks. We will then manually eliminate some areas not captured from the above process. 
* First, project the data to the same coordinate system in order to ensure proper calculations. In the lower-right hand corner of the QGIS window click where it says “EPSG:XXXX” Search for 26917 which is the code for the UTM Z17 N project, which fits the Guelph-area well. Use this map to find the appropriate UTM zone for your own location. 
* Exclude observations made in formal parks
* Create a spatial index on the observations to make analysis faster. Search Processing Toolbox for Create spatial index and run it.
* Select by location. Select features from the observations that are “disjoint” (outside of) features from City Parks.
* Try to address “missing data” by calculating DBSCAN clustering
* Check “selected features only” to make sure you’re analyzing the non—park observations.
* Minimum cluster size of 50 and maximum distance between them of 100m. We want relatively close together areas of at least 50 related points. Treat border points as noise since we don’t know what’s on the other side of the border…How do we know to use this tool and these specific inputs? Reasonable assumptions plus lots of trial and error…
* This may take some time
* Change the symbology to see the clusters. Don’t show the “All other values” since these weren’t clustered. In fact, remove them by Select Features by Value -> CLUSTER_ID > 0
* Select the properties these clusters are within
* Create a spatial index on Clusters to make analysis faster. Search Processing Toolbox for Create spatial index and run it.
* Select by location. Select features from Property_Lines where they intersect Clusters (check selected features to focus on those actually identified as part of a cluster)
* Remove laneways from the selected properties
* Select features by value. Under Parcel Type write Road Parcel. Use the dropdown menu next to the Select Features button to choose “Remove from Current Selection”. Do the same for Laneway Parcel Types. 
* Could filter observations even further…
11. Analyze in relation to Census data? (Visually)

## Reflections
* What do we see? What have we found?
* Is this data biased? If so, how? And what impact would that have on the analysis?
* How would similar data sources be useful in your own work? How might they raise questions of bias?
* Is this data sensitive? Are there privacy concerns?
* What next steps? How would you want to analyze this further?
* How easy was this? What capacity, cost, etc. needed?
