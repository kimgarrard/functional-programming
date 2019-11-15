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
LIMIT 10`

const endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-06/sparql"

const svg = select('svg')
const projection = geoNaturalEarth1()
const pathGenerator = geoPath().projection(projection)

//functies setupMap() en drawMap() van Laurens
//https://beta.vizhub.com/Razpudding/6b3c5d10edba4c86babf4b6bc204c5f0
setupMap()
drawMap()
data()

//Alle data functies aanroepen
//Code opzet van Laurens
//Function changeImageURL() en plotImages() zelf toegevoegd
//https://beta.vizhub.com/Razpudding/2e039bf6e39a421180741285a8f735a3
async function data() {
  let data = await loadJSONData(endpoint, query)
  //pas werken met data wanneer data is omgezet in json
  data = data.map(cleanData)
  data = changeImageURL(data)
  //code van Laurens, aangepast naar type
  // data = transformData(data)
  console.log(data)
  data = plotImages(data)
}

//Code van Laurens
//Data wordt geladen en omgezet in json
function loadJSONData(url, query){
  return json(endpoint +"?query="+ encodeURIComponent(query) + "&format=json")
    .then(data => data.results.bindings)
}

//Code van Laurens, parameter (data) aangepast
//This function gets the nested value out of the object in each property in our data
function cleanData(data){
   let result = {}
    Object.entries(data)
    	.map(([key, propValue]) => {
				result[key] = propValue.value
  	})
   return result
}

//Vervang 'http' door 'https'
function changeImageURL(results){
  results.map(result => {
    result.img = result.img.replace('http', 'https')
  })
  return results
}

// //Nest the data per type
// function transformData(source){
//   let transformed =  d3.nest()
// 		.key(function(d) { return d.type; })
// 		.entries(source);
//   transformed.forEach(type => {
//     type.amount = type.values.length
//   })
//   return transformed
// }

function setupMap(){
  svg
    .append('path')
      .attr('class', 'sphere')
      .attr('d', pathGenerator({ type: 'Sphere' }))
}

function drawMap() {
  json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
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

function plotImages(data) {
    svg
      .selectAll('imageDiv')
      .data(data)
      .enter()
      .append('image')
				//met d => d.img heeft Laurens mee geholpen
        .attr("xlink:href", d => d.img)
        .attr('class', 'images')
				//c voor x&y weghalen heeft Laurens mee geholepn
        .attr('x', function(d) {
          return projection([d.long, d.lat])[0]
        })
        .attr('y', function(d) {
          return projection([d.long, d.lat])[1]
        })
}
