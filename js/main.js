var map;
var attributes = [];

function setMap(){
    var height = window.innerHeight;
    var width = window.innerWidth * 0.7;
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });
    //add OSM base tilelayer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 3,
	maxZoom: 16,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
    }).addTo(map);

    //call getData function
    getData(map);

}

function getData(map) {
    fetch("data/language.geojson")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            L.geoJson(json).addTo(map);
            const attributes = processData(json); // Ensure this function is defined and working
            createPropSymbols(json, attributes);
            calcStats(data);
            processData(data);
            calcPropRadius(attValue);
            pointToLayer(feature, latlng, attributes);
        })
        .catch(error => {
            console.error('Error loading the GeoJSON data: ', error);
        });
}

function processData(data) {
    // Empty array to hold attributes
    console.log(data.features[0].properties["lang_L1.POP_lang"]); 
    var attributes = [];
    return attributes;
}

function calcStats(data){
    var allValues = []; 
    // Loop through each feature in the GeoJSON data
    for (var feature of data.features) {
        var value = feature.properties["lang_L1.POP_lang"];  // Get the population value for the language
        console.log(value);
        if (value) {  // Ensure that undefined or null values are not added
            allValues.push(Number(value));  // Convert value to number if necessary and add to array
        }
    }

    // Object to hold the statistics
    var dataStats = {
        min: Math.min(...allValues),
        max: Math.max(...allValues),
        mean: 0  // Initialize mean to zero
    };

    // Calculate mean if there are any values
    if (allValues.length > 0) {
        var sum = allValues.reduce((a, b) => a + b, 0);  // Use reduce to sum the array
        dataStats.mean = sum / allValues.length;  // Calculate mean
    }

    return dataStats;  // Return the statistics object
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 4;
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/dataStats['min'],0.5715) * minRadius
    return radius;
};


function createPropSymbols(data, attributes) {
    const geoJsonLayer = L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return pointToLayer(feature, latlng, attributes[9]); // Use the first attribute for visualization
        }
    }).addTo(map);
}

function pointToLayer(feature, latlng, attributes){
    var attribute = attributes[1]; //Determine which attribute to visualize with proportional symbols
    console.log(attribute["lang_L1.POP_lang"]);

    var options = { //create marker options
        fillColor: "#1e2f97",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        radius: 8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string - Initializing
    // var popupContent = createPopupContent(feature.properties, attribute);

    //bind the popup to the circle marker
    layer.bindPopup(popupContent,{
        offset: new L.Point( 0,- 0.6* options.radius)
    });
    //return the circle marker to the L.geoJson pointToLayer option

    return layer;
};

function calcPropRadius(attributeValue) {
    const scaleFactor = 20; // Scale factor to adjust the size of the circle marker
    return Math.sqrt(attributeValue) * scaleFactor;
}

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data,attributes){
    //Create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data,{
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
        }).addTo(map);
};



document.addEventListener('DOMContentLoaded', setMap);
function search(country){

}

function reproject(event) {

}

function showDetail(object) {

}

function createLegend(data, type) {

}

function createBarChart(data) {

}

function createPieChart(data) {

}