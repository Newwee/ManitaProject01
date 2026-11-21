import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PhoneFrame from './components/GiftExperience/PhoneFrame';
import Stage0_Entry from './components/GiftExperience/Stage0_Entry';
import Stage1_Passcode from './components/GiftExperience/Stage1_Passcode';
import Stage2_Chat from './components/GiftExperience/Stage2_Chat';
import Stage3_Quiz from './components/GiftExperience/Stage3_Quiz';
import Stage4_Scratch from './components/GiftExperience/Stage4_Scratch';
import Stage_Camera from './components/GiftExperience/Stage_Camera';
import Stage5_Finale from './components/GiftExperience/Stage5_Finale';
import ChristmasTreeExperience from './components/Experience3D/ChristmasTreeExperience';
import ArrowBirthdayExperience from './components/Experience3D/ArrowBirthdayExperience';
import CreatorDashboard from './components/Studio/CreatorDashboard';
import ShareModal from './components/Studio/ShareModal';
import FloatingParticles from './components/Effects/FloatingParticles';
import { THEME_PRESETS, DEFAULT_QUIZZES } from './types/themePresets';
import { saveLocalDraft, loadLocalDraft, resolveGiftFromUrl } from './lib/giftStorage';
import { toggleMusic, stopMusic } from './lib/soundEngine';

export default function App() {
  const initialPreset = THEME_PRESETS.scrapbook;

  const [config, setConfig] = useState({
    presetCategory: 'chat_scratch', // 'chat_scratch' | 'chat_camera' | 'christmas_tree' | 'arrow_birthday'
    revealType: 'scratch', // 'scratch' | 'camera'
    cameraFrameStyle: 'square', // 'square' | 'circle' | 'oval' | 'cloud' | 'dashed' | 'arch'
    theme: 'scrapbook',
    introTitle: initialPreset.introTitle,
    introSub: initialPreset.introSub,
    letterText: initialPreset.letterText,
    passcode: '231069',
    passcodeHint: initialPreset.passcodeHint,
    timeLockEnabled: false,
    timeLockDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    chatName: initialPreset.chatName,
    chatAvatar: initialPreset.chatAvatar,
    chatMsg1: initialPreset.chatMsg1,
    chatDialog: initialPreset.chatDialog,
    scratchSecret: initialPreset.scratchSecret,
    voiceCaption: initialPreset.voiceCaption,
    coupons: [...initialPreset.coupons],
    quizzes: [...DEFAULT_QUIZZES],
    photos: [], // Empty initially so placeholder shows instead of background textures!
    selectedSticker: '💖',
    // 3D Christmas Tree settings
    treeTitle: 'Merry Christmas',
    treeSubtitle: 'A SPECIAL WISH FOR YOU',
    treeWish: 'ขอให้เทศกาลนี้เต็มไปด้วยความสุข ความอบอุ่น และรอยยิ้ม ขอให้ปีที่กำลังจะมาถึงใจดีกับเธอในทุกๆ วันนะ 🎄✨',
    // 3D Arrow Birthday settings
    arrowTitle: 'Happy Birthday',
    arrowSubtitle: 'WISHING YOU ENDLESS HAPPINESS ✨',
    arrowWish: 'สุขสันต์วันเกิดนะ! 🎂✨ ขอให้ปีนี้เป็นปีที่ใจดีกับเธอมากๆ เต็มไปด้วยรอยยิ้ม เสียงหัวเราะ และความสุขในทุกๆ วัน เติบโตอย่างสดใสที่สุดเลยนะ 💖',
    arrowSign: '— จากคนที่หวังดีเสมอ ✨'
  });

  const [appMode, setAppMode] = useState('preview'); // 'preview' | 'builder'
  const [currentStage, setCurrentStage] = useState(0);
  const [isRecipientOnly, setIsRecipientOnly] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from URL or Local Draft
  useEffect(() => {
    const initApp = async () => {
      try {
        const giftFromUrl = await resolveGiftFromUrl();
        if (giftFromUrl && giftFromUrl.config) {
          setConfig(giftFromUrl.config);
          setIsRecipientOnly(true);
          setAppMode('preview');
        } else {
          const draft = loadLocalDraft();
          if (draft) {
            setConfig((prev) => ({ ...prev, ...draft }));
          }
        }
      } catch (e) {
        console.error('Error during app initialization:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();

    const handleHashOrPopState = async () => {
      const giftFromUrl = await resolveGiftFromUrl();
      if (giftFromUrl && giftFromUrl.config) {
        setConfig(giftFromUrl.config);
        setIsRecipientOnly(true);
        setAppMode('preview');
      }
    };

    window.addEventListener('hashchange', handleHashOrPopState);
    window.addEventListener('popstate', handleHashOrPopState);

    return () => {
      window.removeEventListener('hashchange', handleHashOrPopState);
      window.removeEventListener('popstate', handleHashOrPopState);
    };
  }, []);

  // Sync draft to local storage on config changes
  useEffect(() => {
    if (!isRecipientOnly && !isLoading) {
      saveLocalDraft(config);
    }
  }, [config, isRecipientOnly, isLoading]);

  // Set data-theme on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', config.theme || 'scrapbook');
  }, [config.theme]);

  // Stop music on unmount
  useEffect(() => {
    return () => stopMusic();
  }, []);

  const handleToggleMusic = () => {
    toggleMusic(config.theme, (state) => {
      setIsMusicPlaying(state);
    });
  };

  const handleNextStage = () => {
    setCurrentStage((s) => Math.min(s + 1, 5));
  };

  const handleResetExperience = () => {
    setCurrentStage(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EFE8DF] text-stone-800">
        <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-xl font-bold animate-pulse shadow-lg mb-3">
          ✦
        </div>
        <p className="font-theme-display text-sm font-bold text-stone-700">
          กำลังเตรียมของขวัญพิเศษจาก MANITA...
        </p>
      </div>
    );
  }

  const category = config.presetCategory || 'chat_scratch';

  return (
    <div
      data-theme={config.theme}
      className="min-h-screen flex flex-col items-center justify-center relative transition-colors duration-500"
      style={{
        backgroundImage: 'radial-gradient(rgba(200, 162, 124, 0.15) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* Background Floating Particles */}
      <FloatingParticles theme={config.theme} />

      {/* Top Navbar */}
      <Navbar
        appMode={appMode}
        setAppMode={setAppMode}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        themeKey={config.theme}
        isRecipientOnly={isRecipientOnly}
      />

      {/* Main Experience Router */}
      {appMode === 'preview' ? (
        <main className="w-full max-w-md mx-auto pt-16 pb-6 px-2 flex-1 flex flex-col items-center justify-center z-10">
          {/* Preset Category 3: 3D Christmas Tree */}
          {category === 'christmas_tree' ? (
            <div className="w-full max-w-[420px] mx-auto rounded-[38px] shadow-2xl border-[8px] border-stone-800 overflow-hidden relative min-h-[660px] max-h-[820px] bg-black">
              <ChristmasTreeExperience
                title={config.treeTitle || 'Merry Christmas'}
                subtitle={config.treeSubtitle || 'A SPECIAL WISH FOR YOU'}
                wishMessage={config.treeWish}
                photos={config.photos}
              />
            </div>
          ) : category === 'arrow_birthday' ? (
            /* Preset Category 4: 3D Arrow Birthday Shooting */
            <div className="w-full max-w-[420px] mx-auto rounded-[38px] shadow-2xl border-[8px] border-stone-800 overflow-hidden relative min-h-[660px] max-h-[820px] bg-[#05020A]">
              <ArrowBirthdayExperience
                title={config.arrowTitle || 'Happy Birthday'}
                subtitle={config.arrowSubtitle || 'WISHING YOU ENDLESS HAPPINESS ✨'}
                wishMessage={config.arrowWish}
                wishSign={config.arrowSign}
                photos={config.photos}
              />
            </div>
          ) : (
            /* Preset Category 1 & 2: Chat + Scratch OR Chat + Camera */
            <PhoneFrame
              theme={config.theme}
              currentStage={currentStage}
              totalStages={6}
              onResetExperience={handleResetExperience}
            >
              {/* Stage 0: 3D Envelope & Wax Seal / Gift Entry / Time Capsule */}
              {currentStage === 0 && (
                <Stage0_Entry
                  theme={config.theme}
                  introTitle={config.introTitle}
                  introSub={config.introSub}
                  letterText={config.letterText}
                  timeLockEnabled={config.timeLockEnabled}
                  timeLockDate={config.timeLockDate}
                  onNextStage={handleNextStage}
                />
              )}

              {/* Stage 1: 6-Digit Passcode Input */}
              {currentStage === 1 && (
                <Stage1_Passcode
                  expectedPasscode={config.passcode || '231069'}
                  passcodeHint={config.passcodeHint}
                  onNextStage={handleNextStage}
                />
              )}

              {/* Stage 2: Simulated Interactive Chat with ChatBG.jpg */}
              {currentStage === 2 && (
                <Stage2_Chat
                  chatName={config.chatName}
                  chatAvatar={config.chatAvatar}
                  chatMsg1={config.chatMsg1}
                  chatDialog={config.chatDialog}
                  onNextStage={handleNextStage}
                />
              )}

              {/* Stage 3: Interactive Mini Quiz */}
              {currentStage === 3 && (
                <Stage3_Quiz
                  quizzes={config.quizzes}
                  onNextStage={handleNextStage}
                />
              )}

              {/* Stage 4: Scratch-to-Reveal Card OR Instant Camera (Image 4 & 5) */}
              {currentStage === 4 && (
                category === 'chat_camera' || config.revealType === 'camera' ? (
                  <Stage_Camera
                    photos={config.photos}
                    cameraFrameStyle={config.cameraFrameStyle || 'square'}
                    onNextStage={handleNextStage}
                  />
                ) : (
                  <Stage4_Scratch
                    scratchSecret={config.scratchSecret}
                    onNextStage={handleNextStage}
                  />
                )
              )}

              {/* Stage 5: Grand Finale (Vinyl record + Polaroid + Redeemable coupons) */}
              {currentStage === 5 && (
                <Stage5_Finale
                  voiceCaption={config.voiceCaption}
                  photos={config.photos}
                  selectedSticker={config.selectedSticker}
                  coupons={config.coupons}
                  isMusicPlaying={isMusicPlaying}
                  onToggleMusic={handleToggleMusic}
                />
              )}
            </PhoneFrame>
          )}
        </main>
      ) : (
        /* Creator Studio Dashboard */
        <main className="w-full flex-1 z-10">
          <CreatorDashboard
            config={config}
            onChangeConfig={setConfig}
            onSwitchToPreview={() => setAppMode('preview')}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        </main>
      )}

      {/* Share & QR Code Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        config={config}
      />
    </div>
  );
}
