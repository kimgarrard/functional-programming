# Functional-programming

## Het concept
Ik wil een wereldkaart maken, waarop alle foto's uit de collectie worden geplot. Je kunt hierdoor de foto's zien op de kaart, en zien waar ze zijn gemaakt. Later wil ik nog interactie toevoegen, dat je door de tijd kan klikken en dat je dan de foto's ziet veranderen. 
 
![WorldMap_CollageTitle2](https://user-images.githubusercontent.com/43337685/68288942-95acc680-0085-11ea-867f-2aeae3dbbf95.png)

## Data

De data die ik heb gebruikt komt van https://collectie.wereldculturen.nl/. Dit is een verzameling van allerlei objecten over de hele wereld van vroeger. Deze data is enorm breed en kan variëren van maskers uit Afrika tot foto's van dansende mensen in Azië. Om de data op te halen gebruik ik SPARQL, dit is mijn code:

```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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

SELECT ?cho ?title ?typeLabel ?img ?placeName ?lat ?long WHERE {

  <https://hdl.handle.net/20.500.11840/termmaster1397> skos:narrower* ?type .
  ?type skos:prefLabel ?typeLabel .
  
  ?cho dc:title ?title .
  ?cho edm:isShownBy ?img .
  ?cho dct:spatial ?place .
  ?place skos:prefLabel ?placeName . 
  ?place skos:exactMatch/wgs84:lat ?lat .
  ?place skos:exactMatch/wgs84:long ?long .
  
}
```

## Features

- [ ] Foto's geplot op een wereldkaart
- [ ] Klikken door de tijd, je ziet de verandering van de foto's
- [ ] Klikken op de foto's, je ziet de foto groot met een title en beschrijving. 

## Bronnen
* [Clean Data](https://www.freecodecamp.org/news/the-junior-developers-guide-to-writing-super-clean-and-readable-code-cd2568e08aae/)
* [Functional Programming doc](https://docs.google.com/presentation/d/1ynCL4B4DyQ65V3cvjfZvbT2a9YrITbhUUUICoOjAP4c/edit#slide=id.g7081ab7627_0_38)

## Wat ik heb geleerd
* Data opschonen
* SPARQL meer leren
