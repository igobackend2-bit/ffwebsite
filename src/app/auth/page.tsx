'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Sparkles, Leaf, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/context/TranslationContext';

// --- Components ---

const SegmentedOTP = ({ value, onChange, length = 6, disabled = false }: { value: string, onChange: (val: string) => void, length?: number, disabled?: boolean }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newValue = value.split('');
    newValue[index] = val.slice(-1);
    const combined = newValue.join('');
    onChange(combined);

    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;
    onChange(pastedData);
    inputs.current[pastedData.length - 1]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleInput(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          disabled={disabled}
          className="w-10 h-12 md:w-12 md:h-14 bg-white/10 border border-white/20 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      ))}
    </div>
  );
};

// --- Main Content ---

function AuthContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const redirectPath = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [step, setStep] = useState<'initial' | 'otp' | 'details'>('initial');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  }, []);

  // --- Handlers ---

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin + '/auth',
          shouldCreateUser: true,
        }
      });
      if (error) throw error;
      setStep('otp');
      toast.success(`Verification code sent to ${email.trim()}! Check your inbox and spam folder.`, { duration: 5000 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message?.includes('fetch') || error.message?.includes('network') || error.name === 'TypeError') {
        toast.error('Connection error. The service is temporarily unavailable. Please try again in a moment.', { duration: 6000 });
      } else if (error.message?.includes('rate')) {
        toast.error('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        toast.error(error.message || 'Failed to send code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      // 1. Try as magiclink (for returning users)
      const { error: magicError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: 'magiclink'
      });
      
      if (!magicError) {
        setStep('details');
        toast.success('Email verified!');
        return;
      }

      // 2. Try as signup (for new users)
      const { error: signupError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: 'signup'
      });

      if (signupError) throw signupError;
      
      setStep('details');
      toast.success('Email verified! Let\'s complete your profile.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        }
      });
      if (updateError) throw updateError;

      toast.success('Welcome to the Farm! Redirecting...');
      
      // Send Welcome Email
      import('@/lib/email').then(({ sendWelcomeEmail }) => {
        sendWelcomeEmail(email.trim(), fullName.trim());
      });

      setTimeout(() => {
        toast.dismiss();
        router.push(redirectPath);
        router.refresh();
      }, 1500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (error) throw error;

      toast.success('Welcome back! Redirecting...');
      setTimeout(() => {
        toast.dismiss();
        router.push(redirectPath);
        router.refresh();
      }, 1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message?.includes('fetch') || error.message?.includes('network') || error.name === 'TypeError') {
        toast.error('Connection error. Please check your internet connection and try again.', { duration: 6000 });
      } else if (error.message?.includes('Invalid login')) {
        toast.error('Incorrect email or password. Please check and try again.');
      } else {
        toast.error(error.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInitial = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('auth.email_address')}</label>
        <div className="relative group">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email_placeholder')} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-bold placeholder:text-white/20 text-white" />
        </div>
      </div>
      {mode === 'login' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('auth.password')}</label>
            <Link href="/auth/reset-password" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">{t('auth.forgot')}</Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-bold placeholder:text-white/20 text-white" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      )}
      <button onClick={mode === 'login' ? handleLogin : handleSendOTP} disabled={loading} className="w-full bg-primary text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-primary/20 group">
        {loading ? t('auth.processing') : (mode === 'login' ? t('auth.sign_in') : t('auth.send_code'))}
        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
      </button>
    </motion.div>
  );

  const renderOTP = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary animate-pulse"><Mail size={32} /></div>
        <h3 className="text-xl font-bold">{t('auth.verify_email')}</h3>
        <p className="text-white/40 text-sm">{t('auth.sent_code_desc')} <span className="text-white font-bold">{email}</span></p>
      </div>
      <SegmentedOTP value={otp} onChange={setOtp} disabled={loading} />
      <button onClick={() => handleVerifyOTP()} disabled={loading || otp.length < 6} className="w-full bg-primary text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-primary/20">
        {loading ? t('auth.verifying') : t('auth.verify_btn')}
      </button>
      <button onClick={() => { setStep('initial'); setOtp(''); }} className="w-full text-[10px] font-black text-white/20 hover:text-white/60 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
        <ArrowLeft size={12} /> {t('auth.different_email')}
      </button>
    </motion.div>
  );

  const renderDetails = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500"><CheckCircle2 size={32} /></div>
        <h3 className="text-xl font-bold">{t('auth.success')}</h3>
        <p className="text-white/40 text-sm">{t('auth.setup_profile')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('auth.fullname')}</label>
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-bold placeholder:text-white/20 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('auth.phone')}</label>
          <div className="relative group">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-bold placeholder:text-white/20 text-white" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('auth.create_password')}</label>
        <div className="relative group">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.pwd_placeholder')} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-bold placeholder:text-white/20 text-white" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <button onClick={handleCompleteSignup} disabled={loading} className="w-full bg-[#E75129] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#ff613b] transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-orange-500/20 mt-4 group">
        {loading ? t('auth.creating_acc') : t('auth.complete_reg')}
        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 relative overflow-hidden bg-black font-geist">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center grayscale-[0.2] scale-105 transition-transform duration-[20s] animate-pulse" style={{ backgroundImage: 'url("/auth-bg.png")' }} />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[8px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 font-black uppercase tracking-widest text-[10px] group"><ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />{t('auth.back_to_store')}</Link>
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl overflow-hidden relative group">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-3 group-hover:rotate-0 transition-transform duration-500"><Leaf size={32} /></div>
            <div><span className="text-2xl font-black tracking-tighter text-white block leading-none">FARMERS FACTORY</span><span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Premium Organics</span></div>
          </div>
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/10"><Sparkles size={12} className="text-orange-500" />{step === 'initial' ? t('auth.identity_verification') : step === 'otp' ? t('auth.security_check') : t('auth.profile_completion')}</div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter leading-none text-white">{mode === 'login' ? t('auth.welcome_back') : t('auth.create_account')}</h1>
          </div>
          {step === 'initial' && (
            <div className="flex p-1 bg-white/5 rounded-2xl mb-10 border border-white/5">
              <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/60'}`}>{t('auth.login_tab')}</button>
              <button onClick={() => setMode('signup')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/60'}`}>{t('auth.join_tab')}</button>
            </div>
          )}
          <AnimatePresence mode="wait">
            {step === 'initial' && renderInitial()}
            {step === 'otp' && renderOTP()}
            {step === 'details' && renderDetails()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black" />}>
      <AuthContent />
      <Toaster />
    </Suspense>
  );
}
