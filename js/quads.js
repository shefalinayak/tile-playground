var origin = new Point(0,0);
var endpt = new Point(150,0);

var s = endpt.x;

function createEdges() {
  var pEdgeA = new Path();

  pEdgeA.add(origin, endpt);
  pEdgeA.pivot = origin;

  pEdgeA.strokeColor = 'black';

  var pEdgeB = pEdgeA.clone();

  pEdgeA.insert(1,new Point(70,0));
  pEdgeA.insert(2,new Point(90,10));
  pEdgeA.insert(3,new Point(90,0));

  pEdgeB.insert(1,new Point(30,0));
  pEdgeB.insert(2,new Point(30,10));
  pEdgeB.insert(3,new Point(50,10));
  pEdgeB.insert(4,new Point(50,0));

  return new Group([pEdgeA,pEdgeB]);
}

function createShapes(protoEdges) {
  var pEdgeA = protoEdges.children[0];
  var pEdgeB = protoEdges.children[1];

  var e1 = new Edge(pEdgeA,new Point(0,0),0,false);
  var e2 = new Edge(pEdgeB,new Point(s,0),90,false);
  var e3 = new Edge(pEdgeA,new Point(0,s),0,true);
  var e4 = new Edge(pEdgeB,new Point(0,0),90,true);

  var edges = [e1,e2,e3,e4];

  var protoQuad = createShapeFromEdges(edges);

  protoQuad.fillColor = 'paleturquoise';
  protoQuad.strokeColor = 'darkturquoise';

  return new Group([protoQuad]);
}

function createPattern(protoShapes) {
  var quads = new Group();
  var quad = protoShapes.children[0];

  var x0 = 50;
  var y0 = 200;

  var addQuad = function(x,y) {
    addShape(quad,quads,x0+x,y0+y,0);
  };

  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 4; j++) {
      addQuad(i*s,j*s);
    }
  }

  quads.scale(0.6,0.6);

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
