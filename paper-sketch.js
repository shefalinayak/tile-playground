/*----------------------------------------------------------------------------
 * TILE PLAYGROUND
 * interactive tool for designing tiling shapes
 *    ___ ___ ___ ___ ___
 *  /\  /\  /\  /\  /\  /\
 * /__\/__\/__\/__\/__\/__\
 * \  /\  /\  /\  /\  /\  /
 *  \/__\/__\/__\/__\/__\/
 *  /\  /\  /\  /\  /\  /\
 * /__\/__\/__\/__\/__\/__\
 *---------------------------------------------------------------------------*/


/*----------------------------------------------------------------------------
 * GLOBAL VARIABLES
 *---------------------------------------------------------------------------*/

var hitOptions = {
	segments: true,
	stroke: true,
	fill: false,
	tolerance: 8,
};

var dotRadius = hitOptions.tolerance / 2;
var origin = new Point(0,0);
var endpt = new Point(100,0);

var protoEdge = new Path();
var editDots = new Group();

var selectedSegment;
var segmentAngle;

// TRIANGLE-SPECIFIC
var s = endpt.x;
var h = s * Math.sqrt(3) / 2;
var protoTriangle = new Path();
var triangles = new Group();

/*----------------------------------------------------------------------------
 * CONSTRUCTING GEOMETRY
 *---------------------------------------------------------------------------*/

// initializes the protoedges
// should only be called once at the start
function createProtoEdge() {
	protoEdge.remove()
  protoEdge = new Path();

  protoEdge.add(origin, endpt);
  protoEdge.pivot = origin;
  protoEdge.insert(1, new Point(50,0));
  protoEdge.insert(2, new Point(70,-10));
  protoEdge.insert(3, new Point(75,0));

  protoEdge.strokeColor = 'black';
}

// an Edge is a reference to a protoedge and a transformation on that protoedge
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

// creates a closed shape given an array of edges [e0,e1,e2...]
// assumes continuity: e0 ends where e1 starts, etc
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

/*----------------------------------------------------------------------------
 * TRIANGLE GEOMETRY
 *---------------------------------------------------------------------------*/

// creates an equilateral triangle from a single protoedge
function createProtoTriangle() {
	protoTriangle.remove();

	var e1 = new Edge(protoEdge,new Point(0,0),0,false);
	var e2 = new Edge(protoEdge,new Point(s/2,h),-60,true);
	var e3 = new Edge(protoEdge,new Point(s/2,h),-120,false);

	var edges = [e1,e2,e3];

  protoTriangle = createShapeFromEdges(edges);

  protoTriangle.fillColor = 'paleturquoise';
	protoTriangle.strokeColor = 'darkturquoise';
}

// add a triangle based on the protoTriangle
function addTriangle(x,y,theta) {
  var tri = protoTriangle.clone();
  tri.position = new Point(x,y);
  tri.rotate(theta);
  tri.selected = false;
  triangles.addChild(tri);
}

// draws a simple pattern of tiling triangles
function trianglePattern() {
	triangles.remove();
	triangles = new Group();

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

/*----------------------------------------------------------------------------
 * DRAWING FUNCTIONS
 *---------------------------------------------------------------------------*/

// draws dots at the vertices of a shape
// the path must have a data array with vertex information
function drawDots(myShape) {
	editDots.remove();
	editDots = new Group();

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
}

// initial drawing of geometry
function drawFirst() {
	createProtoEdge();

	createProtoTriangle();
	trianglePattern();

	protoTriangle.translate(50,100);
	protoEdge.translate(50,50);

	drawDots(protoTriangle);
}

// recalculates and redraws all geometry except protoedges
// protoedges are updated by user action--never redraw them!
function drawUpdate() {
	protoEdge.translate(-50,-50);
	createProtoTriangle();

	trianglePattern();

	protoEdge.translate(50,50);
	protoTriangle.translate(50,100);

	drawDots(protoTriangle);
}

drawFirst();

/*----------------------------------------------------------------------------
 * USER INTERACTION
 *---------------------------------------------------------------------------*/

// figures out which vertex was clicked, and adds/deletes vertex if necessary
function onMouseDown(event) {
  selectedSegment = null;
  var hitResult = protoTriangle.hitTest(event.point, hitOptions);
  if (!hitResult) return;

	// delete point
	if (event.modifiers.shift) {
		if (hitResult.type == 'segment') {
			var ptData = protoTriangle.data[hitResult.segment.index];
			ptData.e.proto.segments[ptData.index].remove();
			drawUpdate();
		}
		return;
	}

	var ptData;
  if (hitResult) {
		if (hitResult.type == 'segment') { // vertex already exists
			var triangleIndex = hitResult.segment.index;
			ptData = protoTriangle.data[triangleIndex];
			if (!ptData.isEndpt) {
				selectedSegment = protoEdge.segments[ptData.index];
				segmentAngle = ptData.e.theta;
			}
		} else if (hitResult.type == 'stroke') { // create a new vertex
			// get info about nearest point
			var triangleIndex = hitResult.location.index;
			ptData = protoTriangle.data[triangleIndex];
			var prevPoint;
			if (ptData.e.reversed) {
				prevPoint = protoTriangle.segments[triangleIndex+1].point;
				segmentAngle = ptData.e.theta;
				ptData = protoTriangle.data[triangleIndex+1];
			} else {
				prevPoint = protoTriangle.segments[triangleIndex].point;
				segmentAngle = ptData.e.theta;
			}
			// create new point on protoedge
			var delta = event.point - prevPoint;
			delta = delta.rotate(segmentAngle * -1);
			var prevProtoPoint = ptData.e.proto.segments[ptData.index].point;
			var newProtoPoint = prevProtoPoint + delta;
			var insertIndex = ptData.index+1;
			selectedSegment = ptData.e.proto.insert(ptData.index+1, newProtoPoint);
			// draw edit dot for the new point
			var newEditDot = new Path.Circle(event.point,dotRadius);
			newEditDot.fillColor = 'darkturquoise';
			editDots.addChild(newEditDot);

			drawUpdate();
		}

		console.log(ptData);
  }

}

// moves a vertex according to mouse drag
function onMouseDrag(event) {
  if (selectedSegment) {
    selectedSegment.point += event.delta.rotate(segmentAngle * -1);

		drawUpdate();

    if (protoTriangle.getCrossings(protoTriangle).length > 0) {
      protoTriangle.fillColor = 'red';
    }
  }
}
