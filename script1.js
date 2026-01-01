const greetingEl = document.querySelector('.greeting');

// 1. Cấu hình âm thanh
const explosionSound = new Audio('./explosion.mp3');
explosionSound.volume = 0.5;

// 2. Hàm khởi tạo thông báo (Chỉ hiện trên điện thoại)
function setupDisplay() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // Tạo thông báo xoay ngang cho điện thoại
        const rotateHint = document.createElement('div');
        rotateHint.id = 'rotate-hint';
        rotateHint.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <p style="font-size:20px; margin-bottom:10px;">🔄 Vui lòng xoay ngang điện thoại</p>
                <p style="font-size:14px; opacity:0.8;">để xem trọn vẹn hiệu ứng</p>
                <button id="start-btn" style="margin-top:25px; padding:12px 25px; border-radius:30px; border:none; background:#fff; color:#ee4b4b; font-weight:bold; cursor:pointer; font-size:16px; boxShadow: 0 4px 15px rgba(0,0,0,0.2);">Bắt đầu & Bật âm thanh</button>
            </div>
        `;
        rotateHint.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:#ee4b4b; color:white; z-index:10000; display:flex; align-items:center; justify-content:center; font-family:sans-serif;";
        document.body.appendChild(rotateHint);

        document.getElementById('start-btn').onclick = () => {
            explosionSound.play().then(() => {
                explosionSound.pause();
                rotateHint.style.opacity = '0';
                setTimeout(() => rotateHint.remove(), 500);
            }).catch(e => console.log("Audio Error:", e));
        };
    } else {
        // Trên Laptop: Tạo một nút nhỏ kín đáo để kích hoạt âm thanh (Trình duyệt chặn auto-play)
        const soundBtn = document.createElement('button');
        soundBtn.innerHTML = "🔈 Bật âm thanh";
        soundBtn.style = "position:fixed; bottom:20px; right:20px; z-index:10001; padding:10px; border-radius:5px; border:1px solid white; background:rgba(0,0,0,0.5); color:white; cursor:pointer;";
        document.body.appendChild(soundBtn);

        soundBtn.onclick = () => {
            explosionSound.play().then(() => {
                explosionSound.pause();
                soundBtn.remove();
            });
        };
    }
}

// 3. Logic chuyển đổi từ Lời chúc sang Pháo hoa (Chạy đúng 1 lần)
setTimeout(() => {
    if (greetingEl) {
        greetingEl.style.transition = "opacity 2s ease";
        greetingEl.style.opacity = "0";
        setTimeout(() => {
            greetingEl.remove();
            initMegaFireworks();
        }, 2000);
    } else {
        initMegaFireworks();
    }
}, 38000);

// 4. Hàm Pháo hoa
function initMegaFireworks() {
    let canvas = document.querySelector('#canvas') || document.createElement('canvas');
    canvas.id = 'canvas';
    if (!canvas.parentElement) document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const resize = () => {
        // Nếu điện thoại đang dọc, canvas phải lấy Height làm Width vì body đã bị xoay 90 độ
        if (window.innerHeight > window.innerWidth && window.innerWidth < 900) {
            canvas.width = window.innerHeight;
            canvas.height = window.innerWidth;
        } else {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    };

    window.addEventListener('resize', resize);
    resize();

    // Style cứng cho canvas để không bị trôi
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '1',
        background: 'black'
    });
    
    // ... (Các logic Firework bên dưới giữ nguyên)
}
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
        const count = window.innerWidth < 768 ? 50 : 100;
        for (let i = 0; i < count; i++) {
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

// Chạy khởi tạo
setupDisplay();
