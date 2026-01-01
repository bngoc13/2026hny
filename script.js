import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";

const greetingEl = document.querySelector('.greeting');
const containerEl = document.querySelector('.container');
const nameEl = document.querySelector('.name');

if (window.innerWidth < 1110) {
  document.body.removeChild(greetingEl);
  document.body.removeChild(containerEl);
  document.body.removeChild(nameEl);

  const lowWidthSpan = document.createElement('span');
  lowWidthSpan.innerText = 'Use more wide screen. (min. width = 1110px)';
  lowWidthSpan.classList.add('error');
  document.body.appendChild(lowWidthSpan);
} else {
  // Đợi 38 giây theo logic cũ của bạn
  setTimeout(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = './script.js';
  
    document.body.appendChild(script);
    document.body.removeChild(greetingEl);

    // KÍCH HOẠT PHÁO HOA KHI LỚP ĐỎ BIẾN MẤT
    initFireworks();
  }, 38000); 
}

// ================= HÀM XỬ LÝ PHÁO HOA =================
function initFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.velocity = {
        x: (Math.random() - 0.5) * 12,
        y: (Math.random() - 0.5) * 12
      };
      this.alpha = 1;
      this.friction = 0.96;
      this.gravity = 0.15;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;
      this.velocity.y += this.gravity;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.alpha -= 0.012;
    }
  }

  function createExplosion() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.6); // Nổ ở phần trên màn hình
    const colors = ['#ff0040', '#00ff40', '#0040ff', '#ffff00', '#ff00ff', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    // Tạo hiệu ứng mờ dần (trail) cho hạt pháo hoa
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      if (p.alpha > 0) {
        p.update();
        p.draw();
      } else {
        particles.splice(i, 1);
      }
    });
  }

  // Bắt đầu vòng lặp hoạt ảnh
  animate();

  // Cứ 600ms tạo một vụ nổ mới
  setInterval(createExplosion, 600);
}