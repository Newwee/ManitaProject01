import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronRight, CheckCheck, RefreshCw } from 'lucide-react';
import { playTone } from '../../lib/soundEngine';

export default function Stage2_Chat({
  chatName = 'คนพิเศษของเธอ ♡',
  chatAvatar = '🐻',
  chatMessages = [],
  chatMsg1 = 'เธอทำอะไรอยู่ ว่างไหม?',
  chatDialog = [],
  onNextStage
}) {
  // Built-in conversation script support
  const initialBotMsg = chatMsg1 || 'เธอทำอะไรอยู่ ว่างไหม?';
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: initialBotMsg, time: 'เมื่อสักครู่' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Default dialog choices if not configured
  const dialogSteps = (chatDialog && chatDialog.length > 0) ? chatDialog : [
    {
      userChoice: 'ว่างสิ มีอะไรเหรอ? 👀',
      botReplies: ['คือเราแอบเตรียมอะไรบางอย่างไว้ให้เธอแหละ 🫣', 'ลองตอบคำถาม 3 ข้อนี้ให้ถูกก่อนถึงจะปลดล็อกของขวัญได้นะ!']
    },
    {
      userChoice: 'งานยุ่งนิดหน่อย แต่มีเวลาให้เธอเสมอ ❤️',
      botReplies: ['งุ้ย น่ารักที่สุดในโลกเลยยยย 🥰', 'งั้นมาพักสมองเล่นเกมตอบคำถามชิงของขวัญกันหน่อยดีกว่า!']
    }
  ];

  const handlePickChoice = (choiceItem) => {
    if (isTyping) return;

    playTone(580, 0.1, 'sine', 0.1);
    // 1. Add user reply bubble
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: choiceItem.userChoice, time: 'เมื่อสักครู่' }
    ]);

    setIsTyping(true);

    // 2. Bot reply sequence with natural typing effect
    setTimeout(() => {
      setIsTyping(false);
      playTone(720, 0.15, 'sine', 0.1);
      const reply1 = choiceItem.botReplies?.[0] || 'เย้! ไปด่านถัดไปกันเลย';
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: reply1, time: 'เมื่อสักครู่' }
      ]);

      if (choiceItem.botReplies?.[1]) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          playTone(840, 0.15, 'sine', 0.1);
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 2, sender: 'bot', text: choiceItem.botReplies[1], time: 'เมื่อสักครู่' }
          ]);
          setIsCompleted(true);
        }, 1100);
      } else {
        setIsCompleted(true);
      }
    }, 900);
  };

  const handleResetChat = () => {
    setMessages([{ id: 1, sender: 'bot', text: initialBotMsg, time: 'เมื่อสักครู่' }]);
    setIsTyping(false);
    setIsCompleted(false);
    setCurrentStep(0);
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
      {/* Chat Top Contact Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 shadow-sm border border-stone-200 flex items-center justify-between mb-2 shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-xl shadow-inner">
            {chatAvatar}
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 leading-tight">
              {chatName}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-stone-500">กำลังใช้งาน (Online)</span>
            </div>
          </div>
        </div>

        {isCompleted && (
          <button
            onClick={handleResetChat}
            title="เริ่มแชทใหม่"
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area with ChatBG.jpg as background */}
      <div
        className="flex-1 overflow-y-auto space-y-2.5 px-2 py-3 rounded-2xl relative shadow-inner"
        style={{
          backgroundImage: 'url(/assets/ChatBG.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Soft dark/light overlay to ensure messages are easily readable */}
        <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[1px] pointer-events-none rounded-2xl" />

        <div className="relative z-10 space-y-2.5">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-end gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs shrink-0 shadow-xs">
                    {chatAvatar}
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-rose-500 text-white rounded-br-none'
                      : 'bg-white/95 text-stone-800 rounded-bl-none border border-stone-100'
                  }`}
                >
                  <p className="font-medium">{m.text}</p>
                  <div
                    className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                      isUser ? 'text-rose-200' : 'text-stone-400'
                    }`}
                  >
                    <span>{m.time}</span>
                    {isUser && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Animated typing dots */}
          {isTyping && (
            <div className="flex items-center gap-1.5 justify-start">
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs shrink-0">
                {chatAvatar}
              </div>
              <div className="bg-white px-3.5 py-2 rounded-2xl rounded-bl-none shadow-md border border-stone-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Choice Chips or Next Stage Button */}
      <div className="pt-2 shrink-0 z-10">
        {!isCompleted ? (
          <div className="space-y-1.5">
            <p className="text-[10px] text-stone-600 font-bold text-center">
              เลือกคำตอบเพื่อส่งแชทคุยกัน:
            </p>
            {dialogSteps.map((choice, idx) => (
              <button
                key={idx}
                disabled={isTyping}
                onClick={() => handlePickChoice(choice)}
                className="w-full text-left text-xs bg-white/95 hover:bg-white p-2.5 rounded-2xl border border-stone-200 shadow-sm text-stone-800 font-medium hover:border-rose-400 active:scale-[0.98] transition flex items-center justify-between"
              >
                <span>{choice.userChoice}</span>
                <Send className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={onNextStage}
            className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <span>ไปด่านถัดไป: ตอบคำถามทายใจ (Mini Quiz)</span>
            <ChevronRight className="w-4 h-4 text-rose-300" />
          </button>
        )}
      </div>
    </div>
  );
}
