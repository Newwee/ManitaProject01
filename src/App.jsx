import React, { useState, useEffect } from 'react';
import { Columns2, Eye, Edit3 } from 'lucide-react';
import Navbar from './components/Navbar';
import PhoneFrame from './components/GiftExperience/PhoneFrame';
import Stage0_Entry from './components/GiftExperience/Stage0_Entry';
import Stage1_Passcode from './components/GiftExperience/Stage1_Passcode';
import Stage2_Chat from './components/GiftExperience/Stage2_Chat';
import Stage3_Quiz from './components/GiftExperience/Stage3_Quiz';
import Stage4_Scratch from './components/GiftExperience/Stage4_Scratch';
import Stage_Camera from './components/GiftExperience/Stage_Camera';
import Stage5_Finale from './components/GiftExperience/Stage5_Finale';
import CreatorDashboard from './components/Studio/CreatorDashboard';
import FloatingParticles from './components/Effects/FloatingParticles';
import ClickSpark from './components/UI/ClickSpark';
import SoftAurora from './components/UI/SoftAurora';
import Aurora from './components/UI/Aurora';
import SettingsModal from './components/Settings/SettingsModal';
import NotificationCenter from './components/Notification/NotificationCenter';
import ToastContainer from './components/Notification/ToastContainer';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { loadUserPreferences, saveUserPreferences, resetUserPreferences } from './lib/userPreferences';
import { THEME_PRESETS, DEFAULT_QUIZZES } from './types/themePresets';
import { saveLocalDraft, loadLocalDraft, resolveGiftFromUrl } from './lib/giftStorage';
import { toggleMusic, stopMusic } from './lib/soundEngine';

// Code Splitting & Lazy Loading for heavy 3D experiences, shaders, and modals
const ChristmasTreeExperience = React.lazy(() => import('./components/Experience3D/ChristmasTreeExperience'));
const ArrowBirthdayExperience = React.lazy(() => import('./components/Experience3D/ArrowBirthdayExperience'));
const GhostFibers = React.lazy(() => import('./components/UI/GhostFibers'));
const HoloMosaic = React.lazy(() => import('./components/UI/HoloMosaic'));
const FluxLines = React.lazy(() => import('./components/UI/FluxLines'));
const ShareModal = React.lazy(() => import('./components/Studio/ShareModal'));

function AppContent({ preferences, setPreferences }) {
  const { unreadCount, notify } = useNotifications();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const initialPreset = THEME_PRESETS.scrapbook;

  const [config, setConfig] = useState({
    presetCategory: 'chat_scratch', // 'chat_scratch' | 'chat_camera' | 'christmas_tree' | 'arrow_birthday'
    revealType: 'scratch', // 'scratch' | 'camera'
    cameraFrameStyle: 'square', // 'square' | 'circle' | 'oval' | 'cloud' | 'dashed' | 'arch'
    phoneBackground: '/assets/Background.jpg',
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
    decorations: [],
    envelopeStyle: '',
    passcodeBackground: '',
    passcodeNotes: [],
    badgeText: 'วันครบรอบ ♡',
    promptText: 'แตะที่ของขวัญเพื่อเปิดดูด่านต่อไป',
    introTitlePos: { x: 0, y: 0 },
    introSubPos: { x: 0, y: 0 },
    badgePos: { x: 0, y: 0 },
    promptPos: { x: 0, y: 0 },
    // 3D Christmas Tree settings
    treeTheme: 'classic', // 'classic' | 'gold' | 'pink' | 'blue'
    treeTitle: 'Merry Christmas',
    treeSubtitle: 'A SPECIAL WISH FOR YOU',
    treeWish: 'ขอให้เทศกาลนี้เต็มไปด้วยความสุข ความอบอุ่น และรอยยิ้ม ขอให้ปีที่กำลังจะมาถึงใจดีกับเธอในทุกๆ วันนะ 🎄✨',
    // 3D Arrow Birthday settings
    arrowTitle: 'Happy Birthday',
    arrowSubtitle: 'WISHING YOU ENDLESS HAPPINESS ✨',
    arrowWish: 'สุขสันต์วันเกิดนะ! 🎂✨ ขอให้ปีนี้เป็นปีที่ใจดีกับเธอมากๆ เต็มไปด้วยรอยยิ้ม เสียงหัวเราะ และความสุขในทุกๆ วัน เติบโตอย่างสดใสที่สุดเลยนะ 💖',
    arrowSign: '— จากคนที่หวังดีเสมอ ✨'
  });

  const [appMode, setAppMode] = useState('preview'); // 'preview' | 'builder' (Mobile view mode)
  const [desktopViewMode, setDesktopViewMode] = useState('split'); // 'split' | 'editor' | 'preview' (Tablet/Desktop view mode)
  const [currentStage, setCurrentStage] = useState(0);
  const [isRecipientOnly, setIsRecipientOnly] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [studioTheme, setStudioTheme] = useState(() => {
    return preferences?.appearance?.theme || 'system';
  });

  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 767px)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => setIsSystemDark(e.matches);
    media.addEventListener('change', listener);

    const mobileMedia = window.matchMedia('(max-width: 767px)');
    const mobileListener = (e) => setIsMobile(e.matches);
    mobileMedia.addEventListener('change', mobileListener);

    return () => {
      media.removeEventListener('change', listener);
      mobileMedia.removeEventListener('change', mobileListener);
    };
  }, []);

  const isDarkMode = studioTheme === 'dark' || (studioTheme === 'system' && isSystemDark);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const handleStudioThemeChange = (newTheme) => {
    setStudioTheme(newTheme);
    const updated = {
      ...preferences,
      appearance: {
        ...(preferences?.appearance || {}),
        theme: newTheme
      }
    };
    setPreferences(updated);
    saveUserPreferences(updated);
  };

  const handlePreferencesChange = (newPrefs) => {
    setPreferences(newPrefs);
    saveUserPreferences(newPrefs);
    if (newPrefs.appearance?.theme && newPrefs.appearance.theme !== studioTheme) {
      setStudioTheme(newPrefs.appearance.theme);
    }
  };

  const handleResetPreferences = () => {
    const defaults = resetUserPreferences();
    setPreferences(defaults);
    setStudioTheme(defaults.appearance.theme);
    notify({
      type: 'info',
      title: 'คืนค่าเริ่มต้นสำเร็จ',
      message: 'คืนค่าการแสดงผลและเอฟเฟกต์เป็นแบบดั้งเดิม 100%'
    });
  };

  // Sanitize photo captions to ensure no file sizes like '(197 KB)' leak into UI
  const sanitizePhotos = (photos) => {
    if (!Array.isArray(photos)) return [];
    return photos.map((p) => ({
      ...p,
      caption: (p.caption || 'ภาพความทรงจำ').replace(/\s*\(\d+(\.\d+)?\s*KB\)/i, '').trim() || 'ภาพความทรงจำ'
    }));
  };

  // Initialize from URL or Local Draft
  useEffect(() => {
    const initApp = async () => {
      try {
        const giftFromUrl = await resolveGiftFromUrl();
        if (giftFromUrl && giftFromUrl.config) {
          const cleanCfg = {
            ...giftFromUrl.config,
            photos: sanitizePhotos(giftFromUrl.config.photos)
          };
          setConfig(cleanCfg);
          setIsRecipientOnly(true);
          setAppMode('preview');
        } else {
          const draft = loadLocalDraft();
          if (draft) {
            const cleanCfg = {
              ...draft,
              photos: sanitizePhotos(draft.photos)
            };
            setConfig((prev) => ({ ...prev, ...cleanCfg }));
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
        const cleanCfg = {
          ...giftFromUrl.config,
          photos: sanitizePhotos(giftFromUrl.config.photos)
        };
        setConfig(cleanCfg);
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

  const category = config.presetCategory || 'chat_scratch';

  // Ensure website ambient BGM does not overlap when entering Christmas tree experience
  useEffect(() => {
    if (category === 'christmas_tree' && isMusicPlaying) {
      stopMusic();
      setIsMusicPlaying(false);
    }
  }, [category, isMusicPlaying]);

  const handleToggleMusic = () => {
    toggleMusic(
      config.theme,
      (state) => {
        setIsMusicPlaying(state);
      },
      config.presetCategory
    );
  };

  const handleNextStage = () => {
    setCurrentStage((s) => Math.min(s + 1, 5));
  };

  const handlePrevStage = () => {
    setCurrentStage((s) => Math.max(s - 1, 0));
  };

  const handleResetExperience = () => {
    setCurrentStage(0);
  };

  // Synchronize Live Preview Stage with active tab from Creator Dashboard
  const handleTabChangeFromDashboard = (tabId) => {
    if (tabId === 'entry') setCurrentStage(0);
    else if (tabId === 'passcode') setCurrentStage(1);
    else if (tabId === 'chat') setCurrentStage(2);
    else if (tabId === 'reveal') setCurrentStage(4);
    else if (tabId === 'coupons') setCurrentStage(5);
  };

  // Helper to render phone stages (Shared seamlessly between Mobile & Desktop Live Preview)
  const renderPhoneStages = () => (
    <>
      {/* Stage 0: 3D Envelope & Wax Seal / Gift Entry / Time Capsule */}
      {currentStage === 0 && (
        <Stage0_Entry
          theme={config.theme}
          introTitle={config.introTitle}
          introSub={config.introSub}
          letterText={config.letterText}
          envelopeStyle={config.envelopeStyle}
          introTitlePos={config.introTitlePos}
          introSubPos={config.introSubPos}
          badgePos={config.badgePos}
          promptPos={config.promptPos}
          waxSealPos={config.waxSealPos}
          waxSealScale={config.waxSealScale}
          waxSealRotation={config.waxSealRotation}
          badgeText={config.badgeText || 'วันครบรอบ ♡'}
          promptText={config.promptText || 'แตะที่ของขวัญเพื่อเปิดดูด่านต่อไป'}
          onChangeConfig={(updates) => {
            setConfig((prev) => {
              const updated = { ...prev, ...updates };
              if (!isRecipientOnly) saveLocalDraft(updated);
              return updated;
            });
          }}
          isEditable={!isRecipientOnly}
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
          postItNotes={config.passcodeNotes || []}
          onUpdatePostItNotes={(notes) => {
            setConfig((prev) => {
              const updated = { ...prev, passcodeNotes: notes };
              if (!isRecipientOnly) saveLocalDraft(updated);
              return updated;
            });
          }}
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
          revealType={category === 'chat_camera' || config.revealType === 'camera' ? 'camera' : 'scratch'}
          onNextStage={handleNextStage}
        />
      )}

      {/* Stage 4: Scratch-to-Reveal Card OR Instant Camera */}
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
            scratchColor={config.scratchColor || 'gold'}
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
    </>
  );

  // Helper to render 3D full-screen / container experiences
  const render3DExperience = () => {
    if (category === 'christmas_tree') {
      return (
        <React.Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-black text-rose-300 text-xs gap-2">
              <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span>กำลังโหลด 3D Christmas Tree...</span>
            </div>
          }
        >
          <ChristmasTreeExperience
            title={config.treeTitle || 'Merry Christmas'}
            subtitle={config.treeSubtitle || 'A SPECIAL WISH FOR YOU'}
            wishMessage={config.treeWish}
            photos={config.photos}
            treeTheme={config.treeTheme || 'classic'}
            lockMode={config.treeLockMode || 'immediate'}
            unlockDate={config.treeUnlockDate || '2026-12-25T00:00'}
            boxUnlockDates={config.treeBoxUnlockDates || []}
            lockMessage={config.treeLockMessage || ''}
            showCountdown={config.treeShowCountdown !== undefined ? config.treeShowCountdown : true}
            countdownTitle={config.treeCountdownTitle || ''}
            decorations={config.treeDecorations || {}}
            isRecipient={isRecipientOnly}
          />
        </React.Suspense>
      );
    }

    if (category === 'arrow_birthday') {
      return (
        <React.Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-[#04020a] text-pink-300 text-xs gap-2">
              <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              <span>กำลังโหลด 3D Birthday Experience...</span>
            </div>
          }
        >
          <ArrowBirthdayExperience
            title={config.arrowTitle || 'Happy Birthday'}
            subtitle={config.arrowSubtitle || 'WISHING YOU ENDLESS HAPPINESS ✨'}
            wishMessage={config.arrowWish}
            wishSign={config.arrowSign}
            photos={config.photos}
            isRecipient={isRecipientOnly}
          />
        </React.Suspense>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EFE8DF] dark:bg-[#121214] text-stone-800 dark:text-stone-100">
        <img
          src="/assets/ManitaLogo.png"
          alt="MANITA Logo"
          className="w-16 h-16 rounded-2xl shadow-xl animate-pulse mb-3"
        />
        <p className="font-theme-display text-sm font-bold text-stone-700 dark:text-stone-300">
          กำลังเตรียมของขวัญพิเศษจาก MANITA...
        </p>
      </div>
    );
  }

  return (
    <div
      data-theme={config.theme}
      className={`min-h-screen flex flex-col items-center justify-center relative transition-colors duration-500 ${
        preferences?.appearance?.glassSurface ? 'manita-glass' : ''
      } ${
        isDarkMode ? 'dark bg-[#121214] text-stone-100' : 'bg-[#EFE8DF] text-stone-800'
      }`}
      style={{
        backgroundImage: isDarkMode
          ? 'radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)'
          : 'radial-gradient(rgba(200, 162, 124, 0.15) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      {preferences?.background?.style === 'aurora' && (
        <Aurora
          theme={config.theme}
          isDarkMode={isDarkMode}
          intensity={preferences.background?.intensity}
          speed={preferences.background?.speed}
          opacity={preferences.background?.opacity}
        />
      )}

      {preferences?.background?.style === 'soft_aurora' && (
        <SoftAurora
          theme={config.theme}
          isDarkMode={isDarkMode}
          intensity={preferences.background?.intensity}
          speed={preferences.background?.speed}
          opacity={preferences.background?.opacity}
        />
      )}

      {preferences?.background?.style === 'floating_particles' && (
        <FloatingParticles theme={config.theme} />
      )}

      {preferences?.background?.style === 'holo_mosaic' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-150"
          style={{ opacity: (preferences.background?.opacity !== undefined ? preferences.background.opacity : 60) / 100 }}
        >
          <React.Suspense fallback={null}>
            <HoloMosaic
              color={isDarkMode ? '#120f17' : '#efe8df'}
              metalColor={isDarkMode ? '#e8ebf1' : '#c8a27c'}
              spectrum="full"
              speed={(preferences.background?.speed || 1) * 0.5}
              intensity={((preferences.background?.intensity || 70) / 70) * 1.25}
              mouseInteraction={false}
              flipOnClick={false}
              lightMode={!isDarkMode}
            />
          </React.Suspense>
        </div>
      )}

      {preferences?.background?.style === 'flux_lines' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-150"
          style={{ opacity: (preferences.background?.opacity !== undefined ? preferences.background.opacity : 60) / 100 }}
        >
          <React.Suspense fallback={null}>
            <FluxLines
              colors={isDarkMode ? ['#ff2a85', '#a855f7', '#06b6d4'] : ['#f43f5e', '#c084fc', '#38bdf8']}
              glow={2}
              speed={(preferences.background?.speed || 1) * 0.5}
              flowDirection="down"
              mouseInteraction={false}
              clickSwirl={false}
              lightMode={!isDarkMode}
            />
          </React.Suspense>
        </div>
      )}

      {!isRecipientOnly &&
        (appMode === 'builder' || desktopViewMode !== 'preview') &&
        preferences?.background?.style !== 'original' &&
        preferences?.appearance?.visualEffects && (
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60 dark:opacity-80 transition-opacity duration-1000">
            <React.Suspense fallback={null}>
              <GhostFibers
                glowColor="#8b5cf6"
                layers={isMobile ? 2 : 3}
                twist={1.2}
                threads={isMobile ? 36 : 72}
                fiberStyle="dots"
                depthOfField={0.85}
                hoverEffect="focus"
                intro
                mouseInteraction={!isMobile}
                lineColor="#dfd1fc"
                secondaryColor="#6f4ac5"
                gradient="depth"
                waves={1}
                volume={0.7}
                spread={1}
                scale={1}
                rotation={18}
                perspective={0.65}
                density={1}
                thickness={1}
                tips={0}
                foldGlow={1}
                speed={0.5}
                flow={0.4}
                rollSpeed={0.15}
                focusDepth={0}
                particles={isMobile ? 0.2 : 0.5}
                sparkle={0.5}
                glow={0.8}
                brightness={1}
                vignette={0.3}
                grain={0.06}
                mouseStrength={1}
                pulseOnClick
                lightMode={!isDarkMode}
                dpr={isMobile ? 1 : 1.5}
              />
            </React.Suspense>
          </div>
        )}

      {preferences?.animation?.clickSpark && (
        <ClickSpark sparkColor={isDarkMode ? '#fb7185' : '#f43f5e'} />
      )}

      <Navbar
        appMode={appMode}
        setAppMode={setAppMode}
        desktopViewMode={desktopViewMode}
        setDesktopViewMode={setDesktopViewMode}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
        preferences={preferences}
        themeKey={config.theme}
        presetCategory={config.presetCategory}
        isRecipientOnly={isRecipientOnly}
        studioTheme={studioTheme}
        onChangeStudioTheme={handleStudioThemeChange}
        isDarkMode={isDarkMode}
      />

      {/* MAIN CONTENT ROUTER */}
      {isRecipientOnly ? (
        /* ================= 1. RECIPIENT MODE: 100% CLEAN EXPERIENCE ================= */
        category === 'christmas_tree' ? (
          <div className="fixed inset-0 top-14 w-full h-[calc(100vh-56px)] bg-black z-10 overflow-hidden flex flex-col">
            {render3DExperience()}
          </div>
        ) : category === 'arrow_birthday' ? (
          <div className="fixed inset-0 top-14 w-full h-[calc(100vh-56px)] bg-[#04020a] z-10 overflow-hidden flex flex-col">
            {render3DExperience()}
          </div>
        ) : (
          <main className="w-full max-w-md mx-auto pt-16 sm:pt-20 pb-6 px-2 sm:px-4 flex-1 flex flex-col items-center justify-center z-10">
            <PhoneFrame
              theme={config.theme}
              phoneBackground={config.phoneBackground}
              passcodeBackground={config.passcodeBackground}
              currentStage={currentStage}
              totalStages={6}
              onResetExperience={handleResetExperience}
              onPrevStage={handlePrevStage}
              onSelectStage={(idx) => setCurrentStage(idx)}
              decorations={config.decorations || []}
              isEditable={false}
            >
              {renderPhoneStages()}
            </PhoneFrame>
          </main>
        )
      ) : (
        /* ================= 2. CREATOR / STUDIO MODE ================= */
        <>
          {/* A. MOBILE LAYOUT (< md / < 768px): 100% UNCHANGED ORIGINAL UX */}
          <div className="md:hidden w-full flex-1 flex flex-col">
            {appMode === 'preview' ? (
              category === 'christmas_tree' ? (
                <div className="fixed inset-0 top-14 w-full h-[calc(100vh-56px)] bg-black z-10 overflow-hidden flex flex-col">
                  {render3DExperience()}
                </div>
              ) : category === 'arrow_birthday' ? (
                <div className="fixed inset-0 top-14 w-full h-[calc(100vh-56px)] bg-[#04020a] z-10 overflow-hidden flex flex-col">
                  {render3DExperience()}
                </div>
              ) : (
                <main className="w-full max-w-md mx-auto pt-16 sm:pt-20 pb-6 px-2 sm:px-4 flex-1 flex flex-col items-center justify-center z-10">
                  <PhoneFrame
                    theme={config.theme}
                    phoneBackground={config.phoneBackground}
                    passcodeBackground={config.passcodeBackground}
                    currentStage={currentStage}
                    totalStages={6}
                    onResetExperience={handleResetExperience}
                    onPrevStage={handlePrevStage}
                    onSelectStage={(idx) => setCurrentStage(idx)}
                    decorations={config.decorations || []}
                    onUpdateDecorations={(decs, flush = true) => {
                      setConfig((prev) => {
                        const updated = { ...prev, decorations: decs };
                        if (!isRecipientOnly && flush) saveLocalDraft(updated);
                        return updated;
                      });
                    }}
                    onAddDecoration={(dec) => {
                      setConfig((prev) => {
                        const currentDecs = prev.decorations || [];
                        const newDec = {
                          id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                          src: dec.src,
                          x: 50,
                          y: 50,
                          scale: 1,
                          rotation: 0
                        };
                        const updated = { ...prev, decorations: [...currentDecs, newDec] };
                        if (!isRecipientOnly) saveLocalDraft(updated);
                        return updated;
                      });
                    }}
                    isEditable={true}
                  >
                    {renderPhoneStages()}
                  </PhoneFrame>
                </main>
              )
            ) : (
              /* Mobile Creator Dashboard (Full Width Scrollable) */
              <main className="w-full flex-1 z-10">
                <CreatorDashboard
                  config={config}
                  onChangeConfig={setConfig}
                  onSwitchToPreview={() => setAppMode('preview')}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                  studioTheme={studioTheme}
                  onChangeStudioTheme={setStudioTheme}
                  isDarkMode={isDarkMode}
                  onActiveTabChange={handleTabChangeFromDashboard}
                  preferences={preferences}
                />
              </main>
            )}
          </div>

          {/* B. IPAD, TABLET & DESKTOP LAYOUT (>= md / >= 768px): SPLIT-SCREEN & TOGGLE VIEWS */}
          <div className="hidden md:flex fixed inset-x-0 bottom-0 top-14 overflow-hidden z-10 flex-row bg-transparent transition-colors duration-300">
            {/* LEFT COLUMN: Editor Panel (Scrollable independently, collapsible) */}
            <div
              className={`h-full overflow-y-auto transition-all duration-300 ease-in-out border-r border-stone-200/80 dark:border-stone-800 relative ${
                desktopViewMode === 'split'
                  ? 'w-[52%] lg:w-[56%] xl:w-[58%] shrink-0 opacity-100'
                  : desktopViewMode === 'editor'
                  ? 'w-full flex-1 shrink-0 opacity-100'
                  : 'w-0 shrink-0 opacity-0 pointer-events-none overflow-hidden p-0 m-0 border-0'
              }`}
            >
              {/* Quick toggle pill in Full Editor mode to return to Split Screen */}
              {desktopViewMode === 'editor' && (
                <div className="sticky top-3 right-4 z-30 flex justify-end pr-4 pointer-events-none">
                  <button
                    type="button"
                    onClick={() => setDesktopViewMode('split')}
                    className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all flex items-center gap-1.5 active:scale-95"
                    title="เปิดดูตัวอย่างมือถือคู่กัน (Split View)"
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                    <span>เปิดดูตัวอย่างคู่กัน (Split View) 📱</span>
                  </button>
                </div>
              )}

              <CreatorDashboard
                config={config}
                onChangeConfig={setConfig}
                onSwitchToPreview={() => setDesktopViewMode('preview')}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                studioTheme={studioTheme}
                onChangeStudioTheme={setStudioTheme}
                isDarkMode={isDarkMode}
                isEmbedded={true}
                onActiveTabChange={handleTabChangeFromDashboard}
                preferences={preferences}
              />
            </div>

            {/* RIGHT COLUMN: Live Preview Panel (Scrollable independently, collapsible) */}
            <div
              className={`h-full overflow-y-auto transition-all duration-300 ease-in-out flex flex-col items-center justify-start relative select-none ${
                desktopViewMode === 'split'
                  ? 'w-[48%] lg:w-[44%] xl:w-[42%] shrink-0 opacity-100 bg-stone-900/5 dark:bg-black/20 p-4 lg:p-6 border-l border-stone-200/60 dark:border-stone-800/60'
                  : desktopViewMode === 'preview'
                  ? (category === 'christmas_tree' || category === 'arrow_birthday')
                    ? 'w-full flex-1 shrink-0 opacity-100 bg-black p-0 m-0 overflow-hidden'
                    : 'w-full flex-1 shrink-0 opacity-100 bg-transparent p-4 sm:p-8'
                  : 'w-0 shrink-0 opacity-0 pointer-events-none overflow-hidden p-0 m-0 border-0'
              }`}
            >
              {/* Top Header of Preview Panel */}
              {desktopViewMode === 'preview' ? (
                (category === 'christmas_tree' || category === 'arrow_birthday') ? (
                  <div className="absolute top-3.5 left-4 z-40 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDesktopViewMode('split')}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-900/85 hover:bg-stone-900 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-xl flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Columns2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>← กลับสู่โหมดแบ่งหน้าจอ (Split View)</span>
                    </button>
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/70 backdrop-blur-md border border-white/10 text-[11px] font-bold text-stone-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>โหมดตัวอย่างเต็มตา</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-4xl mx-auto mb-3 flex items-center justify-between px-2">
                    <button
                      type="button"
                      onClick={() => setDesktopViewMode('split')}
                      className="px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-stone-800/95 hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold shadow-sm border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Columns2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>← กลับสู่โหมดแบ่งหน้าจอ (Split View)</span>
                    </button>
                    <div className="text-xs font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>โหมดตัวอย่างเต็มตา (Full Preview Mode)</span>
                    </div>
                  </div>
                )
              ) : desktopViewMode === 'split' ? (
                <div className="w-full max-w-[420px] mb-2.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                      ตัวอย่างมือถือ (Live Preview)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDesktopViewMode('preview')}
                    title="ขยายตัวอย่างมือถือเต็มตา (Full Preview)"
                    className="px-2.5 py-1 rounded-lg bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-[11px] font-bold text-stone-700 dark:text-stone-300 transition flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-rose-500" />
                    <span>ขยายเต็มตา</span>
                  </button>
                </div>
              ) : null}

              {/* Live Preview Content (Real-time updates without switching tabs) */}
              {category === 'christmas_tree' ? (
                desktopViewMode === 'preview' ? (
                  <div className="w-full h-full relative flex flex-col bg-black overflow-hidden">
                    {render3DExperience()}
                  </div>
                ) : (
                  <div className="w-full max-w-[420px] h-[720px] rounded-[36px] overflow-hidden shadow-2xl border-[6px] border-stone-800 bg-black relative flex flex-col my-auto transition-all">
                    {render3DExperience()}
                  </div>
                )
              ) : category === 'arrow_birthday' ? (
                desktopViewMode === 'preview' ? (
                  <div className="w-full h-full relative flex flex-col bg-[#04020a] overflow-hidden">
                    {render3DExperience()}
                  </div>
                ) : (
                  <div className="w-full max-w-[420px] h-[720px] rounded-[36px] overflow-hidden shadow-2xl border-[6px] border-stone-800 bg-[#04020a] relative flex flex-col my-auto transition-all">
                    {render3DExperience()}
                  </div>
                )
              ) : (
                <div className="w-full max-w-[420px] my-auto scale-[0.92] sm:scale-95 lg:scale-100 origin-top transition-transform">
                  <PhoneFrame
                    theme={config.theme}
                    phoneBackground={config.phoneBackground}
                    passcodeBackground={config.passcodeBackground}
                    currentStage={currentStage}
                    totalStages={6}
                    onResetExperience={handleResetExperience}
                    onPrevStage={handlePrevStage}
                    onSelectStage={(idx) => setCurrentStage(idx)}
                    decorations={config.decorations || []}
                    onUpdateDecorations={(decs, flush = true) => {
                      setConfig((prev) => {
                        const updated = { ...prev, decorations: decs };
                        if (!isRecipientOnly && flush) saveLocalDraft(updated);
                        return updated;
                      });
                    }}
                    onAddDecoration={(dec) => {
                      setConfig((prev) => {
                        const currentDecs = prev.decorations || [];
                        const newDec = {
                          id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                          src: dec.src,
                          x: 50,
                          y: 50,
                          scale: 1,
                          rotation: 0
                        };
                        const updated = { ...prev, decorations: [...currentDecs, newDec] };
                        if (!isRecipientOnly) saveLocalDraft(updated);
                        return updated;
                      });
                    }}
                    isEditable={true}
                  >
                    {renderPhoneStages()}
                  </PhoneFrame>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onChangePreferences={handlePreferencesChange}
        onResetPreferences={handleResetPreferences}
        isDarkMode={isDarkMode}
      />

      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <React.Suspense fallback={null}>
        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            config={config}
            isDarkMode={isDarkMode}
          />
        )}
      </React.Suspense>
    </div>
  );
}

export default function App() {
  const [preferences, setPreferences] = useState(() => loadUserPreferences());

  return (
    <NotificationProvider preferences={preferences}>
      <AppContent preferences={preferences} setPreferences={setPreferences} />
      <ToastContainer />
    </NotificationProvider>
  );
}
