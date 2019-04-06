let protoEdge = [];
let tri;
let triArray = [];
let numPoints = 10;

let colorA;
let colorB;
let interp;

function setup() {
  createCanvas(600, 600);

  initializeProtoEdge();
  tri = new Triangle(50, 50, 0);

  createTriangleArray();

  colorA = color(79, 5, 252);
  colorB = color(5, 186, 252);
  interp = 0;
}

function draw() {
  background(220);

  drawEdge(protoEdge);

  fill(lerpColor(colorA,colorB,sin(interp)));
  stroke(255,255,255);

  tri.draw(true);

  for (let t of triArray) {
    t.draw();
  }
  interp = interp + 0.002;
}

function mousePressed() {
  tri.getClosestPointToCursor();
}

function mouseDragged() {
  if (tri.selected) {
    // update coordinates of point based on cursor
    tri.updatePoint();
  }

  for (let t of triArray) {
    t.update();
  }
}

function mouseReleased() {
  tri.selected = false;

}

function createTriangleArray() {
  let x0 = 150;
  let y0 = 300;

  let s = 100;
  let h = s * sqrt(3) / 2;

  // row 1
  triArray.push(new Triangle(x0,y0,0));
  triArray.push(new Triangle(x0+s,y0,PI/3));
  triArray.push(new Triangle(x0+2*s,y0,2*PI/3));
  triArray.push(new Triangle(x0+3*s,y0,2*PI/3));
  // row 1.5
  triArray.push(new Triangle(x0+s*0.5,y0+h,0));
  triArray.push(new Triangle(x0+s*2.5,y0+h,PI));
  // row 2
  triArray.push(new Triangle(x0,y0+2*h,-PI/3));
  triArray.push(new Triangle(x0+s,y0+2*h,-PI/3));
  triArray.push(new Triangle(x0+s*2,y0+2*h,-2*PI/3));
  triArray.push(new Triangle(x0+s*3,y0+2*h,PI));
}

function Triangle(x, y, theta) {

  Shape.call(this, x, y, theta);

  let s = 100;
  let h = s * sqrt(3) / 2;

  edge1 = new edge(0, 0, 0, false);
  edge2 = new edge(s/2, h, -PI / 3, true);
  edge3 = new edge(s/2, h, -2 * PI / 3, false);

  this.edges = [edge1, edge2, edge3];
}

function Shape(x, y, theta) {
  this.x = x;
  this.y = y;
  this.theta = theta;

  this.selected = false;
  this.selectedPointIndex = 0;
  this.selectedEdgeIndex = 0;

  this.update = function() {
    for (let e of this.edges) {
      e.update();
    }
  };

  this.updatePoint = function() {
    if (this.selected) {
      let e = this.edges[this.selectedEdgeIndex];

      // invert all the mappings to find the position of cursor in original coordinate system
      let mappedCursor = [{
          x: mouseX,
          y: mouseY
        }]
        .map(translateEdge(-this.x, -this.y))
        .map(rotateEdge(-this.theta))
        .map(translateEdge(-e.x, -e.y))
        .map(rotateEdge(-e.theta))[0];

      protoEdge[this.selectedPointIndex].x = mappedCursor.x;
      protoEdge[this.selectedPointIndex].y = mappedCursor.y;

      this.update();
    }
  }

  this.distance = function(p1, p2) {
    return sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  this.getClosestPointToCursor = function() {
    let edgeIndex = -1;
    let pointIndex = -1;
    let minDist = width;

    for (let ei = 0; ei < this.edges.length; ei++) {

      let e = this.edges[ei];
      // we also need to apply the final translation and rotation to the points
      // i.e. the one that shows up using translate() & rotate() in this.draw
      let points = e.points.map(rotateEdge(this.theta)).map(translateEdge(this.x, this.y));

      for (let pi = 0; pi < points.length; pi++) {

        let mousePos = {
          x: mouseX,
          y: mouseY
        };
        let distance = this.distance(points[pi], mousePos);

        if (distance < minDist) {
          minDist = distance;
          edgeIndex = ei;
          pointIndex = pi;
          if (e.reversed) {
            pointIndex = numPoints - pi;
          }
        }
      }
    }

    if (minDist < 20 && !this.selected) {
      if (0 < pointIndex && pointIndex < numPoints) {
        this.selected = true;
        this.selectedEdgeIndex = edgeIndex;
        this.selectedPointIndex = pointIndex;
      }
    }

    console.log('closest: e' + edgeIndex + ' p' + pointIndex);

  };

  this.draw = function(drawEditPoints=false) {
    push();
    translate(this.x, this.y);
    rotate(this.theta);

    beginShape();
    for (let e of this.edges) {
      for (let p of e.points) {
        vertex(p.x, p.y);
      }
    }
    endShape(CLOSE);

    noStroke();

    for (let ei = 0; ei < this.edges.length; ei++) {

      let e = this.edges[ei];

      for (let pi = 0; pi < e.points.length; pi++) {

        let p = e.points[pi];
        let rpi = pi;
        if (e.reversed) {
          rpi = numPoints - pi;
        }

        if (drawEditPoints) {
          if (this.selected &&
            rpi == this.selectedPointIndex &&
            ei == this.selectedEdgeIndex) {
            fill(40, 40, 240);
          } else {
            fill(40, 40, 40, 100);
          }
          ellipse(p.x, p.y, 6);
        }
    }
    }

    pop();
  }

}

function initializeProtoEdge() {
  for (let i = 0; i <= numPoints; i++) {
    let x = 100 * i / numPoints;
    let y = 0;
    protoEdge.push({
      x: x,
      y: y
    });
  }
}

function edge(dx, dy, theta, reversed) {
  this.x = dx;
  this.y = dy;
  this.theta = theta;
  this.reversed = reversed;
  this.points = [];

  this.update = function() {
    this.points = protoEdge.map(rotateEdge(theta)).map(translateEdge(dx, dy));
    if (this.reversed) this.points = this.points.reverse();
  }

  this.update();

}

function drawEdge(edgeArr) {
  fill(40, 40, 40);
  stroke(40);

  for (let i = 1; i < edgeArr.length; i++) {
    let p1 = edgeArr[i - 1];
    let p2 = edgeArr[i];
    line(p1.x, p1.y, p2.x, p2.y);
  }
}

function translateEdge(dx, dy) {
  return e => ({
    x: e.x + dx,
    y: e.y + dy
  });
}

function rotateEdge(theta) {
  return e => ({
    x: e.x * cos(theta) - e.y * sin(theta),
    y: e.x * sin(theta) + e.y * cos(theta)
  });
}
