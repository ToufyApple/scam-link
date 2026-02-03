const yes = document.getElementById("yes");
const no = document.getElementById("no");
const card = document.getElementById("card");
const canvas = document.getElementById("sunflower");
const ctx = canvas.getContext("2d");

let yesSize = 16;

// NO button runs away
no.addEventListener("mouseenter", () => {
  no.style.left = Math.random() * 200 + "px";
  no.style.top = Math.random() * 80 + "px";

  yesSize *= 1.2;
  yes.style.fontSize = yesSize + "px";
});

// YES → show sunflower
yes.addEventListener("click", () => {
  card.style.display = "none";
  canvas.style.display = "block";
  startSunflower();
});

// SUNFLOWER ANIMATION
function startSunflower() {
  resize();
  window.addEventListener("resize", resize);

  let seeds = 0;
  const golden = 137.5 * Math.PI / 180;

  function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // petals
    ctx.strokeStyle = "#FFA216";
    ctx.lineWidth = 2;
    for (let r = 140; r > 40; r -= 10) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, a, a + Math.PI / 3);
        ctx.stroke();
      }
    }

    // seeds
    ctx.fillStyle = "#8B4513";
    for (let i = 0; i < seeds; i++) {
      const r = 4 * Math.sqrt(i);
      const t = i * golden;
      ctx.beginPath();
      ctx.arc(
        cx + r * Math.cos(t),
        cy + r * Math.sin(t),
        4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Naz in centre
    ctx.fillStyle = "black";
    ctx.font = "bold 56px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Naz", cx, cy);

    seeds += 2;
    requestAnimationFrame(draw);
  }

  draw();
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
