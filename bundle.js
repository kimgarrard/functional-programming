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
LIMIT 10`;
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
          result.img = result.img.value.replace('http', 'https');
        });    
      	console.log(results);
        
      svg
          .selectAll('circle')
          .data(results)
          .enter()
          .append('image')
      		.attr("class", "nodes")
      		.attr("xlink:href", d => d.img)
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNlbGVjdCwganNvbiwgZ2VvUGF0aCwgZ2VvTmF0dXJhbEVhcnRoMSB9IGZyb20gJ2QzJztcbmltcG9ydCB7IGZlYXR1cmUgfSBmcm9tICd0b3BvanNvbic7XG5cbmNvbnN0IHF1ZXJ5ID0gYFBSRUZJWCByZGY6IDxodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjPlxuUFJFRklYIGRjOiA8aHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8+XG5QUkVGSVggZGN0OiA8aHR0cDovL3B1cmwub3JnL2RjL3Rlcm1zLz5cblBSRUZJWCBza29zOiA8aHR0cDovL3d3dy53My5vcmcvMjAwNC8wMi9za29zL2NvcmUjPlxuUFJFRklYIGVkbTogPGh0dHA6Ly93d3cuZXVyb3BlYW5hLmV1L3NjaGVtYXMvZWRtLz5cblBSRUZJWCBmb2FmOiA8aHR0cDovL3htbG5zLmNvbS9mb2FmLzAuMS8+XG5QUkVGSVggaGRsaDogPGh0dHBzOi8vaGRsLmhhbmRsZS5uZXQvMjAuNTAwLjExODQwL3Rlcm1tYXN0ZXI+XG5QUkVGSVggd2dzODQ6IDxodHRwOi8vd3d3LnczLm9yZy8yMDAzLzAxL2dlby93Z3M4NF9wb3MjPlxuUFJFRklYIGdlbzogPGh0dHA6Ly93d3cub3Blbmdpcy5uZXQvb250L2dlb3NwYXJxbCM+XG5QUkVGSVggc2tvczogPGh0dHA6Ly93d3cudzMub3JnLzIwMDQvMDIvc2tvcy9jb3JlIz5cblBSRUZJWCBnbjogPGh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnL29udG9sb2d5Iz5cblBSRUZJWCByZGY6IDxodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjPlxuUFJFRklYIHJkZnM6IDxodHRwOi8vd3d3LnczLm9yZy8yMDAwLzAxL3JkZi1zY2hlbWEjPlxuXG4jIGVlbiBmb3RvIHBlciBsYW5kIChtZXQgdHlwZSwgaW1nLCBsYXQgZW4gbG9uZyB2YW4gZGUgcGxhYXRzXG5TRUxFQ1QgIChTQU1QTEUoP2NobykgQVMgP2NobykgXG5cdFx0KFNBTVBMRSg/dGl0bGUpIEFTID90aXRsZSkgXG4gICAgICAgIChTQU1QTEUoP3R5cGVMYWJlbCkgQVMgP3R5cGUpIFxuICAgICAgICAoU0FNUExFKD9pbWcpIEFTID9pbWcpIFxuICAgICAgICAoU0FNUExFKD9sYXQpIEFTID9sYXQpXG4gICAgICAgIChTQU1QTEUoP2xvbmcpIEFTID9sb25nKVxuICAgICAgICA/bGFuZExhYmVsIFxuXG5XSEVSRSB7XG4gICMgdmluZCBhbGxlZW4gZm90bydzXG4gIDxodHRwczovL2hkbC5oYW5kbGUubmV0LzIwLjUwMC4xMTg0MC90ZXJtbWFzdGVyMTM5Nz4gc2tvczpuYXJyb3dlciogP3R5cGUgLlxuICA/dHlwZSBza29zOnByZWZMYWJlbCA/dHlwZUxhYmVsIC4gICBcbiAgP2NobyBlZG06b2JqZWN0ID90eXBlIC5cblxuICAjID9jaG8gZGM6dGl0bGUgP3RpdGxlIC5cbiAgP2NobyBlZG06aXNTaG93bkJ5ID9pbWcgLlxuICA/Y2hvIGRjOnRpdGxlID90aXRsZSAuXG5cbiAgIyB2aW5kIGJpaiBkZSBvYmplY3RlbiBoZXQgbGFuZFxuICA/Y2hvIGRjdDpzcGF0aWFsID9wbGFjZSAuXG4gID9wbGFjZSBza29zOmV4YWN0TWF0Y2gvZ246cGFyZW50Q291bnRyeSA/bGFuZCAuXG4gICMgP3BsYWNlIHNrb3M6cHJlZkxhYmVsID9wbGFjZU5hbWUgLlxuICA/bGFuZCBnbjpuYW1lID9sYW5kTGFiZWwgLlxuICBcbiAgIyB2aW5kIGJpaiBkZSBwbGFhdHMgdmFuIGRlIGZvdG8gZGUgbGF0L2xvbmdcbiAgP3BsYWNlIHNrb3M6ZXhhY3RNYXRjaC93Z3M4NDpsYXQgP2xhdCAuXG4gID9wbGFjZSBza29zOmV4YWN0TWF0Y2gvd2dzODQ6bG9uZyA/bG9uZyAuICAgICAgXG5cbn0gR1JPVVAgQlkgP2xhbmRMYWJlbFxuT1JERVIgQlkgP2xhbmRMYWJlbCBcbkxJTUlUIDEwYFxuLy9QbGVhc2UgdXNlIHlvdXIgb3duIGVuZHBvaW50IHdoZW4gdXNpbmcgdGhpcyBcbmNvbnN0IGVuZHBvaW50ID0gXCJodHRwczovL2FwaS5kYXRhLm5ldHdlcmtkaWdpdGFhbGVyZmdvZWQubmwvZGF0YXNldHMvaXZvL05NVlcvc2VydmljZXMvTk1WVy00MC9zcGFycWxcIlxuXG5jb25zdCBzdmcgPSBzZWxlY3QoJ3N2ZycpXG5jb25zdCBjaXJjbGVEZWxheSA9IDEwXG5jb25zdCBjaXJjbGVTaXplID0gOFxuY29uc3QgcHJvamVjdGlvbiA9IGdlb05hdHVyYWxFYXJ0aDEoKVxuY29uc3QgcGF0aEdlbmVyYXRvciA9IGdlb1BhdGgoKS5wcm9qZWN0aW9uKHByb2plY3Rpb24pXG5cbnNldHVwTWFwKClcbmRyYXdNYXAoKVxucGxvdExvY2F0aW9ucygpXG5cbmZ1bmN0aW9uIHNldHVwTWFwKCl7XG4gIHN2Z1xuICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgIC5hdHRyKCdjbGFzcycsICdzcGhlcmUnKVxuICAgIC5hdHRyKCdkJywgcGF0aEdlbmVyYXRvcih7IHR5cGU6ICdTcGhlcmUnIH0pKVxufVxuXG5mdW5jdGlvbiBkcmF3TWFwKCkge1xuICBkMy5qc29uKCdodHRwczovL3VucGtnLmNvbS93b3JsZC1hdGxhc0AxLjEuNC93b3JsZC8xMTBtLmpzb24nKS50aGVuKGRhdGEgPT4ge1xuICAgIGNvbnN0IGNvdW50cmllcyA9IGZlYXR1cmUoZGF0YSwgZGF0YS5vYmplY3RzLmNvdW50cmllcyk7XG4gICAgc3ZnXG4gICAgICAuc2VsZWN0QWxsKCdwYXRoJylcbiAgICAgIC5kYXRhKGNvdW50cmllcy5mZWF0dXJlcylcbiAgICAgIC5lbnRlcigpXG4gICAgICAuYXBwZW5kKCdwYXRoJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdjb3VudHJ5JylcbiAgICAgIC5hdHRyKCdkJywgcGF0aEdlbmVyYXRvcilcbiAgfSlcbn1cblxuZnVuY3Rpb24gcGxvdExvY2F0aW9ucygpIHtcbiAgZmV0Y2goZW5kcG9pbnQgK1wiP3F1ZXJ5PVwiKyBlbmNvZGVVUklDb21wb25lbnQocXVlcnkpICsgXCImZm9ybWF0PWpzb25cIilcbiAgICAudGhlbihkYXRhID0+IGRhdGEuanNvbigpKVxuICBcdC50aGVuKGpzb24gPT4ganNvbi5yZXN1bHRzLmJpbmRpbmdzKVxuICAgIC50aGVuKHJlc3VsdHMgPT4ge1xuICAgIC8vVE9ETzogY2xlYW4gdXAgcmVzdWx0cyBpbiBzZXBhcmF0ZSBmdW5jdGlvblxuICAgIFx0cmVzdWx0cy5mb3JFYWNoKHJlc3VsdCA9PiB7XG4gICAgICAgIHJlc3VsdC5sYXQgPSBOdW1iZXIocmVzdWx0LmxhdC52YWx1ZSlcbiAgICAgICAgcmVzdWx0LmxvbmcgPSBOdW1iZXIocmVzdWx0LmxvbmcudmFsdWUpXG4gICAgICAgIHJlc3VsdC5pbWcgPSByZXN1bHQuaW1nLnZhbHVlLnJlcGxhY2UoJ2h0dHAnLCAnaHR0cHMnKVxuICAgICAgfSkgICAgXG4gICAgXHRjb25zb2xlLmxvZyhyZXN1bHRzKVxuICAgICAgXG4gICAgc3ZnXG4gICAgICAgIC5zZWxlY3RBbGwoJ2NpcmNsZScpXG4gICAgICAgIC5kYXRhKHJlc3VsdHMpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ2ltYWdlJylcbiAgICBcdFx0LmF0dHIoXCJjbGFzc1wiLCBcIm5vZGVzXCIpXG4gICAgXHRcdC5hdHRyKFwieGxpbms6aHJlZlwiLCBkID0+IGQuaW1nKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnY2lyY2xlcycpXG4gICAgICAgIC5hdHRyKCd4JywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtkLmxvbmcsIGQubGF0XSlbMF1cbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ3knLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW2QubG9uZywgZC5sYXRdKVsxXVxuICAgICAgICB9KVxuICAgICAgICAuYXR0cigncicsICc1cHgnKVxuICAgIFx0XHQuYXR0cignZmlsbCcsJ3VybChcImh0dHBzOi8vY29ubmVjdG9yaWNvbnMtcHJvZC5henVyZWVkZ2UubmV0L2t1c3RvL2ljb25fMS4wLjEwMjcuMTIxMC5wbmdcIiknKVxuICB9KVxufVxuIl0sIm5hbWVzIjpbInNlbGVjdCIsImdlb05hdHVyYWxFYXJ0aDEiLCJnZW9QYXRoIiwiZmVhdHVyZSJdLCJtYXBwaW5ncyI6Ijs7O0VBR0EsTUFBTSxLQUFLLEdBQUcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBNkNQLEVBQUM7O0VBRVQsTUFBTSxRQUFRLEdBQUcsdUZBQXNGOztFQUV2RyxNQUFNLEdBQUcsR0FBR0EsV0FBTSxDQUFDLEtBQUssRUFBQztBQUN6QixFQUVBLE1BQU0sVUFBVSxHQUFHQyxxQkFBZ0IsR0FBRTtFQUNyQyxNQUFNLGFBQWEsR0FBR0MsWUFBTyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBQzs7RUFFdEQsUUFBUSxHQUFFO0VBQ1YsT0FBTyxHQUFFO0VBQ1QsYUFBYSxHQUFFOztFQUVmLFNBQVMsUUFBUSxFQUFFO0lBQ2pCLEdBQUc7T0FDQSxNQUFNLENBQUMsTUFBTSxDQUFDO09BQ2QsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7T0FDdkIsSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBQztHQUNoRDs7RUFFRCxTQUFTLE9BQU8sR0FBRztJQUNqQixFQUFFLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSTtNQUMxRSxNQUFNLFNBQVMsR0FBR0MsZ0JBQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztNQUN4RCxHQUFHO1NBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQztTQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztTQUN4QixLQUFLLEVBQUU7U0FDUCxNQUFNLENBQUMsTUFBTSxDQUFDO1NBQ2QsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUM7U0FDeEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUM7S0FDNUIsRUFBQztHQUNIOztFQUVELFNBQVMsYUFBYSxHQUFHO0lBQ3ZCLEtBQUssQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxHQUFHLGNBQWMsQ0FBQztPQUNuRSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztNQUMxQixJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO09BQ2xDLElBQUksQ0FBQyxPQUFPLElBQUk7O09BRWhCLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJO1VBQ3ZCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDO1VBQ3JDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDO1VBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUM7U0FDdkQsRUFBQztPQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFDOztNQUVyQixHQUFHO1dBQ0UsU0FBUyxDQUFDLFFBQVEsQ0FBQztXQUNuQixJQUFJLENBQUMsT0FBTyxDQUFDO1dBQ2IsS0FBSyxFQUFFO1dBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQztTQUNqQixJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztTQUN0QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDO1dBQzVCLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO1dBQ3hCLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDckIsT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUN0QyxDQUFDO1dBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsRUFBRTtZQUNyQixPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQ3RDLENBQUM7V0FDRCxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztTQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLCtFQUErRSxFQUFDO0tBQ2hHLEVBQUM7R0FDSDs7OzsifQ==