// src/game.js
// Master Market Simulation Engine: 360° Movement, Production Conveyors,
// Holographic Shelves, Android Customer Flow, Checkouts & Real-Time Star Progression

import { sound } from './audio.js';
import { ParticleSystem } from './particles.js';
import { JuiceManager } from './juice.js';
import { SaveManager } from './storage.js';
import { SECTORS, ITEM_TYPES } from './levels.js';
import { Player, NanoFabricator, DisplayShelf, CheckoutCounter, Customer, HelperDrone } from './entities.js';

export class QuantumEmporiumGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = new ParticleSystem();
    this.juice = new JuiceManager();

    // Virtual Resolution
    this.vw = 1280;
    this.vh = 720;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    // Game States
    this.isRunning = false;
    this.isPaused = false;
    this.isAdPaused = false;
    this.isRoundOver = false;

    // Sector & Shift Configuration
    this.currentSectorIndex = 0;
    this.sector = SECTORS[0];
    this.shiftTimer = this.sector.shiftTime;
    this.maxShiftTimer = this.sector.shiftTime;

    // Shift Stats
    this.shiftRevenue = 0;
    this.customersServed = 0;
    this.customersLost = 0;
    this.currentStars = 0;
    this.star1Reached = false;
    this.star2Reached = false;
    this.star3Reached = false;

    // Market Layout & Entities
    this.player = null;
    this.fabricators = [];
    this.shelves = [];
    this.checkouts = [];
    this.customers = [];
    this.helperDrones = [];
    this.spawnTimer = 0;

    // Inputs
    this.keys = {};
    this.joystickInput = { x: 0, y: 0 };
    this.dashRequested = false;

    // Entrance and Exit doors
    this.entrance = { x: 100, y: 360 };
    this.exit = { x: 1180, y: 360 };

    // Callbacks for UI
    this.onProgressUpdate = null;
    this.onStar1Available = null;
    this.onVictoryCallback = null;
    this.onDefeatCallback = null;
    this.onFloatingCash = null;

    this.initResize();
    this.initInputs();
    this.loadSector(0);
    this.startLoop();
  }

  initResize() {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);

      // Uniform aspect ratio scale
      const scaleX = w / this.vw;
      const scaleY = h / this.vh;
      this.scale = Math.min(scaleX, scaleY);
      this.offsetX = Math.floor((w - this.vw * this.scale) / 2);
      this.offsetY = Math.floor((h - this.vh * this.scale) / 2);

      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
  }

  initInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'Shift') {
        this.dashRequested = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      if (e.key === ' ' || e.key === 'Shift') {
        this.dashRequested = false;
      }
    });
  }

  setJoystickInput(x, y) {
    this.joystickInput.x = x;
    this.joystickInput.y = y;
  }

  requestDash() {
    this.dashRequested = true;
    setTimeout(() => { this.dashRequested = false; }, 100);
  }

  // Load Sector with Unconditional Reset
  loadSector(sectorIndex) {
    this.currentSectorIndex = Math.max(0, Math.min(sectorIndex, SECTORS.length - 1));
    this.sector = SECTORS[this.currentSectorIndex];

    // Unconditional Reset
    this.isRoundOver = false;
    this.isPaused = false;
    this.isAdPaused = false;
    this.shiftTimer = this.sector.shiftTime;
    this.maxShiftTimer = this.sector.shiftTime;
    this.shiftRevenue = 0;
    this.customersServed = 0;
    this.customersLost = 0;
    this.currentStars = 0;
    this.star1Reached = false;
    this.star2Reached = false;
    this.star3Reached = false;
    this.spawnTimer = 0;

    // Upgrades
    const speedMult = SaveManager.getPlayerSpeedMultiplier();
    const backpackMax = SaveManager.getBackpackMax();
    const droneLvl = SaveManager.getUpgradeLevel('helperDrone');
    const autoCashierLvl = SaveManager.getUpgradeLevel('autoCashier');

    // Instantiate Player
    this.player = new Player(this.sector.playerStart.x, this.sector.playerStart.y);
    this.player.speedMultiplier = speedMult;
    this.player.maxCapacity = backpackMax;

    // Instantiate Fabricators
    this.fabricators = this.sector.fabricators.map(cfg => new NanoFabricator(cfg));

    // Instantiate Shelves
    this.shelves = this.sector.shelves.map(cfg => new DisplayShelf(cfg));

    // Instantiate Checkouts
    this.checkouts = this.sector.checkouts.map(cfg => {
      const ch = new CheckoutCounter(cfg);
      ch.autoCashierActive = (autoCashierLvl > 0);
      return ch;
    });

    // Helper Drones
    this.helperDrones = [];
    for (let i = 0; i < droneLvl; i++) {
      this.helperDrones.push(new HelperDrone(this.sector.playerStart.x + (i - 1) * 40, this.sector.playerStart.y - 60));
    }

    this.customers = [];
    this.particles.clear();

    console.log(`[QuantumEmporium] Loaded ${this.sector.name}`);
    if (this.onProgressUpdate) {
      this.emitProgressUpdate();
    }
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.isRoundOver = false;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  // Add 30 seconds extra time (Rewarded Ad reward)
  addExtraTime(seconds = 30) {
    this.shiftTimer += seconds;
    this.maxShiftTimer += seconds;
    this.isRoundOver = false;
    this.isPaused = false;
    this.juice.addTrauma(0.3);
    this.juice.spawnFloatingText(this.player.x, this.player.y - 50, `+${seconds}s TURBO!`, '#facc15', 24);
    sound.playUpgrade();
  }

  // Spawn customer wave
  spawnCustomer() {
    if (this.shelves.length === 0) return;

    // Pick random shelf to target
    const randomShelf = this.shelves[Math.floor(Math.random() * this.shelves.length)];
    const types = ['CIVIC', 'CIVIC', 'CIVIC', 'VIP', 'CARGO', 'DRONE'];
    const selectedType = types[Math.floor(Math.random() * types.length)];

    const customer = new Customer({
      x: this.entrance.x,
      y: this.entrance.y + (Math.random() - 0.5) * 60,
      type: selectedType,
      desiredItemType: randomShelf.itemType.id,
      targetShelf: randomShelf
    });

    this.customers.push(customer);
  }

  // Calculate 1..3 Stars Progression
  calculateStars() {
    const targets = this.sector.starTargets;
    let stars = 0;

    // Check Star 1
    if (this.customersServed >= targets.star1.customers && this.shiftRevenue >= targets.star1.revenue) {
      stars = 1;
      if (!this.star1Reached) {
        this.star1Reached = true;
        sound.playStarChime(1);
        this.juice.addTrauma(0.25);
        this.juice.spawnFloatingText(this.player.x, this.player.y - 45, '★ 1 ESTRELA! META ALCANÇADA!', '#facc15', 20);
        this.particles.emitStarBurst(this.player.x, this.player.y, 25);
        if (this.onStar1Available) this.onStar1Available();
      }
    }

    // Check Star 2
    if (this.customersServed >= targets.star2.customers && this.shiftRevenue >= targets.star2.revenue) {
      stars = 2;
      if (!this.star2Reached) {
        this.star2Reached = true;
        sound.playStarChime(2);
        this.juice.addTrauma(0.35);
        this.juice.spawnFloatingText(this.player.x, this.player.y - 45, '★★ 2 ESTRELAS! TURNO DE OURO!', '#38bdf8', 22);
        this.particles.emitStarBurst(this.player.x, this.player.y, 35);
      }
    }

    // Check Star 3 (Mastery)
    if (this.customersServed >= targets.star3.customers && this.shiftRevenue >= targets.star3.revenue) {
      stars = 3;
      if (!this.star3Reached) {
        this.star3Reached = true;
        sound.playStarChime(3);
        this.juice.addTrauma(0.5);
        this.juice.spawnFloatingText(this.player.x, this.player.y - 45, '★★★ 3 ESTRELAS! MESTRIA TOTAL!', '#00f5ff', 26);
        this.particles.emitStarBurst(this.player.x, this.player.y, 50);
        this.particles.emitVictoryConfetti(this.vw, this.vh, 80);

        // Immediate Maximum Victory trigger
        setTimeout(() => {
          this.triggerVictory();
        }, 1200);
      }
    }

    this.currentStars = stars;
  }

  getStarProgressPct() {
    const targets = this.sector.starTargets;
    // Composite score based on customer count and revenue
    const custRatio = this.customersServed / targets.star3.customers;
    const revRatio = this.shiftRevenue / targets.star3.revenue;
    const composite = (custRatio * 0.5 + revRatio * 0.5);
    return Math.min(100, Math.floor(composite * 100));
  }

  emitProgressUpdate() {
    if (this.onProgressUpdate) {
      this.onProgressUpdate({
        timer: Math.max(0, Math.ceil(this.shiftTimer)),
        stars: this.currentStars,
        progressPct: this.getStarProgressPct(),
        revenue: this.shiftRevenue,
        customersServed: this.customersServed,
        backpackCount: this.player ? this.player.stack.length : 0,
        backpackMax: this.player ? this.player.maxCapacity : 3,
        star1Available: this.star1Reached
      });
    }
  }

  // Trigger Victory (either by claiming button, 3★ or timer expiration with >=1★)
  triggerVictory() {
    if (this.isRoundOver) return;
    this.isRoundOver = true;
    this.isRunning = false;

    // Minimum 1 star if completed
    const finalStars = Math.max(1, this.currentStars);
    sound.playVictory();
    this.juice.addTrauma(0.4);
    this.particles.emitVictoryConfetti(this.vw, this.vh, 80);

    // Save progress
    SaveManager.addCredits(this.shiftRevenue);
    SaveManager.recordSectorCompletion(this.sector.id, finalStars, this.shiftRevenue, this.customersServed);

    if (this.onVictoryCallback) {
      this.onVictoryCallback({
        sector: this.sector,
        stars: finalStars,
        revenue: this.shiftRevenue,
        customersServed: this.customersServed
      });
    }
  }

  // Trigger Defeat (shift ended with 0 stars)
  triggerDefeat() {
    if (this.isRoundOver) return;
    this.isRoundOver = true;
    this.isRunning = false;

    sound.playAngryClient();
    this.juice.addTrauma(0.4);

    if (this.onDefeatCallback) {
      this.onDefeatCallback({
        sector: this.sector,
        customersServed: this.customersServed,
        revenue: this.shiftRevenue
      });
    }
  }

  // Core Fixed Timestep Physics & Game Loop
  startLoop() {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (this.isRunning && !this.isPaused && !this.isAdPaused && !this.isRoundOver) {
        // Hit-stop pause handling
        const isHitStop = this.juice.update(dt);
        if (!isHitStop) {
          this.update(dt);
        }
      } else {
        this.juice.update(dt);
      }

      this.particles.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  update(dt) {
    // 1. Shift Timer Countdown
    this.shiftTimer -= dt;
    if (this.shiftTimer <= 0) {
      this.shiftTimer = 0;
      if (this.currentStars >= 1) {
        this.triggerVictory();
      } else {
        this.triggerDefeat();
      }
      return;
    }

    // 2. Input Processing
    let inputX = 0;
    let inputY = 0;
    if (this.keys['w'] || this.keys['arrowup']) inputY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) inputY += 1;
    if (this.keys['a'] || this.keys['arrowleft']) inputX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) inputX += 1;

    // Combine with virtual joystick
    inputX += this.joystickInput.x;
    inputY += this.joystickInput.y;

    // Update Player
    const dash = this.dashRequested;
    this.player.update(dt, { x: inputX, y: inputY }, dash);
    if (this.player.isDashing) {
      this.particles.emitDashTrail(this.player.x, this.player.y, '#00f5ff', 2);
      sound.playDash();
    }

    // Boundary constraints
    this.player.x = Math.max(120, Math.min(this.vw - 120, this.player.x));
    this.player.y = Math.max(90, Math.min(this.vh - 90, this.player.y));

    // 3. Update Nano-Fabricators (Conveyor Belts)
    const overclockMult = SaveManager.getOverclockMultiplier();
    for (const fab of this.fabricators) {
      const produced = fab.update(dt, overclockMult);
      if (produced) {
        this.particles.emitSparks(fab.x, fab.y, 6, fab.itemType.color);
      }

      // Check player interaction with fabricator
      const dist = Math.hypot(this.player.x - fab.x, this.player.y - fab.y);
      if (dist < fab.interactionRadius && this.player.canPickItem()) {
        const item = fab.dispense();
        if (item) {
          this.player.addItem(item);
          sound.playPickup();
          this.particles.emitSparks(this.player.x, this.player.y - 20, 5, fab.itemType.color);
        }
      }
    }

    // 4. Update Display Shelves
    for (const shelf of this.shelves) {
      shelf.update(dt);

      // Check player interaction with shelf (unloading items)
      const dist = Math.hypot(this.player.x - shelf.x, this.player.y - shelf.y);
      if (dist < shelf.interactionRadius && this.player.hasItem(shelf.itemType.id)) {
        if (shelf.currentStock < shelf.maxStock) {
          const removed = this.player.removeItem(shelf.itemType.id);
          if (removed) {
            shelf.stock(shelf.itemType.id);
            sound.playRestock();
            this.particles.emitDeliveryFlow(this.player.x, this.player.y, shelf.x, shelf.y, shelf.itemType.color, 4);
          }
        }
      }
    }

    // 5. Update Helper Drones
    for (const drone of this.helperDrones) {
      drone.update(dt, this.fabricators, this.shelves);
    }

    // 6. Update Checkout Counters
    for (const checkout of this.checkouts) {
      const distToPlayer = Math.hypot(this.player.x - checkout.x, this.player.y - checkout.y);
      const isPlayerAttending = (distToPlayer < checkout.serviceRadius);

      const finishedCustomer = checkout.update(dt, isPlayerAttending);
      if (finishedCustomer) {
        // Customer completed transaction!
        const itemType = ITEM_TYPES[finishedCustomer.carriedItem];
        let price = itemType ? itemType.price : 50;
        if (finishedCustomer.type === 'VIP') price = Math.floor(price * 1.8);
        if (finishedCustomer.type === 'CARGO') price = Math.floor(price * 1.5);

        this.shiftRevenue += price;
        this.customersServed++;

        // Effects
        sound.playCashRegister();
        this.juice.addTrauma(0.2);
        this.juice.hitStop(45);
        this.juice.spawnFloatingText(checkout.x, checkout.y - 30, `+$${price}`, '#22c55e', 22);
        this.particles.emitCashBurst(checkout.x, checkout.y, 16);

        // Remove from queue and mark leaving happy
        const qIdx = checkout.queue.indexOf(finishedCustomer);
        if (qIdx !== -1) checkout.queue.splice(qIdx, 1);
        finishedCustomer.state = 'LEAVING_HAPPY';

        this.calculateStars();
      }
    }

    // 7. Update Customers AI & Spawning
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.sector.customerSpawnInterval) {
      this.spawnTimer = 0;
      if (this.customers.length < 16) {
        this.spawnCustomer();
      }
    }

    for (let i = this.customers.length - 1; i >= 0; i--) {
      const cust = this.customers[i];
      const finished = cust.update(dt, this.checkouts, this.exit);

      if (cust.state === 'LEAVING_ANGRY' && !cust.hasAlerted) {
        cust.hasAlerted = true;
        this.customersLost++;
        sound.playAngryClient();
        this.juice.spawnFloatingText(cust.x, cust.y - 35, 'IMPATIENTE! ✖', '#ef4444', 16);
      }

      if (finished) {
        // Clean up from checkout if applicable
        if (cust.targetCheckout) {
          const qIdx = cust.targetCheckout.queue.indexOf(cust);
          if (qIdx !== -1) cust.targetCheckout.queue.splice(qIdx, 1);
        }
        this.customers.splice(i, 1);
      }
    }

    this.calculateStars();
    this.emitProgressUpdate();
  }

  // Master Render Pipeline
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    // Clear background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Apply viewport scale & centering + Trauma² screen shake
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    const shake = this.juice.getShakeTransform();
    ctx.translate(shake.x, shake.y);
    if (shake.angle) ctx.rotate(shake.angle);

    // 1. Cyberpunk Market Floor Grid
    this.renderFloor(ctx);

    // 2. Entrance & Exit Zones
    this.renderDoors(ctx);

    // 3. Fabricators & Conveyor Belts
    for (const fab of this.fabricators) {
      fab.render(ctx);
    }

    // 4. Display Shelves
    for (const shelf of this.shelves) {
      shelf.render(ctx);
    }

    // 5. Checkout Counters
    for (const checkout of this.checkouts) {
      const dist = Math.hypot(this.player.x - checkout.x, this.player.y - checkout.y);
      checkout.render(ctx, dist < checkout.serviceRadius);
    }

    // 6. Customers
    for (const cust of this.customers) {
      cust.render(ctx);
    }

    // 7. Helper Drones
    for (const drone of this.helperDrones) {
      drone.render(ctx);
    }

    // 8. Player
    if (this.player) {
      this.player.render(ctx);
    }

    // 9. Particle System
    this.particles.render(ctx);

    // 10. Floating Feedback Numbers & Texts
    this.juice.renderFloatingTexts(ctx);

    ctx.restore();
  }

  renderFloor(ctx) {
    // Cyberpunk Market Tiles
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.06)';
    ctx.lineWidth = 1;
    const tileSize = 60;

    for (let x = 80; x <= this.vw - 80; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 60);
      ctx.lineTo(x, this.vh - 60);
      ctx.stroke();
    }

    for (let y = 60; y <= this.vh - 60; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(this.vw - 80, y);
      ctx.stroke();
    }

    // Market outer boundary neon wall
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 60, this.vw - 160, this.vh - 120);

    // Glowing corner brackets
    const corners = [
      [80, 60],
      [this.vw - 80, 60],
      [80, this.vh - 60],
      [this.vw - 80, this.vh - 60]
    ];
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 4;
    for (let [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  renderDoors(ctx) {
    // Entrance Door (Left)
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 12;
    ctx.fillRect(72, this.entrance.y - 35, 12, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 10px Orbitron, sans-serif';
    ctx.save();
    ctx.translate(64, this.entrance.y);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('ENTRADA', 0, 0);
    ctx.restore();

    // Exit Door (Right)
    ctx.fillStyle = '#0284c7';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 12;
    ctx.fillRect(this.vw - 84, this.exit.y - 35, 12, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 10px Orbitron, sans-serif';
    ctx.save();
    ctx.translate(this.vw - 64, this.exit.y);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('SAÍDA', 0, 0);
    ctx.restore();
  }
}
