/**
 * MANITA Studio - Supabase Client & Database Services
 * Handles saving and loading customized digital gifts.
 */
import { createClient } from '@supabase/supabase-js';

// Default to working live Supabase instance with public manita_gifts table
const FALLBACK_URL = 'https://nbmjzhhvpksbxvqcxjpn.supabase.co';
const FALLBACK_KEY = 'sb_publishable_FPgzJvV7lu8WDqLoQs0c0g_zwAEuVdF';

const getStoredSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('manita_supabase_url') || '';
  }
  return '';
};

export const getSupabaseUrl = () => {
  return import.meta.env.VITE_SUPABASE_URL || getStoredSupabaseUrl() || FALLBACK_URL;
};

export const getSupabaseAnonKey = () => {
  // If user provided custom key in env, use it; otherwise use working fallback
  const customKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (customKey && customKey !== 'sb_publishable_your_key_here') {
    return customKey;
  }
  return FALLBACK_KEY;
};

export const setStoredSupabaseUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (url) {
      localStorage.setItem('manita_supabase_url', url.trim());
    } else {
      localStorage.removeItem('manita_supabase_url');
    }
  }
};

export const isSupabaseConfigured = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(url && url.startsWith('http') && key);
};

export const getSupabaseClient = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (url && url.startsWith('http') && key) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
};

/**
 * Save a digital gift configuration to Supabase
 */
export async function saveGiftToSupabase(giftId, giftData) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured');
  }

  const payload = {
    id: giftId,
    title: giftData.introTitle || giftData.treeTitle || giftData.arrowTitle || 'MANITA Digital Gift',
    theme: giftData.theme || 'scrapbook',
    config: giftData,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
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
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
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
