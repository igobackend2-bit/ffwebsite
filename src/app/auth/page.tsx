'use client';

import React, { useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, Mail, ArrowRight, Leaf, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
  const handlePaste = (e: React.ClipboardEvent) => {
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (d) { onChange(d.padEnd(length, '').slice(0, length)); inputs.current[Math.min(d.length, length - 1)]?.focus(); }
  };
  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={el => { inputs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ''} onChange={e => handleInput(e, i)} onKeyDown={e => handleKeyDown(e, i)}
          disabled={disabled}
          className="w-12 h-14 bg-white/10 border border-white/20 rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      ))}
    </div>
  );
};

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  );
  const [step, setStep] = useState<'initial' | 'otp' | 'details'>('initial');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
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
    const d = phone.replace(/\D/g, '');
    if (d.length < 10) { toast.error('Enter a valid 10-digit mobile number'); return; }
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
      if (mode === 'login') { toast.success('Welcome back!'); router.push(redirectPath); }
      else { setStep('details'); toast.success('Phone verified!'); }
    } catch (e: unknown) { toast.error((e as Error).message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error('Please enter your name'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { toast.error('Please enter a valid email address'); return; }
    if (!password || password.length < 6) { toast.error('Please create a password (minimum 6 characters)'); return; }
    setLoading(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: fullName.trim(), phone, email_address: email.trim() } });
      await supabase.auth.updateUser({ password });
      try { await supabase.auth.updateUser({ email: email.trim() }); } catch { /* email confirmation may be pending */ }
      // Save the full profile so the customer can log back in to the SAME account
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (u) await supabase.from('profiles').upsert({ id: u.id, full_name: fullName.trim(), email: email.trim(), phone }, { onConflict: 'id' });
      } catch { /**/ }
      try { await supabase.from('leads').insert({ name: fullName.trim(), email: email.trim(), phone, source: 'User Signup' }); } catch { /**/ }
      toast.success('Welcome to Farmers Factory! 🌿');
      router.push(redirectPath);
    } catch (e: unknown) { toast.error((e as Error).message || 'Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"><Leaf size={22} className="text-white" /></div>
          <div><p className="font-black tracking-tighter text-lg">FARMERS FACTORY</p><p className="text-[10px] text-white/30 uppercase tracking-widest">Premium Organics</p></div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'initial' && (
            <motion.div key="initial" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">
                  {mode === 'login' ? 'Welcome Back' : 'Join the Farm'}
                </h2>
                <p className="text-white/40 text-sm">Enter your mobile number to get OTP</p>
              </div>

              {/* Mode toggle */}
              <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                {(['login', 'signup'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white/10 text-white' : 'text-white/30'}`}>
                    {m === 'login' ? 'Login' : 'Join'}
                  </button>
                ))}
              </div>

              {/* Phone input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Mobile Number</label>
                <div className="relative flex items-center">
                  <span className="absolute left-5 text-white/50 font-bold text-sm select-none">+91</span>
                  <input type="tel" inputMode="numeric" maxLength={10}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    placeholder="98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm font-bold placeholder:text-white/20 text-white transition-all"
                  />
                </div>
              </div>

              <button onClick={handleSendOTP} disabled={loading}
                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? 'Sending...' : 'Send OTP'} {!loading && <ArrowRight size={18} />}
              </button>

              <p className="text-center text-[10px] text-white/20">
                <Link href="/" className="hover:text-white/50 transition-colors">← Back to Store</Link>
              </p>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div>
                <button onClick={() => { setStep('initial'); setOtp(''); }} className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition-colors">
                  <ArrowLeft size={14} /> Change Number
                </button>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">Verify OTP</h2>
                <p className="text-white/40 text-sm">6-digit code sent to <span className="text-white font-bold">+91 {phone}</span></p>
              </div>
              <SegmentedOTP value={otp} onChange={setOtp} disabled={loading} />
              <div className="space-y-3">
                <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <button onClick={handleSendOTP} disabled={resendTimer > 0 || loading}
                  className={`w-full py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${resendTimer > 0 ? 'text-white/20' : 'text-white/50 hover:text-white'}`}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-6">
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">Verified!</h2>
                <p className="text-white/40 text-sm">Complete your profile to continue.</p>
              </div>
              <form onSubmit={handleCompleteSignup} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Your Full Name" required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold text-white" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Your Email Address" required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold text-white" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="tel" value={phone} readOnly
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white/50 cursor-not-allowed" />
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Create Password" required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold text-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#E75129] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#ff613b] transition-all disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="text-white/30">Loading...</div></div>}>
      <AuthContent />
    </Suspense>
  );
}
