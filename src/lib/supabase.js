/**
 * MANITA Studio - Supabase Client & Database Services
 * Handles saving and loading customized digital gifts.
 */
import { createClient } from '@supabase/supabase-js';

// Primary User Supabase Project
export const USER_PROJECT_URL = 'https://xaazsuwbkzplovdwanmm.supabase.co';
export const USER_PROJECT_KEY = 'sb_publishable_Xo74Bbfm9KhDDezjLrLdzg_HPoQqX8s';

// Verified Active Cloud Backup Project (Already has manita_gifts table)
export const BACKUP_PROJECT_URL = 'https://nbmjzhhvpksbxvqcxjpn.supabase.co';
export const BACKUP_PROJECT_KEY = 'sb_publishable_FPgzJvV7lu8WDqLoQs0c0g_zwAEuVdF';

export const MANITA_SQL_SETUP = `-- สร้างตารางสำหรับเก็บของขวัญดิจิทัล MANITA
CREATE TABLE IF NOT EXISTS public.manita_gifts (
  id TEXT PRIMARY KEY,
  title TEXT,
  theme TEXT,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- เปิดใช้งานความปลอดภัย RLS
ALTER TABLE public.manita_gifts ENABLE ROW LEVEL SECURITY;

-- อนุญาตให้อ่านข้อมูลของขวัญได้ผ่านลิงก์
CREATE POLICY "Allow public read manita_gifts"
  ON public.manita_gifts FOR SELECT
  TO public
  USING (true);

-- อนุญาตให้บันทึกของขวัญใหม่ได้
CREATE POLICY "Allow public insert/update manita_gifts"
  ON public.manita_gifts FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);`;

const getStoredSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('manita_supabase_url') || '';
  }
  return '';
};

export const getSupabaseUrl = () => {
  return import.meta.env.VITE_SUPABASE_URL || getStoredSupabaseUrl() || USER_PROJECT_URL;
};

export const getSupabaseAnonKey = () => {
  const customKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (customKey && customKey !== 'sb_publishable_your_key_here') {
    return customKey;
  }
  return USER_PROJECT_KEY;
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
  return true;
};

export const getPrimaryClient = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  try {
    return createClient(url, key);
  } catch (e) {
    console.warn('Primary Supabase client init error:', e);
    return null;
  }
};

export const getBackupClient = () => {
  try {
    return createClient(BACKUP_PROJECT_URL, BACKUP_PROJECT_KEY);
  } catch (e) {
    console.warn('Backup Supabase client init error:', e);
    return null;
  }
};

/**
 * Save a digital gift configuration with automatic cloud fallback
 */
export async function saveGiftToSupabase(giftId, giftData) {
  const payload = {
    id: giftId,
    title: giftData.introTitle || giftData.treeTitle || giftData.arrowTitle || 'MANITA Digital Gift',
    theme: giftData.theme || 'scrapbook',
    config: giftData,
    updated_at: new Date().toISOString()
  };

  // 1. Try User's Primary Project
  const primaryClient = getPrimaryClient();
  if (primaryClient) {
    try {
      const { data, error } = await primaryClient
        .from('manita_gifts')
        .upsert(payload)
        .select();

      if (!error && data) {
        return { data, target: 'user_project', url: getSupabaseUrl() };
      }

      console.warn('User Supabase project save warning:', error?.message);
    } catch (err) {
      console.warn('User Supabase save exception:', err);
    }
  }

  // 2. Automatic Fallback to Active Cloud Project
  const backupClient = getBackupClient();
  if (backupClient) {
    const { data, error } = await backupClient
      .from('manita_gifts')
      .upsert(payload)
      .select();

    if (error) {
      console.error('Backup Supabase save error:', error);
      throw error;
    }

    return { data, target: 'backup_project', url: BACKUP_PROJECT_URL };
  }

  throw new Error('Could not connect to any Supabase instance');
}

/**
 * Load a digital gift configuration by ID (checks primary then backup)
 */
export async function loadGiftFromSupabase(giftId) {
  // 1. Try User's Primary Project
  const primaryClient = getPrimaryClient();
  if (primaryClient) {
    try {
      const { data, error } = await primaryClient
        .from('manita_gifts')
        .select('*')
        .eq('id', giftId)
        .single();

      if (!error && data && data.config) {
        return data.config;
      }
    } catch (e) {}
  }

  // 2. Try Backup Project
  const backupClient = getBackupClient();
  if (backupClient) {
    try {
      const { data, error } = await backupClient
        .from('manita_gifts')
        .select('*')
        .eq('id', giftId)
        .single();

      if (!error && data && data.config) {
        return data.config;
      }
    } catch (e) {}
  }

  return null;
}
