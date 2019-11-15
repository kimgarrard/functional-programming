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

  //functies setupMap() en drawMap() van Laurens
  //https://beta.vizhub.com/Razpudding/6b3c5d10edba4c86babf4b6bc204c5f0
  setupMap();
  drawMap();
  data();

  //Alle data functies aanroepen
  //Code van Laurens
  //https://beta.vizhub.com/Razpudding/2e039bf6e39a421180741285a8f735a3
  async function data() {
    let data = await loadJSONData(endpoint, query);
    //pas werken met data wanneer data is omgezet in json
    data = data.map(cleanData);
    data = changeImageURL(data);
    //code van Laurens, aangepast naar type
    // data = transformData(data)
    console.log(data);
    data = plotImages(data);
    drawMapLines();
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
        .attr('d', pathGenerator({ type: 'Sphere' }));
  }

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

  function drawMapLines() {
    d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
      const countries = topojson.feature(data, data.objects.countries);
      svg  
        .selectAll('countryLines')
        .data(countries.features)
        .enter()
        .append('path')
          .attr('class', 'countryLines')
          .attr('d', pathGenerator);
    });
  }

}(d3, topojson));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNlbGVjdCwganNvbiwgZ2VvUGF0aCwgZ2VvTmF0dXJhbEVhcnRoMSB9IGZyb20gJ2QzJztcbmltcG9ydCB7IGZlYXR1cmUgfSBmcm9tICd0b3BvanNvbic7XG5cbmNvbnN0IHF1ZXJ5ID0gYFBSRUZJWCByZGY6IDxodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjPlxuUFJFRklYIGRjOiA8aHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8+XG5QUkVGSVggZGN0OiA8aHR0cDovL3B1cmwub3JnL2RjL3Rlcm1zLz5cblBSRUZJWCBza29zOiA8aHR0cDovL3d3dy53My5vcmcvMjAwNC8wMi9za29zL2NvcmUjPlxuUFJFRklYIGVkbTogPGh0dHA6Ly93d3cuZXVyb3BlYW5hLmV1L3NjaGVtYXMvZWRtLz5cblBSRUZJWCBmb2FmOiA8aHR0cDovL3htbG5zLmNvbS9mb2FmLzAuMS8+XG5QUkVGSVggaGRsaDogPGh0dHBzOi8vaGRsLmhhbmRsZS5uZXQvMjAuNTAwLjExODQwL3Rlcm1tYXN0ZXI+XG5QUkVGSVggd2dzODQ6IDxodHRwOi8vd3d3LnczLm9yZy8yMDAzLzAxL2dlby93Z3M4NF9wb3MjPlxuUFJFRklYIGdlbzogPGh0dHA6Ly93d3cub3Blbmdpcy5uZXQvb250L2dlb3NwYXJxbCM+XG5QUkVGSVggc2tvczogPGh0dHA6Ly93d3cudzMub3JnLzIwMDQvMDIvc2tvcy9jb3JlIz5cblBSRUZJWCBnbjogPGh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnL29udG9sb2d5Iz5cblBSRUZJWCByZGY6IDxodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjPlxuUFJFRklYIHJkZnM6IDxodHRwOi8vd3d3LnczLm9yZy8yMDAwLzAxL3JkZi1zY2hlbWEjPlxuXG4jIGVlbiBmb3RvIHBlciBsYW5kIChtZXQgdHlwZSwgaW1nLCBsYXQgZW4gbG9uZyB2YW4gZGUgcGxhYXRzXG5TRUxFQ1QgIChTQU1QTEUoP2NobykgQVMgP2NobykgXG5cdFx0XHRcdChTQU1QTEUoP3RpdGxlKSBBUyA/dGl0bGUpIFxuICAgICAgICAoU0FNUExFKD90eXBlTGFiZWwpIEFTID90eXBlKSBcbiAgICAgICAgKFNBTVBMRSg/aW1nKSBBUyA/aW1nKSBcbiAgICAgICAgKFNBTVBMRSg/bGF0KSBBUyA/bGF0KVxuICAgICAgICAoU0FNUExFKD9sb25nKSBBUyA/bG9uZylcbiAgICAgICAgP2xhbmRMYWJlbCBcblxuV0hFUkUge1xuICAjIHZpbmQgYWxsZWVuIGZvdG8nc1xuICA8aHR0cHM6Ly9oZGwuaGFuZGxlLm5ldC8yMC41MDAuMTE4NDAvdGVybW1hc3RlcjEzOTc+IHNrb3M6bmFycm93ZXIqID90eXBlIC5cbiAgP3R5cGUgc2tvczpwcmVmTGFiZWwgP3R5cGVMYWJlbCAuICAgXG4gID9jaG8gZWRtOm9iamVjdCA/dHlwZSAuXG5cbiAgIyA/Y2hvIGRjOnRpdGxlID90aXRsZSAuXG4gID9jaG8gZWRtOmlzU2hvd25CeSA/aW1nIC5cbiAgP2NobyBkYzp0aXRsZSA/dGl0bGUgLlxuXG4gICMgdmluZCBiaWogZGUgb2JqZWN0ZW4gaGV0IGxhbmRcbiAgP2NobyBkY3Q6c3BhdGlhbCA/cGxhY2UgLlxuICA/cGxhY2Ugc2tvczpleGFjdE1hdGNoL2duOnBhcmVudENvdW50cnkgP2xhbmQgLlxuICAjID9wbGFjZSBza29zOnByZWZMYWJlbCA/cGxhY2VOYW1lIC5cbiAgP2xhbmQgZ246bmFtZSA/bGFuZExhYmVsIC5cbiAgXG4gICMgdmluZCBiaWogZGUgcGxhYXRzIHZhbiBkZSBmb3RvIGRlIGxhdC9sb25nXG4gID9wbGFjZSBza29zOmV4YWN0TWF0Y2gvd2dzODQ6bGF0ID9sYXQgLlxuICA/cGxhY2Ugc2tvczpleGFjdE1hdGNoL3dnczg0OmxvbmcgP2xvbmcgLiAgICAgIFxuXG59IEdST1VQIEJZID9sYW5kTGFiZWxcbk9SREVSIEJZID9sYW5kTGFiZWwgXG5MSU1JVCAxMGBcblxuY29uc3QgZW5kcG9pbnQgPSBcImh0dHBzOi8vYXBpLmRhdGEubmV0d2Vya2RpZ2l0YWFsZXJmZ29lZC5ubC9kYXRhc2V0cy9pdm8vTk1WVy9zZXJ2aWNlcy9OTVZXLTA2L3NwYXJxbFwiXG5cbmNvbnN0IHN2ZyA9IHNlbGVjdCgnc3ZnJylcbmNvbnN0IHByb2plY3Rpb24gPSBnZW9OYXR1cmFsRWFydGgxKClcbmNvbnN0IHBhdGhHZW5lcmF0b3IgPSBnZW9QYXRoKCkucHJvamVjdGlvbihwcm9qZWN0aW9uKVxuXG4vL2Z1bmN0aWVzIHNldHVwTWFwKCkgZW4gZHJhd01hcCgpIHZhbiBMYXVyZW5zXG4vL2h0dHBzOi8vYmV0YS52aXpodWIuY29tL1JhenB1ZGRpbmcvNmIzYzVkMTBlZGJhNGM4NmJhYmY0YjZiYzIwNGM1ZjBcbnNldHVwTWFwKClcbmRyYXdNYXAoKVxuZGF0YSgpXG5cbi8vQWxsZSBkYXRhIGZ1bmN0aWVzIGFhbnJvZXBlblxuLy9Db2RlIHZhbiBMYXVyZW5zXG4vL2h0dHBzOi8vYmV0YS52aXpodWIuY29tL1JhenB1ZGRpbmcvMmUwMzliZjZlMzlhNDIxMTgwNzQxMjg1YThmNzM1YTNcbmFzeW5jIGZ1bmN0aW9uIGRhdGEoKSB7XG4gIGxldCBkYXRhID0gYXdhaXQgbG9hZEpTT05EYXRhKGVuZHBvaW50LCBxdWVyeSlcbiAgLy9wYXMgd2Vya2VuIG1ldCBkYXRhIHdhbm5lZXIgZGF0YSBpcyBvbWdlemV0IGluIGpzb25cbiAgZGF0YSA9IGRhdGEubWFwKGNsZWFuRGF0YSlcbiAgZGF0YSA9IGNoYW5nZUltYWdlVVJMKGRhdGEpXG4gIC8vY29kZSB2YW4gTGF1cmVucywgYWFuZ2VwYXN0IG5hYXIgdHlwZVxuICAvLyBkYXRhID0gdHJhbnNmb3JtRGF0YShkYXRhKVxuICBjb25zb2xlLmxvZyhkYXRhKVxuICBkYXRhID0gcGxvdEltYWdlcyhkYXRhKVxuICBkcmF3TWFwTGluZXMoKVxufVxuXG4vL0NvZGUgdmFuIExhdXJlbnNcbi8vTG9hZCB0aGUgZGF0YSBhbmQgcmV0dXJuIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIHNhaWQgZGF0YVxuZnVuY3Rpb24gbG9hZEpTT05EYXRhKHVybCwgcXVlcnkpe1xuICByZXR1cm4ganNvbihlbmRwb2ludCArXCI/cXVlcnk9XCIrIGVuY29kZVVSSUNvbXBvbmVudChxdWVyeSkgKyBcIiZmb3JtYXQ9anNvblwiKVxuICAgIC50aGVuKGRhdGEgPT4gZGF0YS5yZXN1bHRzLmJpbmRpbmdzKVxufVxuXG4vL0NvZGUgdmFuIExhdXJlbnNcbi8vVGhpcyBmdW5jdGlvbiBnZXRzIHRoZSBuZXN0ZWQgdmFsdWUgb3V0IG9mIHRoZSBvYmplY3QgaW4gZWFjaCBwcm9wZXJ0eSBpbiBvdXIgZGF0YVxuZnVuY3Rpb24gY2xlYW5EYXRhKGRhdGEpe1xuICAgbGV0IHJlc3VsdCA9IHt9XG4gICAgT2JqZWN0LmVudHJpZXMoZGF0YSlcbiAgICBcdC5tYXAoKFtrZXksIHByb3BWYWx1ZV0pID0+IHsgXHRcdFxuXHRcdFx0XHRyZXN1bHRba2V5XSA9IHByb3BWYWx1ZS52YWx1ZVxuICBcdH0pXG4gICByZXR1cm4gcmVzdWx0XG59XG5cbi8vVmVydmFuZyAnaHR0cCcgZG9vciAnaHR0cHMnXG5mdW5jdGlvbiBjaGFuZ2VJbWFnZVVSTChyZXN1bHRzKXtcbiAgcmVzdWx0cy5tYXAocmVzdWx0ID0+IHtcbiAgICByZXN1bHQuaW1nID0gcmVzdWx0LmltZy5yZXBsYWNlKCdodHRwJywgJ2h0dHBzJylcbiAgfSkgICAgXG4gIHJldHVybiByZXN1bHRzXG59XG5cbi8vIC8vTmVzdCB0aGUgZGF0YSBwZXIgdHlwZVxuLy8gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShzb3VyY2Upe1xuLy8gICBsZXQgdHJhbnNmb3JtZWQgPSAgZDMubmVzdCgpXG4vLyBcdFx0LmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGU7IH0pXG4vLyBcdFx0LmVudHJpZXMoc291cmNlKTtcbi8vICAgdHJhbnNmb3JtZWQuZm9yRWFjaCh0eXBlID0+IHtcbi8vICAgICB0eXBlLmFtb3VudCA9IHR5cGUudmFsdWVzLmxlbmd0aFxuLy8gICB9KVxuLy8gICByZXR1cm4gdHJhbnNmb3JtZWRcbi8vIH1cblxuZnVuY3Rpb24gc2V0dXBNYXAoKXtcbiAgc3ZnXG4gICAgLmFwcGVuZCgncGF0aCcpXG4gICAgICAuYXR0cignY2xhc3MnLCAnc3BoZXJlJylcbiAgICAgIC5hdHRyKCdkJywgcGF0aEdlbmVyYXRvcih7IHR5cGU6ICdTcGhlcmUnIH0pKVxufVxuXG5mdW5jdGlvbiBkcmF3TWFwKCkge1xuICBqc29uKCdodHRwczovL3VucGtnLmNvbS93b3JsZC1hdGxhc0AxLjEuNC93b3JsZC8xMTBtLmpzb24nKS50aGVuKGRhdGEgPT4ge1xuICAgIGNvbnN0IGNvdW50cmllcyA9IGZlYXR1cmUoZGF0YSwgZGF0YS5vYmplY3RzLmNvdW50cmllcyk7XG4gICAgc3ZnICBcbiAgICAgIC5zZWxlY3RBbGwoJ3BhdGgnKVxuICAgICAgLmRhdGEoY291bnRyaWVzLmZlYXR1cmVzKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnY291bnRyeScpXG4gICAgICAgIC5hdHRyKCdkJywgcGF0aEdlbmVyYXRvcilcbiAgfSlcbn1cblxuZnVuY3Rpb24gcGxvdEltYWdlcyhkYXRhKSB7XG4gICAgc3ZnXG4gICAgICAuc2VsZWN0QWxsKCdpbWFnZURpdicpXG4gICAgICAuZGF0YShkYXRhKVxuICAgICAgLmVudGVyKClcbiAgXHRcdC8vZGFua3ppaiBodWxwIHZhbiBMYXVyZW5zXG4gICAgICAuYXBwZW5kKCdpbWFnZScpXG4gICAgICAgIC5hdHRyKFwieGxpbms6aHJlZlwiLCBkID0+IGQuaW1nKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnaW1hZ2VzJylcbiAgICAgICAgLmF0dHIoJ3gnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW2QubG9uZywgZC5sYXRdKVswXVxuICAgICAgICB9KVxuICAgICAgICAuYXR0cigneScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbZC5sb25nLCBkLmxhdF0pWzFdXG4gICAgICAgIH0pXG59XG5cbmZ1bmN0aW9uIGRyYXdNYXBMaW5lcygpIHtcbiAganNvbignaHR0cHM6Ly91bnBrZy5jb20vd29ybGQtYXRsYXNAMS4xLjQvd29ybGQvMTEwbS5qc29uJykudGhlbihkYXRhID0+IHtcbiAgICBjb25zdCBjb3VudHJpZXMgPSBmZWF0dXJlKGRhdGEsIGRhdGEub2JqZWN0cy5jb3VudHJpZXMpO1xuICAgIHN2ZyAgXG4gICAgICAuc2VsZWN0QWxsKCdjb3VudHJ5TGluZXMnKVxuICAgICAgLmRhdGEoY291bnRyaWVzLmZlYXR1cmVzKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnY291bnRyeUxpbmVzJylcbiAgICAgICAgLmF0dHIoJ2QnLCBwYXRoR2VuZXJhdG9yKVxuICB9KVxufVxuIl0sIm5hbWVzIjpbInNlbGVjdCIsImdlb05hdHVyYWxFYXJ0aDEiLCJnZW9QYXRoIiwianNvbiIsImZlYXR1cmUiXSwibWFwcGluZ3MiOiI7OztFQUdBLE1BQU0sS0FBSyxHQUFHLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQTZDUCxFQUFDOztFQUVULE1BQU0sUUFBUSxHQUFHLHVGQUFzRjs7RUFFdkcsTUFBTSxHQUFHLEdBQUdBLFNBQU0sQ0FBQyxLQUFLLEVBQUM7RUFDekIsTUFBTSxVQUFVLEdBQUdDLG1CQUFnQixHQUFFO0VBQ3JDLE1BQU0sYUFBYSxHQUFHQyxVQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFDOzs7O0VBSXRELFFBQVEsR0FBRTtFQUNWLE9BQU8sR0FBRTtFQUNULElBQUksR0FBRTs7Ozs7RUFLTixlQUFlLElBQUksR0FBRztJQUNwQixJQUFJLElBQUksR0FB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