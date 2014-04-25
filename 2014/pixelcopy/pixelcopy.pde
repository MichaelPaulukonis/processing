// auto-copies of blocks

PImage img;
boolean paused = false;
boolean singleStep = false;
String images[] = { 
  "picasso.gogs.jpg", "pablo.gogs.dream.jpg", "keyboard.banana.jpg"
};
int imgIndex = 0;

void setup() {

  changeImage(imgIndex);
  size(img.width, img.height);
  image(img, 0, 0);
    
}

void changeImage(int index) {

  img = loadImage(images[index]);
  
  //println(images[index] + " : " + img.pixels.length);
  
}

void draw() {

  if (!paused || singleStep) {
    randomCopy();

    if (singleStep) singleStep = false;
  }
}


void randomCopy() {

  int w = (int)random(width/4);
  int h = (int)random(height/4);
  int locx = (int)random(width-w);
  int locy = (int)random(height-h);
  int newx = (int)random(width-w);
  int newy = (int)random(height-h);

  copy(img, locx, locy, w, h, newx, newy, w, h);
  
  // alternate method, basically to prove I could do it
  // NOTE: no size transformations, here.
//  loadPixels();
//
//  for (int x = 0; x < w; x++) {
//    for (int y = 0; y < h; y++) {
//      // x + y * width
//      int backloc = newx + x + ((newy + y) * width);
//      int imgloc = locx + x + ((locy + y) * img.width);
//      
//      if (imgloc >= img.pixels.length) continue;
//      
//      pixels[backloc] = img.pixels[imgloc];
//    }
//  }
//
//  updatePixels();
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
    }
  }
}

class Location {
  int x, y;
  Location (int xpos, int ypos) {
    x = xpos;
    y = ypos;
  }
}

