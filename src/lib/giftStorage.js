/**
 * MANITA Studio - Hybrid Gift Storage Manager
 * Combines Supabase Cloud, URL Hash fragment (immune to URI_TOO_LONG), and LocalStorage.
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

/**
 * Prepares a compact configuration for URL/QR code standalone sharing
 * (strips large base64 strings so QR code and URL remain compact & scan instantly)
 */
export function prepareCompactConfig(config) {
  const compact = { ...config };

  // If photos contain huge base64 strings, sanitize them for URL/QR
  if (Array.isArray(compact.photos)) {
    compact.photos = compact.photos.map((p) => {
      // If photo is a massive base64, omit data URL for hash to keep QR scannable
      if (p.url && p.url.startsWith('data:') && p.url.length > 500) {
        return { caption: p.caption, isPlaceholder: true };
      }
      return p;
    });
  }

  return compact;
}

export function encodeGiftToUrlData(config) {
  try {
    const compact = prepareCompactConfig(config);
    const json = JSON.stringify(compact);
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
 * - If Supabase is configured: uploads full config to Cloud and returns short link ?gift={id}
 * - If Supabase is not configured: generates a lightweight client-side URL Hash (#data=...)
 *   * Hash fragments are NEVER sent to Vercel/server, completely preventing 414 URI_TOO_LONG!
 */
export async function createShareableGift(giftId, config) {
  let isSavedToCloud = false;

  if (isSupabaseConfigured()) {
    try {
      await saveGiftToSupabase(giftId, config);
      isSavedToCloud = true;
    } catch (err) {
      console.warn('Could not save to Supabase cloud, falling back to URL hash:', err);
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
    // Use URL Hash (#data=) instead of Query Parameter (?data=)
    // RFC 3986: Hash fragments are never sent to the HTTP server,
    // so Vercel will NEVER return 414 URI_TOO_LONG!
    const compressed = encodeGiftToUrlData(config);
    return {
      giftId,
      url: `${baseUrl}#data=${compressed}`,
      method: 'hash_compressed'
    };
  }
}

/**
 * Resolves gift configuration from URL:
 * Checks ?gift={id} (Supabase) first, then #data={compressed} or ?data={compressed}
 */
export async function resolveGiftFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  let giftId = searchParams.get('gift');

  // Also check hash for #gift= or #data=
  let hash = window.location.hash || '';
  if (hash.startsWith('#')) hash = hash.slice(1);
  const hashParams = new URLSearchParams(hash);

  if (!giftId && hashParams.get('gift')) {
    giftId = hashParams.get('gift');
  }

  if (giftId) {
    const cloudConfig = await loadGiftFromSupabase(giftId);
    if (cloudConfig) {
      return { config: cloudConfig, source: 'supabase', giftId };
    }
  }

  // Check #data= first (hash), then ?data= (query fallback)
  const dataParam = hashParams.get('data') || searchParams.get('data');
  if (dataParam) {
    const decodedConfig = decodeGiftFromUrlData(dataParam);
    if (decodedConfig) {
      return { config: decodedConfig, source: 'url_data', giftId: null };
    }
  }

  return null;
}
