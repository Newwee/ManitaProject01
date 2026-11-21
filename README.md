# MANITA — Create Something Meaningful

> **A private creative sanctuary for creating memorable digital gifts.**  
> Developed and designed by **MANITA Team**.

---

## 🌟 ภาพรวมโครงการ (Project Overview)

**MANITA (มานิตา)** คือแพลตฟอร์มสำหรับสร้างสรรค์ของขวัญดิจิทัล (Digital Gift Platform) ที่ผสมผสานความรู้สึกอบอุ่น ศิลปะ และอินเทอร์แอคทีฟเข้าไว้ด้วยกันอย่างลงตัว ให้ผู้ใช้สามารถออกแบบของขวัญดิจิทัลส่วนตัว เลือกธีมเทศกาล ใส่รูปภาพความทรงจำ กำหนดรหัสผ่าน 6 หลัก แชทจำลองความรู้สึก แบบทดสอบทายใจ การ์ดขูดรางวัลลับ แผ่นเสียงดนตรี และคูปองสิทธิพิเศษที่กดใช้ได้จริง!

---

## 🎨 ธีมพรีเมียม 4 สไตล์ (4 Visual Themes)

1. **Warm Scrapbook (วันครบรอบ / วาเลนไทน์)** — โทนกระดาษอุ่นๆ ตราประทับขี้ผึ้งสีแดงเลือดหมู เทปวาชิ และฟอนต์ลายมือสุดคลาสสิก
2. **Y2K Cyber Pixel (วันเกิด / เพื่อนสนิท)** — สไตล์ Cyber Pixel ยุค 2000s หน้าต่าง Windows 98 โทนสีนีออนชมพู-ฟ้า และฟอนต์พิกเซล 8-bit
3. **Midnight Cinema (ขอเป็นแฟน / ดินเนอร์)** — บรรยากาศโรงหนังใต้แสงเทียน ตั๋วทองคำ VIP โทนมืดหรูหรา และฟอนต์ Serif ประณีต
4. **Festive Celebration (คริสต์มาส / ปีใหม่ / วันสำเร็จการศึกษา)** — กล่องของขวัญสีเขียวมรกตและทองประกาย ริบบิ้นของขวัญ และประกายหิมะอบอุ่น

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 1. ประสบการณ์ของผู้รับ (Interactive Gift Journey)
- **3D Envelope & Wax Seal**: แตะเพื่อเปิดผนึกขี้ผึ้ง ซองจดหมาย 3D พับเปิด และการ์ดเลื่อนขึ้นมาพร้อมเสียงเพลง
- **Time Capsule**: ระบบล็อกเวลาของขวัญ ตั้งวัน/เวลาที่อนุญาตให้เปิด พร้อมนาฬิกานับถอยหลัง (Countdown)
- **6-Digit Passcode**: แป้นพิมพ์รหัสผ่าน 6 หลัก พร้อมคำใบ้ เสียงคลิก และเอฟเฟกต์สั่นเตือนเมื่อผิด
- **Simulated Chat**: หน้าจอแชทจำลองเสมือนจริง พร้อมสถานะออนไลน์ จุดพิมพ์ข้อความ (...) และตัวเลือกตอบกลับแบบอินเทอร์แอคทีฟ
- **Mini Quiz**: แบบทดสอบทายใจ 3 ข้อ พร้อมคะแนนและการเฉลย
- **Scratch-to-Reveal Card**: การ์ดขูดสีทอง ใช้เมาส์หรือนิ้วขูดเพื่อเผยรางวัลลับใต้การ์ด
- **Spinning Vinyl Record**: แผ่นเสียงหมุนเล่นเพลงสังเคราะห์ตามธีม (Web Audio API)
- **Polaroid Album & Stickers**: กรอบรูปโพลารอยด์ แอนิเมชันล้างรูป (Developing Effect) และสติกเกอร์ตกแต่ง
- **Redeemable Coupons**: คูปองสิทธิพิเศษที่ผู้รับสามารถแตะเพื่อ "กดใช้สิทธิ์ได้จริง" พร้อมตราประทับ REDEEMED

### 2. ห้องสร้างสรรค์ของผู้แต่ง (MANITA Studio — Creator Mode)
- ออกแบบและปรับแต่งข้อความ คำใบ้ คำถาม และของรางวัลลับได้อย่างอิสระ
- **ระบบบีบอัดรูปภาพอัตโนมัติ (Image Compression)**:
  - จำกัดรูปไม่เกิน 5MB
  - บีบอัดรูปภาพด้วย HTML5 Canvas ให้อัตโนมัติลงมาไม่เกิน **1000 KB (≤ 1MB)** ตามมาตรฐาน
  - แสดงสถานะขนาดไฟล์ก่อนและหลังการบีบอัดแบบเรียลไทม์
- **Dynamic QR Code & Share Link**: สร้าง QR Code และลิงก์สำหรับส่งต่อให้ผู้รับเปิดดูของขวัญได้ทันที พร้อมปุ่มดาวน์โหลดรูป QR Code (PNG)

---

## ⚡ สถาปัตยกรรม & การเชื่อมต่อ Supabase

ระบบรองรับสถาปัตยกรรมแบบ **Hybrid Storage**:
1. **Supabase Cloud Database**: เมื่อเชื่อมต่อ Supabase จะทำการบันทึกข้อมูลของขวัญลงในตาราง `manita_gifts`
2. **URL Data Compression (Zero-Downtime Fallback)**: เข้ารหัสข้อมูลของขวัญลงใน Query Parameter ผ่าน LZString ทำให้สามารถแชร์และสแกน QR Code ได้ทันทีแม้จะยังไม่ได้สร้างฐานข้อมูล

### ตั้งค่า Supabase Table
คัดลอกคำสั่ง SQL ใน [supabase/schema.sql](file:///c:/Users/New%20JA/Downloads/Manita/supabase/schema.sql) ไปรันใน **Supabase Dashboard > SQL Editor**:

```sql
create table if not exists public.manita_gifts (
  id text primary key,
  title text not null default 'MANITA Digital Gift',
  theme text not null default 'scrapbook',
  config jsonb not null,
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.manita_gifts enable row level security;
create policy "Public read gifts" on public.manita_gifts for select using (true);
create policy "Public insert gifts" on public.manita_gifts for insert with check (true);
create policy "Public update gifts" on public.manita_gifts for update with check (true);
```

### การตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` สำหรับการใช้งานในเครื่อง หรือตั้งค่าใน **Vercel Project Settings > Environment Variables**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Xo74Bbfm9KhDDezjLrLdzg_HPoQqX8s
SUPABASE_SECRET_KEY=your_supabase_secret_key_here
```

> **ความปลอดภัยสำคัญ**: ไฟล์ `.env` และ `.env.local` ถูกเพิ่มใน `.gitignore` เรียบร้อยแล้ว เพื่อป้องกันไม่ให้ Secret Key หลุดขึ้น Public Repository

---

## 🚀 การติดตั้งและพัฒนาในเครื่อง (Local Development)

```bash
# ติดตั้ง dependencies
npm install

# รันโหมด Development
npm run dev

# ทดสอบ Build สำหรับ Production
npm run build
```

---

## ☁️ การนำขึ้น Vercel (Deploy to Vercel)

โปรเจกต์นี้มาพร้อมไฟล์ `vercel.json` สำหรับรองรับ Single Page Application (SPA Routing) โดยอัตโนมัติ:

1. เข้าสู่ [Vercel Dashboard](https://vercel.com)
2. คลิก **Add New > Project** และ Import repository `Newwee/ManitaProject01`
3. ในส่วน Build Settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. ในส่วน **Environment Variables** ให้ใส่:
   - `VITE_SUPABASE_URL`: URL ของ Supabase Project
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_Xo74Bbfm9KhDDezjLrLdzg_HPoQqX8s`
5. คลิก **Deploy** พร้อมใช้งานทันที!

---

## 👥 ทีมงานและลิขสิทธิ์

- **Brand**: MANITA
- **Product**: MANITA Studio
- **Creator**: MANITA Team
- © 2026 MANITA. All rights reserved.
