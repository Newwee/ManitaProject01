const STORAGE_KEY = 'manita_user_preferences_v1';

export const DEFAULT_PREFERENCES = {
  version: 1,
  appearance: {
    theme: 'system',
    visualEffects: false,
    glassSurface: false
  },
  background: {
    style: 'original',
    intensity: 70,
    speed: 1,
    opacity: 60
  },
  animation: {
    intensity: 'normal',
    clickSpark: false,
    blurText: true,
    fadeContent: true,
    starBorder: false
  },
  notifications: {
    enabled: true,
    quietMode: true,
    duration: 4000
  }
};

export function loadUserPreferences() {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== DEFAULT_PREFERENCES.version) {
      return DEFAULT_PREFERENCES;
    }
    return {
      version: DEFAULT_PREFERENCES.version,
      appearance: {
        ...DEFAULT_PREFERENCES.appearance,
        ...(parsed.appearance || {})
      },
      background: {
        ...DEFAULT_PREFERENCES.background,
        ...(parsed.background || {})
      },
      animation: {
        ...DEFAULT_PREFERENCES.animation,
        ...(parsed.animation || {})
      },
      notifications: {
        ...DEFAULT_PREFERENCES.notifications,
        ...(parsed.notifications || {})
      }
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(preferences) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      ...DEFAULT_PREFERENCES,
      ...preferences,
      version: DEFAULT_PREFERENCES.version
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

export function resetUserPreferences() {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return DEFAULT_PREFERENCES;
}
