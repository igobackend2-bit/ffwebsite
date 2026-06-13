'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, ArrowRight, Leaf, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const SegmentedOTP = ({ value, onChange, length = 6, disabled = false }: {
  value: string; onChange: (v: string) => void; length?: number; disabled?: boolean;
}) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = value.split(''); arr[i] = v;
    onChange(arr.join(''));
    if (v && i < length - 1) inputs.current[i + 1]?.focus();
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) inputs.current[i - 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (d) { onChange(d.padEnd(length, '').slice(0, length)); inputs.current[Math.min(d.length, length - 1)]?.focus(); }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={el => { inputs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ''} onChange={e => handleInput(e, i)} onKeyDown={e => handleKeyDown(e, i)}
          disabled={disabled}
          className="w-10 h-12 bg-white/10 border border-white/20 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      ))}
    </div>
  );
};

interface AuthModalProps { isOpen: boolean; onClose: () => void; }

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [step, setStep] = useState<'initial' | 'otp' | 'details'>('initial');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const formattedPhone = () => {
    const d = phone.replace(/\D/g, '');
    return d.startsWith('91') ? `+${d}` : `+91${d}`;
  };

  const handleSendOTP = async () => {
    if (phone.replace(/\D/g, '').length < 10) { toast.error('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone() });
      if (error) throw error;
      setStep('otp'); setResendTimer(30);
      toast.success('OTP sent to your mobile!');
    } catch (e: unknown) { toast.error((e as Error).message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone(), token: otp, type: 'sms' });
      if (error) throw error;
      if (mode === 'login') { toast.success('Welcome back!'); onClose(); }
      else { setStep('details'); toast.success('Phone verified!'); }
    } catch (e: unknown) { toast.error((e as Error).message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error('Please enter your name'); return; }
    setLoading(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: fullName.trim(), phone } });
      if (password) await supabase.auth.updateUser({ password });
      try { await supabase.from('leads').insert({ name: fullName.trim(), phone, source: 'User Signup' }); } catch { /**/ }
      toast.success('Welcome to Farmers Factory!');
      onClose();
    } catch (e: unknown) { toast.error((e as Error).message || 'Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
            <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={24} /></button>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"><Leaf size={24} className="text-white" /></div>
              <span className="text-xl font-black tracking-tighter">FARMERS FACTORY</span>
            </div>
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">{mode === 'login' ? 'Welcome Back' : 'Join the Farm'}</h2>
              <p className="text-white/40 text-sm">Enter your mobile number to get OTP.</p>
            </div>
            {step === 'initial' && (
              <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
                {(['login', 'signup'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white/10 text-white' : 'text-white/30'}`}>
                    {m === 'login' ? 'Login' : 'Join'}
                  </button>
                ))}
              </div>
            )}
            <AnimatePresence mode="wait">
              {step === 'initial' && (
                <motion.div key="initial" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Mobile Number</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-5 text-white/50 font-bold text-sm select-none">+91</span>
                      <input type="tel" inputMode="numeric" maxLength={10}
                        value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        placeholder="98765 43210"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold placeholder:text-white/20 text-white transition-all" />
                    </div>
                  </div>
                  <button onClick={handleSendOTP} disabled={loading}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50">
                    {loading ? 'Sending...' : 'Send OTP'} {!loading && <ArrowRight size={18} />}
                  </button>
                </motion.div>
              )}
              {step === 'otp' && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Verify Mobile</h3>
                    <p className="text-white/40 text-sm">OTP sent to <span className="text-white font-bold">+91 {phone}</span></p>
                    <button onClick={() => { setStep('initial'); setOtp(''); }} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1 mx-auto">
                      <ArrowLeft size={12} /> Change Number
                    </button>
                  </div>
                  <SegmentedOTP value={otp} onChange={setOtp} disabled={loading} />
                  <div className="space-y-3">
                    <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button onClick={handleSendOTP} disabled={resendTimer > 0 || loading}
                      className={`w-full text-[10px] font-black uppercase tracking-widest transition-colors ${resendTimer > 0 ? 'text-white/20' : 'text-white/60 hover:text-white'}`}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </motion.div>
              )}
              {step === 'details' && (
                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-4">
                    <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">Verified!</h3>
                    <p className="text-white/40 text-sm">Complete your profile.</p>
                  </div>
                  <form onSubmit={handleCompleteSignup} className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your Full Name" required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold text-white" />
                    </div>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create Password (optional)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold text-white" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full bg-[#E75129] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#ff613b] transition-all disabled:opacity-50">
                      {loading ? 'Saving...' : 'Complete Registration'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
