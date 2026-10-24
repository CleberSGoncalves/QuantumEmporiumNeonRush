// src/crazygames.js
// CrazyGames SDK v3 Integration with 2.5s Watchdog, Live Ad Protection & Mute Guard

class CrazyGamesManager {
  constructor() {
    this.sdk = null;
    this.isInitialized = false;
    this.isAdPlaying = false;
    this.lastMidgameAdTime = 0;
    this.lastGameplayStartTime = 0;
    this.midgameCooldownMs = 210000; // 3.5 minutes between midgame ads
    this.onAdStartCallback = null;
    this.onAdEndCallback = null;
  }

  async init() {
    if (this.isInitialized) return;

    if (typeof window !== 'undefined' && window.CrazyGames && window.CrazyGames.SDK) {
      try {
        this.sdk = window.CrazyGames.SDK;
        if (this.sdk.init) {
          await this.sdk.init();
        }
        this.isInitialized = true;
        console.log('[CrazyGames] SDK v3 initialized successfully.');
      } catch (err) {
        console.warn('[CrazyGames] SDK init failed or running in non-SDK env:', err);
        this.isInitialized = true;
      }
    } else {
      console.log('[CrazyGames] Standalone / Local environment (SDK mock mode).');
      this.isInitialized = true;
    }
  }

  _canRequestLiveAds() {
    if (!this.sdk || !this.sdk.ad) return false;
    try {
      const hostname = window.location.hostname;
      const isCrazyHost = hostname.includes('crazygames') || hostname.includes('1001juegos');
      const env = this.sdk.environment;
      // In local/dev or disabled iframe, bypass ads instantly
      if (env === 'disabled') return false;
      return isCrazyHost || env === 'live';
    } catch (e) {
      return false;
    }
  }

  gameplayStart() {
    const now = Date.now();
    if (now - this.lastGameplayStartTime < 1100) {
      return; // Respect SDK 1000ms throttle
    }
    this.lastGameplayStartTime = now;

    if (this.sdk && this.sdk.game && typeof this.sdk.game.gameplayStart === 'function') {
      try {
        this.sdk.game.gameplayStart();
        console.log('[CrazyGames] gameplayStart()');
      } catch (e) {}
    }
  }

  gameplayStop() {
    if (this.sdk && this.sdk.game && typeof this.sdk.game.gameplayStop === 'function') {
      try {
        this.sdk.game.gameplayStop();
        console.log('[CrazyGames] gameplayStop()');
      } catch (e) {}
    }
  }

  happyTime() {
    if (this.sdk && this.sdk.game && typeof this.sdk.game.happyTime === 'function') {
      try {
        this.sdk.game.happyTime();
      } catch (e) {}
    }
  }

  // Midgame Ad with 2.5s Watchdog & Safe Pause/Resume
  async requestMidgameAd(soundManager, onResume) {
    const now = Date.now();
    if (now - this.lastMidgameAdTime < this.midgameCooldownMs) {
      console.log('[CrazyGames] Midgame ad cooldown active. Skipping.');
      if (onResume) onResume();
      return;
    }

    if (!this._canRequestLiveAds()) {
      console.log('[CrazyGames] Ad bypass (local/dev/no-live).');
      this.lastMidgameAdTime = now;
      if (onResume) onResume();
      return;
    }

    this.isAdPlaying = true;
    if (soundManager && soundManager.setAdMuted) soundManager.setAdMuted(true);
    if (this.onAdStartCallback) this.onAdStartCallback();

    let finished = false;
    const cleanup = () => {
      if (finished) return;
      finished = true;
      this.isAdPlaying = false;
      this.lastMidgameAdTime = Date.now();
      if (soundManager && soundManager.setAdMuted) soundManager.setAdMuted(false);
      if (this.onAdEndCallback) this.onAdEndCallback();
      if (onResume) onResume();
    };

    // 2.5s Watchdog failsafe
    const watchdogTimer = setTimeout(() => {
      console.warn('[CrazyGames] Midgame Ad watchdog triggered after 2500ms.');
      cleanup();
    }, 2500);

    try {
      await this.sdk.ad.requestAd('midgame', {
        adStarted: () => {
          clearTimeout(watchdogTimer);
          console.log('[CrazyGames] Midgame Ad started.');
        },
        adFinished: () => {
          console.log('[CrazyGames] Midgame Ad finished.');
          cleanup();
        },
        adError: (error) => {
          console.warn('[CrazyGames] Midgame Ad error:', error);
          cleanup();
        }
      });
    } catch (e) {
      console.warn('[CrazyGames] Midgame Ad exception:', e);
      cleanup();
    } finally {
      // Cláusula finally garantida
      setTimeout(() => {
        if (!finished) cleanup();
      }, 500);
    }
  }

  // Rewarded Ad with 2.5s Watchdog, Guaranteeing No Reward on AdBlock/adError
  async requestRewardedAd(soundManager, onRewardGranted, onResume) {
    if (!this._canRequestLiveAds()) {
      console.log('[CrazyGames] Rewarded ad mock grant in local/dev environment.');
      if (onRewardGranted) onRewardGranted();
      if (onResume) onResume();
      return;
    }

    this.isAdPlaying = true;
    if (soundManager && soundManager.setAdMuted) soundManager.setAdMuted(true);
    if (this.onAdStartCallback) this.onAdStartCallback();

    let rewardGiven = false;
    let finished = false;

    const cleanup = () => {
      if (finished) return;
      finished = true;
      this.isAdPlaying = false;
      if (soundManager && soundManager.setAdMuted) soundManager.setAdMuted(false);
      if (this.onAdEndCallback) this.onAdEndCallback();
      if (onResume) onResume();
    };

    // 2.5s Watchdog failsafe
    const watchdogTimer = setTimeout(() => {
      console.warn('[CrazyGames] Rewarded Ad watchdog triggered after 2500ms.');
      cleanup();
    }, 2500);

    try {
      await this.sdk.ad.requestAd('rewarded', {
        adStarted: () => {
          clearTimeout(watchdogTimer);
          console.log('[CrazyGames] Rewarded Ad started.');
        },
        adFinished: () => {
          console.log('[CrazyGames] Rewarded Ad completed. Awarding reward!');
          rewardGiven = true;
          if (onRewardGranted) onRewardGranted();
          cleanup();
        },
        adError: (error) => {
          // PROIBIDO premiar em caso de erro / AdBlock
          console.warn('[CrazyGames] Rewarded Ad error (AdBlock or failure). No reward given:', error);
          cleanup();
        }
      });
    } catch (e) {
      console.warn('[CrazyGames] Rewarded Ad exception:', e);
      cleanup();
    } finally {
      setTimeout(() => {
        if (!finished) cleanup();
      }, 500);
    }
  }
}

export const crazygames = new CrazyGamesManager();
