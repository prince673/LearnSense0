
import React, { useState, useEffect } from 'react';
import { BrainCircuit, ChevronRight, Loader2, Sparkles, LogOut, GraduationCap, LayoutDashboard, Search, Upload, Clock, Zap, Sun, Moon, Coins, Crown, Plus } from 'lucide-react';
import { AnalysisState, AnalysisStatus, UserProfile, PricingPlan, TokenPackage } from './types';
import { analyzeLesson } from './services/geminiService';
import { MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB, TOKEN_COST_PER_ANALYSIS, INITIAL_FREE_TOKENS } from './constants';
import FileUpload from './components/FileUpload';
import AnalysisResult from './components/AnalysisResult';
import LoginPage from './components/LoginPage';
import TeacherDashboard from './components/TeacherDashboard';
import SubscriptionModal from './components/SubscriptionModal';
import LandingPage from './components/LandingPage';

type ViewMode = 'student' | 'teacher';

const App: React.FC = () => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('learnSense_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('learnSense_user') || '';
  });
  
  // New state to handle the flow between Landing -> Login
  const [showLogin, setShowLogin] = useState(false);

  // --- User Profile & Monetization State ---
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem(`learnSense_profile_${currentUser}`);
    return savedProfile ? JSON.parse(savedProfile) : {
      email: currentUser,
      plan: 'free',
      tokenBalance: INITIAL_FREE_TOKENS,
      subscriptionEndDate: undefined
    };
  });
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('student');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to dark for this theme
  
  // --- Content State ---
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [noteUrl, setNoteUrl] = useState<string>('');
  const [loadingText, setLoadingText] = useState<string>("Analyzing Lesson...");
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: AnalysisStatus.IDLE,
    data: null,
    error: null,
  });

  const apiKey = process.env.API_KEY || ""; 

  // --- Effects ---
  useEffect(() => {
    // Always enforce dark mode for the specific Navy theme requested
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem(`learnSense_profile_${currentUser}`, JSON.stringify(userProfile));
      const savedData = localStorage.getItem(`learnSense_data_${currentUser}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setAnalysisState({ status: AnalysisStatus.COMPLETE, data: parsed, error: null });
        } catch (e) {
          console.error("Failed to load saved analysis data", e);
        }
      }
    }
  }, [isAuthenticated, currentUser, userProfile]);

  useEffect(() => {
    if (isAuthenticated && currentUser && analysisState.status === AnalysisStatus.COMPLETE && analysisState.data) {
      localStorage.setItem(`learnSense_data_${currentUser}`, JSON.stringify(analysisState.data));
    }
  }, [analysisState, isAuthenticated, currentUser]);

  // --- Handlers ---

  const handleLogin = (email: string, remember: boolean) => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setCurrentUser(email);
    localStorage.setItem('learnSense_user', email);
    // Reset profile load for new user
    const saved = localStorage.getItem(`learnSense_profile_${email}`);
    if (saved) {
      setUserProfile(JSON.parse(saved));
    } else {
      setUserProfile({ email, plan: 'free', tokenBalance: INITIAL_FREE_TOKENS });
    }
    
    if (remember) {
      localStorage.setItem('learnSense_auth', 'true');
    } else {
      localStorage.removeItem('learnSense_auth');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    localStorage.removeItem('learnSense_auth');
    localStorage.removeItem('learnSense_user');
    reset();
    setViewMode('student');
    setShowLogin(false); // Go back to Landing Page
  };

  const handleSubscribe = async (plan: PricingPlan) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUserProfile(prev => ({
          ...prev,
          plan: plan.id,
          tokenBalance: plan.tokens === 'Unlimited' ? 999999 : (typeof plan.tokens === 'number' ? prev.tokenBalance + plan.tokens : prev.tokenBalance)
        }));
        resolve();
      }, 1500);
    });
  };

  const handleBuyTokens = async (pkg: TokenPackage) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUserProfile(prev => ({
          ...prev,
          tokenBalance: prev.tokenBalance + pkg.tokens
        }));
        resolve();
      }, 1500);
    });
  };

  const handleAnalyze = async () => {
    // --- Token Gate Logic ---
    if (userProfile.plan !== 'pro_yearly' && userProfile.plan !== 'pro_monthly') {
      if (userProfile.tokenBalance < TOKEN_COST_PER_ANALYSIS) {
        setIsSubscriptionModalOpen(true);
        return;
      }
    }

    const videoSource = videoFile || videoUrl;
    const noteSource = noteFile || noteUrl;
    if (!videoSource || !noteSource) return;
    if (!apiKey) {
      setAnalysisState({ status: AnalysisStatus.ERROR, data: null, error: "API Key not found. Please ensure it is set in the environment." });
      return;
    }

    setAnalysisState({ status: AnalysisStatus.ANALYZING, data: null, error: null });
    setLoadingText("Analyzing expert content...");
    
    // Simulate steps
    const steps = ["Reading student notes...", "Comparing models...", "Identifying misconceptions...", "Generating insights...", "Finalizing module..."];
    let stepIndex = 0;
    const intervalId = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingText(steps[stepIndex]);
        stepIndex++;
      }
    }, 2500);

    try {
      const result = await analyzeLesson(apiKey, videoSource, noteSource);
      
      // Deduct Tokens on success
      if (userProfile.plan === 'free') {
        setUserProfile(prev => ({ ...prev, tokenBalance: prev.tokenBalance - TOKEN_COST_PER_ANALYSIS }));
      }

      clearInterval(intervalId);
      setAnalysisState({ status: AnalysisStatus.COMPLETE, data: result, error: null });
    } catch (err: any) {
      clearInterval(intervalId);
      setAnalysisState({ status: AnalysisStatus.ERROR, data: null, error: err.message });
    }
  };

  const reset = () => {
    setVideoFile(null);
    setVideoUrl('');
    setNoteFile(null);
    setNoteUrl('');
    setAnalysisState({ status: AnalysisStatus.IDLE, data: null, error: null });
    setLoadingText("Analyzing Lesson...");
  };

  // --- Routing Logic ---
  if (!isAuthenticated && !showLogin) {
    return <LandingPage onGetStarted={() => setShowLogin(true)} onLogin={() => setShowLogin(true)} />;
  }

  if (!isAuthenticated && showLogin) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const hasVideoSource = !!videoFile || !!videoUrl;
  const hasNoteSource = !!noteFile || !!noteUrl;
  
  // Restricted accepts to supported Gemini Inline types to prevent 400 Errors
  const COMMON_ACCEPTS = "video/*,image/*,application/pdf,text/plain";
  const isPro = userProfile.plan.includes('pro');

  return (
    <div className="min-h-screen bg-base font-sans pb-20 transition-colors duration-300 text-white selection:bg-accent selection:text-black">
      
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscribe={handleSubscribe}
        onBuyTokens={handleBuyTokens}
        currentPlanId={userProfile.plan}
      />

      {/* Floating Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
        <header className="w-full max-w-6xl bg-navy-800/80 backdrop-blur-md border border-white/5 shadow-soft rounded-2xl h-16 flex items-center justify-between px-6 transition-all duration-300">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setViewMode('student')}>
            <div className="bg-gradient-to-br from-brand to-blue-600 p-2 rounded-xl text-white shadow-glow group-hover:scale-105 transition-transform duration-300">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight text-white">LearnSense</h1>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* View Toggle */}
            <div className="hidden md:flex bg-base p-1 rounded-full border border-white/5">
              <button 
                onClick={() => setViewMode('student')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'student' ? 'bg-surface text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Student
              </button>
              <button 
                onClick={() => setViewMode('teacher')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'teacher' ? 'bg-surface text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Teacher
              </button>
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block"></div>

            {/* Token/Plan Badge */}
            <button 
              onClick={() => setIsSubscriptionModalOpen(true)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 border ${
                isPro 
                ? 'bg-gradient-to-r from-accent to-yellow-400 text-navy-900 border-yellow-500 shadow-gold-glow'
                : 'bg-surface text-slate-300 border-white/10 hover:border-accent hover:text-white'
              }`}
            >
               {isPro ? <Crown className="w-3.5 h-3.5 fill-navy-900 text-navy-900" /> : <Coins className="w-3.5 h-3.5 text-accent" />}
               {isPro ? 'PRO Plan' : `${userProfile.tokenBalance} Tokens`}
               {!isPro && <Plus className="w-3 h-3 bg-accent text-navy-900 rounded-full p-0.5" />}
            </button>
            
            <div className="hidden sm:block text-xs font-medium text-slate-400 mr-2">
              {currentUser}
            </div>

            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-all p-2 hover:bg-white/5 rounded-full">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-32 animate-fade-in">
        
        {viewMode === 'teacher' ? (
          <TeacherDashboard />
        ) : (
          <>
            {/* Search Bar Placeholder */}
            {analysisState.status === AnalysisStatus.IDLE && (
              <div className="relative mb-12 max-w-xl mx-auto hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  disabled
                  placeholder="Search your learning modules, notes, or videos..." 
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface border border-white/5 rounded-2xl text-sm shadow-soft text-white placeholder-slate-400 focus:ring-2 focus:ring-accent transition-all cursor-not-allowed opacity-60"
                />
              </div>
            )}

            {/* Intro / Hero */}
            {analysisState.status === AnalysisStatus.IDLE && (
              <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-6">
                  <Sparkles className="w-3 h-3" />
                  Multimodal AI Learning
                </div>
                <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-6 leading-tight">
                  Turn any content into <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-blue-400">personalized learning.</span>
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Upload videos, PDFs, screenshots, or notes. LearnSense extracts the core truth, identifies your misconceptions, and creates a tailored study plan instantly.
                </p>
                <div className="mt-6 flex justify-center gap-4 text-sm text-slate-400 font-medium">
                   <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-500" /> Save 10+ hours/week</span>
                   <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-accent" /> Instant Grades</span>
                </div>
              </div>
            )}

            {/* Input Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 transition-all duration-500 ${analysisState.status === AnalysisStatus.COMPLETE ? 'hidden' : ''}`}>
              
              <div className="bg-surface p-8 rounded-3xl shadow-soft hover:shadow-lg transition-shadow duration-300 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-blue-500"></div>
                <h3 className="font-display font-bold text-white text-lg mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  Expert Material
                </h3>
                <FileUpload 
                  label="Upload Video, PDF, or Doc"
                  accept={COMMON_ACCEPTS}
                  icon="video"
                  file={videoFile}
                  onFileSelect={setVideoFile}
                  url={videoUrl}
                  onUrlChange={setVideoUrl}
                  maxSizeMB={MAX_VIDEO_SIZE_MB}
                />
              </div>

              <div className="bg-surface p-8 rounded-3xl shadow-soft hover:shadow-lg transition-shadow duration-300 border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                 <h3 className="font-display font-bold text-white text-lg mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  Student Model
                </h3>
                <FileUpload 
                  label="Upload Your Notes / Rough Work"
                  accept={COMMON_ACCEPTS}
                  icon="document"
                  file={noteFile}
                  onFileSelect={setNoteFile}
                  url={noteUrl}
                  onUrlChange={setNoteUrl}
                  maxSizeMB={MAX_IMAGE_SIZE_MB}
                />
              </div>
            </div>

            {/* Action Area */}
            {analysisState.status !== AnalysisStatus.COMPLETE && (
              <div className="flex flex-col items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                
                {analysisState.status === AnalysisStatus.ERROR && (
                   <div className="bg-red-500/10 text-red-400 px-6 py-4 rounded-2xl text-sm border border-red-500/20 max-w-md text-center shadow-sm">
                     {analysisState.error}
                   </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!hasVideoSource || !hasNoteSource || analysisState.status === AnalysisStatus.ANALYZING}
                  className={`
                    group relative flex items-center justify-center gap-3 px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 ease-out
                    ${(!hasVideoSource || !hasNoteSource) 
                      ? 'bg-surface border border-white/5 text-slate-500 cursor-not-allowed' 
                      : 'bg-accent text-navy-900 shadow-lg hover:shadow-gold-glow hover:-translate-y-1 hover:bg-yellow-400 active:translate-y-0 active:shadow-md'
                    }
                  `}
                >
                  {analysisState.status === AnalysisStatus.ANALYZING ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="min-w-[150px] text-left transition-all duration-300">{loadingText}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Process with AI
                      <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                  {(!hasVideoSource || !hasNoteSource) && !isPro && (
                     <div className="absolute -bottom-8 text-xs text-slate-500 font-medium">Cost: {TOKEN_COST_PER_ANALYSIS} Tokens</div>
                  )}
                </button>
              </div>
            )}

            {/* Results View */}
            {analysisState.status === AnalysisStatus.COMPLETE && analysisState.data && (
               <div className="w-full">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-white">Learning Module</h2>
                      <p className="text-slate-400 text-sm mt-1">Personalized study plan generated from your inputs</p>
                    </div>
                    <button 
                      onClick={reset}
                      className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-surface border border-white/10 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm"
                    >
                      New Upload
                    </button>
                 </div>
                 
                 <AnalysisResult 
                    data={analysisState.data} 
                    expertSource={videoFile || videoUrl || "Restored Session"}
                    studentSource={noteFile || noteUrl || "Restored Session"}
                    apiKey={apiKey}
                    userId={currentUser}
                 />
               </div>
            )}
          </>
        )}

      </main>
    </div>
  );
};

export default App;
