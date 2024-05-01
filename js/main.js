var map;
var searchbox;
var fuseLanguage;
var fuseCountry
var heatmapLayer;
var propSymbolLayer;
var attributes = [];
dataStats = {};
searchItemsLanguages = {};
searchItemsCountries = {};
count = {
    "moribund": 642,
    "shifting": 2976,
    "threatened": 1376,
    "nearly_extinct": 332,
    "extinct": 330
}

const locationCoverage = ["Africa",
    "Arab",
    "Asia",
    "Australia_and_New_Zealand",
    "Central_America",
    "Europe",
    "Northern_America",
    "Oceania",
    "South-Eastern_Asia",
    "South_America",
    "Southern_Asia",
    "Western_Africa"]

const officialLanguage = [
    "worldlang_Arabic_country",
    "worldlang_Bahasa_country",
    "worldlang_English_country",
    "worldlang_French_country",
    "worldlang_Hindustani_country",
    "worldlang_Mandarin_country",
    "worldlang_Portuguese_country",
    "worldlang_Russian_country",
    "worldlang_Spanish_country",
    ]

function initializing(){
    searchbox = L.control.searchbox({
        position: 'topleft',
        expand: 'left',
        autocompleteFeatures: ['setValueOnClick']
    }).addTo(map);
    searchbox.onButton("click", search);
    searchbox.onInput("keyup", function (e) {
        if (e.keyCode == 13) {
            search();
        } else {
            var value = searchbox.getValue();
            if (value != "") {
                var languageResults = fuseLanguage.search(value);
                var countryResults = fuseCountry.search(value);
                console.log(languageResults)
                console.log(countryResults.map(res => res.item).slice(0, 5))
                searchbox.setItems(countryResults.map(res => res.item).slice(0, 5).concat(languageResults.map(res => res.item).slice(0, 5)));
            } else {
                searchbox.clearItems();
            }
        }
    });
    addCheckBoxFunctions()
    getCountry();
    document.getElementById('reset').addEventListener('click', function(e){
        reset();
    })
}
function setMap(){
    var height = window.innerHeight;
    var width = window.innerWidth * 0.7;
    map = L.map('map', {
        center: [10, 20],
        zoom: 2.5
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
	    maxZoom: 20
    }).addTo(map);

    map.zoomControl.remove();
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);
    getData();
    setHeatMap(Object.keys(count));
    disableCheckBox()
    //drawPie(count)
    map.on("zoomend", function() {
        var zoomlevel = map.getZoom();
        if (zoomlevel > 4.5) {
            if (map.hasLayer(heatmapLayer)) {
                map.removeLayer(heatmapLayer);
            }
            map.addLayer(propSymbolLayer);
            enableCheckBox();
        }else if (zoomlevel <= 4.5) {
            if (map.hasLayer(propSymbolLayer)) {
                map.removeLayer(propSymbolLayer);

            }
            map.addLayer(heatmapLayer);
            disableCheckBox();
        }
        console.log("Current Zoom Level = " + zoomlevel);
    });

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
                fuseLanguage = new Fuse(Object.keys(searchItemsLanguages), {
                    shouldSort: true,
                    threshold: 0.6,
                    location: 0,
                    distance: 100,
                    minMatchCharLength: 1
                });
            })
};

function getCountry() {
    fetch("data/countries.geojson")
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            json.features.forEach(function(row){
                searchItemsCountries[row.properties['COUNTRY']] = [row.geometry.coordinates[1],row.geometry.coordinates[0]];
                })
            fuseCountry =  new Fuse(Object.keys(searchItemsCountries), {
                shouldSort: true,
                threshold: 0.6,
                location: 0,
                distance: 100,
                minMatchCharLength: 1
            });
        })
};


function setHeatMap(categories) {
    fetch("data/language.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            makeHeatMap(processDataHeatMap(json, categories));
        })
};

function makeHeatMap(data) {
    var cfg = {
        "radius": 7,
        "maxOpacity": .8,
        "scaleRadius": true,
        "useLocalExtrema": true,
        latField: 'lat',
        lngField: 'lng',
        valueField: 'value'
      };
      console.log(data.length)
      heatmapLayer = new HeatmapOverlay(cfg);
      heatmapLayer.setData(data);
      heatmapLayer.addTo(map);

}

function processDataHeatMap(data, categories) {
    var result = [];
    console.log(data)
    data.features.forEach(function(row) {
        if (categories.includes(row.properties['response_AES_lang'].split(" ").join("_"))) {
            //console.log(row)
            var newRow = {
                'lat': row.geometry.coordinates[1],
                'lng': row.geometry.coordinates[0],
                'value': row.properties["lang_L1.POP_lang"]
            }
            result.push(newRow)
        }
    })
    return result;
}

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
    var minRadius = 1.5;
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
        case 'nearly_extinct':
            return "#FB6A4A";
        case 'extinct':
            return "#5B5354";
        default:
            return "#ff7800"; // default color if none of the above categories are matched
    }
}

function pointToLayer(feature, latlng, attributes){
    var attribute = attributes[7]; //Determine which attribute to visualize with proportional symbols
    var level = feature.properties['response_AES_lang'].split(' ').join('_');
    var options = { //create marker options
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5,
        className: "show " + level + " id_" + feature.properties['id_name_lang'].split(' ').join('_'),
    };
    //console.log(latlng)
    searchItemsLanguages[feature.properties['id_name_lang']] = latlng;
    options.fillColor = getColor(level);
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
    //var popupContent = "<p><b>Language:</b> " + feature.properties.id_name_lang + "</p><p><b>" + "Speaking Population:" + ":</b> " + feature.properties[attribute] + "</p>";
    //bind the popup to the circle marker
    // layer.bindPopup(popupContent, {
    //     offset: new L.Point(0,-options.radius)
    // });
    layer.on('click', (e) => {
        onClick(e, feature.properties);
    })
    return layer;
};

//Example 2.1 line 34...Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    propSymbolLayer = L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    });
    //propSymbolLayer.addTo(map);
};

function onClick(e, properties) {
    var item = document.querySelector('.id_'+properties.id_name_lang.split(' ').join('_'));
    item.classList.remove('highlight');
    var panel = document.getElementById("info");
    panel.innerHTML = "";
    console.log(properties)
    var title = document.createElement("div");
    title.innerHTML = "SocioEconomic Factors";
    title.classList.add('info_title');
    panel.appendChild(title);
    panel.appendChild(contentWrapper("Language Name: ", properties.id_name_lang));
    panel.appendChild(contentWrapper("Area: ", properties.lang_subregion_lang));
    panel.appendChild(contentWrapper("Region Coverage: ", listToText('area', properties)));
    panel.appendChild(contentWrapper("Local Official Language: ", listToText('language', properties)));
    panel.appendChild(contentWrapper("GDP: ", properties["soceco_gdp.pcap.10yrmed_country"]));
    panel.appendChild(contentWrapper("GINI Index: ", properties["soceco_Gini.SWIID.10yr.median_country"]));
    panel.appendChild(contentWrapper("Education Expense: ", properties["edu_Mean.yr.school.10yr.median_country"]));

}

function contentWrapper(name, proprties) {
    var info_container = document.createElement("div");
    info_container.classList.add("info_content");
    const attribute = document.createElement("div");
    attribute.appendChild(document.createTextNode(name + proprties));
    info_container.appendChild(attribute)
    return info_container;
}

function listToText(type, properties) {
    var result = "";
    if(type == "area") {
        locationCoverage.forEach(function(area){
            if (properties[area] > 0) {
                result += area.replace("_", " ");
                result += ", ";
            }
        })
    } else {
        officialLanguage.forEach(function(language){
            if (properties[language] > 0) {
                var text = language.replace("worldlang_","");
                text = text.replace("_country", "");
                text = text.replace("_", " ");
                result += text;
                result += ", ";
            }
        })
    }
    if (result == "") {
        return "None";
    }
    result = result.substring(0, result.length - 2);
    return result;
}

function disableCheckBox() {
    var checkboxes = document.querySelectorAll("input[type=checkbox]");
    checkboxes.forEach(function(checkbox){
        checkbox.disabled = true;
    })
}

function enableCheckBox() {
    var checkboxes = document.querySelectorAll("input[type=checkbox]");
    checkboxes.forEach(function(checkbox){
        checkbox.disabled = false;
    })
}
function addCheckBoxFunctions() {
    var checkboxes = document.querySelectorAll("input[type=checkbox]");
    checkboxes.forEach(function(checkbox) {
        var level = checkbox.id.replace("_check", "");
        checkbox.addEventListener('change', function() {
            var layers = document.querySelectorAll("." + level);
            layers.forEach(function(layer) {
                toggleElements(layer);
            })
            count = caculateCurrentShownElements();
            makePieChart(count)
        })
    })
    var checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    var categories = []
    checkedBoxes.forEach(function(checkbox) {
        var level = checkbox.id.replace("_check", "");
        categories.push(level);
    })
    //setHeatMap(categories)
}



function toggleElements(element) {
    element.classList.toggle("show");
    element.classList.toggle('hide');
}

function caculateCurrentShownElements() {
    count = {
        "moribund": 0,
        "shifting": 0,
        "threatened": 0,
        "nearly_extinct": 0,
        "extinct": 0
    }
    var shown = document.querySelectorAll('.show');
    shown.forEach(function(element) {
        element.classList.forEach(function(className) {
            //console.log(className);
            console.log(Object.keys(count))
            if (Object.keys(count).includes(className)) {
                count[className] += 1;
            }
        })
    })
    console.log(count)
    return count;
}

function reset() {
    console.log('reset')
    count = {
        "moribund": 642,
        "shifting": 2976,
        "threatened": 1376,
        "nearly_extinct": 332,
        "extinct": 330
    }
    var checkboxes = document.querySelectorAll("input[type=checkbox]");
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = true;
    })
    map.remove();
    setMap();
    makePieChart(count);
}

function makePieChart(data) {
    const width = 300,
    height = 300,
    margin = 40;
    document.querySelector('#chart').innerHTML="";
    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    const radius = Math.min(width, height) / 2 - margin;

    // append the svg object to the div called 'my_dataviz'
    const svg = d3.select("#chart")
    .append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);
    const color = d3.scaleOrdinal()
        .domain(["moribund", "shifting", "threatened", "nearly_extinct", "extinct"])
        .range(["#DE2D26", "#FC9272", "#FCBBA1", "#FB6A4A", "#5B5354"]);
    update(data, svg, radius, color)
}

function update(data, svg, radius, color) {

    // Compute the position of each group on the pie:
    const pie = d3.pie()
      .value(function(d) {return d[1]; })
      .sort(function(a, b) { return d3.ascending(a.key, b.key);} ) // This make sure that group order remains the same in the pie chart
    const data_ready = pie(Object.entries(data))

    // map to data
    const u = svg.selectAll("path")
      .data(data_ready)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    u
      .join('path')
      .transition()
      .duration(1000)
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
      )
      .attr("id", function(d){
        return "pie_" + d.data[0];
      })
      .attr("class", function(d){
        return "pie";
      })
      .attr('fill', function(d){ return(color(d.data[0])) })
      .attr("stroke", "white")
      .style("opacity", 1)

    d3.selectAll("path")
    //.on("click", (event, d) => piefilter(d))
    .on("mouseover", (event, d) => setLabel(d))
    .on("mouseout", (event, d) => removeLabel())
    .on("mousemove", moveLabel);
}

function setLabel(props){
    //label content
    console.log(props.data[1])
    var sum = 0;
    console.log(count)
    Object.values(count).forEach(function(number){
        console.log(number)
        sum += number;
    })
    var percentage = (props.data[1] / sum * 100).toFixed(2);
    console.log(percentage)
    var labelAttribute = "<h1>" +props.data[0] +
     ": </h1><b>" +percentage + "%</b>";
    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.data[0] + "_label")
        .html(labelAttribute);

};

function piefilter(props) {
    console.log(props.data[0]);
    document.getElementById(props.data[0]+ "_check").checked = false;
    var layers = document.querySelectorAll("." + props.data[0]);
    layers.forEach(function(layer) {
        toggleElements(layer);
    })
    delete count[props.data[0]];
    makePieChart(count);
    removeLabel();
}

function removeLabel() {
    d3.select(".infolabel")
        .remove();
}

function moveLabel() {
    //use coordinates of mousemove event to set label coordinates
    var x = event.clientX - 100,
        y = event.clientY - 75;

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};

function search() {
    var value = searchbox.getValue();
    value = capitalize(value);
    if (value != "") {
        languageResult = searchItemsLanguages[value];
        countryResult = searchItemsCountries[value];
        if (languageResult) {
            console.log(searchItemsLanguages[value])
            map.removeLayer(heatmapLayer);
            if (!map.hasLayer(propSymbolLayer)){
                map.addLayer(propSymbolLayer);
            }
            var item = document.querySelector('.id_'+value.split(' ').join('_'));
            console.log(item);
            item.classList.add('highlight');
            map.flyTo([languageResult['lat'], languageResult['lng']], 8);
        } else if(countryResult) {
            map.removeLayer(heatmapLayer);
            if (!map.hasLayer(propSymbolLayer)){
                map.addLayer(propSymbolLayer);
            }
            console.log(countryResult);
            map.flyTo([countryResult[0], countryResult[1]], 6);
        } else {
            searchbox.setValue('No result!');
        }
    }
    setTimeout(function () {
        searchbox.hide();
        searchbox.clear();
    }, 800);
}

function capitalize(string) {
    var wordList = string.split(' ');
    var newWordList = []
    wordList.forEach(function(word) {
        var first = word.charAt(0);
        console.log(word)
        const firstLetterCap = first.toUpperCase()

        const remainingLetters = word.slice(1)
        const newWord = firstLetterCap + remainingLetters;
        newWordList.push(newWord)
    })
    const newWords = newWordList.join(" ");
    return newWords;
}


window.addEventListener("load", (event) => {
    setMap();
    initializing();
    console.log(count)
    makePieChart(count);
});