const yes = document.getElementById("yes");
const no = document.getElementById("no");
const card = document.getElementById("card");
const canvas = document.getElementById("sunflower");
const ctx = canvas.getContext("2d");

let yesSize = 16;

// --- NO button runs away + YES grows ---
no.addEventListener("mouseenter", () => {
  no.style.left = Math.random() * 200 + "px";
  no.style.top = Math.random() * 80 + "px";

  yesSize *= 1.2;
  yes.style.fontSize = yesSize + "px";
});

// mobile support
no.addEventListener("touchstart", (e) => {
  e.preventDefault();
  no.style.left = Math.random() * 200 + "px";
  no.style.top = Math.random() * 80 + "px";

  yesSize *= 1.2;
  yes.style.fontSize = yesSize + "px";
}, { passive: false });

// --- YES → show sunflower ---
yes.addEventListener("click", () => {
  card.style.display = "none";
  canvas.style.display = "block";
  startSunflower();
});

// ---------------- SUNFLOWER (faster + looks like sunflower + Naz fades in after) ----------------

function startSunflower() {
  resize();
  window.addEventListener("resize", resize);

  const W = () => canvas.width;
  const H = () => canvas.height;
  const cx = () => W() / 2;
  const cy = () => H() / 2;

  // sunflower sizing
  const base = () => Math.min(W(), H());
  const petalOuter = () => base() * 0.34;
  const seedRadiusMax = () => base() * 0.14;

  // animation speeds
  const PETALS_PER_FRAME = 8;     // faster petals
  const SEEDS_PER_FRAME = 40;     // MUCH faster seeds
  const TOTAL_SEEDS = 900;        // denser head, looks real

  // golden angle spiral
  const golden = 137.508 * Math.PI / 180;

  let petalsDrawn = 0;
  const TOTAL_PETALS = 48;

  let seeds = 0;

  // Naz fade after complete
  let nazAlpha = 0;
  let done = false;

  function drawBackground() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W(), H());
  }

  function drawPetals(count) {
    // petals are teardrops, rotated around center
    for (let p = 0; p < count; p++) {
      const i = petalsDrawn + p;
      if (i >= TOTAL_PETALS) break;

      const angle = i * (Math.PI * 2 / TOTAL_PETALS);
      const r = petalOuter();
      const w = base() * 0.065; // petal width
      const h = base() * 0.22;  // petal length

      ctx.save();
      ctx.translate(cx(), cy());
      ctx.rotate(angle);

      // gradient petal (yellow -> orange)
      const grad = ctx.createLinearGradient(0, -h, 0, 0);
      grad.addColorStop(0, "#FFD84D");
      grad.addColorStop(0.55, "#FFA216");
      grad.addColorStop(1, "#F4A300");
      ctx.fillStyle = grad;

      // teardrop shape
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

  function drawSeedHead(count) {
    // draw spiral seeds (brown/orange), dense circle
    ctx.save();
    ctx.translate(cx(), cy());

    for (let i = 0; i < count; i++) {
      const k = seeds + i;
      if (k >= TOTAL_SEEDS) break;

      const t = k * golden;
      const r = Math.sqrt(k / TOTAL_SEEDS) * seedRadiusMax(); // normalized radius
      const x = r * Math.cos(t);
      const y = r * Math.sin(t);

      // seed color variation
      const shade = 90 + (k % 35);
      ctx.fillStyle = `rgb(${shade}, 45, 15)`;

      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    seeds = Math.min(TOTAL_SEEDS, seeds + count);
  }

  function drawCenterDisk() {
    // darker disk behind seeds to help sunflower read correctly
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

  function drawNaz() {
    if (nazAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = nazAlpha;
    ctx.fillStyle = "#000"; // requested black
    ctx.font = "900 72px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Naz", cx(), cy());
    ctx.restore();
  }

  function step() {
    drawBackground();

    // petals first (fast)
    drawPetals(PETALS_PER_FRAME);

    // center disk always present for a sunflower look
    drawCenterDisk();

    // seeds start once some petals exist (feels better)
    if (petalsDrawn > TOTAL_PETALS * 0.25) {
      drawSeedHead(SEEDS_PER_FRAME);
    }

    // when complete, fade in Naz
    if (petalsDrawn >= TOTAL_PETALS && seeds >= TOTAL_SEEDS) {
      done = true;
    }

    if (done) {
      nazAlpha = Math.min(1, nazAlpha + 0.03); // fade-in speed
    }

    drawNaz();

    // stop once Naz fully visible (or keep animating if you want)
    if (done && nazAlpha >= 1) return;

    requestAnimationFrame(step);
  }

  step();
}

function resize() {
  // higher res on iphone screens
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
