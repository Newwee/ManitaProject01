// MANITA Studio Presets & Themes

export const PRESET_CATEGORIES = [
  {
    id: 'chat_scratch',
    name: 'แชท + การ์ดขูด',
    desc: 'เปิดซองจดหมาย แชทจำลองความรู้สึก ตอบ Quiz และขูดการ์ดลุ้นรางวัลลับ',
    icon: '💌',
    badge: 'ยอดนิยม'
  },
  {
    id: 'chat_camera',
    name: 'แชท + กล้องถ่ายรูป',
    desc: 'เปิดซองจดหมาย แชทจำลองความรู้สึก ตอบ Quiz และกดชัตเตอร์ปริ้นท์รูปภาพ',
    icon: '📸',
    badge: 'ใหม่ล่าสุด'
  },
  {
    id: 'christmas_tree',
    name: 'ต้นคริสมาส 3D',
    desc: 'ต้นคริสต์มาส 3 มิติหมุนได้ หิมะตก และเปิดกล่องของขวัญใต้ต้นไม้',
    icon: '🎄',
    badge: 'Cinematic 3D'
  },
  {
    id: 'arrow_birthday',
    name: 'ยิงธนูอวยพรวันเกิด',
    desc: 'ยิงธนูระเบิดประกายไฟ เปิดเค้กวันเกิด 3 มิติ และการ์ดอวยพรสุดซึ้ง',
    icon: '🏹',
    badge: 'Interactive'
  },
  {
    id: 'ascii_christmas',
    name: 'ต้นคริสต์มาส ASCII 3D',
    desc: 'ต้นคริสต์มาสอักษร ASCII 3 มิติหมุนได้ เปิดกล่องของขวัญและแตะลูกบอลรับคำอวยพร',
    icon: '✨',
    badge: 'ASCII 3D'
  }
];

export const THEME_PRESETS = {
  scrapbook: {
    id: 'scrapbook',
    name: 'Warm Scrapbook',
    occasion: 'วันครบรอบ / วาเลนไทน์',
    emoji: '💌',
    badge: 'วันครบรอบ ♡',
    qrColor: '#B84A4E',
    particles: ['♥', '♡', '🌸', '✨'],
    introTitle: 'เรามีอะไรจะให้ดู...',
    introSub: 'แตะที่ตราประทับหัวใจเพื่อเปิดซองจดหมาย',
    letterText: 'มีอะไรจะบอกด้วยแหละ 💌',
    passcodeHint: 'วันครบรอบของเรา (ลองกด 231069)',
    chatName: 'คนพิเศษของเธอ ♡',
    chatAvatar: '🐻',
    chatMsg1: 'เธอทำอะไรอยู่ ว่างไหม?',
    chatDialog: [
      {
        userChoice: 'ว่างสิ มีอะไรเหรอ? 👀',
        botReplies: ['คือเราแอบเตรียมอะไรบางอย่างไว้ให้เธอแหละ 🫣', 'ลองตอบคำถาม 3 ข้อนี้ให้ถูกก่อนถึงจะปลดล็อกของขวัญได้นะ!']
      },
      {
        userChoice: 'งานยุ่งนิดหน่อย แต่มีเวลาให้เธอเสมอ ❤️',
        botReplies: ['งุ้ย น่ารักที่สุดในโลกเลยยยย 🥰', 'งั้นมาพักสมองเล่นเกมตอบคำถามชิงของขวัญกันหน่อยดีกว่า!']
      }
    ],
    scratchSecret: 'คูปองตามใจเธอ 1 วันเต็ม! 💖',
    voiceCaption: '"ขอบคุณที่เข้ามาเป็นความสุขของเรานะ ♡"',
    coupons: [
      '🍜 คูปองเลี้ยงชาบู / หมูกระทะ 1 มื้อ',
      '🤗 คูปองกอดฟรี + ตามใจ 1 วันเต็ม'
    ],
    notes: [261.63, 329.63, 392.00, 493.88, 220.00, 261.63, 329.63, 392.00]
  },
  y2k: {
    id: 'y2k',
    name: 'Y2K Cyber Pixel',
    occasion: 'วันเกิด / เพื่อนสนิท',
    emoji: '👾',
    badge: 'HBD BESTIE 🎂',
    qrColor: '#FF3399',
    particles: ['⭐', '👾', '💖', '🎉', '✨'],
    introTitle: 'HAPPY BIRTHDAY!',
    introSub: 'กดเปิดไฟล์ของขวัญวันเกิดสุดพิเศษ',
    letterText: 'สุขสันต์วันเกิดนะเพื่อนรัก! 🎂✨',
    passcodeHint: 'วันเกิดของเธอไง (ลองกด 231069)',
    chatName: 'Bestie ตัวแสบ 👾',
    chatAvatar: '🐰',
    chatMsg1: 'วันนี้วันเกิดใครน้าาา พร้อมรับของขวัญยัง?',
    chatDialog: [
      {
        userChoice: 'พร้อมมากกก ขอของขวัญชิ้นใหญ่ๆ นะ 🎁',
        botReplies: ['5555 ใจเย็นพ่อคุณ/แม่คุณ! ของขวัญน่ะมีอยู่แล้ว 🎮', 'แต่ต้องผ่าน Quiz พิสูจน์ความเป็นเพื่อนแท้ก่อนนะเว้ย!']
      },
      {
        userChoice: 'อายุเพิ่มขึ้นอีกปีแล้ว แก่ไปด้วยกันนะ 🤣',
        botReplies: ['อย่าเพิ่งบ่นแก่จ้าาา หน้ายังเด็กอยู่! 💥', 'มาเล่นเกมตอบคำถามทดสอบความจำกันหน่อยดีกว่า ลุยยย!']
      }
    ],
    scratchSecret: 'เลี้ยงชานมไข่มุกฟรี 2 แก้ว! 🧋',
    voiceCaption: '"ขอให้ปีนี้เป็นปีที่โคตรปังและมีความสุขที่สุด!"',
    coupons: [
      '🧋 คูปองชานมไข่มุกแก้วใหญ่ฟรี!',
      '📸 คูปองถ่ายตู้สติกเกอร์ด้วยกัน 1 รอบ'
    ],
    notes: [523.25, 659.25, 783.99, 1046.50, 587.33, 698.46, 880.00, 783.99]
  },
  cinema: {
    id: 'cinema',
    name: 'Midnight Cinema',
    occasion: 'ขอเป็นแฟน / ดินเนอร์ใต้แสงเทียน',
    emoji: '🎬',
    badge: 'SPECIAL NIGHT 🌙',
    qrColor: '#E8B86D',
    particles: ['✨', '🍷', '🌙', '💫', '🕯️'],
    introTitle: 'Every Moment with You',
    introSub: 'แตะที่ตั๋วหนังเพื่อเปิดดูบันทึกความทรงจำของเรา',
    letterText: 'เรื่องราวที่ดีที่สุดในชีวิตเรา คือการมีเธอ 🕯️',
    passcodeHint: 'วันที่ความทรงจำเริ่มต้น (ลองกด 231069)',
    chatName: 'My Special Person 🕯️',
    chatAvatar: '🍷',
    chatMsg1: 'คืนนี้ท้องฟ้าสวยดีนะ... คิดถึงกันอยู่หรือเปล่า?',
    chatDialog: [
      {
        userChoice: 'คิดถึงสิ กำลังคิดถึงเธอพอดีเลย 🌙',
        botReplies: ['ฟังแล้วใจฟูมากเลยนะ... 🤍', 'เราตั้งใจทำตั๋วหนังบันทึกความทรงจำนี้ขึ้นมาให้เธอคนเดียวเลย']
      },
      {
        userChoice: 'ดูหนังรอบดึกคนเดียวเหงาไหม ชวนได้นะ 🎬',
        botReplies: ['งั้นรอบต่อไปต้องมาดูด้วยกันแล้วล่ะ ห้ามเบี้ยวนะ 🕯️', 'ลองตอบคำถามความทรงจำของเราดูสิ มีรางวัลพิเศษซ่อนอยู่']
      }
    ],
    scratchSecret: 'ดินเนอร์มื้อพิเศษใต้แสงเทียน 🍷',
    voiceCaption: '"ไม่ว่าจะผ่านไปกี่ปี ก็ยังอยากมีเธออยู่ข้างๆ เสมอ"',
    coupons: [
      '🎬 คูปองดูหนัง VIP รอบดึกด้วยกัน 1 เรื่อง',
      '☕ คูปองชงกาแฟ / ขนมโปรดเสิร์ฟถึงที่'
    ],
    notes: [329.63, 392.00, 493.88, 587.33, 349.23, 440.00, 523.25, 659.25]
  },
  festive: {
    id: 'festive',
    name: 'Festive Celebration',
    occasion: 'คริสต์มาส / ปีใหม่ / วันจบการศึกษา',
    emoji: '🎄',
    badge: 'SEASON GREETING 🎄',
    qrColor: '#13382C',
    particles: ['❄️', '🎄', '✨', '🎁', '⭐'],
    introTitle: 'Warmest Wishes ✨',
    introSub: 'ของขวัญส่งท้ายปีสำหรับคนเก่ง',
    letterText: 'ยินดีและขอบคุณสำหรับทุกอย่างในปีนี้นะ 🎁',
    passcodeHint: 'รหัสเปิดกล่องของขวัญ (ลองกด 231069)',
    chatName: 'Santa Claus ส่วนตัว 🎅',
    chatAvatar: '🦌',
    chatMsg1: 'โฮ่ โฮ่ โฮ่! มีของขวัญมาส่งให้คนเก่งครับ',
    chatDialog: [
      {
        userChoice: 'เย้! ปีนี้หนูเป็นเด็กดี ขอของขวัญหน่อยยย 🎁',
        botReplies: ['แน่นอนอยู่แล้ว! ซานต้าตรวจเช็กแล้วว่าเธอเก่งมาก 🎄', 'แต่ต้องช่วยซานต้าตอบคำถามทบทวนปีนี้ก่อนนะฮะ!']
      },
      {
        userChoice: 'เหนื่อยมาทั้งปี ขอกำลังใจก้อนโตๆ หน่อยนะ ❄️',
        botReplies: ['กอดแน่นๆ เลยนะคนเก่ง เธอผ่านทุกเรื่องมาได้ยอดเยี่ยมมาก ✨', 'เปิดกล่องความทรงจำนี้ดู แล้วไปลุ้นของรางวัลกัน!']
      }
    ],
    scratchSecret: 'ขอพรได้ 1 ข้อ จัดให้ทันที! 🌟',
    voiceCaption: '"เก่งมากแล้วนะ ขอให้ทุกวันต่อจากนี้ใจดีกับเธอ"',
    coupons: [
      '☕ คูปองกาแฟ / ขนมหวานร้านโปรด 1 เซ็ต',
      '🚗 คูปองสารถีขับรถพาเที่ยว 1 ทริป'
    ],
    notes: [392.00, 329.63, 349.23, 392.00, 523.25, 493.88, 440.00, 392.00]
  }
};

export const AVAILABLE_STICKERS = ['💖', '⭐', '👑', '📸', '✨', '🎂', '🧸', '🍀', '☕', '🍷', '🎄', '👾'];

export const DEFAULT_QUIZZES = [
  {
    question: 'เราเจอกันครั้งแรกที่ไหน?',
    options: ['โรงยิมพละ', 'คาเฟ่แถวบ้าน', 'ในออนไลน์'],
    correctIndex: 1
  },
  {
    question: 'เมนูโปรดที่ชอบกินด้วยกัน?',
    options: ['ชาบูหม่าล่า', 'ก๋วยเตี๋ยวเรือ', 'ซูชิแซลมอน'],
    correctIndex: 0
  },
  {
    question: 'สิ่งที่ชอบที่สุดในตัวกันและกัน?',
    options: ['รอยยิ้ม', 'เสียงหัวเราะ', 'ทุกอย่างที่เป็นเธอ'],
    correctIndex: 2
  }
];

export const SCRATCH_COLORS = [
  {
    id: 'gold',
    label: 'ทองหรูหรา (Classic Gold)',
    gradient: ['#D4AF37', '#FFF3C4', '#B8860B', '#E6C25B'],
    textColor: '#3E2A0A',
    subTextColor: '#5A4015',
    cardBorder: 'border-amber-300/80',
    cardBg: 'from-amber-50 to-rose-50',
    iconBg: 'bg-amber-100 text-amber-600',
    badgeBg: 'bg-amber-100 text-amber-600',
    previewHex: '#D4AF37',
    swatchGrad: 'linear-gradient(135deg, #D4AF37, #FFF3C4, #B8860B)'
  },
  {
    id: 'rosegold',
    label: 'โรสโกลด์ (Rose Gold)',
    gradient: ['#E89A98', '#FFDFE0', '#C56D75', '#F5B0B0'],
    textColor: '#4A1521',
    subTextColor: '#6B2533',
    cardBorder: 'border-rose-300/80',
    cardBg: 'from-rose-50 to-pink-50',
    iconBg: 'bg-rose-100 text-rose-600',
    badgeBg: 'bg-rose-100 text-rose-600',
    previewHex: '#E89A98',
    swatchGrad: 'linear-gradient(135deg, #E89A98, #FFDFE0, #C56D75)'
  },
  {
    id: 'silver',
    label: 'เงินแพลทินัม (Silver Foil)',
    gradient: ['#A8B0B8', '#F0F4F8', '#78828A', '#D0D8E0'],
    textColor: '#1E252B',
    subTextColor: '#333F48',
    cardBorder: 'border-slate-300/80',
    cardBg: 'from-slate-50 to-stone-50',
    iconBg: 'bg-slate-100 text-slate-600',
    badgeBg: 'bg-slate-100 text-slate-600',
    previewHex: '#A8B0B8',
    swatchGrad: 'linear-gradient(135deg, #A8B0B8, #F0F4F8, #78828A)'
  },
  {
    id: 'midnight',
    label: 'มิดไนท์โฮโล (Midnight Purple)',
    gradient: ['#583582', '#A879FF', '#321959', '#784BB8'],
    textColor: '#FFFFFF',
    subTextColor: '#E0D0FF',
    cardBorder: 'border-purple-400/80',
    cardBg: 'from-purple-950/20 to-indigo-950/20',
    iconBg: 'bg-purple-100 text-purple-600',
    badgeBg: 'bg-purple-100 text-purple-600',
    previewHex: '#583582',
    swatchGrad: 'linear-gradient(135deg, #583582, #A879FF, #321959)'
  },
  {
    id: 'ruby',
    label: 'แดงทับทิม (Ruby Red)',
    gradient: ['#B31221', '#FF858F', '#7A0A14', '#D12335'],
    textColor: '#FFFFFF',
    subTextColor: '#FFE0E3',
    cardBorder: 'border-red-400/80',
    cardBg: 'from-red-50 to-rose-50',
    iconBg: 'bg-red-100 text-red-600',
    badgeBg: 'bg-red-100 text-red-600',
    previewHex: '#B31221',
    swatchGrad: 'linear-gradient(135deg, #B31221, #FF858F, #7A0A14)'
  },
  {
    id: 'emerald',
    label: 'เขียวมรกต (Emerald Green)',
    gradient: ['#1E8449', '#A2D9CE', '#145A32', '#27AE60'],
    textColor: '#FFFFFF',
    subTextColor: '#D4EFDF',
    cardBorder: 'border-emerald-300/80',
    cardBg: 'from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-100 text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-600',
    previewHex: '#1E8449',
    swatchGrad: 'linear-gradient(135deg, #1E8449, #A2D9CE, #145A32)'
  },
  {
    id: 'sky',
    label: 'ฟ้าพาสเทล (Baby Sky Blue)',
    gradient: ['#3498DB', '#D6EAF8', '#1B4F72', '#5DADE2'],
    textColor: '#0A2540',
    subTextColor: '#154360',
    cardBorder: 'border-sky-300/80',
    cardBg: 'from-sky-50 to-blue-50',
    iconBg: 'bg-sky-100 text-sky-600',
    badgeBg: 'bg-sky-100 text-sky-600',
    previewHex: '#3498DB',
    swatchGrad: 'linear-gradient(135deg, #3498DB, #D6EAF8, #1B4F72)'
  }
];

export const MUSIC_TRACKS = [
  {
    id: 'auto',
    title: 'อัตโนมัติตามธีม / Preset',
    artist: 'MANITA Smart Audio',
    src: '',
    badge: 'ค่าเริ่มต้น'
  },
  {
    id: 'last_christmas',
    title: 'Last Christmas',
    artist: 'Wham! • Festive Edition',
    src: '/assets/Music/LastChristmas.mp3',
    badge: 'MP3'
  },
  {
    id: 'all_i_want',
    title: 'All I Want For Christmas Is You',
    artist: 'Mariah Carey • Holiday Classic',
    src: '/assets/Music/All I Want For Christmas Is You.mp3',
    badge: 'MP3'
  },
  {
    id: 'we_wish',
    title: 'We Wish You a Merry Christmas',
    artist: 'Christmas Carol • Warm Melody',
    src: '/assets/Music/We Wish You a Merry Christmas.mp3',
    badge: 'MP3'
  },
  {
    id: 'none',
    title: 'ปิดเพลงประกอบ (Silent)',
    artist: 'เล่นเฉพาะเอฟเฟกต์เสียง',
    src: '',
    badge: 'Mute'
  }
];
