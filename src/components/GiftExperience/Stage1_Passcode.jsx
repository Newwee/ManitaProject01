import React, { useState, useEffect, useRef } from 'react';
import { Delete, KeyRound, X } from 'lucide-react';
import { playKeyClick, playUnlockSuccess, playErrorBeep } from '../../lib/soundEngine';
import confetti from 'canvas-confetti';
import BlurText from '../UI/BlurText';

export default function Stage1_Passcode({
  expectedPasscode = '231069',
  passcodeHint = 'วันครบรอบของเรา (ลองกด 231069)',
  postItNotes = [],
  onUpdatePostItNotes,
  onNextStage
}) {
  const [digits, setDigits] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const containerRef = useRef(null);

  // Dragging handler for Post-it notes
  const handleNotePointerDown = (e, noteId) => {
    e.stopPropagation();
    if (!onUpdatePostItNotes || !containerRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const targetNote = postItNotes.find(n => n.id === noteId);
    if (!targetNote) return;

    const initX = targetNote.x || 50;
    const initY = targetNote.y || 20;
    const rect = containerRef.current.getBoundingClientRect();

    const handlePointerMove = (me) => {
      const dx = ((me.clientX - startX) / rect.width) * 100;
      const dy = ((me.clientY - startY) / rect.height) * 100;
      const newX = Math.max(5, Math.min(95, initX + dx));
      const newY = Math.max(5, Math.min(95, initY + dy));

      onUpdatePostItNotes(postItNotes.map(n => 
        n.id === noteId ? { ...n, x: Math.round(newX), y: Math.round(newY) } : n
      ));
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleRemoveNote = (e, noteId) => {
    e.stopPropagation();
    if (onUpdatePostItNotes) {
      onUpdatePostItNotes(postItNotes.filter(n => n.id !== noteId));
    }
  };

  const handleDigit = (d) => {
    if (digits.length >= 6 || isSuccess) return;
    playKeyClick();
    const newDigits = [...digits, d];
    setDigits(newDigits);
    setIsError(false);
    setFeedbackMsg('');

    if (newDigits.length === 6) {
      const entered = newDigits.join('');
      if (entered === expectedPasscode) {
        setIsSuccess(true);
        setFeedbackMsg('🎉 ปลดล็อกถูกต้องแล้ว!');
        playUnlockSuccess();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          onNextStage();
        }, 900);
      } else {
        setIsError(true);
        setFeedbackMsg('❌ รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้งนะ');
        playErrorBeep();
        setTimeout(() => {
          setDigits([]);
          setIsError(false);
        }, 800);
      }
    }
  };

  const handleBackspace = () => {
    if (digits.length > 0) {
      playKeyClick();
      setDigits(digits.slice(0, -1));
      setIsError(false);
      setFeedbackMsg('');
    }
  };

  const handleClear = () => {
    playKeyClick();
    setDigits([]);
    setIsError(false);
    setFeedbackMsg('');
  };

  // Keyboard and Numpad listener for PC
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not intercept if user is typing in form inputs elsewhere
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.code && e.code.startsWith('Numpad') && /^[0-9]$/.test(e.code.replace('Numpad', ''))) {
        e.preventDefault();
        handleDigit(e.code.replace('Numpad', ''));
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [digits, isSuccess, isError, expectedPasscode]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col justify-between px-3 py-3 select-none relative">
      {/* Draggable Post-it Notes on Passcode Screen (Requirement 9) */}
      {postItNotes && postItNotes.map((note) => (
        <div
          key={note.id}
          onPointerDown={(e) => handleNotePointerDown(e, note.id)}
          style={{
            left: `${note.x || 50}%`,
            top: `${note.y || 25}%`,
            transform: `translate(-50%, -50%) rotate(${note.rotation || -2}deg)`,
            backgroundColor: note.color || '#FEF08A',
            touchAction: 'none'
          }}
          className="absolute z-20 cursor-grab active:cursor-grabbing p-3 rounded-xl shadow-lg border border-black/10 max-w-[170px] select-none group transition-transform hover:scale-105"
          title="คลิกค้างแล้วลากเพื่อย้าย Post-it โน้ต"
        >
          {/* Tape clip on top of note */}
          <div className="w-8 h-2.5 bg-white/60 backdrop-blur-xs rounded-xs mx-auto -mt-4 mb-1 border border-white/40 shadow-xs" />
          <p className="font-theme-display text-xs font-bold text-stone-800 leading-snug whitespace-pre-wrap pointer-events-none">
            {note.text}
          </p>
          {onUpdatePostItNotes && (
            <button
              onClick={(e) => handleRemoveNote(e, note.id)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-stone-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
              title="ลบโน้ตนี้"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      ))}

      {/* Top Header & Hint Card */}
      <div className="text-center pt-2 bg-white/70 backdrop-blur-md rounded-3xl p-4 border border-white/60 shadow-md">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100/90 text-rose-600 flex items-center justify-center mb-1.5 shadow-xs">
          <KeyRound className="w-6 h-6" />
        </div>
        <BlurText
          text="กรอกรหัสผ่าน 6 หลัก"
          delay={35}
          animateBy="letters"
          className="font-theme-display text-xl font-bold text-stone-900"
        />
        <p className="text-xs text-stone-600 font-semibold mt-1 max-w-xs mx-auto">
          {passcodeHint}
        </p>

        {/* 6 Passcode Indicator Boxes */}
        <div
          className={`grid grid-cols-6 gap-2 my-3 max-w-[280px] mx-auto ${
            isError ? 'animate-shake' : ''
          }`}
        >
          {Array.from({ length: 6 }).map((_, idx) => {
            const hasDigit = idx < digits.length;
            return (
              <div
                key={idx}
                className={`h-11 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 scale-105'
                    : isError
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : hasDigit
                    ? 'border-stone-800 bg-stone-900 text-white shadow-md'
                    : 'border-stone-300 bg-white/80 text-stone-300'
                }`}
              >
                {hasDigit ? '●' : ''}
              </div>
            );
          })}
        </div>

        {/* Status / Feedback message */}
        <div className="h-4 text-xs font-bold text-center">
          {feedbackMsg && (
            <span className={isSuccess ? 'text-emerald-700' : 'text-rose-600'}>
              {feedbackMsg}
            </span>
          )}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto w-full pb-2 mt-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="h-12 rounded-2xl bg-white/90 hover:bg-white text-stone-900 font-bold text-lg shadow-md border border-stone-200/60 active:scale-95 transition"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="h-12 rounded-2xl bg-white/60 hover:bg-white/80 text-stone-600 font-semibold text-xs active:scale-95 transition"
        >
          ล้าง
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="h-12 rounded-2xl bg-white/90 hover:bg-white text-stone-900 font-bold text-lg shadow-md border border-stone-200/60 active:scale-95 transition"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="h-12 rounded-2xl bg-white/60 hover:bg-white/80 text-stone-800 font-bold flex items-center justify-center active:scale-95 transition"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* PC Keyboard & Numpad Hint */}
      <div className="hidden sm:flex items-center justify-center gap-1.5 text-[11px] text-stone-500 font-medium pb-1 select-none">
        <span>⌨️</span>
        <span>PC: พิมพ์ตัวเลขหรือ Numpad บนคีย์บอร์ดได้ทันที</span>
      </div>
    </div>
  );
}
