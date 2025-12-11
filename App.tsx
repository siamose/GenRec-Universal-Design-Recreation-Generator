import React, { useState } from 'react';
import { AppState, ContentType, Difficulty, GeneratedContent, GeneratedPage } from './types';
import SettingsPanel from './components/SettingsPanel';
import PreviewArea from './components/PreviewArea';
import { generateMathProblems, generateColoringPage } from './services/geminiService';
import { generateSudoku } from './services/sudokuEngine';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    contentType: ContentType.COLORING,
    difficulty: Difficulty.NORMAL,
    theme: '',
    pageCount: 1,
    includeAnswers: true,
    isGenerating: false,
    generatedContent: null,
  });

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
      alert("Please configure the API_KEY in the environment.");
      return;
    }

    if (state.contentType === ContentType.COLORING && !state.theme.trim()) {
      alert("Please enter a theme for the coloring page.");
      return;
    }

    updateState({ isGenerating: true });

    try {
      let newPages: GeneratedPage[] = [];

      for (let i = 0; i < state.pageCount; i++) {
        if (state.contentType === ContentType.MATH) {
          // Generate 20 problems per page
          const problems = await generateMathProblems(state.difficulty, 20);
          // For math, problem and solution data is the same (contains question & answer)
          // The rendering component handles the display difference
          newPages.push({ problem: problems, solution: problems });
        } else if (state.contentType === ContentType.COLORING) {
          // Generate 1 image per page (and its colored answer if requested)
          const images = await generateColoringPage(state.theme, state.difficulty, state.includeAnswers);
          newPages.push(images);
        } else if (state.contentType === ContentType.SUDOKU) {
          // Generate 1 board per page
          const boards = generateSudoku(state.difficulty);
          newPages.push(boards);
        }
      }

      const newContent: GeneratedContent = {
        type: state.contentType,
        includeAnswers: state.includeAnswers,
        pages: newPages,
        createdAt: new Date(),
      };

      updateState({ generatedContent: newContent });

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Generation failed. Please try again. " + (error as Error).message);
    } finally {
      updateState({ isGenerating: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <SettingsPanel state={state} onUpdate={updateState} onGenerate={handleGenerate} />
      <div className="flex-grow">
        <PreviewArea state={state} />
      </div>
    </div>
  );
};

export default App;