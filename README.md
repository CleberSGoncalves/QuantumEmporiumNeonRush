# 💎 Quantum Emporium: Neon Rush

> 🎮 Jogo Arcade Idle / Gestão em Tempo Real Cyberpunk 100% homologado para **CrazyGames** e **Kinomuse Games**.

- **URL Pública de Produção**: [https://quantumemporiumneonrush.kinomuse.com.br](https://quantumemporiumneonrush.kinomuse.com.br)
- **Título Comercial**: Quantum Emporium: Neon Rush
- **Gênero / Estilo**: Arcade Idle / Gestão em Tempo Real Top-Down
- **Stack Tecnológica**: HTML5 Canvas WebGL + Vite (Bundle ≤ 100KB) + Módulos GDScript 2.0 (Godot Engine 4.7.2)
- **Marca Oficial**: Desenvolvido sob o selo **FluidCleb Interactive**
- **Selo CrazyGames**: Homologação total CrazyGames SDK v3 (Ads Watchdog 2.5s, Mute Automático, Rewarded Ads e Land in Gameplay)

---

## ⚡ 1. Lore & Ambientação
Gerencie o maior entreposto de nanotecnologia e suprimentos cibernéticos de Neo-Tokyo em 2088. Androides civis, mechs de carga pesada, drones velozes e clientes VIP corporativos chegam sem parar buscando chips quânticos, baterias de nanites, núcleos de plasma e implantes neurais. Corra contra o tempo para abastecer prateleiras holográficas e faturar pilhas de créditos nos caixas quânticos!

---

## 🕹️ 2. Core Gameplay Loop & Controles
1. **Mover em 360°**: Teclado (`W, A, S, D` ou Setas) no Desktop; Joystick Virtual Touch no Mobile. `Espaço / Shift / Botão Dash` para arranque supersônico.
2. **Coletar Suprimentos**: Aproxime-se das esteiras dos Nano-Fabricadores para carregar peças na mochila magnética.
3. **Abastecer Prateleiras**: Descarregue as peças nas prateleiras holográficas antes que a paciência dos androides se esgote.
4. **Atender nos Caixas**: Processe as compras no balcão quântico para recolher pilhas de créditos e gorjetas VIP.
5. **Automação & Expansão**: Compre drones entregadores autônomos, caixas eletrônicos holográficos, upgrades de velocidade e desbloqueie 12 setores comerciais de Neo-Tokyo!

---

## 🌟 3. Sistema de Avaliação por Estrelas (1★, 2★, 3★)
- **★ 1 Estrela**: Cumpre a cota básica de clientes e receita. Acende o botão pulsante `✅ CONCLUIR FASE (★) ➔` no HUD imediatamente, permitindo encerrar e avançar a qualquer momento.
- **★★ 2 Estrelas**: Bônus de turno avançado.
- **★★★ 3 Estrelas**: Mestria absoluta com chuva de confetes neon e vitória máxima instantânea.

---

## 🛡️ 4. Arquitetura e Engenharia Anti-Softlock
- **ModalController Centralizado**: Máquina de estados que impede colisões de pausa/fim de turno (`isPaused` vs `isRoundOver`).
- **CrazyGames SDK v3**: Watchdog de 2.5s em anúncios e `finally` incondicional que restaura física e áudio.
- **Web Audio API Procedural**: Sintetizador em tempo real para efeitos e trilha sonora synthwave, com zero arquivos externos e zero 404s.
- **Trauma² Camera Shake & Juice**: Feedback visceral em caixas registradoras, squash & stretch elástico nas prateleiras e partículas elétricas.

---

## 🚀 5. Comandos de Build & Teste
```bash
# Instalar dependências
npm install

# Compilar build de produção (Vite base: './')
npm run build

# Executar suíte de testes E2E automatizados (Selenium Headless)
python tests/test_e2e.py
```
