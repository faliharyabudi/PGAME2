// ══════════════════════════════════════════════════════════
//  1_config.js  -  KONFIGURASI & FUNGSI BANTU
//  City Fixer - SDG 11 (Kota & Permukiman Berkelanjutan)
// ══════════════════════════════════════════════════════════

// Setup kanvas utama
const cv = document.getElementById('c');
const cx = cv.getContext('2d');
const W = 1100, H = 620;
cv.width = W; cv.height = H;

// ── KONSTANTA LEVEL ────────────────────────────────────────
const LEVELS = [
  { name: 'LEVEL 1: SIANG CERAH',   time: 40, skyColor: '#4CA1AF', buildingBase: [100,140,180], overlay: 'rgba(0,0,0,0)',        rain: false, cloudRate: 0.001 },
  { name: 'LEVEL 2: SORE BERPOLUSI',time: 40, skyColor: '#ff7b54', buildingBase: [90, 60, 50],  overlay: 'rgba(40,15,0,0.25)',   rain: false, cloudRate: 0.003 },
  { name: 'LEVEL 3: MALAM KELAM',   time: 45, skyColor: '#07091a', buildingBase: [20, 25, 35],  overlay: 'rgba(8,12,25,0.6)',    rain: false, cloudRate: 0.005 },
  { name: 'LEVEL 4: HUJAN BADAI',   time: 45, skyColor: '#1a2530', buildingBase: [25, 30, 35],  overlay: 'rgba(5,10,20,0.7)',    rain: true,  cloudRate: 0.006 },
  { name: 'LEVEL 5: PUSAT POLUSI',  time: 50, skyColor: '#300010', buildingBase: [35, 10, 10],  overlay: 'rgba(40,0,10,0.65)',   rain: true,  cloudRate: 0.008 }
];

const DIFF_SPEED = [0.7, 1.0, 1.4]; // mudah, normal, susah

// ── KATEGORI KOTAK SAMPAH ──────────────────────────────────
const TRASH_CAT = ['organik', 'plastik', 'logam'];
const BIN_LABEL = { organik: 'Organik',    plastik: 'Plastik',   logam: 'Logam/Kaleng' };
const BIN_COLOR = { organik: '#4caf50',    plastik: '#ffd740',   logam: '#42a5f5'       };
const BIN_DARK  = { organik: '#2e7d32',    plastik: '#f57f17',   logam: '#1565c0'       };
const BAG_MAX   = 5;

// ── FUNGSI BANTU MATEMATIKA ────────────────────────────────
function dist(x1, y1, x2, y2)         { return Math.hypot(x2 - x1, y2 - y1); }
function clamp(v, a, b)               { return Math.max(a, Math.min(b, v)); }
function rand(a, b)                   { return a + Math.random() * (b - a); }
function rectCircle(rx, ry, rw, rh, cx2, cy2, cr) {
  const nx = clamp(cx2, rx, rx + rw), ny = clamp(cy2, ry, ry + rh);
  return dist(cx2, cy2, nx, ny) < cr;
}

// ── FUNGSI GAMBAR BANTU ────────────────────────────────────
function rrect(x, y, w, h, r, fill = true, stroke = false, doStroke = false) {
  cx.beginPath();
  cx.moveTo(x + r, y); cx.lineTo(x + w - r, y); cx.arcTo(x + w, y, x + w, y + r, r);
  cx.lineTo(x + w, y + h - r); cx.arcTo(x + w, y + h, x + w - r, y + h, r);
  cx.lineTo(x + r, y + h); cx.arcTo(x, y + h, x, y + h - r, r);
  cx.lineTo(x, y + r); cx.arcTo(x, y, x + r, y, r); cx.closePath();
  if (fill) cx.fill(); if (doStroke) cx.stroke();
}

// Partikel burst efek
function burst(x, y, col, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, sp = rand(60, 180);
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: .8, r: 3 + rand(0, 3), col });
  }
}

// Teks mengambang (+poin, notifikasi)
function addFloat(x, y, t, c) { floats.push({ x, y, vy: -55, life: 1.5, txt: t, col: c }); }
