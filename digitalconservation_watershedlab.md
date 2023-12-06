---

layout: default
title: Digital Conservation - Watershed Prioritization Using New Data Sources Lab

---
We are not trying to train you to be Geographic Information System (GIS) technicians. You will learn how to employ GIS and modeling, social media/volunteered geographic information, and data dashboards in specific use cases – modeling landscapes, assessing recreational and other ecosystem services, and interactively prioritizing conservation investments. 

The lab is divided into three parts:
1.	Modeling Landscape Values
2.	Social Media and Volunteered Geographic Information
3.	Dashboards for Prioritizing Conservation Investments

By the end, you'll have created a data dashboard, the kind of which we see many conservation organizations deploying for public outreach and decision-making purposes right now. Specifically, you’ll have built a dashboard that would help decision-makers prioritize conservation investments in a southern Ontario watershed.

The overarching prompt that will guide your work: where should we invest in new conservation areas? Imagine you are tasking a GIS tech with building a publicly-available tool that would allow you, your organization, and your partners to investigate watershed conditions and possible areas for investment. It would be helpful to know, in some detail, what to task the tech with building. Through this you will learn about the kinds of conservation tools, tech, and data available to organizations and some of the practical and ethical concerns arising in them.

### Requirements
To complete this lab, you will need the following:
* Access to an ArcGIS account from Esri
* Access to ArcGIS Pro software
* Access to one of the lab datasets - available here [(Niagara Region)]() and here [(Toronto Region)]

## Part 1 – Modeling Landscape Values

We will be using the industry-standard ArcGIS Pro to get high-level experience working with classic and emerging conservation tools and technology. The goal is not to have you memorize which buttons to push, but to think through practical and ethical concerns that arise when implementing these within an organizational mission.

1.	**Access one of the lab datasets** using the links above

2.	**Unzip the file** you just downloaded. You can do this by right-clicking and “Extract Here” with 7-Zip on a Windows computer or any other similar utility.

3.  **Open the folder** you just unzipped and double click on the ArcGIS Project File. The following image illustrates this for the Niagara Region example.\
!["Step 3"](assets/img/watershedlab/step5.png "Step 3"){: width="75%" height="75%" }

4. **Review the spatial data layers** in front of you. We have the watershed boundaries, land use categories derived from satellite imagery, as well as mapped wetland locations and existing conservation spaces.

5. We are going to **create a model** to determine the suitability of areas in the watershed for investment in conservation actions (restoration, protection, etc.). Our model will be based on two criteria:
* distance to wetlands or greenspace
* land use type

6. First, we will **calculate distances** from all spots on the map to either wetlands or existing greenspaces. 
* **Click on the Analysis tab and then Toolbox.** 
* Search for **Euclidean Distance** and open the tool.\
!["Step 7b"](assets/img/watershedlab/step7b.png "Step 7b"){: width="50%" height="50%" }
* Your input is either the wetlands or greenspaces layer.\
!["Step 7c"](assets/img/watershedlab/step7c.png "Step 7c"){: width="50%" height="50%" }
* **Click on the Environments tab and set the Raster Analysis variables** Cell Size, Mask, and Clip Raster to be the same as the land use layer.\
!["Step 7d"](assets/img/watershedlab/step7d.png "Step 7d"){: width="50%" height="50%" }
* Click **run**!

7. Now we need to evaluate and classify our data – is more distance from an existing wetland or greenspace a good thing or a bad thing? Areas closer to wetlands or existing parks might be more highly ranked – or not, depending on the context. Likewise, areas with certain land use types (e.g. for BMPs, agricultural uses) would be ranked more or less highly depending on the context.
* **In the Analysis toolbar, choose Suitability Modeler.**
* In the pane that appears on the right, **give your model a good name**, like Conservation Suitability or WatershedRanking. Choose whether you want a 1-5 or 1-10 (or some other) scale to rank areas’ suitability for conservation.
* **Click the Parameters tab**, then the dropdown arrow, and select the land use and distance layers. 
* **Click on the circle to the left of each layer in the Criteria pane**. When you click on the circle for land use, **choose unique ranks and the `landu` variable** from the dropdown menu that appears. Choose what you think the right suitability is for the different land use types. By default, suitability is ranked on a 1 (worst) to 10 (best) scale.
* When you click on the circle next to the distance layer, you can **stick with “continuous functions”**. 
* For now, your model will have two criteria:
 * distance to wetlands or greenspace
 * and use type
You can weight them however you like, it all depends on exactly what you’re envisioning as the specific conservation decision here. 



