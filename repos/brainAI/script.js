const canvas = document.getElementById("neuronCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Particle system for connections
class Particle {
  constructor(x, y, targetX, targetY, color) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.color = color;
    this.progress = Math.random();
    this.speed = 0.002 + Math.random() * 0.003;
  }

  update() {
    this.progress += this.speed;
    if (this.progress >= 1) {
      this.progress = 0;
    }
    this.x = this.x + (this.targetX - this.x) * 0.1;
    this.y = this.y + (this.targetY - this.y) * 0.1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Add this function after the Particle class
function calculateResponsivePosition(baseX, baseY, screenWidth, screenHeight) {
  const scaleX = screenWidth / 1920; // Using 1920px as base width
  const scaleY = screenHeight / 1080; // Using 1080px as base height
  const minScale = 0.6; // Minimum scale to prevent nodes from getting too small

  const scale = Math.max(minScale, Math.min(scaleX, scaleY));
  return {
    x: baseX * scale,
    y: baseY * scale
  };
}

// Update the nodes array to use base positions
const basePositions = {
  visualCortex: { x: -280, y: 200 },
  auditoryArea: { x: 180, y: 120 },
  motorCortex: { x: 280, y: 370 },
  planningReasoning: { x: 30, y: 520 },
  emotionDetection: { x: -240, y: 460 },
  cognitiveControl: { x: 0, y: 270 }
};

const nodes = [
  { label: "Visual Cortex", color: "#66f9da", link: "visualCortex.html", x: 0, y: 0 },
  { label: "Auditory Area", color: "#a78bfa", link: "auditoryCortex.html", x: 0, y: 0 },
  { label: "Motor Cortex", color: "#f6ad55", link: "motorCortex.html", x: 0, y: 0 },
  { label: "Planning & Reasoning", color: "#fc8181", link: "planningCortex.html", x: 0, y: 0 },
  { label: "Emotion Detection", color: "#f687b3", link: "emotionCortex.html", x: 0, y: 0 },
  { label: "Cognitive Control", color: "#63b3ed", link: "cognition.html", x: 0, y: 0 }
];

const connections = [];
const particles = [];
let lastParticleBurst = 0;
const BURST_INTERVAL = 5000; // 5 seconds

// Create connections and particles
for (let i = 0; i < nodes.length; i++) {
  for (let j = 0; j < nodes.length; j++) {
    if (i !== j) {
      connections.push([i, j]);
    }
  }
}

function createParticleBurst() {
  particles.length = 0; // Clear existing particles
  connections.forEach(([from, to]) => {
    // Add more particles per connection for a more dramatic burst
    for (let k = 0; k < 5; k++) {
      particles.push(new Particle(
        nodes[from].x,
        nodes[from].y,
        nodes[to].x,
        nodes[to].y,
        nodes[from].color
      ));
    }
  });
}

let hoveredNode = null;
let time = 0;

// --- Intro Animation State ---
let introAnimating = true;

// For node and connection animation
const nodeElements = [];
const connectionElements = [];

// --- Animate background gradient center ---
let gradientAngle = 0;
function animateBackgroundGradient() {
  gradientAngle += 0.002;
  const x = 0.5 + 0.1 * Math.sin(gradientAngle);
  const y = 0.5 + 0.1 * Math.cos(gradientAngle);
  const gradient = ctx.createRadialGradient(
    canvas.width * x, canvas.height * y, 0,
    centerX, centerY, canvas.width
  );
  gradient.addColorStop(0, 'rgba(17, 24, 39, 0.8)');
  gradient.addColorStop(1, 'rgba(17, 24, 39, 0.4)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// --- Animate nodes and connections ---
function animateIntro() {
  document.body.classList.add('intro-animating');
  // Animate nodes in
  nodes.forEach((node, i) => {
    setTimeout(() => {
      node.visible = true;
      if (i === nodes.length - 1) {
        // After nodes, animate connections
        setTimeout(() => {
          connections.forEach((conn, j) => {
            setTimeout(() => {
              conn.visible = true;
              if (j === connections.length - 1) {
                introAnimating = false;
                document.body.classList.remove('intro-animating');
              }
            }, j * 60);
          });
        }, 400);
      }
    }, i * 180);
  });
}

// --- Modify draw() to use animation state ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  time += 0.01;

  // Animate background gradient
  animateBackgroundGradient();

  // Check if it's time for a new particle burst
  const currentTime = Date.now();
  if (currentTime - lastParticleBurst > BURST_INTERVAL) {
    createParticleBurst();
    lastParticleBurst = currentTime;
  }

  // Update and draw particles
  particles.forEach(particle => {
    particle.update();
    particle.draw(ctx);
  });

  // Draw connections with animated glow and intro animation
  connections.forEach(([from, to], idx) => {
    const a = nodes[from];
    const b = nodes[to];
    const pulse = (Math.sin(time * 2 + from + to) + 1) * 0.5;
    // Only draw if visible (after intro anim)
    if (!connections[idx].visible && introAnimating) return;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + 0.2 * pulse})`;
    ctx.lineWidth = 0.8 + 0.3 * pulse;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });

  // Draw nodes with enhanced effects and intro animation
  nodes.forEach((node, index) => {
    if (!node.visible && introAnimating) return;
    const isHovered = node === hoveredNode;
    const radius = isHovered ? 42 : 36;
    const pulse = (Math.sin(time * 3 + index) + 1) * 0.5;

    // Draw outer glow
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = `${node.color}33`;
    ctx.fill();

    // Draw main node
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.shadowColor = node.color;
    ctx.shadowBlur = isHovered ? 50 : 30;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw inner highlight
    ctx.beginPath();
    ctx.arc(node.x - radius * 0.3, node.y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();

    // Draw label with enhanced styling
    ctx.fillStyle = "#ffffff";
    ctx.font = isHovered ? "bold 18px Inter" : "bold 16px Inter";
    ctx.textAlign = "center";
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(node.label, node.x, node.y - radius - 10);
    ctx.shadowBlur = 0;
  });

  requestAnimationFrame(draw);
}

// Enhanced mouse interaction
canvas.addEventListener("mousemove", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let found = false;
  nodes.forEach(node => {
    const dx = node.x - mouseX;
    const dy = node.y - mouseY;
    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      hoveredNode = node;
      found = true;
    }
  });

  if (!found) hoveredNode = null;
  canvas.style.cursor = hoveredNode ? "pointer" : "default";
});

canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  nodes.forEach(node => {
    const dx = node.x - mouseX;
    const dy = node.y - mouseY;
    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      window.location.href = node.link;
    }
  });
});

// Handle window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Update node positions with responsive scaling
  const positions = [
    calculateResponsivePosition(basePositions.visualCortex.x, basePositions.visualCortex.y, canvas.width, canvas.height),
    calculateResponsivePosition(basePositions.auditoryArea.x, basePositions.auditoryArea.y, canvas.width, canvas.height),
    calculateResponsivePosition(basePositions.motorCortex.x, basePositions.motorCortex.y, canvas.width, canvas.height),
    calculateResponsivePosition(basePositions.planningReasoning.x, basePositions.planningReasoning.y, canvas.width, canvas.height),
    calculateResponsivePosition(basePositions.emotionDetection.x, basePositions.emotionDetection.y, canvas.width, canvas.height),
    calculateResponsivePosition(basePositions.cognitiveControl.x, basePositions.cognitiveControl.y, canvas.width, canvas.height)
  ];

  nodes.forEach((node, index) => {
    node.x = centerX + positions[index].x;
    node.y = centerY + positions[index].y;
  });
});

// Initial position calculation
function initializePositions() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const positions = [
    calculateResponsivePosition(basePositions.visualCortex.x, basePositions.visualCortex.y, canvas.width, canvas.height),
    calculateResponsivePosition(basePositions.auditoryArea.x, basePositions.auditoryArea.y, canvas.width, canvas.height),
    calculateResponsivePosition(basePositions.motorCortex.x, basePositions.motorCortex.y, canvas.width, canvas.height),
    calculateResponsivePosition(basePositions.planningReasoning.x, basePositions.planningReasoning.y, canvas.width, canvas.height),
    calculateResponsivePosition(basePositions.emotionDetection.x, basePositions.emotionDetection.y, canvas.width, canvas.height),
    calculateResponsivePosition(basePositions.cognitiveControl.x, basePositions.cognitiveControl.y, canvas.width, canvas.height)
  ];

  nodes.forEach((node, index) => {
    node.x = centerX + positions[index].x;
    node.y = centerY + positions[index].y;
  });
}

// Call initializePositions after canvas setup
initializePositions();

// --- On page load, start intro animation ---
window.addEventListener('DOMContentLoaded', () => {
  nodes.forEach(node => node.visible = false);
  connections.forEach((conn, i) => { connections[i].visible = false; });
  animateIntro();
});

draw();
