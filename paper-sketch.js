var hitOptions = {
	segments: true,
	stroke: false,
	fill: false,
	tolerance: 8,
};

var dotRadius = hitOptions.tolerance / 2;
var s = 100;
var h = s * Math.sqrt(3) / 2;
var origin = new Point(0,0);
var endpt = new Point(s,0);

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

function Edge(proto,delta,theta,reversed) {
	this.proto = proto;
	this.delta = delta;
	this.theta = theta;
	this.reversed = reversed;

	this.getPath = function() {
		var edgePath = this.proto.clone();
		edgePath.rotate(this.theta);
		edgePath.translate(this.delta);
		if (this.reversed) edgePath.reverse();
		edgePath.remove();
		return edgePath;
	}
}

function createProtoTriangle(protoEdge) {
	var e1 = new Edge(protoEdge,new Point(0,0),0,false);
	var e2 = new Edge(protoEdge,new Point(s/2,h),-60,true);
	var e3 = new Edge(protoEdge,new Point(s/2,h),-120,false);

	var edges = [e1,e2,e3];

  var triangle = createShapeFromEdges(edges);

  triangle.fillColor = 'paleturquoise';
	triangle.strokeColor = 'darkturquoise';

  return triangle;
}

function createShapeFromEdges(edges) {
	var myShape = new Path();
	var ptData = [];
	for (var i = 0; i < edges.length; i++) {
		var edge = edges[i];
		var edgeSegments = edge.getPath().segments;
		var numSegments = edgeSegments.length;
		for (var j = 0; j < numSegments-1; j++) {
			var seg = edgeSegments[j];
			myShape.add(seg);
			var edgeIndex = j;
			if (edge.reversed) {
				edgeIndex = numSegments - j - 1;
			}
			var data = {
				e: edge,
				index: edgeIndex,
				isEndpt: j == 0
			}
			ptData.push(data);
		}
	}
	myShape.closed = true;
	myShape.pivot = origin;
	myShape.data = ptData;
	return myShape;
}

function drawDots(myShape) {
	var editDots = new Group();
	var segs = myShape.segments;
	for (var i = 0; i < segs.length; i++) {
		var pt = segs[i].point;
		var dot = new Path.Circle(pt, dotRadius);
		if (myShape.data[i].isEndpt) {
			dot.fillColor = 'lightgray';
		} else {
			dot.fillColor = 'darkturquoise';
		}
		editDots.addChild(dot);
	}
	return editDots;
}

var triangles = [];

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
		var ptData = protoTriangle.data[triangleIndex];
    var numSegments = ptData.e.proto.segments.length;
    var protoIndex = ptData.index;
    if (!ptData.isEndpt) {
      selectedSegment = protoEdge.segments[protoIndex];
    }
    segmentAngle = ptData.e.theta;

		console.log(ptData);
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
