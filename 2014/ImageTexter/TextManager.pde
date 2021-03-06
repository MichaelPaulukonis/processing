
class TextManager {

  String w = "";
  String defaultText = "Those are the pearls that were his eyes: Nothing of him that doth fade, But doth suffer a sea-change Into something rich and strange.";
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
  
  String getWord() {
    String word = words[wordIndex];
    wordIndex = (wordIndex + 1) % words.length;
    return word; 
  }

}
