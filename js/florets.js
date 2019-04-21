var origin = new Point(0,0);
var endpt = new Point(150,0);

var s = endpt.x;
var h = s * Math.sqrt(3) / 2;

var protoEdges, protoShapes;

var jaggyStart = true;

var dPath = new Point(200,0);
dPath = dPath.rotate(-60);

var pEdgeA = new Path();

pEdgeA.add(origin, endpt);
pEdgeA.pivot = origin;
pEdgeA.strokeColor = 'black';

var pEdgeB = new Path();
pEdgeB.add(origin, endpt/2);
pEdgeB.pivot = origin;
pEdgeB.strokeColor = 'black';

var pEdgeC = new Path();
pEdgeC.add(origin, endpt/4);
pEdgeC.pivot = origin;
pEdgeC.strokeColor = 'black';

if (jaggyStart) {
  pEdgeA.insert(1,new Point(10,0));
  pEdgeA.insert(2,new Point(20,0));
  pEdgeA.insert(3,new Point(30,0));

  pEdgeB.insert(1,new Point(10,0));
  pEdgeB.insert(2,new Point(20,0));
  pEdgeB.insert(3,new Point(30,0));

  pEdgeC.insert(1,new Point(10,0));
  pEdgeC.insert(2,new Point(20,0));
}

protoEdges = new Group([pEdgeA,pEdgeB,pEdgeC]);

var ptD = endpt + endpt.rotate(-60)/2;
var maxD = endpt + endpt.rotate(-60);
var minD = endpt + endpt.rotate(-60).normalize(20);
var ptE = endpt.rotate(-60);

function calculateVertexF(pt1,pt2) {
  var dToE = new Path.Line(ptD,ptE);
  dToE.rotate(30,ptD);
  var eToD = new Path.Line(ptE,ptD);
  eToD.rotate(-30,ptE);
  var crossings = dToE.getCrossings(eToD);
  var crossing = crossings[0].point;
  return crossing;
}

var ptF = calculateVertexF(ptD,ptE);

var e1 = new Edge(pEdgeA,origin,0,false);
var e2 = new Edge(pEdgeC,endpt,-60,false);
var e3 = new Edge(pEdgeC,ptD,120,true);
var e4 = new Edge(pEdgeB,ptF,endpt.getDirectedAngle(ptD-ptF),true);
var e5 = new Edge(pEdgeB,ptF,endpt.getDirectedAngle(ptE-ptF),false);
var e6 = new Edge(pEdgeA,origin,-60,true);

var edges = [e1,e2,e3,e4,e5,e6];

var floret = new Polygon(edges,origin,'lightpink','palevioletred');

protoShapes = [floret];

function createPattern(protoShapes) {
  var florets = new Group();
  var floret = protoShapes.children[0];

  var x0 = 400;
  var y0 = 525;

  var addFloret = function(x,y,theta) {
    addShape(floret,florets,x0+x,y0+y,theta);
  }

  var addFlorets = function(pt) {
    for (var i = 0; i < 6; i++) {
      addFloret(pt.x,pt.y,i*60);
    }
  }

  addFlorets(origin);
  var pt = ptD + endpt;
  for (var i = 0; i < 6; i++) {
    addFlorets(pt.rotate(i*60));
  }

  florets.scale(0.5,0.5,new Point(x0,y0));

  return florets;
}

function arrange(protoEdges,protoShapes) {
  protoEdges.translate(200,150);
  protoShapes.translate(500,200);

  var pEdgeA = protoEdges.children[0];
  var pEdgeB = protoEdges.children[1];
  var pEdgeC = protoEdges.children[2];

  pEdgeA.translate(0,-50);
  pEdgeC.translate(0,50);
}

var Playground = new TilePlayground(
  protoEdges,protoShapes,createPattern,arrange);

Playground.editableEndpoints = true;
Playground.onEndpointEdit = function(event,endpointIndex) {
  var endpts = [];
  var floret = Playground.shapes[0];
  var path = floret.path;
  var data = path.data;
  for (var i = 0; i < path.segments.length; i++) {
    var pt = path.segments[i].point;
    if (data[i].isEndpt >= 0) {
      endpts.push(pt);
    }
  }

  if (endpointIndex == 3) {
    var oldEdge = endpts[3] - endpts[1];
    var newEdge = oldEdge + event.delta.project(dPath);
    if (newEdge.length > s) {
      newEdge = maxD - endpt;
    } else if (newEdge.length < 20) {
      newEdge = minD - endpt;
    }

    var scaleFactorC = newEdge.length / oldEdge.length;
    pEdgeC.scale(scaleFactorC,origin);

    ptD = endpt + newEdge;
    ptF = calculateVertexF(ptD,ptE);
    var oldB = endpts[4].getDistance(endpts[5]);
    scaleFactorB = ptF.getDistance(ptD) / endpts[4].getDistance(endpts[3]);
    pEdgeB.scale(scaleFactorB,origin);

    floret.edges[1] = new Edge(pEdgeC,endpt,-60,false);
    floret.edges[2] = new Edge(pEdgeC,ptD,120,true);
    floret.edges[3] = new Edge(pEdgeB,ptF,endpt.getDirectedAngle(ptD-ptF),true);
    floret.edges[4] = new Edge(pEdgeB,ptF,endpt.getDirectedAngle(ptE-ptF),false);

    floret.calculatePath();
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
