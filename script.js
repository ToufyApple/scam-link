const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");

noBtn.addEventListener("mouseover", () => {
  const x = Math.random() * 250 - 125;
  const y = Math.random() * 150 - 75;

  noBtn.style.transform = `translate(${x}px, ${y}px) scale(0.85)`;
});

yesBtn.addEventListener("click", () => {
  document.body.innerHTML = `
    <div style="
      background:black;
      height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:Arial, sans-serif;
    ">
      <span style="color:black; font-size:64px; background:#FFD700; padding:20px 40px; border-radius:50%;">
        Naz
      </span>
    </div>
  `;
});
