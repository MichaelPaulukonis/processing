// http://www.processing.org/tutorials/pixels/

PImage img;
int offset = 0;
boolean horizontal = true;
boolean paused = false;
boolean singleStep = false;

void setup() {
  //  img = loadImage("picasso.gogs.jpg");
  //img = loadImage("pablo.gogs.dream.jpg");
  img = loadImage("keyboard.banana.jpg");
  size(img.width, img.height);
}

void draw() {
  if (!paused || singleStep) {
    loadPixels(); 
    // Since we are going to access the image's pixels too  
    img.loadPixels();
    int y = 0;
    int x = 0;

    if (horizontal) {
      horizontalSlice();
    } 
    else {
      verticalSlice();
    }

    updatePixels();

    if (singleStep) singleStep = false;
  }
}

void verticalSlice() {
  if (offset >= width) offset = 0;

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      int loc = x + y*width;
      pixels[loc] =  img.pixels[offset + y*width];
    }
  }

  offset++;
}

void horizontalSlice() {
  if (offset >= height) offset = 0;

  for (int x = 0; x < width; x++) {
    for (int y = 0; y < height; y++) {
      int loc = x + y * width;
      pixels[loc] = img.pixels[x + offset * width];
    }
  }

  offset++;
}


void mouseClicked() {
  horizontal = !horizontal;
}

void keyPressed() {

  if (key == ' ') paused = !paused; 

  if (key == CODED) {
    if (paused) {
      if (keyCode == RIGHT || keyCode == LEFT) singleStep = true; 
      if (keyCode == LEFT) {
        offset = offset - 2;
      }
    }
  }
}

