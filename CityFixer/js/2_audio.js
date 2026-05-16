// ══════════════════════════════════════════════════════════
//  2_audio.js  -  SISTEM AUDIO (Web Audio API Synthesizer)
//  Semua suara game dibuat secara programatik tanpa file eksternal
// ══════════════════════════════════════════════════════════

const AC = new (window.AudioContext || window.webkitAudioContext)();
document.addEventListener('click', () => { if (AC.state === 'suspended') AC.resume(); });

// ── FUNGSI DASAR BEEP ──────────────────────────────────────
// f = frekuensi (Hz), d = durasi (detik), t = bentuk gelombang, v = volume
const beep = (f, d, t = 'sine', v = .3) => {
  const o = AC.createOscillator(), g = AC.createGain();
  o.connect(g); g.connect(AC.destination);
  o.frequency.value = f; o.type = t;
  g.gain.setValueAtTime(v * 0.8, AC.currentTime);
  g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + d);
  o.start(); o.stop(AC.currentTime + d);
};

// ── EFEK SUARA GAME (SFX) ──────────────────────────────────
const sfxCollect    = () => { beep(880, .08); setTimeout(() => beep(1100, .12), 70); };
const sfxLamp       = () => { beep(660, .08); setTimeout(() => beep(880, .08), 90); setTimeout(() => beep(1320, .2), 190); };
const sfxHit        = () => beep(100, .35, 'sawtooth', .5);
const sfxWin        = () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .4), i * 150));
const sfxLose       = () => [440, 349, 294, 220].forEach((f, i) => setTimeout(() => beep(f, .3), i * 100));
const sfxMonsterDie = () => beep(220, .15, 'square', .3);   // ringan, tidak brisik
const sfxMonsterEat = () => beep(180, .1,  'square', .25);  // ringan, tidak brisik

let bgmInt = null;
