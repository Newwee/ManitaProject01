import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, X, Volume2 } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { VolumeHighIcon, VolumeLowIcon } from '@hugeicons/core-free-icons';
import ElasticSlider from '../UI/ElasticSlider';

export default function ChristmasMusicPlayer() {
  const [isOpen, setIsOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(265); // Default Last Christmas duration ~4:25
  const audioRef = useRef(null);

  // Initialize and auto-play Last Christmas when animation begins
  useEffect(() => {
    const audio = new Audio('/assets/Music/LastChristmas.mp3');
    audio.loop = true;
    audio.volume = volume / 100;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.floor(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    // Try auto-play
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay blocked by browser policy until interaction
          setIsPlaying(false);
        });
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(e => console.warn(e));
    }
  };

  const handleVolumeChange = (newVal) => {
    setVolume(newVal);
    if (audioRef.current) {
      audioRef.current.volume = newVal / 100;
    }
  };

  const handleSeek = (newSecs) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newSecs;
      setCurrentTime(newSecs);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If minimized, display sleek floating music pill
  if (!isOpen) {
    return (
      <div className="absolute top-3 sm:top-5 right-3 sm:right-6 z-30 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-black/80 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white shadow-2xl transition active:scale-95 group"
          title="เปิดแผงควบคุมเพลง Last Christmas"
        >
          <div className="w-6 h-6 rounded-full bg-rose-500/80 flex items-center justify-center text-xs">
            {isPlaying ? (
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            ) : (
              <Music className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          <div className="text-left text-xs">
            <div className="font-bold text-white flex items-center gap-1.5 leading-tight">
              <span>Last Christmas</span>
              <span className="text-[10px] text-rose-400 font-normal">Wham!</span>
            </div>
            <div className="text-[10px] text-white/60 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePlay();
            }}
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition ml-1"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
        </button>
      </div>
    );
  }

  // Full Floating Music Player Card
  return (
    <div className="absolute top-3 sm:top-5 right-3 sm:right-6 z-30 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="w-[330px] sm:w-[370px] bg-[#14121cf0] backdrop-blur-xl text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/15 relative select-none">
        {/* Dismiss / Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
          aria-label="Close Christmas music player"
          title="ปิดหน้าต่างเครื่องเล่นเพลง"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-3.5 items-center">
          {/* Cover Art */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/15 relative bg-stone-900 group">
            <img
              src="/assets/Background.jpg"
              alt="Last Christmas"
              className={`w-full h-full object-cover transition duration-700 ${
                isPlaying ? 'scale-105' : 'grayscale-[25%]'
              }`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
              </div>
            )}
          </div>

          {/* Track Info & Progress */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">
              <Music className="w-3 h-3 animate-pulse" />
              <span>🎄 Christmas Soundtrack</span>
            </div>
            <h4 className="font-theme-display text-base font-bold text-white truncate leading-snug">
              Last Christmas
            </h4>
            <p className="text-xs text-white/60 truncate mb-2.5">
              Wham! • Festive Tree Edition
            </p>

            {/* Track Timeline */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = clickX / rect.width;
                handleSeek(pct * duration);
              }}
              className="w-full bg-white/20 hover:bg-white/30 h-1.5 rounded-full overflow-hidden cursor-pointer transition mb-1"
            >
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-200"
                style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/50 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Transport controls & Elastic Slider */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          {/* Transport buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSeek(0)}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition"
              title="เริ่มเล่นเพลงใหม่ตั้งแต่ต้น"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 active:scale-90 transition"
              title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นเพลง Last Christmas'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => handleSeek(Math.min(duration, currentTime + 15))}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition"
              title="ข้ามไปข้างหน้า 15 วินาที"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Elastic Slider Volume Control with Exact User Props */}
          <div className="flex-1 flex justify-end">
            <ElasticSlider
              defaultValue={50}
              leftIcon={<HugeiconsIcon icon={VolumeLowIcon} size={20} />}
              rightIcon={<HugeiconsIcon icon={VolumeHighIcon} size={20} />}
              onChange={handleVolumeChange}
              maxStretch={50}
              bounce={0.5}
              growOnHover
              wheel={false}
              orientation="horizontal"
              iconPlacement="outside"
              valuePosition="top"
              thickness={6}
              activeThickness={12}
              radius={40}
              restOpacity={0.7}
              fillFrom={0}
              isStepped={false}
              stepSize={10}
              ticks={false}
              thumb={false}
              jumpToClick
              trackColor="rgba(255, 255, 255, 0.2)"
              rangeColor="#f43f5e"
              className="!w-32 sm:!w-36 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
