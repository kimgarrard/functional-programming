import { select, json, geoPath, geoNaturalEarth1 } from 'd3';
import { feature } from 'topojson';

const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX hdlh: <https://hdl.handle.net/20.500.11840/termmaster>
PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX gn: <http://www.geonames.org/ontology#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

# een foto per land (met type, img, lat en long van de plaats
SELECT  (SAMPLE(?cho) AS ?cho) 
		(SAMPLE(?title) AS ?title) 
        (SAMPLE(?typeLabel) AS ?type) 
        (SAMPLE(?img) AS ?img) 
        (SAMPLE(?lat) AS ?lat)
        (SAMPLE(?long) AS ?long)
        ?landLabel 

WHERE {
  # vind alleen foto's
  <https://hdl.handle.net/20.500.11840/termmaster1397> skos:narrower* ?type .
  ?type skos:prefLabel ?typeLabel .   
  ?cho edm:object ?type .

  # ?cho dc:title ?title .
  ?cho edm:isShownBy ?img .
  ?cho dc:title ?title .

  # vind bij de objecten het land
  ?cho dct:spatial ?place .
  ?place skos:exactMatch/gn:parentCountry ?land .
  # ?place skos:prefLabel ?placeName .
  ?land gn:name ?landLabel .
  
  # vind bij de plaats van de foto de lat/long
  ?place skos:exactMatch/wgs84:lat ?lat .
  ?place skos:exactMatch/wgs84:long ?long .      

} GROUP BY ?landLabel
ORDER BY ?landLabel 
LIMIT 5`
//Please use your own endpoint when using this 
const endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-40/sparql"

const svg = select('svg')
const circleDelay = 10
const circleSize = 8
const projection = geoNaturalEarth1()
const pathGenerator = geoPath().projection(projection)

setupMap()
drawMap()
plotLocations()

function setupMap(){
  svg
    .append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({ type: 'Sphere' }))
}

function drawMap() {
  d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
    const countries = feature(data, data.objects.countries);
    svg
      .selectAll('path')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator)
  })
}

function plotLocations() {
  fetch(endpoint +"?query="+ encodeURIComponent(query) + "&format=json")
    .then(data => data.json())
  	.then(json => json.results.bindings)
    .then(results => {
    //TODO: clean up results in separate function
    	results.forEach(result => {
        result.lat = Number(result.lat.value)
        result.long = Number(result.long.value)
      })    
    	console.log(results)
      
    svg
        .selectAll('circle')
        .data(results)
        .enter()
        .append('image')
    	  .attr("class", "nodes")
    		.attr("xlink:href", d => d.img.value)
        .attr('class', 'circles')
        .attr('x', function(d) {
          return projection([d.long, d.lat])[0]
        })
        .attr('y', function(d) {
          return projection([d.long, d.lat])[1]
        })
        .attr('r', '5px')
    		.attr('fill','url("https://connectoricons-prod.azureedge.net/kusto/icon_1.0.1027.1210.png")')
  })
}
