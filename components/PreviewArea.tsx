import React from 'react';
import { AppState, ContentType, MathProblem, SudokuBoard, GeneratedPage, PageData } from '../types';

interface PreviewAreaProps {
  state: AppState;
}

const PageHeader = ({ title = "", type = "Problem" }: { title?: string, type?: string }) => (
  <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-8">
    <div className="text-xl font-bold text-slate-400">GenRec {type && `• ${type}`}</div>
    {type !== "Answer Key" && (
      <div className="flex space-x-12">
        <div className="flex flex-col">
          <span className="text-sm text-slate-400 uppercase">Name</span>
          <div className="w-48 border-b border-slate-800 h-8"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-slate-400 uppercase">Date</span>
          <div className="w-32 border-b border-slate-800 h-8"></div>
        </div>
      </div>
    )}
  </div>
);

const PreviewArea: React.FC<PreviewAreaProps> = ({ state }) => {
  const { generatedContent, isGenerating } = state;

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen lg:pl-96 bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-600">Creating your materials...</h2>
          <p className="text-slate-400">This may take a few seconds.</p>
        </div>
      </div>
    );
  }

  if (!generatedContent) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen lg:pl-96 bg-slate-50">
        <div className="text-center max-w-md p-8 opacity-50">
          <div className="text-6xl mb-4">🎨 🧩 🔢</div>
          <h2 className="text-2xl font-bold text-slate-400">Ready to Create?</h2>
          <p className="text-slate-400 mt-2">Select your options on the left and click Generate.</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Shared container class for strict A4 printing
  // Using 296mm height to provide a tiny safety buffer against overflow
  const pageContainerClass = "bg-white w-[210mm] h-[296mm] mx-auto p-12 shadow-sm mb-8 overflow-hidden relative page-break print:w-[210mm] print:h-[296mm] print:p-12 print:m-0 print:mb-0 print:shadow-none";

  // Helper to render coloring page
  const renderColoringPage = (imgUrl: string | null, index: number, isAnswer: boolean) => {
    if (!imgUrl) return null;
    
    return (
      <div key={`${isAnswer ? 'ans' : 'prob'}-${index}`} className={pageContainerClass}>
        <PageHeader type={isAnswer ? "Answer Key" : undefined} />
        <div className="flex flex-col items-center justify-center h-[80%] border-2 border-dashed border-slate-200 rounded-xl overflow-hidden p-4">
           <img src={imgUrl} alt={isAnswer ? "Answer Key" : "Coloring Page"} className="max-h-full max-w-full object-contain" />
        </div>
        <div className="text-center mt-4 text-slate-300 text-sm">GenRec Coloring • Lv {state.difficulty} {isAnswer ? '(Answer)' : ''}</div>
      </div>
    );
  };

  // Helper to render math page
  const renderMathPage = (problems: MathProblem[] | null, index: number, isAnswer: boolean) => {
    if (!problems) return null;
    
    return (
      <div key={`${isAnswer ? 'ans' : 'prob'}-${index}`} className={pageContainerClass}>
        <PageHeader type={isAnswer ? "Answer Key" : undefined} />
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-8 uppercase tracking-widest">
          {isAnswer ? "Math Solutions" : "Math Worksheet"}
        </h2>
        <div className="grid grid-cols-2 gap-x-16 gap-y-12">
          {problems.map((problem, i) => (
            <div key={i} className="flex items-center text-3xl font-mono text-slate-700 border-b border-slate-200 pb-2">
              <span className="text-sm text-slate-400 mr-4 w-6">{i + 1}.</span>
              <span className="flex-grow tracking-wider">
                {problem.question} {isAnswer && <span className="text-rose-500 font-bold ml-2">{problem.answer}</span>}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center mt-12 text-slate-300 text-sm">GenRec Math • Lv {state.difficulty} {isAnswer ? '(Answer)' : ''}</div>
      </div>
    );
  };

  // Helper to render sudoku page
  const renderSudokuPage = (board: SudokuBoard | null, index: number, isAnswer: boolean) => {
    if (!board) return null;

    return (
      <div key={`${isAnswer ? 'ans' : 'prob'}-${index}`} className={`${pageContainerClass} flex flex-col`}>
        <PageHeader type={isAnswer ? "Answer Key" : undefined} />
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-8 uppercase tracking-widest">
          {isAnswer ? "Sudoku Solution" : "Sudoku Challenge"}
        </h2>
        
        <div className="flex-grow flex items-center justify-center">
          <div className="border-4 border-slate-800 inline-block">
            {board.map((row, rIdx) => (
              <div key={rIdx} className="flex">
                {row.map((cell, cIdx) => (
                  <div 
                    key={`${rIdx}-${cIdx}`}
                    className={`
                      w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl font-bold
                      border border-slate-300
                      ${cIdx % 3 === 2 && cIdx !== 8 ? 'border-r-4 border-r-slate-800' : ''}
                      ${rIdx % 3 === 2 && rIdx !== 8 ? 'border-b-4 border-b-slate-800' : ''}
                      ${cell ? (isAnswer ? 'text-indigo-600' : 'text-slate-800') : 'text-transparent'}
                    `}
                  >
                    {cell || ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 text-slate-500">
          {!isAnswer && <p>Fill in the grid so that every row, every column, and every 3x3 box contains the digits 1 through 9.</p>}
        </div>
        <div className="text-center mt-4 text-slate-300 text-sm">GenRec Sudoku • Lv {state.difficulty} {isAnswer ? '(Answer)' : ''}</div>
      </div>
    );
  };

  return (
    <div className="lg:pl-96 bg-slate-100 min-h-screen pb-20 print:p-0 print:m-0 print:bg-white print:h-auto">
      {/* Floating Action Button for Print */}
      <div className="fixed bottom-8 right-8 z-50 no-print">
        <button 
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl flex items-center gap-2 font-bold transition-all hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print / Save PDF
        </button>
      </div>

      <div className="p-8 space-y-8 print:p-0 print:space-y-0">
        {/* Render Problems */}
        {generatedContent.pages.map((page, idx) => {
          if (generatedContent.type === ContentType.COLORING) return renderColoringPage(page.problem as string, idx, false);
          if (generatedContent.type === ContentType.MATH) return renderMathPage(page.problem as MathProblem[], idx, false);
          if (generatedContent.type === ContentType.SUDOKU) return renderSudokuPage(page.problem as SudokuBoard, idx, false);
          return null;
        })}

        {/* Separator for Answers (only if enabled) - Hidden in print */}
        {generatedContent.includeAnswers && (
          <div className="flex items-center justify-center py-8 print:hidden">
            <div className="h-px bg-slate-300 w-1/3"></div>
            <span className="mx-4 text-slate-400 font-bold uppercase tracking-widest text-sm">Answer Keys</span>
            <div className="h-px bg-slate-300 w-1/3"></div>
          </div>
        )}

        {/* Render Solutions (only if enabled) */}
        {generatedContent.includeAnswers && generatedContent.pages.map((page, idx) => {
          if (generatedContent.type === ContentType.COLORING) return renderColoringPage(page.solution as string | null, idx, true);
          if (generatedContent.type === ContentType.MATH) return renderMathPage(page.solution as MathProblem[], idx, true);
          if (generatedContent.type === ContentType.SUDOKU) return renderSudokuPage(page.solution as SudokuBoard, idx, true);
          return null;
        })}
      </div>
    </div>
  );
};

export default PreviewArea;