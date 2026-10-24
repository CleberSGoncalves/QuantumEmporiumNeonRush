// src/storage.js
// Versioned Atomic LocalStorage Progress Manager

const SAVE_KEY = 'quantum_emporium_save_v2';

const DEFAULT_SAVE = {
  version: 2,
  credits: 200, // starting seed credits
  unlockedSector: 1,
  totalCustomersServed: 0,
  sectors: {}, // { [sectorId]: { stars: 0, highCredits: 0, customersServed: 0, completed: false } }
  upgrades: {
    playerSpeed: 1,      // 1 to 5
    backpackCapacity: 1, // 1 to 5 (Capacities: 3, 4, 6, 8, 10)
    helperDrone: 0,      // 0 to 3
    autoCashier: 0,      // 0 to 3
    overclock: 0         // 0 to 3
  },
  dailyLogin: {
    lastDate: null,
    streak: 0
  },
  luckyWheel: {
    lastSpinTime: 0
  },
  settings: {
    soundMuted: false,
    lang: 'auto'
  }
};

export class SaveManager {
  static get() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migration / validation
        if (parsed && parsed.version === 2) {
          return { ...DEFAULT_SAVE, ...parsed, upgrades: { ...DEFAULT_SAVE.upgrades, ...parsed.upgrades } };
        }
      }
    } catch (e) {
      console.warn('Failed to load save from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SAVE));
  }

  static save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  static getCredits() {
    const s = this.get();
    return s.credits || 0;
  }

  static addCredits(amount) {
    const s = this.get();
    s.credits = Math.max(0, (s.credits || 0) + amount);
    this.save(s);
    return s.credits;
  }

  static spendCredits(amount) {
    const s = this.get();
    if ((s.credits || 0) >= amount) {
      s.credits -= amount;
      this.save(s);
      return true;
    }
    return false;
  }

  static getSectorData(sectorId) {
    const s = this.get();
    return s.sectors[sectorId] || { stars: 0, highCredits: 0, customersServed: 0, completed: false };
  }

  static recordSectorCompletion(sectorId, starsCount, creditsEarned, customersServed) {
    const s = this.get();
    if (!s.sectors[sectorId]) {
      s.sectors[sectorId] = { stars: 0, highCredits: 0, customersServed: 0, completed: false };
    }
    const current = s.sectors[sectorId];
    if (starsCount > (current.stars || 0)) current.stars = starsCount;
    if (creditsEarned > (current.highCredits || 0)) current.highCredits = creditsEarned;
    current.customersServed = Math.max(current.customersServed || 0, customersServed);
    current.completed = true;

    // Unlock next sector if at least 1 star was earned
    if (starsCount >= 1) {
      s.unlockedSector = Math.max(s.unlockedSector || 1, sectorId + 1);
    }

    s.totalCustomersServed = (s.totalCustomersServed || 0) + customersServed;
    this.save(s);
    return current;
  }

  static getUpgradeLevel(type) {
    const s = this.get();
    return s.upgrades[type] || 0;
  }

  static upgrade(type, cost) {
    if (this.spendCredits(cost)) {
      const s = this.get();
      s.upgrades[type] = (s.upgrades[type] || 0) + 1;
      this.save(s);
      return s.upgrades[type];
    }
    return false;
  }

  static getBackpackMax() {
    const lvl = this.getUpgradeLevel('backpackCapacity');
    const table = [3, 4, 6, 8, 10, 12];
    return table[Math.min(lvl, table.length - 1)] || 3;
  }

  static getPlayerSpeedMultiplier() {
    const lvl = this.getUpgradeLevel('playerSpeed');
    return 1.0 + (lvl - 1) * 0.15; // +15% speed per level
  }

  static getOverclockMultiplier() {
    const lvl = this.getUpgradeLevel('overclock');
    return 1.0 + lvl * 0.25; // +25% conveyor production speed per level
  }

  static checkDailyLogin() {
    const s = this.get();
    const today = new Date().toDateString();
    if (s.dailyLogin.lastDate === today) {
      return { available: false, streak: s.dailyLogin.streak };
    }

    let newStreak = (s.dailyLogin.streak || 0) + 1;
    if (newStreak > 7) newStreak = 1;

    return { available: true, streak: newStreak };
  }

  static claimDailyLogin() {
    const check = this.checkDailyLogin();
    if (!check.available) return null;

    const s = this.get();
    s.dailyLogin.lastDate = new Date().toDateString();
    s.dailyLogin.streak = check.streak;

    // Rewards scale with streak
    const rewardCredits = check.streak * 150;
    s.credits = (s.credits || 0) + rewardCredits;
    this.save(s);

    return { streak: check.streak, rewardCredits };
  }

  static checkLuckyWheel() {
    const s = this.get();
    const now = Date.now();
    const cooldown = 4 * 60 * 60 * 1000; // 4 hours
    const elapsed = now - (s.luckyWheel.lastSpinTime || 0);
    return {
      available: elapsed >= cooldown,
      remainingMs: Math.max(0, cooldown - elapsed)
    };
  }

  static claimLuckyWheel(rewardCredits) {
    const s = this.get();
    s.luckyWheel.lastSpinTime = Date.now();
    s.credits = (s.credits || 0) + rewardCredits;
    this.save(s);
  }
}
