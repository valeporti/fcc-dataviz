d3.json("https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json", function(error, json) {
  if (error) {
    console.log(error);
  } else {
    startCharting(json);
    /*
     {
      "nodes": [
		    { "country": "East Timor", "code": "tl" },
        ...]
      "links": [
		    { "target": 66, "source": 0 },
        ...]
     }
    */
  }
});


/*
  Understand how to do the force-directed graphs:
  1.- https://medium.com/ninjaconcept/interactive-dynamic-force-directed-graphs-with-d3-da720c6d7811
  2.- https://bl.ocks.org/mbostock/4062045 
  3.- http://bl.ocks.org/eyaler/10586116
  4.- https://github.com/d3/d3/blob/master/API.md 
  5.- (Old example, with V.3, but very ordered) http://bl.ocks.org/sathomas/11550728
*/

function startCharting(j) {
  //console.log(j)
  
  const w = 800;
  const h = 500;
  
  var div = d3.select("#chartHolder").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  var svg = d3.select('#chartHolder').append('svg')
    .attr('width', w)
    .attr('height', h);
  
  // Define the data for the example. In general, a force layout
  // requires two data arrays. The first array, here named `nodes`,
  // contains the object that are the focal point of the visualization.
  // The second array, called `links` below, identifies all the links
  // between the nodes. (The more mathematical term is "edges.")
  
  //nodes location is arbirarily choosen by d3
  //here we're going to put x, y values
  const nodes = j.nodes;
  
  // The `links` array contains objects with a `source` and a `target`
  // property. The values of those properties are the indices in
  // the `nodes` array of the two endpoints of the link.
  const links = j.links;

  //create a new force simulation.
  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink())
    //add forces to it
    //charge is global force that affects every node. 
    //It simulates electrostatic effects, which makes the graph feel organic and natural as the nodes affect each other. 
    //If we’d use a positive strength, it’d simulate a gravitational pull.
    .force('charge', d3.forceManyBody()
           .strength(-50)
           )
    // center, simply translates all nodes to visually move them into the center of the svg element
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force("x", d3.forceX()) //we need the content to stay in the svg space
    .force("y", d3.forceY().strength(0.15)) // default 0.1, if supperior, it tends to be more atired into Y
  
  //Note: Guided in this part by FCC example
  //Because the documentation on th flags (https://www.flag-sprites.com/) speaks of an "img" element, we have to treat it outside the svg, in a div
  var nodeElements = d3.select("#flagsHolder").selectAll("img")
    .data(nodes)
    .enter()
    .append("img")
      .attr("class", node => "flag flag-" + node.code)
      //.attr("height", "11px")
      //.attr("width", "16px")
  nodeElements.on("mouseover", function(d) {
    div.transition()
        .duration(100)
        .style("opacity", 0.8);
      div.html("<span class='country'>" + d.country + "</span><br>")
        //let's give the place whre the tool tip will apear
        .style("left", (d3.event.pageX - ($('.tooltip').width()/2)) + "px")
        .style("top", (d3.event.pageY - 30) + "px");
        //d3.event.pageX/Y returns the X/Y coordinate related to the SVG, that way you can display correctly the tooltip, in this case (tiny elements, because the event is triggered just once and it doesn't follow the mouse movement, but that could be fixed if needed triggering maybe another type of event)
    })
    .on("mouseout", function(d) {
      div.transition()
        .duration(200)
        .style("opacity", 0);
    });
      
  //": specie-animal relations will have stronger forces to group the nodes tighter together, while cross-relations will pull much softer"
  //simulation.force("link", d3.forceLink()
                   //.id(link => link.country)
                   //.strength(link => link.strength)) //we have no strenght
                  //)
  //Then we can create the line elements to display our links respectively. 
  //This works basically the same as the circle and text elements as well.
  var linkElements = svg.selectAll('line').append('line')
  .data(links)
  .enter().append('line')
    .attr('stroke-width', 0.7)
    .attr('stroke', '#E5E5E5')
  
  simulation.nodes(nodes).on("tick", () => {
    nodeElements
      //.attr('x', (node) => node.x)
      //.attr('y', (node) => node.y)
      .style('left', d => (d.x - 8) + "px")
			.style('top', d => (d.y - 5) + "px");
    //In order to move the links on every tick, we add the following snippet to the tick-function.
    linkElements
     .attr('x1', link => link.source.x)
     .attr('y1', link => link.source.y)
     .attr('x2', link => link.target.x)
     .attr('y2', link => link.target.y)
  });
  
  simulation.alphaDecay(0.0228) //the default (how long )
  //simulation.alphaMin(0.02) //when to stop the simulation
  simulation.force("link").distance(30) //link distance > 0
  //simulation.force("link").id(node => node.code) //not working :S
  simulation.force("link").links(links)
  
  //Drag & Drop
  const dragDrop = d3.drag()
  .on('start', node => {
    simulation.alphaTarget(0.5).restart()
    node.fx = node.x
    node.fy = node.y
  })
  .on('drag', node => {
    node.fx = d3.event.x
    node.fy = d3.event.y
  })
  .on('end', node => {
    if (!d3.event.active) {
      simulation.alphaTarget(0)
    }
    node.fx = null
    node.fy = null
  })
  //To activate the dragDrop events, we only need to add it to the nodeElements.
  nodeElements.call(dragDrop);
}