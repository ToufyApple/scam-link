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
  // Keep movement inside the #buttons area
  const area = document.getElementById("buttons").getBoundingClientRect();

  const maxLeft = Math.max(0, area.width - no.offsetWidth);
  const maxTop  = Math.max(0, area.height - no.offsetHeight);

  const left = Math.random() * maxLeft;
  const top = Math.random() * maxTop;

  no.style.left = `${left}px`;
  no.style.top  = `${top}px`;

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
  // Hide card, show canvas
  card.style.display = "none";
  canvas.style.display = "block";
  musicToggle.classList.remove("hidden");

  // Start music (iPhone requires user gesture; this click counts)
  try {
    if (musicOn) await bgMusic.play();
  } catch (err) {
    // If it fails, user can still toggle manually
    console.log("Music play blocked:", err);
  }

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
// Sunflower animation (fast + looks like sunflower + Naz fades in after)
// -----------------------------
function startSunflower() {
  resize();
  window.addEventListener("resize", resize);

  const W = () => canvas.width;
  const H = () => canvas.height;
  const cx = () => W() / 2;
  const cy = () => H() / 2;

  const base = () => Math.min(W(), H());
  const petalOuter = () => base() * 0.34;
  const seedRadiusMax = () => base() * 0.14;

  const TOTAL_PETALS = 48;
  const PETALS_PER_FRAME = 10;     // faster petals

  const TOTAL_SEEDS = 900;
  const SEEDS_PER_FRAME = 70;      // faster seeds

  const golden = 137.508 * Math.PI / 180;

  let petalsDrawn = 0;
  let seeds = 0;

  let nazAlpha = 0;
  let done = false;

  function drawBackground() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W(), H());
  }

  function drawPetals(count) {
    for (let p = 0; p < count; p++) {
      const i = petalsDrawn + p;
      if (i >= TOTAL_PETALS) break;

      const angle = i * (Math.PI * 2 / TOTAL_PETALS);
      const r = petalOuter();
      const w = base() * 0.065;
      const h = base() * 0.22;

      ctx.save();
      ctx.translate(cx(), cy());
      ctx.rotate(angle);

      const grad = ctx.createLinearGradient(0, -h, 0, 0);
      grad.addColorStop(0, "#FFD84D");
      grad.addColorStop(0.55, "#FFA216");
      grad.addColorStop(1, "#F4A300");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(w, -r + h * 0.35, w * 0.55, -r + h, 0, -r + h);
      ctx.bezierCurveTo(-w * 0.55, -r + h, -w, -r + h * 0.35, 0, -r);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
    petalsDrawn = Math.min(TOTAL_PETALS, petalsDrawn + count);
  }

  function drawCenterDisk() {
    ctx.save();
    ctx.translate(cx(), cy());

    const rad = seedRadiusMax() * 1.05;
    const grad = ctx.createRadialGradient(0, 0, rad * 0.15, 0, 0, rad);
    grad.addColorStop(0, "#3B1C0E");
    grad.addColorStop(0.6, "#2A120A");
    grad.addColorStop(1, "#120804");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSeeds(count) {
    ctx.save();
    ctx.translate(cx(), cy());

    for (let i = 0; i < count; i++) {
      const k = seeds + i;
      if (k >= TOTAL_SEEDS) break;

      const t = k * golden;
      const r = Math.sqrt(k / TOTAL_SEEDS) * seedRadiusMax();
      const x = r * Math.cos(t);
      const y = r * Math.sin(t);

      const shade = 90 + (k % 35);
      ctx.fillStyle = `rgb(${shade}, 45, 15)`;

      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    seeds = Math.min(TOTAL_SEEDS, seeds + count);
  }

  function drawNaz() {
    if (nazAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = nazAlpha;
    ctx.fillStyle = "#000";
    ctx.font = "900 72px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Naz", cx(), cy());
    ctx.restore();
  }

  function step() {
    drawBackground();

    drawPetals(PETALS_PER_FRAME);
    drawCenterDisk();

    if (petalsDrawn > TOTAL_PETALS * 0.25) {
      drawSeeds(SEEDS_PER_FRAME);
    }

    if (petalsDrawn >= TOTAL_PETALS && seeds >= TOTAL_SEEDS) {
      done = true;
    }

    if (done) {
      nazAlpha = Math.min(1, nazAlpha + 0.05); // fade speed
    }

    drawNaz();

    if (done && nazAlpha >= 1) return;
    requestAnimationFrame(step);
  }

  step();
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
