import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, X } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { VolumeHighIcon, VolumeLowIcon } from '@hugeicons/core-free-icons';
import ElasticSlider from './ElasticSlider';
import { isAudioPlaying, toggleMusic, setMusicVolume } from '../../lib/soundEngine';

export default function MusicPlayerCard({
  isOpen,
  onClose,
  themeKey = 'scrapbook',
  presetCategory = 'chat_scratch',
  isMusicPlaying = false,
  onToggleMusic,
  isDarkMode = false
}) {
  const [volume, setVolume] = useState(70);
  const [trackProgress, setTrackProgress] = useState(28);

  // Compute active song metadata based on Preset and Theme
  const getSongMeta = () => {
    if (presetCategory === 'christmas_tree' || presetCategory === 'ascii_christmas' || themeKey === 'festive') {
      return {
        title: 'Last Christmas',
        artist: 'Wham! / Festive Tree - MANITA',
        cover: '/assets/Background.jpg'
      };
    }
    if (presetCategory === 'arrow_birthday') {
      return {
        title: 'Happy Birthday',
        artist: 'MANITA Celebrations',
        cover: '/assets/PhotoBG.jpg'
      };
    }
    const themeMap = {
      scrapbook: {
        title: 'Warm Memories',
        artist: 'MANITA Acoustic',
        cover: '/assets/Background.jpg'
      },
      y2k: {
        title: 'Pixel Nostalgia',
        artist: 'MANITA Chiptune',
        cover: '/assets/ChatBG.jpg'
      },
      cinema: {
        title: 'Midnight Serenade',
        artist: 'MANITA Cinematic',
        cover: '/assets/PhotoBG.jpg'
      },
      festive: {
        title: 'Last Christmas',
        artist: 'Wham! / Festive Tree - MANITA',
        cover: '/assets/Background.jpg'
      }
    };
    return themeMap[themeKey] || themeMap.scrapbook;
  };

  const songMeta = getSongMeta();

  useEffect(() => {
    let interval;
    if (isMusicPlaying) {
      interval = setInterval(() => {
        setTrackProgress(prev => (prev >= 180 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMusicPlaying]);

  if (!isOpen) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="w-[340px] sm:w-[380px] bg-[#1a1823]/95 backdrop-blur-xl text-white rounded-3xl p-5 shadow-2xl border border-white/10 relative select-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
          aria-label="Close music player"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-4 items-center">
          {/* Cover Art */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/10 relative group bg-stone-800">
            <img
              src={songMeta.cover}
              alt={songMeta.title}
              className={`w-full h-full object-cover transition duration-700 ${
                isMusicPlaying ? 'scale-105' : 'grayscale-[20%]'
              }`}
            />
            {isMusicPlaying && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              </div>
            )}
          </div>

          {/* Track Info & Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-medium text-rose-400 uppercase tracking-wider mb-0.5">
              <Music className="w-3 h-3" />
              <span>Now Playing</span>
            </div>
            <h4 className="font-theme-display text-base sm:text-lg font-bold text-white truncate leading-snug">
              {songMeta.title}
            </h4>
            <p className="text-xs text-white/60 truncate mb-3">
              {songMeta.artist}
            </p>

            {/* Simulated Track Timeline */}
            <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden mb-1">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (trackProgress / 180) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/50 font-mono">
              <span>{formatTime(trackProgress)}</span>
              <span>-3:08</span>
            </div>
          </div>
        </div>

        {/* Bottom Playback Controls & Elastic Slider */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          {/* Transport buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setTrackProgress(0)}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition"
              title="เริ่มใหม่"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMusic}
              className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 active:scale-90 transition"
              title={isMusicPlaying ? 'พักเพลง' : 'เล่นเพลง'}
            >
              {isMusicPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => setTrackProgress(prev => Math.min(180, prev + 15))}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition"
              title="ข้ามไปข้างหน้า"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Elastic Slider Volume Control */}
          <div className="flex-1 flex justify-end">
            <ElasticSlider
              value={volume}
              defaultValue={70}
              startingValue={0}
              maxValue={100}
              thickness={5}
              activeThickness={9}
              className="!w-32 sm:!w-36 text-white"
              trackColor="rgba(255, 255, 255, 0.18)"
              rangeColor="#f43f5e"
              thumbColor="#ffffff"
              thumb={false}
              leftIcon={<HugeiconsIcon icon={VolumeLowIcon} size={16} />}
              rightIcon={<HugeiconsIcon icon={VolumeHighIcon} size={16} />}
              onChange={(val) => {
                setVolume(val);
                setMusicVolume(val);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
