import { supabase } from './supabase';

export async function uploadProductMedia(file: File, path: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      if (error.message.includes('bucket_not_found') || error.message.includes('not found')) {
        throw new Error('Storage bucket "products" not found. Please create a PUBLIC bucket named "products" in your Supabase dashboard.');
      }
      if (error.message.includes('row-level security') || error.message.includes('policy')) {
        throw new Error('Permission denied. Please add a Storage Policy (RLS) in Supabase to allow uploads to the "products" bucket.');
      }
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
}
