//First, add a lightweight utility to manipulate the favicon. You can use a library like Tinycon or a simple Canvas-based helper in src/utils/favicon.js.
export const updateFaviconBadge = (count) => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Draw your existing favicon image here, then overlay a red circle
  const img = new Image();
  img.src = '/favicon.ico';
  img.onload = () => {
    ctx.drawImage(img, 0, 0, 32, 32);
    if (count > 0) {
      ctx.fillStyle = '#ff4d4f';
      ctx.beginPath();
      ctx.arc(24, 8, 8, 0, 2 * Math.PI);
      ctx.fill();
    }
    document.querySelector('link[rel="icon"]').href = canvas.toDataURL();
  };
};
