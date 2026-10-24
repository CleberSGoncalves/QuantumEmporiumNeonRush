// src/main.js
// Application Coordinator: FluidCleb Splash (0.0s to 2.8s), Land in Gameplay,
// Anti-Softlock ModalController, CrazyGames SDK v3 Hooks & Localization

import { sound } from './audio.js';
import { crazygames } from './crazygames.js';
import { SaveManager } from './storage.js';
import { SECTORS } from './levels.js';
import { QuantumEmporiumGame } from './game.js';

// Safe DOM Helper (Anti-Black-Screen)
function safeSetText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(val);
}

// Localization Dictionary
const I18N = {
  pt: {
    sector: 'SETOR',
    shift: 'TURNO',
    timer: 'TEMPO',
    revenue: 'LUCRO',
    customers: 'ANDROIDES ATENDIDOS',
    claimBtn: '✅ CONCLUIR FASE (★) ➔',
    meta: 'META',
    upgrades: '⚡ UPGRADES',
    sectors: '☰ SETORES',
    doubleCredits: '🎁 DOBRAR CRÉDITOS (2X) [CrazyGames Ad]',
    extraTime: '⚡ +30s TURBO RUSH [CrazyGames Ad]',
    retry: 'TENTAR NOVAMENTE',
    nextSector: 'PRÓXIMO SETOR ➔',
    claimDaily: 'RESGATAR RECOMPENSA',
    spinWheel: 'GIRAR ROLETA GRÁTIS',
    dailyClaimed: 'RESGATADO',
    speedUpgrade: 'Velocidade do Gerente',
    speedDesc: 'Movimente-se 15% mais rápido pela loja',
    backpackUpgrade: 'Capacidade da Mochila',
    backpackDesc: 'Carregue mais nanopeças ao mesmo tempo',
    droneUpgrade: 'Drone Entregador',
    droneDesc: 'Abastece prateleiras automaticamente',
    cashierUpgrade: 'Caixa Automático',
    cashierDesc: 'Atende androides no caixa autonomamente',
    overclockUpgrade: 'Overclock das Esteiras',
    overclockDesc: 'Produz peças 25% mais rápido',
    level: 'Nível',
    maxLevel: 'NÍVEL MÁXIMO',
    cost: 'Custo: $'
  },
  en: {
    sector: 'SECTOR',
    shift: 'SHIFT',
    timer: 'TIME',
    revenue: 'REVENUE',
    customers: 'CUSTOMERS SERVED',
    claimBtn: '✅ CLAIM VICTORY (★) ➔',
    meta: 'TARGET',
    upgrades: '⚡ UPGRADES',
    sectors: '☰ SECTORS',
    doubleCredits: '🎁 DOUBLE CREDITS (2X) [CrazyGames Ad]',
    extraTime: '⚡ +30s TURBO RUSH [CrazyGames Ad]',
    retry: 'RETRY SHIFT',
    nextSector: 'NEXT SECTOR ➔',
    claimDaily: 'CLAIM REWARD',
    spinWheel: 'SPIN WHEEL FOR FREE',
    dailyClaimed: 'CLAIMED',
    speedUpgrade: 'Manager Speed',
    speedDesc: 'Move 15% faster across the shop floor',
    backpackUpgrade: 'Backpack Capacity',
    backpackDesc: 'Carry more nano-items in stack',
    droneUpgrade: 'Helper Drone',
    droneDesc: 'Restocks shelves autonomously',
    cashierUpgrade: 'Auto-Cashier Bot',
    cashierDesc: 'Processes customers automatically',
    overclockUpgrade: 'Belt Overclock',
    overclockDesc: 'Conveyors produce 25% faster',
    level: 'Level',
    maxLevel: 'MAX LEVEL',
    cost: 'Cost: $'
  }
};

async function bootApp() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  // Initialize CrazyGames SDK v3
  await crazygames.init();

  // Language Detection (English default for CrazyGames, or PT-BR if user locale is Portuguese)
  let currentLang = 'en';
  try {
    const userLocale = navigator.language || navigator.userLanguage || '';
    if (userLocale.toLowerCase().startsWith('pt')) {
      currentLang = 'pt';
    }
  } catch (e) {}

  // Centralized ModalController State Machine (Anti-Softlock)
  class ModalController {
    constructor(gameInstance) {
      this.game = gameInstance;
      this.activeModal = null;
      this.modals = {
        lore: document.getElementById('lore-overlay'),
        sectors: document.getElementById('modal-level-select'),
        upgrades: document.getElementById('modal-upgrades'),
        victory: document.getElementById('modal-victory'),
        defeat: document.getElementById('modal-defeat'),
        daily: document.getElementById('modal-daily'),
        wheel: document.getElementById('modal-wheel')
      };
    }

    open(name) {
      this.closeAll();
      const modal = this.modals[name];
      if (modal) {
        modal.classList.remove('hidden');
        this.activeModal = name;
        if (this.game) {
          this.game.pause();
          crazygames.gameplayStop();
        }
      }
    }

    close(name) {
      const modal = this.modals[name];
      if (modal) {
        modal.classList.add('hidden');
      }
      if (this.activeModal === name) {
        this.activeModal = null;
        // Resume game safely if no other modal is open and round is not over
        if (this.game && !this.game.isRoundOver) {
          this.game.resume();
          crazygames.gameplayStart();
        }
      }
    }

    closeAll() {
      Object.values(this.modals).forEach(m => {
        if (m) m.classList.add('hidden');
      });
      this.activeModal = null;
    }
  }

  // Instantiate Game
  const game = new QuantumEmporiumGame(canvas);
  const modalController = new ModalController(game);

  // Intro FluidCleb Interactive (0.0s to 2.8s)
  function runFluidClebIntro() {
    const splash = document.getElementById('fluidcleb-splash');
    const splashCanvas = document.getElementById('fluidcleb-canvas');
    if (!splash || !splashCanvas) {
      showLoreOrStart();
      return;
    }

    const sctx = splashCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = splashCanvas.width = window.innerWidth * dpr;
    const h = splashCanvas.height = window.innerHeight * dpr;
    sctx.scale(dpr, dpr);

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Cosmic Orbs
    const orbs = [];
    for (let i = 0; i < 24; i++) {
      orbs.push({
        x: Math.random() * vw,
        y: vh + Math.random() * 80,
        vx: (Math.random() - 0.5) * 40,
        vy: -140 - Math.random() * 200,
        size: 3 + Math.random() * 6,
        alpha: 0.8 + Math.random() * 0.2,
        color: i % 2 === 0 ? '#00f5ff' : '#38bdf8'
      });
    }

    sound.playFluidClebIntro();
    const startTime = performance.now();
    let introFinished = false;

    const endIntro = () => {
      if (introFinished) return;
      introFinished = true;
      splash.style.opacity = '0';
      setTimeout(() => {
        try { splash.remove(); } catch(e) {}
        showLoreOrStart();
      }, 150);
    };

    // User can click or tap anywhere on splash to skip immediately
    splash.addEventListener('click', endIntro);
    splash.addEventListener('touchstart', endIntro, { passive: true });

    // Failsafe timer (guarantees completion at 2.8s regardless of rAF frame rate)
    setTimeout(endIntro, 2800);

    function renderIntro(now) {
      if (introFinished) return;
      const elapsed = (now - startTime) / 1000;
      sctx.fillStyle = '#030712';
      sctx.fillRect(0, 0, vw, vh);

      // Draw and update orbs
      for (const orb of orbs) {
        orb.x += orb.vx * 0.016;
        orb.y += orb.vy * 0.016;
        sctx.save();
        sctx.globalAlpha = Math.max(0, orb.alpha * (1 - elapsed / 2.8));
        sctx.fillStyle = orb.color;
        sctx.shadowColor = orb.color;
        sctx.shadowBlur = 12;
        sctx.beginPath();
        sctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
        sctx.fill();
        sctx.restore();
      }

      // Central Emblem & Neon Text (0.4s onward)
      if (elapsed > 0.3) {
        const fadeIn = Math.min(1.0, (elapsed - 0.3) / 0.7);
        sctx.save();
        sctx.globalAlpha = fadeIn;
        sctx.translate(vw / 2, vh / 2);

        // Water droplet metallic shape
        sctx.fillStyle = '#94a3b8';
        sctx.shadowColor = '#00f5ff';
        sctx.shadowBlur = 24;
        sctx.beginPath();
        sctx.arc(0, -10, 24, 0, Math.PI);
        sctx.lineTo(0, -50);
        sctx.closePath();
        sctx.fill();

        // Neon Logo Text
        sctx.font = '900 36px "Orbitron", sans-serif';
        sctx.textAlign = 'center';
        sctx.fillStyle = '#00f5ff';
        sctx.shadowColor = '#00f5ff';
        sctx.shadowBlur = 20;
        sctx.fillText('FLUIDCLEB', 0, 48);

        sctx.font = '700 13px "Rajdhani", sans-serif';
        sctx.letterSpacing = '5px';
        sctx.fillStyle = '#94a3b8';
        sctx.shadowBlur = 0;
        sctx.fillText('INTERACTIVE', 0, 72);

        // Progress line
        const barW = 200;
        const p = Math.min(1.0, elapsed / 2.6);
        sctx.fillStyle = 'rgba(255,255,255,0.15)';
        sctx.fillRect(-barW / 2, 92, barW, 3);
        sctx.fillStyle = '#00f5ff';
        sctx.fillRect(-barW / 2, 92, barW * p, 3);

        sctx.restore();
      }

      if (elapsed < 2.7) {
        requestAnimationFrame(renderIntro);
      } else {
        endIntro();
      }
    }

    requestAnimationFrame(renderIntro);
  }

  // Land in Gameplay <= 1 click
  function showLoreOrStart() {
    modalController.open('lore');
  }

  function enterActiveGameplay() {
    sound.init();
    sound.startBgm();
    modalController.close('lore');
    game.start();
    crazygames.gameplayStart();
  }

  // Lore Overlay Buttons
  const btnLoreSkip = document.getElementById('btn-lore-skip');
  const btnLoreStart = document.getElementById('btn-lore-start');
  if (btnLoreSkip) btnLoreSkip.addEventListener('click', () => { sound.playClick(); enterActiveGameplay(); });
  if (btnLoreStart) btnLoreStart.addEventListener('click', () => { sound.playClick(); enterActiveGameplay(); });

  // Claim 1★ Button on HUD
  const btnClaimVictory = document.getElementById('btn-claim-victory');
  if (btnClaimVictory) {
    btnClaimVictory.addEventListener('click', () => {
      sound.playClick();
      game.triggerVictory();
    });
  }

  // Update Texts with Active Language
  function updateLocalization() {
    const t = I18N[currentLang] || I18N.en;
    safeSetText('btn-lang-toggle', currentLang === 'pt' ? '🌐 PT' : '🌐 EN');
    safeSetText('btn-open-upgrades', t.upgrades);
    safeSetText('btn-open-menu', t.sectors);
    safeSetText('btn-claim-victory', t.claimBtn);
    safeSetText('btn-vic-double-ad', t.doubleCredits);
    safeSetText('btn-def-extra-time', t.extraTime);
    safeSetText('btn-def-restart', t.retry);
    safeSetText('btn-vic-next', t.nextSector);
    safeSetText('btn-claim-daily', t.claimDaily);
    safeSetText('btn-spin-wheel', t.spinWheel);

    // Update sector title and objectives
    if (game && game.sector) {
      const secName = currentLang === 'pt' ? game.sector.namePt : game.sector.name;
      safeSetText('hud-sector-title', secName);
      const target = game.sector.starTargets.star1;
      safeSetText('hud-objective-text', `🎯 ${t.meta}: ${target.customers} ${currentLang === 'pt' ? 'Androides' : 'Androids'} & $${target.revenue}`);
    }
  }

  // Language Toggle Button
  const btnLang = document.getElementById('btn-lang-toggle');
  if (btnLang) {
    btnLang.addEventListener('click', () => {
      sound.playClick();
      currentLang = currentLang === 'pt' ? 'en' : 'pt';
      updateLocalization();
      renderSectorsGrid();
      renderUpgradesGrid();
    });
  }

  // Sound Toggle Button
  const btnSound = document.getElementById('btn-sound-toggle');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      sound.init();
      sound.setMuted(!sound.isMuted);
      btnSound.textContent = sound.isMuted ? '🔇' : '🔊';
    });
  }

  // HUD Progress Callback
  game.onProgressUpdate = ({ timer, stars, progressPct, revenue, customersServed, backpackCount, backpackMax, star1Available }) => {
    // Timer
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    safeSetText('hud-timer-val', `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);

    // Credits & Backpack
    safeSetText('hud-credits-val', `$${SaveManager.getCredits()}`);
    safeSetText('hud-backpack-val', `${backpackCount}/${backpackMax}`);

    // Progress Bar & Pins
    const fill = document.getElementById('hud-progress-fill');
    if (fill) fill.style.width = `${progressPct}%`;
    safeSetText('hud-progress-text', `${progressPct}%`);

    const p1 = document.getElementById('star-pin-1');
    const p2 = document.getElementById('star-pin-2');
    const p3 = document.getElementById('star-pin-3');
    if (p1) p1.classList.toggle('active', stars >= 1);
    if (p2) p2.classList.toggle('active', stars >= 2);
    if (p3) p3.classList.toggle('active', stars >= 3);

    // Claim Victory Button
    if (btnClaimVictory) {
      if (star1Available && !game.isRoundOver) {
        btnClaimVictory.classList.remove('hidden');
      } else {
        btnClaimVictory.classList.add('hidden');
      }
    }
  };

  // Victory Callback
  game.onVictoryCallback = ({ sector, stars, revenue, customersServed }) => {
    crazygames.happyTime();
    safeSetText('vic-sector-name', currentLang === 'pt' ? sector.namePt : sector.name);
    safeSetText('vic-stars', '★'.repeat(stars) + '☆'.repeat(3 - stars));
    safeSetText('vic-revenue', `${currentLang === 'pt' ? 'Lucro do Turno' : 'Shift Revenue'}: $${revenue}`);
    safeSetText('vic-customers', `${currentLang === 'pt' ? 'Androides Atendidos' : 'Customers Served'}: ${customersServed}`);
    modalController.open('victory');
  };

  // Defeat Callback
  game.onDefeatCallback = ({ sector, customersServed, revenue }) => {
    safeSetText('def-customers', `${currentLang === 'pt' ? 'Androides Atendidos' : 'Customers Served'}: ${customersServed}`);
    safeSetText('def-revenue', `${currentLang === 'pt' ? 'Lucro' : 'Revenue'}: $${revenue}`);
    modalController.open('defeat');
  };

  // Rewarded Ad 2: Double Credits at Victory
  const btnVicDoubleAd = document.getElementById('btn-vic-double-ad');
  if (btnVicDoubleAd) {
    btnVicDoubleAd.addEventListener('click', () => {
      sound.playClick();
      crazygames.requestRewardedAd(sound, () => {
        // Reward: double shift revenue
        const bonus = game.shiftRevenue;
        SaveManager.addCredits(bonus);
        safeSetText('vic-revenue', `${currentLang === 'pt' ? 'Lucro do Turno (DOBRADO!)' : 'Shift Revenue (DOUBLED!)'}: $${game.shiftRevenue * 2}`);
        sound.playVictory();
        btnVicDoubleAd.disabled = true;
        btnVicDoubleAd.textContent = currentLang === 'pt' ? '✅ CRÉDITOS DOBRADOS!' : '✅ CREDITS DOUBLED!';
      });
    });
  }

  // Rewarded Ad 1: Extra Time on Defeat
  const btnDefExtraTime = document.getElementById('btn-def-extra-time');
  if (btnDefExtraTime) {
    btnDefExtraTime.addEventListener('click', () => {
      sound.playClick();
      crazygames.requestRewardedAd(sound, () => {
        // Reward: +30 seconds turbo rush
        modalController.close('defeat');
        game.addExtraTime(30);
        game.start();
        crazygames.gameplayStart();
      });
    });
  }

  // Victory / Defeat Buttons
  const btnVicNext = document.getElementById('btn-vic-next');
  if (btnVicNext) {
    btnVicNext.addEventListener('click', () => {
      sound.playClick();
      modalController.close('victory');
      crazygames.requestMidgameAd(sound, () => {
        const nextIdx = (game.currentSectorIndex + 1) % SECTORS.length;
        game.loadSector(nextIdx);
        updateLocalization();
        game.start();
        crazygames.gameplayStart();
      });
    });
  }

  const btnVicMenu = document.getElementById('btn-vic-menu');
  if (btnVicMenu) {
    btnVicMenu.addEventListener('click', () => {
      sound.playClick();
      modalController.close('victory');
      modalController.open('sectors');
      renderSectorsGrid();
    });
  }

  const btnDefRestart = document.getElementById('btn-def-restart');
  if (btnDefRestart) {
    btnDefRestart.addEventListener('click', () => {
      sound.playClick();
      modalController.close('defeat');
      game.loadSector(game.currentSectorIndex);
      game.start();
      crazygames.gameplayStart();
    });
  }

  const btnDefMenu = document.getElementById('btn-def-menu');
  if (btnDefMenu) {
    btnDefMenu.addEventListener('click', () => {
      sound.playClick();
      modalController.close('defeat');
      modalController.open('sectors');
      renderSectorsGrid();
    });
  }

  // Sector Selection Grid
  function renderSectorsGrid() {
    const grid = document.getElementById('sectors-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const save = SaveManager.get();
    const unlocked = save.unlockedSector || 1;
    const t = I18N[currentLang] || I18N.en;

    SECTORS.forEach((sec, idx) => {
      const data = SaveManager.getSectorData(sec.id);
      const isLocked = sec.id > unlocked;
      const card = document.createElement('div');
      card.className = `sector-card ${isLocked ? 'locked' : ''} ${game.currentSectorIndex === idx ? 'current' : ''}`;

      const secName = currentLang === 'pt' ? sec.namePt : sec.name;
      const secSub = currentLang === 'pt' ? sec.subtitlePt : sec.subtitle;

      card.innerHTML = `
        <div class="card-top">
          <span class="card-num">${t.sector} ${sec.id}</span>
          <span class="card-stars">${'★'.repeat(data.stars || 0)}${'☆'.repeat(3 - (data.stars || 0))}</span>
        </div>
        <div class="card-title">${secName}</div>
        <div class="card-sub">${secSub}</div>
        <div class="card-meta">🎯 ${t.meta}: ${sec.starTargets.star1.customers} • $${sec.starTargets.star1.revenue}</div>
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          sound.playClick();
          modalController.close('sectors');
          crazygames.requestMidgameAd(sound, () => {
            game.loadSector(idx);
            updateLocalization();
            game.start();
            crazygames.gameplayStart();
          });
        });
      }

      grid.appendChild(card);
    });
  }

  // Upgrades Grid
  function renderUpgradesGrid() {
    const grid = document.getElementById('upgrades-grid');
    if (!grid) return;
    grid.innerHTML = '';

    safeSetText('shop-credits-display', `💎 $${SaveManager.getCredits()}`);
    const t = I18N[currentLang] || I18N.en;

    const upgradeConfigs = [
      { id: 'playerSpeed', title: t.speedUpgrade, desc: t.speedDesc, baseCost: 150, max: 5 },
      { id: 'backpackCapacity', title: t.backpackUpgrade, desc: t.backpackDesc, baseCost: 200, max: 5 },
      { id: 'helperDrone', title: t.droneUpgrade, desc: t.droneDesc, baseCost: 350, max: 3 },
      { id: 'autoCashier', title: t.cashierUpgrade, desc: t.cashierDesc, baseCost: 300, max: 3 },
      { id: 'overclock', title: t.overclockUpgrade, desc: t.overclockDesc, baseCost: 250, max: 3 }
    ];

    upgradeConfigs.forEach(cfg => {
      const currentLevel = SaveManager.getUpgradeLevel(cfg.id);
      const isMax = currentLevel >= cfg.max;
      const cost = Math.floor(cfg.baseCost * Math.pow(1.6, currentLevel));
      const canAfford = SaveManager.getCredits() >= cost && !isMax;

      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div class="upgrade-title">${cfg.title}</div>
        <div class="upgrade-desc">${cfg.desc}</div>
        <div class="upgrade-level">${t.level}: ${currentLevel}/${cfg.max}</div>
        <button class="upgrade-btn" ${!canAfford ? 'disabled' : ''}>
          ${isMax ? t.maxLevel : `${t.cost}${cost}`}
        </button>
      `;

      const btn = card.querySelector('.upgrade-btn');
      if (canAfford && btn) {
        btn.addEventListener('click', () => {
          if (SaveManager.upgrade(cfg.id, cost)) {
            sound.playUpgrade();
            game.loadSector(game.currentSectorIndex); // reload active bonuses
            renderUpgradesGrid();
          }
        });
      }

      grid.appendChild(card);
    });
  }

  // Daily Login
  function renderDailyGrid() {
    const grid = document.getElementById('daily-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const check = SaveManager.checkDailyLogin();
    const btnClaim = document.getElementById('btn-claim-daily');
    if (btnClaim) {
      btnClaim.disabled = !check.available;
    }

    for (let day = 1; day <= 7; day++) {
      const isClaimed = !check.available && day <= check.streak;
      const isActive = check.available && day === check.streak;

      const dayCard = document.createElement('div');
      dayCard.className = `daily-day-card ${isClaimed ? 'claimed' : ''} ${isActive ? 'active' : ''}`;
      dayCard.innerHTML = `
        <div>D${day}</div>
        <div>💎 ${day * 150}</div>
      `;
      grid.appendChild(dayCard);
    }
  }

  const btnClaimDaily = document.getElementById('btn-claim-daily');
  if (btnClaimDaily) {
    btnClaimDaily.addEventListener('click', () => {
      const res = SaveManager.claimDailyLogin();
      if (res) {
        sound.playVictory();
        btnClaimDaily.disabled = true;
        renderDailyGrid();
        safeSetText('hud-credits-val', `$${SaveManager.getCredits()}`);
      }
    });
  }

  // Lucky Wheel
  const btnSpinWheel = document.getElementById('btn-spin-wheel');
  let isSpinning = false;
  if (btnSpinWheel) {
    btnSpinWheel.addEventListener('click', () => {
      if (isSpinning) return;
      isSpinning = true;
      btnSpinWheel.disabled = true;
      sound.playClick();

      const wheelDisc = document.getElementById('wheel-disc');
      const rewards = [100, 250, 500, 150, 1000, 350];
      const winIdx = Math.floor(Math.random() * rewards.length);
      const degrees = 1800 + winIdx * 60; // 5 full rotations + offset

      if (wheelDisc) {
        wheelDisc.style.transform = `rotate(${degrees}deg)`;
      }

      setTimeout(() => {
        isSpinning = false;
        sound.playVictory();
        SaveManager.claimLuckyWheel(rewards[winIdx]);
        safeSetText('hud-credits-val', `$${SaveManager.getCredits()}`);
        btnSpinWheel.textContent = `GANHOU 💎 ${rewards[winIdx]}!`;
      }, 3600);
    });
  }

  // Open & Close Modal Buttons
  document.getElementById('btn-open-menu')?.addEventListener('click', () => {
    sound.playClick();
    modalController.open('sectors');
    renderSectorsGrid();
  });
  document.getElementById('btn-close-menu')?.addEventListener('click', () => {
    sound.playClick();
    modalController.close('sectors');
  });

  document.getElementById('btn-open-upgrades')?.addEventListener('click', () => {
    sound.playClick();
    modalController.open('upgrades');
    renderUpgradesGrid();
  });
  document.getElementById('btn-close-upgrades')?.addEventListener('click', () => {
    sound.playClick();
    modalController.close('upgrades');
  });

  document.getElementById('btn-open-daily')?.addEventListener('click', () => {
    sound.playClick();
    modalController.open('daily');
    renderDailyGrid();
  });
  document.getElementById('btn-close-daily')?.addEventListener('click', () => {
    sound.playClick();
    modalController.close('daily');
  });

  document.getElementById('btn-open-wheel')?.addEventListener('click', () => {
    sound.playClick();
    modalController.open('wheel');
  });
  document.getElementById('btn-close-wheel')?.addEventListener('click', () => {
    sound.playClick();
    modalController.close('wheel');
  });

  // Mobile Touch Virtual Joystick
  const joystickZone = document.getElementById('joystick-zone');
  const joystickStick = document.getElementById('joystick-stick');
  let touchId = null;
  let joyCenter = { x: 0, y: 0 };

  if (joystickZone && joystickStick) {
    joystickZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      const rect = joystickZone.getBoundingClientRect();
      joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      handleJoystickMove(touch.clientX, touch.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (touchId === null) return;
      for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
          handleJoystickMove(t.clientX, t.clientY);
          break;
        }
      }
    }, { passive: false });

    const handleJoystickEnd = (e) => {
      if (touchId === null) return;
      for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
          touchId = null;
          joystickStick.style.transform = 'translate(0px, 0px)';
          game.setJoystickInput(0, 0);
          break;
        }
      }
    };

    window.addEventListener('touchend', handleJoystickEnd);
    window.addEventListener('touchcancel', handleJoystickEnd);

    function handleJoystickMove(clientX, clientY) {
      const maxDist = 38;
      const dx = clientX - joyCenter.x;
      const dy = clientY - joyCenter.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      const clampedDist = Math.min(dist, maxDist);
      const stickX = Math.cos(angle) * clampedDist;
      const stickY = Math.sin(angle) * clampedDist;

      joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
      game.setJoystickInput(stickX / maxDist, stickY / maxDist);
    }
  }

  // Mobile Dash Button
  const btnMobileDash = document.getElementById('btn-mobile-dash');
  if (btnMobileDash) {
    btnMobileDash.addEventListener('touchstart', (e) => {
      e.preventDefault();
      game.requestDash();
    }, { passive: false });
    btnMobileDash.addEventListener('mousedown', () => {
      game.requestDash();
    });
  }

  // Update initial texts
  updateLocalization();

  // Kickoff Intro Animation
  runFluidClebIntro();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
