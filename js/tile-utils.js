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

// draws dots at the vertices of a shape
// the path must have a data array with vertex information
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

function TilePlayground(createEdges,createShapes,createPattern,arrange) {
  this.edges = createEdges();
  this.shapes = createShapes(this.edges);
  this.pattern = createPattern(this.shapes);

  this.arrange = arrange(this.edges,this.shapes);
  this.editDots = drawDotsForGroup(this.shapes);

  this.refresh = function() {
    resetAll(this.edges);

    this.shapes.remove();
    this.shapes = createShapes(this.edges);

    this.pattern.remove();
    this.pattern = createPattern(this.shapes);

    arrange(this.edges,this.shapes);

    this.editDots.remove();
    this.editDots = drawDotsForGroup(this.shapes);
  }

  this.selectedSegment;
  this.segmentAngle;

  this.hitOptions = {
  	segments: true,
  	stroke: true,
  	fill: false,
  	tolerance: dotRadius * 2,
  };

  this.checkForSelfIntersections = function() {
    for (var i = 0; i < this.shapes.length; i++) {
      var protoShape = this.shapes[i];
      if (protoShape.getCrossings(protoShape).length > 0) {
        protoShape.fillColor = 'red';
      }
    }
  }

  // figures out which vertex was clicked, and adds/deletes vertex if necessary
  this.onMouseDown = function(event) {
    this.selectedSegment = null;

    var hitResult = this.shapes.hitTest(event.point, this.hitOptions);
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
  			if (!ptData.isEndpt) {
  				this.selectedSegment = ptData.e.proto.segments[ptData.index];
  				this.segmentAngle = ptData.e.theta;
  			}
  		} else if (hitResult.type == 'stroke') { // create a new vertex
  			// get info about nearest point
  			var shapeIndex = hitResult.location.index;
  			ptData = protoShape.data[shapeIndex];
  			var prevPoint;
  			if (ptData.e.reversed) {
  				prevPoint = protoShape.segments[shapeIndex+1].point;
  				this.segmentAngle = ptData.e.theta;
  				ptData = protoShape.data[shapeIndex+1];
  			} else {
  				prevPoint = protoShape.segments[shapeIndex].point;
  				this.segmentAngle = ptData.e.theta;
  			}
  			// create new point on protoedge
  			var delta = event.point - prevPoint;
  			delta = delta.rotate(this.segmentAngle * -1);
  			var prevProtoPoint = ptData.e.proto.segments[ptData.index].point;
  			var newProtoPoint = prevProtoPoint + delta;
  			var insertIndex = ptData.index+1;
  			this.selectedSegment = ptData.e.proto.insert(ptData.index+1, newProtoPoint);
  			// draw edit dot for the new point
  			var newEditDot = new Path.Circle(event.point,dotRadius);
  			newEditDot.fillColor = 'darkturquoise';
  			this.editDots.addChild(newEditDot);

  			this.refresh();
  		}

  		console.log(ptData);
    }

  }

  // moves a vertex according to mouse drag
  this.onMouseDrag = function(event) {
    if (this.selectedSegment) {
      this.selectedSegment.point += event.delta.rotate(this.segmentAngle * -1);

  		this.refresh();

      this.checkForSelfIntersections();
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
window.createShapeFromEdges = createShapeFromEdges;
window.TilePlayground = TilePlayground;
