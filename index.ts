// Import stylesheets
import './style.css';
import * as d3 from 'd3';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>Topographic Tester</h1> <hr width="60%">`;

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

  mainWork03();
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

// second try uses the svg <g> object to group the label and circle in each node.
// This approach was largely influenced from https://stackoverflow.com/a/13627065/1596757
function mainWork02() {
  let xAdj = [5.0, 50]; // this because i made the source json data too small
  let yAdj = [1.2, 50]; // this because i made the source json data too small

  // loading the edges first puts them below the nodes. I don't know if there is a modifiable z axis yet
  let l = vis.selectAll("line")
    .data(edges)
    .enter()
    .append("line")
    .attr("x1", function(d){ return nodes[d.source].x * xAdj[0] + xAdj[1]; })
    .attr("y1", function(d){ return nodes[d.source].y * yAdj[0] + yAdj[1]; })
    .attr("x2", function(d){ return nodes[d.target].x * xAdj[0] + xAdj[1]; })
    .attr("y2", function(d){ return nodes[d.target].y * yAdj[0] + yAdj[1]; })
    .attr("class", "edge")

  // i'm not sure why this is a separate step, i'm just playing along for now
  let gRaw = vis.selectAll("g").data(nodes);
  
  // creating svg groups (g)
  let g = gRaw.enter()
              .append("g")
              .attr("transform", function(d) { return "translate("+(d.x * xAdj[0] + xAdj[1])+","+(d.y * yAdj[0] + yAdj[1])+")"; });

  // adding the circles to the groups
  let c = g.append("circle")
           .attr("r", "10px")
           .attr("fill", "#C0C0C0")
           .attr("stroke", "#FF44CC")
           .attr("class", function(d) { return "node "+d.class; })
           ;

  // add labels to each group
  let t = g.append("text")
        .text(function(d,i){ return d.label; })
        .attr("fill", "#000000")
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        ;
}

// third experiment. the goal here will be to:
//    a. encapsulate nodes in a <g> that will be prepped to house multiple elements
//    b. enable dragging and maybe a mild force diagram
function mainWork03() {
  let xAdj = [8.0, -150]; // this because i made the source json data too small
  let yAdj = [2.0, 50]; // this because i made the source json data too small

  // create linear gradient
  let lg = vis.append("defs").append("linearGradient").attr("id", "edgeGrad");
      lg.append("stop").attr("class","lg01").attr("offset","0%");
      lg.append("stop").attr("class","lg01").attr("offset","0%");

  // set up edges
  let l = vis.selectAll("line")
    .data(edges)
    .enter()
    .append("line")
    .attr("x1", function(d){ return nodes[d.source].x * xAdj[0] + xAdj[1] + 50; })
    .attr("y1", function(d){ return nodes[d.source].y * yAdj[0] + yAdj[1] + 30; })
    .attr("x2", function(d){ return nodes[d.target].x * xAdj[0] + xAdj[1] + 50; })
    .attr("y2", function(d){ return nodes[d.target].y * yAdj[0] + yAdj[1] + 30; })
    .attr("class", function(d){ return "edge " + nodes[d.source].class + "_" + nodes[d.target].class; })
    //.attr("class", function(d){ return nodes[d.source].class + "_" + nodes[d.target].class; })
  ;

  // in experiment 02 this was called gRaw... i'm calling it e now
  let e = vis.selectAll("g").data(nodes);

  // create gb containers to hold all nodes. Each gb container has 3 sections
  //  b - background clearing rect on bottom
  //  g - middle g: holds all display elements
  //  z - transparent rect overlay so nothing can be highlighted and for easy grabbing.
  let bgz = e.enter()
        .append("g")
        .attr("transform", function(d) { return "translate("+(d.x * xAdj[0] + xAdj[1])+","+(d.y * yAdj[0] + yAdj[1])+")"; })
        .call(d3.drag()
          .on("start", nodeDragStart)     
          .on("drag",nodeDrag)
        )
  ;
  // first a background clearing rect
  let b = bgz.append("rect").attr("class", "gNodeBacker");

  // then the functional parent of the rest of the objects
 let g = bgz.append("g").attr("class", "gNode");

  // within our g-node we want the following info
  //   a. class name
  //   b. node name
  //   c. node value
  //   d. node id (not really useful in the long run, but a good experiment for now)
  
  // c = containers
  let c = g.append("rect")
        .attr("class", function(d) { return "node03 "+d.class; })
  ;

  // s = class name
  let s = g.append("text")
        .text(function(d,i){ return d.class; })
        .attr("class", "className")
        .attr("y", "2.5em")
        .attr("x", "50px")
        .attr("text-anchor", "middle")
  ;

  // n = label name
  let n = g.append("text")
        .text(function(d,i){ return d.label; })
        .attr("class", "labelName")
        .attr("y", "1em")
        .attr("x", "50px")
        .attr("text-anchor", "middle")
  ;

  // d = id name
  let d = g.append("text")
        .text(function(d,i){ return "id: " + d.id; })
        .attr("class", "idName")
        .attr("y", "2em")
        .attr("x", "5px")
        .attr("text-anchor", "left")
  ;

  // h = holder for values
  let h = g.append("rect")
        .attr("class", "valueRect" )
        .attr("x", "10px")
        .attr("y", "40px")
  ;

  // v = values
  let v = g.append("text")
        .text(function(d,i){ return d.value; })
        .attr("class", "valueText" )
        .attr("x", "50px")
        .attr("y", "50px")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
  ;

  // first a background clearing rect
  let z = bgz.append("rect")
        .attr("class", "gNodeFronter")
  ;
}

function dragged(d) {
  // this first from https://bl.ocks.org/mbostock/22994cc97fefaeede0d861e6815a847e
  //d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);

  // second from https://octoperf.com/blog/2018/04/18/d3-js-drag-and-drop-tutorial/
  d3.select(this)
    .attr("cx", d3.event.x)
    .attr("cy", d3.event.y);  
}

let dragDeltaX = 0;
let dragDeltaY = 0;

function nodeDragStart(d) {
  //let t = getTransformation(d3.select(this.parentNode).attr("transform"));
  let t = getTransformation(d3.select(this).attr("transform"));
  dragDeltaX = t["translateX"] - d3.event.x;
  dragDeltaY = t["translateY"] - d3.event.y;
  
  //console.log(getTransformation(d3.select(this.parentNode).attr("transform")) );
}

function nodeDrag(d) {
  //d3.select(this.parentNode).attr("transform","translate(" + (d3.event.x+dragDeltaX)  + ", " + (d3.event.y+dragDeltaY) + ")");
  d3.select(this).attr("transform","translate(" + (d3.event.x+dragDeltaX)  + ", " + (d3.event.y+dragDeltaY) + ")");
}

// gotten from stack overflow: https://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4/38230545#38230545
// i don't understand it yet. pasted verbatim
function getTransformation(transform) {
  // Create a dummy g for calculation purposes only. This will never
  // be appended to the DOM and will be discarded once this function 
  // returns.
  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  
  // Set the transform attribute to the provided string value.
  g.setAttributeNS(null, "transform", transform);
  
  // consolidate the SVGTransformList containing all transformations
  // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
  // its SVGMatrix. 
  var matrix = g.transform.baseVal.consolidate().matrix;
  
  // Below calculations are taken and adapted from the private function
  // transform/decompose.js of D3's module d3-interpolate.
  var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
  // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * 180 / Math.PI,
    skewX: Math.atan(skewX) * 180 / Math.PI,
    scaleX: scaleX,
    scaleY: scaleY
  };
}