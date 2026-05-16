// ══════════════════════════════════════════════════════════
//  3_entities.js  -  ENTITAS, ASET & FUNGSI SPAWN
//  Mengelola semua objek di dunia game
// ══════════════════════════════════════════════════════════

// ── PRELOAD GAMBAR ─────────────────────────────────────────
const monsterImg = new Image();
monsterImg.src = '../aset/monster-removebg-preview.png';

const trashImgs = [new Image(), new Image(), new Image()];
trashImgs[0].src = '../aset/sampah/sampah1.png'; // Organik
trashImgs[1].src = '../aset/sampah/sampah2.png'; // Plastik
trashImgs[2].src = '../aset/sampah/sampah3.png'; // Logam

// ── DEKLARASI VARIABEL ENTITAS ────────────────────────────
// Semua array ini di-reset setiap kali init() dipanggil
let P;           // Pemain (Player)
let trash;       // Sampah di lapangan
let lamps;       // Lampu jalan
let cars;        // Kendaraan (rintangan)
let parts;       // Partikel efek
let npcs;        // Warga kota (NPC)
let pollClouds;  // Monster polusi
let raindrops;   // Tetes hujan
let powerups;    // Item super mode
let heartups;    // Item nyawa tambahan
let bullets;     // Peluru semprotan
let gunups;      // Item semprotan
let bins;        // Kotak sampah

let heartTimer = 0;

// ── FUNGSI SPAWN ───────────────────────────────────────────

function spawnNPC() {
  let x, y, ok;
  do {
    x = rand(60, W - 60); y = rand(60, H - 60);
    ok = dist(x, y, W / 2, H / 2) > 80;
    if (bldg.some(([bx, by, bw, bh]) => x+11>bx && x-11<bx+bw && y+11>by-25 && y-11<by+bh)) ok = false;
  } while (!ok);
  npcs.push({ x, y, r: 11, vx: 0, vy: 0, scared: false, scaredT: 0, tx: x, ty: y,
              wt: rand(1, 3), col: `hsl(${~~rand(20,340)},70%,65%)`, facingDir: 1, bobT: rand(0, 10) });
}

function spawnPollCloud() {
  const side = Math.floor(rand(0, 4));
  let x, y;
  if (side === 0)      { x = rand(50, W-50); y = -40; }
  else if (side === 1) { x = rand(50, W-50); y = H+40; }
  else if (side === 2) { x = -40; y = rand(50, H-50); }
  else                 { x = W+40; y = rand(50, H-50); }
  pollClouds.push({ x, y, r: 22, vx: 0, vy: 0, pulse: rand(0, 6.28), hp: 3, hitT: 0 });
}

function spawnTrash(n = 1) {
  for (let i = 0; i < n; i++) {
    let x, y, ok;
    do {
      x = rand(70, W-70); y = rand(80, H-80);
      ok = dist(x, y, W/2, H/2) > 70;
      if (bldg.some(([bx, by, bw, bh]) => x+13>bx && x-13<bx+bw && y+13>by-25 && y-13<by+bh)) ok = false;
    } while (!ok);
    trash.push({ x, y, r: 13, bob: rand(0, 6.28), type: Math.floor(rand(0, 3)) });
  }
}

function spawnPowerup() {
  if (powerups.length > 0) return;
  let x, y, ok;
  do {
    x = rand(100, W-100); y = rand(100, H-100); ok = true;
    if (bldg.some(([bx, by, bw, bh]) => x+16>bx && x-16<bx+bw && y+16>by-25 && y-16<by+bh)) ok = false;
  } while (!ok);
  powerups.push({ x, y, r: 16, bob: rand(0, 6.28) });
}

function spawnGunup() {
  if (gunups.length > 0) return;
  let x, y, ok;
  do {
    x = rand(100, W-100); y = rand(100, H-100); ok = true;
    if (bldg.some(([bx, by, bw, bh]) => x+14>bx && x-14<bx+bw && y+14>by-25 && y-14<by+bh)) ok = false;
  } while (!ok);
  gunups.push({ x, y, r: 14, bob: rand(0, 6.28) });
}

function spawnHeartup() {
  if (heartups.length >= 2) return;
  let x, y, ok;
  do {
    x = rand(100, W-100); y = rand(100, H-100); ok = true;
    if (bldg.some(([bx, by, bw, bh]) => x+14>bx && x-14<bx+bw && y+14>by-25 && y-14<by+bh)) ok = false;
  } while (!ok);
  heartups.push({ x, y, r: 14, bob: rand(0, 6.28) });
}
