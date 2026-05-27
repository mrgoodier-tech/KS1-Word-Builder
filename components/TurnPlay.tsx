import React, { useState, useEffect, useRef } from 'react';
import { WordConfig, TurnPhase } from '../types';
import { Button } from './Button';
import { CheckCircle2, Delete, Keyboard } from 'lucide-react';

interface TurnPlayProps {
  config: WordConfig;
  onTurnComplete: (success: boolean) => void;
  isSoundEnabled: boolean;
}

export const TurnPlay: React.FC<TurnPlayProps> = ({ config, onTurnComplete, isSoundEnabled }) => {
  const [phase, setPhase] = useState<TurnPhase>(TurnPhase.MISSING_LETTER);
  const [typedInput, setTypedInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isWrongSelection, setIsWrongSelection] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Load and select the best available voice
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      // Strictly prioritize UK English (en-GB) voices
      const voice = 
        voices.find(v => v.lang === 'en-GB' && v.name.includes('Google')) ||
        voices.find(v => v.lang === 'en-GB') ||
        voices.find(v => v.lang.replace('_', '-').startsWith('en-GB')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];

      setPreferredVoice(voice);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Reset state when config changes (new word)
  useEffect(() => {
    setPhase(TurnPhase.MISSING_LETTER);
    setTypedInput('');
    setSelectedOption(null);
    setIsWrongSelection(false);
    setFeedbackMessage('');
  }, [config]);

  // Focus input when entering typing phase
  useEffect(() => {
    if (phase === TurnPhase.TYPING && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  const speakWord = (text: string) => {
    if (!isSoundEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.lang = 'en-GB'; 
    utterance.rate = 0.85; // Natural but clear pace
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const spellAndSpeak = (word: string, onComplete?: () => void) => {
    if (!isSoundEnabled || !('speechSynthesis' in window)) {
      onComplete?.();
      return;
    }

    window.speechSynthesis.cancel();
    const letters = word.split('');
    let currentIdx = 0;

    const speakNextLetter = () => {
      if (currentIdx < letters.length) {
        const char = letters[currentIdx];
        const letterUtterance = new SpeechSynthesisUtterance(char);
        if (preferredVoice) letterUtterance.voice = preferredVoice;
        
        // Slightly slower for letters to ensure distinct separation
        letterUtterance.rate = 0.75; 
        letterUtterance.pitch = 1.0;
        
        letterUtterance.onend = () => {
          currentIdx++;
          // Small delay before next letter sounds more natural than immediate sequence
          setTimeout(speakNextLetter, 120); 
        };
        
        window.speechSynthesis.speak(letterUtterance);
      } else {
        // Pause before confirming the full word
        setTimeout(() => {
          const wordUtterance = new SpeechSynthesisUtterance(word);
          if (preferredVoice) wordUtterance.voice = preferredVoice;
          wordUtterance.rate = 0.9;
          wordUtterance.pitch = 1.05; // Slightly higher pitch for the "success" word
          wordUtterance.onend = () => {
            onComplete?.();
          };
          window.speechSynthesis.speak(wordUtterance);
        }, 350);
      }
    };

    speakNextLetter();
  };

  const handleOptionClick = (char: string) => {
    if (char === config.missingChar) {
      // Correct!
      speakWord(config.fullWord);
      setSelectedOption(char);
      setFeedbackMessage('Great job!');
      setTimeout(() => {
        setPhase(TurnPhase.TYPING);
        setFeedbackMessage('Now type the word!');
      }, 1000);
    } else {
      // Incorrect
      setIsWrongSelection(true);
      setFeedbackMessage('Try again!');
      setTimeout(() => setIsWrongSelection(false), 500);
    }
  };

  const handleTypingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedInput.trim().toLowerCase() === config.fullWord.toLowerCase()) {
      setPhase(TurnPhase.SUCCESS);
      setFeedbackMessage('Perfect!');
      
      // Spell it out then move to next word
      spellAndSpeak(config.fullWord, () => {
        setTimeout(() => {
          onTurnComplete(true);
        }, 500);
      });
    } else {
      setFeedbackMessage('Look carefully and try again.');
      setTypedInput('');
    }
  };

  // Render the word with the missing letter (underscore or the chosen letter)
  const renderWord = () => {
    const parts = config.fullWord.split('');
    return (
      <div className="flex justify-center items-end gap-1 md:gap-2 mb-8 flex-wrap" aria-label="Word to solve">
        {parts.map((char, idx) => {
          const isMissing = idx === config.missingIndex;
          
          if (isMissing) {
            // If we are in selection phase, show underscore or selected letter.
            // In typing/success phase, show the full correct letter.
            const displayChar = phase === TurnPhase.MISSING_LETTER 
              ? (selectedOption || '_') 
              : config.missingChar;
              
            return (
              <span 
                key={idx} 
                className={`
                  border-b-4 
                  ${phase === TurnPhase.MISSING_LETTER ? 'border-dashed border-blue-500 text-blue-600' : 'border-transparent text-green-600'}
                  text-5xl md:text-7xl font-bold w-12 md:w-16 text-center pb-2 transition-colors duration-300
                `}
              >
                {displayChar}
              </span>
            );
          }
          return (
            <span key={idx} className="text-5xl md:text-7xl font-bold text-slate-700 pb-2 w-8 md:w-12 text-center">
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      
      {/* Feedback Banner */}
      <div className={`h-12 flex items-center justify-center text-xl font-bold mb-4 transition-all duration-300 ${isWrongSelection ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
        {feedbackMessage}
      </div>

      {/* The Main Word Display */}
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full flex flex-col items-center mb-8 border-4 border-slate-100">
        {renderWord()}
      </div>

      {/* Phase 1: Letter Selection */}
      {phase === TurnPhase.MISSING_LETTER && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {config.options.map((char, idx) => (
            <button
              key={`${char}-${idx}`}
              onClick={() => handleOptionClick(char)}
              className={`
                bg-white border-4 border-b-8 border-purple-200 hover:border-purple-300 hover:bg-purple-50
                text-4xl font-bold py-6 rounded-2xl shadow-sm transition-all
                active:scale-95 active:border-b-4 text-purple-600
                ${isWrongSelection ? 'animate-bounce' : ''}
              `}
              aria-label={`Select letter ${char}`}
            >
              {char}
            </button>
          ))}
        </div>
      )}

      {/* Phase 2: Typing */}
      {phase === TurnPhase.TYPING && (
        <form onSubmit={handleTypingSubmit} className="w-full flex flex-col gap-4 animate-pop">
           <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              className="w-full text-center text-4xl p-6 rounded-2xl border-4 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none text-slate-700 placeholder-slate-300"
              placeholder="Type here..."
              autoComplete="off"
              spellCheck="false"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Keyboard size={32} />
            </div>
           </div>
           
           <Button type="submit" variant="success" fullWidth disabled={typedInput.length === 0}>
             Check Word <CheckCircle2 className="inline ml-2" />
           </Button>
        </form>
      )}

      {/* Phase 3: Success Animation / Transition (Handled mostly by parent delay but visual here) */}
      {phase === TurnPhase.SUCCESS && (
        <div className="text-green-500 text-center animate-bounce">
           <CheckCircle2 size={80} className="mx-auto mb-4" />
           <p className="text-3xl font-bold">Correct!</p>
        </div>
      )}
    </div>
  );
};