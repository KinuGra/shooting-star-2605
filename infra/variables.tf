variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "shooting-star"
}

variable "backend_image" {
  description = "Backend ECR image URI"
  type        = string
}

variable "frontend_image" {
  description = "Frontend ECR image URI"
  type        = string
}

variable "backend_cpu" {
  description = "Backend container CPU units"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Backend container memory (MiB)"
  type        = number
  default     = 512
}

variable "frontend_cpu" {
  description = "Frontend container CPU units"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Frontend container memory (MiB)"
  type        = number
  default     = 512
}
