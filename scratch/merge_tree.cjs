const fs = require('fs');
const path = require('path');

const v2Path = path.resolve('Temp/ChristmasTree_v2.html');
const v2Content = fs.readFileSync(v2Path, 'utf8');

// 1. Injected CSS for recipient mode, sound button, and creator lock settings UI
const extraCss = `
    /* ================= MANITA RECIPIENT & PREVIEW MODE ================= */
    body.recipient-mode .controls,
    body.recipient-mode #controls,
    .recipient-mode .controls,
    .recipient-mode #setupModal,
    .recipient-mode .hint,
    .recipient-mode #previewUnlockBtn,
    .recipient-mode .creator-only-btn,
    .manita-clean .controls,
    .manita-clean #controls,
    .manita-clean #setupModal,
    .manita-clean .hint,
    .manita-clean #previewUnlockBtn,
    .manita-clean .creator-only-btn {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
      opacity: 0 !important;
    }

    .sound-floating-btn {
      position: fixed;
      top: 14px;
      right: 14px;
      z-index: 100;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(15, 25, 20, 0.75);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 215, 120, 0.4);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5);
    }
    .sound-floating-btn:hover {
      transform: scale(1.1);
      background: rgba(25, 45, 30, 0.95);
      border-color: rgba(255, 215, 120, 0.8);
      box-shadow: 0 0 20px rgba(255, 215, 120, 0.5);
    }

    /* Creator Setup: Lock System & 3D Decorations Panel */
    .creator-settings-panel {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 215, 120, 0.28);
      border-radius: 16px;
      padding: 14px;
      margin: 12px 0 16px;
      text-align: left;
    }
    .creator-panel-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #ffe899;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .mode-select-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 7px;
      margin-bottom: 10px;
    }
    .mode-option-btn {
      background: rgba(20, 25, 35, 0.7);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 7px 9px;
      cursor: pointer;
      font-size: 11px;
      color: #ddd;
      text-align: left;
      transition: all 0.2s;
    }
    .mode-option-btn.active {
      border-color: #ffd76b;
      background: rgba(255, 215, 107, 0.18);
      color: #fff;
      font-weight: 600;
      box-shadow: 0 0 12px rgba(255, 215, 107, 0.25);
    }
    .creator-field {
      margin-bottom: 9px;
    }
    .creator-field label {
      display: block;
      font-size: 10.5px;
      color: #bbb;
      margin-bottom: 3px;
    }
    .creator-field input, .creator-field select {
      width: 100%;
      background: rgba(12, 18, 28, 0.85);
      border: 1px solid rgba(255, 215, 120, 0.25);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 11.5px;
      color: #fff;
      font-family: inherit;
      outline: none;
    }
    .creator-field input:focus, .creator-field select:focus {
      border-color: #ffd76b;
    }
    .decor-checkbox-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-top: 6px;
    }
    .decor-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #ddd;
      cursor: pointer;
    }
    .per-box-dates-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      margin-top: 6px;
      max-height: 140px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .per-box-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
    }
    .per-box-item span {
      width: 60px;
      flex-shrink: 0;
      color: #ffd76b;
    }
`;

let merged = v2Content;

// Inject CSS
merged = merged.replace('</style>', `${extraCss}\n  </style>`);

// Inject Floating Sound Button right after #bgLayer
const soundBtnHtml = `
  <div id="bgLayer"></div>
  <button id="christmasSoundToggle" class="sound-floating-btn" onclick="toggleChristmasSound()" title="เปิด/ปิดเสียงเพลง & SFX">
    <span id="soundIcon">🔊</span>
  </button>`;
merged = merged.replace('<div id="bgLayer"></div>', soundBtnHtml);

// Update #lockToast to add ID to main text and mark previewUnlock as creator-only
merged = merged.replace(
  '<div class="lt-main">🔒 กล่องของขวัญยังเปิดไม่ได้นะ<br>รอถึงวันคริสต์มาส 25 ธ.ค. ก่อน!</div>',
  '<div class="lt-main" id="lockToastMain">🔒 กล่องของขวัญยังเปิดไม่ได้นะ<br>รอถึงเวลาปลดล็อกก่อน!</div>'
);
merged = merged.replace(
  '<button type="button" class="icon-btn" onclick="previewUnlock()">🔑 ดูตัวอย่าง (ผู้สร้าง)</button>',
  '<button type="button" class="icon-btn creator-only-btn" id="previewUnlockBtn" onclick="previewUnlock()">🔑 ดูตัวอย่าง (ผู้สร้าง)</button>'
);

// Inject Creator Setup Panel in #setupModal .setup-card (before upload zone)
const creatorSettingsPanelHtml = `
      <!-- ระบบตั้งค่าผู้แต่ง (Creator Lock & 3D Decorations) -->
      <div class="creator-settings-panel">
        <div class="creator-panel-title">
          <span>⚙️ ระบบล็อกกล่องของขวัญ & ลูกเล่น 3D (สำหรับผู้แต่ง)</span>
          <span style="font-size: 10px; opacity: 0.7;">เวลาไทย (Asia/Bangkok)</span>
        </div>

        <!-- 4 Lock Modes -->
        <label class="field-label" style="margin-bottom: 5px;">โหมดการเปิดกล่องของขวัญ (เลือก 1 ใน 4 แบบ):</label>
        <div class="mode-select-grid">
          <div class="mode-option-btn active" id="modeBtn_immediate" onclick="selectLockMode('immediate')">
            🔓 1. เปิดได้ทันที (ไม่ล็อก)
          </div>
          <div class="mode-option-btn" id="modeBtn_custom" onclick="selectLockMode('custom_date')">
            📅 2. กำหนดวัน-เวลาเอง
          </div>
          <div class="mode-option-btn" id="modeBtn_christmas" onclick="selectLockMode('christmas')">
            🎄 3. วันคริสต์มาส (25 ธ.ค.)
          </div>
          <div class="mode-option-btn" id="modeBtn_per_box" onclick="selectLockMode('per_box')">
            📦 4. ล็อกแยกทีละกล่อง (5 กล่อง)
          </div>
        </div>

        <!-- Mode 2: Custom Date -->
        <div id="customDateWrap" class="creator-field" style="display:none;">
          <label>⏰ กำหนดวันและเวลาปลดล็อก (Asia/Bangkok):</label>
          <input type="datetime-local" id="customUnlockInput" class="creator-input" value="2026-12-25T00:00" onchange="updateCreatorLockSettings()" />
        </div>

        <!-- Mode 4: Per Box Dates -->
        <div id="perBoxWrap" class="creator-field" style="display:none;">
          <label>📦 กำหนดเวลาปลดล็อกแยกทีละกล่อง (กล่อง 1 - 5):</label>
          <div class="per-box-dates-grid">
            <div class="per-box-item">
              <span>กล่องที่ 1:</span>
              <input type="datetime-local" id="boxUnlock_0" class="creator-input" value="2026-12-25T00:00" onchange="updateCreatorLockSettings()" />
            </div>
            <div class="per-box-item">
              <span>กล่องที่ 2:</span>
              <input type="datetime-local" id="boxUnlock_1" class="creator-input" value="2026-12-25T00:00" onchange="updateCreatorLockSettings()" />
            </div>
            <div class="per-box-item">
              <span>กล่องที่ 3:</span>
              <input type="datetime-local" id="boxUnlock_2" class="creator-input" value="2026-12-25T00:00" onchange="updateCreatorLockSettings()" />
            </div>
            <div class="per-box-item">
              <span>กล่องที่ 4:</span>
              <input type="datetime-local" id="boxUnlock_3" class="creator-input" value="2026-12-25T00:00" onchange="updateCreatorLockSettings()" />
            </div>
            <div class="per-box-item">
              <span>กล่องที่ 5:</span>
              <input type="datetime-local" id="boxUnlock_4" class="creator-input" value="2026-12-25T00:00" onchange="updateCreatorLockSettings()" />
            </div>
          </div>
        </div>

        <!-- Custom Lock Toast Message -->
        <div class="creator-field">
          <label>💬 ข้อความแจ้งเตือนเมื่อผู้รับคลิกกล่องที่ยังล็อก:</label>
          <input type="text" id="lockMsgInput" class="creator-input" value="🔒 กล่องของขวัญยังเปิดไม่ได้นะ รอถึงเวลาปลดล็อกก่อน!" onchange="updateCreatorLockSettings()" />
        </div>

        <!-- Countdown Card Options -->
        <div class="creator-field">
          <label class="decor-label">
            <input type="checkbox" id="toggleShowCountdown" checked onchange="updateCreatorLockSettings()" />
            <span>แสดงการ์ดนับถอยหลัง (Countdown Card)</span>
          </label>
          <div id="countdownTitleRow" style="margin-top: 4px;">
            <input type="text" id="cdTitleInput" class="creator-input" value="🎄 อีกเท่าไหร่ถึงคริสต์มาส" placeholder="หัวข้อการ์ดนับถอยหลัง" onchange="updateCreatorLockSettings()" />
          </div>
        </div>

        <!-- Decoration switches -->
        <div class="creator-field">
          <label>✨ สวิตช์เปิด/ปิดฟีเจอร์ตกแต่ง 3D:</label>
          <div class="decor-checkbox-grid">
            <label class="decor-label"><input type="checkbox" id="decorSanta" checked onchange="updateCreatorLockSettings()" /> 🎅 ซานต้าบินผ่าน</label>
            <label class="decor-label"><input type="checkbox" id="decorProps" checked onchange="updateCreatorLockSettings()" /> ⛄ มนุษย์หิมะ & ตุ๊กตาหมี</label>
            <label class="decor-label"><input type="checkbox" id="decorBalls" checked onchange="updateCreatorLockSettings()" /> 🔮 ลูกบอลแก้ว 3D</label>
            <label class="decor-label"><input type="checkbox" id="decorLandscape" checked onchange="updateCreatorLockSettings()" /> 🏔️ ดวงจันทร์ & ภูเขา</label>
          </div>
        </div>

        <!-- Creator Test Unlock Button -->
        <div style="margin-top: 8px; text-align: right;">
          <button type="button" class="btn-secondary creator-only-btn" style="font-size: 11px; padding: 4px 10px;" onclick="previewUnlock()">🔑 ผู้สร้าง: ทดสอบเปิดกล่องทันที (ดูตัวอย่าง)</button>
        </div>
      </div>
`;

// Replace old simple lockToggle in setupModal
merged = merged.replace(
  /<label class="lock-opt">[\s\S]*?<\/label>/,
  creatorSettingsPanelHtml
);

// Inject JavaScript logic for Creator Lock System, Audio Engine, and MANITA Integrator
const scriptInjection = `
    // ================= MANITA AUDIO & SFX ENGINE =================
    let isSoundMuted = false;
    let bgMusicAudio = null;
    let sfxTreeOpenAudio = null;
    let sfxGiftboxAudio = null;
    let sfxPopAudio = null;

    function initAudio() {
      if (bgMusicAudio) return;
      try {
        bgMusicAudio = new Audio('/assets/Music/LastChristmas.mp3');
        bgMusicAudio.loop = true;
        bgMusicAudio.volume = 0.55;

        sfxTreeOpenAudio = new Audio('/assets/Christmas/tree_open.mp3');
        sfxTreeOpenAudio.volume = 0.85;

        sfxGiftboxAudio = new Audio('/assets/Christmas/giftbox.mp3');
        sfxGiftboxAudio.volume = 0.9;

        sfxPopAudio = new Audio('/assets/SFX/pop.mp3');
        sfxPopAudio.volume = 0.8;
      } catch (e) {
        console.warn('Audio init error:', e);
      }
    }

    function playTreeOpenSFX() {
      initAudio();
      if (isSoundMuted || !sfxTreeOpenAudio) return;
      try {
        sfxTreeOpenAudio.currentTime = 0;
        sfxTreeOpenAudio.play().catch(e => console.debug('Tree open SFX waiting gesture:', e));
      } catch(e) {}
    }

    function playLastChristmasMusic() {
      initAudio();
      if (isSoundMuted || !bgMusicAudio) return;
      try {
        if (bgMusicAudio.paused) {
          bgMusicAudio.play().catch(e => console.debug('BGM waiting gesture:', e));
        }
      } catch(e) {}
    }

    function playGiftboxSFX() {
      initAudio();
      if (isSoundMuted) return;
      try {
        if (sfxGiftboxAudio) {
          sfxGiftboxAudio.currentTime = 0;
          sfxGiftboxAudio.play().catch(e => {});
        }
      } catch(e) {}
    }

    function playPopSFX() {
      initAudio();
      if (isSoundMuted) return;
      try {
        if (sfxPopAudio) {
          sfxPopAudio.currentTime = 0;
          sfxPopAudio.play().catch(e => {});
        }
      } catch(e) {}
    }

    function toggleChristmasSound() {
      initAudio();
      isSoundMuted = !isSoundMuted;
      const icon = document.getElementById('soundIcon');
      if (isSoundMuted) {
        if (bgMusicAudio) bgMusicAudio.pause();
        if (icon) icon.textContent = '🔇';
      } else {
        if (bgMusicAudio) bgMusicAudio.play().catch(e => {});
        if (icon) icon.textContent = '🔊';
      }
    }

    const unlockChristmasAudio = () => {
      initAudio();
      if (!isSoundMuted && bgMusicAudio && bgMusicAudio.paused) {
        bgMusicAudio.play().catch(e => {});
      }
      window.removeEventListener('pointerdown', unlockChristmasAudio);
      window.removeEventListener('click', unlockChristmasAudio);
    };
    window.addEventListener('pointerdown', unlockChristmasAudio, { once: true });
    window.addEventListener('click', unlockChristmasAudio, { once: true });

    // ================= CREATOR LOCK SYSTEM ("ระบบตั้งค่าผู้แต่ง") =================
    function getBangkokTime(dateObj = new Date()) {
      const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
      return new Date(utc + (7 * 3600000));
    }

    let lockMode = 'immediate'; // 'immediate' | 'custom_date' | 'christmas' | 'per_box'
    let customUnlockTime = '2026-12-25T00:00';
    let boxUnlockTimes = [
      '2026-12-25T00:00',
      '2026-12-25T00:00',
      '2026-12-25T00:00',
      '2026-12-25T00:00',
      '2026-12-25T00:00'
    ];
    let customLockToastMsg = '🔒 กล่องของขวัญยังเปิดไม่ได้นะ รอถึงเวลาปลดล็อกก่อน!';
    let showCountdownCard = true;
    let customCdTitle = '🎄 อีกเท่าไหร่ถึงคริสต์มาส';
    let isRecipientMode = false;

    let decorSettings = {
      santa: true,
      santaInterval: 'normal',
      props: true,
      balls: true,
      ballCount: 18,
      snowDensity: 'normal',
      landscape: true,
      sound: true
    };

    function selectLockMode(mode) {
      lockMode = mode;
      ['immediate', 'custom_date', 'christmas', 'per_box'].forEach(m => {
        const btn = document.getElementById('modeBtn_' + (m === 'custom_date' ? 'custom' : m));
        if (btn) btn.classList.toggle('active', m === mode);
      });

      const customWrap = document.getElementById('customDateWrap');
      if (customWrap) customWrap.style.display = mode === 'custom_date' ? 'block' : 'none';

      const perBoxWrap = document.getElementById('perBoxWrap');
      if (perBoxWrap) perBoxWrap.style.display = mode === 'per_box' ? 'block' : 'none';

      updateCreatorLockSettings();
    }

    function updateCreatorLockSettings() {
      const customInput = document.getElementById('customUnlockInput');
      if (customInput && customInput.value) customUnlockTime = customInput.value;

      for (let i = 0; i < 5; i++) {
        const el = document.getElementById('boxUnlock_' + i);
        if (el && el.value) boxUnlockTimes[i] = el.value;
      }

      const msgInput = document.getElementById('lockMsgInput');
      if (msgInput && msgInput.value) customLockToastMsg = msgInput.value;

      const cdToggle = document.getElementById('toggleShowCountdown');
      if (cdToggle) showCountdownCard = cdToggle.checked;

      const cdTitleEl = document.getElementById('cdTitleInput');
      if (cdTitleEl && cdTitleEl.value) customCdTitle = cdTitleEl.value;

      const dSanta = document.getElementById('decorSanta');
      if (dSanta) decorSettings.santa = dSanta.checked;

      const dProps = document.getElementById('decorProps');
      if (dProps) decorSettings.props = dProps.checked;

      const dBalls = document.getElementById('decorBalls');
      if (dBalls) decorSettings.balls = dBalls.checked;

      const dLand = document.getElementById('decorLandscape');
      if (dLand) decorSettings.landscape = dLand.checked;

      updateCountdown();
    }

    function isBoxLocked(boxIndex = 0) {
      if (previewUnlocked) return false;
      if (lockMode === 'immediate') return false;

      const nowBkk = getBangkokTime(new Date()).getTime();

      if (lockMode === 'christmas') {
        const now = getBangkokTime(new Date());
        const currentYear = now.getFullYear();
        const targetBkk = new Date(Date.UTC(currentYear, 11, 25, -7, 0, 0)).getTime();
        return nowBkk < targetBkk;
      }

      if (lockMode === 'custom_date') {
        if (!customUnlockTime) return false;
        const targetTime = new Date(customUnlockTime + ':00+07:00').getTime();
        return nowBkk < targetTime;
      }

      if (lockMode === 'per_box') {
        const tStr = boxUnlockTimes[boxIndex] || customUnlockTime;
        if (!tStr) return false;
        const targetTime = new Date(tStr + ':00+07:00').getTime();
        return nowBkk < targetTime;
      }

      return false;
    }
`;

// Insert the JS engine right before // ================= 3D SCENE & GIFT BOXES =================
merged = merged.replace(
  '// ================= 3D SCENE & GIFT BOXES =================',
  `${scriptInjection}\n    // ================= 3D SCENE & GIFT BOXES =================`
);

// Update drawPadlock check on gift boxes:
// Replace line 2183 `if (giftLocked) drawPadlock(bowP.x, bowP.y - bs * 2.1, bs * 1.5, box);`
merged = merged.replace(
  'if (giftLocked) drawPadlock(bowP.x, bowP.y - bs * 2.1, bs * 1.5, box);',
  'if (isBoxLocked(i)) drawPadlock(bowP.x, bowP.y - bs * 2.1, bs * 1.5, box);'
);

// Update openGiftModal: check isBoxLocked(boxIndex)
merged = merged.replace(
  'if (giftLocked) { showLockToast(boxIndex); return; }',
  'if (isBoxLocked(boxIndex)) { showLockToast(boxIndex); return; }'
);

// Update showLockToast:
const updatedShowLockToast = `
    function showLockToast(boxIndex) {
      pendingBoxIndex = boxIndex || 0;
      const box = giftBoxes[pendingBoxIndex];
      if (box) box.shake = 1;
      playThud();
      updateCountdown();

      const lockMain = document.getElementById('lockToastMain');
      if (lockMain) {
        if (lockMode === 'per_box') {
          lockMain.innerHTML = '🔒 กล่องที่ ' + (pendingBoxIndex + 1) + ' ยังเปิดไม่ได้นะ<br>' + customLockToastMsg;
        } else {
          lockMain.innerHTML = customLockToastMsg.replace(/\\n/g, '<br>');
        }
      }

      lockToast.classList.add('show');
      clearTimeout(lockToastTimer);
      lockToastTimer = setTimeout(hideLockToast, 7000);
    }
`;
merged = merged.replace(
  /function showLockToast\(boxIndex\) \{[\s\S]*?clearTimeout\(lockToastTimer\);\s*lockToastTimer = setTimeout\(hideLockToast, 7000\);\s*\}/,
  updatedShowLockToast.trim()
);

// Update updateCountdown implementation to support 4 modes & Asia/Bangkok
const updatedUpdateCountdown = `
    let cdState = { d: 0, h: 0, m: 0, s: 0 };
    function updateCountdown() {
      const nowBkk = getBangkokTime(new Date());
      let targetTime = null;
      let isUnlockedAll = false;

      if (lockMode === 'immediate' || previewUnlocked) {
        isUnlockedAll = true;
      } else if (lockMode === 'christmas') {
        const year = nowBkk.getFullYear();
        targetTime = new Date(Date.UTC(year, 11, 25, -7, 0, 0)).getTime();
        isUnlockedAll = nowBkk.getTime() >= targetTime;
      } else if (lockMode === 'custom_date') {
        if (customUnlockTime) {
          targetTime = new Date(customUnlockTime + ':00+07:00').getTime();
          isUnlockedAll = nowBkk.getTime() >= targetTime;
        } else {
          isUnlockedAll = true;
        }
      } else if (lockMode === 'per_box') {
        const times = boxUnlockTimes.map((t, idx) => ({
          idx,
          ms: new Date((t || customUnlockTime) + ':00+07:00').getTime()
        })).filter(t => t.ms > nowBkk.getTime());

        if (times.length > 0) {
          times.sort((a, b) => a.ms - b.ms);
          targetTime = times[0].ms;
          isUnlockedAll = false;
        } else {
          isUnlockedAll = true;
        }
      }

      let diff = 0;
      if (targetTime && !isUnlockedAll) {
        diff = Math.max(0, targetTime - nowBkk.getTime());
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      cdState = { d, h, m, s: sec };
      const pad2 = (n) => String(n).padStart(2, '0');
      cdD.textContent = d;
      cdH.textContent = pad2(h);
      cdM.textContent = pad2(m);
      cdS.textContent = pad2(sec);

      countdownEl.classList.toggle('done', isUnlockedAll);
      countdownEl.style.display = showCountdownCard ? 'block' : 'none';

      cdTitle.textContent = isUnlockedAll
        ? '🎅 ปลดล็อกของขวัญแล้ว! Merry Christmas!'
        : (customCdTitle || '🎄 อีกเท่าไหร่ถึงเวลาเปิดของขวัญ');

      const anyBoxLocked = giftBoxes.some((_, i) => isBoxLocked(i));
      giftLocked = anyBoxLocked;

      cdSub.textContent = isUnlockedAll
        ? 'กล่องของขวัญปลดล็อกแล้ว 🎁'
        : (lockMode === 'per_box' ? '🔒 แต่ละกล่องมีเวลาเปิดต่างกัน' : '🔒 กล่องของขวัญจะเปิดได้เมื่อถึงเวลา');

      if (lockToastTime) {
        lockToastTime.textContent = isUnlockedAll
          ? '✨ ปลดล็อกเรียบร้อยแล้ว'
          : \`เหลืออีก \${d} วัน \${pad2(h)}:\${pad2(m)}:\${pad2(sec)}\`;
      }

      const st = String(anyBoxLocked);
      if (wishCta && wishCta.dataset.state !== st) {
        wishCta.dataset.state = st;
        wishCta.textContent = anyBoxLocked
          ? '🔒 มีกล่องของขวัญที่ยังล็อกอยู่ — รอนับถอยหลังถึงเวลาเปิดนะ'
          : '🎁 คลิกที่กล่องของขวัญใต้ต้นไม้เพื่อเปิดดูรูปด้านใน';
      }
    }
`;
merged = merged.replace(
  /let cdState = \{ d: 0, h: 0, m: 0, s: 0 \};[\s\S]*?if \(wasLocked && !giftLocked && isDay && hasStarted\) unlockCelebration\(\);\s*\}/,
  updatedUpdateCountdown.trim()
);

// Update decorations execution:
// 1. Santa: in drawSantaFrame
merged = merged.replace(
  'function drawSantaFrame(dt) {',
  'function drawSantaFrame(dt) {\n      if (!decorSettings.santa) return;'
);
// 2. Props: in drawProp
merged = merged.replace(
  'function drawProp(p) {',
  'function drawProp(p) {\n      if (!decorSettings.props) return;'
);
// 3. Balls: in drawBalls
merged = merged.replace(
  'function drawBalls(front) {',
  'function drawBalls(front) {\n      if (!decorSettings.balls) return;'
);
// 4. Landscape: in drawBackdrop
merged = merged.replace(
  'function drawBackdrop(fade) {',
  'function drawBackdrop(fade) {\n      if (!decorSettings.landscape) return;'
);

// Inject SFX and sound triggers into startExperience, replayIntro, runGiftOpenSequence
merged = merged.replace(
  'function startExperience() {',
  'function startExperience() {\n      playTreeOpenSFX();\n      playLastChristmasMusic();'
);

merged = merged.replace(
  'function replayIntro() {',
  'function replayIntro() {\n      playTreeOpenSFX();\n      playLastChristmasMusic();'
);

merged = merged.replace(
  'void cssGiftBox.offsetWidth;',
  'void cssGiftBox.offsetWidth;\n      playPopSFX();'
);

merged = merged.replace(
  'spawnModalConfetti();',
  'spawnModalConfetti();\n        playGiftboxSFX();\n        playPopSFX();'
);

// Inject MANITA Tree Integrator & postMessage handler at the end of <script>
const manitaIntegratorHtml = `
    // ================= MANITA RECIPIENT & DATA INTEGRATOR =================
    (function initManitaTree() {
      const params = new URLSearchParams(window.location.search);
      const isCleanView = params.get('view') === 'recipient' || params.get('view') === 'preview' || params.get('controls') === 'hide' || !params.has('raw');

      if (isCleanView) {
        document.body.classList.add('recipient-mode', 'manita-clean');
        isRecipientMode = true;
        if (typeof controls !== 'undefined' && controls) {
          controls.classList.add('hidden-ui');
          controls.style.display = 'none';
        }
        if (typeof setupModal !== 'undefined' && setupModal) {
          setupModal.classList.remove('open');
          setupModal.style.display = 'none';
        }
        setTimeout(() => {
          if (typeof startExperience === 'function' && !hasStarted) {
            startExperience();
          }
        }, 200);
      }

      function applyCustomData(data) {
        if (!data) return;
        if (data.wishTitle && typeof titleText !== 'undefined' && titleText) {
          titleText.textContent = data.wishTitle;
        }
        if (data.wishMessage && typeof wishBannerText !== 'undefined' && wishBannerText) {
          wishBannerText.textContent = data.wishMessage;
        }
        if (data.wishMessage && typeof wishInput !== 'undefined' && wishInput) {
          wishInput.value = data.wishMessage;
        }
        if (data.treeTheme && typeof themes !== 'undefined' && themes[data.treeTheme]) {
          if (typeof setTheme === 'function') {
            setTheme(data.treeTheme);
          }
        }
        if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
          uploadedPhotos = data.photos.filter(p => p.url).map((p, i) => ({
            url: p.url,
            name: p.caption || ('photo_' + i)
          }));
        }

        // Apply Creator Lock & Decoration Settings
        if (data.lockMode) selectLockMode(data.lockMode);
        if (data.unlockDate) customUnlockTime = data.unlockDate;
        if (data.boxUnlockDates && Array.isArray(data.boxUnlockDates)) boxUnlockTimes = data.boxUnlockDates;
        if (data.lockMessage) customLockToastMsg = data.lockMessage;
        if (data.showCountdown !== undefined) {
          showCountdownCard = !!data.showCountdown;
          const cdToggle = document.getElementById('toggleShowCountdown');
          if (cdToggle) cdToggle.checked = showCountdownCard;
        }
        if (data.countdownTitle) customCdTitle = data.countdownTitle;
        if (data.decorations) decorSettings = { ...decorSettings, ...data.decorations };
        if (data.isRecipient) {
          isRecipientMode = true;
          document.body.classList.add('recipient-mode', 'manita-clean');
        }

        updateCountdown();
      }

      // Read from localStorage draft if available
      try {
        const raw = localStorage.getItem('manita_studio_draft_v1');
        if (raw) {
          const cfg = JSON.parse(raw);
          applyCustomData({
            wishMessage: cfg.treeWish,
            wishTitle: cfg.treeTitle,
            treeTheme: cfg.treeTheme,
            photos: cfg.photos,
            lockMode: cfg.treeLockMode,
            unlockDate: cfg.treeUnlockDate,
            boxUnlockDates: cfg.treeBoxUnlockDates,
            lockMessage: cfg.treeLockMessage,
            showCountdown: cfg.treeShowCountdown,
            countdownTitle: cfg.treeCountdownTitle,
            decorations: cfg.treeDecorations
          });
        }
      } catch(e) {}

      window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'MANITA_TREE_SYNC') {
          applyCustomData(e.data);
        }
      });
    })();
`;

merged = merged.replace('</body>', `${manitaIntegratorHtml}\n</body>`);

// Write to public/experiences/ChristmasTree.html and dist/experiences/ChristmasTree.html
fs.writeFileSync(path.resolve('public/experiences/ChristmasTree.html'), merged, 'utf8');
console.log('Successfully merged ChristmasTree into public/experiences/ChristmasTree.html');

try {
  fs.writeFileSync(path.resolve('dist/experiences/ChristmasTree.html'), merged, 'utf8');
  console.log('Successfully updated dist/experiences/ChristmasTree.html');
} catch(e) {}
