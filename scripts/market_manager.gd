extends Node
class_name MarketManager

## Gerenciador de Economia e Turnos do Quantum Emporium (Godot 4.7.2)

@export var current_sector: int = 1
@export var shift_time: float = 90.0

var shift_revenue: int = 0
var customers_served: int = 0
var stars_earned: int = 0
var is_active: bool = false

func start_shift() -> void:
	shift_revenue = 0
	customers_served = 0
	stars_earned = 0
	is_active = true

func record_sale(amount: int, customer_type: String) -> void:
	shift_revenue += amount
	customers_served += 1
	EventBus.transaction_completed.emit(amount, customer_type)

func complete_shift() -> void:
	is_active = false
	EventBus.sector_completed.emit(current_sector, stars_earned, shift_revenue)
