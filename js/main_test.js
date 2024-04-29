var map;
var attributes = [];
dataStats = {};


function setMap(){
    var height = window.innerHeight;
    var width = window.innerWidth * 0.7;
    map = L.map('map', {
        center: [20, 0],
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
            createLegend(attributes);
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
    console.log(dataStats);
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 1;
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.2) * minRadius
    return radius;
};


//create legend
function createLegend(attributes) {

	var LegendControl = L.Control.extend({
		options: {
			position: 'bottomright'
		},
		onAdd: function () {
			// create the control container with a particular class name
			var container = L.DomUtil.create('div', 'legend-control-container');

			container.innerHTML = '<h3 class="temporalLegend">Population in <span class="year">1985</span></h3>';

			//Step 1: start attribute legend svg string
			var svg = '<svg id="attribute-legend" width="160px" height="80px">';

			//array of circle names to base loop on
			var circles = ["max", "mean", "min"];

			//Step 2: loop to add each circle and text to svg string  
			for (var i = 0; i < circles.length; i++) {

				//Step 3: assign the r and cy attributes  
				var radius = calcPropRadius(dataStats[circles[i]]);
				var cy = 52 - radius;

				//circle string  
				svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="35"/>';

				//Step 4: create legend text to label each circle     				          
				var textY = i * 20 + 12;
				svg += '<text id="' + circles[i] + '-text" x="70" y="' + textY + '">' + Math.round(dataStats[circles[i]] * 100) / 100 + " million" + '</text>';

			};

			//add annotation to include the values below threshold
			svg += '<text x="70" y="65">(and below)</text>';
			svg += "</svg>";
			svg += '<svg><circle class="legend-circle" id="nullCircle" r="' + minRadius + '"cy="' + 10 + '" fill="#ffffff" fill-opacity="0.8" stroke="#000000" cx="35"/><text x="70" y="14">Zero or N/A</text></svg>';

			//add attribute legend svg to container
			container.insertAdjacentHTML('beforeend', svg);
            console.log(container);
			return container;

            
		}
	});
    console.log(circles);
	map.addControl(new LegendControl());
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
};

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