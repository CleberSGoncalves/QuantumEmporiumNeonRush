// src/player.js
// Manager Hero Controller: 360° Movement, 120ms Coyote Time / Interaction Buffer,
// Dynamic Flowing Trench Coat / Cape Physics & Skin Customization

import { ITEM_TYPES } from './levels.js';
import { SquashStretch } from './juice.js';

export const SKINS = {
  CYBER_DEFAULT: {
    id: 'CYBER_DEFAULT',
    name: 'Cyber Runner',
    namePt: 'Corredor Cyber',
    price: 0,
    coatColor: '#0284c7',
    visorColor: '#00f5ff',
    glowColor: '#00f5ff',
    trimColor: '#38bdf8'
  },
  GOLDEN_VIP: {
    id: 'GOLDEN_VIP',
    name: 'Executive Gold',
    namePt: 'Executivo Dourado',
    price: 600,
    coatColor: '#eab308',
    visorColor: '#fde047',
    glowColor: '#facc15',
    trimColor: '#ffffff'
  },
  PLASMA_VOID: {
    id: 'PLASMA_VOID',
    name: 'Void Archon',
    namePt: 'Arcano do Vazio',
    price: 1200,
    coatColor: '#7e22ce',
    visorColor: '#ec4899',
    glowColor: '#c084fc',
    trimColor: '#f43f5e'
  },
  STEALTH_MECH: {
    id: 'STEALTH_MECH',
    name: 'Emerald Phantom',
    namePt: 'Fantasma Esmeralda',
    price: 2000,
    coatColor: '#065f46',
    visorColor: '#34d399',
    glowColor: '#10b981',
    trimColor: '#a7f3d0'
  }
};

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 22;
    this.vx = 0;
    this.vy = 0;
    this.baseSpeed = 270;
    this.speedMultiplier = 1.0;
    this.angle = 0;
    this.squash = new SquashStretch();

    // Inventory Stack
    this.stack = [];
    this.maxCapacity = 4;

    // Dash
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.dashInputBuffer = 0; // 120ms input buffer

    // Coyote Time / Interaction Tolerance Buffer (120ms)
    this.coyoteTimeRemaining = 0;
    this.lastInteractedEntity = null;

    // Cape / Trench Coat Dynamic Tail Nodes (Verlet-like cloth simulation)
    this.capeNodes = [
      { x: this.x, y: this.y },
      { x: this.x, y: this.y },
      { x: this.x, y: this.y },
      { x: this.x, y: this.y }
    ];

    // Transfer Timers
    this.pickupCooldown = 0;
    this.dropCooldown = 0;

    // Active Skin
    this.skin = SKINS.CYBER_DEFAULT;

    // Navigation target (for Mouse/Touch click-to-move)
    this.navTarget = null;
  }

  setSkin(skinId) {
    if (SKINS[skinId]) {
      this.skin = SKINS[skinId];
    }
  }

  setNavTarget(x, y) {
    this.navTarget = { x, y };
  }

  clearNavTarget() {
    this.navTarget = null;
  }

  update(dt, inputDir, isDashRequested) {
    this.squash.update(dt);

    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.pickupCooldown > 0) this.pickupCooldown -= dt;
    if (this.dropCooldown > 0) this.dropCooldown -= dt;
    if (this.coyoteTimeRemaining > 0) this.coyoteTimeRemaining -= dt;

    // Buffer Dash Request (120ms window)
    if (isDashRequested) {
      this.dashInputBuffer = 0.12; // 120ms Coyote/Input Buffer
    } else if (this.dashInputBuffer > 0) {
      this.dashInputBuffer -= dt;
    }

    // Trigger Buffered Dash
    if (this.dashInputBuffer > 0 && this.dashCooldown <= 0) {
      this.isDashing = true;
      this.dashTimer = 0.24;
      this.dashCooldown = 1.0;
      this.dashInputBuffer = 0;
      this.squash.applyStretch(0.35);
    }

    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    }

    const currentSpeed = this.baseSpeed * this.speedMultiplier * (this.isDashing ? 2.15 : 1.0);

    // Combine Keyboard/Joystick input or Mouse Navigation Target
    let moveX = inputDir.x;
    let moveY = inputDir.y;

    if (this.navTarget) {
      const dx = this.navTarget.x - this.x;
      const dy = this.navTarget.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 10) {
        this.navTarget = null;
      } else {
        moveX = dx / dist;
        moveY = dy / dist;
      }
    }

    const len = Math.hypot(moveX, moveY);
    if (len > 0.01) {
      const nx = moveX / len;
      const ny = moveY / len;
      this.vx = nx * currentSpeed;
      this.vy = ny * currentSpeed;
      this.angle = Math.atan2(ny, nx);
    } else {
      // Smooth Damping
      this.vx *= Math.max(0, 1 - 20 * dt);
      this.vy *= Math.max(0, 1 - 20 * dt);
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Update Cape / Coat Cloth Physics
    this.updateCape(dt);
  }

  updateCape(dt) {
    // Lead node attaches behind player's shoulders
    const backAngle = this.angle + Math.PI;
    const anchorX = this.x + Math.cos(backAngle) * 10;
    const anchorY = this.y + Math.sin(backAngle) * 10;
    this.capeNodes[0] = { x: anchorX, y: anchorY };

    // Follower nodes follow with spring drag
    for (let i = 1; i < this.capeNodes.length; i++) {
      const prev = this.capeNodes[i - 1];
      const curr = this.capeNodes[i];
      const dx = prev.x - curr.x;
      const dy = prev.y - curr.y;
      const dist = Math.hypot(dx, dy) || 1;
      const targetDist = 9;

      // Spring towards target segment length
      const factor = (dist - targetDist) * 16 * dt;
      curr.x += (dx / dist) * factor;
      curr.y += (dy / dist) * factor;

      // Add gentle wind flutter when moving
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > 10) {
        const flutter = Math.sin(Date.now() / 80 + i) * 2;
        curr.x += -Math.sin(this.angle) * flutter;
        curr.y += Math.cos(this.angle) * flutter;
      }
    }
  }

  // Coyote Time Trigger: keeps active for 120ms even if just stepped outside zone
  triggerCoyoteInteraction(entity) {
    this.lastInteractedEntity = entity;
    this.coyoteTimeRemaining = 0.12; // 120ms
  }

  isWithinCoyoteWindow(entity) {
    return this.coyoteTimeRemaining > 0 && this.lastInteractedEntity === entity;
  }

  canPickItem() {
    return this.stack.length < this.maxCapacity && this.pickupCooldown <= 0;
  }

  addItem(itemTypeId) {
    if (this.stack.length < this.maxCapacity) {
      this.stack.push(itemTypeId);
      this.pickupCooldown = 0.10; // 100ms fluid transfer
      this.squash.applySquash(0.2);
      return true;
    }
    return false;
  }

  hasItem(itemTypeId) {
    return this.stack.includes(itemTypeId);
  }

  removeItem(itemTypeId) {
    const idx = this.stack.lastIndexOf(itemTypeId);
    if (idx !== -1 && this.dropCooldown <= 0) {
      this.stack.splice(idx, 1);
      this.dropCooldown = 0.10;
      this.squash.applyStretch(0.18);
      return true;
    }
    return false;
  }
}
