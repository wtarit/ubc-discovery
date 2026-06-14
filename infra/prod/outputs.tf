output "service_name" {
  description = "Lightsail container service name."
  value       = aws_lightsail_container_service.backend.name
}

output "aws_region" {
  description = "AWS Region containing the Lightsail service."
  value       = var.aws_region
}

output "service_url" {
  description = "Default HTTPS URL. It returns 404 until the first deployment."
  value       = aws_lightsail_container_service.backend.url
}
