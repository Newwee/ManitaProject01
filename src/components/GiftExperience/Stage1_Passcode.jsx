import React, { useState } from 'react';
import { Lock, Delete, KeyRound, Sparkles } from 'lucide-react';
import { playKeyClick, playUnlockSuccess, playErrorBeep } from '../../lib/soundEngine';
import confetti from 'canvas-confetti';

export default function Stage1_Passcode({
  expectedPasscode = '231069',
  passcodeHint = 'วันครบรอบของเรา (ลองกด 231069)',
  onNextStage
}) {
  const [digits, setDigits] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

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

  return (
    <div className="flex-1 flex flex-col justify-between px-3 py-3 select-none">
      {/* Top Header & Hint */}
      <div className="text-center pt-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2 shadow-sm">
          <KeyRound className="w-6 h-6" />
        </div>
        <h3 className="font-theme-display text-xl font-bold">
          กรอกรหัสผ่าน 6 หลัก
        </h3>
        <p className="text-xs opacity-75 mt-1 max-w-xs mx-auto">
          {passcodeHint}
        </p>

        {/* 6 Passcode Indicator Boxes */}
        <div
          className={`grid grid-cols-6 gap-2 my-4 max-w-[280px] mx-auto ${
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
                    : 'border-stone-300 bg-white/60 text-stone-300'
                }`}
              >
                {hasDigit ? '●' : ''}
              </div>
            );
          })}
        </div>

        {/* Status / Feedback message */}
        <div className="h-5 text-xs font-bold text-center">
          {feedbackMsg && (
            <span className={isSuccess ? 'text-emerald-600' : 'text-rose-600'}>
              {feedbackMsg}
            </span>
          )}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto w-full pb-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="h-12 rounded-2xl bg-white/80 hover:bg-white text-stone-800 font-bold text-lg shadow-sm border border-stone-200 active:scale-95 transition"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-500 font-semibold text-xs active:scale-95 transition"
        >
          ล้าง
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="h-12 rounded-2xl bg-white/80 hover:bg-white text-stone-800 font-bold text-lg shadow-sm border border-stone-200 active:scale-95 transition"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center active:scale-95 transition"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
