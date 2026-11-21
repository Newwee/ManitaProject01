/**
 * MANITA Studio - Hybrid Gift Storage Manager
 * Combines Supabase Cloud (Primary & Resilient Backup), URL Hash fragment, and LocalStorage.
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
 */
export function prepareCompactConfig(config) {
  const compact = { ...config };
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
 * Always produces a clean short URL (?gift={id}) saved to Cloud + LocalStorage
 * This guarantees a high-contrast, low-density QR code that scans instantly.
 */
export async function createShareableGift(giftId, config) {
  let isSavedToCloud = false;
  let saveTarget = 'backup_project';

  // 1. Save full config to local browser storage as instant local cache
  try {
    localStorage.setItem('manita_gift_' + giftId, JSON.stringify(config));
  } catch (e) {
    console.warn('LocalStorage gift save warning:', e);
  }

  // 2. Save full config to Supabase Cloud
  try {
    const saveRes = await saveGiftToSupabase(giftId, config);
    isSavedToCloud = true;
    saveTarget = saveRes.target || 'backup_project';
  } catch (err) {
    console.warn('Could not save to Supabase cloud:', err);
  }

  const baseUrl = window.location.origin + window.location.pathname;

  return {
    giftId,
    url: `${baseUrl}?gift=${giftId}`,
    method: isSavedToCloud ? saveTarget : 'local_storage',
    isCloudSaved: isSavedToCloud
  };
}

/**
 * Resolves gift configuration from URL:
 * Checks ?gift={id} (Supabase Cloud + Local Cache) first, then #data={compressed}
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
    // 1. Try Supabase Cloud (checks primary user project then backup project)
    const cloudConfig = await loadGiftFromSupabase(giftId);
    if (cloudConfig) {
      return { config: cloudConfig, source: 'supabase', giftId };
    }

    // 2. Try Local browser cache by gift ID
    try {
      const localGiftRaw = localStorage.getItem('manita_gift_' + giftId);
      if (localGiftRaw) {
        const localConfig = JSON.parse(localGiftRaw);
        return { config: localConfig, source: 'local_storage', giftId };
      }
    } catch (e) {}

    // 3. Try Local draft if on the creator's device
    const draft = loadLocalDraft();
    if (draft) {
      return { config: draft, source: 'local_draft', giftId };
    }
  }

  // Check #data= first (hash), then ?data= (query fallback)
  const dataParam = hashParams.get('data') || searchParams.get('data');
  if (dataParam) {
    const decodedConfig = decodeGiftFromUrlData(dataParam);
    if (decodedConfig) {
      // If photos were missing or marked as placeholder, check local draft
      const draft = loadLocalDraft();
      if (draft && (!decodedConfig.photos || decodedConfig.photos.length === 0 || decodedConfig.photos.some(p => p.isPlaceholder))) {
        decodedConfig.photos = draft.photos;
      }
      return { config: decodedConfig, source: 'url_data', giftId: null };
    }
  }

  return null;
}
