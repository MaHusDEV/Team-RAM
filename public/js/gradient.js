const img = document.getElementById("albumImage");
const header = document.getElementById("headerGradient");

img.onload = function () {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  const pixel = ctx.getImageData(50, 50, 1, 1).data;

  let r = pixel[0];
  let g = pixel[1];
  let b = pixel[2];

  const original = `rgb(${r}, ${g}, ${b})`;

  const middle = `rgb(${Math.min(r * 1.1, 255)}, ${Math.min(g * 1.1, 255)}, ${Math.min(b * 1.1, 255)})`;

  const lighter = `rgb(${Math.min(r * 1.25, 255)}, ${Math.min(g * 1.25, 255)}, ${Math.min(b * 1.25, 255)})`;

  header.style.background = `
  linear-gradient(
    90deg,
    ${original} 0%,
    ${middle} 50%,
    ${lighter} 100%
  )`;
};
