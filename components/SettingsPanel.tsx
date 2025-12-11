import React from 'react';
import { ContentType, Difficulty, AppState } from '../types';

interface SettingsPanelProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
  onGenerate: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ state, onUpdate, onGenerate }) => {
  
  const handleTypeSelect = (type: ContentType) => {
    onUpdate({ contentType: type });
  };

  const getDifficultyLabel = (d: Difficulty) => {
    switch(d) {
      case Difficulty.VERY_EASY: return 'Very Easy (Lv 1)';
      case Difficulty.EASY: return 'Easy (Lv 2)';
      case Difficulty.NORMAL: return 'Normal (Lv 3)';
      case Difficulty.HARD: return 'Hard (Lv 4)';
      case Difficulty.VERY_HARD: return 'Very Hard (Lv 5)';
      default: return '';
    }
  };

  const getDifficultyDescription = (type: ContentType, level: Difficulty) => {
    if (type === ContentType.COLORING) {
      switch(level) {
        case Difficulty.VERY_EASY: return "Extra thick lines, 2-4 large areas. Best for toddlers.";
        case Difficulty.EASY: return "Thick lines, 4-6 areas. Simple shapes.";
        case Difficulty.NORMAL: return "Medium lines, 6-10 areas. Standard complexity.";
        case Difficulty.HARD: return "Thinner lines, 12-14 areas. More detail.";
        case Difficulty.VERY_HARD: return "Thin lines, 14-16 areas. High detail, no complex patterns.";
      }
    } else if (type === ContentType.MATH) {
      switch(level) {
        case Difficulty.VERY_EASY: return "Addition only (1-digit). No carrying.";
        case Difficulty.EASY: return "Add/Sub (1-2 digits). Minimal carrying.";
        case Difficulty.NORMAL: return "Add/Sub/Mult (1-2 digits).";
        case Difficulty.HARD: return "Four operations (2-3 digits). Challenging.";
        case Difficulty.VERY_HARD: return "Complex four operations (3 digits).";
      }
    } else if (type === ContentType.SUDOKU) {
      switch(level) {
        case Difficulty.VERY_EASY: return "Very simple. ~45 hints provided.";
        case Difficulty.EASY: return "Simple. ~38 hints provided.";
        case Difficulty.NORMAL: return "Standard. ~32 hints provided.";
        case Difficulty.HARD: return "Hard. ~26 hints provided.";
        case Difficulty.VERY_HARD: return "Expert. ~21 hints provided.";
      }
    }
    return "";
  };

  const getDifficultyColorStyles = (level: Difficulty) => {
    switch(level) {
      case Difficulty.VERY_EASY: return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case Difficulty.EASY: return "bg-teal-50 text-teal-800 border-teal-200";
      case Difficulty.NORMAL: return "bg-blue-50 text-blue-800 border-blue-200";
      case Difficulty.HARD: return "bg-orange-50 text-orange-800 border-orange-200";
      case Difficulty.VERY_HARD: return "bg-rose-50 text-rose-800 border-rose-200";
      default: return "bg-slate-50 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="w-full lg:w-96 bg-white p-6 shadow-xl lg:h-screen lg:fixed lg:left-0 top-0 overflow-y-auto z-10 no-print">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">GenRec</h1>
        <p className="text-slate-500 text-sm">Universal Recreation Generator</p>
      </header>

      {/* Content Type Selection */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Content Type</h2>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => handleTypeSelect(ContentType.COLORING)}
            className={`p-4 rounded-xl text-left border-2 transition-all ${
              state.contentType === ContentType.COLORING 
                ? 'border-rose-400 bg-rose-50 text-rose-900' 
                : 'border-slate-100 hover:border-rose-200 text-slate-600'
            }`}
          >
            <div className="font-bold text-lg">🎨 Coloring Pages</div>
            <div className="text-xs opacity-70">AI-generated line art</div>
          </button>
          
          <button
            onClick={() => handleTypeSelect(ContentType.SUDOKU)}
            className={`p-4 rounded-xl text-left border-2 transition-all ${
              state.contentType === ContentType.SUDOKU
                ? 'border-sky-400 bg-sky-50 text-sky-900' 
                : 'border-slate-100 hover:border-sky-200 text-slate-600'
            }`}
          >
            <div className="font-bold text-lg">🧩 Sudoku</div>
            <div className="text-xs opacity-70">Logic puzzles</div>
          </button>

          <button
            onClick={() => handleTypeSelect(ContentType.MATH)}
            className={`p-4 rounded-xl text-left border-2 transition-all ${
              state.contentType === ContentType.MATH 
                ? 'border-emerald-400 bg-emerald-50 text-emerald-900' 
                : 'border-slate-100 hover:border-emerald-200 text-slate-600'
            }`}
          >
            <div className="font-bold text-lg">🔢 Math Problems</div>
            <div className="text-xs opacity-70">Arithmetic worksheets</div>
          </button>
        </div>
      </section>

      {/* Theme Input (Only for Coloring) */}
      {state.contentType === ContentType.COLORING && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Theme</h2>
          <input
            type="text"
            value={state.theme}
            onChange={(e) => onUpdate({ theme: e.target.value })}
            placeholder="e.g. Cute animals, Spring flowers..."
            className="w-full p-4 text-lg rounded-xl border-2 border-rose-200 bg-rose-50 text-slate-800 placeholder-rose-300 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 outline-none transition-all font-semibold"
          />
        </section>
      )}

      {/* Difficulty Slider */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Difficulty</h2>
        
        {/* Dynamic Info Card */}
        <div className={`p-4 rounded-xl border-2 mb-4 transition-all duration-300 ${getDifficultyColorStyles(state.difficulty)}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-lg">{getDifficultyLabel(state.difficulty)}</span>
            <span className="text-2xl font-bold opacity-20">{state.difficulty}</span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            {getDifficultyDescription(state.contentType, state.difficulty)}
          </p>
        </div>

        <div className="px-2">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={state.difficulty}
            onChange={(e) => onUpdate({ difficulty: Number(e.target.value) as Difficulty })}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">
            <span>Easy</span>
            <span className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div 
                  key={i} 
                  className={`w-1 h-1 rounded-full ${i <= state.difficulty ? 'bg-indigo-500' : 'bg-slate-200'}`} 
                />
              ))}
            </span>
            <span>Hard</span>
          </div>
        </div>
      </section>

      {/* Options */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Options</h2>
        <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
          <input 
            type="checkbox"
            checked={state.includeAnswers}
            onChange={(e) => onUpdate({ includeAnswers: e.target.checked })}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
          />
          <span className="text-slate-700 font-semibold">Include Answer Keys</span>
        </label>
        <p className="text-xs text-slate-400 mt-2 px-1">
          {state.contentType === ContentType.COLORING 
            ? "Generates a colored example for each page (takes longer)."
            : "Appends solved puzzles or calculation answers to the output."}
        </p>
      </section>

      {/* Page Count */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity</h2>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onUpdate({ pageCount: Math.max(1, state.pageCount - 1) })}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
          >-</button>
          <span className="text-xl font-bold text-slate-800 w-8 text-center">{state.pageCount}</span>
          <button 
            onClick={() => onUpdate({ pageCount: Math.min(5, state.pageCount + 1) })}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
          >+</button>
          <span className="text-sm text-slate-500 ml-2">Pages</span>
        </div>
      </section>

      {/* Action Button */}
      <button
        onClick={onGenerate}
        disabled={state.isGenerating || !process.env.API_KEY}
        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transform active:scale-95 transition-all
          ${state.isGenerating ? 'bg-slate-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'}
        `}
      >
        {state.isGenerating ? 'Generating...' : '✨ Generate Materials'}
      </button>

      {!process.env.API_KEY && (
        <p className="text-xs text-red-500 mt-2 text-center">
          API Key missing in environment
        </p>
      )}
    </div>
  );
};

export default SettingsPanel;