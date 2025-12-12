
import React, { useState } from 'react';
import { Check, X, CreditCard, Wallet, Building2, Zap, ShieldCheck, Loader2, Coins } from 'lucide-react';
import { SUBSCRIPTION_PLANS, TOKEN_PACKAGES } from '../constants';
import { PricingPlan, TokenPackage } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: PricingPlan) => Promise<void>;
  onBuyTokens: (pkg: TokenPackage) => Promise<void>;
  currentPlanId: string;
}

type Tab = 'plans' | 'tokens';
type PaymentMethod = 'card' | 'upi' | 'netbanking';

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, onClose, onSubscribe, onBuyTokens, currentPlanId 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('plans');
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (plan: PricingPlan) => {
    setLoading(plan.id);
    try {
      await onSubscribe(plan);
      setSuccessMsg(`Successfully upgraded to ${plan.name}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleBuyTokens = async (pkg: TokenPackage) => {
    setLoading(pkg.id);
    try {
      await onBuyTokens(pkg);
      setSuccessMsg(`Added ${pkg.tokens} tokens to your balance!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-base w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10 text-white">
        
        {/* Header */}
        <div className="bg-surface p-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Upgrade Your Learning</h2>
            <p className="text-slate-400 text-sm">Choose a plan or top-up tokens to continue analyzing.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 shrink-0 bg-surface/50">
          <button 
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'plans' ? 'text-brand' : 'text-slate-400 hover:text-white'}`}
          >
            Subscription Plans
            {activeTab === 'plans' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('tokens')}
            className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'tokens' ? 'text-accent' : 'text-slate-400 hover:text-white'}`}
          >
            Buy Tokens (Pay As You Go)
            {activeTab === 'tokens' && <div className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-t-full"></div>}
          </button>
        </div>

        {/* Main Content Scrollable */}
        <div className="overflow-y-auto p-6 lg:p-10 bg-base">
          
          {successMsg ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-pop">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Payment Successful</h3>
              <p className="text-emerald-400">{successMsg}</p>
            </div>
          ) : (
            <>
              {/* Payment Method Selector */}
              <div className="mb-8">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Payment Method</p>
                 <div className="flex gap-3">
                   {[
                     { id: 'card', label: 'Card', icon: CreditCard },
                     { id: 'upi', label: 'UPI', icon: Zap },
                     { id: 'netbanking', label: 'Net Banking', icon: Building2 }
                   ].map((m) => (
                     <button 
                       key={m.id}
                       onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                       className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                         selectedMethod === m.id 
                         ? 'border-brand bg-brand/10 text-brand shadow-sm' 
                         : 'border-white/10 bg-surface text-slate-400 hover:border-brand/30 hover:text-white'
                       }`}
                     >
                       <m.icon className="w-4 h-4" /> {m.label}
                     </button>
                   ))}
                 </div>
              </div>

              {activeTab === 'plans' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const isCurrent = currentPlanId === plan.id;
                    const isPro = plan.id.includes('pro');
                    return (
                      <div 
                        key={plan.id}
                        className={`relative bg-surface rounded-3xl p-6 border-2 flex flex-col transition-all duration-300 ${
                          isCurrent ? 'border-emerald-500/50 shadow-lg' : 
                          plan.recommended ? 'border-accent shadow-gold-glow scale-105 z-10' : 'border-transparent shadow-soft hover:shadow-lg hover:border-white/10'
                        }`}
                      >
                        {plan.recommended && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-navy-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                            Most Popular
                          </div>
                        )}
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                          <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-3xl font-display font-bold text-white">{plan.currency}{plan.price}</span>
                            <span className="text-slate-400 text-sm">/{plan.interval}</span>
                          </div>
                        </div>
                        
                        <ul className="space-y-3 mb-8 flex-1">
                          <li className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                            <Coins className="w-4 h-4 text-accent" />
                            {plan.tokens === 'Unlimited' ? 'Unlimited Tokens' : `${plan.tokens} Tokens / month`}
                          </li>
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <button
                          disabled={isCurrent || !!loading}
                          onClick={() => handleSubscribe(plan)}
                          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                            isCurrent 
                            ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/30'
                            : isPro 
                              ? 'bg-accent text-navy-900 hover:bg-yellow-400 shadow-lg'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {loading === plan.id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 
                           isCurrent ? 'Current Plan' : 'Upgrade'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'tokens' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {TOKEN_PACKAGES.map((pkg) => (
                    <div key={pkg.id} className="bg-surface rounded-3xl p-6 border border-white/5 shadow-soft hover:shadow-lg hover:border-accent/30 transition-all group">
                       <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Coins className="w-6 h-6" />
                       </div>
                       <h3 className="text-xl font-bold text-white mb-1">{pkg.tokens} Tokens</h3>
                       <p className="text-slate-400 text-sm mb-6">One-time purchase. Never expires.</p>
                       
                       <div className="flex items-center justify-between mt-auto">
                          <span className="text-2xl font-display font-bold text-white">{pkg.currency}{pkg.price}</span>
                          <button 
                            onClick={() => handleBuyTokens(pkg)}
                            disabled={!!loading}
                            className="bg-accent text-navy-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-400 hover:shadow-lg transition-all disabled:opacity-50"
                          >
                             {loading === pkg.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buy Now'}
                          </button>
                       </div>
                    </div>
                  ))}
                  
                  {/* Trust Badge */}
                  <div className="md:col-span-3 mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                     <ShieldCheck className="w-4 h-4 text-emerald-500" />
                     <span>Secure Payment processed via Stripe/Razorpay. PCI-DSS Compliant.</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
