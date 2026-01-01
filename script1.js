const greetingEl = document.querySelector('.greeting');
const containerEl = document.querySelector('.container');

// Cấu hình âm thanh
const explosionSound = new Audio('./explosion.mp3');
explosionSound.volume = 0.5;

// Không còn chặn window.innerWidth < 1110 nữa
const btn = document.createElement('div');
btn.innerHTML = "🔈 Chạm để mở quà";
btn.style = "position:fixed; bottom:20px; left:20px; color:white; z-index:10000; padding:8px 15px; border:1px solid rgba(255,255,255,0.5); cursor:pointer; background:rgba(0,0,0,0.3); font-size:14px; border-radius:20px;";
document.body.appendChild(btn);

btn.onclick = () => {
    explosionSound.play().then(() => {
        explosionSound.pause();
        btn.innerHTML = "🔊 Đã sẵn sàng";
        setTimeout(() => btn.style.display = "none", 2000);
    }).catch(e => console.log("Audio ready"));
};

setTimeout(() => {
    if (greetingEl) greetingEl.remove();
    initMegaFireworks();
}, 38000);

function initMegaFireworks() {
    let canvas = document.querySelector('#canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    
    // Tự động điều chỉnh theo kích thước màn hình điện thoại
    const updateSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', updateSize);
    updateSize();

    canvas.style = "position:fixed; top:0; left:0; z-index:999; background:black; width:100%; height:100%;";

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

    class Particle {
        constructor(x, y, hue) {
            this.x = x; this.y = y;
            this.hue = hue + (Math.random() * 30 - 15);
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.005;
            this.speed = Math.random() * (window.innerWidth < 768 ? 6 : 10) + 2; // Giảm tốc độ tia trên đt để mượt hơn
            this.angle = Math.random() * Math.PI * 2;
            this.gravity = 0.4;
            this.friction = 0.96;
        }
        update(index) {
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
            if (this.alpha <= 0) particles.splice(index, 1);
        }
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            let len = window.innerWidth < 768 ? 3 : 6;
            ctx.lineTo(this.x - Math.cos(this.angle) * len, this.y - Math.sin(this.angle) * len);
            ctx.strokeStyle = `hsla(${this.hue}, 100%, 60%, ${this.alpha})`;
            ctx.lineWidth = window.innerWidth < 768 ? 2 : 3; 
            ctx.stroke();
        }
    }

    function createExplosion(x, y, hue) {
        let count = window.innerWidth < 768 ? 60 : 120; // Giảm số hạt trên đt để tránh lag
        for (let i = 0; i < count; i++) particles.push(new Particle(x, y, hue));
    }

    function loop() {
        requestAnimationFrame(loop);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        fireworks.forEach((fw, i) => { fw.draw(); fw.update(i); });
        particles.forEach((p, i) => { p.draw(); p.update(i); });
        if (Math.random() < 0.05) fireworks.push(new Firework());
    }
    loop();
}