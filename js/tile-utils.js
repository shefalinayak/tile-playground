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

var dotRadius = 4;
var origin = new Point(0,0);

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

// a Polygon is a set of Edges with rotations, translations, and reversions
// it can be used to create a closed path shape
function Polygon(edges,pivot,fill,stroke) {
	this.edges = edges;

	// creates a closed shape given an array of edges [e0,e1,e2...]
	// assumes continuity: e0 ends where e1 starts, etc
	this.calculatePath = function() {
		if (this.path) this.path.remove();
		var myShape = new Path();
		var ptData = [];
		var endptCount = 0;
		for (var i = 0; i < this.edges.length; i++) {
			var edge = this.edges[i];
			var edgeSegments = edge.getPath().segments;
			var numSegments = edgeSegments.length;
			for (var j = 0; j < numSegments-1; j++) {
				var seg = edgeSegments[j];
				myShape.add(seg);
				var edgeIndex = j;
				if (edge.reversed) {
					edgeIndex = numSegments - j - 1;
				}
				var endpointIndex = -1;
				if (j == 0) {
					endpointIndex = endptCount;
					endptCount += 1;
				}
				var data = {
					e: edge,
					index: edgeIndex,
					isEndpt: endpointIndex
				}
				ptData.push(data);
			}
		}
		myShape.closed = true;
		myShape.pivot = pivot;
		myShape.data = ptData;
		myShape.fillColor = fill;
		myShape.strokeColor = stroke;
		this.path = myShape;
		return this.path;
	};

	this.path = this.calculatePath();
}

// draws dots at the vertices of a shape
// the path must have a data array with vertex information
function drawDots(myShape) {
  var editDots = new Group();

	var segs = myShape.segments;
	for (var i = 0; i < segs.length; i++) {
		var pt = segs[i].point;
		var dot = new Path.Circle(pt, dotRadius);
		if (myShape.data[i].isEndpt < 0) {
			dot.fillColor = myShape.strokeColor;
		} else {
			dot.fillColor = 'lightgray';
		}
		editDots.addChild(dot);
	}

  return editDots;
}

function drawDotsForGroup(myGroup) {
  var shapes = myGroup.children;
  var dots = new Group();
  for (var i = 0; i < shapes.length; i++) {
    dots.addChild(drawDots(shapes[i]));
  }
  return dots;
}

function addShape(protoShape,group,x,y,theta) {
  var shape = protoShape.clone();
  shape.data = null;
  shape.position = new Point(x,y);
  shape.rotate(theta);
  group.addChild(shape);
}

function resetAll(group) {
  var stuff = group.children;
  for (var i = 0; i < stuff.length; i++) {
    stuff[i].position = origin;
  }
}

function checkForSelfIntersections(shapes) {
  for (var i = 0; i < shapes.length; i++) {
    var protoShape = shapes[i];
    if (protoShape.getCrossings(protoShape).length > 0) {
      protoShape.fillColor = 'lightcoral';
			protoShape.strokeColor = 'firebrick';
    }
  }
}

function TilePlayground(edges,shapes,createPattern,arrange) {
  this.edges = edges;
  this.shapes = shapes;
	this.shapePaths = new Group();

	this.updateShapes = function() {
		this.shapePaths.remove();
		this.shapePaths = new Group();
		for (var i = 0; i < this.shapes.length; i++) {
			var path = this.shapes[i].calculatePath();
			this.shapePaths.addChild(path);
		}
	};

	this.updateShapes();

	this.pattern = createPattern(this.shapePaths);
	this.arrange = arrange(this.edges,this.shapePaths);
	this.editDots = drawDotsForGroup(this.shapePaths);

  this.refresh = function() {
    resetAll(this.edges);
    this.updateShapes();

		arrange(this.edges,this.shapePaths);

    this.pattern.remove();
    this.pattern = createPattern(this.shapePaths);

		checkForSelfIntersections(this.shapePaths.children);

    this.editDots.remove();
    this.editDots = drawDotsForGroup(this.shapePaths);
  }

  this.selectedSegment;
  this.segmentAngle;

	this.editableEndpoints = false;
	this.selectedEndpoint;
	this.onEndpointEdit = function(event,endpointIndex) {
		console.log("no endpoint edit function specified");
	};

  this.hitOptions = {
  	segments: true,
  	stroke: true,
  	fill: false,
  	tolerance: dotRadius * 2,
  };

  // figures out which vertex was clicked, and adds/deletes vertex if necessary
  this.onMouseDown = function(event) {
    this.selectedSegment = this.segmentAngle = null;
		this.selectedEndpoint = -1;

    var hitResult = this.shapePaths.hitTest(event.point, this.hitOptions);
    if (!hitResult) return;

    var protoShape = hitResult.item;

  	// delete point
  	if (event.modifiers.shift) {
  		if (hitResult.type == 'segment') {
  			var ptData = protoShape.data[hitResult.segment.index];
  			ptData.e.proto.segments[ptData.index].remove();
  			this.refresh();
  		}
  		return;
  	}

  	var ptData;
    if (hitResult) {
  		if (hitResult.type == 'segment') { // vertex already exists
  			var shapeIndex = hitResult.segment.index;
  			ptData = protoShape.data[shapeIndex];
  			if (ptData.isEndpt < 0) {
  				this.selectedSegment = ptData.e.proto.segments[ptData.index];
  				this.segmentAngle = ptData.e.theta;
  			} else if (this.editableEndpoints) {
					this.selectedEndpoint = ptData.isEndpt;
				}
  		} else if (hitResult.type == 'stroke') { // create a new vertex
  			// get info about nearest point
  			var shapeIndex = hitResult.location.index;
  			ptData = protoShape.data[shapeIndex];
				var edge = ptData.e;
				this.segmentAngle = edge.theta;
				var prevPoint, prevProtoPoint, ptIndex;
  			if (edge.reversed) {
					var numPoints = protoShape.segments.length;
  				prevPoint = protoShape.segments[(shapeIndex+1)%numPoints].point;
					ptIndex = ptData.index - 1;
  			} else {
  				prevPoint = protoShape.segments[shapeIndex].point;
					ptIndex = ptData.index;
  			}
  			// create new point on protoedge
  			var delta = event.point - prevPoint;
  			delta = delta.rotate(this.segmentAngle * -1);
				var prevProtoPoint = edge.proto.segments[ptIndex].point;
  			var newProtoPoint = prevProtoPoint + delta;
  			var insertIndex = ptIndex+1;
  			this.selectedSegment = edge.proto.insert(ptIndex+1, newProtoPoint);
  			// draw edit dot for the new point
  			var newEditDot = new Path.Circle(event.point,dotRadius);
  			newEditDot.fillColor = 'darkturquoise';
  			this.editDots.addChild(newEditDot);

  			this.refresh();
  		}

  		//console.log(ptData);
    }

  }

  // moves a vertex according to mouse drag
  this.onMouseDrag = function(event) {
    if (this.selectedSegment) {
      this.selectedSegment.point += event.delta.rotate(this.segmentAngle * -1);
  		this.refresh();
    } else if (this.selectedEndpoint >= 0) {
			this.onEndpointEdit(event,this.selectedEndpoint);
			this.refresh();
		}
  }

  this.exportOptions = {
  	bounds: 'content',
  	asString: 'true'
  }

  this.downloadSVG = function() {
  	var svgString = project.exportSVG(this.exportOptions);
  	var svgBlob = new Blob([svgString], {type:"image/svg+xml;charset=utf-8"});
  	var svgUrl = URL.createObjectURL(svgBlob);
  	var downloadLink = document.createElement("a");
  	downloadLink.href = svgUrl;
  	downloadLink.download = "my-tile-playground.svg";
  	document.body.appendChild(downloadLink);
  	downloadLink.click();
  	document.body.removeChild(downloadLink);
  }
}

window.Edge = Edge;
window.addShape = addShape;
window.Polygon = Polygon;
window.TilePlayground = TilePlayground;
