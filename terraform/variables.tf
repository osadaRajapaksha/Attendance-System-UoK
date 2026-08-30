variable "aws_region" {
  description = "The AWS region to deploy in"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "The name of the project"
  type        = string
  default     = "attendance-system-uok"
}

variable "instance_type" {
  description = "EC2 instance type for the backend"
  type        = string
  default     = "t2.micro"
}
