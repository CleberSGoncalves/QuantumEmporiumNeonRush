@echo off
echo [*] Sincronizando backup no GitHub (Quantum Emporium: Neon Rush)...
git add .
git commit -m "feat: release completa de Quantum Emporium: Neon Rush com 12 setores, CrazyGames SDK v3, Land in Gameplay, FluidCleb intro, Web Audio procedural, automacoes e game juice"
git push -u origin main
echo [OK] Backup concluido com sucesso no GitHub!
