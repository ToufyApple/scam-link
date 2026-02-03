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

function dodgeNo() {
  const wrap = document.querySelector(".buttons-wrap");
  const wrapRect = wrap.getBoundingClientRect();

  makeNoAbsoluteOnce();

  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  // Movement (small + controlled)
  const dx = (Math.random() * 120) - 60; // -60 → +60
  const dy = (Math.random() * 50)  - 25; // -25 → +25

  const pad = 6;
  const curX = parseFloat(noBtn.style.left);
  const curY = parseFloat(noBtn.style.top);

  const newX = Math.min(Math.max(curX + dx, pad), wrapRect.width  - bw - pad);
  const newY = Math.min(Math.max(curY + dy, pad), wrapRect.height - bh - pad);

  noBtn.style.left = `${newX}px`;
  noBtn.style.top  = `${newY}px`;

  /* 🔽 NO gets smaller */
  noScale = Math.max(0.45, noScale * 0.88);
  noBtn.style.transform = `scale(${noScale})`;

  /* 🔼 YES gets bigger */
  yesScale = Math.min(1.8, yesScale * 1.12);
  yesBtn.style.transform = `scale(${yesScale})`;
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
    // Stop A cleanly
    if (!trackA.paused) {
      await fadeTo(trackA, 0);
      await stopHard(trackA);
    }

    // Start B
    trackB.currentTime = 0;
    trackB.volume = 0;
    await trackB.play();
    await fadeTo(trackB, 1);

  } catch (e) {
    console.log("Music switch failed:", e);
  }
});
