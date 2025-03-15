// Simple mapping of English text to phonemes with approximate durations

const vowels = ['a', 'e', 'i', 'o', 'u'];
const consonantMapping = {
  'b': 'B', 'm': 'M', 'p': 'P',
  'c': 'C', 'd': 'D', 'g': 'G', 'k': 'K', 'n': 'N', 's': 'S', 't': 'T', 'x': 'X', 'y': 'Y', 'z': 'Z',
  'f': 'F', 'v': 'V',
  'l': 'L',
  'o': 'O',
  'q': 'Q', 'w': 'W',
  'r': 'R',
  'th': 'TH'
};

// Maps text to a sequence of phonemes with durations
export const mapTextToPhonemes = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const phonemeSequence = [];
  
  // Average duration for each phoneme in milliseconds
  const averagePhonemeTime = 80;
  
  // Process each word
  words.forEach(word => {
    let i = 0;
    
    while (i < word.length) {
      let phoneme = 'rest';
      let duration = averagePhonemeTime;
      
      // Check for digraphs first
      if (i < word.length - 1 && word.substring(i, i + 2) === 'th') {
        phoneme = 'TH';
        i += 2;
      } else {
        const char = word[i];
        
        // Check for vowels
        if (vowels.includes(char)) {
          if (char === 'a' || char === 'e') {
            phoneme = 'A';
          } else if (char === 'i') {
            phoneme = 'E';
          } else if (char === 'o') {
            phoneme = 'O';
          } else if (char === 'u') {
            phoneme = 'W';
          }
        } 
        // Check for consonants
        else if (consonantMapping[char]) {
          phoneme = consonantMapping[char];
        }
        
        i++;
      }
      
      // Add to sequence
      phonemeSequence.push({ phoneme, duration });
    }
    
    // Add a rest phoneme between words
    phonemeSequence.push({ phoneme: 'rest', duration: averagePhonemeTime * 0.5 });
  });
  
  return phonemeSequence;
};

// Function to estimate duration of each word
export const estimateWordDuration = (word) => {
  // Very simple estimation - approximately 200ms per syllable
  const syllableCount = countSyllables(word);
  return syllableCount * 200;
};

// Simple syllable counting function
const countSyllables = (word) => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  // Count vowel groups
  let count = 0;
  let isVowelGroup = false;
  
  for (let i = 0; i < word.length; i++) {
    if (vowels.includes(word[i])) {
      if (!isVowelGroup) {
        count++;
        isVowelGroup = true;
      }
    } else {
      isVowelGroup = false;
    }
  }
  
  // Handle some edge cases
  if (word.endsWith('e')) count--;
  if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) count++;
  
  return count > 0 ? count : 1;
};
