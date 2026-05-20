'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface LoyaltyContextType {
  balance: number;
  addCoins: (amount: number) => void;
  redeemCoins: (amount: number) => boolean;
  referralCode: string;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (user) {
      // Mock initial balance for demo
      const savedBalance = localStorage.getItem(`ff_loyalty_${user.id}`);
      if (savedBalance) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBalance(parseInt(savedBalance));
      } else {
        const initial = 50; // Welcome bonus
        setBalance(initial);
        localStorage.setItem(`ff_loyalty_${user.id}`, initial.toString());
      }
      setReferralCode(`FARM${user.id.substring(0, 5).toUpperCase()}`);
    } else {
      setBalance(0);
      setReferralCode('');
    }
  }, [user]);

  const addCoins = (amount: number) => {
    if (!user) return;
    const newBalance = balance + amount;
    setBalance(newBalance);
    localStorage.setItem(`ff_loyalty_${user.id}`, newBalance.toString());
  };

  const redeemCoins = (amount: number): boolean => {
    if (!user || balance < amount) return false;
    const newBalance = balance - amount;
    setBalance(newBalance);
    localStorage.setItem(`ff_loyalty_${user.id}`, newBalance.toString());
    return true;
  };

  return (
    <LoyaltyContext.Provider value={{ balance, addCoins, redeemCoins, referralCode }}>
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const context = useContext(LoyaltyContext);
  if (context === undefined) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
}
