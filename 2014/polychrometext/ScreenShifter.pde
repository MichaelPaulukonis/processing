// shift pixels in image... somehow
// http://processing.org/reference/PImage_loadPixels_.html
// http://processing.org/discourse/beta/num_1269545825.html
void shift(int verticalOffset, int horizontalOffset) {
  PImage screen = createImage(width, height, RGB);
  PImage temp = createImage(width, height, RGB);
  
  loadPixels();
  screen.pixels = pixels;
 

  int offset = verticalOffset * width + horizontalOffset;
  int totPixels = width * height;
  println("totPixels: " + totPixels + " offset: " + offset);
  for (int i = 0; i < totPixels; i++) {
    int orig = (i + offset) % totPixels;
    if (orig < 0) orig += totPixels; // nope, not quite;
    //println("index: " + i + " orig: " + orig);
    temp.pixels[i] = screen.pixels[orig];
  }

  screen.pixels = temp.pixels;
  screen.updatePixels();
  image(screen, 0, 0);
  
  println("updated!");
  
}
