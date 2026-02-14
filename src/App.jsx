import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronRight, RefreshCw, GraduationCap, Brain, Trophy, CheckSquare, Square, Trash2, FolderOpen, Loader2 } from 'lucide-react';

// --- DANE DEMONSTRACYJNE (FALLBACK) ---
const DEMO_QUESTIONS = [
  {
    category: "Demo",
    type: "single",
    question: "To jest pytanie demonstracyjne (Tryb Podglądu). Gdzie umieścić pliki JSON?",
    options: [
      { text: "W folderze /src/modules", correct: true },
      { text: "Na pulpicie", correct: false },
      { text: "W folderze node_modules", correct: false },
      { text: "W folderze public", correct: false }
    ],
    explanation: "Aplikacja szuka plików w ścieżce ./modules/*.json względem pliku App.jsx.",
    module: "demo"
  },
  {
    category: "Architektura",
    type: "multi",
    question: "Jakie formaty pytań obsługuje ten quiz? (Wybierz wszystkie)",
    options: [
      { text: "Jednokrotnego wyboru (single)", correct: true },
      { text: "Wielokrotnego wyboru (multi)", correct: true },
      { text: "Otwarte (esej)", correct: false }
    ],
    explanation: "System obsługuje typy 'single' oraz 'multi' zdefiniowane w pliku JSON.",
    module: "demo"
  }
];

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function App() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]); 
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedModules, setLoadedModules] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // --- AUTOMATYCZNE ŁADOWANIE MODUŁÓW I STYLI ---
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }

    const loadModules = async () => {
      setIsLoading(true);
      let gatheredQuestions = [];
      let modulesList = [];
      let useFallback = false;

      try {
        // Vite wymaga, aby import.meta.glob był wywołany statycznie
        // Nie przypisujemy go do zmiennej przed sprawdzeniem, bo Vite musi go sparsować przy budowaniu
        const modules = import.meta.glob('./modules/*.json', { eager: true });
        
        if (Object.keys(modules).length === 0) {
          console.warn("Vite działa, ale import.meta.glob nie znalazł plików w ./modules/*.json");
          useFallback = true;
        } else {
          console.log("Pomyślnie załadowano moduły przez Vite.");
          for (const path in modules) {
            const moduleName = path.split('/').pop().replace('.json', '');
            modulesList.push(moduleName);
            const data = modules[path].default || modules[path];
            
            const questionsWithIds = (Array.isArray(data) ? data : []).map((q, idx) => ({
              ...q,
              id: `${moduleName}::${idx}`, 
              module: moduleName
            }));
            gatheredQuestions = [...gatheredQuestions, ...questionsWithIds];
          }
        }
      } catch (e) {
        // Jeśli rzuci błąd (np. brak obsługi import.meta), przechodzimy do fallback
        console.log("Środowisko nie obsługuje import.meta.glob (Tryb Demo).");
        useFallback = true;
      }

      if (useFallback) {
        setIsDemoMode(true);
        gatheredQuestions = DEMO_QUESTIONS.map((q, idx) => ({
           ...q, id: `demo::${idx}`
        }));
        modulesList = ["tryb_demo"];
      }

      setAllQuestions(gatheredQuestions);
      setLoadedModules(modulesList);
      setIsLoading(false);
    };

    loadModules();
  }, []);

  const resetToMenu = () => {
    setIsFinished(false);
    setSessionQuestions([]);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
  };

  const startSession = (reset = false) => {
    if (reset) {
      if (!window.confirm("Zresetować historię dla załadowanych modułów?")) return;
      localStorage.removeItem('quiz_progress');
    }

    const storedHistory = JSON.parse(localStorage.getItem('quiz_progress') || '[]');
    const availableQuestions = allQuestions.filter(q => !storedHistory.includes(q.id));
    
    if (availableQuestions.length === 0 && allQuestions.length > 0) {
      alert("Wszystkie pytania z tych modułów zostały już zaliczone!");
      setIsFinished(false);
      return;
    }

    const shuffled = shuffleArray(availableQuestions);
    setSessionQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsFinished(false);
    
    if (shuffled.length > 0) {
      prepareQuestion(shuffled[0]);
    }
  };

  const prepareQuestion = (question) => {
    const optionsWithIndex = question.options.map((opt, index) => ({ ...opt, originalIndex: index }));
    setShuffledOptions(shuffleArray(optionsWithIndex));
    setSelectedAnswers([]);
    setIsAnswerChecked(false);
    setIsCorrect(false);
  };

  const handleOptionToggle = (optionIndex) => {
    if (isAnswerChecked) return;
    const question = sessionQuestions[currentQuestionIndex];
    if (question.type === 'multi') {
      if (selectedAnswers.includes(optionIndex)) {
        setSelectedAnswers(selectedAnswers.filter(i => i !== optionIndex));
      } else {
        setSelectedAnswers([...selectedAnswers, optionIndex]);
      }
    } else {
      setSelectedAnswers([optionIndex]);
    }
  };

  const checkAnswer = () => {
    const question = sessionQuestions[currentQuestionIndex];
    const selectedOptionsObjs = selectedAnswers.map(idx => shuffledOptions[idx]);
    const allCorrectSelected = selectedOptionsObjs.every(opt => opt.correct);
    const numberOfCorrectOptions = shuffledOptions.filter(opt => opt.correct).length;
    const correctNumberOfSelections = selectedAnswers.length === numberOfCorrectOptions;

    const isSuccess = allCorrectSelected && correctNumberOfSelections;
    setIsCorrect(isSuccess);
    setIsAnswerChecked(true);

    if (isSuccess) {
      setScore(prev => prev + 1);
      const storedHistory = JSON.parse(localStorage.getItem('quiz_progress') || '[]');
      if (!storedHistory.includes(question.id)) {
        localStorage.setItem('quiz_progress', JSON.stringify([...storedHistory, question.id]));
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      prepareQuestion(sessionQuestions[nextIndex]);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 font-sans">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <p className="text-lg animate-pulse">Ładowanie Twoich modułów...</p>
      </div>
    );
  }

  if (sessionQuestions.length === 0 && !isFinished) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-200">
        <div className="w-full max-w-xl bg-slate-900 rounded-3xl shadow-2xl p-10 border border-slate-800 text-center">
          <div className="bg-indigo-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">System Quizów Lokalnych</h1>
          {isDemoMode ? (
             <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-6 text-sm text-amber-200 text-left flex gap-3 items-start">
               <Brain className="flex-shrink-0 mt-0.5" size={18} />
               <div>
                 <p className="font-bold mb-1">Tryb Demonstracyjny</p>
                 <p className="opacity-80">Aplikacja nie wykryła plików w <code>src/modules</code> lub nie korzystasz z <code>npm run dev</code>. Upewnij się, że pliki .json znajdują się w folderze modules obok App.jsx.</p>
               </div>
             </div>
          ) : (
             <p className="text-slate-400 mb-6 text-lg font-medium">Znaleziono {allQuestions.length} pytań w Twoich modułach.</p>
          )}
          <div className="bg-slate-950/50 p-5 rounded-2xl mb-8 text-left border border-slate-800">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Załadowane zasoby:</p>
            <div className="flex flex-wrap gap-2">
              {loadedModules.map(m => (
                <span key={m} className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700">{m}.json</span>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <button onClick={() => startSession(false)} disabled={allQuestions.length === 0} className="bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
              Rozpocznij Naukę
            </button>
            <button onClick={() => startSession(true)} disabled={allQuestions.length === 0} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-semibold transition-all active:scale-[0.98]">
              <Trash2 size={18} /> Resetuj historię
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const totalCount = sessionQuestions.length;
    const percentage = totalCount > 0 ? Math.round((score / totalCount) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-200">
        <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl p-10 text-center border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Sesja Zakończona</h2>
          <div className="text-7xl font-black text-indigo-400 mb-4 tracking-tighter">{percentage}%</div>
          <p className="text-slate-400 mb-8 text-lg">Twój wynik: <span className="text-white font-bold">{score}</span> / {totalCount}</p>
          <button onClick={resetToMenu} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]">
            Powrót do menu
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = sessionQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-200">
      <div className="w-full max-w-3xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col min-h-[650px] relative overflow-hidden">
        <div className="bg-slate-950/40 p-6 flex justify-between items-center border-b border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/20 p-2.5 rounded-xl">
              <GraduationCap className="text-indigo-400" size={24} /> 
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{currentQuestion.module}</h1>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">{currentQuestion.category}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-black text-indigo-400 leading-none">{currentQuestionIndex + 1}<span className="text-slate-700 text-lg">/</span>{sessionQuestions.length}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Postęp</div>
          </div>
        </div>

        <div className="p-10 flex-grow flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-8 leading-tight">{currentQuestion.question}</h2>
          <div className="grid gap-3 mb-8">
            {shuffledOptions.map((opt, idx) => {
              const isSelected = selectedAnswers.includes(idx);
              let style = "border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700";
              if (isAnswerChecked) {
                if (opt.correct) style = "border-emerald-500 bg-emerald-500/10 text-emerald-300";
                else if (isSelected) style = "border-red-500 bg-red-500/10 text-red-300";
                else style = "border-slate-800/50 text-slate-600 opacity-40";
              } else if (isSelected) style = "border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]";

              return (
                <button key={idx} onClick={() => handleOptionToggle(idx)} disabled={isAnswerChecked} className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-5 relative group ${style}`}>
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? (isAnswerChecked ? (opt.correct ? "bg-emerald-500 border-emerald-500 text-white" : "bg-red-500 border-red-500 text-white") : "bg-indigo-500 border-indigo-500 text-white") : "border-slate-700 bg-slate-900 text-slate-500 group-hover:border-slate-500"}`}>
                    {currentQuestion.type === 'multi' ? (isSelected ? <CheckSquare size={18} strokeWidth={3}/> : <Square size={18} strokeWidth={2}/>) : <span className="text-sm font-bold">{String.fromCharCode(65+idx)}</span>}
                  </div>
                  <span className="text-lg font-medium">{opt.text}</span>
                  {isAnswerChecked && opt.correct && <CheckCircle className="absolute right-6 text-emerald-500" size={24} />}
                  {isAnswerChecked && isSelected && !opt.correct && <XCircle className="absolute right-6 text-red-500" size={24} />}
                </button>
              )
            })}
          </div>

          <div className="mt-auto pt-6">
            {!isAnswerChecked ? (
              <button onClick={checkAnswer} disabled={selectedAnswers.length === 0} className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-lg ${selectedAnswers.length > 0 ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-[0.98]" : "bg-slate-800 text-slate-600 cursor-not-allowed"}`}>
                Zatwierdź Odpowiedź
              </button>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`p-6 rounded-2xl border-l-4 mb-6 shadow-xl ${isCorrect ? "border-emerald-500 bg-emerald-500/5 text-emerald-100" : "border-amber-500 bg-amber-500/5 text-amber-100"}`}>
                  <div className="font-black flex items-center gap-2 mb-2 uppercase tracking-widest text-xs opacity-70"><Brain size={16}/> Wyjaśnienie:</div>
                  <p className="text-base leading-relaxed">{currentQuestion.explanation}</p>
                </div>
                <button onClick={handleNextQuestion} className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-xl hover:bg-slate-100 transition-all flex justify-center items-center gap-3 active:scale-[0.98]">
                  Kontynuuj <ChevronRight size={24} strokeWidth={3}/>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}