d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", function(error, json) {
  if (error) {
    console.log(error);
  } else {
    startCharting(json);
  }
})

function startCharting(j) {
    //console.log(j)
  /* 
  **Array of objects received in the form: 
  Doping:"Alleged drug use during 1995 due to high hematocrit levels"
  Name:"Marco Pantani"
  Nationality:"ITA"
  Place:1
  Seconds:2210
  Time:"36:50"
  URL:"https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"
  Year:1995
  */ 
    const w = 800;
    const h = 600;
    const padding = 60;
    
    const xScaleAxis = d3.scaleLinear()
                     .domain([d3.min(j, (d) => d.Year) - 1, d3.max(j, (d) => d.Year) + 1]) // el - 1 en min y + 1 en max, es para que no esté al borde la información
                     .range([padding, w - padding]);
    
    const yScaleAxis = d3.scaleLinear()
                     .domain([d3.max(j, (d) => d.Seconds) , d3.min(j, (d) => d.Seconds)]) //inverted y axis ([max, min])
                     .range([h - padding, padding]);

    const svg = d3.select("#chartHolder")
                  .append("svg")
                  .attr("width", w)
                  .attr("height", h);
                  
    const xAxis = d3.axisBottom(xScaleAxis)
                    .tickFormat(d3.format("0000")); //https://bl.ocks.org/mbostock/9764126
    svg.append("g")
       .attr("transform", "translate(0," + (h - padding) + ")")
       .attr("id", "x-axis")
       .call(xAxis); 
    
    const yAxis = d3.axisLeft(yScaleAxis)
                    .tickFormat((d) => {
                      var div = d / 60; //-> min.decimalSec
                      var min = Math.floor(div)//minutes integer
                      var sec = Math.round((div - min) * 60) //seconds
                      var secStr = "" + sec
                      while (secStr.length < 2) {secStr = "0" + secStr;}
                      //console.log(secStr)
                      return (min + ":" + secStr) //return format -> mm:ss
                    });
    svg.append("g")
      .attr("transform", "translate(" + padding + ", 0)")
      .attr("id", "y-axis")
      .call(yAxis);
    
    svg.selectAll("circle")
       .data(j)
       .enter()
       .append("a")
       .attr("href", (d) => d.URL)
       .attr("target", "_blank")
       .append("circle")
       .attr("cx", (d) => xScaleAxis(d.Year))
       .attr("cy",(d) => yScaleAxis(d.Seconds))
       .attr("r", (d) => 4)
       //.attr("class", "dot") se debe de poner sólo una "class attribute
       .attr("data-xvalue", (d) => d.Year)
       .attr("data-yvalue", (d) => d.Seconds)
       .attr("class", (d) => {
          if (d.Doping == "") {
            return "dot noDop";
          } else {
            return "dot yesDop";
          }
        })
       .append("title")
       .attr("id", "tooltip")
       .text((d) => {
          var div = d.Seconds / 60; //-> min.decimalSec
          var min = Math.floor(div)//minutes integer
          var sec = Math.round((div - min) * 60) //seconds
          var secStr = "" + sec
          while (secStr.length < 2) {secStr = "0" + secStr;}
          return "Name: " + d.Name + "\nNationality: " + d.Nationality + "\nYear: " + d.Year + "\nTime: " + min + ":" + secStr;
        });
  
    svg.append("text") 
     .attr("text-anchor", "middle")
     .attr("transform", "translate(" + (padding - 45) + ",  " + (h/2) + ")rotate(-90)")
     .attr("class", "subttl")
     .text("Time in minutes");
  
    var states = ["No doping allegations", "With doping allegations"]
    var legend = svg.selectAll(".legend")
      .data(states)
      .enter()
      .append("g")
      .attr("id", "legend")
      .attr("transform", function(d, i) {
        return "translate(0," + (h/2 - i * 20) + ")";
      });

    legend.append("circle")
      .attr("cx", w - 20)
      .attr("r", 7)
      .attr("cy", 11)
      .attr("class", (d) => {
        if (d == "No doping allegations") {
          return "legend noDop";
        } else {
          return "legend yesDop";
        }
      });

    legend.append("text")
      .attr("x", w - 34)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text((d) => (d));

}