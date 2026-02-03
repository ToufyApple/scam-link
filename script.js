const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");

let scale = 1;

function dodgeNo() {
  const x = Math.random() * 260 - 130;
  const y = Math.random() * 160 - 80;

  scale = Math.max(0.55, scale - 0.08);

  noBtn.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

noBtn.addEventListener("mouseenter", dodgeNo);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodgeNo();
});

yesBtn.addEventListener("click", () => {
  window.location.href = "sunflower.html";
});
