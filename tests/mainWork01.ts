// Import stylesheets
import './style.css';
import * as d3 from 'd3';

// 1. this creates the master d3 object that we use to present everything
let vis = d3.select("#app").append("svg");
    vis.attr("class", "stage");

// 2. some placeholders because we need them scoped to be usable in multiple places
let nodes = [];
let edges = [];

// 3. load the specified JSON data, populate the placeholder arrays then run the specified experiment
d3.json("https://raw.githubusercontent.com/nonfinity/topo-d3-try1/master/graphs/cylinder.json", function(data) {
  //console.log(data);
  nodes = data["nodes"].slice();
  edges = data["edges"].slice();

  mainWork01();
});

// this was the first try. Cribbed straight from http://thinkingonthinking.com/Getting-Started-With-D3/
function mainWork01() {

  let xAdj = [5.0, 50]; // this because i made the source json data too small
  let yAdj = [1.2, 50]; // this because i made the source json data too small

  vis.selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("x1", function(d){ return nodes[d.source].x * xAdj[0] + xAdj[1]; })
      .attr("y1", function(d){ return nodes[d.source].y * yAdj[0] + yAdj[1]; })
      .attr("x2", function(d){ return nodes[d.target].x * xAdj[0] + xAdj[1]; })
      .attr("y2", function(d){ return nodes[d.target].y * yAdj[0] + yAdj[1]; })
      .style("stroke", "rgb(90,0,0)")

  vis.selectAll("circle .nodes")
      .data(nodes)
      .enter()
      .append("svg:circle")
      .attr("cx", function(d){ return d.x * xAdj[0] + xAdj[1]; })
      .attr("cy", function(d){ return d.y * yAdj[0] + yAdj[1]; })
      .attr("r", "10px")
      .attr("fill", "rgb(80,80,80)")
      .append("text")
        .text(function(d,i){ return d.label; })
        .attr("x", function(d){ return d.x * xAdj[0] + xAdj[1] + 10; })
        .attr("y", function(d){ return d.y * yAdj[0] + yAdj[1]; })
        .attr("fill", "rgb(255,255,255)")
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("font-size", "10px")
        .attr("text-anchor", "beginning")
        ;
}