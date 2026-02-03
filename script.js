const card = document.getElementById("card");
const yesScreen = document.getElementById("yesScreen");
const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");
const startMusicBtn = document.getElementById("startMusic");

const trackA = document.getElementById("trackA"); // kalamantina
const trackB = document.getElementById("trackB"); // yama

let audioEnabled = false;
let yesScale = 1;
let noScale  = 1;

// prevent overlapping animations
let noIsAnimating = false;
let yesIsBouncing = false;

/* ================= AUDIO HELPERS ================= */
function fadeTo(audio, target, ms = 900) {
  const start = audio.volume;
  const t0 = performance.now();
  return new Promise(resolve => {
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

/* ================= START MUSIC ================= */
startMusicBtn.addEventListener("click", async () => {
  audioEnabled = true;

  await stopHard(trackB);

  trackA.currentTime = 0;
  trackA.volume = 0;
  await trackA.play();
  await fadeTo(trackA, 1);

  startMusicBtn.textContent = "🎶 Playing";
  startMusicBtn.disabled = true;
});

/* ================= UI ANIM HELPERS ================= */

// NO: tiny shake before it moves
function shakeNo(ms = 180) {
  return new Promise(resolve => {
    noBtn.style.transition = "transform 0.04s linear";
    let ticks = 0;
    const i = setInterval(() => {
      ticks++;
      // alternate shake directions
      const dir = ticks % 2 === 0 ? 1 : -1;
      const shakeX = 6 * dir;
      const shakeR = 2 * dir;

      // keep its current scale while shaking
      noBtn.style.transform = `scale(${noScale}) translateX(${shakeX}px) rotate(${shakeR}deg)`;

      if (ticks >= Math.ceil(ms / 40)) {
        clearInterval(i);
        // return to clean scaled state (no translate/rotate)
        noBtn.style.transform = `scale(${noScale})`;
        resolve();
      }
    }, 40);
  });
}

// YES: bounce each time it grows
function bounceYes() {
  if (yesIsBouncing) return;
  yesIsBouncing = true;

  // Use a little overshoot then settle (springy)
  yesBtn.style.transition = "transform 0.14s ease-out";
  yesBtn.style.transform = `scale(${Math.min(yesScale * 1.08, 2.0)})`;

  setTimeout(() => {
    yesBtn.style.transition = "transform 0.18s ease-in";
    yesBtn.style.transform = `scale(${yesScale})`;

    setTimeout(() => {
      yesIsBouncing = false;
    }, 190);
  }, 140);
}

/* ================= NO BUTTON BEHAVIOUR ================= */
function makeNoAbsoluteOnce() {
  if (getComputedStyle(noBtn).position === "absolute") return;

  const wrap = document.querySelector(".buttons-wrap");
  const wrapRect = wrap.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();

  noBtn.style.position = "absolute";
  noBtn.style.left = `${noRect.left - wrapRect.left}px`;
  noBtn.style.top  = `${noRect.top  - wrapRect.top}px`;
}

async function dodgeNo() {
  if (noIsAnimating) return;
  noIsAnimating = true;

  const wrap = document.querySelector(".buttons-wrap");
  const wrapRect = wrap.getBoundingClientRect();

  makeNoAbsoluteOnce();

  // 1) shake first
  await shakeNo(180);

  // 2) then move (small + controlled)
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  const dx = (Math.random() * 120) - 60; // -60..+60
  const dy = (Math.random() * 50)  - 25; // -25..+25

  const pad = 6;
  const curX = parseFloat(noBtn.style.left);
  const curY = parseFloat(noBtn.style.top);

  const newX = Math.min(Math.max(curX + dx, pad), wrapRect.width  - bw - pad);
  const newY = Math.min(Math.max(curY + dy, pad), wrapRect.height - bh - pad);

  // smooth position shift
  noBtn.style.transition = "left 0.14s ease-out, top 0.14s ease-out, transform 0.08s linear";
  noBtn.style.left = `${newX}px`;
  noBtn.style.top  = `${newY}px`;

  // 3) NO gets smaller
  noScale = Math.max(0.45, noScale * 0.88);
  noBtn.style.transform = `scale(${noScale})`;

  // 4) YES gets bigger + bounce
  yesScale = Math.min(1.8, yesScale * 1.12);
  yesBtn.style.transform = `scale(${yesScale})`;
  bounceYes();

  // release lock shortly after movement
  setTimeout(() => {
    noIsAnimating = false;
  }, 220);
}

noBtn.addEventListener("mouseenter", dodgeNo);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodgeNo();
}, { passive:false });

/* ================= YES CLICK ================= */
yesBtn.addEventListener("click", async () => {
  card.classList.add("hidden");
  yesScreen.classList.remove("hidden");

  if (!audioEnabled) audioEnabled = true;

  try {
    // Fade out & stop Track A
    if (!trackA.paused) {
      await fadeTo(trackA, 0, 700);
      await stopHard(trackA);
    } else {
      await stopHard(trackA);
    }

    // Start Track B with fade in
    trackB.currentTime = 0;
    trackB.volume = 0;
    await trackB.play();
    await fadeTo(trackB, 1, 700);

  } catch (e) {
    console.log("Music switch failed:", e);
  }
});
