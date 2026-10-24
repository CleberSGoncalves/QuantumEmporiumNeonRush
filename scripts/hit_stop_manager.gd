extends Node
class_name HitStopManager

## Gerenciador Central de Hit-Stop (Micro-pausas para Impacto e Sucesso)

static var instance: HitStopManager

func _enter_tree() -> void:
	instance = self

static func hit_stop(duration_ms: int = 50) -> void:
	if not instance:
		return
	instance._do_hit_stop(duration_ms)

func _do_hit_stop(duration_ms: int) -> void:
	Engine.time_scale = 0.05
	await get_tree().create_timer(duration_ms / 1000.0, true, false, true).timeout
	Engine.time_scale = 1.0
