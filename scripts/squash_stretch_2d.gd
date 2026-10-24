extends Node
class_name SquashStretch2D

## Componente Procedural de Squash & Stretch com Mola e Amortecimento

@export var target_node: Node2D
@export var stiffness: float = 280.0
@export var damping: float = 18.0

var scale_x: float = 1.0
var scale_y: float = 1.0
var velocity_x: float = 0.0
var velocity_y: float = 0.0

func _process(delta: float) -> void:
	if not target_node:
		return
	var fx: float = -stiffness * (scale_x - 1.0) - damping * velocity_x
	var fy: float = -stiffness * (scale_y - 1.0) - damping * velocity_y

	velocity_x += fx * delta
	velocity_y += fy * delta

	scale_x += velocity_x * delta
	scale_y += velocity_y * delta

	target_node.scale = Vector2(scale_x, scale_y)

func apply_squash(amount: float = 0.25) -> void:
	scale_x = 1.0 + amount
	scale_y = 1.0 - amount * 0.7
	velocity_x = 0.0
	velocity_y = 0.0

func apply_stretch(amount: float = 0.25) -> void:
	scale_x = 1.0 - amount * 0.7
	scale_y = 1.0 + amount
	velocity_x = 0.0
	velocity_y = 0.0
