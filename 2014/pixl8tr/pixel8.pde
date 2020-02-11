// originally based on some code from
// http://www.jeffreythompson.org/blog/2012/02/18/pixelate-and-posterize-in-processing/
// amongst other sources I looked at

// TODO: need the ability to restart after a noLoop
// is that even possible ?!?!?!?

PImage img;
int pixSize = params.initialSize;
int stepCount = 1;
int m;
int autoDirection = 1; // direction of expansion
int revCount = 0;
boolean firstFrame = true;
boolean buildStarted = false;

void setup() {
  size(params.iwidth, params.iheight);
  noStroke();
  scaleCanvas(params.iwidth);
  img = loadImage(params.uri); // still has a loading time....
  m = millis();
}

void draw() {

  // wait until image is REALLY loaded from URI
  // crude
  if (img.pixels.length <= 10) return;

  // we will loop back-n-forth UNTIL
  // "build-gif" is launched
  // then we will start from ground zero and loop around.

  if (params.buildmode) {
    noLoop();
    buildGif();
    params.buildmode = false;
  } else {
    if (params.paused && params.singlestep == true) {
      drawPix();
      m = millis();
      params.singlestep = false;
    } else if (!params.paused && (millis() - m > params.delay)) {
      drawPix();
      m = millis();
    }
  }
}


void buildGif() {
  // image(img, 0, 0);
  // frames.push(externals.context.getImageData(0,0,width,height));

  // reset
  // we don't store frames in "test mode" since any variable may change prior to build
  revCount = 0;
  pixSize = params.initialSize;

  // only build the FIRST iteration
  // repeat it on the back end....
  while (revCount !== 1) {
    drawPix();
    params.frames.push(externals.context.getImageData(0,0,width,height));
  }

  var workerobj = {
    'frames': params.frames,
    'delay': params.delay,
    'width': width,
    'height': height
  };

  image(img, 0, 0);
  buildgif(workerobj);
}

int setPixSize(int direction, int pixSize, int stepSize) {
  pixSize = (pixSize + (direction * stepSize));
  if (pixSize < stepSize) pixSize = stepSize;
  return pixSize;
}

// loop purely for manual monitoring
// for export [for, say, a gif], do it faster
void drawPix() {
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
      revCount++;
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
void pixelateImageUpperLeft(int pxSize) {
  // TODO: work from center of image outward
  // or optionally pick the center
  for (int x=0; x<width; x+=pxSize) {
    for (int y=0; y<height; y+=pxSize) {
      fill(getColor(x, y, pxSize));
      rect(x, y, pxSize, pxSize);
    }
  }
}

void pixelateImageCenter(int pxSize) {
  // lower-right
  int centerX = width/2;
  int centerY = height/2;
  for (int x=centerX; x<width; x+=pxSize) {
    for (int y=centerY; y<height; y+=pxSize) {
      fill(getColor(x, y, pxSize));
      rect(x, y, pxSize, pxSize);
    }
  }

  // lower-left
  // setting the initial value for x to (centerX - pxSize) didn't seem to work.
  for (int x = centerX; x > 0; x -= pxSize) {
    for (int y = centerY; y < height; y += pxSize) {
      fill(getColor(x-pxSize, y, pxSize));
      rect(x-pxSize, y, pxSize, pxSize);
    }
  }

  // upper-right
  for (int x=centerX; x<width; x+=pxSize) {
    for (int y = centerY; y > 0; y -= pxSize) {
      fill(getColor(x, y-pxSize, pxSize));
      rect(x, y-pxSize, pxSize, pxSize);
    }
  }

  // upper-left
  for (int x = centerX; x > 0; x -= pxSize) {
    for (int y = centerY; y > 0; y -= pxSize) {
      fill(getColor(x-pxSize, y-pxSize, pxSize));
      rect(x-pxSize, y-pxSize, pxSize, pxSize);
    }
  }
}

// ahhhhhhhhh, if this number is too high, things get bananas
// we need a better grasp of what's going on
void pixelateImageDivides(int pxSize) {
  // treats pxSize as a count, instead
  int xWidth = (int)width / pxSize;
  int yHeight = (int)height / pxSize;

  for (int x = 0; x < width; x += xWidth) {
    for (int y = 0; y < height; y += yHeight) {
      Color c = getColor(x, y, xWidth);
      fill(c);
      rect(x, y, xWidth+2, yHeight+2);
    }
  }
}

// average code based on http://stackoverflow.com/a/12408627/41153
// this is likely to fail if xLoc,yLoc is with pixSize of width,height
// but works for what I'm currently doing....
color getColor(int xLoc, int yLoc, int pixSize) {
  if (yLoc < 0) { yLoc = 0 }
  if (xLoc < 0) { xLoc = 0 }
  float r = 0, b = 0, g = 0;
  int pixelCount = 0;

  for (int y = yLoc; y < yLoc + pixSize; y++) {
    for (int x = xLoc; x < xLoc + pixSize; x++) {
      // trap for out-of bounds "averages"
      // which skew towards black
      if (x < width && y < height) {
        color c = img.get(floor(x), floor(y));
        r += red(c);
        g += green(c);
        b += blue(c);
        pixelCount++;
      }
    }
  }

  color averageColor = color(r/pixelCount, g/pixelCount, b/pixelCount);
  return averageColor;
}
