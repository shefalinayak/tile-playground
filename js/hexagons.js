var origin = new Point(0,0);
var endpt = new Point(100,0);

var s = endpt.x;

function createEdges() {
  var pEdgeA = new Path();

  pEdgeA.add(origin, endpt);
  pEdgeA.pivot = origin;

  pEdgeA.strokeColor = 'black';

  var pEdgeB = pEdgeA.clone();
  var pEdgeC = pEdgeA.clone();

  pEdgeA.insert(1, new Point(15,0));
  pEdgeA.insert(2, new Point(20,10));
  pEdgeA.insert(3, new Point(25,0));

  pEdgeB.insert(1, new Point(10,0));
  pEdgeB.insert(2, new Point(10,10));
  pEdgeB.insert(3, new Point(20,10));
  pEdgeB.insert(4, new Point(20,0));

  pEdgeC.insert(1, new Point(15,0));
  pEdgeC.insert(2, new Point(35,10));
  pEdgeC.insert(3, new Point(35,0));

  return new Group([pEdgeA,pEdgeB,pEdgeC]);
}

function createHexagon(protoEdges) {
  var pEdgeA = protoEdges.children[0];
  var pEdgeB = protoEdges.children[1];
  var pEdgeC = protoEdges.children[2];

  var ptA = new Point(0,0);
  var ptB = new Point(s * Math.sqrt(3),0);
  var ptC = new Point(s * Math.sqrt(3) / 2, s * 3 / 2);

  var e1 = new Edge(pEdgeA,ptA,-30,false);
  var e2 = new Edge(pEdgeB,ptB,-150,true);
  var e3 = new Edge(pEdgeB,ptB,90,false);
  var e4 = new Edge(pEdgeC,ptC,-30,true);
  var e5 = new Edge(pEdgeC,ptC,-150,false);
  var e6 = new Edge(pEdgeA,ptA,90,true);

  var edges = [e1,e2,e3,e4,e5,e6];

  var protoHexagon = createShapeFromEdges(edges);

  protoHexagon.fillColor = 'paleturquoise';
  protoHexagon.strokeColor = 'darkturquoise';

  return new Group([protoHexagon]);
}

function createPattern(protoShapes) {
  var hexagons = new Group();
  var hexagon = protoShapes.children[0];

  var x0 = 150;
  var y0 = 325;

  var addHexagon = function(x,y,theta) {
    addShape(hexagon,hexagons,x0+x,y0+y,theta);
  }

  var addHexagons = function(x,y) {
    addHexagon(x,y,0);
    addHexagon(x,y,120);
    addHexagon(x,y,-120);
  };

  addHexagons(0,0);
  addHexagons(0,3*s);

  var w = s * Math.sqrt(3);

  addHexagons(w*1.5, s*1.5);

  addHexagons(w*3,0);
  addHexagons(w*3,3*s);

  addHexagon(w*1.5,-1.5*s,0);
  addHexagon(w*1.5,-1.5*s,120);

  addHexagon(w*1.5,4.5*s,-120);

  hexagons.scale(0.5,0.5);

  return hexagons;
}

function arrange(protoEdges,protoShapes) {
  protoEdges.translate(150,150);

  var pEdgeA = protoEdges.children[0];
  var pEdgeB = protoEdges.children[1];
  var pEdgeC = protoEdges.children[2];

  pEdgeA.translate(0,-50);
  pEdgeC.translate(0,50);

  protoShapes.translate(425,100);
}

var HexagonPlayground = new TilePlayground(
  createEdges,createHexagon,createPattern,arrange);

function onMouseDown(event) {
  HexagonPlayground.onMouseDown(event);
}

function onMouseDrag(event) {
  HexagonPlayground.onMouseDrag(event);
}

document.getElementById("downloadSVG").onclick = function() {
  HexagonPlayground.downloadSVG();
}

// var border = new Path.Rectangle(origin,new Point(800,800));
// border.strokeColor = 'darkturquoise';
