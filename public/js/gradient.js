document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("headerGradient");
  const img = document.getElementById("albumImage");

  if (!container || !img) return;

  img.crossOrigin = "anonymous";

  function applyGradient() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    const x = Math.floor(canvas.width / 2);
    const y = Math.floor(canvas.height / 2);

    let pixel;

    try {
      pixel = ctx.getImageData(x, y, 1, 1).data;
    } catch (e) {
      console.error("CORS ERROR", e);
      return;
    }

    let r = pixel[0];
    let g = pixel[1];
    let b = pixel[2];

    const original = `rgb(${r}, ${g}, ${b})`;
    const middle = `rgb(${Math.min(r * 1.1, 255)}, ${Math.min(g * 1.1, 255)}, ${Math.min(b * 1.1, 255)})`;
    const lighter = `rgb(${Math.min(r * 1.25, 255)}, ${Math.min(g * 1.25, 255)}, ${Math.min(b * 1.25, 255)})`;

    container.style.background = `
      linear-gradient(
        90deg,
        ${original} 0%,
        ${middle} 50%,
        ${lighter} 100%
      )`;
  }

  if (img.complete) {
    applyGradient();
  } else {
    img.onload = applyGradient;
  }
});
