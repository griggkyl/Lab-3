var map = L.map('map').setView([44.7, -122.5], 5.7) //create map centered over oregon
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 16
}).addTo(map);


    //calculate the radiuys of each proportional symbol
    function calcPropRadius(attValue) {
        var minRadius = 3;
        var radius = Math.sqrt(attValue)*1.2;
        return Math.max(radius, minRadius);
    }

    //select colors based on rating (~F, ~D, ~C, ~B/A)
    function colorchooser(attValue){
        if (attValue >= 0 && attValue < 35.0) {
            return "red";}
            else if(attValue >= 35 && attValue < 60.0){
                return "#Ffa500";
            }else if(attValue >= 60 && attValue < 80.0){
                return "yellow";
            } else if (attValue >= 80) {return "green";}
                
        }
    
// Add circle markers for point features to the map
function createPropSymbols(data){
//    //Determine the attribute for scaling the proportional symbols
var attribute = "SUF_RATING"; 
    //create marker options
    var geojsonMarkerOptions = {
        radius : 5, 
        fillColor: "#ff0000",
        color: "#ff0000",
        weight:1,
        opacity:0.8,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
        //     // //For each feature, determine its value for the selected attribute
          var attValue = Number(feature.properties[attribute]);
        // Check if the attribute value is valid (not NaN, not undefined, etc.)
    
        //     // //examine the attribute value to check that it is correct
            console.log(feature.properties, attValue);
            geojsonMarkerOptions.radius = calcPropRadius(attValue);
            geojsonMarkerOptions.fillColor = colorchooser(attValue);

            //create circle 
            var layer =  L.circleMarker(latlng, geojsonMarkerOptions);
            //add a popup for suf_rating and year
            var popupContent = "<p><b>Year Built:</b>" + feature.properties.YEAR + 
            "<br><b>Sufficiency Rating:</b> " + feature.properties.SUF_RATING;

   //bind the popup to the circle marker         
layer.bindPopup(popupContent);
return layer;
        }
    }).addTo(map);
};
// Create the legend
function createLegend() {
    var legend = L.control({position: 'bottomright'}); // Set position of the legend

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend');
        // Add title
        div.innerHTML = '<strong> Sufficiency Rating </strong><br><br>';
        
        var grades = [0, 35.0, 60.0, 80.0]; // Define the breaks
        var labels = [];
        
        // Add color boxes and labels based on quantiles
        for (var i = 0; i < grades.length; i++) {
            var color = colorchooser(grades[i]);
            labels.push(
                '<i style="background:' + color + '"></i> ' + grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] : '+')
            );
        }

        // Join the labels and add them to div
        div.innerHTML += labels.join('<br>');
        return div;
    };

    legend.addTo(map);
}
//Import GeoJSON data

    //load the data
    fetch("data/Bridges/Bridges_Filtered_A.geojson")
    .then(response => response.json())
    .then(data => {
        createPropSymbols(data);
        createLegend();
    })

//choropleth map

var map2 = L.map('map2').setView([44.7, -122.5], 5.7);

var tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 16
}).addTo(map2);

//min = 63, max=1009
function getColor(d) {
    return d >= 600 ? '#1c0c42' :
           d >= 350 ? '#7f1e6b' :
           d >= 200 ? '#b53358' :
           d >= 115 ? '#f1701f' :
           d >= 60  ? '#f7d442' : 
                    '#FFFFFF';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.Bridge_Sum_count),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 1
    };
}

 // Create the legend
 function createLegend2() {
    var legendii = L.control({position: 'bottomright'}); // Set position of the legend

    legendii.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend');
        // Add title
        div.innerHTML = '<strong> Number of Bridges </strong><br><br>';
        
        var gradesii = [60, 115, 200, 350, 600]; // Define the breaks
        var labelsii = [];
        
        // Add color boxes and labels based on quantiles
        for (var i = 0; i < gradesii.length; i++) {
            var colorii = getColor(gradesii[i]);
            labelsii.push(
                '<i style="background:' + colorii + '"></i> ' 
                + gradesii[i] + (gradesii[i + 1] ? ' &ndash; ' + gradesii[i + 1] : '+')
            );
        }

        // Join the labels and add them to div
        div.innerHTML += labelsii.join('<br>');
        return div;
    };

    legendii.addTo(map2);
}   

// Create popups with hover effect
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.COUNTY_NAM && feature.properties.Bridge_Sum_count
        && feature.properties.Bridge_Sum_avg_suf_rating) {
        
        // Round the average sufficiency rating to 2 decimal places
        const avgSuff = feature.properties.Bridge_Sum_avg_suf_rating.toFixed(2);
        
        // Set the content for the popup
        const popupContent = "<strong>" + feature.properties.COUNTY_NAM + "</strong><br>" +
                             "Number of Bridges: " + feature.properties.Bridge_Sum_count + "<br>" +
                             "Average Sufficiency Rating: " + avgSuff;

        // Bind the popup to the layer
        layer.bindPopup(popupContent);

        // Add hover effect for popup display
        layer.on({
            mouseover: function (e) {
                var layer = e.target;
                layer.openPopup(); // Open the popup on hover
            },
            mouseout: function (e) {
                var layer = e.target;
                geojson.resetStyle(layer); // Reset style on mouseout
                layer.closePopup(); // Close the popup when the mouse leaves
            }
        });
    }
}

    //load the data
    fetch("data/Bridges_Counties_Updated.geojson")
        .then(response => response.json())
        .then(data => {
            createLegend2();
            //create a Leaflet GeoJSON layer and add it to map 
        L.geoJson(data, {style:style,
            onEachFeature: onEachFeature
        }).addTo(map2);
        })    
