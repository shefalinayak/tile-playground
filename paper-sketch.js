
var sl = 100;
var origin = new Point(0,0);
var endpt = new Point(sl,0);

var protoEdge = new Path();
protoEdge.strokeColor = 'black';
protoEdge.add(origin, endpt);
protoEdge.pivot = origin;
protoEdge.insert(1, new Point(50,0));
protoEdge.insert(2, new Point(70,-10));
protoEdge.insert(3, new Point(75,0));

var e1 = protoEdge.clone();
var e2 = e1.clone();
e2.rotate(-60,endpt).reverse();
var e3 = e2.clone();
e3.rotate(-60).reverse();

var protoTriangle = e1;
protoTriangle.join(e2);
protoTriangle.join(e3);

protoTriangle.fillColor = 'paleturquoise';

protoTriangle.translate(50,100);
protoEdge.translate(50,50);
