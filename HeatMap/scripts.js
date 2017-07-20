d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json", function(error, json) {
  if (error) {
    console.log(error);
  } else {
    startCharting(json);
    /*
      Object of the form:
      {
        baseTemperature: 
        monthlyVAriance: [{ //3153 elements
          { month: 1 // [1 - 12]
            variance: 1.32
            year: 1748
          }
          [...]
        }]
      }
    */
  }
});

function startCharting(j) {
  //console.log(j)
  const baseTemp = j.baseTemperature;
  const data = j.monthlyVariance;
  
  const w = 1200;
  const h = 600;
  const padding = 100;
  
  const minY = d3.min(data, (d) => d.month);
  const maxY = d3.max(data, (d) => d.month);
  const minX = d3.min(data, (d) => d.year); //1753
  const maxX = d3.max(data, (d) => d.year); //2015
  const maxVar = d3.max(data, (d) => d.variance);
  const minVar = d3.min(data, (d) => d.variance);
  //console.log("minY: " + minY + " maxY: " + maxY);
  //console.log("minVar: " + minVar + " maxVar: " + maxVar)
  const rangeVar = maxVar - minVar;
  
  const xAxiScale = d3.scaleLinear()
    .domain([minX, maxX])
    .range([padding, w - padding]);
  const xScale = xAxiScale;
  //console.log(d3.max(data, (d) => d.year)) //2105
  const yAxiScale = d3.scaleLinear()
    .domain([maxY, minY])
    .range([h - padding, padding]);
  const yScale = yAxiScale;
  
  const svg = d3.select("#chartHolder").append("svg")
                .attr("width", w)
                .attr("height", h);
  
  const xAxis = d3.axisBottom(xAxiScale);
  const yAxis = d3.axisLeft(yAxiScale)
    .tickFormat((d) => numToMonth(d));
  
  svg.append("g")
    .attr("id", "x-axis")
    .attr("class", "axisLabel")
    .attr("transform", "translate(0, " + (h - padding) + ")")
    .call(xAxis.tickFormat(d3.format("0000")));
  
  const yAxisCall = svg.append("g")
    .attr("id", "y-axis")
    .attr("class", "axisLabel")
    .attr("transform", "translate(" + padding + ", " + (- (h - padding) / ((maxY - minY + 1) * 2)) + ")") //para centrar las leyendas de los meses : (- (h - padding) / ((maxY - minY + 1) * 2))
    .call(yAxis);
  yAxisCall.selectAll("line").remove(); //remove the little horizontal lines
  yAxisCall.select(".domain").remove(); //remove the vertical line
    
   //append the lejend for the colors
  const numColors = 12;
  const arrColors = [];
  const wLeg = 400;
  const hLeg = 20;
  for (var j = 1; j <= numColors; j ++) {
    arrColors.push(Math.round(((rangeVar / numColors) * j) * 10) / 10)
  }
  var legend = svg.selectAll(".legend")
    .data(arrColors)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => {
      return "translate(" + (w - padding - wLeg) + ", " + (h - padding + hLeg + 15) + ")";
    })
  legend.append("rect") 
    .attr("class", "legRect")
    .attr("width", wLeg / (numColors))
    .attr("height", hLeg)
    .attr("x", (d, i) => {
      return i * wLeg / numColors;
    })
    .attr("fill", (d, i) => {
      const op = d / rangeVar;
      return d3.interpolateSpectral(1 - op); 
    })
  legend.append("text")
    .attr("class", "textLeg")
    .attr("width", wLeg / (numColors))
    .attr("height", hLeg)
    .attr("x", (d, i) => {
      return i * wLeg / numColors + 7;
    })
    .attr("y", (d) => {
      return hLeg * 2 - 5;
    })
    .text((d) => (d))
  
  //console.log(((h - padding) / (maxY - minY + 1)))
  var tmp = svg.selectAll("rect")
    .data(data);
  
  var tmpMod = tmp.enter()
    .append("rect")
    .attr("width", ((w - padding * 2)  / (maxX - minX + 1)))
    .attr("height", ((h - padding * 2) / (maxY - minY))) // here we don't apply the "+ 1" because if we do, there's space  between rects
    .attr("x", (d) => {
      return xScale(d.year);
    })
    .attr("y", (d) => yScale(d.month - 1))
    .attr("class", "bar")
    .attr("fill", (d) => {
      const op = (d.variance - minVar) / rangeVar;
      return d3.interpolateSpectral(1 - op); 
      //https://github.com/d3/d3-scale-chromatic
      //http://bl.ocks.org/jfreyre/b1882159636cc9e1283a
    })
    .attr("data-year", (d) => d.year)
    .attr("data-month", (d) => d.month);
  
  //put the tooltip rect elements (as the FCC example, couldn't find my way to this dynamic tool tip and not the "standard one")
  //ups.. just found some examples: https://bl.ocks.org/mbostock/1087001
  var div = d3.select("#chartHolder").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  tmpMod.on("mouseover", function(d) {
      // the fact of having the "div" variable with that ONE div in the chart, 
      //let us to move the div wherever twe want with the next charachteristics
      //I repeat, is ONE div that we move wherever we need it to be
      div.transition()
        .duration(100)
        .style("opacity", 0.8);
      div.html("<span class='year'>" + d.year + " - " + numToMonth(d.month) + "</span><br>" +
          "<span class='temperature'>" + (Math.floor((d.variance + baseTemp) * 1000) / 1000) + " &#8451" + "</span><br>" +
          "<span class='variance'>" + d.variance + " &#8451" + "</span>")
        //let's give the place whre the tool tip will apear
        .style("left", (d3.event.pageX - ($('.tooltip').width()/2)) + "px")
        .style("top", (d3.event.pageY - 75) + "px");
        //d3.event.pageX/Y returns the X/Y coordinate related to the SVG, that way you can display correctly the tooltip, in this case (tiny elements, because the event is triggered just once and it doesn't follow the mouse movement, but that could be fixed if needed triggering maybe another type of event)
    })
    .on("mouseout", function(d) {
      div.transition()
        .duration(200)
        .style("opacity", 0);
    });
  /*
    With this we got a div of the form: 
    <div class="tooltip" style="opacity: 0.8; left:...; top: ...>
      <span class="year"> {content} </span>
      <span class="temperature"> {content} </span>
      <span class="variance"> {content} </span>
    </div>
  */
  
  //append the titles of axes
  svg.append("text") 
     .attr("text-anchor", "middle")
     .attr("transform", "translate(" + (padding - 85) + ",  " + (h/2 - 10) + ")rotate(-90)")
     .attr("class", "subttl")
     .text("Months");
   svg.append("text") 
     .attr("text-anchor", "middle")
     .attr("transform", "translate(" + ((w / 2) - 100) + ",  " + (h - padding / 2) + ")rotate(0)")
     .attr("class", "subttl")
     .text("Years");
  
 
    
}

/*
  Convert number [1-12] to a string month
*/
function numToMonth(n) {
  const m = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ];
  return m[n - 1];
}
