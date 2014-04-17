// http://processing.org/examples/simpleparticlesystem.html
// see also: http://natureofcode.com/book/chapter-4-particle-systems/

/* TODO:
 * use a markov engine for text.
 * color (instead of black & white)
 ** how to assign? average of letters?
 * different velocities? 
 */

ParticleSystem ps;
TextManager tm;
int colorMax = 94; // TODO better lexical name

void setup() {
  size(640, 360);
  colorMode(HSB, 94); // ascii 32..126
  //String arielsong = "Come unto these yellow sands, And then take hands: Curtsied when you have, and kiss'd The wild waves whist, Foot it featly here and there; And, sweet sprites, the burthen bear. Hark, hark! Bow-wow. The watch-dogs bark. Bow-wow. Hark, hark! I hear The strain of strutting chanticleer Cry, Cock-a-diddle-dow.  Full fathom five thy father lies; Of his bones are coral made; Those are pearls that were his eyes: Nothing of him that doth fade, But doth suffer a sea-change Into something rich and strange. Sea-nymphs hourly ring his knell: Ding-dong. Hark! now I hear them—Ding-dong, bell.";
  String arielsong = "Come unto these yellow sands, And then take hands: Curtsied when you have, and kiss'd The wild waves whist, Foot it featly here and there; And, sweet sprites, the burthen bear. Hark, hark! Bow-wow. The watch-dogs bark. Bow-wow. Hark, hark! I hear The strain of strutting chanticleer Cry, Cock-a-diddle-dow.  Full fathom five thy father lies; Of his bones are coral made; Those are pearls that were his eyes: Nothing of him that doth fade, But doth suffer a sea-change Into something rich and strange. Sea-nymphs hourly ring his knell: Ding-dong. Hark! now I hear them—Ding-dong, bell. ! \" # $ % & ' ( ) * + , - . / 0 1 2 3 4 5 6 7 8 9 : ; < = > ? @ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [ \\ ] ^ _ ` a b c d e f g h i j k l m n o p q r s t u v w x y z { | } ~ ! \" # $ % & ' ( ) * + , - . / 0 1 2 3 4 5 6 7 8 9 : ; < = > ? @ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [ \\ ] ^ _ ` a b c d e f g h i j k l m n o p q r s t u v w x y z { | } ~";
  tm = new TextManager(arielsong);
  ps = new ParticleSystem(new PVector(width/2, 150));
}

void draw() {
  background(0);
  ps.addParticle();
  ps.run();
}





// A simple Particle class

class Particle {
  PVector location;
  PVector velocity;
  PVector acceleration;
  float lifespan;
  String lex;
  int tint;

  Particle(PVector l) {
    acceleration = new PVector(0, 0.05);
    velocity = new PVector(random(-2, 2), random(-5, 0));
    location = l.get();
    lifespan = 255;
    lex = tm.getWord();
   
    // TODO: build this into TextManager
    //    int avg = lexAverage(lex);
    int avg = int(lex.charAt(0));
    tint = avg - 32; // 32..126 (unless things get weird)
  }

  // this is annoyingly biased
  // I need a bell-curve to convert this visually, not a straight map
  // TODO: cache the value in a map, so we don't calculate words more than once
  // alt method: byte[] bytes = s.getBytes("US-ASCII");
  int lexAverage(String lex) {
    int avg = 0;

    for (int i = 0; i < lex.length(); i++) {
      avg += (int)lex.charAt(i);
    }

    avg = (avg/lex.length());

    return avg;
  }

  void run() {
    update();
    display();
  }

  // Method to update location
  void update() {
    velocity.add(acceleration);
    location.add(velocity);
    lifespan -= 1.0;
  }

  // Method to display
  void display() {
    int lifemap = (int)map(lifespan, 0, 255, 0, colorMax);
    fill(tint, lifemap, lifemap);    
    text(lex, location.x, location.y);
  }

  // Is the particle still useful?
  boolean isDead() {
    if (lifespan < 0.0) {
      return true;
    } 
    else {
      return false;
    }
  }
}




// A class to describe a group of Particles
// An ArrayList is used to manage the list of Particles 

class ParticleSystem {
  ArrayList<Particle> particles;
  PVector origin;

  ParticleSystem(PVector location) {
    origin = location.get();
    particles = new ArrayList<Particle>();
  }

  void addParticle() {
    particles.add(new Particle(origin));
  }

  void run() {
    for (int i = particles.size()-1; i >= 0; i--) {
      Particle p = particles.get(i);
      p.run();
      if (p.isDead()) {
        particles.remove(i);
      }
    }
  }
}

