/**
 * MANITA Studio - Audio Synthesizer & Sound Effects
 * Uses standard Web Audio API (zero external audio files needed)
 */
import { THEME_PRESETS } from '../types/themePresets';

let audioCtx = null;
let musicInterval = null;
let isMusicPlaying = false;
let currentNoteIndex = 0;
let currentAudioEl = null;
let currentVolume = 0.7;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMusicVolume(val) {
  currentVolume = Math.max(0, Math.min(1, Number(val) / 100));
  if (currentAudioEl) {
    try {
      currentAudioEl.volume = currentVolume;
    } catch (e) {}
  }
}

export function playTone(freq = 440, duration = 1.0, type = 'sine', gainVal = 0.12) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.debug('Audio playback note ignored:', e);
  }
}

export function playChime() {
  playTone(523.25, 0.4, 'triangle', 0.15); // C5
  setTimeout(() => playTone(659.25, 0.5, 'triangle', 0.15), 100); // E5
  setTimeout(() => playTone(783.99, 0.8, 'triangle', 0.15), 200); // G5
  setTimeout(() => playTone(1046.50, 1.2, 'triangle', 0.18), 300); // C6
}

export function playKeyClick() {
  playTone(800, 0.05, 'sine', 0.08);
}

export function playUnlockSuccess() {
  playTone(440, 0.2, 'triangle', 0.15);
  setTimeout(() => playTone(554.37, 0.2, 'triangle', 0.15), 120);
  setTimeout(() => playTone(659.25, 0.5, 'triangle', 0.18), 240);
  setTimeout(() => playTone(880.00, 0.8, 'triangle', 0.2), 360);
}

export function playErrorBeep() {
  playTone(180, 0.25, 'sawtooth', 0.12);
  setTimeout(() => playTone(140, 0.3, 'sawtooth', 0.12), 150);
}

export function playScratchSound() {
  // Soft high pitch scratch feedback
  const rndFreq = 600 + Math.random() * 400;
  playTone(rndFreq, 0.05, 'triangle', 0.04);
}

export function playSuccessFanfare() {
  playTone(523.25, 0.2, 'sine', 0.15);
  setTimeout(() => playTone(659.25, 0.2, 'sine', 0.15), 150);
  setTimeout(() => playTone(783.99, 0.3, 'sine', 0.18), 300);
  setTimeout(() => playTone(1046.50, 0.8, 'sine', 0.2), 450);
}

export function isAudioPlaying() {
  return isMusicPlaying;
}

export function toggleMusic(themeKey = 'scrapbook', onStateChange, presetCategory = 'chat_scratch') {
  if (isMusicPlaying) {
    stopMusic();
    if (onStateChange) onStateChange(false);
    return false;
  } else {
    startMusic(themeKey, presetCategory);
    if (onStateChange) onStateChange(true);
    return true;
  }
}

export function startMusic(themeKey = 'scrapbook', presetCategory = 'chat_scratch') {
  stopMusic();

  const isChristmas = presetCategory === 'christmas_tree' || themeKey === 'festive';
  if (isChristmas) {
    try {
      currentAudioEl = new Audio('/assets/Music/LastChristmas.mp3');
      currentAudioEl.loop = true;
      currentAudioEl.volume = currentVolume;
      currentAudioEl.play().catch(e => {
        console.debug('Last Christmas playback pending user interaction:', e);
      });
      isMusicPlaying = true;
      return;
    } catch (err) {
      console.warn('Failed to load LastChristmas.mp3, falling back to synthesizer', err);
    }
  }

  getAudioContext();
  const theme = THEME_PRESETS[themeKey] || THEME_PRESETS.scrapbook;
  const notes = theme.notes || [261.63, 329.63, 392.00, 493.88];

  isMusicPlaying = true;
  currentNoteIndex = 0;

  // Play immediately
  playTone(notes[0], 1.2, themeKey === 'y2k' ? 'square' : 'sine', 0.1 * currentVolume);

  musicInterval = setInterval(() => {
    currentNoteIndex = (currentNoteIndex + 1) % notes.length;
    const waveType = themeKey === 'y2k' ? 'square' : themeKey === 'cinema' ? 'triangle' : 'sine';
    const volume = (themeKey === 'y2k' ? 0.05 : 0.1) * currentVolume;
    playTone(notes[currentNoteIndex], 1.1, waveType, volume);
  }, 1000);
}

export function stopMusic() {
  if (currentAudioEl) {
    try {
      currentAudioEl.pause();
      currentAudioEl.currentTime = 0;
    } catch (e) {}
    currentAudioEl = null;
  }
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  isMusicPlaying = false;
}
