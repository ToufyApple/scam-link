const yes = document.getElementById("yes");
const no = document.getElementById("no");
const card = document.getElementById("card");
const canvas = document.getElementById("sunflower");
const ctx = canvas.getContext("2d");

const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

let yesSize = 24;
let musicOn = true;

// -----------------------------
// NO button runs away + YES grows
// -----------------------------
function dodgeNo() {
  const area = document.getElementById("buttons").getBoundingClientRect();

  const maxLeft = Math.max(0, area.width - no.offsetWidth);
  const maxTop  = Math.max(0, area.height - no.offsetHeight);

  no.style.left = `${Math.random() * maxLeft}px`;
  no.style.top  = `${Math.random() * maxTop}px`;

  yesSize *= 1.18;
  yes.style.fontSize = `${Math.round(yesSize)}px`;
}

no.addEventListener("mouseenter", dodgeNo);
no.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodgeNo();
}, { passive: false });

// -----------------------------
// YES click → start music + animation
// -----------------------------
yes.addEventListener("click", async () => {
  card.style.display = "none";
  canvas.style.display = "block";
  musicToggle.classList.remove("hidden");

  try { if (musicOn) await bgMusic.play(); } catch(e) {}

  startSunflower();
});

// Music toggle
musicToggle.addEventListener("click", async () => {
  musicOn = !musicOn;
  if (musicOn) {
    musicToggle.textContent = "🔊 Music";
    try { await bgMusic.play(); } catch(e) {}
  } else {
    musicToggle.textContent = "🔇 Music";
    bgMusic.pause();
  }
});

// -----------------------------
// SUNFLOWER that looks like a sunflower
// -----------------------------
function startSunflower() {
  resize();
  window.addEventListener("resize", resize);

  const dpr = window.devicePixelRatio || 1;

  const W = () => canvas.width / dpr;
  const H = () => canvas.height / dpr;
  const cx = () => W() / 2;
  const cy = () => H() / 2;
  const base = () => Math.min(W(), H());

  // Sizes
  const petalCount = 28;                  // fewer = clearer petals
  const petalLen = () => base() * 0.28;   // petal length
  const petalWid = () => base() * 0.12;   // petal width
  const petalRing = () => base() * 0.18;  // where petals start from

  const diskR = () => base() * 0.17;      // seed head radius (big)
  const seedsTotal = 1100;                // dense center
  const seedsPerFrame = 90;               // fast

  // Animation states
  let petalsProgress = 0;                 // 0..1
  let seeds = 0;

  let nazAlpha = 0;
  let finished = false;

  const golden = 137.508 * Math.PI / 180;

  function bg() {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W(), H());
    ctx.restore();
  }

  function drawPetal(angle, t) {
    // t is 0..1 for "grow in"
    const len = petalLen() * t;
    const wid = petalWid() * (0.65 + 0.35 * t);

    ctx.save();
    ctx.translate(cx(), cy());
    ctx.rotate(angle);

    // petal gradient
    const grad = ctx.createLinearGradient(0, -petalRing(), 0, -(petalRing() + len));
    grad.addColorStop(0, "#FFD84D");
    grad.addColorStop(0.5, "#FFA216");
    grad.addColorStop(1, "#FF8C00");
    ctx.fillStyle = grad;

    // teardrop petal
    const y0 = -petalRing();
    const y1 = -(petalRing() + len);

    ctx.beginPath();
    ctx.moveTo(0, y1); // tip
    ctx.bezierCurveTo(wid * 0.9, y1 + len * 0.35, wid, y0 + len * 0.15, 0, y0);
    ctx.bezierCurveTo(-wid, y0 + len * 0.15, -wid * 0.9, y1 + len * 0.35, 0, y1);
    ctx.closePath();
    ctx.fill();

    // subtle outline
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  function drawPetals(t) {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Draw back petals first (slightly darker), then front petals for depth
    for (let i = 0; i < petalCount; i++) {
      const angle = i * (Math.PI * 2 / petalCount);

      // stagger growth so it feels animated
      const local = Math.max(0, Math.min(1, (t * 1.25) - i / petalCount));
      drawPetal(angle, local);
    }

    ctx.restore();
  }

  function drawDisk() {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const r = diskR();
    const g = ctx.createRadialGradient(cx(), cy(), r * 0.15, cx(), cy(), r);
    g.addColorStop(0, "#4A210F");
    g.addColorStop(0.6, "#2B1209");
    g.addColorStop(1, "#130806");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx(), cy(), r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawSeeds(count) {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (let i = 0; i < count; i++) {
      const k = seeds + i;
      if (k >= seedsTotal) break;

      // spiral position inside disk
      const radius = Math.sqrt(k / seedsTotal) * (diskR() * 0.92);
      const theta = k * golden;

      const x = cx() + radius * Math.cos(theta);
      const y = cy() + radius * Math.sin(theta);

      // seed shading variation
      const tone = 120 + (k % 40);
      ctx.fillStyle = `rgb(${tone}, 70, 35)`;

      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    seeds = Math.min(seedsTotal, seeds + count);
    ctx.restore();
  }

  function drawNaz(alpha) {
    if (alpha <= 0) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "#000";
    ctx.font = "900 72px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Naz", cx(), cy());

    ctx.restore();
  }

  function step() {
    bg();

    // petals grow in quickly
    petalsProgress = Math.min(1, petalsProgress + 0.06);
    drawPetals(petalsProgress);

    // disk always visible once petals start
    if (petalsProgress > 0.25) drawDisk();

    // seeds start when petals are mostly in
    if (petalsProgress > 0.55) drawSeeds(seedsPerFrame);

    if (petalsProgress >= 1 && seeds >= seedsTotal) finished = true;

    if (finished) nazAlpha = Math.min(1, nazAlpha + 0.05);

    drawNaz(nazAlpha);

    if (finished && nazAlpha >= 1) return;
    requestAnimationFrame(step);
  }

  step();
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
}
