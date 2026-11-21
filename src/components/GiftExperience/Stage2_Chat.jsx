import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, ChevronRight, CheckCheck } from 'lucide-react';
import { playTone } from '../../lib/soundEngine';

export default function Stage2_Chat({
  chatName = 'คนพิเศษของเธอ ♡',
  chatAvatar = '🐻',
  chatMsg1 = 'เธอทำอะไรอยู่ ว่างไหม?',
  chatDialog = [],
  onNextStage
}) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: chatMsg1, time: 'เมื่อสักครู่' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasReplied, setHasReplied] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const defaultDialogChoices = chatDialog.length > 0 ? chatDialog : [
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
    if (hasReplied) return;
    setHasReplied(true);

    playTone(580, 0.1, 'sine', 0.1);
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: choiceItem.userChoice, time: 'เมื่อสักครู่' }
    ]);

    // Show typing dots
    setIsTyping(true);

    // Bot reply sequence
    setTimeout(() => {
      setIsTyping(false);
      playTone(720, 0.15, 'sine', 0.1);
      const reply1 = choiceItem.botReplies[0] || 'เย้! ไปด่านถัดไปกันเลย';
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: reply1, time: 'เมื่อสักครู่' }
      ]);

      if (choiceItem.botReplies[1]) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          playTone(840, 0.15, 'sine', 0.1);
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 2, sender: 'bot', text: choiceItem.botReplies[1], time: 'เมื่อสักครู่' }
          ]);
        }, 1200);
      }
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden">
      {/* Chat Top Contact Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2.5 shadow-sm border border-stone-200 flex items-center justify-between mb-2 shrink-0">
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
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto space-y-2.5 px-1 py-2 rounded-2xl bg-black/5"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-end gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs shrink-0">
                  {chatAvatar}
                </div>
              )}
              <div
                className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-rose-500 text-white rounded-br-none'
                    : 'bg-white text-stone-800 rounded-bl-none border border-stone-100'
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
            <div className="bg-white px-3.5 py-2 rounded-2xl rounded-bl-none shadow-sm border border-stone-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Choice Chips or Next Stage Button */}
      <div className="pt-2 shrink-0">
        {!hasReplied ? (
          <div className="space-y-1.5">
            <p className="text-[10px] text-stone-500 text-center font-medium">
              เลือกคำตอบเพื่อส่งแชทคุยกัน:
            </p>
            {defaultDialogChoices.map((choice, idx) => (
              <button
                key={idx}
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
