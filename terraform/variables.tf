variable "aws_region" {
  description = "AWS region (AWS Academy labs typically use us-east-1)"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Used to name AWS resources"
  type        = string
  default     = "shopmart"
}

variable "container_port" {
  description = "Port the Express server listens on"
  type        = number
  default     = 5001
}

variable "image_tag" {
  description = "Initial image tag baked into the task definition"
  type        = string
  default     = "latest"
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "lab_role_name" {
  description = "AWS Academy LabRole name (used for task execution + task role)"
  type        = string
  default     = "LabRole"
}
