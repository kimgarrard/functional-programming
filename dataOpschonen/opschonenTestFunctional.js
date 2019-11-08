let geboortedata = `06-04-00
01-04-00
27-08-95
08-03-00
09-05-96
08-07-97
07-04-95
23-10-96
25-03-19

24-03-97
29-08-93
02-02-97
28-05-00
09-12-19
15-03-91
06-04-96
23-07-95
21-05-97

02-10-95
27-07-97
21-09-99
05-10-94
09-01-93
15-10-98
16-07-98
03-07-98
10-02-97
11-12-97
17-08-95
01-06-97
12-04-95
16-09-96
11-12-93
28-11-97
20-11-95
11-04-94
25-11-96
11-04-98
27-03-98
23-05-97
29-08-94
07-02-93
28-09-96
05-07-94
11-07-98
31-07-97
03-11-97
12-09-97
20-03-99
29-07-90
16-03-98
23-11-95
04-07-98
13-04-96
27-01-97
25-11-98
27-01-19
01-04-19
24-01-95
11-01-99
17-10-96
12-05-19
01-08-19
17-07-99
07-05-00
18-08-00
08-11-19
30-07-97
01-03-95
08-10-99
06-07-97
29-10-94
1/1/0001
03-09-92
09-04-19
29-04-97
02-01-97
02-12-98

08-01-96`
    .split("\n");


// Main function
function main(data) {
  return data.map((el) => {
    return el = replaceSlashes(el)
    return el = replaceYear2019(el)
    return el = makeSameDataStructure(el)
  })
}

// replaceSlashes function
function replaceSlashes(el) {
  el = el.replace(/\//g, "-")
}

// replaceYear2019 function
function replaceYear2019(el) {
  if(el.endsWith("19")) el = ""
}

// replace makeSameDataStructure function
function makeSameDataStructure() {
  el = el.split("-")
  if (el[0].length == 1) {
    el[0] = "0"+el[0];

  if (el[1].length == 1) el[1] = "0"+el[1];

  if (el[2].length > 2) el[2] = el[2].slice(-2);
  }

  el = el.join().replace(/\,/g, "-")
}

console.log(main(geboortedata))
