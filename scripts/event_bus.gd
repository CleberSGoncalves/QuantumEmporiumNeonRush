extends Node

## Barramento Global de Eventos (EventBus Autoload Godot 4.7.2)

signal item_produced(fabricator_id: String, item_type: String)
signal item_collected(player: Node2D, item_type: String)
signal shelf_restocked(shelf_id: String, item_type: String)
signal customer_spawned(customer_id: String, desired_item: String)
signal transaction_completed(revenue: int, customer_type: String)
signal star_milestone_reached(star_number: int)
signal sector_completed(sector_id: int, stars: int, revenue: int)
signal sector_failed(sector_id: int)
