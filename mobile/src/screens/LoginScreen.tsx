import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Phone, Lock, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ navigation }: any) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : `+91${phone}`,
      });
      if (error) throw error;
      setStep('otp');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.startsWith('+') ? phone : `+91${phone}`,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      navigation.navigate('Home');
    } catch (error: any) {
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1a2e1a" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Lock size={32} color="#2e7d32" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              {step === 'phone' ? 'Enter your phone to continue' : 'Enter the code sent to your phone'}
            </Text>
          </View>

          <View style={styles.form}>
            {step === 'phone' ? (
              <View style={styles.inputContainer}>
                <Phone size={20} color="#556b55" style={styles.inputIcon} />
                <TextInput
                  placeholder="98765 43210"
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="000000"
                  style={[styles.input, styles.otpInput]}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>
            )}

            <TouchableOpacity 
              style={styles.mainBtn} 
              onPress={step === 'phone' ? handleSendOTP : handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.mainBtnText}>
                    {step === 'phone' ? 'Send OTP' : 'Verify & Continue'}
                  </Text>
                  <ArrowRight size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {step === 'otp' && (
              <TouchableOpacity onPress={() => setStep('phone')}>
                <Text style={styles.resendText}>Change Phone Number</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.footerText}>
            By continuing, you agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfb' },
  backBtn: { padding: 20 },
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 70, height: 70, backgroundColor: '#f1f8e9', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a2e1a', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#556b55', textAlign: 'center' },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 20, paddingHorizontal: 15, height: 60, marginBottom: 20 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 18, color: '#1a2e1a' },
  otpInput: { textAlign: 'center', letterSpacing: 10, fontWeight: 'bold' },
  mainBtn: { backgroundColor: '#2e7d32', height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: '#2e7d32', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resendText: { color: '#2e7d32', textAlign: 'center', marginTop: 20, fontWeight: 'bold' },
  footerText: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 'auto', marginBottom: 20 },
});
