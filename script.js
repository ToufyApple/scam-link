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

/* NO BUTTON DODGE */
function dodgeNo(){
  const wrap = document.querySelector(".buttons-wrap");
  const r = wrap.getBoundingClientRect();
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  noBtn.style.position = "absolute";
  noBtn.style.left = Math.random() * (r.width - bw) + "px";
  noBtn.style.top  = Math.random() * (r.height - bh) + "px";

  yesSize *= 1.15;
  yesBtn.style.fontSize = yesSize + "px";
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
