var hitOptions = {
	segments: true,
	stroke: false,
	fill: false,
	tolerance: 5
};

function createProtoEdge(startpt,endpt) {
  var protoEdge = new Path();
  protoEdge.add(origin, endpt);
  protoEdge.pivot = origin;
  protoEdge.insert(1, new Point(50,0));
  protoEdge.insert(2, new Point(70,-10));
  protoEdge.insert(3, new Point(75,0));

  protoEdge.strokeColor = 'black';

  return protoEdge;
}

function createProtoTriangle(protoEdge) {
  var e1 = protoEdge.clone();
  var e2 = e1.clone();
  e2.rotate(-60,endpt).reverse();
  var e3 = e2.clone();
  e3.rotate(-60).reverse();

  var triangle = e1;
  triangle.join(e2);
  triangle.join(e3);
  triangle.closed = true;

  triangle.removeSegment(9);
  triangle.removeSegment(12);

  triangle.fillColor = 'paleturquoise';

  return triangle;
}

var sl = 100;
var origin = new Point(0,0);
var endpt = new Point(sl,0);

var protoEdge = createProtoEdge(origin,endpt);
var protoTriangle = createProtoTriangle(protoEdge);

protoTriangle.selected = true;

protoTriangle.translate(50,100);
protoEdge.translate(50,50);

var selectedSegment;
function onMouseDown(event) {
  selectedSegment = null;
  var hitResult = project.hitTest(event.point, hitOptions);
  if (!hitResult) return;
  if (hitResult.item != protoTriangle) return;

  if (hitResult) {
    // find segment on protoEdge
    var triangleIndex = hitResult.segment.index;
    var numSegments = protoEdge.segments.length-1;
    var protoIndex = triangleIndex % numSegments;
    var selectedSide = Math.floor(triangleIndex / numSegments);
    if (selectedSide == 1) {
      protoIndex = numSegments - protoIndex;
    }
    if (protoIndex > 0 && protoIndex < numSegments) {
      selectedSegment = protoEdge.segments[protoIndex];
    }

    console.log('t',triangleIndex,' s',selectedSide,' p',protoIndex);
  }
}

function onMouseDrag(event) {
  if (selectedSegment) {
    selectedSegment.point += event.delta;
    protoEdge.translate(-50,-50);
    protoTriangle.remove();
    protoTriangle = createProtoTriangle(protoEdge);
    protoTriangle.selected = true;

    protoEdge.translate(50,50);
    protoTriangle.translate(50,100);
  }
}
