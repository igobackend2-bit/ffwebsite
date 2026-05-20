'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, ArrowRight, Sparkles, Leaf, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

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
    const pastedData = e.clipboardData.getData('text').trim().slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;
    
    // Distribute pasted characters to the input fields
    const newChars = pastedData.split('');
    const currentChars = value.split('');
    newChars.forEach((char, i) => {
      currentChars[i] = char;
    });
    
    onChange(currentChars.join('').slice(0, length));
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputs.current[nextIndex]?.focus();
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
          className="w-10 h-12 bg-white/10 border border-white/20 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      ))}
    </div>
  );
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [step, setStep] = useState<'initial' | 'otp' | 'details'>('initial');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer for Resend OTP
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // --- Handlers ---

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      if (error) throw error;
      
      setStep('otp');
      setResendTimer(30);
      toast.success('Verification code sent to your email!');

      // Also send a simulated "Inbox" notification for CX
      import('@/lib/notifications').then(({ sendCXNotification }) => {
        // We don't have the user ID yet as they are not logged in, 
        // so we can't save to DB notifications table easily without an ID.
        // But for logged-in users or specific flows, we would.
        console.log('OTP Notification triggered');
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: 'email'
      });
      if (error) throw error;

      if (mode === 'login') {
        toast.success('Welcome back!');
        onClose();
      } else {
        setStep('details');
        toast.success('Email verified!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    handleSendOTP();
  };

  const handleChangeEmail = () => {
    setStep('initial');
    setOtp('');
  };

  const openEmailProvider = (provider: 'gmail' | 'outlook') => {
    const urls = {
      gmail: 'https://mail.google.com',
      outlook: 'https://outlook.live.com'
    };
    window.open(urls[provider], '_blank');
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !password) {
      toast.error('Please fill in all fields');
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

      // Save as lead for admin visibility
      try {
        await supabase.from('leads').insert({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          source: 'User Signup'
        });
      } catch (e) {
        console.error('Failed to save signup lead:', e);
      }

      toast.success('Welcome to the Farm!');
      onClose();
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

      toast.success('Logged in successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // --- UI Parts ---

  const renderInitial = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Email Address</label>
        <div className="relative group">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-bold placeholder:text-white/20 text-white"
          />
        </div>
      </div>

      {mode === 'login' && (
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-bold placeholder:text-white/20 text-white"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={handleSendOTP}
        disabled={loading}
        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all transform active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Processing...' : (mode === 'login' ? 'Continue with OTP' : 'Send Code')}
        {!loading && <ArrowRight size={18} />}
      </button>

      {mode === 'login' && (
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
            <span className="bg-[#0A0A0A] px-4 text-white/20">or securely</span>
          </div>
        </div>
      )}

      {mode === 'login' && (
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
        >
          Login with Password
        </button>
      )}
    </motion.div>
  );

  const renderOTP = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold">Verify email</h3>
        <p className="text-white/40 text-sm">Code sent to <span className="text-white">{email}</span></p>
        <button 
          onClick={handleChangeEmail}
          className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
        >
          Change Email Address
        </button>
      </div>

      <SegmentedOTP value={otp} onChange={setOtp} disabled={loading} />

      <div className="space-y-4">
        <button 
          onClick={() => handleVerifyOTP()}
          disabled={loading || otp.length < 6}
          className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="flex items-center justify-between px-2">
          <button 
            onClick={handleResendOTP}
            disabled={resendTimer > 0 || loading}
            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${resendTimer > 0 ? 'text-white/20' : 'text-white/60 hover:text-white'}`}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
          
          <div className="flex gap-4">
            <button onClick={() => openEmailProvider('gmail')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Gmail</button>
            <button onClick={() => openEmailProvider('outlook')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Outlook</button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Check your spam folder if code is not visible</p>
      </div>
    </motion.div>
  );

  const renderDetails = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-1 mb-6">
        <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
        <h3 className="text-xl font-bold">Verified!</h3>
        <p className="text-white/40 text-sm">Let's finish your profile.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Name"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold text-white"
          />
          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold text-white"
          />
        </div>
        <div className="relative group">
          <input 
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create Password"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold text-white"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button 
        onClick={handleCompleteSignup}
        disabled={loading}
        className="w-full bg-[#E75129] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#ff613b] transition-all"
      >
        {loading ? 'Creating...' : 'Register'}
      </button>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <Leaf size={24} />
              </div>
              <span className="text-xl font-black tracking-tighter">FARMERS FACTORY</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">
                {mode === 'login' ? 'Welcome Back' : 'Join the Farm'}
              </h2>
              <p className="text-white/40 text-sm font-medium">
                {step === 'initial' ? 'Secure access to your organic account.' : 'Complete your registration.'}
              </p>
            </div>

            {step === 'initial' && (
              <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
                <button 
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white/10 text-white' : 'text-white/30'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white/10 text-white' : 'text-white/30'}`}
                >
                  Join
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 'initial' && renderInitial()}
              {step === 'otp' && renderOTP()}
              {step === 'details' && renderDetails()}
            </AnimatePresence>

            <p className="mt-10 text-center text-[9px] font-bold text-white/10 uppercase tracking-[0.4em]">
              Secure Farm Access Protocol
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
