extends Camera2D
class_name JuiceCamera2D

## Câmera com Trauma² Screen Shake e Amortecimento Suave (Godot 4.7.2)

@export var max_offset: Vector2 = Vector2(25, 25)
@export var max_roll: float = 0.08
@export var trauma_decay: float = 1.6

var trauma: float = 0.0
var time: float = 0.0

func _process(delta: float) -> void:
	time += delta * 50.0
	if trauma > 0.0:
		trauma = max(0.0, trauma - trauma_decay * delta)
		_apply_shake()
	else:
		offset = Vector2.ZERO
		rotation = 0.0

func add_trauma(amount: float) -> void:
	trauma = clamp(trauma + amount, 0.0, 1.0)

func _apply_shake() -> void:
	# Trauma² exponencial para sensação visceral
	var shake: float = trauma * trauma
	offset = Vector2(
		randf_range(-1.0, 1.0) * max_offset.x * shake,
		randf_range(-1.0, 1.0) * max_offset.y * shake
	)
	rotation = randf_range(-1.0, 1.0) * max_roll * shake
