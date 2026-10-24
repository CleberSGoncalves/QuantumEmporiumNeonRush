// src/entities.js
// Autonomous Market Simulation Entities: Player, Conveyor Fabricators, Display Shelves,
// Android Customers (AI State Machine), Checkout Counters & Helper Drones

import { ITEM_TYPES } from './levels.js';
import { SquashStretch } from './juice.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.vx = 0;
    this.vy = 0;
    this.baseSpeed = 260;
    this.speedMultiplier = 1.0;
    this.angle = 0;
    this.squash = new SquashStretch();

    // Inventory Stack
    this.stack = []; // array of itemType IDs: ['CHIP', 'CHIP']
    this.maxCapacity = 3;

    // Dash
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;

    // Transfer timers
    this.pickupCooldown = 0;
    this.dropCooldown = 0;
  }

  update(dt, inputDir, isDashRequested) {
    this.squash.update(dt);

    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.pickupCooldown > 0) this.pickupCooldown -= dt;
    if (this.dropCooldown > 0) this.dropCooldown -= dt;

    // Handle Dash
    if (isDashRequested && this.dashCooldown <= 0 && (inputDir.x !== 0 || inputDir.y !== 0)) {
      this.isDashing = true;
      this.dashTimer = 0.22;
      this.dashCooldown = 1.1;
      this.squash.applyStretch(0.35);
    }

    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    }

    const currentSpeed = this.baseSpeed * this.speedMultiplier * (this.isDashing ? 2.1 : 1.0);

    // Movement
    let len = Math.hypot(inputDir.x, inputDir.y);
    if (len > 0.01) {
      const nx = inputDir.x / len;
      const ny = inputDir.y / len;
      this.vx = nx * currentSpeed;
      this.vy = ny * currentSpeed;
      this.angle = Math.atan2(ny, nx);
    } else {
      this.vx *= Math.max(0, 1 - 18 * dt);
      this.vy *= Math.max(0, 1 - 18 * dt);
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  canPickItem() {
    return this.stack.length < this.maxCapacity && this.pickupCooldown <= 0;
  }

  addItem(itemTypeId) {
    if (this.stack.length < this.maxCapacity) {
      this.stack.push(itemTypeId);
      this.pickupCooldown = 0.11; // 110ms rate
      this.squash.applySquash(0.18);
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
      this.dropCooldown = 0.11;
      this.squash.applyStretch(0.16);
      return true;
    }
    return false;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.squash.scaleX, this.squash.scaleY);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 14, 18, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Cyber Exoskeleton Suit Body
    ctx.save();
    ctx.rotate(this.angle);

    // Player Directional Base
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.isDashing ? '#facc15' : '#00f5ff';
    ctx.shadowColor = this.isDashing ? '#facc15' : '#00f5ff';
    ctx.shadowBlur = this.isDashing ? 18 : 10;
    ctx.stroke();

    // Glowing Neon Visor
    ctx.beginPath();
    ctx.arc(6, 0, 7, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = this.isDashing ? '#fef08a' : '#38bdf8';
    ctx.fill();

    // Cyber Shoulders
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, -18, 8, 6);
    ctx.fillRect(-10, 12, 8, 6);

    ctx.restore();

    // Stacked Items floating above player's backpack
    if (this.stack.length > 0) {
      const stackStartX = 0;
      const stackStartY = -26;
      for (let i = 0; i < this.stack.length; i++) {
        const itemType = ITEM_TYPES[this.stack[i]];
        if (!itemType) continue;

        const itemY = stackStartY - i * 11;
        ctx.save();
        ctx.fillStyle = itemType.color;
        ctx.shadowColor = itemType.color;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;

        // Draw mini-nanotech box
        ctx.fillRect(-10, itemY - 5, 20, 10);
        ctx.strokeRect(-10, itemY - 5, 20, 10);
        ctx.restore();
      }

      // Stack count badge
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.stack.length}/${this.maxCapacity}`, 0, stackStartY - this.stack.length * 11 - 6);
    }

    ctx.restore();
  }
}

export class NanoFabricator {
  constructor(config) {
    this.id = config.id;
    this.itemType = ITEM_TYPES[config.itemType] || ITEM_TYPES.CHIP;
    this.x = config.x;
    this.y = config.y;
    this.width = 90;
    this.height = 70;
    this.maxStock = config.maxStock || 8;
    this.currentStock = Math.floor(this.maxStock / 2);
    this.baseInterval = config.interval || 2.2;
    this.productionTimer = 0;
    this.speedMultiplier = 1.0;
    this.squash = new SquashStretch();
    this.interactionRadius = 65;
  }

  update(dt, overclockMultiplier = 1.0) {
    this.squash.update(dt);
    const effectiveInterval = this.baseInterval / (this.speedMultiplier * overclockMultiplier);

    if (this.currentStock < this.maxStock) {
      this.productionTimer += dt;
      if (this.productionTimer >= effectiveInterval) {
        this.productionTimer = 0;
        this.currentStock++;
        this.squash.applySquash(0.18);
        return true; // produced an item
      }
    } else {
      this.productionTimer = 0;
    }
    return false;
  }

  dispense() {
    if (this.currentStock > 0) {
      this.currentStock--;
      this.squash.applyStretch(0.14);
      return this.itemType.id;
    }
    return null;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.squash.scaleX, this.squash.scaleY);

    // Conveyor base platform
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    ctx.strokeStyle = this.itemType.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = this.itemType.color;
    ctx.shadowBlur = 12;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Moving conveyor stripes
    const t = (Date.now() / 1000 * 25) % 16;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-this.width / 2 + 6, -this.height / 2 + 10, this.width - 12, this.height - 20);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    for (let x = -this.width / 2 - 20 + t; x < this.width / 2 + 20; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, -this.height / 2 + 10);
      ctx.lineTo(x + 10, this.height / 2 - 10);
      ctx.stroke();
    }
    ctx.restore();

    // Fabricator core light
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = this.itemType.color;
    ctx.fill();

    // Production progress ring around core
    const progress = this.currentStock >= this.maxStock ? 1.0 : (this.productionTimer / this.baseInterval);
    ctx.beginPath();
    ctx.arc(0, 0, 18, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon & Stock label
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.itemType.name}: ${this.currentStock}/${this.maxStock}`, 0, -this.height / 2 - 8);

    ctx.restore();
  }
}

export class DisplayShelf {
  constructor(config) {
    this.id = config.id;
    this.itemType = ITEM_TYPES[config.itemType] || ITEM_TYPES.CHIP;
    this.x = config.x;
    this.y = config.y;
    this.width = 100;
    this.height = 74;
    this.maxStock = config.maxStock || 10;
    this.currentStock = Math.floor(this.maxStock / 2);
    this.squash = new SquashStretch();
    this.interactionRadius = 75;
  }

  update(dt) {
    this.squash.update(dt);
  }

  stock(itemTypeId) {
    if (itemTypeId === this.itemType.id && this.currentStock < this.maxStock) {
      this.currentStock++;
      this.squash.applySquash(0.2);
      return true;
    }
    return false;
  }

  takeItem() {
    if (this.currentStock > 0) {
      this.currentStock--;
      this.squash.applyStretch(0.18);
      return this.itemType.id;
    }
    return null;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.squash.scaleX, this.squash.scaleY);

    // Shelf base pod
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    ctx.strokeStyle = this.currentStock > 0 ? this.itemType.color : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = this.currentStock > 0 ? this.itemType.color : '#ef4444';
    ctx.shadowBlur = 10;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Glowing holographic pedestal center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(-this.width / 2 + 8, -this.height / 2 + 8, this.width - 16, this.height - 16);

    // Holographic item floating in center
    if (this.currentStock > 0) {
      const floatY = Math.sin(Date.now() / 350) * 4;
      ctx.save();
      ctx.translate(0, floatY);
      ctx.fillStyle = this.itemType.color;
      ctx.shadowColor = this.itemType.color;
      ctx.shadowBlur = 14;
      ctx.fillRect(-14, -10, 28, 20);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-14, -10, 28, 20);
      ctx.restore();
    } else {
      // Empty flashing alert
      const blink = Math.sin(Date.now() / 180) > 0;
      if (blink) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('VAZIO!', 0, 4);
      }
    }

    // Capacity bar on bottom
    const barW = this.width - 20;
    const barH = 5;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-barW / 2, this.height / 2 - 10, barW, barH);
    const fillW = (this.currentStock / this.maxStock) * barW;
    ctx.fillStyle = this.currentStock > 0 ? this.itemType.color : '#ef4444';
    ctx.fillRect(-barW / 2, this.height / 2 - 10, fillW, barH);

    // Title label
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.itemType.name}: ${this.currentStock}/${this.maxStock}`, 0, -this.height / 2 - 8);

    ctx.restore();
  }
}

export class CheckoutCounter {
  constructor(config) {
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.width = 90;
    this.height = 70;
    this.queue = []; // Array of Customers waiting
    this.processingTimer = 0;
    this.serviceRadius = 75;
    this.squash = new SquashStretch();
    this.autoCashierActive = false;
  }

  update(dt, isPlayerAttending) {
    this.squash.update(dt);

    if (this.queue.length > 0) {
      const activeCustomer = this.queue[0];
      if (activeCustomer && activeCustomer.state === 'PAYING') {
        // Cashier speed is faster if player attends, or standard if auto-cashier attends
        const speed = (isPlayerAttending ? 1.5 : (this.autoCashierActive ? 1.0 : 0));
        if (speed > 0) {
          this.processingTimer += dt * speed;
          if (this.processingTimer >= 1.0) { // 1.0 second base transaction
            this.processingTimer = 0;
            this.squash.applySquash(0.22);
            return activeCustomer; // Return finished customer to be processed!
          }
        }
      }
    } else {
      this.processingTimer = 0;
    }
    return null;
  }

  render(ctx, isPlayerAttending) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.squash.scaleX, this.squash.scaleY);

    // Counter table
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Cash Register Terminal
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-16, -14, 32, 28);
    ctx.fillStyle = '#00f5ff';
    ctx.fillRect(-12, -10, 24, 14); // Screen

    // Status indicator
    if (this.autoCashierActive) {
      // Auto-Cashier Hologram Bot
      ctx.save();
      ctx.translate(0, -this.height / 2 - 12);
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    }

    // Transaction progress bar if customer paying
    if (this.queue.length > 0 && this.processingTimer > 0) {
      const barW = this.width - 24;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-barW / 2, this.height / 2 - 8, barW, 4);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-barW / 2, this.height / 2 - 8, barW * Math.min(1.0, this.processingTimer), 4);
    }

    // Title label
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`CAIXA ${this.id.split('_')[1] || ''}`, 0, -this.height / 2 - 8);

    ctx.restore();
  }
}

// Android Customers with AI State Machine
export class Customer {
  constructor(config) {
    this.id = 'cust_' + Math.random().toString(36).substring(2, 9);
    this.x = config.x;
    this.y = config.y;
    this.radius = 16;
    this.type = config.type || 'CIVIC'; // 'CIVIC', 'VIP', 'CARGO', 'DRONE'
    this.desiredItemType = config.desiredItemType || 'CHIP';
    this.quantityNeeded = config.quantityNeeded || 1;
    this.targetShelf = config.targetShelf;
    this.targetCheckout = null;

    // Movement & Speed
    this.speed = (this.type === 'DRONE' ? 140 : this.type === 'VIP' ? 110 : 85);
    this.angle = 0;
    this.squash = new SquashStretch();

    // Patience Timer (Seconds)
    this.maxPatience = (this.type === 'VIP' ? 15 : this.type === 'DRONE' ? 13 : 20);
    this.patience = this.maxPatience;

    // State Machine: 'TO_SHELF', 'WAITING_ITEM', 'TO_CHECKOUT', 'QUEUING', 'PAYING', 'LEAVING_HAPPY', 'LEAVING_ANGRY'
    this.state = 'TO_SHELF';
    this.carriedItem = null;
    this.queueSlot = 0;
  }

  update(dt, checkouts, exitPosition) {
    this.squash.update(dt);

    if (this.state === 'TO_SHELF') {
      if (!this.targetShelf) {
        this.state = 'LEAVING_ANGRY';
        return;
      }
      // Move towards shelf pick spot (slightly in front of shelf)
      const targetX = this.targetShelf.x;
      const targetY = this.targetShelf.y + 45;
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 12) {
        this.state = 'WAITING_ITEM';
      } else {
        const nx = dx / dist;
        const ny = dy / dist;
        this.x += nx * this.speed * dt;
        this.y += ny * this.speed * dt;
        this.angle = Math.atan2(ny, nx);
      }
    } else if (this.state === 'WAITING_ITEM') {
      // Deplete patience
      this.patience -= dt;

      // Check if shelf has item
      if (this.targetShelf && this.targetShelf.currentStock > 0) {
        const item = this.targetShelf.takeItem();
        if (item) {
          this.carriedItem = item;
          this.state = 'TO_CHECKOUT';
          this.squash.applySquash(0.2);

          // Assign shortest checkout queue
          let bestCheckout = checkouts[0];
          for (let ch of checkouts) {
            if (ch.queue.length < bestCheckout.queue.length) {
              bestCheckout = ch;
            }
          }
          this.targetCheckout = bestCheckout;
          if (this.targetCheckout) {
            this.targetCheckout.queue.push(this);
          }
        }
      }

      if (this.patience <= 0) {
        this.state = 'LEAVING_ANGRY';
        this.squash.applyStretch(0.25);
      }
    } else if (this.state === 'TO_CHECKOUT') {
      if (!this.targetCheckout) {
        this.state = 'LEAVING_ANGRY';
        return;
      }
      const myIdx = this.targetCheckout.queue.indexOf(this);
      const queueOffset = Math.max(0, myIdx) * 36;
      const targetX = this.targetCheckout.x - 45 - queueOffset;
      const targetY = this.targetCheckout.y;

      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 12) {
        this.state = (myIdx === 0) ? 'PAYING' : 'QUEUING';
      } else {
        const nx = dx / dist;
        const ny = dy / dist;
        this.x += nx * this.speed * dt;
        this.y += ny * this.speed * dt;
        this.angle = Math.atan2(ny, nx);
      }
    } else if (this.state === 'QUEUING') {
      if (this.targetCheckout) {
        const myIdx = this.targetCheckout.queue.indexOf(this);
        if (myIdx === 0) {
          this.state = 'PAYING';
        } else {
          // Slide forward in queue
          const targetX = this.targetCheckout.x - 45 - myIdx * 36;
          const targetY = this.targetCheckout.y;
          const dx = targetX - this.x;
          const dy = targetY - this.y;
          if (Math.hypot(dx, dy) > 4) {
            this.x += (dx / Math.hypot(dx, dy)) * this.speed * 0.8 * dt;
            this.y += (dy / Math.hypot(dx, dy)) * this.speed * 0.8 * dt;
          }
        }
      }
    } else if (this.state === 'PAYING') {
      // Waiting for checkout processing
    } else if (this.state === 'LEAVING_HAPPY' || this.state === 'LEAVING_ANGRY') {
      const dx = exitPosition.x - this.x;
      const dy = exitPosition.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 20) {
        return true; // Finished leaving market!
      } else {
        const nx = dx / dist;
        const ny = dy / dist;
        this.x += nx * this.speed * 1.3 * dt;
        this.y += ny * this.speed * 1.3 * dt;
        this.angle = Math.atan2(ny, nx);
      }
    }

    return false;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.squash.scaleX, this.squash.scaleY);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 10, 14, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    // Android Body
    ctx.save();
    ctx.rotate(this.angle);

    let bodyColor = '#334155';
    let eyeColor = '#00f5ff';
    if (this.type === 'VIP') {
      bodyColor = '#facc15';
      eyeColor = '#ffffff';
    } else if (this.type === 'CARGO') {
      bodyColor = '#f97316';
      eyeColor = '#38bdf8';
    } else if (this.type === 'DRONE') {
      bodyColor = '#a855f7';
      eyeColor = '#00f5ff';
    }

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Android Visor / Sensor
    ctx.beginPath();
    ctx.arc(6, 0, 5, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = (this.state === 'LEAVING_ANGRY') ? '#ef4444' : eyeColor;
    ctx.fill();

    ctx.restore();

    // Carried item visual
    if (this.carriedItem) {
      const itemInfo = ITEM_TYPES[this.carriedItem];
      if (itemInfo) {
        ctx.fillStyle = itemInfo.color;
        ctx.shadowColor = itemInfo.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-8, -26, 16, 10);
      }
    }

    // Thought bubble when waiting for item
    if (this.state === 'WAITING_ITEM' || this.state === 'TO_SHELF') {
      const itemInfo = ITEM_TYPES[this.desiredItemType];
      if (itemInfo) {
        ctx.save();
        ctx.translate(0, -32);

        // Bubble background
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = itemInfo.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-16, -12, 32, 22, 6);
        ctx.fill();
        ctx.stroke();

        // Mini item icon
        ctx.fillStyle = itemInfo.color;
        ctx.fillRect(-6, -6, 12, 10);
        ctx.restore();
      }
    }

    // Patience Bar (Green -> Yellow -> Red)
    if (this.state === 'WAITING_ITEM') {
      const barW = 28;
      const barH = 4;
      const pct = Math.max(0, this.patience / this.maxPatience);
      const color = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barW / 2, -48, barW, barH);
      ctx.fillStyle = color;
      ctx.fillRect(-barW / 2, -48, barW * pct, barH);
    }

    // VIP Crown Icon
    if (this.type === 'VIP') {
      ctx.fillStyle = '#fde047';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', 0, -28);
    }

    ctx.restore();
  }
}

// Helper Restocker Drone (Automated AI Drone)
export class HelperDrone {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 190;
    this.state = 'IDLE'; // 'IDLE', 'FLYING_TO_FAB', 'FLYING_TO_SHELF'
    this.targetFab = null;
    this.targetShelf = null;
    this.carriedItem = null;
    this.squash = new SquashStretch();
    this.angle = 0;
  }

  update(dt, fabricators, shelves) {
    this.squash.update(dt);

    if (this.state === 'IDLE') {
      // Find a shelf that is depleted or low on stock
      let bestShelf = null;
      let lowestStock = 999;
      for (const shelf of shelves) {
        if (shelf.currentStock < shelf.maxStock * 0.6 && shelf.currentStock < lowestStock) {
          // Check if there is matching fabricator with stock
          const matchingFab = fabricators.find(f => f.itemType.id === shelf.itemType.id && f.currentStock > 0);
          if (matchingFab) {
            bestShelf = shelf;
            lowestStock = shelf.currentStock;
            this.targetFab = matchingFab;
            this.targetShelf = shelf;
          }
        }
      }

      if (bestShelf && this.targetFab) {
        this.state = 'FLYING_TO_FAB';
      }
    } else if (this.state === 'FLYING_TO_FAB') {
      if (!this.targetFab || this.targetFab.currentStock <= 0) {
        this.state = 'IDLE';
        return;
      }
      const dx = this.targetFab.x - this.x;
      const dy = this.targetFab.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 14) {
        const item = this.targetFab.dispense();
        if (item) {
          this.carriedItem = item;
          this.state = 'FLYING_TO_SHELF';
          this.squash.applySquash(0.25);
        } else {
          this.state = 'IDLE';
        }
      } else {
        const nx = dx / dist;
        const ny = dy / dist;
        this.x += nx * this.speed * dt;
        this.y += ny * this.speed * dt;
        this.angle = Math.atan2(ny, nx);
      }
    } else if (this.state === 'FLYING_TO_SHELF') {
      if (!this.targetShelf) {
        this.state = 'IDLE';
        return;
      }
      const dx = this.targetShelf.x - this.x;
      const dy = this.targetShelf.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 14) {
        if (this.carriedItem) {
          this.targetShelf.stock(this.carriedItem);
          this.carriedItem = null;
          this.squash.applyStretch(0.2);
        }
        this.state = 'IDLE';
      } else {
        const nx = dx / dist;
        const ny = dy / dist;
        this.x += nx * this.speed * dt;
        this.y += ny * this.speed * dt;
        this.angle = Math.atan2(ny, nx);
      }
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.squash.scaleX, this.squash.scaleY);

    // Drone Shadow
    ctx.beginPath();
    ctx.ellipse(0, 16, 12, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Hover floating offset
    const floatY = Math.sin(Date.now() / 200) * 3;
    ctx.translate(0, floatY);

    // Quad-copter arms & Thrusters
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -14);
    ctx.lineTo(14, 14);
    ctx.moveTo(-14, 14);
    ctx.lineTo(14, -14);
    ctx.stroke();

    // Central Sphere Body
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.strokeStyle = '#00f5ff';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Carried Item Hanging Below
    if (this.carriedItem) {
      const itemInfo = ITEM_TYPES[this.carriedItem];
      if (itemInfo) {
        ctx.fillStyle = itemInfo.color;
        ctx.shadowColor = itemInfo.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-6, 12, 12, 8);
      }
    }

    ctx.restore();
  }
}
