// text-flocking
// aannnnndddd... now what?
// from http://processingjs.org/learning/topic/flocking/
// All Examples Written by Casey Reas and Ben Fry
// unless otherwise stated
// // from http://processingjs.org/learning/topic/flocking/
// looks for similar colors and flocks together -- could do with letters (or other concept)

Flock flock;

void setup() {
  size(600, 600);

  colorMode(RGB, 255, 255, 255, 100);
  flock = new Flock();
  // Add an initial set of boids into the system
  //  for (int i = 0; i < 150; i++) {
  //    flock.addBoid(new Boid(new Vector3D(width/2, height/2), 2.0f, 0.05f));
  //  }
  bigBang();
  smooth();
}

void draw() {
  background(100);
  flock.run();
}

void reset() {
  flock = new Flock();
  background(100);
}

void bigBang() {
  // Add a set of boids into the system
  for (int i = 0; i < 50; i++) {
    flock.addBoid(new Boid(new Vector3D(width/2, height/2), 2.0f, 0.05f));
  }
}



// Add a new boid into the System
void mousePressed() {
  flock.addBoid(new Boid(new Vector3D(mouseX, mouseY), 2.0f, 0.05f));
}

// how lexically close do Boids have to be to flock?
int affinityDistance = 5;
void setAffinityDistance(int direction) {
  affinityDistance = (affinityDistance + direction);
  if (affinityDistance < 0) affinityDistance = 0;
  println("affinityDistance: " + affinityDistance);
}

void keyPressed() {

  switch(key) {

  case DELETE:
  case BACKSPACE:  
    reset();
    break;


  case 'a':
    setAffinityDistance(1);
    break;
  case 'A':
    setAffinityDistance(-1);
    break;

  case 'b':
  case 'B':
    bigBang();
    break;
  }
}

class Flock {
  ArrayList boids; // An arraylist for all the boids

    Flock() {
    boids = new ArrayList(); // Initialize the arraylist
  }

  void run() {
    for (int i = 0; i < boids.size(); i++) {
      Boid b = (Boid) boids.get(i);  
      b.run(boids);  // Passing the entire list of boids to each boid individually
    }
  }

  void addBoid(Boid b) {
    boids.add(b);
  }
}


class Boid {

  Vector3D loc;
  Vector3D vel;
  Vector3D acc;
  float r;
  float maxforce;    // Maximum steering force
  float maxspeed;    // Maximum speed
  String word;
  String source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  Boid(Vector3D l, float ms, float mf) {
    acc = new Vector3D(0, 0);
    vel = new Vector3D(random(-1, 1), random(-1, 1));
    loc = l.copy();
    r = 2.0f;
    maxspeed = ms;
    maxforce = mf;
    word = randomChar() + "";
  }


  char randomChar() {

    int i = int(random(source.length()));

    char w = source.charAt(i);

    return source.charAt(i);
  }

  // comparison to another word
  // returns 0..10 similarity
  boolean wordCompare(String other) {

    // some sort of distance in the source
    boolean closeEnough = false;

    // the first approximation of affinity - same letter (case insensitive)
    // closeEnough = (word.toUpperCase() == other.toUpperCase());

    // case-insensitive
    int wc = (int)word.toUpperCase().charAt(0);
    int oc = (int)other.toUpperCase().charAt(0);

    closeEnough = (abs(wc - oc) < affinityDistance);


    return closeEnough;
  }

  void run(ArrayList boids) {
    flock(boids);
    update();
    borders();
    render();
  }

  // We accumulate a new acceleration each time based on three rules
  void flock(ArrayList boids) {
    Vector3D sep = separate(boids);   // Separation
    Vector3D ali = align(boids);      // Alignment
    Vector3D coh = cohesion(boids);   // Cohesion
    // Arbitrarily weight these forces
    sep.mult(2.0f);
    ali.mult(1.0f);
    coh.mult(1.0f);
    // Add the force vectors to acceleration
    acc.add(sep);
    acc.add(ali);
    acc.add(coh);
  }

  // Method to update location
  void update() {
    // Update velocity
    vel.add(acc);
    // Limit speed
    vel.limit(maxspeed);
    loc.add(vel);
    // Reset accelertion to 0 each cycle
    acc.setXYZ(0, 0, 0);
  }

  void seek(Vector3D target) {
    acc.add(steer(target, false));
  }

  void arrive(Vector3D target) {
    acc.add(steer(target, true));
  }

  // A method that calculates a steering vector towards a target
  // Takes a second argument, if true, it slows down as it approaches the target
  Vector3D steer(Vector3D target, boolean slowdown) {
    Vector3D steer;  // The steering vector
    Vector3D desired = target.sub(target, loc);  // A vector pointing from the location to the target
    float d = desired.magnitude(); // Distance from the target is the magnitude of the vector
    // If the distance is greater than 0, calc steering (otherwise return zero vector)
    if (d > 0) {
      // Normalize desired
      desired.normalize();
      // Two options for desired vector magnitude (1 -- based on distance, 2 -- maxspeed)
      if ((slowdown) && (d < 100.0f)) desired.mult(maxspeed*(d/100.0f)); // This damping is somewhat arbitrary
      else desired.mult(maxspeed);
      // Steering = Desired minus Velocity
      steer = target.sub(desired, vel);
      steer.limit(maxforce);  // Limit to maximum steering force
    } 
    else {
      steer = new Vector3D(0, 0);
    }
    return steer;
  }

  void render() {
    // Draw a triangle rotated in the direction of velocity
    float theta = vel.heading2D() + radians(90);
    fill(200);
    stroke(255);
    pushMatrix();
    translate(loc.x, loc.y);
    rotate(theta);
    text(word, 0, 0);
    //    beginShape(TRIANGLES);
    //    vertex(0, -r*2);
    //    vertex(-r, r*2);
    //    vertex(r, r*2);
    //    endShape();
    popMatrix();
    //  text("x", loc.x, loc.y);
  }

  // Wraparound
  void borders() {
    if (loc.x < -r) loc.x = width+r;
    if (loc.y < -r) loc.y = height+r;
    if (loc.x > width+r) loc.x = -r;
    if (loc.y > height+r) loc.y = -r;
  }

  // Separation
  // Method checks for nearby boids and steers away
  // TODO: push further away from dissimilar lexical elements
  Vector3D separate (ArrayList boids) {
    float desiredseparation = 25.0f;
    Vector3D sum = new Vector3D(0, 0, 0);
    int count = 0;
    // For every boid in the system, check if it's too close
    for (int i = 0 ; i < boids.size(); i++) {
      Boid other = (Boid) boids.get(i);
      float d = loc.distance(loc, other.loc);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      // adding in lexicalAffinity allows those that are close to overlap
      // looks better (?) without.
      // HOWEVER, this might give rise to a "joining" concept
      // where lexical boids MERGE their logograms
      if ((d > 0) && (d < desiredseparation) ) {
        // Calculate vector pointing away from neighbor
        Vector3D diff = loc.sub(loc, other.loc);
        diff.normalize();
        diff.div(d);        // Weight by distance
        sum.add(diff);
        count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      sum.div((float)count);
    }
    return sum;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  Vector3D align (ArrayList boids) {
    float neighbordist = 50.0f;
    Vector3D sum = new Vector3D(0, 0, 0);
    int count = 0;
    for (int i = 0 ; i < boids.size(); i++) {
      Boid other = (Boid) boids.get(i);
      float d = loc.distance(loc, other.loc);
      // TODO better lexical similarity; not precision  
      if ((d > 0) && (d < neighbordist) && wordCompare(other.word)) {
        sum.add(other.vel);
        count++;
      }
    }
    if (count > 0) {
      sum.div((float)count);
      sum.limit(maxforce);
    }
    return sum;
  }

  // Cohesion
  // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
  // TODO: affinity towards some lexical thing
  Vector3D cohesion (ArrayList boids) {
    float neighbordist = 50.0f;
    Vector3D sum = new Vector3D(0, 0, 0);   // Start with empty vector to accumulate all locations
    int count = 0;
    for (int i = 0 ; i < boids.size(); i++) {
      Boid other = (Boid) boids.get(i);
      float d = loc.distance(loc, other.loc);
      if ((d > 0) && (d < neighbordist) && wordCompare(other.word)) {
        sum.add(other.loc); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div((float)count);
      return steer(sum, false);  // Steer towards the location
    }
    return sum;
  }
}

// Simple Vector3D Class 

static class Vector3D {
  float x;
  float y;
  float z;

  Vector3D(float x_, float y_, float z_) {
    x = x_; 
    y = y_; 
    z = z_;
  }

  Vector3D(float x_, float y_) {
    x = x_; 
    y = y_; 
    z = 0f;
  }

  Vector3D() {
    x = 0f; 
    y = 0f; 
    z = 0f;
  }

  void setX(float x_) {
    x = x_;
  }

  void setY(float y_) {
    y = y_;
  }

  void setZ(float z_) {
    z = z_;
  }

  void setXY(float x_, float y_) {
    x = x_;
    y = y_;
  }

  void setXYZ(float x_, float y_, float z_) {
    x = x_;
    y = y_;
    z = z_;
  }

  void setXYZ(Vector3D v) {
    x = v.x;
    y = v.y;
    z = v.z;
  }

  float magnitude() {
    return (float) Math.sqrt(x*x + y*y + z*z);
  }

  Vector3D copy() {
    return new Vector3D(x, y, z);
  }

  Vector3D copy(Vector3D v) {
    return new Vector3D(v.x, v.y, v.z);
  }

  void add(Vector3D v) {
    x += v.x;
    y += v.y;
    z += v.z;
  }

  void sub(Vector3D v) {
    x -= v.x;
    y -= v.y;
    z -= v.z;
  }

  void mult(float n) {
    x *= n;
    y *= n;
    z *= n;
  }

  void div(float n) {
    x /= n;
    y /= n;
    z /= n;
  }

  void normalize() {
    float m = magnitude();
    if (m > 0) {
      div(m);
    }
  }

  void limit(float max) {
    if (magnitude() > max) {
      normalize();
      mult(max);
    }
  }

  float heading2D() {
    float angle = (float) Math.atan2(-y, x);
    return -1*angle;
  }

  Vector3D add(Vector3D v1, Vector3D v2) {
    Vector3D v = new Vector3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    return v;
  }

  Vector3D sub(Vector3D v1, Vector3D v2) {
    Vector3D v = new Vector3D(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    return v;
  }

  Vector3D div(Vector3D v1, float n) {
    Vector3D v = new Vector3D(v1.x/n, v1.y/n, v1.z/n);
    return v;
  }

  Vector3D mult(Vector3D v1, float n) {
    Vector3D v = new Vector3D(v1.x*n, v1.y*n, v1.z*n);
    return v;
  }

  float distance (Vector3D v1, Vector3D v2) {
    float dx = v1.x - v2.x;
    float dy = v1.y - v2.y;
    float dz = v1.z - v2.z;
    return (float) Math.sqrt(dx*dx + dy*dy + dz*dz);
  }
}

