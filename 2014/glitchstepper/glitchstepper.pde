// sequential databending
// modifed the bytes of an images, saves it, reloads
// adapted from http://chipmusic.org/forums/topic/772/databending-in-processing/

PImage img;  // Declare variable "a" of type PImage
boolean paused = true;
boolean singleStep = false;
int step = 0;

void setup() {
  
  background(0);
  byte[] data = loadBytes("picture.jpg");
  img = loadImage("picture.jpg");
  saveBytes("picturee.jpg", data);
  //  size(img.width, img.height, P2D);
  size(img.width, img.height);
  image(img, 0, 0);
  
}

void draw() {

  if (!paused || singleStep) {
    glitchout();

    if (singleStep) singleStep = false;
  }
}

void glitchout() {
  
  byte[] data = loadBytes("picturee.jpg");
  
  for (int i = 0 ; i < 4; i++) // 4 changes
  {
    int loc = (int)random(128, data.length); //guess at header being 128 bytes at most..
    data[loc] = (byte)random(255);
  }
  
  saveBytes("picturee.jpg", data);
  img = loadImage("picturee.jpg");
  
  // TODO: unique folder and padded name
  save("picture." + step + ".jpg");
  step++;
  
  image(img, 0, 0);
  
}

void keyPressed() {

  if (key == ' ') paused = !paused; 

  if (key == CODED) {

    if (paused) {
      if (keyCode == RIGHT || keyCode == LEFT) singleStep = true;
    }
  }
}

