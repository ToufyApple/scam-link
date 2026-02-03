const yes = document.getElementById("yes");
const no = document.getElementById("no");
const card = document.getElementById("card");
const canvas = document.getElementById("sunflower");
const ctx = canvas.getContext("2d");

const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

let yesSize = 24;
let musicOn = true;

/* ---------------- NO button behaviour ---------------- */
function dodgeNo(){
  const area = document.getElementById("buttons").getBoundingClientRect();
  no.style.left = Math.random()*(area.width-no.offsetWidth)+"px";
  no.style.top  = Math.random()*(area.height-no.offsetHeight)+"px";

  yesSize *= 1.18;
  yes.style.fontSize = `${Math.round(yesSize)}px`;
}

no.addEventListener("mouseenter", dodgeNo);
no.addEventListener("touchstart", e => {
  e.preventDefault();
  dodgeNo();
},{passive:false});

/* ---------------- YES click ---------------- */
yes.addEventListener("click", async () => {
  card.style.display = "none";
  canvas.style.display = "block";
  musicToggle.classList.remove("hidden");

  // 🔁 RESET + FADE IN MUSIC
  bgMusic.currentTime = 0;
  bgMusic.volume = 0;

  try{
    if(musicOn) await bgMusic.play();
    fadeInMusic();
  }catch(e){}

  startSunflower();
});

/* ---------------- Music toggle ---------------- */
musicToggle.addEventListener("click", async () => {
  musicOn = !musicOn;
  if(musicOn){
    musicToggle.textContent="🔊 Music";
    try{ await bgMusic.play(); }catch(e){}
  }else{
    musicToggle.textContent="🔇 Music";
    bgMusic.pause();
  }
});

function fadeInMusic(){
  let v = 0;
  const fade = setInterval(()=>{
    v += 0.05;
    bgMusic.volume = Math.min(v,1);
    if(v>=1) clearInterval(fade);
  },150);
}

/* ---------------- SUNFLOWER ---------------- */
function startSunflower(){
  resize();
  window.addEventListener("resize", resize);

  const dpr = window.devicePixelRatio||1;
  const W = ()=>canvas.width/dpr;
  const H = ()=>canvas.height/dpr;
  const cx = ()=>W()/2;
  const cy = ()=>H()/2;
  const base = ()=>Math.min(W(),H());

  const petalCount = 28;
  const petalLen = ()=>base()*0.28;
  const petalWid = ()=>base()*0.12;
  const petalRing = ()=>base()*0.18;

  const diskR = ()=>base()*0.17;
  const seedsTotal = 1100;
  const seedsPerFrame = 90;

  let petalsT = 0;
  let seeds = 0;
  let nazAlpha = 0;
  let finished = false;

  const golden = 137.508*Math.PI/180;

  function bg(){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,W(),H());
  }

  function petal(angle,t){
    const len = petalLen()*t;
    const wid = petalWid()*(0.7+0.3*t);
    ctx.save();
    ctx.translate(cx(),cy());
    ctx.rotate(angle);

    const g = ctx.createLinearGradient(0,-petalRing(),0,-(petalRing()+len));
    g.addColorStop(0,"#FFD84D");
    g.addColorStop(.6,"#FFA216");
    g.addColorStop(1,"#FF8C00");
    ctx.fillStyle=g;

    ctx.beginPath();
    ctx.moveTo(0,-(petalRing()+len));
    ctx.bezierCurveTo(wid, -petalRing(), wid, -petalRing()+len*.4, 0,-petalRing());
    ctx.bezierCurveTo(-wid,-petalRing()+len*.4,-wid,-petalRing(),0,-(petalRing()+len));
    ctx.fill();
    ctx.restore();
  }

  function draw(){
    bg();

    petalsT=Math.min(1,petalsT+.06);
    for(let i=0;i<petalCount;i++){
      petal(i*2*Math.PI/petalCount,Math.max(0,petalsT-i/petalCount));
    }

    if(petalsT>.3){
      ctx.beginPath();
      ctx.arc(cx(),cy(),diskR(),0,Math.PI*2);
      ctx.fillStyle="#2B1209";
      ctx.fill();
    }

    if(petalsT>.6){
      for(let i=0;i<seedsPerFrame;i++){
        if(seeds>=seedsTotal) break;
        const r=Math.sqrt(seeds/seedsTotal)*diskR()*.95;
        const t=seeds*golden;
        ctx.beginPath();
        ctx.arc(cx()+r*Math.cos(t),cy()+r*Math.sin(t),2.4,0,Math.PI*2);
        ctx.fillStyle="rgb(140,80,40)";
        ctx.fill();
        seeds++;
      }
    }

    if(petalsT>=1 && seeds>=seedsTotal) finished=true;
    if(finished) nazAlpha=Math.min(1,nazAlpha+.05);

    if(nazAlpha>0){
      ctx.globalAlpha=nazAlpha;
      ctx.fillStyle="#000";
      ctx.font="900 72px system-ui";
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      ctx.fillText("Naz",cx(),cy());
      ctx.globalAlpha=1;
    }

    if(!(finished && nazAlpha>=1)) requestAnimationFrame(draw);
  }

  draw();
}

function resize(){
  const dpr=window.devicePixelRatio||1;
  canvas.width=Math.floor(innerWidth*dpr);
  canvas.height=Math.floor(innerHeight*dpr);
}
