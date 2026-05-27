import { ALPHABET, ALPHABET_UPPER } from '../constants';
import { WordConfig } from '../types';

export const getRandomWord = (availableWords: string[]): string | null => {
  if (availableWords.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  return availableWords[randomIndex];
};

export const generateTurnConfig = (word: string): WordConfig => {
  // Identify valid indices (letters only, skip punctuation if possible, though mostly fine to include)
  // We prefer removing letters over apostrophes/punctuation for difficulty reasons.
  const letterIndices = word.split('').map((char, index) => ({ char, index })).filter(item => /[a-zA-Z]/.test(item.char));
  
  // Fallback if no letters found (unlikely given the list)
  const target = letterIndices.length > 0 
    ? letterIndices[Math.floor(Math.random() * letterIndices.length)]
    : { char: word[0], index: 0 };

  const missingChar = target.char;
  const missingIndex = target.index;
  const isUpperCase = missingChar === missingChar.toUpperCase() && missingChar !== missingChar.toLowerCase();

  // Generate 3 random distractors
  const sourceAlphabet = isUpperCase ? ALPHABET_UPPER : ALPHABET;
  const distractors: string[] = [];
  
  while (distractors.length < 3) {
    const randomChar = sourceAlphabet[Math.floor(Math.random() * sourceAlphabet.length)];
    // Ensure distractor is not the answer and not already selected
    if (randomChar !== missingChar && !distractors.includes(randomChar)) {
      distractors.push(randomChar);
    }
  }

  // Combine and shuffle
  const options = [...distractors, missingChar].sort(() => Math.random() - 0.5);

  return {
    fullWord: word,
    missingIndex,
    missingChar,
    options
  };
};