(function (d3, topojson) {
  'use strict';

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
LIMIT 10`;

  const endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-06/sparql";

  const svg = d3.select('svg');
  const projection = d3.geoNaturalEarth1();
  const pathGenerator = d3.geoPath().projection(projection);

  setupMap();
  drawMap();
  data();

  //Alle data functies aanroepen
  //Code van Laurens
  async function data() {
    let data = await loadJSONData(endpoint, query);
    //pas werken met data wanneer data is omgezet in json
    data = data.map(cleanData);
    data = changeImageURL(data);
    console.log(data);
    data = plotImages(data);
  }

  //Code van Laurens
  //Load the data and return a promise which resolves with said data
  function loadJSONData(url, query){
    return d3.json(endpoint +"?query="+ encodeURIComponent(query) + "&format=json")
      .then(data => data.results.bindings)
  }

  //Code van Laurens
  //This function gets the nested value out of the object in each property in our data
  function cleanData(data){
     let result = {};
      Object.entries(data)
      	.map(([key, propValue]) => { 		
  				result[key] = propValue.value;
    	});
     return result
  }

  //Vervang 'http' door 'https'
  function changeImageURL(results){
    results.map(result => {
      result.img = result.img.replace('http', 'https');
    });    
    return results
  }

  //Code van Laurens
  function setupMap(){
    svg
      .append('path')
        .attr('class', 'sphere')
        .attr('d', pathGenerator({ type: 'Sphere' }));
  }

  //Code van Laurens
  function drawMap() {
    d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
      const countries = topojson.feature(data, data.objects.countries);
      svg  
        .selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
          .attr('class', 'country')
          .attr('d', pathGenerator);
    });
  }

  function plotImages(data) {
      svg
        .selectAll('imageDiv')
        .data(data)
        .enter()
    		//dankzij hulp van Laurens
        .append('image')
          .attr("xlink:href", d => d.img)
          .attr('class', 'images')
          .attr('x', function(d) {
            return projection([d.long, d.lat])[0]
          })
          .attr('y', function(d) {
            return projection([d.long, d.lat])[1]
          });
  }

}(d3, topojson));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNlbGVjdCwganNvbiwgZ2VvUGF0aCwgZ2VvTmF0dXJhbEVhcnRoMSB9IGZyb20gJ2QzJztcbmltcG9ydCB7IGZlYXR1cmUgfSBmcm9tICd0b3BvanNvbic7XG5cbmNvbnN0IHF1ZXJ5ID0gYFBSRUZJWCByZGY6IDxodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjPlxuUFJFRklYIGRjOiA8aHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8+XG5QUkVGSVggZGN0OiA8aHR0cDovL3B1cmwub3JnL2RjL3Rlcm1zLz5cblBSRUZJWCBza29zOiA8aHR0cDovL3d3dy53My5vcmcvMjAwNC8wMi9za29zL2NvcmUjPlxuUFJFRklYIGVkbTogPGh0dHA6Ly93d3cuZXVyb3BlYW5hLmV1L3NjaGVtYXMvZWRtLz5cblBSRUZJWCBmb2FmOiA8aHR0cDovL3htbG5zLmNvbS9mb2FmLzAuMS8+XG5QUkVGSVggaGRsaDogPGh0dHBzOi8vaGRsLmhhbmRsZS5uZXQvMjAuNTAwLjExODQwL3Rlcm1tYXN0ZXI+XG5QUkVGSVggd2dzODQ6IDxodHRwOi8vd3d3LnczLm9yZy8yMDAzLzAxL2dlby93Z3M4NF9wb3MjPlxuUFJFRklYIGdlbzogPGh0dHA6Ly93d3cub3Blbmdpcy5uZXQvb250L2dlb3NwYXJxbCM+XG5QUkVGSVggc2tvczogPGh0dHA6Ly93d3cudzMub3JnLzIwMDQvMDIvc2tvcy9jb3JlIz5cblBSRUZJWCBnbjogPGh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnL29udG9sb2d5Iz5cblBSRUZJWCByZGY6IDxodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjPlxuUFJFRklYIHJkZnM6IDxodHRwOi8vd3d3LnczLm9yZy8yMDAwLzAxL3JkZi1zY2hlbWEjPlxuXG4jIGVlbiBmb3RvIHBlciBsYW5kIChtZXQgdHlwZSwgaW1nLCBsYXQgZW4gbG9uZyB2YW4gZGUgcGxhYXRzXG5TRUxFQ1QgIChTQU1QTEUoP2NobykgQVMgP2NobykgXG5cdFx0XHRcdChTQU1QTEUoP3RpdGxlKSBBUyA/dGl0bGUpIFxuICAgICAgICAoU0FNUExFKD90eXBlTGFiZWwpIEFTID90eXBlKSBcbiAgICAgICAgKFNBTVBMRSg/aW1nKSBBUyA/aW1nKSBcbiAgICAgICAgKFNBTVBMRSg/bGF0KSBBUyA/bGF0KVxuICAgICAgICAoU0FNUExFKD9sb25nKSBBUyA/bG9uZylcbiAgICAgICAgP2xhbmRMYWJlbCBcblxuV0hFUkUge1xuICAjIHZpbmQgYWxsZWVuIGZvdG8nc1xuICA8aHR0cHM6Ly9oZGwuaGFuZGxlLm5ldC8yMC41MDAuMTE4NDAvdGVybW1hc3RlcjEzOTc+IHNrb3M6bmFycm93ZXIqID90eXBlIC5cbiAgP3R5cGUgc2tvczpwcmVmTGFiZWwgP3R5cGVMYWJlbCAuICAgXG4gID9jaG8gZWRtOm9iamVjdCA/dHlwZSAuXG5cbiAgIyA/Y2hvIGRjOnRpdGxlID90aXRsZSAuXG4gID9jaG8gZWRtOmlzU2hvd25CeSA/aW1nIC5cbiAgP2NobyBkYzp0aXRsZSA/dGl0bGUgLlxuXG4gICMgdmluZCBiaWogZGUgb2JqZWN0ZW4gaGV0IGxhbmRcbiAgP2NobyBkY3Q6c3BhdGlhbCA/cGxhY2UgLlxuICA/cGxhY2Ugc2tvczpleGFjdE1hdGNoL2duOnBhcmVudENvdW50cnkgP2xhbmQgLlxuICAjID9wbGFjZSBza29zOnByZWZMYWJlbCA/cGxhY2VOYW1lIC5cbiAgP2xhbmQgZ246bmFtZSA/bGFuZExhYmVsIC5cbiAgXG4gICMgdmluZCBiaWogZGUgcGxhYXRzIHZhbiBkZSBmb3RvIGRlIGxhdC9sb25nXG4gID9wbGFjZSBza29zOmV4YWN0TWF0Y2gvd2dzODQ6bGF0ID9sYXQgLlxuICA/cGxhY2Ugc2tvczpleGFjdE1hdGNoL3dnczg0OmxvbmcgP2xvbmcgLiAgICAgIFxuXG59IEdST1VQIEJZID9sYW5kTGFiZWxcbk9SREVSIEJZID9sYW5kTGFiZWwgXG5MSU1JVCAxMGBcblxuY29uc3QgZW5kcG9pbnQgPSBcImh0dHBzOi8vYXBpLmRhdGEubmV0d2Vya2RpZ2l0YWFsZXJmZ29lZC5ubC9kYXRhc2V0cy9pdm8vTk1WVy9zZXJ2aWNlcy9OTVZXLTA2L3NwYXJxbFwiXG5cbmNvbnN0IHN2ZyA9IHNlbGVjdCgnc3ZnJylcbmNvbnN0IHByb2plY3Rpb24gPSBnZW9OYXR1cmFsRWFydGgxKClcbmNvbnN0IHBhdGhHZW5lcmF0b3IgPSBnZW9QYXRoKCkucHJvamVjdGlvbihwcm9qZWN0aW9uKVxuXG5zZXR1cE1hcCgpXG5kcmF3TWFwKClcbmRhdGEoKVxuXG4vL0FsbGUgZGF0YSBmdW5jdGllcyBhYW5yb2VwZW5cbi8vQ29kZSB2YW4gTGF1cmVuc1xuYXN5bmMgZnVuY3Rpb24gZGF0YSgpIHtcbiAgbGV0IGRhdGEgPSBhd2FpdCBsb2FkSlNPTkRhdGEoZW5kcG9pbnQsIHF1ZXJ5KVxuICAvL3BhcyB3ZXJrZW4gbWV0IGRhdGEgd2FubmVlciBkYXRhIGlzIG9tZ2V6ZXQgaW4ganNvblxuICBkYXRhID0gZGF0YS5tYXAoY2xlYW5EYXRhKVxuICBkYXRhID0gY2hhbmdlSW1hZ2VVUkwoZGF0YSlcbiAgY29uc29sZS5sb2coZGF0YSlcbiAgZGF0YSA9IHBsb3RJbWFnZXMoZGF0YSlcbn1cblxuLy9Db2RlIHZhbiBMYXVyZW5zXG4vL0xvYWQgdGhlIGRhdGEgYW5kIHJldHVybiBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2l0aCBzYWlkIGRhdGFcbmZ1bmN0aW9uIGxvYWRKU09ORGF0YSh1cmwsIHF1ZXJ5KXtcbiAgcmV0dXJuIGpzb24oZW5kcG9pbnQgK1wiP3F1ZXJ5PVwiKyBlbmNvZGVVUklDb21wb25lbnQocXVlcnkpICsgXCImZm9ybWF0PWpzb25cIilcbiAgICAudGhlbihkYXRhID0+IGRhdGEucmVzdWx0cy5iaW5kaW5ncylcbn1cblxuLy9Db2RlIHZhbiBMYXVyZW5zXG4vL1RoaXMgZnVuY3Rpb24gZ2V0cyB0aGUgbmVzdGVkIHZhbHVlIG91dCBvZiB0aGUgb2JqZWN0IGluIGVhY2ggcHJvcGVydHkgaW4gb3VyIGRhdGFcbmZ1bmN0aW9uIGNsZWFuRGF0YShkYXRhKXtcbiAgIGxldCByZXN1bHQgPSB7fVxuICAgIE9iamVjdC5lbnRyaWVzKGRhdGEpXG4gICAgXHQubWFwKChba2V5LCBwcm9wVmFsdWVdKSA9PiB7IFx0XHRcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBwcm9wVmFsdWUudmFsdWVcbiAgXHR9KVxuICAgcmV0dXJuIHJlc3VsdFxufVxuXG4vL1ZlcnZhbmcgJ2h0dHAnIGRvb3IgJ2h0dHBzJ1xuZnVuY3Rpb24gY2hhbmdlSW1hZ2VVUkwocmVzdWx0cyl7XG4gIHJlc3VsdHMubWFwKHJlc3VsdCA9PiB7XG4gICAgcmVzdWx0LmltZyA9IHJlc3VsdC5pbWcucmVwbGFjZSgnaHR0cCcsICdodHRwcycpXG4gIH0pICAgIFxuICByZXR1cm4gcmVzdWx0c1xufVxuXG4vL0NvZGUgdmFuIExhdXJlbnNcbmZ1bmN0aW9uIHNldHVwTWFwKCl7XG4gIHN2Z1xuICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ3NwaGVyZScpXG4gICAgICAuYXR0cignZCcsIHBhdGhHZW5lcmF0b3IoeyB0eXBlOiAnU3BoZXJlJyB9KSlcbn1cblxuLy9Db2RlIHZhbiBMYXVyZW5zXG5mdW5jdGlvbiBkcmF3TWFwKCkge1xuICBqc29uKCdodHRwczovL3VucGtnLmNvbS93b3JsZC1hdGxhc0AxLjEuNC93b3JsZC8xMTBtLmpzb24nKS50aGVuKGRhdGEgPT4ge1xuICAgIGNvbnN0IGNvdW50cmllcyA9IGZlYXR1cmUoZGF0YSwgZGF0YS5vYmplY3RzLmNvdW50cmllcyk7XG4gICAgc3ZnICBcbiAgICAgIC5zZWxlY3RBbGwoJ3BhdGgnKVxuICAgICAgLmRhdGEoY291bnRyaWVzLmZlYXR1cmVzKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnY291bnRyeScpXG4gICAgICAgIC5hdHRyKCdkJywgcGF0aEdlbmVyYXRvcilcbiAgfSlcbn1cblxuZnVuY3Rpb24gcGxvdEltYWdlcyhkYXRhKSB7XG4gICAgc3ZnXG4gICAgICAuc2VsZWN0QWxsKCdpbWFnZURpdicpXG4gICAgICAuZGF0YShkYXRhKVxuICAgICAgLmVudGVyKClcbiAgXHRcdC8vZGFua3ppaiBodWxwIHZhbiBMYXVyZW5zXG4gICAgICAuYXBwZW5kKCdpbWFnZScpXG4gICAgICAgIC5hdHRyKFwieGxpbms6aHJlZlwiLCBkID0+IGQuaW1nKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnaW1hZ2VzJylcbiAgICAgICAgLmF0dHIoJ3gnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW2QubG9uZywgZC5sYXRdKVswXVxuICAgICAgICB9KVxuICAgICAgICAuYXR0cigneScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbZC5sb25nLCBkLmxhdF0pWzFdXG4gICAgICAgIH0pXG59XG4iXSwibmFtZXMiOlsic2VsZWN0IiwiZ2VvTmF0dXJhbEVhcnRoMSIsImdlb1BhdGgiLCJqc29uIiwiZmVhdHVyZSJdLCJtYXBwaW5ncyI6Ijs7O0VBR0EsTUFBTSxLQUFLLEdBQUcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBNkNQLEVBQUM7O0VBRVQsTUFBTSxRQUFRLEdBQUcsdUZBQXNGOztFQUV2RyxNQUFNLEdBQUcsR0FBR0EsU0FBTSxDQUFDLEtBQUssRUFBQztFQUN6QixNQUFNLFVBQVUsR0FBR0MsbUJBQWdCLEdBQUU7RUFDckMsTUFBTSxhQUFhLEdBQUdDLFVBQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUM7O0VBRXRELFFBQVEsR0FBRTtFQUNWLE9BQU8sR0FBRTtFQUNULElBQUksR0FBRTs7OztFQUlOLGVBQWUsSUFBSSxHQUFHO0lBQ3BCLElBQUksSUFBSSxHQUFHLE1BQU0s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