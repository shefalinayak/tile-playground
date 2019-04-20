var origin = new Point(0,0);
var endpt = new Point(150,0);

var s = endpt.x;

var protoEdges, protoShapes;

var jaggyStart = true;

var pEdgeA = new Path();

pEdgeA.add(origin, endpt);
pEdgeA.pivot = origin;

pEdgeA.strokeColor = 'black';

var pEdgeB = pEdgeA.clone();

if (jaggyStart) {
  pEdgeA.insert(1,new Point(70,0));
  pEdgeA.insert(2,new Point(90,10));
  pEdgeA.insert(3,new Point(90,0));

  pEdgeB.insert(1,new Point(30,0));
  pEdgeB.insert(2,new Point(30,10));
  pEdgeB.insert(3,new Point(50,10));
  pEdgeB.insert(4,new Point(50,0));
}

protoEdges = new Group([pEdgeA,pEdgeB]);

var e1 = new Edge(pEdgeA,new Point(0,0),0,false);
var e2 = new Edge(pEdgeB,new Point(s,0),90,false);
var e3 = new Edge(pEdgeA,new Point(0,s),0,true);
var e4 = new Edge(pEdgeB,new Point(0,0),90,true);

var edges = [e1,e2,e3,e4];

var protoquad = new Polygon(edges,origin,'paleturquoise','darkturquoise');

protoShapes = [protoquad];

function createPattern(protoShapes) {
  var quads = new Group();
  var quad = protoShapes.children[0];

  var x0 = -200;
  var y0 = 300;

  var theta = protoquad.edges[1].theta;
  var delta = pEdgeB.lastSegment.point - pEdgeB.firstSegment.point;
  delta = delta.rotate(theta);

  var addQuad = function(x,y) {
    addShape(quad,quads,x0+x,y0+y,0);
  };

  for (var i = 0; i < 12; i++) {
    for (var j = 0; j < 8; j++) {
      addQuad(i*s+(j*delta.x),j*delta.y);
    }
  }

  quads.scale(0.6,0.6,new Point(x0,y0));

  return quads;
}

function arrange(protoEdges,protoShapes) {
  protoEdges.translate(200,150);
  protoShapes.translate(500,100);

  var pEdgeA = protoEdges.children[0];
  var pEdgeB = protoEdges.children[1];

  //pEdgeA.translate(0,-50);
  pEdgeB.translate(0,50);
}

var Playground = new TilePlayground(
  protoEdges,protoShapes,createPattern,arrange);

Playground.editableEndpoints = true;
Playground.onEndpointEdit = function(event,endpointIndex) {
  var endpts = [];
  var quad = Playground.shapes[0];
  var path = quad.path;
  var data = path.data;
  for (var i = 0; i < path.segments.length; i++) {
    var pt = path.segments[i].point;
    if (data[i].isEndpt >= 0) {
      endpts.push(pt);
    }
  }
  if (endpointIndex == 2) {
    var ptA = endpts[1].clone();
    var ptB = endpts[2].clone();

    var oldEdge = ptB - ptA;
    var newEdge = oldEdge + event.delta;

    var rotation = endpt.getDirectedAngle(newEdge);
    var scaleFactor = newEdge.length / oldEdge.length;
    pEdgeB.scale(scaleFactor,origin);

    quad.edges[1] = new Edge(pEdgeB,new Point(s,0),rotation,false);
    quad.edges[2] = new Edge(pEdgeA,origin + newEdge,0,true);
    quad.edges[3] = new Edge(pEdgeB,origin,rotation,true);
    quad.calculatePath();
  }
};

function onMouseDown(event) {
  Playground.onMouseDown(event);
}

function onMouseDrag(event) {
  Playground.onMouseDrag(event);
}

document.getElementById("downloadSVG").onclick = function() {
  Playground.downloadSVG();
}

// var border = new Path.Rectangle(origin,new Point(800,800));
// border.strokeColor = 'darkturquoise';
