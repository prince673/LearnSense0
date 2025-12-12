
import React from 'react';
import { 
  BrainCircuit, ArrowRight, PlayCircle, FileText, Layers, 
  MessageSquare, Zap, CheckCircle2, Star, ShieldCheck, ChevronRight,
  UploadCloud, Sparkles, GraduationCap
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../constants';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-base text-white selection:bg-accent selection:text-black overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-base/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-gradient-to-br from-brand to-blue-600 p-2 rounded-xl shadow-glow">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight">LearnSense</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="hidden sm:block text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-accent text-navy-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-yellow-400 transition-all duration-300 hover:shadow-gold-glow transform hover:-translate-y-0.5"
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-brand/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-white/10 text-accent text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3 h-3" /> New: Exam Mode Available
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight mb-6">
              Reimagine Learning with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-blue-400">AI</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl">
              Convert any PDF, video, or textbook into smart summaries, interactive flashcards, and personalized quizzes instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-accent text-navy-900 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2"
              >
                Start Learning Free <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-surface border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" /> Watch Demo
              </button>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-surface border border-base flex items-center justify-center text-[10px] text-white">
                    {String.fromCharCode(64+i)}
                  </div>
                ))}
              </div>
              <p>Trusted by 10,000+ Students</p>
            </div>
          </div>

          <div className="relative animate-float hidden lg:block">
            <div className="relative z-10 bg-surface border border-white/10 rounded-3xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
               <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent rounded-3xl pointer-events-none"></div>
               {/* Mock UI Interface */}
               <div className="bg-base rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Thermodynamics.pdf</h3>
                      <div className="h-1.5 w-32 bg-surface rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-accent w-[80%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-surface rounded w-full"></div>
                    <div className="h-2 bg-surface rounded w-[90%]"></div>
                    <div className="h-2 bg-surface rounded w-[60%]"></div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-xl border border-white/5">
                       <Layers className="w-5 h-5 text-brand mb-2" />
                       <div className="text-xs text-slate-400">Flashcards</div>
                       <div className="font-bold">24 Generated</div>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-white/5">
                       <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
                       <div className="text-xs text-slate-400">Quiz Score</div>
                       <div className="font-bold">92%</div>
                    </div>
                  </div>
               </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 bg-surface border border-white/10 p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '1s' }}>
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                   <MessageSquare className="w-4 h-4 text-white" />
                 </div>
                 <div>
                   <p className="text-xs text-slate-400">AI Tutor</p>
                   <p className="text-sm font-bold">"Concept clarified!"</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-base relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-brand/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">From confusion to <span className="text-accent">clarity</span> in 3 steps.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Our process is simple, fast, and completely automated.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-brand/0 via-brand/30 to-brand/0 -z-10"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-surface border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-soft relative transition-transform duration-300 group-hover:-translate-y-2">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-base">1</div>
                <UploadCloud className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Upload Material</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Drag and drop your lecture videos, PDFs, or handwritten notes directly into the dashboard.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-surface border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-soft relative transition-transform duration-300 group-hover:-translate-y-2">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-base">2</div>
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">AI Analysis</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Gemini 3 Pro scans your content, identifying core concepts and spotting misconceptions in seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-surface border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-soft relative transition-transform duration-300 group-hover:-translate-y-2">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-base">3</div>
                <GraduationCap className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Master It</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Get a personalized roadmap, interactive quizzes, and a 24/7 AI tutor to clear your doubts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">Everything you need to <span className="text-accent">ace it.</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">LearnSense adapts to your learning style, transforming passive reading into active mastery.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: FileText, 
                title: "Smart Summaries", 
                desc: "Condense 100-page PDFs into key takeaways and lightbulb moments.",
                color: "text-blue-400"
              },
              { 
                icon: Layers, 
                title: "Flashcards", 
                desc: "Auto-generate active recall cards from your specific study materials.",
                color: "text-accent"
              },
              { 
                icon: MessageSquare, 
                title: "AI Tutor", 
                desc: "Chat with your textbook. Ask questions and get instant, sourced answers.",
                color: "text-green-400"
              },
              { 
                icon: BrainCircuit, 
                title: "Concept Maps", 
                desc: "Visualize connections between complex topics with auto-generated graphs.",
                color: "text-purple-400"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-surface border border-white/5 p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 group">
                <div className={`w-14 h-14 rounded-2xl bg-base flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">Simple, transparent pricing.</h2>
            <p className="text-slate-400">Start for free, upgrade for power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div 
                key={plan.id}
                className={`relative bg-surface rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl flex flex-col ${
                  plan.recommended ? 'border-accent scale-105 z-10' : 'border-transparent hover:border-white/10'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-navy-900 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-300">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-display font-bold text-white">{plan.currency}{plan.price}</span>
                    <span className="text-slate-500 text-sm">/{plan.interval}</span>
                  </div>
                </div>

                <div className="flex-1 mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-sm text-slate-300">
                      <Zap className="w-4 h-4 text-accent shrink-0" />
                      {plan.tokens === 'Unlimited' ? 'Unlimited AI Tokens' : `${plan.tokens} Monthly Tokens`}
                    </li>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={onGetStarted}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                    plan.recommended 
                    ? 'bg-accent text-navy-900 hover:bg-yellow-400' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-surface border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <BrainCircuit className="w-6 h-6 text-brand" />
              <h2 className="text-xl font-bold">LearnSense</h2>
            </div>
            <p className="text-slate-400 max-w-sm mb-6">
              Empowering students with AI-driven insights. 
              Study smarter, not harder.
            </p>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <div className="w-10 h-10 rounded-full bg-base flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand transition-all cursor-pointer">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
               </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="hover:text-white cursor-pointer">Features</li>
              <li className="hover:text-white cursor-pointer">Pricing</li>
              <li className="hover:text-white cursor-pointer">For Schools</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="hover:text-white cursor-pointer">About</li>
              <li className="hover:text-white cursor-pointer">Blog</li>
              <li className="hover:text-white cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex justify-between text-xs text-slate-500">
          <p>© 2024 LearnSense AI. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
