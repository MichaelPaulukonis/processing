// sequential databending
// modifed the bytes of an images, saves it, reloads
// adapted from http://chipmusic.org/forums/topic/772/databending-in-processing/

PImage img;  // Declare variable "a" of type PImage
boolean paused = true;
boolean singleStep = false;
int step = 0;
String dir = getSessionDirectory();

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

  if (false) {
    for (int i = 0 ; i < 4; i++) // 4 changes
    {
      // 256 lasts longer, but avoids the first frame. blarg.
      int loc = (int)random(128, data.length); //guess at header being 128 bytes at most..
      byte newval = (byte)random(255);
      println(step + " : " + loc + " : " + data[loc] + ":=" + newval);    
      data[loc] = newval;
    }
  }
  
  int loc1 = (int)random(1000, data.length); //guess at header being 128 bytes at most..
  int loc2 = (int)random(1000, data.length); //guess at header being 128 bytes at most..

  byte val1 = data[loc1];
  byte val2 = data[loc2];

  for (int i = 128; i < data.length; i++) {
    if (data[i] == val1) {
      data[i] = val2;
    } 
    else if (data[i] == val2) {
      data[i] = val1;
    }
  }


  saveBytes("picturee.jpg", data);
  img = loadImage("picturee.jpg");

  // TODO: unique folder and padded name
  save(dir + "/picture." + step + ".jpg");
  step++;

  image(img, 0, 0);
}

String getSessionDirectory() {

  String path = sketchPath("");
  String dirName = path + timestamp();
  File dir = new File(dirName);
  dir.mkdirs();

  return dirName;
}


// http://amnonp5.wordpress.com/2012/01/28/25-life-saving-tips-for-processing/
String timestamp() {
  String timestamp = year() + nf(month(), 2) + nf(day(), 2) + "-"  + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
  return timestamp;
}


void keyPressed() {

  if (key == ' ') paused = !paused; 

  if (key == CODED) {

    if (paused) {
      if (keyCode == RIGHT || keyCode == LEFT) singleStep = true;
    }
  }
}

