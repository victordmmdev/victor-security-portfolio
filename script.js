const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateZ(8px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  const stage = document.querySelector('[data-parallax]');
  window.addEventListener('pointermove', (event) => {
    if (!stage) return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    stage.style.transform = `rotateX(${-y * 6}deg) rotateY(${x * 9}deg)`;
  }, { passive: true });
}

const canvas = document.getElementById('network-canvas');
const context = canvas.getContext('2d');
let points = [];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.min(70, Math.floor(window.innerWidth / 20));
  points = Array.from({ length: count }, (_, index) => ({
    x: (index * 173) % window.innerWidth,
    y: (index * 97) % window.innerHeight,
    vx: ((index % 5) - 2) * 0.035,
    vy: (((index * 3) % 5) - 2) * 0.025,
  }));
}

function drawNetwork() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  points.forEach((point, index) => {
    if (!reducedMotion) {
      point.x = (point.x + point.vx + window.innerWidth) % window.innerWidth;
      point.y = (point.y + point.vy + window.innerHeight) % window.innerHeight;
    }
    context.fillStyle = index % 7 === 0 ? '#ff4055' : '#59616d';
    context.fillRect(point.x, point.y, index % 7 === 0 ? 1.6 : 1, index % 7 === 0 ? 1.6 : 1);
    for (let targetIndex = index + 1; targetIndex < points.length; targetIndex += 1) {
      const target = points[targetIndex];
      const distance = Math.hypot(point.x - target.x, point.y - target.y);
      if (distance < 125) {
        context.strokeStyle = `rgba(115, 123, 137, ${0.11 * (1 - distance / 125)})`;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(target.x, target.y);
        context.stroke();
      }
    }
  });
  if (!reducedMotion) requestAnimationFrame(drawNetwork);
}

resizeCanvas();
drawNetwork();
window.addEventListener('resize', resizeCanvas, { passive: true });
