// src/game.js
// Master Market Simulation Engine: 360° Movement, Production Conveyors,
// Holographic Shelves, Android Customer Flow, Checkouts & Real-Time Star Progression

import { sound } from './audio.js';
import { ParticleSystem } from './particles.js';
import { JuiceManager } from './juice.js';
import { SaveManager } from './storage.js';
import { SECTORS, ITEM_TYPES } from './levels.js';
import { Player } from './player.js';
import { GameRenderer } from './renderer.js';
import { NanoFabricator, DisplayShelf, CheckoutCounter, Customer, HelperDrone } from './entities.js';

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

  // Cálculo Matemático de Canvas Obrigatório (RULE #6 LEI ANTI-SOBREPOSIÇÃO)
  initResize() {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);

      const isPortrait = h >= w * 1.05;
      const container = document.getElementById('game-container');

      if (isPortrait) {
        if (container) container.classList.add('portrait-mode');
        const hudH = 60, ctrlH = 120;
        const availH = Math.max(160, h - hudH - ctrlH);
        this.scale = Math.min(w / this.vw, availH / this.vh);
        this.offsetX = Math.floor((w - this.vw * this.scale) / 2);
        this.offsetY = Math.floor(hudH + (availH - this.vh * this.scale) / 2);
      } else {
        if (container) container.classList.remove('portrait-mode');
        const scaleX = w / this.vw;
        const scaleY = h / this.vh;
        this.scale = Math.min(scaleX, scaleY);
        this.offsetX = Math.floor((w - this.vw * this.scale) / 2);
        this.offsetY = Math.floor((h - this.vh * this.scale) / 2);
      }

      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
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

    // Suporte Total a Mouse: Click e Drag to Move (Desktop & Tablets)
    let isMouseDown = false;

    const handlePointerMove = (clientX, clientY) => {
      const targetX = (clientX - this.offsetX) / this.scale;
      const targetY = (clientY - this.offsetY) / this.scale;
      if (this.player) {
        this.player.setNavTarget(targetX, targetY);
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        isMouseDown = true;
        handlePointerMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isMouseDown) {
        handlePointerMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    // Toque Direto no Canvas para Mover
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        handlePointerMove(t.clientX, t.clientY);
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        handlePointerMove(t.clientX, t.clientY);
      }
    }, { passive: true });
  }

  setJoystickInput(x, y) {
    this.joystickInput.x = x;
    this.joystickInput.y = y;
    if (this.player && (x !== 0 || y !== 0)) {
      this.player.clearNavTarget();
    }
  }

  requestDash() {
    this.dashRequested = true;
    setTimeout(() => { this.dashRequested = false; }, 100);
  }

  // Load Sector com Reset Incondicional
  loadSector(sectorIndex) {
    this.currentSectorIndex = Math.max(0, Math.min(sectorIndex, SECTORS.length - 1));
    this.sector = SECTORS[this.currentSectorIndex];

    // Reset Incondicional
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
    const savedSkin = SaveManager.get().equippedSkin || 'CYBER_DEFAULT';

    // Instancia Player com Coyote Time e Skin
    this.player = new Player(this.sector.playerStart.x, this.sector.playerStart.y);
    this.player.speedMultiplier = speedMult;
    this.player.maxCapacity = backpackMax;
    this.player.setSkin(savedSkin);

    // Instancia Fabricadores
    this.fabricators = this.sector.fabricators.map(cfg => new NanoFabricator(cfg));

    // Instancia Prateleiras
    this.shelves = this.sector.shelves.map(cfg => new DisplayShelf(cfg));

    // Instancia Caixas
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

  addExtraTime(seconds = 30) {
    this.shiftTimer += seconds;
    this.maxShiftTimer += seconds;
    this.isRoundOver = false;
    this.isPaused = false;
    this.juice.addTrauma(0.3);
    this.juice.spawnFloatingText(this.player.x, this.player.y - 50, `+${seconds}s TURBO!`, '#facc15', 24);
    sound.playUpgrade();
  }

  spawnCustomer() {
    if (this.shelves.length === 0) return;

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

  calculateStars() {
    const targets = this.sector.starTargets;
    let stars = 0;

    // Star 1
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

    // Star 2
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

    // Star 3 (Mastery)
    if (this.customersServed >= targets.star3.customers && this.shiftRevenue >= targets.star3.revenue) {
      stars = 3;
      if (!this.star3Reached) {
        this.star3Reached = true;
        sound.playStarChime(3);
        this.juice.addTrauma(0.5);
        this.juice.spawnFloatingText(this.player.x, this.player.y - 45, '★★★ 3 ESTRELAS! MESTRIA TOTAL!', '#00f5ff', 26);
        this.particles.emitStarBurst(this.player.x, this.player.y, 50);
        this.particles.emitVictoryConfetti(this.vw, this.vh, 80);

        setTimeout(() => {
          this.triggerVictory();
        }, 1200);
      }
    }

    this.currentStars = stars;
  }

  getStarProgressPct() {
    const targets = this.sector.starTargets;
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
        backpackMax: this.player ? this.player.maxCapacity : 4,
        star1Available: this.star1Reached
      });
    }
  }

  triggerVictory() {
    if (this.isRoundOver) return;
    this.isRoundOver = true;
    this.isRunning = false;

    const finalStars = Math.max(1, this.currentStars);
    sound.playVictory();
    this.juice.addTrauma(0.4);
    this.particles.emitVictoryConfetti(this.vw, this.vh, 80);

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

  startLoop() {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (this.isRunning && !this.isPaused && !this.isAdPaused && !this.isRoundOver) {
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
    // 1. Cronômetro do Turno
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

    // 2. Processamento de Entrada
    let inputX = 0;
    let inputY = 0;
    if (this.keys['w'] || this.keys['arrowup']) inputY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) inputY += 1;
    if (this.keys['a'] || this.keys['arrowleft']) inputX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) inputX += 1;

    inputX += this.joystickInput.x;
    inputY += this.joystickInput.y;

    const dash = this.dashRequested;
    this.player.update(dt, { x: inputX, y: inputY }, dash);
    if (this.player.isDashing) {
      this.particles.emitDashTrail(this.player.x, this.player.y, '#00f5ff', 3);
      sound.playDash();
    }

    // Restrição suave de limites da loja
    this.player.x = Math.max(120, Math.min(this.vw - 120, this.player.x));
    this.player.y = Math.max(90, Math.min(this.vh - 90, this.player.y));

    // 3. Atualiza Fabricadores (com tolerância Coyote Time de 120ms)
    const overclockMult = SaveManager.getOverclockMultiplier();
    for (const fab of this.fabricators) {
      const produced = fab.update(dt, overclockMult);
      if (produced) {
        this.particles.emitSparks(fab.x, fab.y, 6, fab.itemType.color);
      }

      const dist = Math.hypot(this.player.x - fab.x, this.player.y - fab.y);
      const inRadius = dist < (fab.interactionRadius + 15);
      if (inRadius) {
        this.player.triggerCoyoteInteraction(fab);
      }
      const canPick = inRadius || this.player.isWithinCoyoteWindow(fab);

      if (canPick && this.player.canPickItem()) {
        const item = fab.dispense();
        if (item) {
          this.player.addItem(item);
          sound.playPickup();
          this.particles.emitSparks(this.player.x, this.player.y - 20, 5, fab.itemType.color);
        }
      }
    }

    // 4. Atualiza Prateleiras (com tolerância Coyote Time de 120ms)
    for (const shelf of this.shelves) {
      shelf.update(dt);

      const dist = Math.hypot(this.player.x - shelf.x, this.player.y - shelf.y);
      const inRadius = dist < (shelf.interactionRadius + 18);
      if (inRadius) {
        this.player.triggerCoyoteInteraction(shelf);
      }
      const canRestock = inRadius || this.player.isWithinCoyoteWindow(shelf);

      if (canRestock && this.player.hasItem(shelf.itemType.id)) {
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

    // 5. Atualiza Drones Ajudantes
    for (const drone of this.helperDrones) {
      drone.update(dt, this.fabricators, this.shelves);
    }

    // 6. Atualiza Caixas Quânticos
    for (const checkout of this.checkouts) {
      const distToPlayer = Math.hypot(this.player.x - checkout.x, this.player.y - checkout.y);
      const isPlayerAttending = (distToPlayer < checkout.serviceRadius + 10);

      const finishedCustomer = checkout.update(dt, isPlayerAttending);
      if (finishedCustomer) {
        const itemType = ITEM_TYPES[finishedCustomer.carriedItem];
        let price = itemType ? itemType.price : 50;
        if (finishedCustomer.type === 'VIP') price = Math.floor(price * 1.8);
        if (finishedCustomer.type === 'CARGO') price = Math.floor(price * 1.5);

        this.shiftRevenue += price;
        this.customersServed++;

        sound.playCashRegister();
        this.juice.addTrauma(0.2);
        this.juice.hitStop(45);
        this.juice.spawnFloatingText(checkout.x, checkout.y - 30, `+$${price}`, '#22c55e', 22);
        this.particles.emitCashBurst(checkout.x, checkout.y, 16);

        const qIdx = checkout.queue.indexOf(finishedCustomer);
        if (qIdx !== -1) checkout.queue.splice(qIdx, 1);
        finishedCustomer.state = 'LEAVING_HAPPY';

        this.calculateStars();
      }
    }

    // 7. Spawning e IA de Clientes
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

  // Master Render Pipeline com Shaders e Sprites de Alto Nível
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    const shake = this.juice.getShakeTransform();
    ctx.translate(shake.x, shake.y);
    if (shake.angle) ctx.rotate(shake.angle);

    // 1. Piso da Loja com Linhas de Navegação e Luzes Guia
    this.renderFloor(ctx);

    // 2. Portas de Entrada e Saída
    this.renderDoors(ctx);

    // 3. Indicador de Destino do Mouse/Toque
    if (this.player && this.player.navTarget) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.player.x, this.player.y);
      ctx.lineTo(this.player.navTarget.x, this.player.navTarget.y);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = '#00f5ff';
      ctx.beginPath();
      ctx.arc(this.player.navTarget.x, this.player.navTarget.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Fabricadores e Esteiras Industriais com Shaders
    for (const fab of this.fabricators) {
      GameRenderer.renderFabricator(ctx, fab);
    }

    // 5. Prateleiras Holográficas com Meniscos Líquidos e Anéis Arcanos
    for (const shelf of this.shelves) {
      GameRenderer.renderShelf(ctx, shelf);
    }

    // 6. Caixas Quânticos
    for (const checkout of this.checkouts) {
      const dist = Math.hypot(this.player.x - checkout.x, this.player.y - checkout.y);
      checkout.render(ctx, dist < checkout.serviceRadius + 10);
    }

    // 7. Androides Clientes com Modelos Detalhados
    for (const cust of this.customers) {
      GameRenderer.renderCustomer(ctx, cust);
    }

    // 8. Drones Ajudantes
    for (const drone of this.helperDrones) {
      drone.render(ctx);
    }

    // 9. Herói com Capa Dinâmica e Viseira Neon
    if (this.player) {
      GameRenderer.renderPlayer(ctx, this.player);
    }

    // 10. Sistema de Partículas
    this.particles.render(ctx);

    // 11. Textos Flutuantes
    this.juice.renderFloatingTexts(ctx);

    ctx.restore();
  }

  renderFloor(ctx) {
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.05)';
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

    // Paredes Neon
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 60, this.vw - 160, this.vh - 120);

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
