const yes = document.getElementById("yes");
const no = document.getElementById("no");
const card = document.getElementById("card");
const canvas = document.getElementById("sunflower");
const ctx = canvas.getContext("2d");

const startMusicBtn = document.getElementById("startMusic");
const musicToggle = document.getElementById("musicToggle");

const trackA = document.getElementById("trackA"); // kalamantina
const trackB = document.getElementById("trackB"); // yama

let yesSize = 24;
let audioEnabled = false;
let musicOn = true;

// ---- helpers: fade audio ----
function fadeTo(audioEl, targetVolume, durationMs = 1000) {
  const startVol = audioEl.volume;
  const start = performance.now();

  return new Promise((resolve) => {
    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs);
      audioEl.volume = startVol + (targetVolume - startVol) * t;
      if (t >= 1) return resolve();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

async function playFromStartWithFadeIn(audioEl, fadeMs = 1200, endVol = 1) {
  audioEl.currentTime = 0;
  audioEl.volume = 0;
  await audioEl.play();
  await fadeTo(audioEl, endVol, fadeMs);
}

async function crossfade(outEl, inEl, fadeMs = 1200, inEndVol = 1) {
  // start incoming at 0 volume from beginning
  inEl.currentTime = 0;
  inEl.volume = 0;
  await inEl.play();

  // fade simultaneously
  await Promise.all([
    fadeTo(outEl, 0, fadeMs),
    fadeTo(inEl, inEndVol, fadeMs),
  ]);

  // stop outgoing to avoid background CPU
  outEl.pause();
  outEl.currentTime = 0;
}

// ---- Start music on the Valentine page (tap required on iPhone) ----
startMusicBtn.addEventListener("click", async () => {
  try {
    // enable audio
    audioEnabled = true;
    musicOn = true;

    // Make sure B is stopped
    trackB.pause();
    trackB.currentTime = 0;

    // Start Kalamantina from beginning with fade in
    await playFromStartWithFadeIn(trackA, 1200, 1);

    musicToggle.classList.remove("hidden");
    musicToggle.textContent = "🔊 Music";
    startMusicBtn.textContent = "✅ Music playing";
    startMusicBtn.disabled = true;
  } catch (e) {
    console.log("Audio blocked:", e);
  }
});

// ---- Music toggle (mutes whichever track is active) ----
musicToggle.addEventListener("click", async () => {
  if (!audioEnabled) return;

  musicOn = !musicOn;
  if (!musicOn) {
    musicToggle.textContent = "🔇 Music";
    trackA.pause();
    trackB.pause();
  } else {
    musicToggle.textContent = "🔊 Music";
    // Resume whichever is currently audible (prefer B if it has volume > 0)
    try {
      if (trackB.volume > 0.01) await trackB.play();
      else await trackA.play();
    } catch(e) {}
  }
});

// ---- NO button behaviour ----
function dodgeNo(){
  const area = document.getElementById("buttons").getBoundingClientRect();
  const maxLeft = Math.max(0, area.width - no.offsetWidth);
  const maxTop  = Math.max(0, area.height - no.offsetHeight);

  no.style.left = `${Math.random()*maxLeft}px`;
  no.style.top  = `${Math.random()*maxTop}px`;

  yesSize *= 1.18;
  yes.style.fontSize = `${Math.round(yesSize)}px`;
}

no.addEventListener("mouseenter", dodgeNo);
no.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodgeNo();
}, { passive:false });

// ---- YES click: crossfade to yama.mp3 + show animation ----
yes.addEventListener("click", async () => {
  card.style.display = "none";
  canvas.style.display = "block";

  // If she didn't tap Start Music, we still can start audio here because YES is a tap.
  if (!audioEnabled) {
    audioEnabled = true;
    musicToggle.classList.remove("hidden");
    musicToggle.textContent = "🔊 Music";
    startMusicBtn.disabled = true;
  }

  if (musicOn) {
    try {
      // If kalamantina is playing, crossfade to yama.
      // If not playing yet, just fade in yama from start.
      const aPlaying = !trackA.paused && trackA.volume > 0.01;

      if (aPlaying) {
        await crossfade(trackA, trackB, 1200, 1);
      } else {
        trackA.pause(); trackA.currentTime = 0; trackA.volume = 0;
        await playFromStartWithFadeIn(trackB, 1200, 1);
      }
    } catch(e) {
      console.log("Crossfade/play failed:", e);
    }
  }

  startSunflower();
});

// ---------------- SUNFLOWER (same as before, clean sunflower look) ----------------
function startSunflower(){
  resize();
  window.addEventListener("resize", resize);

  const dpr = window.devicePixelRatio || 1;
  const W = () => canvas.width / dpr;
  const H = () => canvas.height / dpr;
  const cx = () => W()/2;
  const cy = () => H()/2;
  const base = () => Math.min(W(), H());

  const petalCount = 28;
  const petalLen = () => base() * 0.28;
  const petalWid = () => base() * 0.12;
  const petalRing = () => base() * 0.18;

  const diskR = () => base() * 0.17;
  const seedsTotal = 1100;
  const seedsPerFrame = 90;

  let petalsT = 0;
  let seeds = 0;
  let nazAlpha = 0;
  let finished = false;

  const golden = 137.508 * Math.PI / 180;

  function bg(){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,W(),H());
  }

  function drawPetal(angle, t){
    const len = petalLen() * t;
    const wid = petalWid() * (0.7 + 0.3*t);

    ctx.save();
    ctx.translate(cx(), cy());
    ctx.rotate(angle);

    const g = ctx.createLinearGradient(0, -petalRing(), 0, -(petalRing() + len));
    g.addColorStop(0, "#FFD84D");
    g.addColorStop(0.6, "#FFA216");
    g.addColorStop(1, "#FF8C00");
    ctx.fillStyle = g;

    const tipY = -(petalRing() + len);
    const baseY = -petalRing();

    ctx.beginPath();
    ctx.moveTo(0, tipY);
    ctx.bezierCurveTo(wid, baseY, wid, baseY + len*0.4, 0, baseY);
    ctx.bezierCurveTo(-wid, baseY + len*0.4, -wid, baseY, 0, tipY);
    ctx.fill();

    ctx.restore();
  }

  function step(){
    bg();

    petalsT = Math.min(1, petalsT + 0.06);
    for(let i=0;i<petalCount;i++){
      const local = Math.max(0, petalsT - i/petalCount);
      drawPetal(i*2*Math.PI/petalCount, local);
    }

    if(petalsT > 0.3){
      ctx.beginPath();
      ctx.arc(cx(), cy(), diskR(), 0, Math.PI*2);
      ctx.fillStyle = "#2B1209";
      ctx.fill();
    }

    if(petalsT > 0.6){
      for(let i=0;i<seedsPerFrame;i++){
        if(seeds >= seedsTotal) break;

        const r = Math.sqrt(seeds/seedsTotal) * diskR() * 0.95;
        const t = seeds * golden;

        ctx.beginPath();
        ctx.arc(cx()+r*Math.cos(t), cy()+r*Math.sin(t), 2.4, 0, Math.PI*2);
        ctx.fillStyle = "rgb(140,80,40)";
        ctx.fill();

        seeds++;
      }
    }

    if(petalsT >= 1 && seeds >= seedsTotal) finished = true;
    if(finished) nazAlpha = Math.min(1, nazAlpha + 0.05);

    if(nazAlpha > 0){
      ctx.globalAlpha = nazAlpha;
      ctx.fillStyle = "#000";
      ctx.font = "900 72px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Naz", cx(), cy());
      ctx.globalAlpha = 1;
    }

    if(!(finished && nazAlpha >= 1)) requestAnimationFrame(step);
  }

  step();
}

function resize(){
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
}
