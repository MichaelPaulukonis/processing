// http://www.processing.org/tutorials/pixels/

PImage img;
int offset = 0;
boolean horizontal = true;
boolean paused = false;
boolean singleStep = false;
String images[] = { 
  "picasso.gogs.jpg", "pablo.gogs.dream.jpg", "keyboard.banana.jpg"
};
int imgIndex = 0;

void setup() {

  changeImage(imgIndex);
  
}

void changeImage(int index) {

  img = loadImage(images[index]);
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
  if (offset < 0) offset = width - 1;

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      int loc = x + y*width;
      pixels[loc] =  img.pixels[offset + y*width];
    }
  }

  offset++;
}

// when moving "backwards" we can throw an error
//  when offset = -1
void horizontalSlice() {
  if (offset >= height) offset = 0;
  if (offset < 0) offset = height - 1;

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

    if (keyCode == UP) {
      imgIndex = (++imgIndex % images.length);
      changeImage(imgIndex);
    }

    if (paused) {
      if (keyCode == RIGHT || keyCode == LEFT) singleStep = true; 
      if (keyCode == LEFT) {
        offset = offset - 2;
      }
    }
  }
}

