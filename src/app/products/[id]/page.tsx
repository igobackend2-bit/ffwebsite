// This route now exists purely for backward compatibility: old links and
// bookmarks pointing at /products/<id> get sent to the product's real,
// canonical URL (/vegetables/tomato) with a permanent redirect, so old
// links keep working and search engines consolidate ranking signals onto
// the one real URL instead of treating this as duplicate content.
//
// ProductClient.tsx and layout.tsx in this folder are no longer rendered
// (this page redirects before either would run) but are left in place
// rather than deleted, since deleting files wasn't asked for.
import { notFound, permanentRedirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { productHref } from '@/lib/categorySlug';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

type Params = { id: string };

export default async function LegacyProductRedirect({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('products')
    .select('name, category')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  permanentRedirect(productHref(data.category, data.name));
}
