/**
 * MANITA Studio - Supabase Client & Database Services
 * Handles saving and loading customized digital gifts.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Xo74Bbfm9KhDDezjLrLdzg_HPoQqX8s';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey);
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Save a digital gift configuration to Supabase
 */
export async function saveGiftToSupabase(giftId, giftData) {
  if (!supabase) {
    throw new Error('Supabase URL is not configured. Please set VITE_SUPABASE_URL in your environment or use link sharing.');
  }

  const payload = {
    id: giftId,
    title: giftData.introTitle || 'MANITA Digital Gift',
    theme: giftData.theme || 'scrapbook',
    config: giftData,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('manita_gifts')
    .upsert(payload)
    .select();

  if (error) {
    console.error('Supabase save error:', error);
    throw error;
  }

  return data;
}

/**
 * Load a digital gift configuration from Supabase by ID
 */
export async function loadGiftFromSupabase(giftId) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('manita_gifts')
      .select('*')
      .eq('id', giftId)
      .single();

    if (error) {
      console.warn('Supabase load gift warning:', error.message);
      return null;
    }

    return data ? data.config : null;
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return null;
  }
}
