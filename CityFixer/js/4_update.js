// ══════════════════════════════════════════════════════════
//  4_update.js  -  LOGIKA UPDATE & MEKANIK GAME
//  Semua fisika, tabrakan, AI, dan aturan game ada di sini
// ══════════════════════════════════════════════════════════

function update(dt) {
  timer -= dt;
  if (P.superT > 0) { P.superT -= dt; if (P.superT < 0) P.superT = 0; }

  // Lampu mati perlahan setelah dinyalakan
  lamps.forEach(l => {
    if (l.fixed) {
      l.life -= dt * (2.5 + level * 0.5);
      if (l.life <= 0) { l.fixed = false; sfxLose(); }
    }
  });

  if (flashT > 0) flashT -= dt;

  // ── PERGERAKAN PEMAIN ──────────────────────────────────
  let dx = 0, dy = 0;
  if (K.KeyW || K.ArrowUp)    dy = -1;
  if (K.KeyS || K.ArrowDown)  dy =  1;
  if (K.KeyA || K.ArrowLeft)  dx = -1;
  if (K.KeyD || K.ArrowRight) dx =  1;
  if (touch.active) { dx += touch.dx; dy += touch.dy; }
  const mag = Math.hypot(dx, dy); if (mag > 1) { dx /= mag; dy /= mag; }

  const maxSpd = 220;
  const accel  = (dx || dy) ? 13 : 20;
  P.vx += (dx * maxSpd - P.vx) * Math.min(accel * dt, 1);
  P.vy += (dy * maxSpd - P.vy) * Math.min(accel * dt, 1);
  if (Math.abs(P.vx) < 1.5 && dx === 0) P.vx = 0;
  if (Math.abs(P.vy) < 1.5 && dy === 0) P.vy = 0;
  if (dx < 0) P.facingDir = -1; else if (dx > 0) P.facingDir = 1;

  // Tabrakan pemain dengan bangunan (slide collision)
  const nX = P.x + P.vx * dt, nY = P.y + P.vy * dt;
  const col = bldg.some(([bx,by,bw,bh]) => nX+P.r>bx && nX-P.r<bx+bw && nY+P.r>by-25 && nY-P.r<by+bh);
  if (!col) {
    P.x = clamp(nX, P.r+8, W-P.r-8); P.y = clamp(nY, P.r+8, H-P.r-8);
  } else {
    if (!bldg.some(([bx,by,bw,bh]) => nX+P.r>bx && nX-P.r<bx+bw && P.y+P.r>by-25 && P.y-P.r<by+bh))
      P.x = clamp(nX, P.r+8, W-P.r-8);
    if (!bldg.some(([bx,by,bw,bh]) => P.x+P.r>bx && P.x-P.r<bx+bw && nY+P.r>by-25 && nY-P.r<by+bh))
      P.y = clamp(nY, P.r+8, H-P.r-8);
  }

  if (P.inv > 0) {
    P.inv -= dt; P.bt += dt;
    if (P.bt > .1) { P.blink = !P.blink; P.bt = 0; }
    if (P.inv <= 0) P.blink = true;
  }

  // ── KENDARAAN (RINTANGAN) ──────────────────────────────
  cars.forEach(c => {
    if (c.h) c.x += c.spd * dt; else c.y += c.spd * dt;
    if (c.x > W+60) c.x = -60; if (c.x < -60) c.x = W+60;
    if (c.y > H+60) c.y = -60; if (c.y < -60) c.y = H+60;
    if (Math.random() < .25) {
      let ex = c.h ? c.x - Math.sign(c.spd)*c.w/2 : c.x + rand(-8,8);
      let ey = c.h ? c.y + rand(-6,6) : c.y - Math.sign(c.spd)*c.ht/2;
      parts.push({ x:ex, y:ey, vx:rand(-20,20), vy:rand(-30,-10), life:.7, r:4, col:'rgba(180,180,180,0.6)' });
    }
    if (P.inv <= 0 && rectCircle(c.x-c.w/2, c.y-c.ht/2, c.w, c.ht, P.x, P.y, P.r)) {
      lives--; sfxHit(); doShake(.4, 10); combo = 0;
      setFlash('Kena Polusi!', 'red'); P.inv = 2; P.blink = true;
      burst(P.x, P.y, '#f44336', 18);
      if (lives <= 0) endGame(false);
    }
  });

  // ── PUNGUT SAMPAH → MASUK TAS ─────────────────────────
  trash = trash.filter(t => {
    if (dist(P.x, P.y, t.x, t.y) < P.r + t.r) {
      if (P.bag.length >= BAG_MAX) { setFlash('Tas Penuh! Buang ke Kotak Dulu (F)', '#ff9800'); return true; }
      P.bag.push(t.type); sfxCollect();
      addFloat(t.x, t.y-10, BIN_LABEL[TRASH_CAT[t.type]], BIN_COLOR[TRASH_CAT[t.type]]);
      burst(t.x, t.y, BIN_COLOR[TRASH_CAT[t.type]], 8);
      return false;
    }
    return true;
  });
  if (trash.length < 5 && Math.random() < .01) spawnTrash(1);

  // ── ITEM SUPER MODE ────────────────────────────────────
  if (Math.random() < 0.001) spawnPowerup();
  powerups = powerups.filter(pu => {
    if (dist(P.x, P.y, pu.x, pu.y) < P.r + pu.r) {
      P.superT = 10; setFlash('SUPER MODE!', '#00ffcc'); sfxWin(); return false;
    }
    return true;
  });

  // ── ITEM SEMPROTAN (SENJATA) ───────────────────────────
  if (Math.random() < 0.0004) spawnGunup();
  gunups = gunups.filter(gu => {
    if (dist(P.x, P.y, gu.x, gu.y) < P.r + gu.r) {
      P.hasGun = true; P.ammo = 8;
      setFlash('Dapat Semprotan! (8x)', '#00e5ff');
      sfxLamp(); burst(gu.x, gu.y, '#00e5ff', 14);
      addFloat(gu.x, gu.y, '+Semprotan!', '#00e5ff');
      return false;
    }
    return true;
  });

  // ── ITEM NYAWA TAMBAHAN ────────────────────────────────
  heartTimer += dt;
  if (heartTimer >= 10) { spawnHeartup(); heartTimer = 0; }
  heartups = heartups.filter(hu => {
    if (dist(P.x, P.y, hu.x, hu.y) < P.r + hu.r) {
      lives = Math.min(lives+1, 5); setFlash('+1 Nyawa!', '#ff4081');
      sfxCollect(); burst(hu.x, hu.y, '#ff4081', 12); return false;
    }
    return true;
  });

  // ── PELURU SEMPROTAN ───────────────────────────────────
  bullets.forEach(b => { b.x += b.vx*dt; b.y += b.vy*dt; b.life -= dt; });
  const hitPcs = new Set();
  bullets = bullets.filter(b => {
    if (b.life <= 0 || b.x < 0 || b.x > W || b.y < 0 || b.y > H) return false;
    let hit = false;
    pollClouds.forEach(pc => {
      if (!hitPcs.has(pc) && dist(b.x, b.y, pc.x, pc.y) < pc.r + b.r) {
        pc.hp--; pc.hitT = 0.35;
        burst(b.x, b.y, '#00e5ff', 6);
        addScore(25); addFloat(b.x, b.y-10, '+25', '#00e5ff');
        if (pc.hp <= 0) { sfxMonsterDie(); pc._dead = true; hitPcs.add(pc); }
        hit = true;
      }
    });
    return !hit;
  });

  // ── PARTIKEL EFEK ──────────────────────────────────────
  parts.forEach(p => { p.x += p.vx*dt; p.y += p.vy*dt; if (!p.conf) p.vy += 60*dt; p.life -= dt; });
  parts = parts.filter(p => p.life > 0);

  // ── AI WARGA (NPC) ─────────────────────────────────────
  const fixedLamps = lamps.filter(l => l.fixed);
  const superMode  = P.superT > 0;

  npcs.forEach(n => {
    let scared = false, targetCloud = null, cd = Infinity;
    pollClouds.forEach(pc => {
      const d = dist(n.x, n.y, pc.x, pc.y);
      if (d < 140) scared = true;
      if (d < cd) { cd = d; targetCloud = pc; }
    });
    n.scared = scared && !superMode;
    if (n.scared) n.scaredT = 1.5;
    else if (n.scaredT > 0) n.scaredT -= dt;

    // Tujuan NPC berdasarkan situasi
    if (superMode && targetCloud) {
      n.tx = targetCloud.x + rand(-10, 10); n.ty = targetCloud.y + rand(-10, 10);
    } else if (n.scared && fixedLamps.length > 0) {
      let best = fixedLamps[0], bd = dist(n.x, n.y, best.x, best.y);
      fixedLamps.forEach(l => { const d = dist(n.x, n.y, l.x, l.y); if (d < bd) { bd = d; best = l; } });
      n.tx = best.x + rand(-20, 20); n.ty = best.y + rand(-20, 20);
    } else if (!n.scared) {
      n.wt -= dt;
      if (n.wt <= 0) { n.tx = rand(60,W-60); n.ty = rand(60,H-60); n.wt = rand(2,5); }
    }

    const ddx = n.tx-n.x, ddy = n.ty-n.y, dm = Math.hypot(ddx, ddy);
    const spd = n.scared ? 110 : 55;
    if (dm > 5) { n.vx = ddx/dm*spd; n.vy = ddy/dm*spd; } else { n.vx = 0; n.vy = 0; }

    // Tabrakan NPC dengan bangunan
    const nNX = n.x+n.vx*dt, nNY = n.y+n.vy*dt;
    const nCol = bldg.some(([bx,by,bw,bh]) => nNX+n.r>bx && nNX-n.r<bx+bw && nNY+n.r>by-25 && nNY-n.r<by+bh);
    if (!nCol) {
      n.x = clamp(nNX,n.r+4,W-n.r-4); n.y = clamp(nNY,n.r+4,H-n.r-4);
    } else {
      if (!bldg.some(([bx,by,bw,bh]) => nNX+n.r>bx && nNX-n.r<bx+bw && n.y+n.r>by-25 && n.y-n.r<by+bh))
        { n.x = clamp(nNX,n.r+4,W-n.r-4); n.ty = n.y; }
      if (!bldg.some(([bx,by,bw,bh]) => n.x+n.r>bx && n.x-n.r<bx+bw && nNY+n.r>by-25 && nNY-n.r<by+bh))
        { n.y = clamp(nNY,n.r+4,H-n.r-4); n.tx = n.x; }
      else { n.tx = rand(60,W-60); n.ty = rand(60,H-60); }
    }
    if (n.vx < -5) n.facingDir = -1; else if (n.vx > 5) n.facingDir = 1;
    n.facingDir = n.facingDir || 1;
  });

  // ── AI MONSTER (POLL CLOUD) ────────────────────────────
  pollClouds.forEach(pc => {
    pc.hitT = Math.max(0, pc.hitT - dt); pc.pulse += dt * 2;
    let target = null, td = Infinity;
    npcs.forEach(n => {
      const safe = fixedLamps.some(l => dist(n.x,n.y,l.x,l.y) < 88);
      if (!safe) { const d = dist(pc.x,pc.y,n.x,n.y); if (d < td) { td = d; target = n; } }
    });
    let repX = 0, repY = 0;
    fixedLamps.forEach(l => {
      const d = dist(pc.x,pc.y,l.x,l.y);
      if (d < 110) { repX += (pc.x-l.x)/d*(110-d); repY += (pc.y-l.y)/d*(110-d); }
    });
    const cspd = 55 + level*10;
    if (target) {
      let ax = target.x-pc.x, ay = target.y-pc.y, am = Math.hypot(ax,ay)||1;
      pc.vx = ax/am*cspd + repX*0.9; pc.vy = ay/am*cspd + repY*0.9;
    } else {
      let ax = P.x-pc.x, ay = P.y-pc.y, am = Math.hypot(ax,ay)||1;
      pc.vx = ax/am*cspd*0.7 + repX*0.9; pc.vy = ay/am*cspd*0.7 + repY*0.9;
    }
    const vm = Math.hypot(pc.vx,pc.vy)||1, maxS = cspd*1.5;
    if (vm > maxS) { pc.vx = pc.vx/vm*maxS; pc.vy = pc.vy/vm*maxS; }
    pc.x += pc.vx*dt; pc.y += pc.vy*dt;
    if (pc.x < -60) pc.x = W+60; if (pc.x > W+60) pc.x = -60;
    if (pc.y < -60) pc.y = H+60; if (pc.y > H+60) pc.y = -60;

    // Monster vs NPC
    npcs.forEach(n => {
      const safe = fixedLamps.some(l => dist(n.x,n.y,l.x,l.y) < 88);
      if (dist(pc.x,pc.y,n.x,n.y) < pc.r+n.r) {
        if (superMode) { pc.hp -= 100; burst(pc.x,pc.y,'#c060ff',25); addScore(50); sfxLamp(); }
        else if (!safe) {
          n._dead = true; sfxMonsterEat(); score = Math.max(0, score-20);
          setFlash('Warga Terpapar!','orange'); burst(n.x,n.y,'#ff9800',10); doShake(0.3,7);
          setTimeout(spawnNPC, 3000);
        }
      }
    });

    // Monster vs Pemain
    if (dist(P.x,P.y,pc.x,pc.y) < P.r+pc.r-4) {
      if (superMode) { pc.hp -= 100; burst(pc.x,pc.y,'#c060ff',25); addScore(50); sfxLamp(); }
      else if (P.inv <= 0) {
        lives--; sfxHit(); doShake(.4,10); combo = 0;
        setFlash('Terpapar!','red'); P.inv = 2; P.blink = true;
        burst(P.x,P.y,'#f44336',18);
        if (lives <= 0) endGame(false);
      }
    }
    if (pc.hp <= 0) { sfxMonsterDie(); pc._dead = true; }
  });

  pollClouds = pollClouds.filter(pc => !pc._dead);
  npcs = npcs.filter(n => !n._dead);
  if (pollClouds.length < 2+level && Math.random() < levelData.cloudRate) spawnPollCloud();

  P.scared = P.superT <= 0 && pollClouds.some(pc => dist(P.x,P.y,pc.x,pc.y) < 160);

  // Screen shake & combo timer
  if (shakeT > 0) { shakeT -= dt; shakeX = (Math.random()-.5)*shakeM*2; shakeY = (Math.random()-.5)*shakeM*2; }
  else { shakeX = 0; shakeY = 0; }
  if (comboT > 0) comboT -= dt; else combo = 0;
  floats.forEach(f => { f.y += f.vy*dt; f.life -= dt; }); floats = floats.filter(f => f.life > 0);

  // Hujan
  if (levelData.rain) {
    if (!raindrops) raindrops = [];
    for (let i = 0; i < 6; i++)
      raindrops.push({ x: rand(-200,W+200), y: rand(-50,0), l: rand(10,25), s: rand(600,900) });
    raindrops.forEach(r => { r.y += r.s*dt; r.x += r.s*0.15*dt; });
    raindrops = raindrops.filter(r => r.y < H+50);
  }
}

// ── AKSI LAMPU (Tekan E) ───────────────────────────────────
function fixLamp() {
  if (st !== S.PLAY) return;
  lamps.forEach(l => {
    if (!l.fixed && dist(P.x,P.y,l.x,l.y) < 75) {
      l.fixed = true; l.life = 100; sfxLamp(); addScore(30);
      addFloat(l.x, l.y, '+30', '#ffd740'); burst(l.x, l.y, '#ffd740', 12);
    } else if (l.fixed && dist(P.x,P.y,l.x,l.y) < 75 && l.life < 50) {
      l.life = 100; sfxCollect(); addScore(10); addFloat(l.x, l.y, '+10', '#ffd740');
    }
  });
}

// ── BUANG SAMPAH KE KOTAK (Tekan F) ───────────────────────
function depositTrash() {
  if (st !== S.PLAY || !P || P.bag.length === 0) return;
  let closest = null, cd = Infinity;
  bins.forEach(b => { const d = dist(P.x,P.y,b.x,b.y); if (d < 70 && d < cd) { cd = d; closest = b; } });
  if (!closest) { setFlash('Dekati Kotak Sampah Dulu!', '#ff9800'); return; }

  const binCat = closest.type;
  let correct = 0, wrong = 0;
  const newBag = [];
  P.bag.forEach(type => {
    if (TRASH_CAT[type] === binCat) correct++;
    else { wrong++; newBag.push(type); }
  });
  P.bag = newBag;

  if (correct > 0) {
    const pts = correct * 40;
    addScore(pts); combo += correct; comboT = 2.5; sfxWin();
    burst(closest.x, closest.y, BIN_COLOR[binCat], correct*6);
    closest.pulse = 1;
    addFloat(closest.x, closest.y-30, '+'+pts+' ('+correct+' sampah!)', BIN_COLOR[binCat]);
    setFlash('Benar! +'+pts+' Poin 🎉', BIN_COLOR[binCat]);
  }
  if (wrong > 0) {
    addScore(-wrong*10); sfxHit();
    addFloat(closest.x, closest.y-10, '-'+(wrong*10)+' Salah Kotak!', '#ff5252');
    if (correct === 0) setFlash('Salah Kotak! -'+(wrong*10), '#ff5252');
  }
}

// ── SKOR, GAME OVER ────────────────────────────────────────
function addScore(v) {
  score = Math.max(0, score + v);
  if (score > highscore) { highscore = score; localStorage.setItem('cf_hs', highscore); }
}

let panelWin = false;
function endGame(win) {
  panelWin = win; st = win ? S.WIN : S.LOSE;
  if (win) { sfxWin(); setTimeout(spawnConfetti, 200); } else sfxLose();
}

function setFlash(msg, col) { flash = msg; flashCol = col; flashT = 2; }
function goToMenu()         { if (bgmInt) clearInterval(bgmInt); bgmInt = null; st = S.MENU; }
