var origin = new Point(0,0);
var endpt = new Point(150,0);

var s = endpt.x;
var h = s * Math.sqrt(3) / 2;

function createEdges() {
  var pEdgeA = new Path();

  pEdgeA.add(origin, endpt);
  pEdgeA.pivot = origin;
  pEdgeA.strokeColor = 'black';

  pEdgeA.insert(1,new Point(30,0));
  pEdgeA.insert(2,new Point(40,10));
  pEdgeA.insert(3,new Point(45,0));

  var pEdgeB = new Path();

  pEdgeB.add(origin, new Point(s/2,0));
  pEdgeB.pivot = origin;
  pEdgeB.strokeColor = 'black';

  pEdgeB.insert(1,new Point(20,0));
  pEdgeB.insert(2,new Point(20,10));
  pEdgeB.insert(3,new Point(35,10));
  pEdgeB.insert(4,new Point(35,0));

  return new Group([pEdgeA,pEdgeB]);
}

function createShapes(protoEdges) {
  var pEdgeA = protoEdges.children[0];
  var pEdgeB = protoEdges.children[1];

  var pivot = new Point(0,-h);

  var e1 = new Edge(pEdgeA,pivot,60,false);
  var e2 = new Edge(pEdgeB,origin,0,true);
  var e3 = new Edge(pEdgeB,origin,180,false);
  var e4 = new Edge(pEdgeA,pivot,120,true);

  var edges = [e1,e2,e3,e4];

  var protoTriangle = createShapeFromEdges(edges);
  protoTriangle.pivot = pivot;

  protoTriangle.fillColor = 'paleturquoise';
  protoTriangle.strokeColor = 'darkturquoise';

  return new Group([protoTriangle]);
}

function createPattern(protoShapes) {
  var triangles = new Group();
  var triangle = protoShapes.children[0];

  var x0 = 400;
  var y0 = 450;

  var addTriangle = function(x,y,theta) {
    addShape(triangle,triangles,x0+x,y0+y,theta);
  };

  var addTriangles = function(x,y) {
    for (var i = 0; i < 6; i++) {
      addTriangle(x,y,i*60);
    }
  };

  addTriangles(s,0);
  addTriangles(-s/2,h);
  addTriangles(-s/2,-h);

  addTriangle(s,-2*h,0);
  addTriangle(s,-2*h,60);

  addTriangle(s,2*h,120);
  addTriangle(s,2*h,180);

  addTriangle(-2*s,0,-60);
  addTriangle(-2*s,0,-120);

  triangles.scale(0.75,0.75);

  return triangles;
}

function arrange(protoEdges,protoShapes) {
  protoEdges.translate(150,150);
  protoShapes.translate(500,200);

  var pEdgeA = protoEdges.children[0];
  var pEdgeB = protoEdges.children[1];

  pEdgeA.translate(0,-30);
  pEdgeB.translate(0,30);
}

var Playground = new TilePlayground(
  createEdges,createShapes,createPattern,arrange);

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
