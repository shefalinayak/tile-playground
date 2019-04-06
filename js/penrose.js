var origin = new Point(0,0);
var endpt = new Point(125,0);

var s = endpt.x;
var t = s * Math.sin(Math.PI/5) / Math.sin(2*Math.PI/5);
var sX = s * Math.cos(Math.PI/5);
var sY = s * Math.sin(Math.PI/5);

function createEdges() {
  var longEdge = new Path();

  longEdge.add(origin, endpt);
  longEdge.pivot = origin;
  longEdge.strokeColor = 'black';

  longEdge.insert(1,new Point(s/5,0));
  longEdge.insert(2,new Point(2*s/5,0));
  longEdge.insert(3,new Point(3*s/5,0));
  longEdge.insert(4,new Point(4*s/5,0));

  var shortEdge = new Path();

  shortEdge.add(origin, new Point(t,0));
  shortEdge.pivot = origin;
  shortEdge.strokeColor = 'black';

  shortEdge.insert(1,new Point(t/4,0));
  shortEdge.insert(2,new Point(t/2,0));
  shortEdge.insert(3,new Point(3*t/4,0));

  return new Group([longEdge,shortEdge]);
}

function createKiteAndDart(protoEdges) {
  var longEdge = protoEdges.children[0];
  var shortEdge = protoEdges.children[1];

  var e1 = new Edge(longEdge,origin,-36,false);
  var e2 = new Edge(shortEdge,new Point(s,0),-108,true);
  var e3 = new Edge(shortEdge,new Point(s,0),108,false);
  var e4 = new Edge(longEdge,origin,36,true);

  var kiteEdges = [e1,e2,e3,e4];

  var protoKite = createShapeFromEdges(kiteEdges);
  protoKite.pivot = origin;

  protoKite.fillColor = 'palegoldenrod';
  protoKite.strokeColor = 'yellowgreen';

  var topPt = new Point(-1*sX,-1*sY);
  var bottomPt = new Point(-1*sX,sY);

  var e1 = new Edge(longEdge,topPt,36,true);
  var e2 = new Edge(shortEdge,topPt,72,false);
  var e3 = new Edge(shortEdge,bottomPt,-72,true);
  var e4 = new Edge(longEdge,bottomPt,-36,false);

  var dartEdges = [e1,e2,e3,e4];

  var protoDart = createShapeFromEdges(dartEdges);
  protoDart.pivot = origin;

  protoDart.fillColor = 'paleturquoise';
  protoDart.strokeColor = 'darkturquoise';

  return new Group([protoKite,protoDart]);
}

function createPattern(protoShapes) {
  var pattern = new Group();
  var kite = protoShapes.children[0];
  var dart = protoShapes.children[1];

  var x0 = 400;
  var y0 = 400;

  var addKite = function(delta,theta) {
    addShape(kite,pattern,x0+delta.x,y0+delta.y,theta);
  };

  var addDart = function(delta,theta) {
    addShape(dart,pattern,x0+delta.x,y0+delta.y,theta);
  };

  for (var i = 0; i < 5; i++) {
    var angle = i*72;
    addKite(origin,angle);
    var pt = new Point(s+t,0);
    pt = pt.rotate(36+angle);
    addDart(pt,36+angle);

    pt = new Point(s,0);
    pt = pt.rotate(angle);
    addKite(pt,angle+36);
    addKite(pt,angle-36);

    pt = new Point(2*s+t,0);
    pt = pt.rotate(angle);
    for (var j = 0; j < 5; j++) {
      addDart(pt,j*72);
    }
    pt = pt.rotate(36);
    for (var j = 0; j < 5; j++) {
      addKite(pt,36+j*72);
    }
  }

  pattern.scale(0.5,0.5);

  return pattern;
}

function arrange(protoEdges,protoShapes) {
  var longEdge = protoEdges.children[0];
  var shortEdge = protoEdges.children[1];

  longEdge.translate(100,100);
  shortEdge.translate(100,125);

  var kite = protoShapes.children[0];
  var dart = protoShapes.children[1];

  kite.translate(400,100);
  dart.translate(400+2*s,100);
}

var TrianglePlayground = new TilePlayground(
  createEdges,createKiteAndDart,createPattern,arrange);

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
