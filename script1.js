/* =========================
   GLOBAL SETUP
========================= */
if (window.innerWidth < 900) {
  document.body.classList.add('mobile');
}
const greetingEl = document.querySelector('.greeting');
const explosionSound = new Audio('./explosion.mp3');
explosionSound.volume = 0.5;

const isMobile = window.innerWidth < 768;


/* =========================
   1. MOBILE START / ROTATE HINT
========================= */

function setupDisplay() {
    if (!isMobile) return;

    const overlay = document.createElement('div');
    overlay.id = 'mobile-start';

    overlay.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <p style="font-size:18px; line-height:1.4;">
                🔄 Xoay ngang để có trải nghiệm đẹp hơn
            </p>
            <button id="start-btn"
                style="
                    margin-top:20px;
                    padding:12px 28px;
                    border-radius:30px;
                    border:none;
                    background:#fff;
                    color:#ee4b4b;
                    font-weight:bold;
                    font-size:16px;
                ">
                Bắt đầu
            </button>
        </div>
    `;

    Object.assign(overlay.style, {
        position: 'fixed',
        inset: 0,
        background: '#ee4b4b',
        color: 'white',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif'
    });

    document.body.appendChild(overlay);

    document.getElementById('start-btn').onclick = () => {
        explosionSound.play().catch(() => {});
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 400);
    };
}


/* =========================
   2. GREETING → FIREWORKS TIMELINE
========================= */

setTimeout(() => {
    if (greetingEl) {
        greetingEl.style.transition = 'opacity 1.5s ease';
        greetingEl.style.opacity = '0';

        setTimeout(() => {
            greetingEl.remove();
            initMegaFireworks();
        }, 1500);
    } else {
        initMegaFireworks();
    }
}, isMobile ? 20000 : 38000);


/* =========================
   3. FIREWORK SYSTEM
========================= */

function initMegaFireworks() {
    let canvas = document.querySelector('#canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize);
    resize();

    Object.assign(canvas.style, {
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'black'
    });

    let particles = [];
    let fireworks = [];


    /* ===== FIREWORK CLASS ===== */

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
            ctx.fillStyle = `hsl(${this.hue},100%,70%)`;
            ctx.fill();
        }
    }


    /* ===== EXPLOSION ===== */

    function createExplosion(x, y, hue) {
        for (let i = 0; i < 80; i++) {
            particles.push({
                x,
                y,
                hue: hue + (Math.random() * 30 - 15),
                alpha: 1,
                decay: Math.random() * 0.015 + 0.005,
                speed: Math.random() * 6 + 2,
                angle: Math.random() * Math.PI * 2,
                gravity: 0.2,
                friction: 0.95
            });
        }
    }


    /* ===== MAIN LOOP ===== */

    function loop() {
        requestAnimationFrame(loop);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'lighter';

        fireworks.forEach((fw, i) => {
            fw.update(i);
            fw.draw();
        });

        particles.forEach((p, i) => {
            p.speed *= p.friction;
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue},100%,60%,${p.alpha})`;
                ctx.fill();
            }
        });

        const spawnRate = isMobile ? 0.03 : 0.06;
        if (Math.random() < spawnRate) {
            fireworks.push(new Firework());
        }
    }

    loop();
}


/* =========================
   INIT
========================= */

setupDisplay();
