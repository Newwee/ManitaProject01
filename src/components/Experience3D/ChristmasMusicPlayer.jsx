import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, X, Volume2, Move } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { VolumeHighIcon, VolumeLowIcon } from '@hugeicons/core-free-icons';
import ElasticSlider from '../UI/ElasticSlider';

// Module-level global singleton to guarantee only ONE Christmas audio element ever plays
let globalChristmasAudio = null;

export function stopChristmasAudio() {
  if (globalChristmasAudio) {
    try {
      globalChristmasAudio.pause();
      globalChristmasAudio.currentTime = 0;
      globalChristmasAudio.removeAttribute('src');
      globalChristmasAudio.load();
    } catch (e) {}
    globalChristmasAudio = null;
  }
}

export default function ChristmasMusicPlayer() {
  const [isOpen, setIsOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(265); // Default Last Christmas duration ~4:25
  const audioRef = useRef(null);

  // Position & Draggable state
  const [position, setPosition] = useState(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const hasMovedRef = useRef(false);
  const cardRef = useRef(null);

  // Set initial default position below countdown timer (top: 130px on desktop, 85px on mobile)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const initialWidth = isMobile ? 330 : 370;
      const defaultX = Math.max(16, window.innerWidth - initialWidth - (isMobile ? 12 : 24));
      const defaultY = isMobile ? 85 : 130;
      setPosition({ x: defaultX, y: defaultY });
    }
  }, []);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;

    const currentPos = position || {
      x: window.innerWidth - 380,
      y: 130
    };

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: currentPos.x,
      posY: currentPos.y
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }

    const card = cardRef.current;
    const width = card ? card.offsetWidth : (isOpen ? 360 : 200);
    const height = card ? card.offsetHeight : (isOpen ? 220 : 50);

    const maxX = Math.max(10, window.innerWidth - width - 10);
    const maxY = Math.max(10, window.innerHeight - height - 10);

    const newX = Math.min(maxX, Math.max(10, dragStartRef.current.posX + dx));
    const newY = Math.min(maxY, Math.max(10, dragStartRef.current.posY + dy));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  // Initialize and auto-play Last Christmas when animation begins
  useEffect(() => {
    stopChristmasAudio();

    const audio = new Audio('/assets/Music/LastChristmas.mp3');
    audio.loop = true;
    audio.volume = volume / 100;
    audioRef.current = audio;
    globalChristmasAudio = audio;

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

    // Try auto-play safely
    let isDisposed = false;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (isDisposed) {
            try {
              audio.pause();
              audio.currentTime = 0;
              audio.removeAttribute('src');
              audio.load();
            } catch (e) {}
            setIsPlaying(false);
          } else {
            setIsPlaying(true);
          }
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }

    return () => {
      isDisposed = true;
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
        audio.load();
      } catch (e) {}
      if (globalChristmasAudio === audio) {
        globalChristmasAudio = null;
      }
    };
  }, []);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
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

  // If minimized, display sleek floating draggable music pill
  if (!isOpen) {
    return (
      <div
        ref={cardRef}
        style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
        className={`fixed z-30 select-none touch-none ${!position ? 'top-28 sm:top-32 right-3 sm:right-6' : ''} animate-in fade-in zoom-in-95 duration-200`}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => {
            if (!hasMovedRef.current) {
              setIsOpen(true);
            }
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-black/85 hover:bg-black/95 backdrop-blur-md border border-white/20 text-white shadow-2xl transition cursor-grab active:cursor-grabbing group"
          title="คลิกเพื่อเปิด หรือลากเพื่อเปลี่ยนตำแหน่ง"
        >
          <div className="w-6 h-6 rounded-full bg-rose-500/80 flex items-center justify-center text-xs pointer-events-none">
            {isPlaying ? (
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            ) : (
              <Music className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          <div className="text-left text-xs pointer-events-none">
            <div className="font-bold text-white flex items-center gap-1.5 leading-tight">
              <span>Last Christmas</span>
              <span className="text-[10px] text-rose-400 font-normal">Wham!</span>
            </div>
            <div className="text-[10px] text-white/60 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePlay();
            }}
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition ml-1"
            title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นเพลง'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
        </div>
      </div>
    );
  }

  // Full Floating Draggable Music Player Card
  return (
    <div
      ref={cardRef}
      style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
      className={`fixed z-30 select-none ${!position ? 'top-28 sm:top-32 right-3 sm:right-6' : ''} animate-in fade-in slide-in-from-top-3 duration-300`}
    >
      <div className="w-[330px] sm:w-[370px] bg-[#14121cf0] backdrop-blur-xl text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/15 relative">
        {/* Top Drag Handle Bar */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing pb-2.5 pt-0.5 select-none touch-none group"
          title="คลิกค้างแล้วลากเพื่อย้ายตำแหน่งเครื่องเล่นเพลง"
        >
          <div className="w-12 h-1 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
        </div>

        {/* Dismiss / Minimize Button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition z-10"
          aria-label="Minimize Christmas music player"
          title="ย่อหน้าต่างเครื่องเล่นเพลง"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-3.5 items-center">
          {/* Cover Art (also acts as drag area) */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/15 relative bg-stone-900 group cursor-grab active:cursor-grabbing touch-none"
          >
            <img
              src="/assets/Background.jpg"
              alt="Last Christmas"
              className={`w-full h-full object-cover pointer-events-none transition duration-700 ${
                isPlaying ? 'scale-105' : 'grayscale-[25%]'
              }`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
              </div>
            )}
          </div>

          {/* Track Info & Progress */}
          <div className="flex-1 min-w-0 pr-4">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5 pointer-events-none">
                <Music className="w-3 h-3 animate-pulse" />
                <span>🎄 Christmas Soundtrack</span>
              </div>
              <h4 className="font-theme-display text-base font-bold text-white truncate leading-snug pointer-events-none">
                Last Christmas
              </h4>
              <p className="text-xs text-white/60 truncate mb-2 pointer-events-none">
                Wham! • Festive Tree Edition
              </p>
            </div>

            {/* Track Timeline */}
            <div
              onPointerDown={(e) => e.stopPropagation()}
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
            <div className="flex justify-between text-[10px] text-white/50 font-mono pointer-events-none">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Transport controls & Elastic Slider */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          {/* Transport buttons */}
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-2 shrink-0"
          >
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

          {/* Elastic Slider Volume Control */}
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 flex justify-end"
          >
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
