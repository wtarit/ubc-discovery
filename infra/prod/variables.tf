variable "aws_region" {
  description = "AWS Region for the Lightsail service."
  type        = string
  default     = "us-west-2"
}

variable "service_name" {
  description = "Unique Lightsail container service name."
  type        = string
  default     = "ubc-discovery-backend"
}

variable "power" {
  description = "Compute size for each Lightsail node."
  type        = string
  default     = "micro"

  validation {
    condition     = contains(["nano", "micro", "small", "medium", "large", "xlarge"], var.power)
    error_message = "power must be nano, micro, small, medium, large, or xlarge."
  }
}

variable "scale" {
  description = "Number of Lightsail nodes."
  type        = number
  default     = 1

  validation {
    condition     = var.scale >= 1 && var.scale <= 20
    error_message = "scale must be between 1 and 20."
  }
}
