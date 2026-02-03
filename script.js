* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

body {
  background: radial-gradient(circle, #0b0b0b, #000);
  color: white;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  max-width: 900px;
  padding: 20px;
}

.top-text {
  color: #f7c948; /* sunflower */
  font-weight: 600;
  margin-bottom: 20px;
  font-size: 18px;
}

h1 {
  font-size: clamp(32px, 6vw, 64px);
  line-height: 1.2;
  margin-bottom: 40px;
}

.highlight {
  color: #b983ff; /* lilac */
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

button {
  border: none;
  padding: 18px 36px;
  font-size: 20px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
}

#yesBtn {
  background: #ff4d6d;
  color: white;
}

#noBtn {
  background: #555;
  color: white;
  position: relative;
}

.subtext {
  color: #ccc;
  font-size: 16px;
  margin-top: 10px;
}

.always {
  margin-top: 25px;
  color: #f7c948;
  font-size: 20px;
  font-weight: 600;
}
