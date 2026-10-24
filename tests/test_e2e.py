# scratch_test_e2e.py
import os
import sys
import time
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def run_e2e_test():
    dist_dir = os.path.abspath("dist")
    print(f"[*] Serving build from: {dist_dir}")

    # Start ephemeral in-process HTTP server
    original_cwd = os.getcwd()
    os.chdir(dist_dir)

    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass

    server = HTTPServer(('127.0.0.1', 0), QuietHandler)
    port = server.server_port
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    print(f"[*] Test HTTP server active on http://127.0.0.1:{port}/")

    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1280,720")
    chrome_options.set_capability("goog:loggingPrefs", {"browser": "ALL"})

    driver = webdriver.Chrome(options=chrome_options)

    try:
        driver.get(f"http://127.0.0.1:{port}/")
        time.sleep(1.0)

        # 1. Page Title & Canvas Verification
        title = driver.title
        print(f"[OK] Page title verified: {title.encode('ascii', 'replace').decode('ascii')}")
        assert "Quantum Emporium" in title, f"Unexpected title: {title}"

        canvas = driver.find_element(By.ID, "game-canvas")
        print(f"[OK] Canvas initialized: {canvas.size}")
        assert canvas.size['width'] > 0 and canvas.size['height'] > 0

        # 2. Wait for FluidCleb intro to transition to Lore modal (3.2s)
        print("[*] Waiting for FluidCleb splash transition (3.2s)...")
        time.sleep(3.2)

        lore_modal = driver.find_element(By.ID, "lore-overlay")
        assert "hidden" not in lore_modal.get_attribute("class"), "Lore overlay should be displayed"
        print("[OK] Lore presentation active.")

        # 3. Click 'INICIAR TURNO' to Land in Gameplay with 1 click
        btn_start = driver.find_element(By.ID, "btn-lore-start")
        driver.execute_script("arguments[0].click();", btn_start)
        time.sleep(0.6)

        assert "hidden" in lore_modal.get_attribute("class"), "Lore overlay should be closed"
        print("[OK] Landed in active gameplay cleanly.")

        # 4. HUD Integrity Check
        sector_title = driver.find_element(By.ID, "hud-sector-title").text
        timer_val = driver.find_element(By.ID, "hud-timer-val").text
        credits_val = driver.find_element(By.ID, "hud-credits-val").text
        backpack_val = driver.find_element(By.ID, "hud-backpack-val").text
        print(f"[OK] HUD Info -> Sector: '{sector_title.encode('ascii', 'replace').decode('ascii')}', Timer: '{timer_val}', Credits: '{credits_val}', Backpack: '{backpack_val}'")

        # 5. Simulate Gameplay running
        time.sleep(2.5)

        # 6. Test Opening & Closing Sectors Modal (Anti-Softlock)
        btn_menu = driver.find_element(By.ID, "btn-open-menu")
        driver.execute_script("arguments[0].click();", btn_menu)
        time.sleep(0.5)
        modal_sectors = driver.find_element(By.ID, "modal-level-select")
        assert "hidden" not in modal_sectors.get_attribute("class"), "Sectors modal should be open"
        print("[OK] Sectors modal opened.")

        sector_cards = driver.find_elements(By.CLASS_NAME, "sector-card")
        print(f"[OK] Verified {len(sector_cards)} sectors in grid (Expected: 12).")
        assert len(sector_cards) >= 12, f"Expected 12 sectors, found {len(sector_cards)}"

        btn_close_menu = driver.find_element(By.ID, "btn-close-menu")
        driver.execute_script("arguments[0].click();", btn_close_menu)
        time.sleep(0.5)
        assert "hidden" in modal_sectors.get_attribute("class"), "Sectors modal should be closed"
        print("[OK] Sectors modal closed cleanly without softlock.")

        # 7. Test Opening & Closing Upgrades Modal
        btn_upgrades = driver.find_element(By.ID, "btn-open-upgrades")
        driver.execute_script("arguments[0].click();", btn_upgrades)
        time.sleep(0.5)
        modal_upgrades = driver.find_element(By.ID, "modal-upgrades")
        assert "hidden" not in modal_upgrades.get_attribute("class"), "Upgrades modal should be open"
        print("[OK] Upgrades modal opened.")

        upgrade_cards = driver.find_elements(By.CLASS_NAME, "upgrade-card")
        print(f"[OK] Verified {len(upgrade_cards)} upgrade categories in shop.")
        assert len(upgrade_cards) >= 5, f"Expected at least 5 upgrade cards, found {len(upgrade_cards)}"

        btn_close_upgrades = driver.find_element(By.ID, "btn-close-upgrades")
        driver.execute_script("arguments[0].click();", btn_close_upgrades)
        time.sleep(0.5)
        assert "hidden" in modal_upgrades.get_attribute("class"), "Upgrades modal should be closed"
        print("[OK] Upgrades modal closed cleanly.")

        # 8. Test Opening & Closing Skin Shop Modal
        btn_skins = driver.find_element(By.ID, "btn-open-skins")
        driver.execute_script("arguments[0].click();", btn_skins)
        time.sleep(0.5)
        modal_skins = driver.find_element(By.ID, "modal-skins")
        assert "hidden" not in modal_skins.get_attribute("class"), "Skins modal should be open"
        skin_cards = driver.find_elements(By.CLASS_NAME, "skin-card")
        print(f"[OK] Skin Shop opened. Verified {len(skin_cards)} available skins.")
        assert len(skin_cards) >= 4, f"Expected at least 4 skins, found {len(skin_cards)}"

        btn_close_skins = driver.find_element(By.ID, "btn-close-skins")
        driver.execute_script("arguments[0].click();", btn_close_skins)
        time.sleep(0.5)
        assert "hidden" in modal_skins.get_attribute("class"), "Skins modal should be closed"
        print("[OK] Skin Shop closed cleanly.")

        # 9. Test Opening & Closing Missions Modal
        btn_missions = driver.find_element(By.ID, "btn-open-missions")
        driver.execute_script("arguments[0].click();", btn_missions)
        time.sleep(0.5)
        modal_missions = driver.find_element(By.ID, "modal-missions")
        assert "hidden" not in modal_missions.get_attribute("class"), "Missions modal should be open"
        mission_cards = driver.find_elements(By.CLASS_NAME, "mission-card")
        print(f"[OK] Missions modal opened. Verified {len(mission_cards)} corporate missions.")
        assert len(mission_cards) >= 4, f"Expected at least 4 missions, found {len(mission_cards)}"

        btn_close_missions = driver.find_element(By.ID, "btn-close-missions")
        driver.execute_script("arguments[0].click();", btn_close_missions)
        time.sleep(0.5)
        assert "hidden" in modal_missions.get_attribute("class"), "Missions modal should be closed"
        print("[OK] Missions modal closed cleanly.")

        # 10. Test Mobile Portrait Viewport & Rule #6 Anti-Overlapping Dock
        print("[*] Testing Mobile Portrait Mode (390x844)...")
        driver.set_window_size(390, 844)
        time.sleep(1.0)
        container = driver.find_element(By.ID, "game-container")
        container_class = container.get_attribute("class")
        assert "portrait-mode" in container_class, "game-container must have 'portrait-mode' class in portrait"
        print("[OK] Rule #6 validated: portrait-mode class successfully activated.")

        mobile_controls = driver.find_element(By.CLASS_NAME, "mobile-controls")
        assert mobile_controls.is_displayed(), "Mobile controls dock must be visible in mobile portrait"
        dock_height = mobile_controls.size['height']
        print(f"[OK] Mobile dock height: {dock_height}px (Rule #6 requires ~115px dedicated dock)")
        assert dock_height >= 100, f"Expected dock height >= 100px, got {dock_height}"

        # Restore desktop window size
        driver.set_window_size(1280, 720)
        time.sleep(0.8)

        # 11. Test Language Toggle
        btn_lang = driver.find_element(By.ID, "btn-lang-toggle")
        driver.execute_script("arguments[0].click();", btn_lang)
        time.sleep(0.4)
        lang_text = btn_lang.text
        print(f"[OK] Language toggle clicked. Button is now: '{lang_text.encode('ascii', 'replace').decode('ascii')}'")

        # 12. Test Sound Toggle
        btn_sound = driver.find_element(By.ID, "btn-sound-toggle")
        driver.execute_script("arguments[0].click();", btn_sound)
        time.sleep(0.4)
        sound_icon = btn_sound.text
        print(f"[OK] Sound toggle clicked. Icon is now: '{sound_icon.encode('ascii', 'replace').decode('ascii')}'")

        # 13. Check Console Logs
        logs = driver.get_log("browser")
        severe_errors = [entry for entry in logs if entry.get("level") == "SEVERE"]
        print(f"[*] Total browser logs: {len(logs)}, Severe errors: {len(severe_errors)}")
        for entry in logs:
            if entry.get("level") in ["SEVERE", "WARNING"]:
                print(f"    [{entry.get('level')}] {entry.get('message').encode('ascii', 'replace').decode('ascii')}")

        assert len(severe_errors) == 0, f"Found severe console errors: {severe_errors}"
        print("[SUCCESS] All E2E automated checks PASSED with 0 errors!")

    finally:
        driver.quit()
        server.shutdown()
        os.chdir(original_cwd)

if __name__ == "__main__":
    run_e2e_test()
