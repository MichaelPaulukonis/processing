// originally based on some code from
// http://www.jeffreythompson.org/blog/2012/02/18/pixelate-and-posterize-in-processing/
// amongst other sources I looked at

PImage img;
int pixStep = 5;
int pixSize = 5;
int curSecond;
int autoDirection = 1; // direction of expansion

void setup()
{
  noStroke();
  
  img = loadImage("pablo.gogs.dream.jpg");
  size(img.width, img.height);
  pixStep = int(width/20); // auto-reverse after 20 steps

  pixelateImage(pixSize);    // argument is resulting pixel size
  curSecond = second();
}

void draw()
{
  if (second() != curSecond) {
    setPixSize(autoDirection);
    pixelateImage(pixSize);
    curSecond = second();
  }
}


void pixelateImage(int pxSize) {

  // use ratio of height/width...
  float ratio;
  if (width < height) {
    ratio = height/width;
  }
  else {
    ratio = width/height;
  }

  // ... to set pixel height
  int pxH = int(pxSize * ratio);

  noStroke();
  for (int x=0; x<width; x+=pxSize) {
    for (int y=0; y<height; y+=pxH) {
      fill(getColor(x, y));
      rect(x, y, pxSize, pxH);
    }
  }
}

// TODO make it an average
// http://forum.processing.org/one/topic/getting-average-pixel-color-value-from-a-pimage-that-is-constantly-changing.html
// this will also require some sort of offset
int getColor(int x, int y) {
  return img.get(x, y);
}


void setPixSize(int direction) {
  pixSize = (pixSize + (direction * pixStep));
  if (pixSize < pixStep) pixSize = pixStep;
  if (pixSize > width) {
   autoDirection = -(autoDirection); 
  }
}

void mousePressed() {
  setPixSize(1);
  pixelateImage(pixSize);
}

