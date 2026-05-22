'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/context/TranslationContext';

const ADMIN_EMAIL = 'info.thefarmersfactory@gmail.com';

export default function ContactPage() {
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: ADMIN_EMAIL,
          subject: `[Contact Form] ${form.subject} — from ${form.name}`,
          template: 'contact_inquiry',
          data: {
            name: form.name,
            email: form.email,
            subject: form.subject,
            message: form.message,
          },
        }),
      });

      const result = await res.json();

      // Save to Supabase Leads
      try {
        await supabase.from('leads').insert({
          name: form.name,
          email: form.email,
          phone: '', // Contact form doesn't ask for phone right now, could be empty
          source: 'Contact Form',
          message: form.message
        });
      } catch (e) {
        console.error('Failed to save lead:', e);
      }

      if (result.skipped) {
        // SMTP not configured — still thank the user
        toast.success("Message received! We'll respond within 2 hours. 🌱", { duration: 5000 });
        console.warn('[Contact] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in Vercel env.');
      } else if (result.success) {
        toast.success('Message sent! Our team will respond within 2 hours. 🌱', { duration: 5000 });
      } else {
        throw new Error(result.error || 'Failed to send');
      }

      setForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('[Contact] Send failed:', err);
      toast.error('Failed to send message. Please email us directly at info.thefarmersfactory@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-40 pb-24 bg-[#f9f9f7]">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.4em] mb-6">
                  <MessageCircle size={16} />
                  <span>{t('contact.badge')}</span>
                </div>
                <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase leading-[0.85] mb-12">
                  {language === 'en' ? (
                    <>Get in <br /> <span className="text-primary italic font-serif lowercase">Touch</span></>
                  ) : language === 'ta' ? (
                    <>தொடர்பு <br /> <span className="text-primary italic font-serif lowercase">கொள்ளவும்</span></>
                  ) : (
                    <>संपर्क <br /> <span className="text-primary italic font-serif lowercase">करें</span></>
                  )}
                </h1>
                
                <div className="space-y-10">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 shrink-0 bg-white shadow-lg rounded-2xl flex items-center justify-center text-primary border border-border">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('contact.direct_line')}</p>
                      <p className="text-xl font-black text-foreground">+91 89258 78327</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6">
                    <div className="w-14 h-14 shrink-0 bg-white shadow-lg rounded-2xl flex items-center justify-center text-primary border border-border">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('contact.email_support')}</p>
                      <a href="mailto:info.thefarmersfactory@gmail.com" className="text-xl font-black text-foreground hover:text-primary transition-colors">
                        info.thefarmersfactory@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex gap-6">
                    <div className="w-14 h-14 shrink-0 bg-white shadow-lg rounded-2xl flex items-center justify-center text-primary border border-border">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('contact.main_hub')}</p>
                      <p className="text-xl font-black text-foreground">No 17 , Kovalan street, 2nd main road,<br />Uthandi kanathur, Chennai 600119</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-10 md:p-16 border border-border shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles size={120} className="text-primary" />
              </div>
              
              <h3 className="text-2xl font-black uppercase mb-2">{t('contact.send_msg')}</h3>
              <p className="text-sm text-muted-foreground font-medium mb-8">{t('contact.reply_time')}</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('contact.fullname')}</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-4 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('contact.email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-4 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('contact.subject')}</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-4 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none outline-none"
                  >
                    <option value="General Inquiry">{t('contact.subject.general')}</option>
                    <option value="Order Support">{t('contact.subject.order')}</option>
                    <option value="Farmer Partnership">{t('contact.subject.farmer')}</option>
                    <option value="Bulk/Business Orders">{t('contact.subject.bulk')}</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t('contact.message')}</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-4 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none outline-none"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? t('contact.sending') : t('contact.send_btn')}
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
