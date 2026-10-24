// src/renderer.js
// High-Polish Stylized Canvas Shaders & Procedural Sprites Engine
// Zero formas geométricas cruas: Herói com capa dinâmica, Frascos com meniscos líquidos,
// Máquinas industriais com esteiras em movimento e displays holográficos ricos.

import { ITEM_TYPES } from './levels.js';

export class GameRenderer {
  // 1. Renderiza o Herói Gerente com Capa Dinâmica e Traje Exoesquelético
  static renderPlayer(ctx, player) {
    if (!player) return;
    const skin = player.skin || {
      coatColor: '#0284c7',
      visorColor: '#00f5ff',
      glowColor: '#00f5ff',
      trimColor: '#38bdf8'
    };

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.squash.scaleX, player.squash.scaleY);

    // Sombra Projetada Suave com Gradiente Radial
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(0, 14, 2, 0, 14, 24);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(0, 14, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Capa Dinâmica com Tecido Físico (Cloth Simulation)
    if (player.capeNodes && player.capeNodes.length > 1) {
      ctx.save();
      // Transforma coordenadas globais dos nós da capa para relativas ao herói
      ctx.translate(-player.x, -player.y);

      for (let i = 0; i < player.capeNodes.length - 1; i++) {
        const p1 = player.capeNodes[i];
        const p2 = player.capeNodes[i + 1];
        const width = 16 - i * 3.5;

        const perpAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + Math.PI / 2;
        const ox = Math.cos(perpAngle) * width;
        const oy = Math.sin(perpAngle) * width;

        ctx.beginPath();
        ctx.moveTo(p1.x - ox, p1.y - oy);
        ctx.lineTo(p1.x + ox, p1.y + oy);
        ctx.lineTo(p2.x + ox * 0.8, p2.y + oy * 0.8);
        ctx.lineTo(p2.x - ox * 0.8, p2.y - oy * 0.8);
        ctx.closePath();

        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, skin.coatColor);
        grad.addColorStop(1, '#050b14');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = skin.trimColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Corpo do Herói
    ctx.save();
    ctx.rotate(player.angle);

    // Mochila Propulsora / Gerador Gravitacional Traseiro
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-16, -10, 8, 20, 3);
    ctx.fill();
    ctx.stroke();

    // Propulsores com Brilho Neon
    ctx.fillStyle = skin.glowColor;
    ctx.shadowColor = skin.glowColor;
    ctx.shadowBlur = player.isDashing ? 18 : 8;
    ctx.fillRect(-18, -8, 3, 5);
    ctx.fillRect(-18, 3, 3, 5);

    // Armadura de Peito / Exoesquelo Metálico
    const armorGrad = ctx.createLinearGradient(-10, -14, 12, 14);
    armorGrad.addColorStop(0, '#1e293b');
    armorGrad.addColorStop(0.5, '#0f172a');
    armorGrad.addColorStop(1, '#020617');
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    ctx.roundRect(-12, -14, 24, 28, 6);
    ctx.fill();

    ctx.strokeStyle = skin.coatColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ombreiras com Revestimento de Carbono
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(-2, -16, 5, 0, Math.PI * 2);
    ctx.arc(-2, 16, 5, 0, Math.PI * 2);
    ctx.fill();

    // Núcleo Reator Central Pulsante no Peito
    const pulse = 0.8 + Math.sin(Date.now() / 250) * 0.2;
    ctx.fillStyle = skin.glowColor;
    ctx.shadowColor = skin.glowColor;
    ctx.shadowBlur = 12 * pulse;
    ctx.beginPath();
    ctx.arc(2, 0, 4 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Capacete com Viseira Cibernética Curvada
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(4, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Lente HUD Viseira Neon
    ctx.fillStyle = skin.visorColor;
    ctx.shadowColor = skin.visorColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(6, 0, 6, -Math.PI / 2.3, Math.PI / 2.3);
    ctx.lineTo(6, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore(); // Restaura rotação

    // Pilha Magnética de Itens Flutuando com Campo Holográfico
    if (player.stack && player.stack.length > 0) {
      this.renderPlayerStack(ctx, player);
    }

    ctx.restore();
  }

  // 2. Renderiza a Pilha Magnética com Feixe de Conexão e Ícones Detalhados
  static renderPlayerStack(ctx, player) {
    const startY = -30;
    const spacing = 14;

    for (let i = 0; i < player.stack.length; i++) {
      const typeId = player.stack[i];
      const itemInfo = ITEM_TYPES[typeId];
      if (!itemInfo) continue;

      const itemY = startY - i * spacing;
      const floatX = Math.sin(Date.now() / 300 + i) * 1.5;

      ctx.save();
      ctx.translate(floatX, itemY);

      // Mini Feixe de Conexão Magnética
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(0, 14);
      ctx.stroke();
      ctx.setLineDash([]);

      // Desenha o Item Estilizado
      this.drawStylizedProduct(ctx, 0, 0, typeId, 0.65);

      ctx.restore();
    }

    // Badge Indicadora de Carga no Topo
    const topY = startY - player.stack.length * spacing - 6;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-16, topY - 7, 32, 14, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 9px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${player.stack.length}/${player.maxCapacity}`, 0, topY);
  }

  // 3. Desenho de Produtos Estilizados com Shaders e Meniscos Líquidos
  static drawStylizedProduct(ctx, x, y, typeId, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (typeId === 'CHIP') {
      // 🔷 CHIP QUÂNTICO: Wafer de Silício com Trilhas de Circuito Douradas e Núcleo Laser
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-14, -14, 28, 28);

      // Trilhas de Ouro nos Pinos
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      for (let p = -10; p <= 10; p += 5) {
        ctx.beginPath();
        ctx.moveTo(p, -14); ctx.lineTo(p, -17);
        ctx.moveTo(p, 14); ctx.lineTo(p, 17);
        ctx.moveTo(-14, p); ctx.lineTo(-17, p);
        ctx.moveTo(14, p); ctx.lineTo(17, p);
        ctx.stroke();
      }

      // Placa Interna Ciano Neon com Glow
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-10, -10, 20, 20);

      ctx.fillStyle = '#00f5ff';
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Linhas de Circuito em Cruz
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-7, 0); ctx.lineTo(7, 0);
      ctx.moveTo(0, -7); ctx.lineTo(0, 7);
      ctx.stroke();

    } else if (typeId === 'BATTERY') {
      // 🔋 NANO-BATERIA / FRASCO ALQUÍMICO: Cilindro de Vidro com Menisco Líquido e Bolhas
      const h = 32, w = 18;

      // Tubo de Vidro Fundo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();

      // Líquido Alquímico / Nanites com Menisco Curvado
      const fillPct = 0.75;
      const liquidH = h * fillPct;
      const liquidTop = h / 2 - liquidH;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.clip(); // Limita ao frasco

      // Gradiente do Líquido Verde Neon
      const liqGrad = ctx.createLinearGradient(0, liquidTop, 0, h / 2);
      liqGrad.addColorStop(0, '#4ade80');
      liqGrad.addColorStop(0.5, '#22c55e');
      liqGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = liqGrad;

      // Menisco Curvado na Superfície do Líquido
      const wave = Math.sin(Date.now() / 200) * 1.5;
      ctx.beginPath();
      ctx.moveTo(-w / 2, liquidTop);
      ctx.quadraticCurveTo(0, liquidTop - 3 + wave, w / 2, liquidTop);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      ctx.fill();

      // Bolhas Alquímicas Subindo
      ctx.fillStyle = '#bbf7d0';
      const b1Y = ((Date.now() / 30) % liquidH);
      const b2Y = ((Date.now() / 45 + 10) % liquidH);
      ctx.beginPath();
      ctx.arc(-3, h / 2 - b1Y, 1.5, 0, Math.PI * 2);
      ctx.arc(3, h / 2 - b2Y, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Contorno e Brilho do Vidro
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 8;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Tampas Metálicas de Eletrodo (Cobre/Ouro)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-w / 2 + 2, -h / 2 - 3, w - 4, 3);
      ctx.fillRect(-w / 2 + 2, h / 2, w - 4, 3);

    } else if (typeId === 'PLASMA') {
      // 🟣 NÚCLEO DE PLASMA / ESFERA ARCANA: Vórtice Giratório com Anéis de Contenção
      const time = Date.now() / 300;

      // Anéis de Contenção Magnética
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 6, time, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 6, -time, 0, Math.PI * 2);
      ctx.stroke();

      // Núcleo de Plasma com Fusão Roxo/Rosa
      const plasmaGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 10);
      plasmaGrad.addColorStop(0, '#ffffff');
      plasmaGrad.addColorStop(0.3, '#ec4899');
      plasmaGrad.addColorStop(0.8, '#a855f7');
      plasmaGrad.addColorStop(1, '#581c87');

      ctx.fillStyle = plasmaGrad;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

    } else if (typeId === 'NEURAL') {
      // 🔶 IMPLANTE NEURAL: Matriz Bio-Quântica de Ouro com Sinapses Brilhantes
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;

      // Losango Central
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(13, 0);
      ctx.lineTo(0, 15);
      ctx.lineTo(-13, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sinapses Neurais
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, 0); ctx.lineTo(8, 0);
      ctx.moveTo(0, -10); ctx.lineTo(0, 10);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 4. Renderiza Nano-Fabricador com Esteira Industrial Animada
  static renderFabricator(ctx, fab) {
    if (!fab) return;
    ctx.save();
    ctx.translate(fab.x, fab.y);
    ctx.scale(fab.squash.scaleX, fab.squash.scaleY);

    const w = fab.width;
    const h = fab.height;

    // Carcaça Metálica com Chanfros
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // Listras de Alerta Industrial (Hazard Stripes) nas Bordas
    ctx.save();
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, 8);
    ctx.rect(-w / 2, h / 2 - 8, w, 8);
    ctx.clip();
    for (let x = -w / 2 - 20; x < w / 2 + 20; x += 12) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(x, -h / 2 - 10);
      ctx.lineTo(x + 8, -h / 2 - 10);
      ctx.lineTo(x + 2, h / 2 + 10);
      ctx.lineTo(x - 6, h / 2 + 10);
      ctx.fill();
    }
    ctx.restore();

    // Esteira Rolante Central Animada
    ctx.fillStyle = '#020617';
    ctx.fillRect(-w / 2 + 8, -h / 2 + 10, w - 16, h - 20);

    const treadSpeed = (Date.now() / 1000 * 30) % 14;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-w / 2 + 8, -h / 2 + 10, w - 16, h - 20);
    ctx.clip();
    for (let x = -w / 2 + treadSpeed; x < w / 2 + 20; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, -h / 2 + 10);
      ctx.lineTo(x, h / 2 - 10);
      ctx.stroke();
    }
    ctx.restore();

    // Produto Sendo Gerado no Centro com Feixe de Montagem
    if (fab.currentStock > 0) {
      this.drawStylizedProduct(ctx, 0, 0, fab.itemType.id, 0.9);
    }

    // Contorno Neon com Brilho do Tipo de Peça
    ctx.strokeStyle = fab.itemType.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = fab.itemType.color;
    ctx.shadowBlur = 12;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    // Barra de Progresso de Fabricação na Base
    const barW = w - 20;
    const progress = fab.currentStock >= fab.maxStock ? 1.0 : (fab.productionTimer / fab.baseInterval);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-barW / 2, h / 2 - 6, barW, 4);
    ctx.fillStyle = fab.itemType.color;
    ctx.fillRect(-barW / 2, h / 2 - 6, barW * progress, 4);

    // Texto de Estoque
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${fab.itemType.name}: ${fab.currentStock}/${fab.maxStock}`, 0, -h / 2 - 6);

    ctx.restore();
  }

  // 5. Renderiza Prateleira Holográfica com Redoma de Vidro e Base Fluida
  static renderShelf(ctx, shelf) {
    if (!shelf) return;
    ctx.save();
    ctx.translate(shelf.x, shelf.y);
    ctx.scale(shelf.squash.scaleX, shelf.squash.scaleY);

    const w = shelf.width;
    const h = shelf.height;

    // Base do Estande Holográfico
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // Borda Neon
    const isOut = shelf.currentStock <= 0;
    ctx.strokeStyle = isOut ? '#ef4444' : shelf.itemType.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = isOut ? '#ef4444' : shelf.itemType.color;
    ctx.shadowBlur = 10;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    // Projeção Holográfica Concêntrica
    const rot = Date.now() / 400;
    ctx.strokeStyle = isOut ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 245, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 12, rot, 0, Math.PI * 2);
    ctx.stroke();

    // Produto Flutuando no Estande
    if (shelf.currentStock > 0) {
      const bobY = Math.sin(Date.now() / 280) * 4;
      this.drawStylizedProduct(ctx, 0, bobY, shelf.itemType.id, 0.95);
    } else {
      // Alerta Vazio Piscante
      const blink = Math.sin(Date.now() / 150) > 0;
      if (blink) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '900 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ VAZIO', 0, 4);
      }
    }

    // Barra de Estoque Segmentada em LEDs
    const barW = w - 24;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-barW / 2, h / 2 - 8, barW, 5);

    const fillRatio = shelf.currentStock / shelf.maxStock;
    ctx.fillStyle = isOut ? '#ef4444' : shelf.itemType.color;
    ctx.fillRect(-barW / 2, h / 2 - 8, barW * fillRatio, 5);

    // Rótulo de Identificação
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${shelf.itemType.name}: ${shelf.currentStock}/${shelf.maxStock}`, 0, -h / 2 - 8);

    ctx.restore();
  }

  // 6. Renderiza Androides Clientes com Modelos Detalhados
  static renderCustomer(ctx, cust) {
    if (!cust) return;
    ctx.save();
    ctx.translate(cust.x, cust.y);
    ctx.scale(cust.squash.scaleX, cust.squash.scaleY);

    // Sombra
    ctx.beginPath();
    ctx.ellipse(0, 12, 14, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    ctx.save();
    ctx.rotate(cust.angle);

    if (cust.type === 'VIP') {
      // 👑 VIP EXECUTIVE: Corpo Cromado Dourado com Gola Alta
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.roundRect(-10, -12, 20, 24, 6);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Viseira Óptica VIP
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillRect(4, -3, 5, 6);

    } else if (cust.type === 'CARGO') {
      // 🚜 CARGO MECH: Armadura Pesada com Listras de Carga
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 28, 8);
      ctx.fill();
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Escapamentos
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-16, -10, 4, 6);
      ctx.fillRect(-16, 4, 4, 6);

      // Visor
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, -4, 6, 8);

    } else if (cust.type === 'DRONE') {
      // 🛸 SPEED DRONE: Propulsores Duplos e Fuselagem Oval
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Hélices / Thrusters Laterais
      ctx.fillStyle = '#00f5ff';
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(-2, -10, 4, 0, Math.PI * 2);
      ctx.arc(-2, 10, 4, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // 🤖 CIVIC ANDROID: Chassi Metálico Cinza-Azulado
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-9, -10, 18, 20, 5);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Visor
      ctx.fillStyle = cust.state === 'LEAVING_ANGRY' ? '#ef4444' : '#00f5ff';
      ctx.shadowColor = cust.state === 'LEAVING_ANGRY' ? '#ef4444' : '#00f5ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(3, -3, 4, 6);
    }

    ctx.restore();

    // Item Sendo Carregado pelo Cliente
    if (cust.carriedItem) {
      this.drawStylizedProduct(ctx, 0, -22, cust.carriedItem, 0.7);
    }

    // Balão de Pensamento com o Produto Desejado
    if (cust.state === 'WAITING_ITEM' || cust.state === 'TO_SHELF') {
      const itemInfo = ITEM_TYPES[cust.desiredItemType];
      if (itemInfo) {
        ctx.save();
        ctx.translate(0, -32);

        ctx.fillStyle = '#090d16';
        ctx.strokeStyle = itemInfo.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = itemInfo.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(-14, -12, 28, 22, 6);
        ctx.fill();
        ctx.stroke();

        this.drawStylizedProduct(ctx, 0, -1, cust.desiredItemType, 0.55);
        ctx.restore();
      }
    }

    // Barra de Paciência com Alerta Gradual
    if (cust.state === 'WAITING_ITEM') {
      const barW = 28;
      const barH = 4;
      const pct = Math.max(0, cust.patience / cust.maxPatience);
      const color = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(-barW / 2, -48, barW, barH);
      ctx.fillStyle = color;
      ctx.fillRect(-barW / 2, -48, barW * pct, barH);
    }

    // Coroa Flutuante VIP
    if (cust.type === 'VIP') {
      ctx.fillStyle = '#fde047';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', 0, -26);
    }

    ctx.restore();
  }
}
