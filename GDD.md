# 🎮 GDD — Quantum Emporium: Neon Rush

**Nome Comercial**: Quantum Emporium: Neon Rush  
**Gênero / Estilo**: Arcade Idle / Gestão em Tempo Real Top-Down  
**Plataforma Alvo**: CrazyGames (HTML5 / WebGL) & Kinomuse Games  
**URL de Entrega / Produção**: [https://quantumemporiumneonrush.kinomuse.com.br](https://quantumemporiumneonrush.kinomuse.com.br)  
**Stack Tecnológica**: HTML5 Canvas / WebGL (Vite base: './') + Módulos GDScript 2.0 (Godot Engine 4.7.2)  
**Data de Concepção**: 24/10/2026 01:50  
**Marca**: Desenvolvido sob o selo **FluidCleb Interactive**  

---

## 🌟 1. Identidade de Marca & Introdução Obrigatória
1. **Intro FluidCleb Interactive (0.0s a 2.8s)**:
   - Splash Screen procedural em Canvas obrigatória idêntica aos títulos de referência (*Sobrevivente da Névoa* e *Hydrologic*).
   - Orbes de energia azul subindo (`#00f5ff`, `#38bdf8`), fusão central com áudio sintético procedural (`playFluidClebIntro()`), emblema da gota d'água metálica (`#94a3b8`), logo em neon `FLUIDCLEB` (36px) e subtítulo `INTERACTIVE` (13px), com barra de progresso suave e skip imediato ao toque.
2. **Land in Gameplay & Lore Interativa (<= 1 Clique)**:
   - Exibida logo após a intro da FluidCleb.
   - Apresentação em cartão neon futurista narrando os 4 passos de gerenciamento do entreposto em Neo-Tokyo, com botões bem visíveis 'Pular História (Skip)' e 'Iniciar Turno ➔', cumprindo a diretriz CrazyGames de entrada imediata na partida.

---

## 📖 2. Lore, Ambientação & Premissa
Gerencie o maior mercado de nanotecnologia e suprimentos cibernéticos de Neo-Tokyo em 2088, correndo contra o tempo para abastecer androides exigentes.

---

## ⚡ 3. Core Gameplay Loop & Controles
1. **Mover o personagem em 360°**: Teclado (`W, A, S, D` ou Setas) e Joystick Virtual Touch no celular. Botão `DASH ⚡` para arranque rápido.
2. **Coletar produtos nas esteiras dos Nano-Fabricadores**:
   - 🔷 **Chips Quânticos** (`#00f5ff`, valor $45)
   - 🔋 **Nano-Baterias** (`#22c55e`, valor $70)
   - 🟣 **Núcleos de Plasma** (`#c084fc`, valor $110)
   - 🔶 **Implantes Neurais** (`#facc15`, valor $175)
3. **Abastecer prateleiras holográficas**: Descarregar suprimentos nas prateleiras antes que a barra de paciência dos androides clientes se esgote.
4. **Atender no balcão quântico**: Processar clientes na fila para faturar pilhas de créditos e bônus de gorjeta VIP.
5. **Automações e Upgrades**:
   - Velocidade do Gerente (+15% por nível)
   - Capacidade da Mochila (3 a 12 itens empilhados)
   - Drone Entregador Autônomo (reabastece prateleiras sozinho)
   - Caixa Automático (atende clientes automaticamente)
   - Overclock das Esteiras (+25% de velocidade de produção)

---

## 🗺️ 4. Setores Comerciais (12 Níveis Handcrafted)
1. **Setor 1: Quiosque Nanotech de Beco** — Treinamento inicial com Chips Quânticos.
2. **Setor 2: Mini-Mercado Praça Neon** — Introdução de Nano-Baterias e prateleiras duplas.
3. **Setor 3: Posto Avançado Cyber-Distrito** — Núcleos de Plasma e clientes VIP.
4. **Setor 4: Hub Cibernético Shinjuku** — Mechs de carga pesada e múltiplos caixas.
5. **Setor 5: Bolsa Quântica de Akihabara** — Implantes Neurais e compras em grande escala.
6. **Setor 6: Mega-Depósito Sub-Orbital** — Tráfego intenso com suporte de drones.
7. **Setor 7: Galeria Central Neo-Tokyo** — Horas de pico com drones clientes velozes.
8. **Setor 8: Nanoplexo Núcleo do Vazio** — Alta demanda e pressão de tempo.
9. **Setor 9: Alta Bolsa Orbital** — Volume maciço e múltiplos guichês.
10. **Setor 10: Hipermercado da Singularidade** — Desafio mestre contra enxames de androides.
11. **Setor 11: Loja Conceito Cyber-Nexus** — Produção ultrarrápida e clientes de elite.
12. **Setor 12: Shopping da Infinidade Quântica** — O ápice do império comercial cibernético.

---

## 🌟 5. Sistema de 1★, 2★ e 3★ com Botão de Conclusão Instantânea
- **★ 1 Estrela**: Requisito mínimo de aprovação do turno. Acende imediatamente o botão verde pulsante `✅ CONCLUIR FASE (★) ➔` no topo do HUD. O jogador escolhe se conclui na hora ou continua para buscar marcas maiores.
- **★★ 2 Estrelas**: Meta intermediária de alto faturamento.
- **★★★ 3 Estrelas**: Mestria do setor, acionando fogos de artifício neon e vitória máxima automática.
- Se o cronômetro do turno zerar tendo ao menos 1★ obtida, conclui em Vitória com as estrelas conquistadas.

---

## 💰 6. Estratégia de Monetização (CrazyGames SDK v3)
- **Rewarded Ad 1 (Recuperação de Turno)**: `⚡ +30s TURBO RUSH` ao esgotar o tempo sem estrelas.
- **Rewarded Ad 2 (Multiplicador de Lucro)**: `🎁 DOBRAR CRÉDITOS (2X)` na tela de vitória.
- **Proteção Anti-AdBlock**: Se ocorrer `adError`, nunca concede a recompensa. Recompensa liberada estritamente em `adFinished`.
- **Midgame Ads**: Apenas entre partidas e troca de setores (cooldown de 3.5 minutos), nunca durante o gameplay ativo.
- **Watchdog de 2.5s**: Trava de segurança que destrava o loop de jogo se o SDK demorar para responder.

---

## 💎 7. Metodologia Rian — Homologação de Produção
1. **HUD Flutuante Edge-to-Edge**: Canvas em 100vw/100dvh com safe areas, HUD flutuante (`pointer-events: none`) e controles touch sem sobrepor a área de jogo.
2. **Gerenciador de Modais Anti-Softlock**: Fechar modais no `✕` restaura o estado anterior de jogo sem congelar a física.
3. **Web Audio API Procedural**: Efeitos sonoros ricos (cha-ching, caixas, pickups, faíscas) e trilha synthwave sem arquivos externos.
4. **Game Juice & Feel**: Screen Shake Trauma², hit-stop de 45ms em vendas e squash & stretch físico.
5. **Redimensionamento Adaptativo**: Gerenciado dinamicamente com suporte a DPR alto.
6. **Rodapé Oficial**: Link oficial para https://kinomuse.com.br.
