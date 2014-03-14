
class TextManager {

  String w = "";
  String defaultText = "These are the pearls that were his eyes";
  String randomText = defaultText + "...........---___*****xxx                                            "; 
  String SPLIT_TOKENS = " ?.,;:[]<>()\"";
  String words[];
  int charIndex = 0;
  int wordIndex = 0;
  
  TextManager() {
    w = defaultText;
    words = splitTokens(w,SPLIT_TOKENS);
  }
  
  TextManager(String wInput) {
    w = wInput;
    words = splitTokens(w, SPLIT_TOKENS);     
  }
  
  // getChar and getWord indexes are not yoked together
  char getChar() {
    char c = w.charAt(charIndex);
    charIndex = (charIndex + 1) % w.length();
    return c;
  }
  
  char getCharRandom() {
    char c = randomText.charAt((int)random(randomText.length()))  ;
    return c; 
  }
  
  String getWord() {
    String word = words[wordIndex];
    wordIndex = (wordIndex + 1) % words.length;
    return word; 
  }
  
  String getText() {
    return w; 
  }

}
