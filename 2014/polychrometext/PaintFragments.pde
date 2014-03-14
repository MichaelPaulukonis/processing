
void paint1() {
  drawGrid(20, 10);
}

void paint2() {
  drawCircle(89, 89);
  drawCircle(50, 50);
  drawCircle(40, 40);
  drawCircle(30, 30);
  drawCircle(100, 100);  
}

void paint3() {
  for (int i = 1; i < width/2; i+= 10) {
    drawCircle(i,i); 
  }
}

void paint4() {
  int origRot = curRot;
  for (int i = width; i > width/2; i-= 20) {
    if (i < ((width/3) * 2)) curRot = 90;
    drawGrid(i,i); 
  }
  curRot = origRot;
}

void paint5() {
  drawGrid(4, 4);
}

void paint6() {
  println("paint6 start");
  for (int i = 1; i < width; i+=5) {
    drawGrid(i, mouseY); 
  }
  println("paint6 end");
  
}
