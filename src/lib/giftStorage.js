/**
 * MANITA Studio - Hybrid Gift Storage Manager
 * Combines Supabase Cloud, URL compression (LZString), and LocalStorage.
 */
import LZString from 'lz-string';
import { isSupabaseConfigured, saveGiftToSupabase, loadGiftFromSupabase } from './supabase';

const DRAFT_STORAGE_KEY = 'manita_studio_draft_v1';

export function saveLocalDraft(config) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Could not save local draft:', e);
  }
}

export function loadLocalDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Could not load local draft:', e);
    return null;
  }
}

export function encodeGiftToUrlData(config) {
  try {
    const json = JSON.stringify(config);
    return LZString.compressToEncodedURIComponent(json);
  } catch (e) {
    console.error('Failed to compress gift data:', e);
    return null;
  }
}

export function decodeGiftFromUrlData(encodedData) {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
    if (!decompressed) return null;
    return JSON.parse(decompressed);
  } catch (e) {
    console.error('Failed to decompress gift data:', e);
    return null;
  }
}

/**
 * Generate a shareable link for a gift:
 * - If Supabase is available: saves to Supabase and returns clean URL ?gift={id}
 * - Also provides full URL data fallback in case recipient opens without database
 */
export async function createShareableGift(giftId, config) {
  let isSavedToCloud = false;

  if (isSupabaseConfigured()) {
    try {
      await saveGiftToSupabase(giftId, config);
      isSavedToCloud = true;
    } catch (err) {
      console.warn('Could not save to Supabase cloud, falling back to URL compression:', err);
    }
  }

  const baseUrl = window.location.origin + window.location.pathname;

  if (isSavedToCloud) {
    return {
      giftId,
      url: `${baseUrl}?gift=${giftId}`,
      method: 'supabase'
    };
  } else {
    // Compress data directly into URL
    const compressed = encodeGiftToUrlData(config);
    return {
      giftId,
      url: `${baseUrl}?data=${compressed}`,
      method: 'url_compressed'
    };
  }
}

/**
 * Resolves gift configuration from URL:
 * Checks ?gift={id} (Supabase) first, then ?data={compressed}
 */
export async function resolveGiftFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const giftId = params.get('gift');
  const dataParam = params.get('data');

  if (giftId) {
    const cloudConfig = await loadGiftFromSupabase(giftId);
    if (cloudConfig) {
      return { config: cloudConfig, source: 'supabase', giftId };
    }
  }

  if (dataParam) {
    const decodedConfig = decodeGiftFromUrlData(dataParam);
    if (decodedConfig) {
      return { config: decodedConfig, source: 'url_data', giftId: null };
    }
  }

  return null;
}
