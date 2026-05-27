import React, { useState, useMemo } from 'react';
import { WORD_LIST } from './constants';
import { GameState, GameSession, WordConfig } from './types';
import { getRandomWord, generateTurnConfig } from './utils/gameHelper';
import { TurnPlay } from './components/TurnPlay';
import { Button } from './components/Button';
import { Play, RotateCcw, Trophy, Star, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [session, setSession] = useState<GameSession>({
    score: 0,
    totalAnswered: 0,
    availableWords: [],
  });
  
  const [currentTurnConfig, setCurrentTurnConfig] = useState<WordConfig | null>(null);

  const toggleSound = () => setIsSoundEnabled(!isSoundEnabled);

  const startGame = () => {
    // Initialize a new session with a shuffled copy of the word list
    const shuffledWords = [...WORD_LIST].sort(() => Math.random() - 0.5);
    const firstWord = getRandomWord(shuffledWords);
    
    // Safety check if list is empty (unlikely)
    if (!firstWord) return;

    // Remove first word from available
    const remaining = shuffledWords.filter(w => w !== firstWord);

    setSession({
      score: 0,
      totalAnswered: 0,
      availableWords: remaining,
    });
    
    setCurrentTurnConfig(generateTurnConfig(firstWord));
    setGameState(GameState.PLAYING);
  };

  const handleTurnComplete = (success: boolean) => {
    // Update score
    const newScore = success ? session.score + 1 : session.score;
    const newTotal = session.totalAnswered + 1;

    // Pick next word
    const nextWord = getRandomWord(session.availableWords);

    if (!nextWord) {
      // Game Over (Ran out of words - unlikely for a single session but good to handle)
      setSession(prev => ({ ...prev, score: newScore, totalAnswered: newTotal }));
      setGameState(GameState.FINISHED);
      return;
    }

    const remaining = session.availableWords.filter(w => w !== nextWord);
    
    setSession({
      score: newScore,
      totalAnswered: newTotal,
      availableWords: remaining,
    });

    setCurrentTurnConfig(generateTurnConfig(nextWord));
  };

  const endGame = () => {
    setGameState(GameState.FINISHED);
  };

  const resetGame = () => {
    setGameState(GameState.START);
  };

  // --- Render Functions ---

  const renderStartScreen = () => (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-lg mx-auto animate-pop">
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleSound} 
          className="p-3 bg-white rounded-full shadow-md text-blue-500 hover:bg-blue-50 transition-colors border-2 border-slate-100"
          aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
        >
          {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      <div className="mb-8 p-6 bg-white rounded-full shadow-xl border-8 border-yellow-300">
         <Star size={80} className="text-yellow-400 fill-yellow-400" />
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold text-blue-600 mb-6 drop-shadow-sm tracking-tight">
        Word Builder
      </h1>
      <p className="text-xl text-slate-600 mb-12 leading-relaxed">
        Can you find the missing letters and spell the words? Let's have some fun!
      </p>
      <Button onClick={startGame} fullWidth className="max-w-xs shadow-blue-200">
        <Play className="inline mr-2" fill="currentColor" /> Start Game
      </Button>
    </div>
  );

  const renderGameScreen = () => (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header / HUD */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" />
            <span className="text-2xl font-bold text-slate-700">{session.score}</span>
          </div>
          
          <div className="w-px h-8 bg-slate-200 mx-1"></div>

          <button 
            onClick={toggleSound} 
            className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-slate-50"
            aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
          >
            {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>

        <button 
          onClick={endGame}
          className="text-slate-400 hover:text-red-500 font-bold text-sm uppercase tracking-wider px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          Finish
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-grow flex flex-col justify-center">
        {currentTurnConfig && (
          <TurnPlay 
            config={currentTurnConfig} 
            onTurnComplete={handleTurnComplete} 
            isSoundEnabled={isSoundEnabled}
          />
        )}
      </div>
    </div>
  );

  const renderEndScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-lg mx-auto">
      <Trophy size={100} className="text-yellow-400 mb-6 drop-shadow-lg" />
      <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
        Awesome Job!
      </h2>
      <div className="bg-white p-8 rounded-3xl shadow-lg border-b-8 border-slate-200 w-full mb-8">
        <p className="text-slate-500 text-lg uppercase tracking-widest font-bold mb-2">Total Score</p>
        <p className="text-6xl font-black text-blue-500">
          {session.score} <span className="text-3xl text-slate-300 font-bold">/ {session.totalAnswered}</span>
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button onClick={startGame} variant="success">
          Play Again
        </Button>
        <Button onClick={resetGame} variant="outline">
          <RotateCcw className="inline mr-2" size={20} /> Back to Home
        </Button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-sky-50 bg-[radial-gradient(#e0f2fe_1px,transparent_1px)] [background-size:20px_20px]">
      {gameState === GameState.START && renderStartScreen()}
      {gameState === GameState.PLAYING && renderGameScreen()}
      {gameState === GameState.FINISHED && renderEndScreen()}
    </main>
  );
}