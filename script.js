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

const globeCanvas = document.getElementById('globe-canvas');
const globeContext = globeCanvas?.getContext('2d');

if (globeCanvas && globeContext) {
  const size = globeCanvas.width;
  const center = size / 2;
  const radius = size * 0.405;
  const meshNodes = Array.from({ length: 42 }, (_, index) => {
    const y = 1 - (index / 41) * 2;
    const ringRadius = Math.sqrt(1 - y * y);
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(angle) * ringRadius, y, z: Math.sin(angle) * ringRadius };
  });
  const landMasses = [
    [[72,-150],[62,-128],[50,-124],[42,-105],[30,-98],[20,-105],[12,-88],[20,-82],[30,-82],[46,-66],[58,-72],[70,-100],[72,-150]],
    [[12,-80],[4,-77],[-8,-78],[-20,-70],[-34,-62],[-54,-68],[-44,-52],[-22,-44],[-4,-50],[8,-60],[12,-80]],
    [[36,-10],[50,0],[60,20],[68,42],[58,62],[50,90],[38,118],[22,120],[8,104],[20,80],[30,58],[34,34],[30,15],[36,-10]],
    [[34,-16],[18,-18],[4,-8],[-12,12],[-34,18],[-35,32],[-22,43],[-4,40],[12,50],[28,32],[34,10],[34,-16]],
    [[-12,112],[-20,115],[-38,144],[-34,153],[-18,146],[-10,130],[-12,112]],
  ].map((shape) => shape.map(([latitude, longitude]) => spherePoint(latitude, longitude)));

  function rotatePoint(point, yaw, pitch = -0.18) {
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const x = point.x * cosYaw - point.z * sinYaw;
    const z = point.x * sinYaw + point.z * cosYaw;
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    return { x, y: point.y * cosPitch - z * sinPitch, z: point.y * sinPitch + z * cosPitch };
  }

  function spherePoint(latitude, longitude) {
    const lat = latitude * Math.PI / 180;
    const lon = longitude * Math.PI / 180;
    return { x: Math.cos(lat) * Math.cos(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.sin(lon) };
  }

  function drawCurve(points, yaw, color, width = 1) {
    let drawing = false;
    globeContext.beginPath();
    points.forEach((point) => {
      const rotated = rotatePoint(point, yaw);
      if (rotated.z < -0.08) { drawing = false; return; }
      const x = center + rotated.x * radius;
      const y = center - rotated.y * radius;
      if (!drawing) globeContext.moveTo(x, y);
      else globeContext.lineTo(x, y);
      drawing = true;
    });
    globeContext.strokeStyle = color;
    globeContext.lineWidth = width;
    globeContext.stroke();
  }

  function drawGlobe(time = 0) {
    const yaw = reducedMotion ? 0.35 : time * 0.000075;
    globeContext.clearRect(0, 0, size, size);

    const halo = globeContext.createRadialGradient(center * 0.78, center * 0.68, 8, center, center, radius * 1.12);
    halo.addColorStop(0, 'rgba(255,132,145,.24)');
    halo.addColorStop(.45, 'rgba(120,10,35,.10)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    globeContext.fillStyle = halo;
    globeContext.fillRect(0, 0, size, size);

    for (let latitude = -60; latitude <= 60; latitude += 20) {
      const points = [];
      for (let longitude = -180; longitude <= 180; longitude += 4) points.push(spherePoint(latitude, longitude));
      drawCurve(points, yaw, 'rgba(255,66,88,.28)');
    }
    for (let longitude = -180; longitude < 180; longitude += 20) {
      const points = [];
      for (let latitude = -88; latitude <= 88; latitude += 3) points.push(spherePoint(latitude, longitude));
      drawCurve(points, yaw, longitude % 40 === 0 ? 'rgba(255,84,103,.34)' : 'rgba(255,66,88,.19)');
    }
    landMasses.forEach((shape) => drawCurve(shape, yaw, 'rgba(255,132,144,.78)', 2.2));

    const visibleNodes = meshNodes.map((point) => rotatePoint(point, yaw)).filter((point) => point.z > -.08);
    visibleNodes.forEach((point, index) => {
      const nearest = visibleNodes
        .map((target, targetIndex) => ({ target, targetIndex, distance: Math.hypot(point.x - target.x, point.y - target.y) }))
        .filter(({ targetIndex }) => targetIndex > index)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2);
      nearest.forEach(({ target, distance }) => {
        if (distance > .52) return;
        globeContext.beginPath();
        globeContext.moveTo(center + point.x * radius, center - point.y * radius);
        globeContext.lineTo(center + target.x * radius, center - target.y * radius);
        globeContext.strokeStyle = `rgba(255,75,96,${.18 * Math.min(point.z + .25, 1)})`;
        globeContext.lineWidth = .8;
        globeContext.stroke();
      });
      const depth = Math.max(.2, point.z + .35);
      globeContext.beginPath();
      globeContext.arc(center + point.x * radius, center - point.y * radius, index % 9 === 0 ? 3.2 : 1.3, 0, Math.PI * 2);
      globeContext.fillStyle = index % 9 === 0 ? `rgba(255,185,191,${depth})` : `rgba(255,73,95,${depth * .75})`;
      globeContext.shadowColor = '#ff4055';
      globeContext.shadowBlur = index % 9 === 0 ? 16 : 5;
      globeContext.fill();
      globeContext.shadowBlur = 0;
    });

    globeContext.beginPath();
    globeContext.arc(center, center, radius, 0, Math.PI * 2);
    globeContext.strokeStyle = 'rgba(255,103,120,.56)';
    globeContext.lineWidth = 1.5;
    globeContext.stroke();
    if (!reducedMotion && !document.hidden) requestAnimationFrame(drawGlobe);
  }

  drawGlobe();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !reducedMotion) requestAnimationFrame(drawGlobe);
  });
}
