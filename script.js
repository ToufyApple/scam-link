const card = document.getElementById("card");
const yesScreen = document.getElementById("yesScreen");
const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");
const startMusicBtn = document.getElementById("startMusic");

const trackA = document.getElementById("trackA"); // kalamantina
const trackB = document.getElementById("trackB"); // yama

let audioEnabled = false;
let yesSize = 24;

/* AUDIO FADE */
function fade(audio, from, to, duration = 1200){
  audio.volume = from;
  const step = (to - from) / (duration / 50);
  const i = setInterval(() => {
    audio.volume = Math.max(0, Math.min(1, audio.volume + step));
    if ((step > 0 && audio.volume >= to) || (step < 0 && audio.volume <= to)) {
      clearInterval(i);
    }
  }, 50);
}

/* START MUSIC */
startMusicBtn.addEventListener("click", async () => {
  audioEnabled = true;
  trackA.currentTime = 0;
  trackA.volume = 0;
  await trackA.play();
  fade(trackA, 0, 1);

  startMusicBtn.textContent = "🎶 Playing";
  startMusicBtn.disabled = true;
});

/* ---- NO BUTTON DODGE (SMALLER MOVEMENT) ----
   Keep it close to its original spot so it looks playful, not chaotic.
*/
function dodgeNo(){
  const wrap = document.querySelector(".buttons-wrap");
  const wrapRect = wrap.getBoundingClientRect();

  // Get current position relative to wrapper
  const noRect = noBtn.getBoundingClientRect();
  const currentX = noRect.left - wrapRect.left;
  const currentY = noRect.top - wrapRect.top;

  // Convert to absolute inside wrapper ONCE
  if (getComputedStyle(noBtn).position !== "absolute") {
    noBtn.style.position = "absolute";
    noBtn.style.left = `${currentX}px`;
    noBtn.style.top  = `${currentY}px`;
  }

  // Move by a small random delta (bounded)
  const dx = (Math.random() * 140) - 70;  // -70..+70 px
  const dy = (Math.random() * 80)  - 40;  // -40..+40 px

  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  // Clamp inside wrapper with padding
  const pad = 6;
  const newX = Math.min(Math.max(parseFloat(noBtn.style.left) + dx, pad), wrapRect.width - bw - pad);
  const newY = Math.min(Math.max(parseFloat(noBtn.style.top)  + dy, pad), wrapRect.height - bh - pad);

  noBtn.style.left = `${newX}px`;
  noBtn.style.top  = `${newY}px`;

  // YES grows a bit (but not huge)
  yesSize = Math.min(44, yesSize * 1.08);
  yesBtn.style.fontSize = `${Math.round(yesSize)}px`;
}

noBtn.addEventListener("mouseenter", dodgeNo);
noBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  dodgeNo();
},{ passive:false });

/* YES CLICK */
yesBtn.addEventListener("click", async () => {
  card.classList.add("hidden");
  yesScreen.classList.remove("hidden");

  if (audioEnabled){
    trackB.currentTime = 0;
    trackB.volume = 0;
    await trackB.play();
    fade(trackA, trackA.volume, 0);
    fade(trackB, 0, 1);
  }
});
