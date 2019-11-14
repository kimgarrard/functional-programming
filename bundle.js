(function (d3$1, topojson) {
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
LIMIT 5`;
  //Please use your own endpoint when using this 
  const endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-40/sparql";

  const svg = d3$1.select('svg');
  const projection = d3$1.geoNaturalEarth1();
  const pathGenerator = d3$1.geoPath().projection(projection);

  setupMap();
  drawMap();
  plotLocations();

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

  function plotLocations() {
    fetch(endpoint +"?query="+ encodeURIComponent(query) + "&format=json")
      .then(data => data.json())
    	.then(json => json.results.bindings)
      .then(results => {
      //TODO: clean up results in separate function
      	results.forEach(result => {
          result.lat = Number(result.lat.value);
          result.long = Number(result.long.value);
        });    
      	console.log(results);
        
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
      		.attr('fill','url("https://connectoricons-prod.azureedge.net/kusto/icon_1.0.1027.1210.png")');
    });
  }

}(d3, topojson));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNlbGVjdCwganNvbiwgZ2VvUGF0aCwgZ2VvTmF0dXJhbEVhcnRoMSB9IGZyb20gJ2QzJztcbmltcG9ydCB7IGZlYXR1cmUgfSBmcm9tICd0b3BvanNvbic7XG5cbmNvbnN0IHF1ZXJ5ID0gYFBSRUZJWCByZGY6IDxodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjPlxuUFJFRklYIGRjOiA8aHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8+XG5QUkVGSVggZGN0OiA8aHR0cDovL3B1cmwub3JnL2RjL3Rlcm1zLz5cblBSRUZJWCBza29zOiA8aHR0cDovL3d3dy53My5vcmcvMjAwNC8wMi9za29zL2NvcmUjPlxuUFJFRklYIGVkbTogPGh0dHA6Ly93d3cuZXVyb3BlYW5hLmV1L3NjaGVtYXMvZWRtLz5cblBSRUZJWCBmb2FmOiA8aHR0cDovL3htbG5zLmNvbS9mb2FmLzAuMS8+XG5QUkVGSVggaGRsaDogPGh0dHBzOi8vaGRsLmhhbmRsZS5uZXQvMjAuNTAwLjExODQwL3Rlcm1tYXN0ZXI+XG5QUkVGSVggd2dzODQ6IDxodHRwOi8vd3d3LnczLm9yZy8yMDAzLzAxL2dlby93Z3M4NF9wb3MjPlxuUFJFRklYIGdlbzogPGh0dHA6Ly93d3cub3Blbmdpcy5uZXQvb250L2dlb3NwYXJxbCM+XG5QUkVGSVggc2tvczogPGh0dHA6Ly93d3cudzMub3JnLzIwMDQvMDIvc2tvcy9jb3JlIz5cblBSRUZJWCBnbjogPGh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnL29udG9sb2d5Iz5cblBSRUZJWCByZGY6IDxodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjPlxuUFJFRklYIHJkZnM6IDxodHRwOi8vd3d3LnczLm9yZy8yMDAwLzAxL3JkZi1zY2hlbWEjPlxuXG4jIGVlbiBmb3RvIHBlciBsYW5kIChtZXQgdHlwZSwgaW1nLCBsYXQgZW4gbG9uZyB2YW4gZGUgcGxhYXRzXG5TRUxFQ1QgIChTQU1QTEUoP2NobykgQVMgP2NobykgXG5cdFx0KFNBTVBMRSg/dGl0bGUpIEFTID90aXRsZSkgXG4gICAgICAgIChTQU1QTEUoP3R5cGVMYWJlbCkgQVMgP3R5cGUpIFxuICAgICAgICAoU0FNUExFKD9pbWcpIEFTID9pbWcpIFxuICAgICAgICAoU0FNUExFKD9sYXQpIEFTID9sYXQpXG4gICAgICAgIChTQU1QTEUoP2xvbmcpIEFTID9sb25nKVxuICAgICAgICA/bGFuZExhYmVsIFxuXG5XSEVSRSB7XG4gICMgdmluZCBhbGxlZW4gZm90bydzXG4gIDxodHRwczovL2hkbC5oYW5kbGUubmV0LzIwLjUwMC4xMTg0MC90ZXJtbWFzdGVyMTM5Nz4gc2tvczpuYXJyb3dlciogP3R5cGUgLlxuICA/dHlwZSBza29zOnByZWZMYWJlbCA/dHlwZUxhYmVsIC4gICBcbiAgP2NobyBlZG06b2JqZWN0ID90eXBlIC5cblxuICAjID9jaG8gZGM6dGl0bGUgP3RpdGxlIC5cbiAgP2NobyBlZG06aXNTaG93bkJ5ID9pbWcgLlxuICA/Y2hvIGRjOnRpdGxlID90aXRsZSAuXG5cbiAgIyB2aW5kIGJpaiBkZSBvYmplY3RlbiBoZXQgbGFuZFxuICA/Y2hvIGRjdDpzcGF0aWFsID9wbGFjZSAuXG4gID9wbGFjZSBza29zOmV4YWN0TWF0Y2gvZ246cGFyZW50Q291bnRyeSA/bGFuZCAuXG4gICMgP3BsYWNlIHNrb3M6cHJlZkxhYmVsID9wbGFjZU5hbWUgLlxuICA/bGFuZCBnbjpuYW1lID9sYW5kTGFiZWwgLlxuICBcbiAgIyB2aW5kIGJpaiBkZSBwbGFhdHMgdmFuIGRlIGZvdG8gZGUgbGF0L2xvbmdcbiAgP3BsYWNlIHNrb3M6ZXhhY3RNYXRjaC93Z3M4NDpsYXQgP2xhdCAuXG4gID9wbGFjZSBza29zOmV4YWN0TWF0Y2gvd2dzODQ6bG9uZyA/bG9uZyAuICAgICAgXG5cbn0gR1JPVVAgQlkgP2xhbmRMYWJlbFxuT1JERVIgQlkgP2xhbmRMYWJlbCBcbkxJTUlUIDVgXG4vL1BsZWFzZSB1c2UgeW91ciBvd24gZW5kcG9pbnQgd2hlbiB1c2luZyB0aGlzIFxuY29uc3QgZW5kcG9pbnQgPSBcImh0dHBzOi8vYXBpLmRhdGEubmV0d2Vya2RpZ2l0YWFsZXJmZ29lZC5ubC9kYXRhc2V0cy9pdm8vTk1WVy9zZXJ2aWNlcy9OTVZXLTQwL3NwYXJxbFwiXG5cbmNvbnN0IHN2ZyA9IHNlbGVjdCgnc3ZnJylcbmNvbnN0IGNpcmNsZURlbGF5ID0gMTBcbmNvbnN0IGNpcmNsZVNpemUgPSA4XG5jb25zdCBwcm9qZWN0aW9uID0gZ2VvTmF0dXJhbEVhcnRoMSgpXG5jb25zdCBwYXRoR2VuZXJhdG9yID0gZ2VvUGF0aCgpLnByb2plY3Rpb24ocHJvamVjdGlvbilcblxuc2V0dXBNYXAoKVxuZHJhd01hcCgpXG5wbG90TG9jYXRpb25zKClcblxuZnVuY3Rpb24gc2V0dXBNYXAoKXtcbiAgc3ZnXG4gICAgLmFwcGVuZCgncGF0aCcpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ3NwaGVyZScpXG4gICAgLmF0dHIoJ2QnLCBwYXRoR2VuZXJhdG9yKHsgdHlwZTogJ1NwaGVyZScgfSkpXG59XG5cbmZ1bmN0aW9uIGRyYXdNYXAoKSB7XG4gIGQzLmpzb24oJ2h0dHBzOi8vdW5wa2cuY29tL3dvcmxkLWF0bGFzQDEuMS40L3dvcmxkLzExMG0uanNvbicpLnRoZW4oZGF0YSA9PiB7XG4gICAgY29uc3QgY291bnRyaWVzID0gZmVhdHVyZShkYXRhLCBkYXRhLm9iamVjdHMuY291bnRyaWVzKTtcbiAgICBzdmdcbiAgICAgIC5zZWxlY3RBbGwoJ3BhdGgnKVxuICAgICAgLmRhdGEoY291bnRyaWVzLmZlYXR1cmVzKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ2NvdW50cnknKVxuICAgICAgLmF0dHIoJ2QnLCBwYXRoR2VuZXJhdG9yKVxuICB9KVxufVxuXG5mdW5jdGlvbiBwbG90TG9jYXRpb25zKCkge1xuICBmZXRjaChlbmRwb2ludCArXCI/cXVlcnk9XCIrIGVuY29kZVVSSUNvbXBvbmVudChxdWVyeSkgKyBcIiZmb3JtYXQ9anNvblwiKVxuICAgIC50aGVuKGRhdGEgPT4gZGF0YS5qc29uKCkpXG4gIFx0LnRoZW4oanNvbiA9PiBqc29uLnJlc3VsdHMuYmluZGluZ3MpXG4gICAgLnRoZW4ocmVzdWx0cyA9PiB7XG4gICAgLy9UT0RPOiBjbGVhbiB1cCByZXN1bHRzIGluIHNlcGFyYXRlIGZ1bmN0aW9uXG4gICAgXHRyZXN1bHRzLmZvckVhY2gocmVzdWx0ID0+IHtcbiAgICAgICAgcmVzdWx0LmxhdCA9IE51bWJlcihyZXN1bHQubGF0LnZhbHVlKVxuICAgICAgICByZXN1bHQubG9uZyA9IE51bWJlcihyZXN1bHQubG9uZy52YWx1ZSlcbiAgICAgIH0pICAgIFxuICAgIFx0Y29uc29sZS5sb2cocmVzdWx0cylcbiAgICAgIFxuICAgIHN2Z1xuICAgICAgICAuc2VsZWN0QWxsKCdjaXJjbGUnKVxuICAgICAgICAuZGF0YShyZXN1bHRzKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCdpbWFnZScpXG4gICAgXHQgIC5hdHRyKFwiY2xhc3NcIiwgXCJub2Rlc1wiKVxuICAgIFx0XHQuYXR0cihcInhsaW5rOmhyZWZcIiwgZCA9PiBkLmltZy52YWx1ZSlcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2NpcmNsZXMnKVxuICAgICAgICAuYXR0cigneCcsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdGlvbihbZC5sb25nLCBkLmxhdF0pWzBdXG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCd5JywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtkLmxvbmcsIGQubGF0XSlbMV1cbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ3InLCAnNXB4JylcbiAgICBcdFx0LmF0dHIoJ2ZpbGwnLCd1cmwoXCJodHRwczovL2Nvbm5lY3Rvcmljb25zLXByb2QuYXp1cmVlZGdlLm5ldC9rdXN0by9pY29uXzEuMC4xMDI3LjEyMTAucG5nXCIpJylcbiAgfSlcbn1cbiJdLCJuYW1lcyI6WyJzZWxlY3QiLCJnZW9OYXR1cmFsRWFydGgxIiwiZ2VvUGF0aCIsImZlYXR1cmUiXSwibWFwcGluZ3MiOiI7OztFQUdBLE1BQU0sS0FBSyxHQUFHLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTZDUixFQUFDOztFQUVSLE1BQU0sUUFBUSxHQUFHLHVGQUFzRjs7RUFFdkcsTUFBTSxHQUFHLEdBQUdBLFdBQU0sQ0FBQyxLQUFLLEVBQUM7QUFDekIsRUFFQSxNQUFNLFVBQVUsR0FBR0MscUJBQWdCLEdBQUU7RUFDckMsTUFBTSxhQUFhLEdBQUdDLFlBQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUM7O0VBRXRELFFBQVEsR0FBRTtFQUNWLE9BQU8sR0FBRTtFQUNULGFBQWEsR0FBRTs7RUFFZixTQUFTLFFBQVEsRUFBRTtJQUNqQixHQUFHO09BQ0EsTUFBTSxDQUFDLE1BQU0sQ0FBQztPQUNkLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO09BQ3ZCLElBQUksQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUM7R0FDaEQ7O0VBRUQsU0FBUyxPQUFPLEdBQUc7SUFDakIsRUFBRSxDQUFDLElBQUksQ0FBQyxxREFBcUQsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUk7TUFDMUUsTUFBTSxTQUFTLEdBQUdDLGdCQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7TUFDeEQsR0FBRztTQUNBLFNBQVMsQ0FBQyxNQUFNLENBQUM7U0FDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7U0FDeEIsS0FBSyxFQUFFO1NBQ1AsTUFBTSxDQUFDLE1BQU0sQ0FBQztTQUNkLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO1NBQ3hCLElBQUksQ0FBQyxHQUFHLEVBQUUsYUFBYSxFQUFDO0tBQzVCLEVBQUM7R0FDSDs7RUFFRCxTQUFTLGFBQWEsR0FBRztJQUN2QixLQUFLLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxjQUFjLENBQUM7T0FDbkUsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7TUFDMUIsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztPQUNsQyxJQUFJLENBQUMsT0FBTyxJQUFJOztPQUVoQixPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSTtVQUN2QixNQUFNLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQztVQUNyQyxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBQztTQUN4QyxFQUFDO09BQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUM7O01BRXJCLEdBQUc7V0FDRSxTQUFTLENBQUMsUUFBUSxDQUFDO1dBQ25CLElBQUksQ0FBQyxPQUFPLENBQUM7V0FDYixLQUFLLEVBQUU7V0FDUCxNQUFNLENBQUMsT0FBTyxDQUFDO1VBQ2hCLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO1NBQ3ZCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1dBQ2xDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO1dBQ3hCLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDckIsT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUN0QyxDQUFDO1dBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsRUFBRTtZQUNyQixPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQ3RDLENBQUM7V0FDRCxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztTQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLCtFQUErRSxFQUFDO0tBQ2hHLEVBQUM7R0FDSDs7OzsifQ==