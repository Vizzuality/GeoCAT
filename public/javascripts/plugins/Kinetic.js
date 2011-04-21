/*
 * Kinetic JS JavaScript Library v1.0.0
 * http://www.kineticjs.com/
 * Copyright 2011, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: Apr 16 2011
 * 
 * Copyright (C) 2011 by Eric Rowell
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/

var Kinetic = {};

Kinetic.Stage = function (canvas, fps) {

    // Stage vars
    var canvas = canvas;
    var context = canvas.getContext("2d");
    var fps = fps;
    var updateStage = null;
    var drawStage = null;

    // Event vars
    var mousePos = null;
    var mouseDown = false;
    var mouseUp = false;
    var currentRegion = null;
    var regionCounter = 0;
    var lastRegionIndex = null;

    // Animation vars
    var context = canvas.getContext("2d");
    var t = 0;
    var timeInterval = 1000 / fps;
    var intervalId = null;

    // Stage
    this.setDrawStage = function (func) {
        drawStage = func;
    };

    this.setUpdateStage = function (func) {
        updateStage = func;
    };

    this.getContext = function () {
        return context;
    };

    this.clearCanvas = function() {
        clearCanvas();
    }
	
	function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

	this.listen = function() {
		listen();
	}
    // Events
    function listen() {
		// store current listeners
		var canvasOnmouseover = canvas.onmouseover; 
		var canvasOnmouseout = canvas.onmouseout; 
		var canvasOnmousemove = canvas.onmousemove;
		var canvasOnmousedown = canvas.onmousedown; 
		var canvasOnmouseup = canvas.onmouseup; 
	
        if (drawStage != null) {
            drawStage();
        }

        canvas.onmouseover = function (e) {
			if (!e) var e = window.event;
		
			setMousePosition(e);
			if (canvasOnmouseover!=null) {
				canvasOnmouseover();
			}
        };

        canvas.onmouseout = function () {
            mousePos = null;
			if (canvasOnmouseout!=null) {
				canvasOnmouseout();
			}
        };

        canvas.onmousemove = function (e) {
			if (!e) var e = window.event;
			reset(e);
			
			if (canvasOnmousemove!=null) {
				canvasOnmousemove();
			}
        };

        canvas.onmousedown = function (e) {
			if (!e) var e = window.event;
			mouseDown = true;
			reset(e);
		
			if (canvasOnmousedown!=null) {
				canvasOnmousedown();
			}
        };

        canvas.onmouseup = function (e) {
			if (!e) var e = window.event;
			mouseUp = true;	
			reset(e);

			if (canvasOnmouseup!=null) {
				canvasOnmouseup();
			}		
        }
    };

    this.beginRegion = function () {
        currentRegion = new Kinetic.Region();
        regionCounter++;
    };
	
	// add region event listeners
    this.addRegionEventListener = function (type, func) {
        if (type == "onmouseover") {
            currentRegion.onmouseover = func;
        } else if (type == "onmouseout") {
            currentRegion.onmouseout = func;
        } else if (type == "onmousemove") {
            currentRegion.onmousemove = func;
        } else if (type == "onmousedown") {
            currentRegion.onmousedown = func;
        } else if (type == "onmouseup") {
            currentRegion.onmouseup = func;
        }
    };

    this.closeRegion = function () {
        if (mousePos != null && context.isPointInPath(mousePos.x, mousePos.y)) {

            // handle onmousemove
            // do this everytime
            if (currentRegion.onmousemove != null) {
                currentRegion.onmousemove();
            }

            // handle onmouseover
            if (lastRegionIndex != regionCounter) {
                lastRegionIndex = regionCounter;

                if (currentRegion.onmouseover != null) {
                    currentRegion.onmouseover();
                }
            }

            // handle onmousedown
            if (mouseDown && currentRegion.onmousedown != null) {
                currentRegion.onmousedown();
                mouseDown = false;
            }

            // handle onmouseup
            if (mouseUp && currentRegion.onmouseup != null) {
                currentRegion.onmouseup();
                mouseUp = false;
            }

        } else if (regionCounter == lastRegionIndex) {
            // handle mouseout condition
            lastRegionIndex = null;

            if (currentRegion.onmouseout != null) {
                currentRegion.onmouseout();
            }
        }

        regionCounter++;
    };

    this.getMousePos = function (evt) {
        return mousePos;
    };

    function setMousePosition(evt) {
        var mouseX = evt.clientX - canvas.offsetLeft + document.body.scrollLeft;
        var mouseY = evt.clientY - canvas.offsetTop + document.body.scrollTop;
        mousePos = new Kinetic.Position(mouseX, mouseY);
    }

    function reset(evt) {
        setMousePosition(evt);
        regionCounter = 0;
		
		if (drawStage!=null) {
			clearCanvas();		
			drawStage();
		}
		
        mouseDown = false;
        mouseUp = false;
    }

    // Animation	
    this.startAnimation = function () {
        if (drawStage != null) {
            drawStage();
        }

        intervalId = setInterval(animationLoop, timeInterval);
    };

    this.stopAnimation = function () {
        clearInterval(intervalId);
    };

    this.getTimeInterval = function () {
        return timeInterval;
    };

    this.getTime = function () {
        return t;
    };

    function animationLoop() {
        t += timeInterval;
        clearCanvas();
        if (updateStage != null) {
            updateStage();
        }
        if (drawStage != null) {
            drawStage();
        }
    }
}

Kinetic.Region = function () {
    this.onmouseover = null; // user defined function
    this.onmouseout = null; // user defined function
    this.onmousemove = null; // user defined function
    this.onmousedown = null; // user defined function
    this.onmouseout = null; // user defined function
}

Kinetic.Position = function (x, y) {
    this.x = x;
    this.y = y;
}