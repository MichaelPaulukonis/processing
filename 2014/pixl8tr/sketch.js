// originally based on some code from
// http://www.jeffreythompson.org/blog/2012/02/18/pixelate-and-posterize-in-processing/
// amongst other sources I looked at

// TODO: need the ability to restart after a noLoop
// is that even possible ?!?!?!?

var img;
var pixSize = params.initialSize;
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
            // resizeCanvas(img.width, img.height)
            resizeCanvas(img.width, img.height)
            scaleCanvas(iwidth);
        })
    } else {
        console.log('Not an image file!')
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
        if (params.paused && singlestep == true) {
            noLoop()
            drawPix();
            m = millis();
            singlestep = false;
            loop()
        } else if (!params.paused && (millis() - m > params.delay)) {
            drawPix();
            m = millis();
        }
    }
}


function buildGif () {
    // capture original image
    // eh, forget it
    // image(img, 0, 0);
    // frames.push(drawingContext.getImageData(0, 0, width, height));

    // reset
    // we don't store frames in "test mode" since any variable may change prior to build
    // TODO: but if they DON'T change, it would be nice to keep them around!
    // if params are dirty, discard everything and start over
    revCount = 0;
    stepCount = params.dMin
    pixSize = params.dMin;
    direction = 1;

    // only build the FIRST iteration
    // repeat it on the back end....
    // TODO: how about CONTROL THE LOOPING HERE
    // we're relying on some weird variable to get set somewhere else. yick.
    while (revCount !== 1) {
        drawPix();
        frames.push(drawingContext.getImageData(0, 0, width, height));
    }

    var gifData = {
        'frames': frames,
        'delay': params.delay,
        'width': width,
        'height': height
    };

    image(img, 0, 0);
    buildgif(gifData);
}

const setPixSize = (direction, pixSize, stepSize) => {
    pixSize = (pixSize + (direction * stepSize));
    if (pixSize < stepSize) pixSize = stepSize;
    return pixSize;
}

// loop purely for manual monitoring
// for export [for, say, a gif], do it faster
function drawPix () {
    pixSize = setPixSize(autoDirection, pixSize, params.stepSize);
    if (params.type == 0) {
        pixelateImageUpperLeft(pixSize);
    } else if (params.type == 1) {
        pixelateImageCenter(pixSize);
    } else if (params.type == 2) {
        pixelateImageDivides(stepCount);
        stepCount += autoDirection;
        if (stepCount > params.dMax || stepCount < params.dMin) {
            stepCount = constrain(stepCount, params.dMin, params.dMax)
            autoDirection *= -1;
            revCount++; // this is the "reverseCount" used for building the gif only. ugh.
        }
        return;
    }

    stepCount += autoDirection;
    // this does not nesc get us back to ZERO
    var curSize = (params.stepSize * params.maxSteps) + params.initialSize;
    if (pixSize >= curSize || pixSize <= params.stepSize
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
function pixelateImageDivides (cellCount) {
    var xWidth = width / cellCount;
    var yHeight = height / cellCount;

    for (var x = 0; x < width; x += xWidth) {
        for (var y = 0; y < height; y += yHeight) {
            const c = getColor(x, y, xWidth, true);
            fill(c);
            rect(x, y, xWidth + 2, yHeight + 2);
        }
    }
}

// average code based on http://stackoverflow.com/a/12408627/41153
// this is likely to fail if xLoc,yLoc is with pixSize of width,height
// but works for what I'm currently doing....
const getColor = (xLoc, yLoc, cellSize) => {
    if (yLoc < 0) { yLoc = 0 }
    if (xLoc < 0) { xLoc = 0 }
    let r = 0, b = 0, g = 0;
    const pixelCount = cellSize * cellSize

    const allPixels = img.drawingContext.getImageData(xLoc, yLoc, cellSize, cellSize).data
    for (let i = 0; i < allPixels.length; i += 4) {
        r += allPixels[i]
        g += allPixels[i + 1]
        b += allPixels[i + 2]
        // skip alpha
    }

    const averageColor = color(r / pixelCount, g / pixelCount, b / pixelCount);
    return averageColor;
}
// seems like my algo is a common mistake
// see https://www.reddit.com/r/processing/comments/3v2yyg/is_this_the_best_way_to_pixelate_an_image/
const averageColors = (colorArray) => {
    var redAvg = 0;
    var greenAvg = 0;
    var blueAvg = 0;
    let finalCol = color(0, 0, 0);
    for (var across = 0; across < colorArray.length; across++) {
        for (var down = 0; down < colorArray.length; down++) {
            redAvg += Math.pow(red(colorArray[across][down]), 2);
            greenAvg += Math.pow(green(colorArray[across][down]), 2);
            blueAvg += Math.pow(blue(colorArray[across][down]), 2);
        }
    }
    var totalSize = colorArray.length * colorArray.length;
    redAvg = Math.sqrt(redAvg / (totalSize))
    greenAvg = Math.sqrt(greenAvg / (totalSize))
    blueAvg = Math.sqrt(blueAvg / (totalSize))
    finalCol = color(redAvg, greenAvg, blueAvg);
    return (finalCol);
}
