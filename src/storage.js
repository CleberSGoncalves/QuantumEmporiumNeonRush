// src/storage.js
// Versioned Atomic LocalStorage Progress Manager

const SAVE_KEY = 'quantum_emporium_save_v2';

const DEFAULT_SAVE = {
  version: 2,
  credits: 200, // starting seed credits
  unlockedSector: 1,
  totalCustomersServed: 0,
  totalRevenue: 0,
  equippedSkin: 'CYBER_DEFAULT',
  unlockedSkins: ['CYBER_DEFAULT'],
  sectors: {}, // { [sectorId]: { stars: 0, highCredits: 0, customersServed: 0, completed: false } }
  upgrades: {
    playerSpeed: 1,      // 1 to 5
    backpackCapacity: 1, // 1 to 5 (Capacities: 4, 6, 8, 10, 12)
    helperDrone: 0,      // 0 to 3
    autoCashier: 0,      // 0 to 3
    overclock: 0         // 0 to 3
  },
  missions: [
    { id: 'm1', title: 'Atenda 12 Androides', titleEn: 'Serve 12 Androids', target: 12, reward: 300, claimed: false },
    { id: 'm2', title: 'Fature $1.500 no Caixa', titleEn: 'Earn $1,500 Credits', target: 1500, reward: 500, claimed: false },
    { id: 'm3', title: 'Conquiste 6 Estrelas Totais', titleEn: 'Earn 6 Total Stars', target: 6, reward: 800, claimed: false },
    { id: 'm4', title: 'Desbloqueie o Setor 3', titleEn: 'Unlock Sector 3', target: 3, reward: 1000, claimed: false },
    { id: 'm5', title: 'Equipe um Novo Traje Cyber', titleEn: 'Equip a New Cyber Suit', target: 1, reward: 600, claimed: false }
  ],
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
        if (parsed && parsed.version === 2) {
          return {
            ...DEFAULT_SAVE,
            ...parsed,
            upgrades: { ...DEFAULT_SAVE.upgrades, ...parsed.upgrades },
            unlockedSkins: parsed.unlockedSkins || ['CYBER_DEFAULT'],
            equippedSkin: parsed.equippedSkin || 'CYBER_DEFAULT',
            missions: parsed.missions || DEFAULT_SAVE.missions
          };
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
    s.totalRevenue = (s.totalRevenue || 0) + amount;
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

  static getTotalStars() {
    const s = this.get();
    let total = 0;
    Object.values(s.sectors || {}).forEach(sec => {
      total += (sec.stars || 0);
    });
    return total;
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
    const table = [4, 6, 8, 10, 12];
    return table[Math.min(lvl - 1, table.length - 1)] || 4;
  }

  static getPlayerSpeedMultiplier() {
    const lvl = this.getUpgradeLevel('playerSpeed');
    return 1.0 + (lvl - 1) * 0.15;
  }

  static getOverclockMultiplier() {
    const lvl = this.getUpgradeLevel('overclock');
    return 1.0 + lvl * 0.25;
  }

  // Skin Management
  static getEquippedSkin() {
    return this.get().equippedSkin || 'CYBER_DEFAULT';
  }

  static getUnlockedSkins() {
    return this.get().unlockedSkins || ['CYBER_DEFAULT'];
  }

  static unlockSkin(skinId, cost) {
    if (this.spendCredits(cost)) {
      const s = this.get();
      if (!s.unlockedSkins.includes(skinId)) {
        s.unlockedSkins.push(skinId);
      }
      s.equippedSkin = skinId;
      this.save(s);
      return true;
    }
    return false;
  }

  static equipSkin(skinId) {
    const s = this.get();
    if (s.unlockedSkins.includes(skinId)) {
      s.equippedSkin = skinId;
      this.save(s);
      return true;
    }
    return false;
  }

  // Missions Management
  static getMissions() {
    const s = this.get();
    const totalCustomers = s.totalCustomersServed || 0;
    const totalRevenue = s.totalRevenue || 0;
    const totalStars = this.getTotalStars();

    return (s.missions || DEFAULT_SAVE.missions).map(m => {
      let progress = 0;
      if (m.id === 'm1') progress = totalCustomers;
      else if (m.id === 'm2') progress = totalRevenue;
      else if (m.id === 'm3') progress = totalStars;

      return {
        ...m,
        current: progress,
        canClaim: progress >= m.target && !m.claimed
      };
    });
  }

  static claimMission(missionId) {
    const s = this.get();
    const missions = this.getMissions();
    const targetMission = missions.find(m => m.id === missionId);

    if (targetMission && targetMission.canClaim) {
      s.credits = (s.credits || 0) + targetMission.reward;
      const saveM = (s.missions || DEFAULT_SAVE.missions).find(m => m.id === missionId);
      if (saveM) saveM.claimed = true;
      this.save(s);
      return targetMission.reward;
    }
    return 0;
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

    const rewardCredits = check.streak * 150;
    s.credits = (s.credits || 0) + rewardCredits;
    this.save(s);

    return { streak: check.streak, rewardCredits };
  }

  static checkLuckyWheel() {
    const s = this.get();
    const now = Date.now();
    const cooldown = 4 * 60 * 60 * 1000;
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
