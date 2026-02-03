const card = document.getElementById("card");
const yesScreen = document.getElementById("yesScreen");
const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");
const startMusicBtn = document.getElementById("startMusic");

const trackA = document.getElementById("trackA"); // kalamantina
const trackB = document.getElementById("trackB"); // yama

let audioEnabled = false;
let yesSize = 24;

// ---------- Fade helpers (awaitable, no overlap bugs) ----------
function fadeTo(audio, target, ms = 1200) {
  const start = audio.volume;
  const t0 = performance.now();

  return new Promise((resolve) => {
    function tick(now) {
      const p = Math.min(1, (now - t0) / ms);
      audio.volume = start + (target - start) * p;
      if (p >= 1) return resolve();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

async function stopHard(audio) {
  audio.pause();
  audio.currentTime = 0;
  audio.volume = 0;
}

// ---------- Start Kalamantina on front page ----------
startMusicBtn.addEventListener("click", async () => {
  try {
    audioEnabled = true;

    await stopHard(trackB);

    trackA.currentTime = 0;
    trackA.volume = 0;
    await trackA.play();
    await fadeTo(trackA, 1, 1200);

    startMusicBtn.textContent = "🎶 Playing";
    startMusicBtn.disabled = true;
  } catch (e) {
    console.log("Audio blocked:", e);
  }
});

// ---------- NO button dodge (stays inside wrapper) ----------
function makeNoAbsoluteOnce() {
  if (getComputedStyle(noBtn).position === "absolute") return;

  const wrap = document.querySelector(".buttons-wrap");
  const wrapRect = wrap.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();

  noBtn.style.position = "absolute";
  noBtn.style.left = `${noRect.left - wrapRect.left}px`;
  noBtn.style.top  = `${noRect.top  - wrapRect.top}px`;
}

function dodgeNo(){
  const wrap = document.querySelector(".buttons-wrap");
  const wrapRect = wrap.getBoundingClientRect();

  makeNoAbsoluteOnce();

  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  // Small playful movement, clamped inside wrapper
  const dx = (Math.random() * 140) - 70; // -70..+70
  const dy = (Math.random() * 60)  - 30; // -30..+30

  const pad = 6;
  const curX = parseFloat(noBtn.style.left);
  const curY = parseFloat(noBtn.style.top);

  const newX = Math.min(Math.max(curX + dx, pad), wrapRect.width  - bw - pad);
  const newY = Math.min(Math.max(curY + dy, pad), wrapRect.height - bh - pad);

  noBtn.style.left = `${newX}px`;
  noBtn.style.top  = `${newY}px`;

  yesSize = Math.min(44, yesSize * 1.08);
  yesBtn.style.fontSize = `${Math.round(yesSize)}px`;
}

noBtn.addEventListener("mouseenter", dodgeNo);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodgeNo();
}, { passive:false });

// ---------- YES click: STOP A then START B (no overlap) ----------
yesBtn.addEventListener("click", async () => {
  card.classList.add("hidden");
  yesScreen.classList.remove("hidden");

  // If she never started music, YES click is a valid tap to start audio too
  if (!audioEnabled) audioEnabled = true;

  if (audioEnabled) {
    try {
      // Fade out A completely, then hard stop it
      if (!trackA.paused) {
        await fadeTo(trackA, 0, 900);
        await stopHard(trackA);
      } else {
        await stopHard(trackA);
      }

      // Start B from beginning + fade in
      trackB.currentTime = 0;
      trackB.volume = 0;
      await trackB.play();
      await fadeTo(trackB, 1, 900);

    } catch (e) {
      console.log("Switch failed:", e);
    }
  }
});
