resource "aws_lightsail_container_service" "backend" {
  name        = var.service_name
  power       = var.power
  scale       = var.scale
  is_disabled = false
}
