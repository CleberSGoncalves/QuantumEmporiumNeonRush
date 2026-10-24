// src/juice.js
// Game Juice & Feel System: Trauma² Screen Shake, Hit-Stop, Squash & Stretch, Floating Numbers

export class JuiceManager {
  constructor() {
    this.trauma = 0;
    this.maxShakeOffset = 18;
    this.maxShakeAngle = 0.05; // radians
    this.shakeDecay = 1.6;

    // Hit-stop state
    this.hitStopRemaining = 0;

    // Floating text popups
    this.floatingTexts = [];
  }

  // Add trauma (0 to 1)
  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  // Trigger hit-stop micro-pause (ms)
  hitStop(durationMs = 50) {
    this.hitStopRemaining = Math.max(this.hitStopRemaining, durationMs / 1000);
  }

  // Spawn floating feedback text (e.g., "+$150", "★ ESTRELA!", "COMBO x2")
  spawnFloatingText(x, y, text, color = '#00f5ff', size = 18, duration = 1.0) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      size,
      alpha: 1.0,
      duration,
      life: duration,
      vy: -45, // upward speed
      vx: (Math.random() - 0.5) * 20,
      scale: 1.3
    });
  }

  update(dt) {
    // Process hit-stop
    if (this.hitStopRemaining > 0) {
      this.hitStopRemaining -= dt;
      return true; // Indicates hit-stop is active
    }

    // Decay trauma
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - this.shakeDecay * dt);
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.x += ft.vx * dt;
      ft.y += ft.vy * dt;
      ft.alpha = Math.max(0, ft.life / ft.duration);
      ft.scale = Math.max(1.0, 1.0 + (ft.life / ft.duration) * 0.3);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    return false;
  }

  // Calculates camera transform with Trauma²
  getShakeTransform() {
    if (this.trauma <= 0.001) {
      return { x: 0, y: 0, angle: 0 };
    }
    // Trauma² formulation: exponential feel
    const shake = this.trauma * this.trauma;
    const offsetX = (Math.random() * 2 - 1) * this.maxShakeOffset * shake;
    const offsetY = (Math.random() * 2 - 1) * this.maxShakeOffset * shake;
    const angle = (Math.random() * 2 - 1) * this.maxShakeAngle * shake;

    return { x: offsetX, y: offsetY, angle };
  }

  // Render floating texts overlay
  renderFloatingTexts(ctx) {
    if (this.floatingTexts.length === 0) return;
    ctx.save();
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `900 ${Math.floor(ft.size * ft.scale)}px 'Orbitron', 'Rajdhani', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Glow effect
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);

      // White outline highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeText(ft.text, ft.x, ft.y);

      ctx.restore();
    }
    ctx.restore();
  }
}

// Squash and Stretch helper for items and characters
export class SquashStretch {
  constructor() {
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.targetX = 1.0;
    this.targetY = 1.0;
    this.stiffness = 280;
    this.damping = 18;
    this.vx = 0;
    this.vy = 0;
  }

  // Apply squash (positive = wider/shorter, negative = taller/thinner)
  applySquash(amount = 0.25) {
    this.scaleX = 1.0 + amount;
    this.scaleY = 1.0 - amount * 0.7;
    this.vx = 0;
    this.vy = 0;
  }

  // Apply stretch (taller and thinner)
  applyStretch(amount = 0.25) {
    this.scaleX = 1.0 - amount * 0.7;
    this.scaleY = 1.0 + amount;
    this.vx = 0;
    this.vy = 0;
  }

  update(dt) {
    // Spring physics towards 1.0
    const fx = -this.stiffness * (this.scaleX - this.targetX) - this.damping * this.vx;
    const fy = -this.stiffness * (this.scaleY - this.targetY) - this.damping * this.vy;

    this.vx += fx * dt;
    this.vy += fy * dt;

    this.scaleX += this.vx * dt;
    this.scaleY += this.vy * dt;

    // Guard against NaN
    if (isNaN(this.scaleX) || !isFinite(this.scaleX)) this.scaleX = 1.0;
    if (isNaN(this.scaleY) || !isFinite(this.scaleY)) this.scaleY = 1.0;
  }
}
