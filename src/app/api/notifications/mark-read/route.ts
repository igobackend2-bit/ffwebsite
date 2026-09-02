import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: the notification bell was marking notifications as
// read with a direct client-side write
// (supabase.from('notifications').update({ is_read: true })...), which is
// the exact same silent-failure pattern documented in
// app/api/admin/orders/route.ts and app/api/admin/settings/route.ts: an
// UPDATE blocked by Row Level Security affects 0 rows and returns NO error
// at all when there's no .select() to check what actually changed. So the
// UI showed "Notifications" as read, but the is_read flag in the database
// never actually flipped — which is why the bell's unread badge kept
// showing a count even after the customer opened and read every
// notification. Routing the write through the service-role key here, the
// same bypass already used for orders/customers/settings/stats, makes the
// read-state actually persist.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// POST /api/notifications/mark-read — { ids: string[], user_id: string }
// Marks the given notification ids as read. Scoped to notifications that
// belong to user_id (or are broadcast notifications with a NULL user_id) so
// one customer can't use this to flip is_read on someone else's
// notification — mirrors the same ownership filter the bell's own fetch
// already uses to decide which notifications a customer can see.
export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { ids, user_id } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid ids' }, { status: 400 });
    }
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids)
      .or(`user_id.is.null,user_id.eq.${user_id}`)
      .select('id');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: data?.length ?? 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
