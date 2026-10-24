extends Node

## Gerenciador de Salvamento Atômico (Godot 4.7.2)

const SAVE_PATH: String = "user://quantum_emporium_save.json"

var credits: int = 200
var unlocked_sector: int = 1
var upgrades: Dictionary = {
	"player_speed": 1,
	"backpack_capacity": 1,
	"helper_drone": 0,
	"auto_cashier": 0,
	"overclock": 0
}

func save_data() -> void:
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		var data = {
			"credits": credits,
			"unlocked_sector": unlocked_sector,
			"upgrades": upgrades
		}
		file.store_string(JSON.stringify(data))

func load_data() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file:
		var content = file.get_as_text()
		var parsed = JSON.parse_string(content)
		if parsed is Dictionary:
			credits = parsed.get("credits", credits)
			unlocked_sector = parsed.get("unlocked_sector", unlocked_sector)
			upgrades = parsed.get("upgrades", upgrades)
