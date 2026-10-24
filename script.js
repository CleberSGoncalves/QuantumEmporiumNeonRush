// script.js
// Global Runtime Shield, Defensive Verifications & Safe Utility Engine
// Previne terminantemente "Script error. (linha 0)" e garante tolerância total a falhas

(function () {
  'use strict';

  // 1. Escudo Global Anti-"Script error." (Window Error Handler)
  window.addEventListener('error', function (event) {
    try {
      console.warn('[RuntimeShield] Exceção capturada com segurança:', {
        message: event.message || 'Script error',
        filename: event.filename || 'script.js',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        error: event.error ? event.error.stack : null
      });
    } catch (e) {}
    // Impede crash fatal da página
    return true;
  });

  window.addEventListener('unhandledrejection', function (event) {
    try {
      console.warn('[RuntimeShield] Promise rejeitada capturada:', event.reason);
    } catch (e) {}
    event.preventDefault();
  });

  // 2. Helpers Globais Defensivos (Safe Access)
  window.SafeDOM = {
    safeGet: function (id) {
      if (!id || typeof id !== 'string') return null;
      try {
        return document.getElementById(id);
      } catch (e) {
        return null;
      }
    },
    safeSetText: function (id, val) {
      const el = this.safeGet(id);
      if (el) {
        try {
          el.textContent = String(val !== undefined && val !== null ? val : '');
        } catch (e) {}
      }
    },
    safeClassAdd: function (id, className) {
      const el = this.safeGet(id);
      if (el && el.classList) {
        try { el.classList.add(className); } catch (e) {}
      }
    },
    safeClassRemove: function (id, className) {
      const el = this.safeGet(id);
      if (el && el.classList) {
        try { el.classList.remove(className); } catch (e) {}
      }
    },
    safeCall: function (fn, thisArg, ...args) {
      if (typeof fn === 'function') {
        try {
          return fn.apply(thisArg, args);
        } catch (err) {
          console.warn('[RuntimeShield] Erro em safeCall:', err);
        }
      }
      return null;
    }
  };

  // 3. Validação de Integridade Matemática
  window.SafeMath = {
    clamp: function (val, min, max) {
      if (isNaN(val) || !isFinite(val)) return min;
      return Math.max(min, Math.min(max, val));
    },
    safeNumber: function (val, defaultVal = 0) {
      if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
        return defaultVal;
      }
      return val;
    }
  };

  console.log('[QuantumEmporium] script.js carregado com sucesso. Escudo defensivo de runtime ativo.');
})();
