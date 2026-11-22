import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, X } from 'lucide-react';
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

export default function ChristmasMusicPlayer({ showUI = true }) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(265); // Default Last Christmas duration ~4:25
  const audioRef = useRef(null);

  // Position & Draggable state (null = responsive CSS default position)
  const [position, setPosition] = useState(null);
  const isDraggingRef = useRef(false);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
    currentDx: 0,
    currentDy: 0,
    rafId: null
  });
  const hasMovedRef = useRef(false);
  const cardRef = useRef(null);

  // Keep player inside screen bounds on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        if (!prev || !cardRef.current) return prev;
        const rect = cardRef.current.getBoundingClientRect();
        const maxX = Math.max(8, window.innerWidth - rect.width - 8);
        const maxY = Math.max(8, window.innerHeight - rect.height - 8);
        return {
          x: Math.max(8, Math.min(maxX, prev.x)),
          y: Math.max(8, Math.min(maxY, prev.y))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (!cardRef.current) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;

    const rect = cardRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
      currentDx: 0,
      currentDy: 0,
      rafId: null
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }

    dragRef.current.currentDx = dx;
    dragRef.current.currentDy = dy;

    if (!dragRef.current.rafId) {
      dragRef.current.rafId = requestAnimationFrame(() => {
        if (cardRef.current && isDraggingRef.current) {
          cardRef.current.style.transform = `translate3d(${dragRef.current.currentDx}px, ${dragRef.current.currentDy}px, 0)`;
        }
        dragRef.current.rafId = null;
      });
    }
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (dragRef.current.rafId) {
      cancelAnimationFrame(dragRef.current.rafId);
      dragRef.current.rafId = null;
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (cardRef.current) {
      cardRef.current.style.transform = '';
      if (hasMovedRef.current) {
        const card = cardRef.current;
        const width = card.offsetWidth;
        const height = card.offsetHeight;

        const rawX = dragRef.current.initialLeft + dragRef.current.currentDx;
        const rawY = dragRef.current.initialTop + dragRef.current.currentDy;

        const maxX = Math.max(8, window.innerWidth - width - 8);
        const maxY = Math.max(8, window.innerHeight - height - 8);

        const finalX = Math.min(maxX, Math.max(8, rawX));
        const finalY = Math.min(maxY, Math.max(8, rawY));

        setPosition({ x: finalX, y: finalY });
      }
    }
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

  // Keep audio playing in background, but hide visual UI until intro animation completes
  if (!showUI) return null;

  // If minimized, display sleek floating draggable music pill
  if (!isOpen) {
    return (
      <div
        ref={cardRef}
        style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
        className={`fixed z-40 select-none touch-none ${
          !position ? 'bottom-[max(1rem,env(safe-area-inset-bottom,1rem))] right-3 sm:top-20 sm:right-6 sm:bottom-auto' : ''
        } animate-in fade-in zoom-in-95 duration-500`}
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
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#14121cf0] hover:bg-black/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl transition cursor-grab active:cursor-grabbing group will-change-transform"
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
      className={`fixed z-40 select-none ${
        !position ? 'bottom-[max(1rem,env(safe-area-inset-bottom,1rem))] right-3 sm:top-20 sm:right-6 sm:bottom-auto' : ''
      } animate-in fade-in slide-in-from-bottom-3 sm:slide-in-from-top-3 duration-500 will-change-transform`}
    >
      <div className="w-[calc(100vw-24px)] max-w-[340px] sm:max-w-[370px] bg-[#14121cf0] backdrop-blur-xl text-white rounded-3xl p-3.5 sm:p-5 shadow-2xl border border-white/15 relative">
        {/* Top Drag Handle Bar */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing pb-2 pt-0 select-none touch-none group"
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

        <div className="flex gap-3 items-center">
          {/* Cover Art (also acts as drag area) */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-16 h-16 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/15 relative bg-stone-900 group cursor-grab active:cursor-grabbing touch-none"
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
          <div className="flex-1 min-w-0 pr-3 sm:pr-4">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5 pointer-events-none">
                <Music className="w-3 h-3 animate-pulse" />
                <span>🎄 Christmas Soundtrack</span>
              </div>
              <h4 className="font-theme-display text-sm sm:text-base font-bold text-white truncate leading-snug pointer-events-none">
                Last Christmas
              </h4>
              <p className="text-[11px] sm:text-xs text-white/60 truncate mb-2 pointer-events-none">
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
        <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 sm:gap-3">
          {/* Transport buttons */}
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 sm:gap-2 shrink-0"
          >
            <button
              onClick={() => handleSeek(0)}
              className="p-1 sm:p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition"
              title="เริ่มเล่นเพลงใหม่ตั้งแต่ต้น"
            >
              <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 active:scale-90 transition"
              title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นเพลง Last Christmas'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => handleSeek(Math.min(duration, currentTime + 15))}
              className="p-1 sm:p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition"
              title="ข้ามไปข้างหน้า 15 วินาที"
            >
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Elastic Slider Volume Control */}
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 flex justify-end"
          >
            <ElasticSlider
              defaultValue={50}
              leftIcon={<HugeiconsIcon icon={VolumeLowIcon} size={18} />}
              rightIcon={<HugeiconsIcon icon={VolumeHighIcon} size={18} />}
              onChange={handleVolumeChange}
              maxStretch={35}
              bounce={0.5}
              growOnHover
              wheel={false}
              orientation="horizontal"
              iconPlacement="outside"
              valuePosition="top"
              thickness={5}
              activeThickness={10}
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
              className="!w-28 sm:!w-36 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
