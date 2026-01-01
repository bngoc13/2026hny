const greetingEl = document.querySelector('.greeting');
const containerEl = document.querySelector('.container');

// Cấu hình âm thanh 50%
const explosionSound = new Audio('./explosion.mp3');
explosionSound.volume = 0.5;
// Trong script1.js
const startBtn = document.getElementById('start-btn');
const rotateHint = document.getElementById('rotate-hint');

if (startBtn) {
    startBtn.onclick = () => {
        // Phát âm thanh mồi để lấy quyền từ trình duyệt
        explosionSound.play().then(() => {
            explosionSound.pause(); 
            rotateHint.style.display = 'none'; // Ẩn thông báo xoay/bắt đầu
        });
    };
}

// Luôn chạy bộ đếm thời gian
setTimeout(() => {
    const greeting = document.querySelector('.greeting');
    if (greeting) greeting.remove();
    initMegaFireworks(); // Hàm pháo hoa rực rỡ đã viết
}, 38000);

// Tạo thông báo yêu cầu xoay ngang điện thoại nếu đang để dọc
const rotateHint = document.createElement('div');
rotateHint.id = 'rotate-hint';
rotateHint.innerHTML = `
    <div style="text-align:center;">
        <p style="font-size:20px;">🔄 Vui lòng xoay ngang điện thoại</p>
        <p style="font-size:14px;">để xem trọn vẹn hiệu ứng</p>
        <button id="start-btn" style="margin-top:20px; padding:10px 20px; border-radius:20px; border:none; background:#fff; color:#ee4b4b; font-weight:bold; cursor:pointer;">Bắt đầu & Bật âm thanh</button>
    </div>
`;
rotateHint.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:#ee4b4b; color:white; z-index:10000; display:flex; align-items:center; justify-content:center; font-family:sans-serif;";
document.body.appendChild(rotateHint);

document.getElementById('start-btn').onclick = () => {
    explosionSound.play().then(() => {
        explosionSound.pause(); // Kích hoạt quyền audio
        rotateHint.style.display = "none";
    });
};

// Sau 38s thì chuyển sang pháo hoa
setTimeout(() => {
    if (greetingEl) {
        greetingEl.style.transition = "opacity 2s";
        greetingEl.style.opacity = "0";
        setTimeout(() => greetingEl.remove(), 2000);
    }
    initMegaFireworks();
}, 38000);

function initMegaFireworks() {
    let canvas = document.querySelector('#canvas') || document.createElement('canvas');
    canvas.id = 'canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    canvas.style = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:1; background:black;";
    
    // Logic pháo hoa giữ nguyên từ bản trước...
    let particles = [];
    let fireworks = [];

    class Firework {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.tx = Math.random() * canvas.width;
            this.ty = Math.random() * (canvas.height * 0.5);
            this.speed = 4;
            this.angle = Math.atan2(this.ty - this.y, this.tx - this.x);
            this.hue = Math.random() * 360;
        }
        update(index) {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.y <= this.ty) {
                const s = explosionSound.cloneNode();
                s.volume = 0.5;
                s.play().catch(() => {});
                createExplosion(this.tx, this.ty, this.hue);
                fireworks.splice(index, 1);
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.hue}, 100%, 70%)`;
            ctx.fill();
        }
    }

    function createExplosion(x, y, hue) {
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: x, y: y,
                hue: hue + (Math.random() * 30 - 15),
                alpha: 1,
                decay: Math.random() * 0.015 + 0.005,
                speed: Math.random() * 8 + 2,
                angle: Math.random() * Math.PI * 2,
                gravity: 0.3, friction: 0.96
            });
        }
    }

    function loop() {
        requestAnimationFrame(loop);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        
        fireworks.forEach((fw, i) => fw.update(i) || fw.draw());
        particles.forEach((p, i) => {
            p.speed *= p.friction;
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
            else {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - Math.cos(p.angle) * 4, p.y - Math.sin(p.angle) * 4);
                ctx.strokeStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
        if (Math.random() < 0.05) fireworks.push(new Firework());
    }
    loop();
}
