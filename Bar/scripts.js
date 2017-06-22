d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json", function(error, json) {
  if (error) {
    console.log(error);
  } else {
    startCharting(json);
  }
})

function startCharting(j) {
  console.log(j)
  var data = j.data;
  //var date = new Date(data[0][0]);
  //var y = date.getFullYear();
  //console.log(y);
  const w = 800;
  const h = 500;
  const padding = 60;
    
  const xScale = d3.scaleLinear()
                   .domain([d3.min(data, (d) => {
                     //https://stackoverflow.com/questions/5619202/converting-string-to-date-in-js
                     //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
                     let date = new Date(d[0]);//even if its converted in local time, it works for the x coordinate localization that woud be the same
                     let year = date.getFullYear();
                     return year;
                   }), d3.max(data, (d) => {
                     let date = new Date(d[0]);
                     let year = date.getFullYear();
                     return year;
                   })])
                   .range([padding, w - padding]);
  const xScaleCoo = d3.scaleLinear()
                   .domain([d3.min(data, (d) => {
                     let date = new Date(d[0]);
                     return date;
                   }), d3.max(data, (d) => {
                     let date = new Date(d[0]);
                     return date;
                   })])
                   .range([padding, w - padding]);
    
  const yScaleAxis = d3.scaleLinear()
                   .domain([0, d3.max(data, (d) => d[1])])
                   .range([h - padding, padding]);
  const yScale = d3.scaleLinear()
                   .domain([0, d3.max(data, (d) => d[1])])
                   .range([0, h - padding * 2]);
  
  //create svg in body
  const svg = d3.select("#chartHolder")
                .append("svg")
                .attr("width", w)
                .attr("height", h);
    
  const xAxis = d3.axisBottom(xScale);
  svg.append("g")
     .attr("id", "x-axis")
     .attr("transform", "translate(0," + (h - padding) + ")")
     .call(xAxis.tickFormat(d3.format("0000")));

  const yAxis = d3.axisLeft(yScaleAxis);
  svg.append("g")
     .attr("id", "y-axis")
     .attr("transform", "translate(" + padding + ", 0)")
     .call(yAxis)
   
  svg.append("text") 
     .attr("text-anchor", "middle")
     .attr("transform", "translate(" + (padding + 25) + ",  " + (h/2 - 10) + ")rotate(-90)")
     .attr("class", "subttl")
     .text("Gross Domestic Product");
      

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("width", ((w - padding) / data.length))
    .attr("height", (d) => yScale(d[1]))
    .attr("x", (d) => {
      let date = new Date(d[0]);
      return xScaleCoo(date)
    })
    .attr("y", (d) => yScaleAxis(d[1]))
    .attr("class", "bar")
    .attr("data-date", (d) => d[0])
    .attr("data-gdp", (d) => d[1])
    .append("title")
    .text((d) => quarter(d[0]) + "\n$" + d[1] + " Billion")
    .attr("id", "tooltip")
    .attr("data-date", (d) => d[0])
}

function quarter(d) {
  let date = new Date(d);
  let q = ""
      if (date.getMonth() + 1 < 3 || date.getMonth() + 1 == 12) {
        q = "Q1"
      } 
      else if (date.getMonth() + 1 < 6) {
        q = "Q2"
      }
      else if (date.getMonth() + 1 < 9) {
        q = "Q3"
      }
      else if (date.getMonth() + 1 < 12) {
        q = "Q4"
      }
      else {
        q = "error"
        console.log(date.getMonth())
      }
  return date.getFullYear() + " " + q;
}