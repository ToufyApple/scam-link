const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const btnRow = document.getElementById("btnRow");

let yesScale = 1;
let noScale = 1;

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function moveNoButton(){
  const bounds = btnRow.getBoundingClientRect();

  // keep NO inside the button area (app-like)
  const padding = 10;
  const w = noBtn.offsetWidth;
  const h = noBtn.offsetHeight;

  const maxX = bounds.width  - w - padding;
  const maxY = bounds.height - h - padding;

  const x = Math.random() * maxX + padding;
  const y = Math.random() * maxY + padding;

  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
  noBtn.style.transform = `translate(0, 0) scale(${noScale})`;
}

function punishNo(){
  // YES gets bigger (like Tkinter version)
  yesScale = clamp(yesScale * 1.18, 1, 3.2);
  yesBtn.style.transform = `scale(${yesScale})`;

  // NO gets smaller + runs away
  noScale = clamp(noScale * 0.92, 0.55, 1);
  moveNoButton();
}

// Make the NO button start in a nice place (not random)
(function initNo(){
  // place near center-right like your screenshot
  const bounds = btnRow.getBoundingClientRect();
  noBtn.style.left = `${bounds.width * 0.62}px`;
  noBtn.style.top  = `${bounds.height * 0.50}px`;
  noBtn.style.transform = `translate(0,0) scale(${noScale})`;
})();

// Desktop hover = run away
noBtn.addEventListener("mouseenter", punishNo);

// Mobile tap = run away
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  punishNo();
}, { passive: false });

// If she somehow clicks NO (rare), still punish
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  punishNo();
});

yesBtn.addEventListener("click", () => {
  window.location.href = "sunflower.html";
});
