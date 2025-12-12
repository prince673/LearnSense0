import React, { useState, useEffect, useRef } from 'react';
import { LearnSenseResponse, QuizItem, BookmarkItem } from '../types';
import { createTutorChat, generateAnalogyImage } from '../services/geminiService';
import { Chat } from "@google/genai";
// @ts-ignore
import mermaid from 'mermaid';
import { 
  Lightbulb, AlertTriangle, PlayCircle, Layers, CheckCircle2, 
  BookOpen, Brain, Clock, ChevronLeft, ChevronRight, RotateCw, Check, X,
  Map, FileText, MessageSquare, Send, User, Bot, MonitorPlay, HelpCircle, Bookmark, Filter, Image as ImageIcon, Loader2
} from 'lucide-react';

interface AnalysisResultProps {
  data: LearnSenseResponse;
  expertSource: File | string;
  studentSource: File | string;
  apiKey: string;
  userId: string;
}

type Tab = 'lesson' | 'notes' | 'video' | 'roadmap' | 'quiz' | 'flashcards' | 'exam' | 'tutor' | 'saved';

// Initialize mermaid
mermaid.initialize({ 
  startOnLoad: false, 
  theme: 'base',
  themeVariables: {
    primaryColor: '#2F3A67',
    primaryTextColor: '#fff',
    secondaryColor: '#4F46E5',
    lineColor: '#00C4FF',
    fontFamily: 'Inter',
    fontSize: '14px',
    mindmapShape: 'rounded'
  },
  securityLevel: 'loose'
});

const MermaidDiagram = ({ code }: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (code && ref.current) {
        try {
          setError(null);
          // Clean the code if it has markdown fences or extra whitespace
          let cleanCode = code.replace(/```mermaid/g, '').replace(/```/g, '').trim();
          
          // Fallback if AI didn't start with mindmap
          if (!cleanCode.startsWith('mindmap')) {
             // Attempt to wrap a simple list if needed, but for now assuming prompt compliance
             cleanCode = 'mindmap\n' + cleanCode;
          }

          const { svg } = await mermaid.render(`mermaid-${Date.now()}`, cleanCode);
          setSvg(svg);
        } catch (e: any) {
          console.error("Mermaid error:", e);
          setError("Could not render visual mindmap. displaying text fallback.");
        }
      }
    };
    renderChart();
  }, [code]);

  if (error) {
     return <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap opacity-90 bg-black/20 p-6 rounded-2xl border border-white/10">{code}</div>;
  }

  return (
    <div 
      ref={ref} 
      dangerouslySetInnerHTML={{ __html: svg }} 
      className="flex justify-center w-full overflow-x-auto py-4" 
    />
  );
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, expertSource, studentSource, apiKey, userId }) => {
  const [activeTab, setActiveTab] = useState<Tab>('lesson');
  
  // Initialize bookmarks from localStorage based on userId
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem(`learnSense_bookmarks_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Persist bookmarks whenever they change
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`learnSense_bookmarks_${userId}`, JSON.stringify(bookmarks));
    }
  }, [bookmarks, userId]);
  
  // Flashcard State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz State
  const [quizDifficulty, setQuizDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Filtered Quiz Questions
  const filteredQuiz = data.assessmentTools.quiz.filter(q => 
    quizDifficulty === 'All' || q.difficulty === quizDifficulty
  );

  // Chat/Tutor State
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Visual Analogy Image State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  // Initialize Chat when Tutor tab is accessed
  useEffect(() => {
    if (activeTab === 'tutor' && !chat && apiKey) {
      const initChat = async () => {
        try {
          // If sources are placeholders (e.g. from page reload), the chat might be limited.
          // But we pass them anyway; if they are strings, they will be sent as text context.
          const newChat = await createTutorChat(apiKey, expertSource, studentSource, data);
          setChat(newChat);
          
          let welcomeMsg = "Hi! I'm your AI Tutor. I can help solve homework step-by-step or clarify doubts. What do you need help with?";
          
          // Check if sources are likely restored strings (not files) to warn user
          if (typeof expertSource === 'string' && expertSource.includes("Restored Session")) {
             welcomeMsg += "\n\n(Note: I've restored your lesson plan, but original video/files are missing due to refresh. I can still answer general questions!)";
          }
          
          setMessages([{ role: 'model', text: welcomeMsg }]);
        } catch (e) {
          console.error("Failed to init chat", e);
          setMessages([{ role: 'model', text: "Unable to initialize AI Tutor. Please try reloading or re-uploading your files."}]);
        }
      };
      initChat();
    }
  }, [activeTab, chat, apiKey, expertSource, studentSource, data]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // --- Bookmark Handlers ---
  const toggleBookmark = (item: BookmarkItem) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === item.id);
      if (exists) return prev.filter(b => b.id !== item.id);
      return [...prev, item];
    });
  };

  const isBookmarked = (id: string) => bookmarks.some(b => b.id === id);

  const BookmarkButton = ({ item, className = '' }: { item: BookmarkItem, className?: string }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleBookmark(item);
      }}
      className={`p-2 rounded-full transition-all duration-300 z-10 hover:scale-110 active:scale-95 ${isBookmarked(item.id) 
        ? 'text-accent bg-accent/10' 
        : 'text-slate-300 hover:text-secondary hover:bg-base'} ${className}`}
      title={isBookmarked(item.id) ? "Remove from saved" : "Save for later"}
    >
      <Bookmark className={`w-5 h-5 ${isBookmarked(item.id) ? 'fill-current' : ''}`} />
    </button>
  );

  // --- Flashcard Handlers ---
  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % data.assessmentTools.flashcards.length);
    }, 200);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + data.assessmentTools.flashcards.length) % data.assessmentTools.flashcards.length);
    }, 200);
  };

  // --- Quiz Handlers ---
  const handleDifficultyChange = (level: 'All' | 'Easy' | 'Medium' | 'Hard') => {
    setQuizDifficulty(level);
    setQuizAnswers({}); // Reset answers when difficulty changes
    setShowQuizResults(false);
  };

  const handleQuizSelect = (index: number, answer: string) => {
    if (showQuizResults) return;
    setQuizAnswers(prev => ({ ...prev, [index]: answer }));
  };

  const calculateScore = () => {
    let correct = 0;
    filteredQuiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) correct++;
    });
    return correct;
  };

  // --- Chat Handlers ---
  const handleSendMessage = async (e?: React.FormEvent, overrideMsg?: string) => {
    e?.preventDefault();
    const msgToSend = overrideMsg || inputMessage;
    
    if (!msgToSend.trim() || !chat || isChatLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: msgToSend }]);
    if (!overrideMsg) setInputMessage('');
    setIsChatLoading(true);

    try {
      const result = await chat.sendMessage({ message: msgToSend });
      const responseText = result.text || "I couldn't generate a response.";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const triggerHomeworkHelp = () => {
    const prompt = "I have a homework problem similar to the concepts in this lesson. Can you help me solve it step-by-step? Please provide hints first before giving the final answer.";
    handleSendMessage(undefined, prompt);
  };

  const handleGenerateImage = async () => {
    if (isGeneratingImg || !apiKey) return;
    setIsGeneratingImg(true);
    try {
      const imgData = await generateAnalogyImage(apiKey, data.visualAnalogy.diagramSuggestion);
      setGeneratedImage(imgData);
    } catch (e) {
      console.error(e);
      // Optional: error handling UI
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // --- Tab Button Component ---
  const TabButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`relative shrink-0 flex items-center gap-2 py-3 px-6 rounded-full text-sm font-bold transition-all duration-300 ease-out hover:-translate-y-1 active:translate-y-0
        ${activeTab === id 
          ? 'bg-brand text-white shadow-lg scale-105' 
          : 'bg-surface text-slate-500 hover:text-secondary hover:bg-base border border-transparent hover:border-secondary/20 hover:shadow-sm'}`}
    >
      <Icon className={`w-4 h-4 ${activeTab === id ? 'text-accent' : ''}`} />
      {label}
      {id === 'saved' && bookmarks.length > 0 && (
        <span className={`ml-1 text-[10px] px-1.5 rounded-full ${activeTab === id ? 'bg-accent text-white' : 'bg-slate-200 text-slate-600'}`}>
          {bookmarks.length}
        </span>
      )}
    </button>
  );

  const renderLessonTab = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Lightbulb Moment */}
      <div className="relative bg-surface rounded-3xl p-8 shadow-soft border border-secondary/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100/50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-secondary">The "Lightbulb" Moment</h3>
          </div>
          <BookmarkButton 
            item={{
              id: 'lightbulb',
              type: 'lightbulb',
              title: 'Lightbulb Moment',
              content: data.lightbulbMoment
            }} 
          />
        </div>
        <p className="text-secondary/80 leading-relaxed font-medium text-lg relative z-10">
          {data.lightbulbMoment}
        </p>
      </div>

      {/* Note Correction */}
      <div className="bg-surface rounded-3xl p-8 shadow-soft border border-secondary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400"></div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-secondary">Note Vibe Check</h3>
          </div>
          <BookmarkButton 
            item={{
              id: 'correction',
              type: 'correction',
              title: 'Note Correction',
              content: data.noteCorrection
            }} 
          />
        </div>
        
        <div className="bg-base rounded-2xl p-5 border border-slate-100 dark:border-slate-700 mb-6">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Your Note</p>
          <p className="font-handwriting text-slate-600 dark:text-slate-300 italic text-xl">"{data.noteCorrection.studentQuote}"</p>
        </div>

        <div className="flex gap-5 items-start">
           <div className="shrink-0 pt-1">
             <div className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full">
               <PlayCircle className="w-3.5 h-3.5" /> {data.noteCorrection.timestampReference}
             </div>
           </div>
           <p className="text-secondary/80 leading-relaxed">
             {data.noteCorrection.correction}
           </p>
        </div>
      </div>

      {/* Visual Analogy */}
      <div className="bg-surface rounded-3xl p-8 shadow-soft border border-secondary/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-bold text-secondary">Visual Analogy</h3>
          </div>
          <BookmarkButton 
            item={{
              id: 'analogy',
              type: 'analogy',
              title: 'Visual Analogy',
              content: data.visualAnalogy
            }} 
          />
        </div>
        <p className="text-secondary/80 mb-6 leading-relaxed">{data.visualAnalogy.description}</p>
        
        <div className="bg-indigo-50/50 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
           <div className="h-24 w-24 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-indigo-50 overflow-hidden relative group">
             {generatedImage ? (
                <img src={generatedImage} alt="Generated Analogy" className="w-full h-full object-cover" />
             ) : (
                <span className="text-4xl">🎨</span>
             )}
             {generatedImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => window.open(generatedImage, '_blank')} className="text-white text-xs font-bold bg-white/20 p-1.5 rounded-full hover:bg-white/40 backdrop-blur-sm">
                      <ImageIcon className="w-4 h-4" />
                   </button>
                </div>
             )}
           </div>
           <div className="flex-1 w-full">
             <p className="text-xs uppercase tracking-wider text-indigo-400 font-bold mb-1">Imagine This Diagram</p>
             <p className="text-base text-indigo-900 dark:text-indigo-200 font-semibold mb-4">{data.visualAnalogy.diagramSuggestion}</p>
             
             {!generatedImage && (
               <button 
                 onClick={handleGenerateImage}
                 disabled={isGeneratingImg}
                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md"
               >
                 {isGeneratingImg ? (
                   <>
                     <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Diagram...
                   </>
                 ) : (
                   <>
                     <ImageIcon className="w-3.5 h-3.5" /> Generate Illustration
                   </>
                 )}
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );

  const renderSmartNotesTab = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Auto Documentation */}
      <div className="bg-surface rounded-3xl p-8 shadow-soft border border-secondary/5">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-display font-bold text-secondary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <FileText className="w-5 h-5" />
            </div>
            Auto-Summary
          </h3>
          <BookmarkButton 
            item={{
              id: 'summary',
              type: 'summary',
              title: 'Lesson Summary',
              content: data.productivity.summary
            }} 
          />
        </div>
        <p className="text-secondary/80 leading-relaxed whitespace-pre-line text-lg">{data.productivity.summary}</p>
      </div>

      {/* Key Points */}
      <div className="bg-surface rounded-3xl p-8 shadow-soft border border-secondary/5">
        <h3 className="text-xl font-display font-bold text-secondary mb-6">Key Takeaways</h3>
        <ul className="space-y-4">
          {data.productivity.keyPoints.map((point, idx) => (
            <li key={idx} className="flex items-start justify-between gap-4 p-4 rounded-2xl hover:bg-base transition-colors group">
              <div className="flex items-start gap-4">
                <span className="bg-accent/10 text-accent rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</span>
                <span className="text-secondary/90 font-medium">{point}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                 <BookmarkButton 
                    item={{
                      id: `keypoint-${idx}`,
                      type: 'keypoint',
                      title: `Key Point ${idx + 1}`,
                      content: point
                    }}
                    className="p-1"
                 />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Mind Map */}
      <div className="bg-brand rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <Brain className="w-6 h-6 text-accent" />
            Mind Map Structure
          </h3>
          <BookmarkButton 
            item={{
              id: 'mindmap',
              type: 'summary', 
              title: 'Mind Map',
              content: data.productivity.mindMapDescription
            }}
            className="text-white/50 hover:text-white hover:bg-white/10"
          />
        </div>
        
        {/* Mermaid Rendering */}
        <div className="relative z-10 bg-white/10 rounded-2xl overflow-hidden p-2">
           <MermaidDiagram code={data.productivity.mindMapDescription} />
        </div>
      </div>
    </div>
  );

  const renderVideoTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-surface rounded-3xl p-8 shadow-soft border border-secondary/5">
        <h3 className="text-xl font-display font-bold text-secondary mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <MonitorPlay className="w-5 h-5" />
          </div>
          AI Video Tutor Overlay Insights
        </h3>
        <p className="text-slate-500 text-sm mb-8 pl-14">
          The AI Tutor has scanned the source video/document and identified these proactive learning moments.
        </p>

        <div className="space-y-5 pl-4 sm:pl-0">
          {data.videoTutor.insights.map((insight, idx) => (
            <div key={idx} className="flex gap-5 p-5 rounded-2xl bg-base border border-slate-100 hover:border-purple-200 hover:bg-surface hover:shadow-md transition-all relative group">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <BookmarkButton 
                    item={{
                      id: `insight-${idx}`,
                      type: 'insight',
                      title: `Video Insight ${insight.timestamp}`,
                      content: insight
                    }}
                 />
              </div>
              <div className="shrink-0">
                <div className="w-20 h-14 bg-white rounded-xl flex items-center justify-center text-secondary font-mono text-xs font-bold border border-slate-200 shadow-sm">
                  {insight.timestamp}
                </div>
              </div>
              <div className="flex-1 pr-8">
                <div className="flex items-center gap-2 mb-2">
                   <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wider">Trigger</span>
                   <h4 className="font-bold text-secondary text-sm">{insight.trigger}</h4>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  <span className="font-semibold text-purple-600">AI Explanation: </span>
                  {insight.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRoadmapTab = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Intelligent Feedback */}
      <div className="bg-gradient-to-br from-brand to-[#1a2342] rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent rounded-full blur-[80px] opacity-10"></div>
        <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-3 relative z-10">
          <User className="w-6 h-6 text-accent" />
          Intelligent Feedback
        </h3>
        <p className="leading-relaxed opacity-90 text-lg font-light relative z-10">{data.learningPath.feedback}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weak Areas */}
        <div className="bg-surface border border-red-100 rounded-3xl p-8 shadow-soft">
          <h3 className="text-red-600 font-display font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Focus Areas
          </h3>
          <ul className="space-y-3">
            {data.learningPath.weakAreas.map((area, i) => (
              <li key={i} className="flex items-center gap-3 text-red-800 bg-red-50 p-3 rounded-xl">
                 <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                 {area}
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-surface border border-emerald-100 rounded-3xl p-8 shadow-soft">
          <h3 className="text-emerald-600 font-display font-bold mb-6 flex items-center gap-2">
            <Map className="w-5 h-5" />
            Recommended Path
          </h3>
          <ul className="space-y-3">
             {data.learningPath.nextSteps.map((step, i) => (
              <li key={i} className="flex items-center gap-3 text-emerald-800 bg-emerald-50 p-3 rounded-xl">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                 {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderTutorTab = () => (
    <div className="h-[600px] flex flex-col bg-surface border border-secondary/5 rounded-3xl shadow-soft overflow-hidden animate-fade-in relative">
      <div className="bg-white dark:bg-slate-800 p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-accent to-blue-500 text-white rounded-xl shadow-lg shadow-accent/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-secondary text-lg">LearnSense Tutor</h3>
            <p className="text-xs text-slate-400 font-medium">24/7 Doubt Solver & Homework Co-Pilot</p>
          </div>
        </div>
        <button 
          onClick={triggerHomeworkHelp}
          className="text-xs font-bold bg-brand text-white px-4 py-2 rounded-full hover:bg-brand/90 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md"
        >
          <HelpCircle className="w-3.5 h-3.5 text-accent" /> Homework Mode
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-base">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm
              ${msg.role === 'user' 
                ? 'bg-accent text-white rounded-br-none shadow-accent/20' 
                : 'bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-secondary dark:text-slate-200 rounded-bl-none'}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={(e) => handleSendMessage(e)} className="p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-3">
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question or paste a problem..."
          className="flex-1 bg-base border-none rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-accent text-sm text-secondary placeholder-slate-400"
        />
        <button 
          type="submit" 
          disabled={!inputMessage.trim() || isChatLoading}
          className="bg-accent text-white p-3 rounded-2xl hover:bg-accent-hover disabled:opacity-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/20 active:translate-y-0 active:shadow-sm active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );

  const renderQuizTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
           <h3 className="text-2xl font-display font-bold text-secondary">Adaptive Quiz</h3>
           <p className="text-sm text-slate-500 mt-1">Test your knowledge with AI-generated questions</p>
        </div>
        
        <div className="flex items-center gap-2 bg-base p-1 rounded-xl border border-secondary/5 self-start sm:self-center">
             {(['All', 'Easy', 'Medium', 'Hard'] as const).map((level) => (
               <button
                 key={level}
                 onClick={() => handleDifficultyChange(level)}
                 className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${
                   quizDifficulty === level 
                   ? 'bg-surface text-secondary shadow-sm' 
                   : 'text-slate-400 hover:text-secondary'
                 }`}
               >
                 {level}
               </button>
             ))}
        </div>
      </div>

      {showQuizResults && (
           <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-emerald-800">Quiz Completed!</p>
                    <p className="text-xs text-emerald-600">You scored {calculateScore()} out of {filteredQuiz.length}</p>
                 </div>
             </div>
             <button onClick={() => { setShowQuizResults(false); setQuizAnswers({}); }} className="text-xs font-bold text-emerald-700 underline">Retry</button>
           </div>
      )}

      {filteredQuiz.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-3xl border border-secondary/5">
              <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
                 <Filter className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No questions available for this difficulty level.</p>
              <button onClick={() => handleDifficultyChange('All')} className="text-accent text-sm font-bold mt-2 hover:underline">View All Questions</button>
          </div>
      ) : (
          filteredQuiz.map((q, idx) => {
            // NOTE: We use idx (index in filtered array) for state management of the current view
            const isSelected = !!quizAnswers[idx];
            const isCorrect = quizAnswers[idx] === q.correctAnswer;
            
            return (
              <div key={idx} className="bg-surface border border-secondary/5 rounded-3xl p-8 shadow-soft relative overflow-hidden animate-pop">
                {/* Progress Bar Top */}
                <div className="absolute top-0 left-0 h-1 bg-slate-100 w-full">
                    <div className="h-full bg-accent" style={{ width: `${((idx+1)/filteredQuiz.length)*100}%` }}></div>
                </div>

                <div className="flex justify-between items-start mb-6 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shadow-md">
                      {idx + 1}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border 
                      ${q.difficulty === 'Hard' ? 'bg-red-50 text-red-600 border-red-100' : 
                        q.difficulty === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{q.type}</span>
                </div>
                
                <p className="text-secondary font-display font-semibold text-xl mb-6">{q.question}</p>

                {/* MCQ Options */}
                {q.type === 'MCQ' && q.options && (
                  <div className="space-y-3">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        disabled={showQuizResults}
                        onClick={() => handleQuizSelect(idx, opt)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium
                          ${showQuizResults && opt === q.correctAnswer 
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-md' 
                            : showQuizResults && quizAnswers[idx] === opt && opt !== q.correctAnswer
                              ? 'bg-red-50 border-red-400 text-red-800'
                              : quizAnswers[idx] === opt 
                                ? 'bg-blue-50 border-accent text-secondary shadow-md' 
                                : 'bg-base border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-200 text-slate-600 dark:text-slate-300'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* True/False Options */}
                {q.type === 'TrueFalse' && (
                  <div className="flex gap-4">
                    {['True', 'False'].map((opt) => (
                        <button
                          key={opt}
                          disabled={showQuizResults}
                          onClick={() => handleQuizSelect(idx, opt)}
                          className={`flex-1 p-4 rounded-xl border-2 font-bold transition-all duration-200
                            ${showQuizResults && opt === q.correctAnswer 
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
                              : showQuizResults && quizAnswers[idx] === opt && opt !== q.correctAnswer
                                ? 'bg-red-50 border-red-400 text-red-800'
                                : quizAnswers[idx] === opt 
                                  ? 'bg-blue-50 border-accent text-secondary shadow-md' 
                                  : 'bg-base border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-200 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                          {opt}
                        </button>
                    ))}
                  </div>
                )}
                
                {/* Short Answer / App Placeholders */}
                {(q.type === 'ShortAnswer' || q.type === 'Application') && (
                  <div className="bg-base p-6 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 italic text-center">
                    Self-Evaluate: Reveal answer to check your understanding.
                  </div>
                )}

                {showQuizResults && (
                  <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-pop">
                    <p className="text-sm font-bold text-secondary mb-2">Explanation:</p>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{q.explanation}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg inline-block">
                        <CheckCircle2 className="w-4 h-4" /> Correct Answer: {q.correctAnswer}
                    </div>
                  </div>
                )}
              </div>
            );
          })
      )}

      {!showQuizResults && filteredQuiz.length > 0 && (
        <button 
          onClick={() => setShowQuizResults(true)}
          className="w-full py-5 bg-brand text-white rounded-2xl font-bold text-lg hover:bg-brand/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-md shadow-lg"
        >
          Submit Quiz & View Explanations
        </button>
      )}
    </div>
  );

  const renderFlashcardsTab = () => {
    const card = data.assessmentTools.flashcards[currentCardIndex];
    const totalCards = data.assessmentTools.flashcards.length;
    const progressPercentage = ((currentCardIndex + 1) / totalCards) * 100;
    
    return (
      <div className="animate-fade-in flex flex-col items-center max-w-2xl mx-auto">
        <div className="w-full mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-display font-bold text-secondary">Flashcards</h3>
            <span className="text-sm font-bold text-white bg-accent px-4 py-1.5 rounded-full shadow-glow">
              {currentCardIndex + 1} / {totalCards}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner-light border border-slate-200 dark:border-slate-600">
            <div 
              className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full transition-all duration-500 ease-out shadow-glow" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="w-full h-96 perspective-1000 mb-10 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front */}
            <div className="absolute w-full h-full backface-hidden bg-surface border border-secondary/5 rounded-3xl shadow-soft flex flex-col items-center justify-center p-12 text-center group-hover:border-accent/30 transition-colors">
              <div className="absolute top-6 right-6 z-10">
                 <BookmarkButton 
                    item={{
                      id: `flashcard-${currentCardIndex}`,
                      type: 'flashcard',
                      title: `Flashcard: ${card.tag}`,
                      content: card
                    }} 
                 />
              </div>
              <span className={`absolute top-8 left-8 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg
                ${card.tag === 'Formula' ? 'bg-purple-100 text-purple-600' : 
                  card.tag === 'Definition' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {card.tag}
              </span>
              <p className="text-3xl font-display font-bold text-secondary leading-tight">{card.front}</p>
              <p className="absolute bottom-8 text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-accent" /> Click to flip
              </p>
            </div>

            {/* Back */}
            <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-brand to-[#1a2342] rounded-3xl shadow-xl flex flex-col items-center justify-center p-12 text-center rotate-y-180 text-white border border-white/10">
              <span className="absolute top-8 left-8 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/10 text-white backdrop-blur-sm">
                Answer
              </span>
              <p className="text-2xl font-medium leading-relaxed opacity-90">{card.back}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <button onClick={handlePrevCard} className="p-5 rounded-full bg-surface shadow-soft hover:shadow-lg text-secondary border border-secondary/5 transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-95">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={handleNextCard} className="p-5 rounded-full bg-accent shadow-lg shadow-accent/30 text-white border border-transparent transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-95">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <style>{`
          .perspective-1000 { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
        `}</style>
      </div>
    );
  };

  const renderExamTab = () => (
    <div className="space-y-8 animate-fade-in">
      <h3 className="text-2xl font-display font-bold text-secondary mb-6">Exam Practice Builder</h3>
      
      {data.assessmentTools.examPractice.map((ex, i) => (
        <div key={i} className="bg-surface border border-secondary/5 rounded-3xl p-8 shadow-soft relative group hover:shadow-lg transition-all">
          <div className="absolute top-6 right-6">
             <BookmarkButton 
                item={{
                  id: `exam-${i}`,
                  type: 'exam',
                  title: `Exam Q${i+1} (${ex.marks} Marks)`,
                  content: ex
                }} 
             />
          </div>
          <div className="flex justify-between items-start mb-6 pr-12">
             <div className="flex items-center gap-3">
                <span className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">Q{i + 1}</span>
                <span className="text-xs font-medium text-slate-500 bg-base px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-100">
                  <Clock className="w-3.5 h-3.5" /> {ex.estimatedTime}
                </span>
             </div>
             <span className="text-sm font-bold text-secondary border-2 border-slate-100 dark:border-slate-700 px-4 py-1.5 rounded-full">
               {ex.marks} Marks
             </span>
          </div>
          
          <p className="text-xl text-secondary font-medium leading-relaxed mb-8">{ex.question}</p>
          
          <details className="group/details">
            <summary className="flex items-center gap-2 text-sm font-bold text-accent cursor-pointer hover:text-accent-hover select-none transition-all duration-300 hover:-translate-y-0.5">
              <span className="group-open/details:hidden flex items-center gap-2"><Check className="w-4 h-4" /> Show Marking Scheme</span>
              <span className="hidden group-open/details:flex items-center gap-2"><X className="w-4 h-4" /> Hide Marking Scheme</span>
            </summary>
            <div className="mt-6 pt-6 border-t border-slate-100 text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-base p-6 rounded-2xl animate-pop">
              <span className="font-bold text-secondary block mb-2 text-base">Solution Key:</span>
              {ex.solutionKey}
            </div>
          </details>
        </div>
      ))}
    </div>
  );

  const renderBookmarksTab = () => {
    if (bookmarks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
          <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
            <Bookmark className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-secondary mb-2">No Saved Items Yet</h3>
          <p className="text-slate-500 max-w-xs">
            Tap the bookmark icon on any content to save it here for quick review.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-fade-in">
        <h3 className="text-2xl font-display font-bold text-secondary mb-6 flex items-center gap-3">
          <Bookmark className="w-6 h-6 text-accent fill-accent" />
          Saved for Review
        </h3>

        <div className="grid grid-cols-1 gap-6">
          {bookmarks.map((b) => (
            <div key={b.id} className="bg-surface border border-secondary/5 rounded-3xl p-8 shadow-soft relative group">
              <div className="absolute top-6 right-6">
                 <BookmarkButton item={b} />
              </div>
              <div className="pr-12">
                <span className="inline-block px-3 py-1 rounded-md text-[10px] uppercase font-bold bg-base text-slate-500 mb-3 tracking-wider">
                  {b.type.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <h4 className="font-display font-bold text-secondary text-lg mb-4">{b.title}</h4>
                
                {/* Content Rendering */}
                {b.type === 'lightbulb' && <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{b.content}</p>}
                {b.type === 'summary' && <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line text-sm leading-relaxed">{b.content}</p>}
                {b.type === 'keypoint' && <p className="text-slate-600 dark:text-slate-300 font-medium">{b.content}</p>}
                {b.type === 'correction' && (
                  <div className="space-y-3">
                    <p className="text-sm italic text-slate-500 bg-base p-3 rounded-xl border border-slate-100">"{b.content.studentQuote}"</p>
                    <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">{b.content.correction}</p>
                  </div>
                )}
                {b.type === 'analogy' && (
                  <div className="space-y-3">
                     <p className="text-slate-600 dark:text-slate-300 text-sm">{b.content.description}</p>
                     <p className="text-xs text-indigo-600 font-bold bg-indigo-50 p-3 rounded-xl flex items-center gap-2">
                       <Layers className="w-4 h-4" /> {b.content.diagramSuggestion}
                     </p>
                  </div>
                )}
                {b.type === 'insight' && (
                  <div>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-md mb-2 inline-block border border-purple-100">
                      {b.content.timestamp}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{b.content.explanation}</p>
                  </div>
                )}
                {b.type === 'flashcard' && (
                  <div className="bg-base border border-slate-200 rounded-2xl p-6 text-center">
                    <p className="font-bold text-secondary text-lg mb-4">{b.content.front}</p>
                    <div className="h-px bg-slate-200 my-4 mx-8"></div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{b.content.back}</p>
                  </div>
                )}
                {b.type === 'exam' && (
                  <div>
                     <p className="font-medium text-secondary mb-3">{b.content.question}</p>
                     <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">Solution: {b.content.solutionKey}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Navigation Sidebar (Desktop) / Horizontal Scroll (Mobile) */}
      <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24">
        <div className="bg-surface p-2 rounded-2xl shadow-soft border border-secondary/5 flex lg:flex-col gap-2 overflow-x-auto">
          <TabButton id="lesson" label="Lesson" icon={BookOpen} />
          <TabButton id="notes" label="Notes" icon={FileText} />
          <TabButton id="video" label="Video AI" icon={MonitorPlay} />
          <TabButton id="roadmap" label="Roadmap" icon={Map} />
          <TabButton id="quiz" label="Quiz" icon={CheckCircle2} />
          <TabButton id="flashcards" label="Cards" icon={Layers} />
          <TabButton id="exam" label="Exam" icon={Brain} />
          <TabButton id="tutor" label="Tutor" icon={MessageSquare} />
          <TabButton id="saved" label="Saved" icon={Bookmark} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 w-full">
         <div className="min-h-[600px]">
          {activeTab === 'lesson' && renderLessonTab()}
          {activeTab === 'notes' && renderSmartNotesTab()}
          {activeTab === 'video' && renderVideoTab()}
          {activeTab === 'roadmap' && renderRoadmapTab()}
          {activeTab === 'quiz' && renderQuizTab()}
          {activeTab === 'flashcards' && renderFlashcardsTab()}
          {activeTab === 'exam' && renderExamTab()}
          {activeTab === 'tutor' && renderTutorTab()}
          {activeTab === 'saved' && renderBookmarksTab()}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;