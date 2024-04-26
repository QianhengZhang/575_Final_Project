//insert code here!
window.onload = setMap();


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
        zoomOffset: -1
    }).addTo(map);
}

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