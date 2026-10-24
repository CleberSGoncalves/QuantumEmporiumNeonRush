// src/particles.js
// High-Performance Cyberpunk Procedural Particle System

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  clear() {
    this.particles = [];
  }

  // Electric sparks from Nano-Fabricators
  emitSparks(x, y, count = 8, color = '#00f5ff') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        decay: 2.0 + Math.random() * 2.0,
        color,
        shape: 'spark'
      });
    }
  }

  // Cash burst when customer pays at register
  emitCashBurst(x, y, count = 16) {
    const colors = ['#22c55e', '#4ade80', '#facc15', '#00f5ff'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8; // Upward fountain
      const speed = 70 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 120,
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        decay: 1.2 + Math.random() * 0.8,
        color: colors[i % colors.length],
        shape: Math.random() > 0.5 ? 'credit' : 'circle',
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }
  }

  // Delivery beam particles when stocking shelves
  emitDeliveryFlow(fromX, fromY, toX, toY, color = '#00f5ff', count = 6) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    for (let i = 0; i < count; i++) {
      const progress = Math.random() * 0.4;
      const speed = 180 + Math.random() * 140;
      this.particles.push({
        x: fromX + dx * progress,
        y: fromY + dy * progress,
        vx: nx * speed + (Math.random() - 0.5) * 40,
        vy: ny * speed + (Math.random() - 0.5) * 40,
        size: 3 + Math.random() * 3,
        alpha: 1.0,
        decay: 1.8 + Math.random() * 1.5,
        color,
        shape: 'circle'
      });
    }
  }

  // Milestone Star Burst
  emitStarBurst(x, y, count = 25) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        alpha: 1.0,
        decay: 1.0 + Math.random() * 1.0,
        color: '#facc15',
        shape: 'star',
        rot: Math.random() * Math.PI,
        rotSpeed: 6
      });
    }
  }

  // Movement exhaust / Dash trail
  emitDashTrail(x, y, color = '#00f5ff', count = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: 3 + Math.random() * 4,
        alpha: 0.8,
        decay: 2.5 + Math.random() * 1.5,
        color,
        shape: 'circle'
      });
    }
  }

  // Victory Confetti
  emitVictoryConfetti(w, h, count = 60) {
    const colors = ['#00f5ff', '#ec4899', '#facc15', '#10b981', '#38bdf8', '#a855f7'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: -20,
        vx: (Math.random() - 0.5) * 60,
        vy: 100 + Math.random() * 220,
        size: 4 + Math.random() * 6,
        alpha: 1.0,
        decay: 0.35 + Math.random() * 0.4,
        color: colors[i % colors.length],
        shape: 'square',
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 12
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      if (p.rotSpeed) {
        p.rot = (p.rot || 0) + p.rotSpeed * dt;
      }
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    if (this.particles.length === 0) return;
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.rot) ctx.rotate(p.rot);

      if (p.shape === 'star') {
        // Draw 4-point star
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.3, -p.size * 0.3);
        ctx.lineTo(p.size, 0);
        ctx.lineTo(p.size * 0.3, p.size * 0.3);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.3, p.size * 0.3);
        ctx.lineTo(-p.size, 0);
        ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'credit') {
        // Draw small cyber credit coin/diamond
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.7, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'square') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }
}
