
import React, { useState } from 'react';
import { BrainCircuit, ArrowRight, Lock, Mail, Facebook, Smartphone, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, remember: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@learnsense.ai');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 5) score++;
    if (pass.length > 10) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(password);

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email, rememberMe);
    }, 800);
  };

  const handleSocialLogin = (provider: string) => {
    if (isLoading || socialLoading) return;
    setSocialLoading(provider);
    setTimeout(() => {
      setSocialLoading(null);
      // For demo purposes, use a mock social email
      onLogin(`social_${provider}@learnsense.ai`, rememberMe);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-base flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up relative z-10">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-brand to-[#1a2342] p-5 rounded-3xl text-white shadow-lg shadow-brand/30 transform transition-all duration-500 hover:scale-110 hover:rotate-3 cursor-default">
            <BrainCircuit className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-center text-4xl font-display font-bold text-secondary tracking-tight transition-transform duration-300 hover:-translate-y-1 hover:scale-105 cursor-default">
          Welcome back
        </h2>
        <p className="mt-3 text-center text-sm text-slate-500">
          Sign in to your <span className="font-bold text-accent">LearnSense AI</span> account
        </p>
      </div>

      <div className="mt-10 sm:mx-auto w-full max-w-[420px] animate-fade-in-up relative z-10" style={{ animationDelay: '0.1s' }}>
        <div className="bg-surface py-8 px-6 sm:py-10 sm:px-8 shadow-soft rounded-[32px] border border-white/50 dark:border-white/5 backdrop-blur-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-2">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-base border border-slate-200 dark:border-slate-700 rounded-2xl text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent focus:bg-white dark:focus:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 shadow-sm"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-base border border-slate-200 dark:border-slate-700 rounded-2xl text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent focus:bg-white dark:focus:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
              {/* Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-3 px-1 transition-all duration-300 ease-in-out">
                  <div className="flex gap-1.5 h-1.5 mb-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          strengthScore >= i ? getStrengthColor(strengthScore) : 'bg-slate-200 dark:bg-slate-700/50'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-bold text-right transition-colors duration-300 ${
                    strengthScore <= 1 ? 'text-red-500' :
                    strengthScore === 2 ? 'text-orange-500' :
                    strengthScore === 3 ? 'text-yellow-500' :
                    'text-emerald-500'
                  }`}>
                    {getStrengthLabel(strengthScore)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center group cursor-pointer select-none">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={isLoading}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-accent focus:ring-accent border-slate-300 rounded cursor-pointer transition-transform duration-200 group-hover:scale-110"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-500 group-hover:text-secondary transition-colors cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button type="button" disabled={isLoading} className="font-bold text-accent hover:text-accent-hover hover:underline underline-offset-2 transition-all">
                  Forgot password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg shadow-accent/20 text-sm font-bold text-white bg-accent hover:bg-accent-hover focus:outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/30 hover:brightness-105 active:translate-y-0 active:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading || !!socialLoading}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent bg-base rounded-2xl hover:bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading || !!socialLoading}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent bg-base rounded-2xl hover:bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-sm text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {socialLoading === 'facebook' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Facebook className="h-5 w-5" fill="currentColor" />
                )}
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialLogin('phone')}
                disabled={isLoading || !!socialLoading}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent bg-base rounded-2xl hover:bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-sm text-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {socialLoading === 'phone' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Smartphone className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
    