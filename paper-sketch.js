var hitOptions = {
	segments: true,
	stroke: false,
	fill: false,
	tolerance: 8,
};

var dotRadius = hitOptions.tolerance / 2;

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
	triangle.strokeColor = 'darkturquoise';

  return triangle;
}

function drawDots(myPath) {
	var editDots = new Group();
	var segs = myPath.segments;
	for (var i = 0; i < segs.length; i++) {
		var pt = segs[i].point;
		var dot = new Path.Circle(pt, dotRadius);
		if (i%4 == 0) {
			dot.fillColor = 'lightgray';
		} else {
			dot.fillColor = 'darkturquoise';
		}
		editDots.addChild(dot);
	}
	return editDots;
}

var triangles = [];

var sl = 100;
var origin = new Point(0,0);
var endpt = new Point(sl,0);

var protoEdge = createProtoEdge(origin,endpt);
var protoTriangle = createProtoTriangle(protoEdge);
trianglePattern();

protoTriangle.translate(50,100);
protoEdge.translate(50,50);

protoTriangle.selected = false;

var editDots = drawDots(protoTriangle);

function addTriangle(x,y,theta) {
  var tri = protoTriangle.clone();
  tri.position = new Point(x,y);
  tri.rotate(theta);
  tri.selected = false;
  triangles.push(tri);
}

function trianglePattern() {
  var x0 = 150;
  var y0 = 300;
  var s = 100;
  var h = s * Math.sqrt(3) / 2;
  // row 1
  addTriangle(x0,y0,0);
  addTriangle(x0+s,y0,60);
  addTriangle(x0+2*s,y0,120);
  addTriangle(x0+3*s,y0,120);
  // row 1.5
  addTriangle(x0+s*0.5,y0+h,0);
  addTriangle(x0+s*2.5,y0+h,180);
  // row 2
  addTriangle(x0,y0+2*h,-60);
  addTriangle(x0+s,y0+2*h,-60);
  addTriangle(x0+s*2,y0+2*h,-120);
  addTriangle(x0+s*3,y0+2*h,180);
}

function stampTriangles() {
  var numTriangles = triangles.length;
  for (var i = 0; i < numTriangles; i++) {
    triangles.pop().remove();
  }
  trianglePattern();
}

var selectedSegment;
var segmentAngle;

function onMouseDown(event) {
  selectedSegment = null;
  var hitResult = protoTriangle.hitTest(event.point, hitOptions);
  if (!hitResult) return;

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
    segmentAngle = -60 * selectedSide;

    console.log('t',triangleIndex,' s',selectedSide,' p',protoIndex);
  }
}

function onMouseDrag(event) {
  if (selectedSegment) {
    selectedSegment.point += event.delta.rotate(segmentAngle * -1);
    protoEdge.translate(-50,-50);
    protoTriangle.remove();
    protoTriangle = createProtoTriangle(protoEdge);
    protoTriangle.selected = false;

    stampTriangles();

    protoEdge.translate(50,50);
    protoTriangle.translate(50,100);

		editDots.remove();
		editDots = drawDots(protoTriangle);

    if (protoTriangle.getCrossings(protoTriangle).length > 0) {
      protoTriangle.fillColor = 'red';
    }
  }
}
