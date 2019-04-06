var origin = new Point(0,0);
var endpt = new Point(150,0);

var s = endpt.x;
var h = s * Math.sqrt(3) / 2;

function createEdge() {
  var protoEdge = new Path();

  protoEdge.add(origin, endpt);
  protoEdge.pivot = origin;

  protoEdge.insert(1, new Point(50,0));
  protoEdge.insert(2, new Point(70,-10));
  protoEdge.insert(3, new Point(75,0));

  protoEdge.strokeColor = 'black';

  return new Group([protoEdge]);
}

function createTriangle(protoEdges) {
  var protoEdge = protoEdges.children[0];

  var e1 = new Edge(protoEdge,new Point(0,0),0,false);
  var e2 = new Edge(protoEdge,new Point(s/2,h),-60,true);
  var e3 = new Edge(protoEdge,new Point(s/2,h),-120,false);

  var edges = [e1,e2,e3];

  var protoTriangle = createShapeFromEdges(edges);

  protoTriangle.fillColor = 'paleturquoise';
  protoTriangle.strokeColor = 'darkturquoise';

  return new Group([protoTriangle]);
}

function createPattern(protoShapes) {
  var triangles = new Group();
  var triangle = protoShapes.children[0];

  var x0 = 150;
  var y0 = 300;

  var addTriangle = function(x,y,theta) {
    addShape(triangle,triangles,x0+x,y0+y,theta);
  };

  // row 1
  addTriangle(0,0,0);
  addTriangle(s,0,60);
  addTriangle(2*s,0,120);
  addTriangle(3*s,0,120);
  // row 1.5
  addTriangle(s*0.5,h,0);
  addTriangle(s*2.5,h,180);
  // row 2
  addTriangle(0,2*h,-60);
  addTriangle(s,2*h,-60);
  addTriangle(s*2,2*h,-120);
  addTriangle(s*3,2*h,180);

  triangles.scale(0.75,0.75);

  return triangles;
}

function arrange(protoEdges,protoShapes) {
  protoEdges.translate(150,150);
  protoShapes.translate(425,100);
}

var TrianglePlayground = new TilePlayground(
  createEdge,createTriangle,createPattern,arrange);

function onMouseDown(event) {
  TrianglePlayground.onMouseDown(event);
}

function onMouseDrag(event) {
  TrianglePlayground.onMouseDrag(event);
}

document.getElementById("downloadSVG").onclick = function() {
  TrianglePlayground.downloadSVG();
}

// var border = new Path.Rectangle(origin,new Point(800,800));
// border.strokeColor = 'darkturquoise';
