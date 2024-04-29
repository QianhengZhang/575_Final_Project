var map;
var attributes = [];
dataStats = {};


function setMap(){
    var height = window.innerHeight;
    var width = window.innerWidth * 0.7;
    map = L.map('map', {
        center: [0, 0],
        zoom: 2
    });
    //add OSM base tilelayer

    //customized mapbox layer: ancient chinese style
    //var map = L.map('map5').setView([34.25, 108.94], 9);
    var accessToken = "pk.eyJ1IjoibWxlaGFuZSIsImEiOiJjbG00NzJxNHIwdnQxM3FsZno2NXExeXN6In0.5sv_6g0kMbsjJHYEIJB_Uw";
    var id = "mlehane/clvcpzcgy01b701qlffzn9n9h";
    L.tileLayer(`https://api.mapbox.com/styles/v1/${id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`, {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 0,
	    maxZoom: 20,
    }).addTo(map);
    var searchbox = L.control.searchbox({
        position: 'topright',
        expand: 'left'
    }).addTo(map);

    //searchbox.onInput("click", searchCountry(map, searchbox.getValue()))
    //call getData function
    getData();
};

function getData(map) {
    fetch("data/language.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json); // Ensure this function is defined and working
                calcStats(json);
                createPropSymbols(json, attributes);
            })
};

function processData(data) {
    // Empty array to hold attributes
    var attributes = [];
    var properties = data.features[0].properties;
    for (var attribute in properties){
        //only take attributes with population values
        attributes.push(attribute);
    };

    return attributes;
};

function calcStats(data){
    var allValues = [];
    // Loop through each feature in the GeoJSON data
    for (var feature of data.features) {
        var value = feature.properties["lang_L1.POP_lang"];  // Get the population value for the language
        if (value) {  // Ensure that undefined or null values are not added
            allValues.push(Number(value));  // Convert value to number if necessary and add to array
        }
    }

    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues),
    dataStats.max = Math.max(...allValues),
    dataStats.mean = 0;

    // Calculate mean if there are any values
    if (allValues.length > 0) {
        var sum = allValues.reduce((a, b) => a + b, 0);  // Use reduce to sum the array
        dataStats.mean = sum / allValues.length;  // Calculate mean
    }  // Return the statistics object

    console.log(dataStats.mean);
    console.log(dataStats.max);
    console.log(dataStats.min);
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 1;
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.2) * minRadius
    return radius;
};

function getColor(response_AES_lang) {
    switch (response_AES_lang) {
        case 'moribund':
            return "#DE2D26";
        case 'shifting':
            return "#FC9272";
        case 'threatened':
            return "#FCBBA1";
        case 'nearly extinct':
            return "#FB6A4A";
        case 'extinct':
            return "#5B5354";
        default:
            return "#ff7800"; // default color if none of the above categories are matched
    }
}

function pointToLayer(feature, latlng, attributes){
    var attribute = attributes[7]; //Determine which attribute to visualize with proportional symbols

    var options = { //create marker options
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5,
    };

    options.fillColor = getColor(feature.properties['response_AES_lang']);

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    if (options.radius > 2) {
        var radius = calcPropRadius(feature.properties[attribute]);
        layer.setRadius(radius);
    }

    else {
        layer.setRadius(2);
    }

    //build popup content string - Initializing
    var popupContent = "<p><b>Language:</b> " + feature.properties.id_name_lang + "</p><p><b>" + "Speaking Population:" + ":</b> " + feature.properties[attribute] + "</p>";
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });

    return layer;
};

//Example 2.1 line 34...Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function makeGraph(){

}

document.addEventListener('DOMContentLoaded', setMap);
