const card = document.getElementById("card");
const canvas = document.getElementById("sunflower");
const ctx = canvas.getContext("2d");

const buttonsWrap = document.getElementById("buttonsWrap");
const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");

const startMusicBtn = document.getElementById("startMusic");
const musicToggle = document.getElementById("musicToggle");

const trackA = document.getElementById("trackA"); // kalamantina
const trackB = document.getElementById("trackB"); // yama

let audioEnabled = false;
let musicOn = true;
let yesSize = 24;

// ---------- audio helpers ----------
function fadeTo(audioEl, target, ms = 1200) {
  const start = audioEl.volume;
  const t0 = performance.now();
  return new Promise((resolve) => {
    function tick(now) {
      const p = Math.min(1, (now - t0) / ms);
      audioEl.volume = start + (target - start) * p;
      if (p >= 1) return resolve();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

async function playAFromStartFadeIn() {
  trackB.pause(); trackB.currentTime = 0; trackB.volume = 0;

  trackA.currentTime = 0;
  trackA.volume = 0;
  await trackA.play();
  await fadeTo(trackA, 1, 1200);
}

async function crossfadeAToB() {
  trackB.currentTime = 0;
  trackB.volume = 0;
  await trackB.play();

  await Promise.all([
    fadeTo(trackA, 0, 1200),
    fadeTo(trackB, 1, 1200),
  ]);

  trackA.pause();
  trackA.currentTime = 0;
}

// ---------- start music on the first page ----------
startMusicBtn.addEventListener("click", async () => {
  try {
    audioEnabled = true;
    musicOn = true;
    musicToggle.classList.remove("hidden");
    musicToggle.textContent = "🔊 Music";

    await playAFromStartFadeIn();

    startMusicBtn.textContent = "✅ Music playing";
    startMusicBtn.disabled = true;
  } catch (e) {
    // If iPhone blocks, user can tap again
    console.log("Audio blocked:", e);
  }
});

// ---------- toggle music ----------
musicToggle.addEventListener("click", async () => {
  if (!audioEnabled) return;

  musicOn = !musicOn;
  if (!musicOn) {
    musicToggle.textContent = "🔇 Music";
    trackA.pause();
    trackB.pause();
  } else {
    musicToggle.textContent = "🔊 Music";
    try {
      // Resume whichever is currently “active”
      if (!trackB.paused && trackB.volume > 0.01) await trackB.play();
      else await trackA.play();
    } catch(e) {}
  }
});

// ---------- NO button dodge (keeps alignment initially) ----------
function makeNoAbsoluteIfNeeded() {
  if (getComputedStyle(noBtn).position === "absolute") return;

  // Freeze it where it currently is, then allow us to move it inside the wrapper
  const wrapRect = buttonsWrap.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();

  noBtn.style.position = "absolute";
  noBtn.style.left = `${noRect.left - wrapRect.left}px`;
  noBtn.style.top  = `${noRect.top  - wrapRect.top}px`;
}

function dodgeNo() {
  makeNoAbsoluteIfNeeded();

  const wrap = buttonsWrap.getBoundingClientRect();
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  const pad = 8;
  const maxX = Math.max(pad, wrap.width - bw - pad);
  const maxY = Math.max(pad, wrap.height - bh - pad);

  const x = Math.random() * (maxX - pad) + pad;
  const y = Math.random() * (maxY - pad) + pad;

  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;

  yesSize *= 1.18;
  yesBtn.style.fontSize = `${Math.round(yesSize)}px`;
}

noBtn.addEventListener("mouseenter", dodgeNo);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodgeNo();
}, { passive: false });

// ---------- YES click: crossfade + animation ----------
yesBtn.addEventListener("click", async () => {
  card.style.display = "none";
  canvas.style.display = "block";

  // If they never tapped Start Music, YES is still a user gesture, so we can start here too
  if (!audioEnabled) {
    audioEnabled = true;
    musicToggle.classList.remove("hidden");
    musicToggle.textContent = "🔊 Music";
  }

  if (musicOn) {
    try {
      const aPlaying = !trackA.paused && trackA.volume > 0.01;
      if (aPlaying) await crossfadeAToB();
      else {
        // Just start B with fade in
        trackB.currentTime = 0;
        trackB.volume = 0;
        await trackB.play();
        await fadeTo(trackB, 1, 1200);
      }
    } catch (e) {
      console.log("Crossfade failed:", e);
    }
  }

  startSpiralSunflower();
});

// ---------- canvas sizing ----------
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", () => {
  if (canvas.style.display === "block") {
    resizeCanvas();
  }
});

// ---------- “Other animation previously”: spiral + petal arcs ----------
function startSpiralSunflower() {
  resizeCanvas();

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;
  const cx = () => W() / 2;
  const cy = () => H() / 2;

  const golden = 137.508 * Math.PI / 180;

  // Speed / look controls
  const TOTAL_SEEDS = 1800;      // more = richer
  const SEEDS_PER_FRAME = 120;   // faster
  const PETAL_RINGS = 10;        // fewer rings = less “mess”
  const PETAL_SEGMENTS = 22;     // arcs around ring
  const PETAL_COLOR = "#FFA216";
  const SEED_COLOR = "#8B4513";

  let seedIndex = 0;
  let nazAlpha = 0;
  let finished = false;

  function drawBackground() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W(), H());
  }

  function drawPetalArcs() {
    // Controlled arcs (not full spokes). Looks like layered petals.
    ctx.strokeStyle = PETAL_COLOR;
    ctx.lineCap = "round";

    const base = Math.min(W(), H());
    const outer = base * 0.42;
    const ringStep = base * 0.018;

    for (let ring = 0; ring < PETAL_RINGS; ring++) {
      const r = outer - ring * ringStep;
      ctx.lineWidth = 3 - ring * 0.12;

      for (let s = 0; s < PETAL_SEGMENTS; s++) {
        const a = (s / PETAL_SEGMENTS) * Math.PI * 2 + ring * 0.12;

        // shorter arcs to avoid “sunburst”
        const arcLen = Math.PI / 5.2;

        ctx.beginPath();
        ctx.arc(cx(), cy(), r, a, a + arcLen);
        ctx.stroke();
      }
    }
  }

  function drawSeeds(upTo) {
    ctx.save();
    ctx.translate(cx(), cy());

    for (let k = 0; k < upTo; k++) {
      const i = k;
      const r = 4.4 * Math.sqrt(i);   // scale spiral
      const t = i * golden;

      // constrain to centre disk
      const maxR = Math.min(W(), H()) * 0.16;
      if (r > maxR) break;

      const x = r * Math.cos(t);
      const y = r * Math.sin(t);

      ctx.beginPath();
      ctx.fillStyle = SEED_COLOR;
      ctx.arc(x, y, 3.1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawNaz(alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#000";
    ctx.font = "900 72px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Naz", cx(), cy());
    ctx.restore();
  }

  function step() {
    drawBackground();
    drawPetalArcs();

    // seeds build fast
    seedIndex = Math.min(TOTAL_SEEDS, seedIndex + SEEDS_PER_FRAME);
    drawSeeds(seedIndex);

    if (seedIndex >= TOTAL_SEEDS) finished = true;
    if (finished) nazAlpha = Math.min(1, nazAlpha + 0.05);

    drawNaz(nazAlpha);

    if (!(finished && nazAlpha >= 1)) requestAnimationFrame(step);
  }

  step();
}
