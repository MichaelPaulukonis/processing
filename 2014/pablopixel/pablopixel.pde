// originally based on some code from
// http://www.jeffreythompson.org/blog/2012/02/18/pixelate-and-posterize-in-processing/
// amongst other sources I looked at

PImage img;
int pixStep = 5;
int pixSize = 5;
int maxSteps = 12;
int stepCount = 1;
int curSecond;
int autoDirection = 1; // direction of expansion

/* @pjs preload="pablo.gogs.dream.jpg"; */

void setup()
{
  size(447, 600); // for processing.js MUST be first line
  noStroke();

  img = loadImage("pablo.gogs.dream.jpg");
  //size(img.width, img.height);

  //pixStep = int(width/40); // auto-reverse after 20 steps

  pixelateImage(pixSize);    // argument is resulting pixel size
  curSecond = second();
}

void draw()
{
  if (second() != curSecond) {
    setPixSize(autoDirection);
    pixelateImage(pixSize);
    stepCount += autoDirection;
    if (stepCount >= maxSteps || stepCount <= 0) {
      autoDirection = -(autoDirection);
    }
    curSecond = second();
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
  pixSize = (pixSize + (direction * pixStep));
  if (pixSize < pixStep) pixSize = pixStep;
  if (pixSize > width) {
    autoDirection = -(autoDirection);
  }
}

