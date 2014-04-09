// originally based on some code from
// http://www.jeffreythompson.org/blog/2012/02/18/pixelate-and-posterize-in-processing/
// amongst other sources I looked at

// TODO: need the ability to restart after a noLoop
// is that even possible ?!?!?!?

PImage img;
int pixSize = pixel8.initialSize;
int stepCount = 1;
int m;
int autoDirection = 1; // direction of expansion
int revCount = 0;
boolean firstFrame = true;

void setup() {
  size(iwidth, iheight);
  noStroke();

  img = loadImage(uri); // still has a loading time....

  m = millis();

}

void draw() {


  // wait until image is REALLY loaded from URI
  // crude
  if (img.pixels.length <= 10) return;

  // we will loop back-n-forth UNTIL
  // "build-gif" is launched
  // then we will start from ground zero and loop around.

  if (buildmode) {

    noLoop();
    buildGif();

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


void buildGif() {

  int stepsDone = 0;
  int stepsTotal = (pixel8.maxSteps * 2) + 1;

  document.getElementById('progress_bar').className = 'loading';

  startGif();
  stepsDone++;
  updateProgress(stepsDone, stepsTotal);

  // loop around....
  revCount = 0;
  pixSize = pixel8.initialSize;

  while (revCount !== 2) {
    drawPix();
    encoder.addFrame(externals.context);
    stepsDone++;
    updateProgress(stepsDone, stepsTotal);
  }

  // finish it off

  endGif();

  progress.style.width = '100%';
  progress.textContent = '100%';

}

void startGif() {
  // store original as first frame, w/ 1/2 delay
  image(img, 0, 0);

  encoder.setRepeat(0);
  encoder.setDelay(500);
  encoder.start();

  encoder.addFrame(externals.context);
  encoder.setDelay(pixel8.delay);
  console.log('speed: ' + pixel8.delay);

}

void endGif() {

  encoder.finish();
  binary_gif = encoder.stream().getData();
  gif_url = 'data:image/gif;base64,' + encode64(binary_gif);
  gifOut.src = gif_url;

  // neither one of these is needed any more?
  noLoop();

  image(img, 0, 0);
}


// loop purely for manual monitoring
// for export [for, say, a gif], do it faster
void drawPix()
{

  setPixSize(autoDirection);
  pixelateImage(pixSize);
  stepCount += autoDirection;


  // this does not nesc get us back to ZERO
  var curSize = (pixel8.stepSize * pixel8.maxSteps) + pixel8.initialSize;

  // console.log('stepCount: ' + stepCount + ' pixSize: ' + pixSize
  //             + ' revCount: ' + revCount + ' curSize: ' + curSize);

  if (pixSize >= curSize || pixSize <= pixel8.stepSize
      || pixSize >= width || pixSize >= height) {
    if (pixSize >= curSize) pixSize = curSize;
    if (pixSize > width) pixSize = width;
    if (pixSize > height) pixSize = height;
    autoDirection = -(autoDirection);
    revCount++;
    console.log('direction changed, revcount incremented to: ' + revCount);
  }

}

// there's an issue where the right-hand strip comes and goes
// it's an average problem. probably "correct"
// but I don't like how it looks in a sequence
void pixelateImage(int pxSize) {

  for (int x=0; x<width; x+=pxSize) {
    for (int y=0; y<height; y+=pxSize) {
      fill(getColor(x, y));
      rect(x, y, pxSize, pxSize);
    }
  }

}

// average code based on http://stackoverflow.com/a/12408627/41153
// this is likely to fail if xLoc,yLoc is with pixSize of width,height
// but works for what I'm currently doing....
color getColor(int xLoc, int yLoc) {

  float r=0, b=0, g=0;
  int pixelCount=0;

  for (int y = yLoc; y < yLoc + pixSize; y++) {
    for (int x = xLoc; x < xLoc + pixSize; x++) {
      // trap for out-of bounds "averages"
      // which skew towards black
      if (x<width && y < height) {
        color c = img.get(x, y);
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


void setPixSize(int direction) {
  pixSize = (pixSize + (direction * pixel8.stepSize));
  if (pixSize < pixel8.stepSize) pixSize = pixel8.stepSize;
}
