// originally based on some code from
// http://www.jeffreythompson.org/blog/2012/02/18/pixelate-and-posterize-in-processing/
// amongst other sources I looked at

// TODO: need the ability to restart after a noLoop
// is that even possible ?!?!?!?

var img;
var pixSize = pixel8.initialSize;
var stepCount = 1;
var m;
var autoDirection = 1; // direction of expansion
var revCount = 0;
var firstFrame = true;
var buildStarted = false;

function setup () {
    const canvas = createCanvas(iwidth, iheight)
    canvas.parent('sketch-holder')
    canvas.drop(gotFile)

    noStroke();
    // TODO: oh, of course - sketch isn't acutally loaded until image is dragged in
    // how to do this in p5js?????
    //   scaleCanvas(iwidth);
    //   img = loadImage(uri); // still has a loading time....
    m = millis();
}

const gotFile = (file) => {
    if (file && file.type === 'image') {
      img = loadImage(file.data, () => { 
          img.loadPixels()
          resizeCanvas(img.width, img.height)
      })
    } else {
      println('Not an image file!')
    }
  }

function draw () {

    // wait until image is REALLY loaded from URI
    // crude
    if (!img || (img.pixels && img.pixels.length <= 10)) return;

    // we will loop back-n-forth UNTIL
    // "build-gif" is launched
    // then we will start from ground zero and loop around.

    if (buildmode) {
        noLoop();
        buildGif();
        buildmode = false;
    } else {
        if (pixel8.paused && singlestep == true) {
            drawPix();
            m = millis();
            singlestep = false;
        } else if (!pixel8.paused && (millis() - m > pixel8.delay)) {
            drawPix();
            m = millis();
        }
    }
}


function buildGif () {
    image(img, 0, 0);
    frames.push(externals.context.getImageData(0, 0, width, height));

    // reset
    // we don't store frames in "test mode" since any variable may change prior to build
    revCount = 0;
    pixSize = pixel8.initialSize;

    // only build the FIRST iteration
    // repeat it on the back end....
    while (revCount !== 1) {
        drawPix();
        frames.push(externals.context.getImageData(0, 0, width, height));
    }

    var workerobj = {
        'frames': frames,
        'delay': pixel8.delay,
        'width': width,
        'height': height
    };

    image(img, 0, 0);
    buildgif(workerobj);
}

const setPixSize = (direction, pixSize, stepSize) => {
    pixSize = (pixSize + (direction * stepSize));
    if (pixSize < stepSize) pixSize = stepSize;
    return pixSize;
}

// loop purely for manual monitoring
// for export [for, say, a gif], do it faster
function drawPix () {
    pixSize = setPixSize(autoDirection, pixSize, pixel8.stepSize);
    if (pixel8.type == 0) {
        pixelateImageUpperLeft(pixSize);
    } else if (pixel8.type == 1) {
        pixelateImageCenter(pixSize);
    } else if (pixel8.type == 2) {
        pixelateImageDivides(stepCount);
        stepCount += autoDirection;
        if (stepCount > pixel8.dMax || stepCount < pixel8.dMin) {
            stepCount = constrain(stepCount, pixel8.dMin, pixel8.dMax)
            autoDirection *= -1;
            revCount++;
        }
        return;
    }

    stepCount += autoDirection;
    // this does not nesc get us back to ZERO
    var curSize = (pixel8.stepSize * pixel8.maxSteps) + pixel8.initialSize;
    if (pixSize >= curSize || pixSize <= pixel8.stepSize
        || pixSize >= width || pixSize >= height) {
        if (pixSize >= curSize) pixSize = curSize;
        if (pixSize > width) pixSize = width;
        if (pixSize > height) pixSize = height;
        autoDirection *= -1;
        revCount++;
    }
}

// there's an issue where the right-hand strip comes and goes
// it's an average problem. probably "correct"
// but I don't like how it looks in a sequence
function pixelateImageUpperLeft (pxSize) {
    // TODO: work from center of image outward
    // or optionally pick the center
    for (var x = 0; x < width; x += pxSize) {
        for (var y = 0; y < height; y += pxSize) {
            fill(getColor(x, y, pxSize));
            rect(x, y, pxSize, pxSize);
        }
    }
}

function pixelateImageCenter (pxSize) {
    // lower-right
    var centerX = width / 2;
    var centerY = height / 2;
    for (var x = centerX; x < width; x += pxSize) {
        for (var y = centerY; y < height; y += pxSize) {
            fill(getColor(x, y, pxSize));
            rect(x, y, pxSize, pxSize);
        }
    }

    // lower-left
    // setting the initial value for x to (centerX - pxSize) didn't seem to work.
    for (var x = centerX; x > 0; x -= pxSize) {
        for (var y = centerY; y < height; y += pxSize) {
            fill(getColor(x - pxSize, y, pxSize));
            rect(x - pxSize, y, pxSize, pxSize);
        }
    }

    // upper-right
    for (var x = centerX; x < width; x += pxSize) {
        for (var y = centerY; y > 0; y -= pxSize) {
            fill(getColor(x, y - pxSize, pxSize));
            rect(x, y - pxSize, pxSize, pxSize);
        }
    }

    // upper-left
    for (var x = centerX; x > 0; x -= pxSize) {
        for (var y = centerY; y > 0; y -= pxSize) {
            fill(getColor(x - pxSize, y - pxSize, pxSize));
            rect(x - pxSize, y - pxSize, pxSize, pxSize);
        }
    }
}

// ahhhhhhhhh, if this number is too high, things get bananas
// we need a better grasp of what's going on
function pixelateImageDivides (pxSize) {
    // console.log(pxSize);
    // treats pxSize as a count, instead
    var xWidth = width / pxSize;
    var yHeight = height / pxSize;

    for (var x = 0; x < width; x += xWidth) {
        for (var y = 0; y < height; y += yHeight) {
            const c = getColor(x, y, xWidth);
            console.log(c);
            fill(c);
            // console.log(x, y, xWidth, yHeight);
            rect(x, y, xWidth, yHeight);
        }
    }
}

// average code based on http://stackoverflow.com/a/12408627/41153
// this is likely to fail if xLoc,yLoc is with pixSize of width,height
// but works for what I'm currently doing....
const getColor = (xLoc, yLoc, pixSize) => {
    if (yLoc < 0) { yLoc = 0 }
    if (xLoc < 0) { xLoc = 0 }
    var r = 0, b = 0, g = 0;
    var pixelCount = 0;

    for (var y = yLoc; y < yLoc + pixSize; y++) {
        for (var x = xLoc; x < xLoc + pixSize; x++) {
            // trap for out-of bounds "averages"
            // which skew towards black
            if (x < width && y < height) {
                const c = img.get(floor(x), floor(y));
                r += red(c);
                g += green(c);
                b += blue(c);
                pixelCount++;
            }
        }
    }

    const averageColor = color(r / pixelCount, g / pixelCount, b / pixelCount);
    return averageColor;
}
