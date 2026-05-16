// 6_main.js - State, Input, Init, Game Loop
const S = { MENU:0, PLAY:1, WIN:2, LOSE:3, PAUSE:4 };
let st = S.MENU, score, lives, timer, flash, flashT, lastT=0, level=1;
let floats=[], shakeX=0, shakeY=0, shakeT=0, shakeM=8, combo=0, comboT=0;
let highscore = parseInt(localStorage.getItem("cf_hs")||"0");
let difficulty=1, currentLevelIdx=0, levelData=LEVELS[0], bldg=[];
let flashCol="#fff", panelWin=false;
let mousePos={x:0,y:0};
const doShake=(t,m)=>{shakeT=t;shakeM=m;};
const spawnConfetti=()=>{for(let i=0;i<90;i++)parts.push({x:rand(0,W),y:rand(-100,0),vx:rand(-30,30),vy:rand(80,200),life:3+rand(0,2),r:5+rand(0,4),col:`hsl(${~~rand(0,360)},90%,60%)`,conf:true});};

// Input keyboard
const K={};
addEventListener("keydown",e=>{
  K[e.code]=true; e.preventDefault();
  if(e.code==="KeyE") fixLamp();
  if(e.code==="KeyF") depositTrash();
  if(e.code==="KeyM") goToMenu();
  if(e.code==="Escape"){if(st===S.PLAY)st=S.PAUSE;else if(st===S.PAUSE){st=S.PLAY;lastT=performance.now();}else if(st===S.WIN||st===S.LOSE)goToMenu();}
  if(e.code==="Space"||e.code==="Enter"){if(st===S.MENU||st===S.WIN||st===S.LOSE)init(st!==S.PAUSE);if(st===S.PAUSE){st=S.PLAY;lastT=performance.now();}}
});
addEventListener("keyup",e=>K[e.code]=false);

// Mouse
cv.addEventListener("mousemove",e=>{const r=cv.getBoundingClientRect();mousePos.x=(e.clientX-r.left)*(cv.width/r.width);mousePos.y=(e.clientY-r.top)*(cv.height/r.height);});
cv.addEventListener("click",e=>{
  const rect=cv.getBoundingClientRect();
  const mx=(e.clientX-rect.left)*(W/rect.width),my=(e.clientY-rect.top)*(H/rect.height);
  if(P&&P.hasGun&&P.ammo>0&&st===S.PLAY){
    const ang=Math.atan2(my-P.y,mx-P.x),spd=430;
    bullets.push({x:P.x,y:P.y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,life:2.5,r:5});
    P.ammo--;if(P.ammo<=0)P.hasGun=false;
    beep(900,.04,"square",.4);setTimeout(()=>beep(650,.05,"square",.3),40);return;
  }
  if(st===S.WIN||st===S.LOSE){
    if(window._panelRestartBtn&&mx>=window._panelRestartBtn.x&&mx<=window._panelRestartBtn.x+window._panelRestartBtn.w&&my>=window._panelRestartBtn.y&&my<=window._panelRestartBtn.y+window._panelRestartBtn.h){
      if(panelWin){if(currentLevelIdx<LEVELS.length-1){currentLevelIdx++;init(false);}else init(true);}else init(true);}
  }else if(st===S.MENU){if(window._menuBtn&&window._menuBtn.play){const b=window._menuBtn.play;if(mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h)init(true);}else init(true);}
});

// Touch
let touch={active:false,sx:0,sy:0,dx:0,dy:0};
cv.addEventListener("touchstart",e=>{e.preventDefault();const rect=cv.getBoundingClientRect(),scaleX=W/rect.width,scaleY=H/rect.height,t=e.touches[0];touch.active=true;touch.sx=(t.clientX-rect.left)*scaleX;touch.sy=(t.clientY-rect.top)*scaleY;touch.dx=0;touch.dy=0;if(st===S.MENU||st===S.WIN||st===S.LOSE){AC.resume();init();}},{passive:false});
cv.addEventListener("touchmove",e=>{e.preventDefault();const rect=cv.getBoundingClientRect(),scaleX=W/rect.width,scaleY=H/rect.height,t=e.touches[0],cx2=(t.clientX-rect.left)*scaleX,cy2=(t.clientY-rect.top)*scaleY;touch.dx=clamp((cx2-touch.sx)/50,-1,1);touch.dy=clamp((cy2-touch.sy)/50,-1,1);},{passive:false});
cv.addEventListener("touchend",e=>{e.preventDefault();touch.active=false;touch.dx=0;touch.dy=0;if(st===S.PLAY)fixLamp();},{passive:false});

// Inisialisasi game
function init(fullReset=false){
  AC.resume();
  if(fullReset){score=0;lives=3;currentLevelIdx=0;}
  levelData=LEVELS[currentLevelIdx];
  st=S.PLAY;flash="";flashT=0;lastT=performance.now();level=currentLevelIdx+1;
  timer=levelData.time;floats=[];combo=0;comboT=0;shakeX=0;shakeY=0;
  P={x:W/2,y:260,vx:0,vy:0,r:16,inv:0,blink:true,bt:0,facingDir:1,bobT:0,superT:0,hasGun:false,ammo:0,bag:[]};
  trash=[];lamps=[];cars=[];parts=[];npcs=[];pollClouds=[];raindrops=[];powerups=[];heartups=[];bullets=[];gunups=[];bins=[];
  heartTimer=0;generateMap();
  const ds=DIFF_SPEED[difficulty];
  [{h:true,x:0,y:130,spd:130*ds,col:"#e53935"},{h:true,x:W,y:260,spd:-155*ds,col:"#1e88e5"},{h:true,x:0,y:390,spd:120*ds,col:"#43a047"},{h:true,x:W,y:520,spd:-140*ds,col:"#fb8c00"}].forEach(v=>cars.push({...v,w:54,ht:26}));
  for(let i=0;i<4;i++)spawnNPC();
  for(let i=0;i<2;i++)spawnPollCloud();
  spawnTrash(6);requestAnimationFrame(loop);
}

function generateMap(){
  bldg=[];lamps=[];
  const rows=[{y:35,h:65},{y:180,h:55},{y:315,h:55},{y:445,h:55},{y:550,h:50}];
  rows.forEach(r=>{
    let curX=rand(30,80);
    while(curX<W-100){let bw=rand(65,110);if(curX+bw>W-60)break;bldg.push([curX,r.y,bw,r.h]);curX+=bw+rand(120,170);}
  });
  bldg=bldg.filter((b,i)=>{const[bx,by,bw]=b;return!bldg.some((b2,j)=>{if(j===i)return false;const[b2x,b2y,b2w]=b2;if(Math.abs(b2y-by)>10)return false;const g=bx-(b2x+b2w);return g>0&&g<90;});});
  const streetsY=[130,260,390,520];
  [150,380,610,840].forEach(lx=>{streetsY.forEach(sy=>{if(Math.random()<0.75){const lxF=lx+rand(-15,15);if(!bldg.some(([bx,by,bw,bh])=>lxF>bx-12&&lxF<bx+bw+12&&sy>by-30&&sy<by+bh+5))lamps.push({x:lxF,y:sy,fixed:false,pulse:rand(0,6.28),life:0,flickerT:rand(0,10)});}});});
  [{x:100,y:H-65},{x:W/2,y:65},{x:W-100,y:H-65}].forEach((pos,i)=>bins.push({x:pos.x,y:pos.y,type:["organik","plastik","logam"][i],r:22,pulse:0}));
}

// Game loop utama
function loop(ts){
  const dt=Math.min((ts-lastT)/1000,0.05);lastT=ts;
  if(st===S.PLAY){update(dt);if(timer<=0)endGame(true);}
  draw();requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
