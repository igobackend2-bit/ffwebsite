import { supabase } from './supabase';
import { sendLiveEmail } from './email';

export type NotificationType = 'order_status' | 'security' | 'promo' | 'system';

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  emailTemplate?: 'welcome' | 'order_confirmation' | 'order_status_update' | 'security_code';
  emailData?: any;
}

/**
 * sendCXNotification
 * Sends a notification to the website inbox and optionally via email based on user preferences.
 */
export async function sendCXNotification({
  userId,
  title,
  message,
  type,
  link,
  emailTemplate,
  emailData
}: NotificationPayload) {
  try {
    // 1. Create In-App Notification (Website Inbox)
    const { error: notifyError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
        is_read: false
      });

    if (notifyError) console.error('Failed to create in-app notification:', notifyError);

    // 2. Check User Email Preferences & Fallback to public.users for email
    const [profileRes, userRes] = await Promise.all([
      supabase.from('profiles').select('email, email_notifications_enabled').eq('id', userId).single(),
      supabase.from('users').select('email').eq('id', userId).single()
    ]);

    const profile = profileRes.data;
    const userRow = userRes.data;
    const recipientEmail = profile?.email || userRow?.email;

    // 3. Send Email if template provided
    if (recipientEmail && emailTemplate) {
      await sendLiveEmail({
        to: recipientEmail,
        subject: title,
        template: emailTemplate as any,
        data: {
          ...emailData,
          message
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendCXNotification:', error);
    return { success: false, error };
  }
}
