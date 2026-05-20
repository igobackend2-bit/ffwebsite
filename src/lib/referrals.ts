import { supabase } from './supabase';

export async function ensureReferralCode(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single();

  if (!profile?.referral_code) {
    const code = `FF-${userId.slice(0, 6).toUpperCase()}`;
    await supabase
      .from('profiles')
      .update({ referral_code: code })
      .eq('id', userId);
    return code;
  }
  return profile.referral_code;
}

export async function applyReferral(newUserId: string, referralCode: string) {
  // 1. Find referrer
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id, points')
    .eq('referral_code', referralCode)
    .single();

  if (!referrer) return { error: 'Invalid referral code' };
  if (referrer.id === newUserId) return { error: 'Cannot refer yourself' };

  // 2. Log referral
  const { error } = await supabase
    .from('referrals')
    .insert([{
      referrer_id: referrer.id,
      referred_user_id: newUserId,
      status: 'pending',
      reward_points: 100 // Award 100 points
    }]);

  if (error) return { error: 'Referral already applied or failed' };

  return { success: true };
}

export async function completeReferral(referredUserId: string) {
  // Call this when the referred user places their first order
  const { data: referral } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_user_id', referredUserId)
    .eq('status', 'pending')
    .single();

  if (!referral) return;

  // 1. Update referral status
  await supabase
    .from('referrals')
    .update({ status: 'completed' })
    .eq('id', referral.id);

  // 2. Award points to referrer
  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', referral.referrer_id)
    .single();

  await supabase
    .from('profiles')
    .update({ points: (profile?.points || 0) + referral.reward_points })
    .eq('id', referral.referrer_id);
}
