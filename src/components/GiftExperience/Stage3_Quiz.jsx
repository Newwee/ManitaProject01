import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Trophy, ChevronRight } from 'lucide-react';
import { playTone, playSuccessFanfare, playErrorBeep } from '../../lib/soundEngine';
import confetti from 'canvas-confetti';
import { DEFAULT_QUIZZES } from '../../types/themePresets';

export default function Stage3_Quiz({
  quizzes = DEFAULT_QUIZZES,
  revealType = 'scratch',
  onNextStage
}) {
  const activeQuizzes = quizzes && quizzes.length > 0 ? quizzes : DEFAULT_QUIZZES;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = activeQuizzes[currentIdx];

  const handlePickAnswer = (choiceIdx) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(choiceIdx);

    const isCorrect = choiceIdx === currentQ.correctIndex;

    if (isCorrect) {
      setScore((s) => s + 1);
      playTone(784, 0.25, 'triangle', 0.15); // G5
    } else {
      playErrorBeep();
    }

    // Advance to next question or complete
    setTimeout(() => {
      if (currentIdx + 1 < activeQuizzes.length) {
        setCurrentIdx((i) => i + 1);
        setIsAnswered(false);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
        playSuccessFanfare();
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 900);
  };

  if (isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center select-none">
        <div className="theme-card p-6 w-full max-w-xs text-center shadow-xl border-2">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-3xl shadow-inner animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="font-theme-display text-2xl font-bold mb-1">
            ตอบถูก {score} / {activeQuizzes.length} ข้อ!
          </h3>
          <p className="text-xs opacity-80 mb-6 leading-relaxed">
            {score === activeQuizzes.length
              ? 'เก่งมากกก! ความทรงจำระหว่างเราชัดเจนเสมอเลยนะ ✨'
              : revealType === 'camera'
                ? 'เก่งมากแล้ว! ความทรงจำดีๆ ยังมีอีกเพียบ ไปเปิดกล้องถ่ายรูปกันต่อเลย 📸'
                : 'เก่งมากแล้ว! ความทรงจำดีๆ ยังมีอีกเพียบ ไปลุ้นการ์ดลับกันต่อเลย 🎉'}
          </p>

          <button
            onClick={onNextStage}
            className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>
              {revealType === 'camera'
                ? 'ไปด่านถัดไป: ถ่ายรูปกล้องความทรงจำ 📸'
                : 'ไปด่านถัดไป: ขูดการ์ดลุ้นรางวัลลับ 🪙'}
            </span>
            <ChevronRight className="w-4 h-4 text-rose-300" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-3 py-2 select-none">
      <div className="theme-card p-5 max-w-sm mx-auto w-full shadow-lg border-2">
        {/* Step text */}
        <div className="flex items-center justify-between text-xs font-bold opacity-60 mb-2">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Mini Quiz ทายใจ</span>
          </span>
          <span>
            ข้อ {currentIdx + 1} จาก {activeQuizzes.length}
          </span>
        </div>

        {/* Question Title */}
        <h3 className="font-theme-display text-lg font-bold text-center my-4 leading-snug text-stone-800">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-2.5 my-4">
          {currentQ.options.map((option, idx) => {
            let btnStyle = 'bg-white/80 border-stone-200 text-stone-800 hover:border-rose-400';

            if (isAnswered) {
              if (idx === currentQ.correctIndex) {
                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm';
              } else if (idx === selectedAnswer) {
                btnStyle = 'bg-rose-50 border-rose-500 text-rose-700';
              } else {
                btnStyle = 'opacity-50 border-stone-200 text-stone-400';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handlePickAnswer(idx)}
                className={`w-full p-3 rounded-2xl border-2 text-xs font-semibold text-left transition flex items-center justify-between active:scale-[0.98] ${btnStyle}`}
              >
                <span>{option}</span>
                {isAnswered && idx === currentQ.correctIndex && (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                {isAnswered && idx === selectedAnswer && idx !== currentQ.correctIndex && (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Live helper feedback */}
        <div className="text-center text-xs font-bold min-h-[18px]">
          {isAnswered && (
            <span
              className={
                selectedAnswer === currentQ.correctIndex ? 'text-emerald-600' : 'text-rose-600'
              }
            >
              {selectedAnswer === currentQ.correctIndex
                ? 'ถูกต้องนะคร้าบบบ! 🎉'
                : 'อุ๊ย ผิดนิดเดียว ไม่เป็นไรนะ! 😊'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
