/** Constellation logic (from main.js: initConstellation) */
export function initConstellation(names) {
    const canvas = document.getElementById('partnerCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor(text) {
            this.text = text;
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = 12 + Math.random() * 8;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.font = `${this.size}px "KaiTi", serif`;
            ctx.fillStyle = "#555";
            ctx.textAlign = "center";
            ctx.fillText(this.text, this.x, this.y);
        }
    }

    if (names && names.length > 0) {
        names.forEach(name => {
            particles.push(new Particle(name));
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        const connectDistance = 100;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectDistance) {
                    const opacity = 1 - (distance / connectDistance);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(166, 28, 38, ${opacity * 0.4})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y - 5);
                    ctx.lineTo(particles[j].x, particles[j].y - 5);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}
