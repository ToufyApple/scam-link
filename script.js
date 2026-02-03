// Matches your Python behaviour + sunflower animation with "Naz" in the center (big + black).

const HER_NAME = "Naz";

// --- Proposal UI (YES grows, NO dodges) ---
const proposalScreen = document.getElementById("proposalScreen");
const animationScreen = document.getElementById("animationScreen");

const buttonArea = document.getElementById("buttonArea");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const replayBtn = document.getElementById("replayBtn");

let yesFontSize = 16; // base button font-size

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function moveNoButtonRandomly() {
  const area = buttonArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();

  // padding so it doesn't hug edges
  const padX = 20;
  const padY = 14;

  const maxX = area.width - btn.width - padX;
  const maxY = area.height - btn.height - padY;

  const x = Math.random() * (maxX - padX) + padX;
  const y = Math.random() * (maxY - padY) + padY;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

noBtn.addEventListener("mouseenter", () => {
  moveNoButtonRandomly();
});

noBtn.addEventListener("click", () => {
  // Just like Python: YES grows every time NO is clicked
  yesFontSize = yesFontSize * 1.25;
  yesBtn.style.fontSize = `${Math.round(yesFontSize)}px`;
});

// On mobile, "hover" isn't consistent; also dodge on touchstart for laughs
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoButtonRandomly();
}, { passive: false });

yesBtn.addEventListener("click", () => {
  // Switch to animation screen
  proposalScreen.classList.add("hidden");
  animationScreen.classList.remove("hidden");

  startOrRestartAnimation();
});

replayBtn.addEventListener("click", () => {
  startOrRestartAnimation();
});

// --- Sunflower animation (Canvas) ---
const canvas = document.getElementById("sunflowerCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
}

window.addEventListener("resize", () => {
  resizeCanvas();
  // keep it simple: restart on resize so it stays centred
  startOrRestartAnimation();
});

let rafId = null;

function clearBlack(){
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawPetalArc(cx, cy, radius, startAng, sweepAng, stroke, lineW){
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineW;
  ctx.lineCap = "round";
  ctx.arc(0, 0, radius, startAng, startAng + sweepAng);
  ctx.stroke();
  ctx.restore();
}

// We emulate the turtle vibe: layered loops + golden-angle seed stamping
function startOrRestartAnimation(){
  if (rafId) cancelAnimationFrame(rafId);
  resizeCanvas();
  clearBlack();

  const W = window.innerWidth;
  const H = window.innerHeight;
  const cx = W / 2;
  const cy = H / 2;

  // Petals config (approx turtle look)
  const petalColor = "#FFA216";
  const seedColor = "#8B4513";

  // Petal animation state
  let i = 0;         // outer loop (like turtle i in range(16))
  let j = 0;         // inner thickness loop (like turtle j in range(18))
  let phase = 0;     // 0/1 arcs per petal segment

  // Seed animation state
  let seedIndex = 0;
  const totalSeeds = 140;
  const goldenAng = 137.508 * (Math.PI / 180);

  // Timing
  const petalsPerFrame = 3; // speed control
  const seedsPerFrame = 3;

  function step(){
    clearBlack();

    // 1) Draw petals up to current state
    // We'll redraw from scratch each frame (simple + consistent)
    // Re-run loops up to current (i,j,phase) state.
    const maxI = i;
    const maxJ = j;
    const maxPhase = phase;

    // Petal geometry
    const baseRadius = Math.min(W, H) * 0.26; // roughly like turtle circle(150..)
    const radiusStep = Math.min(W, H) * 0.010; // j*6 equivalent

    for (let ii = 0; ii <= maxI; ii++){
      // rotate whole ring slightly each i
      const ringRot = ii * (Math.PI / 7.5);
      for (let jj = 0; jj <= 18; jj++){
        if (ii === maxI && jj > maxJ) break;

        const r = baseRadius - jj * radiusStep;
        const lw = 2.4;

        // Each jj draws two quarter-ish arcs in turtle; we approximate with arcs around centre
        // We'll place 18 arc-pairs around a ring angle that changes by jj and ii.
        const segments = 18;
        for (let s = 0; s < segments; s++){
          const ang = ringRot + s * (2 * Math.PI / segments);

          // draw first arc always; second arc depends on "phase" when on the very last loop
          const doSecond =
            (ii < maxI) ||
            (ii === maxI && jj < maxJ) ||
            (ii === maxI && jj === maxJ && maxPhase >= 1);

          // arc 1
          drawPetalArc(cx, cy, r, ang, Math.PI / 2, petalColor, lw);
          // arc 2 (mirrors)
          if (doSecond){
            drawPetalArc(cx, cy, r, ang + Math.PI, Math.PI / 2, petalColor, lw);
          }
        }
      }
    }

    // 2) Draw seeds up to seedIndex
    ctx.save();
    ctx.translate(cx, cy);
    for (let k = 0; k < seedIndex; k++){
      const r = 4 * Math.sqrt(k);
      const theta = k * goldenAng;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);

      ctx.beginPath();
      ctx.fillStyle = seedColor;
      ctx.arc(x, y, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3) Draw "Naz" in centre, big + black (visible over brown seeds)
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.font = "800 56px Avenir, Avenir Next, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(HER_NAME, cx, cy + 6);
    ctx.restore();

    // 4) Advance animation state
    // Petals: progress through (i:0..15) (j:0..18) (phase:0..1)
    let steps = petalsPerFrame;
    while (steps-- > 0 && i < 16){
      if (phase === 0){
        phase = 1;
      } else {
        phase = 0;
        j++;
        if (j > 18){
          j = 0;
          i++;
        }
      }
    }

    // After petals mostly drawn, grow seeds
    if (i >= 16){
      seedIndex = clamp(seedIndex + seedsPerFrame, 0, totalSeeds);
    }

    // Stop when done
    if (i >= 16 && seedIndex >= totalSeeds){
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(step);
  }

  // Reset state
  i = 0; j = 0; phase = 0;
  seedIndex = 0;

  step();
}
