// src/levels.js
// 12 Handcrafted Sectors / Markets for Quantum Emporium: Neon Rush

export const ITEM_TYPES = {
  CHIP: {
    id: 'CHIP',
    name: 'Quantum Chip',
    namePt: 'Chip Quântico',
    color: '#00f5ff',
    icon: '🔷',
    price: 45
  },
  BATTERY: {
    id: 'BATTERY',
    name: 'Nano-Battery',
    namePt: 'Nano-Bateria',
    color: '#22c55e',
    icon: '🔋',
    price: 70
  },
  PLASMA: {
    id: 'PLASMA',
    name: 'Plasma Core',
    namePt: 'Núcleo de Plasma',
    color: '#c084fc',
    icon: '🟣',
    price: 110
  },
  NEURAL: {
    id: 'NEURAL',
    name: 'Neural Implant',
    namePt: 'Implante Neural',
    color: '#facc15',
    icon: '🔶',
    price: 175
  }
};

export const SECTORS = [
  {
    id: 1,
    name: "Sector 1: Alley Nanotech Kiosk",
    namePt: "Setor 1: Quiosque Nanotech de Beco",
    subtitle: "Basic Training • Quantum Chips",
    subtitlePt: "Treinamento Básico • Chips Quânticos",
    difficulty: "Beginner",
    diffColor: "#10b981",
    shiftTime: 75, // seconds
    customerSpawnInterval: 4.8,
    marketWidth: 1000,
    marketHeight: 700,
    playerStart: { x: 500, y: 450 },
    // Production Fabricators (Conveyor belts)
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 200, y: 150, maxStock: 8, interval: 2.4 }
    ],
    // Display Shelves for customers
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 500, y: 240, maxStock: 8, capacity: 8 }
    ],
    // Checkout Counters
    checkouts: [
      { id: 'cash_1', x: 800, y: 450 }
    ],
    // Star Thresholds (Customers Served / Revenue)
    starTargets: {
      star1: { customers: 6, revenue: 250, label: "Serve 6 Androids & $250" },
      star2: { customers: 10, revenue: 450, label: "Serve 10 Androids & $450" },
      star3: { customers: 14, revenue: 600, label: "Serve 14 Androids & $600 (Mastery)" }
    }
  },
  {
    id: 2,
    name: "Sector 2: Neon Plaza Mini-Mart",
    namePt: "Setor 2: Mini-Mercado Praça Neon",
    subtitle: "Nano-Batteries Online • Dual Shelves",
    subtitlePt: "Nano-Baterias Ativas • Prateleiras Duplas",
    difficulty: "Easy",
    diffColor: "#06b6d4",
    shiftTime: 85,
    customerSpawnInterval: 4.2,
    marketWidth: 1100,
    marketHeight: 750,
    playerStart: { x: 550, y: 480 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 180, y: 140, maxStock: 8, interval: 2.2 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 180, y: 320, maxStock: 8, interval: 2.8 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 520, y: 200, maxStock: 8, capacity: 8 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 520, y: 360, maxStock: 8, capacity: 8 }
    ],
    checkouts: [
      { id: 'cash_1', x: 880, y: 460 }
    ],
    starTargets: {
      star1: { customers: 8, revenue: 500, label: "Serve 8 Androids & $500" },
      star2: { customers: 14, revenue: 900, label: "Serve 14 Androids & $900" },
      star3: { customers: 18, revenue: 1200, label: "Serve 18 Androids & $1200" }
    }
  },
  {
    id: 3,
    name: "Sector 3: Cyber-District Outpost",
    namePt: "Setor 3: Posto Avançado Cyber-Distrito",
    subtitle: "VIP Android Rush • Fast Restocking",
    subtitlePt: "Rush de Androides VIP • Reposição Rápida",
    difficulty: "Medium",
    diffColor: "#3b82f6",
    shiftTime: 90,
    customerSpawnInterval: 3.6,
    marketWidth: 1200,
    marketHeight: 780,
    playerStart: { x: 600, y: 500 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 180, y: 140, maxStock: 10, interval: 2.0 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 180, y: 300, maxStock: 10, interval: 2.4 },
      { id: 'fab_plasma', itemType: 'PLASMA', x: 180, y: 460, maxStock: 6, interval: 3.2 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 520, y: 180, maxStock: 10, capacity: 10 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 520, y: 330, maxStock: 10, capacity: 10 },
      { id: 'shelf_plasma', itemType: 'PLASMA', x: 520, y: 480, maxStock: 8, capacity: 8 }
    ],
    checkouts: [
      { id: 'cash_1', x: 920, y: 460 }
    ],
    starTargets: {
      star1: { customers: 10, revenue: 800, label: "Serve 10 Androids & $800" },
      star2: { customers: 16, revenue: 1400, label: "Serve 16 Androids & $1400" },
      star3: { customers: 22, revenue: 1900, label: "Serve 22 Androids & $1900" }
    }
  },
  {
    id: 4,
    name: "Sector 4: Shinjuku Cyber-Hub",
    namePt: "Setor 4: Hub Cibernético Shinjuku",
    subtitle: "Cargo Mechs & Bulk Orders",
    subtitlePt: "Mechs de Carga e Pedidos em Lote",
    difficulty: "Medium",
    diffColor: "#8b5cf6",
    shiftTime: 95,
    customerSpawnInterval: 3.2,
    marketWidth: 1250,
    marketHeight: 800,
    playerStart: { x: 620, y: 520 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 180, y: 150, maxStock: 10, interval: 1.9 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 180, y: 320, maxStock: 10, interval: 2.2 },
      { id: 'fab_plasma', itemType: 'PLASMA', x: 180, y: 490, maxStock: 8, interval: 2.8 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 540, y: 180, maxStock: 10, capacity: 10 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 540, y: 330, maxStock: 10, capacity: 10 },
      { id: 'shelf_plasma', itemType: 'PLASMA', x: 540, y: 480, maxStock: 10, capacity: 10 }
    ],
    checkouts: [
      { id: 'cash_1', x: 950, y: 380 },
      { id: 'cash_2', x: 950, y: 540 }
    ],
    starTargets: {
      star1: { customers: 12, revenue: 1200, label: "Serve 12 Androids & $1200" },
      star2: { customers: 20, revenue: 2000, label: "Serve 20 Androids & $2000" },
      star3: { customers: 26, revenue: 2700, label: "Serve 26 Androids & $2700" }
    }
  },
  {
    id: 5,
    name: "Sector 5: Akihabara Quantum Exchange",
    namePt: "Setor 5: Bolsa Quântica de Akihabara",
    subtitle: "Neural Implants & High Rollers",
    subtitlePt: "Implantes Neurais e Clientes de Elite",
    difficulty: "Hard",
    diffColor: "#ec4899",
    shiftTime: 100,
    customerSpawnInterval: 2.8,
    marketWidth: 1300,
    marketHeight: 820,
    playerStart: { x: 650, y: 520 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 180, y: 120, maxStock: 12, interval: 1.8 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 180, y: 260, maxStock: 12, interval: 2.0 },
      { id: 'fab_plasma', itemType: 'PLASMA', x: 180, y: 400, maxStock: 10, interval: 2.6 },
      { id: 'fab_neural', itemType: 'NEURAL', x: 180, y: 540, maxStock: 8, interval: 3.4 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 540, y: 150, maxStock: 10, capacity: 10 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 540, y: 280, maxStock: 10, capacity: 10 },
      { id: 'shelf_plasma', itemType: 'PLASMA', x: 540, y: 410, maxStock: 10, capacity: 10 },
      { id: 'shelf_neural', itemType: 'NEURAL', x: 540, y: 540, maxStock: 8, capacity: 8 }
    ],
    checkouts: [
      { id: 'cash_1', x: 980, y: 360 },
      { id: 'cash_2', x: 980, y: 520 }
    ],
    starTargets: {
      star1: { customers: 15, revenue: 1800, label: "Serve 15 Androids & $1800" },
      star2: { customers: 24, revenue: 3000, label: "Serve 24 Androids & $3000" },
      star3: { customers: 32, revenue: 4000, label: "Serve 32 Androids & $4000" }
    }
  },
  {
    id: 6,
    name: "Sector 6: Sub-Orbital Mega-Depot",
    namePt: "Setor 6: Mega-Depósito Sub-Orbital",
    subtitle: "Heavy Traffic • Drone Support Crucial",
    subtitlePt: "Tráfego Intenso • Apoio de Drones Essencial",
    difficulty: "Hard",
    diffColor: "#f59e0b",
    shiftTime: 105,
    customerSpawnInterval: 2.5,
    marketWidth: 1350,
    marketHeight: 850,
    playerStart: { x: 680, y: 540 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 190, y: 130, maxStock: 12, interval: 1.6 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 190, y: 270, maxStock: 12, interval: 1.9 },
      { id: 'fab_plasma', itemType: 'PLASMA', x: 190, y: 410, maxStock: 10, interval: 2.4 },
      { id: 'fab_neural', itemType: 'NEURAL', x: 190, y: 550, maxStock: 10, interval: 3.0 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 560, y: 150, maxStock: 12, capacity: 12 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 560, y: 280, maxStock: 12, capacity: 12 },
      { id: 'shelf_plasma', itemType: 'PLASMA', x: 560, y: 410, maxStock: 10, capacity: 10 },
      { id: 'shelf_neural', itemType: 'NEURAL', x: 560, y: 540, maxStock: 10, capacity: 10 }
    ],
    checkouts: [
      { id: 'cash_1', x: 1020, y: 350 },
      { id: 'cash_2', x: 1020, y: 520 }
    ],
    starTargets: {
      star1: { customers: 18, revenue: 2400, label: "Serve 18 Androids & $2400" },
      star2: { customers: 28, revenue: 3800, label: "Serve 28 Androids & $3800" },
      star3: { customers: 36, revenue: 5000, label: "Serve 36 Androids & $5000" }
    }
  },
  {
    id: 7,
    name: "Sector 7: Neo-Tokyo Central Arcade",
    namePt: "Setor 7: Galeria Central Neo-Tokyo",
    subtitle: "Speedy Drone Rush Hours",
    subtitlePt: "Horas de Pico com Drones Velozes",
    difficulty: "Expert",
    diffColor: "#ef4444",
    shiftTime: 110,
    customerSpawnInterval: 2.2,
    marketWidth: 1400,
    marketHeight: 880,
    playerStart: { x: 700, y: 560 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 200, y: 140, maxStock: 14, interval: 1.5 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 200, y: 280, maxStock: 14, interval: 1.8 },
      { id: 'fab_plasma', itemType: 'PLASMA', x: 200, y: 420, maxStock: 12, interval: 2.2 },
      { id: 'fab_neural', itemType: 'NEURAL', x: 200, y: 560, maxStock: 12, interval: 2.7 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 580, y: 160, maxStock: 12, capacity: 12 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 580, y: 290, maxStock: 12, capacity: 12 },
      { id: 'shelf_plasma', itemType: 'PLASMA', x: 580, y: 420, maxStock: 12, capacity: 12 },
      { id: 'shelf_neural', itemType: 'NEURAL', x: 580, y: 550, maxStock: 10, capacity: 10 }
    ],
    checkouts: [
      { id: 'cash_1', x: 1050, y: 340 },
      { id: 'cash_2', x: 1050, y: 510 }
    ],
    starTargets: {
      star1: { customers: 20, revenue: 3000, label: "Serve 20 Androids & $3000" },
      star2: { customers: 32, revenue: 4800, label: "Serve 32 Androids & $4800" },
      star3: { customers: 42, revenue: 6400, label: "Serve 42 Androids & $6400" }
    }
  },
  {
    id: 8,
    name: "Sector 8: Void-Core Nanoplex",
    namePt: "Setor 8: Nanoplexo Núcleo do Vazio",
    subtitle: "High Pressure Nanotech Supply",
    subtitlePt: "Abastecimento sob Alta Pressão",
    difficulty: "Expert",
    diffColor: "#f43f5e",
    shiftTime: 115,
    customerSpawnInterval: 2.0,
    marketWidth: 1400,
    marketHeight: 880,
    playerStart: { x: 700, y: 560 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 200, y: 140, maxStock: 14, interval: 1.4 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 200, y: 280, maxStock: 14, interval: 1.7 },
      { id: 'fab_plasma', itemType: 'PLASMA', x: 200, y: 420, maxStock: 12, interval: 2.0 },
      { id: 'fab_neural', itemType: 'NEURAL', x: 200, y: 560, maxStock: 12, interval: 2.4 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 580, y: 160, maxStock: 14, capacity: 14 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 580, y: 290, maxStock: 14, capacity: 14 },
      { id: 'shelf_plasma', itemType: 'PLASMA', x: 580, y: 420, maxStock: 12, capacity: 12 },
      { id: 'shelf_neural', itemType: 'NEURAL', x: 580, y: 550, maxStock: 12, capacity: 12 }
    ],
    checkouts: [
      { id: 'cash_1', x: 1060, y: 340 },
      { id: 'cash_2', x: 1060, y: 510 }
    ],
    starTargets: {
      star1: { customers: 24, revenue: 3800, label: "Serve 24 Androids & $3800" },
      star2: { customers: 36, revenue: 5800, label: "Serve 36 Androids & $5800" },
      star3: { customers: 48, revenue: 7800, label: "Serve 48 Androids & $7800" }
    }
  },
  {
    id: 9,
    name: "Sector 9: Orbital High-Exchange",
    namePt: "Setor 9: Alta Bolsa Orbital",
    subtitle: "Heavy Volume • Automation Essential",
    subtitlePt: "Volume Pesado • Automação Essencial",
    difficulty: "Master",
    diffColor: "#a855f7",
    shiftTime: 120,
    customerSpawnInterval: 1.8,
    marketWidth: 1450,
    marketHeight: 900,
    playerStart: { x: 720, y: 580 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 200, y: 140, maxStock: 16, interval: 1.3 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 200, y: 280, maxStock: 16, interval: 1.6 },
      { id: 'fab_plasma', itemType: 'PLASMA', x: 200, y: 420, maxStock: 14, interval: 1.9 },
      { id: 'fab_neural', itemType: 'NEURAL', x: 200, y: 560, maxStock: 14, interval: 2.2 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 600, y: 160, maxStock: 16, capacity: 16 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 600, y: 290, maxStock: 16, capacity: 16 },
      { id: 'shelf_plasma', itemType: 'PLASMA', x: 600, y: 420, maxStock: 14, capacity: 14 },
      { id: 'shelf_neural', itemType: 'NEURAL', x: 600, y: 550, maxStock: 14, capacity: 14 }
    ],
    checkouts: [
      { id: 'cash_1', x: 1080, y: 320 },
      { id: 'cash_2', x: 1080, y: 480 },
      { id: 'cash_3', x: 1080, y: 640 }
    ],
    starTargets: {
      star1: { customers: 28, revenue: 4800, label: "Serve 28 Androids & $4800" },
      star2: { customers: 42, revenue: 7200, label: "Serve 42 Androids & $7200" },
      star3: { customers: 55, revenue: 9500, label: "Serve 55 Androids & $9500" }
    }
  },
  {
    id: 10,
    name: "Sector 10: Singularity Hypermarket",
    namePt: "Setor 10: Hipermercado da Singularidade",
    subtitle: "Apex Challenge • Nonstop Android Swarm",
    subtitlePt: "Desafio Ápice • Enxame Incessante de Androides",
    difficulty: "Master",
    diffColor: "#00f5ff",
    shiftTime: 125,
    customerSpawnInterval: 1.6,
    marketWidth: 1500,
    marketHeight: 920,
    playerStart: { x: 740, y: 600 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 210, y: 140, maxStock: 16, interval: 1.2 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 210, y: 280, maxStock: 16, interval: 1.5 },
      { id: 'fab_plasma', itemType: 'PLASMA', x: 210, y: 420, maxStock: 16, interval: 1.8 },
      { id: 'fab_neural', itemType: 'NEURAL', x: 210, y: 560, maxStock: 16, interval: 2.0 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 620, y: 160, maxStock: 16, capacity: 16 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 620, y: 290, maxStock: 16, capacity: 16 },
      { id: 'shelf_plasma', itemType: 'PLASMA', x: 620, y: 420, maxStock: 16, capacity: 16 },
      { id: 'shelf_neural', itemType: 'NEURAL', x: 620, y: 550, maxStock: 16, capacity: 16 }
    ],
    checkouts: [
      { id: 'cash_1', x: 1100, y: 320 },
      { id: 'cash_2', x: 1100, y: 480 },
      { id: 'cash_3', x: 1100, y: 640 }
    ],
    starTargets: {
      star1: { customers: 32, revenue: 6000, label: "Serve 32 Androids & $6000" },
      star2: { customers: 48, revenue: 9000, label: "Serve 48 Androids & $9000" },
      star3: { customers: 64, revenue: 12000, label: "Serve 64 Androids & $12000" }
    }
  },
  {
    id: 11,
    name: "Sector 11: Cyber-Nexus Flagship",
    namePt: "Setor 11: Loja Conceito Cyber-Nexus",
    subtitle: "Overclocked Speed • Elite Patrons",
    subtitlePt: "Velocidade em Overclock • Patronos de Elite",
    difficulty: "Grandmaster",
    diffColor: "#ec4899",
    shiftTime: 130,
    customerSpawnInterval: 1.4,
    marketWidth: 1550,
    marketHeight: 940,
    playerStart: { x: 750, y: 600 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 210, y: 140, maxStock: 18, interval: 1.1 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 210, y: 280, maxStock: 18, interval: 1.3 },
      { id: 'fab_plasma', itemType: 'PLASMA', x: 210, y: 420, maxStock: 18, interval: 1.6 },
      { id: 'fab_neural', itemType: 'NEURAL', x: 210, y: 560, maxStock: 18, interval: 1.8 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 640, y: 160, maxStock: 18, capacity: 18 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 640, y: 290, maxStock: 18, capacity: 18 },
      { id: 'shelf_plasma', itemType: 'PLASMA', x: 640, y: 420, maxStock: 18, capacity: 18 },
      { id: 'shelf_neural', itemType: 'NEURAL', x: 640, y: 550, maxStock: 18, capacity: 18 }
    ],
    checkouts: [
      { id: 'cash_1', x: 1140, y: 300 },
      { id: 'cash_2', x: 1140, y: 470 },
      { id: 'cash_3', x: 1140, y: 640 }
    ],
    starTargets: {
      star1: { customers: 36, revenue: 7500, label: "Serve 36 Androids & $7500" },
      star2: { customers: 54, revenue: 11500, label: "Serve 54 Androids & $11500" },
      star3: { customers: 72, revenue: 15000, label: "Serve 72 Androids & $15000" }
    }
  },
  {
    id: 12,
    name: "Sector 12: Quantum Infinity Mall",
    namePt: "Setor 12: Shopping da Infinidade Quântica",
    subtitle: "The Pinnacle of Neo-Tokyo Commerce",
    subtitlePt: "O Auge do Comércio de Neo-Tokyo",
    difficulty: "Grandmaster",
    diffColor: "#fbbf24",
    shiftTime: 140,
    customerSpawnInterval: 1.3,
    marketWidth: 1600,
    marketHeight: 960,
    playerStart: { x: 780, y: 620 },
    fabricators: [
      { id: 'fab_chip', itemType: 'CHIP', x: 220, y: 140, maxStock: 20, interval: 1.0 },
      { id: 'fab_batt', itemType: 'BATTERY', x: 220, y: 280, maxStock: 20, interval: 1.2 },
      { id: 'fab_plasma', itemType: 'PLASMA', x: 220, y: 420, maxStock: 20, interval: 1.4 },
      { id: 'fab_neural', itemType: 'NEURAL', x: 220, y: 560, maxStock: 20, interval: 1.6 }
    ],
    shelves: [
      { id: 'shelf_chip', itemType: 'CHIP', x: 660, y: 160, maxStock: 20, capacity: 20 },
      { id: 'shelf_batt', itemType: 'BATTERY', x: 660, y: 290, maxStock: 20, capacity: 20 },
      { id: 'shelf_plasma', itemType: 'PLASMA', x: 660, y: 420, maxStock: 20, capacity: 20 },
      { id: 'shelf_neural', itemType: 'NEURAL', x: 660, y: 550, maxStock: 20, capacity: 20 }
    ],
    checkouts: [
      { id: 'cash_1', x: 1180, y: 300 },
      { id: 'cash_2', x: 1180, y: 470 },
      { id: 'cash_3', x: 1180, y: 640 }
    ],
    starTargets: {
      star1: { customers: 40, revenue: 9000, label: "Serve 40 Androids & $9000" },
      star2: { customers: 60, revenue: 14000, label: "Serve 60 Androids & $14000" },
      star3: { customers: 85, revenue: 18500, label: "Serve 85 Androids & $18500" }
    }
  }
];
