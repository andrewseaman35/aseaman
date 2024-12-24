variable "zip_file" {
  type        = string
  description = "path to zip file"
}
variable "deploy_env" {
  type        = string
  description = "environment to deploy to"
}
variable "job_name" {
  type        = string
  description = "Job Lambda function name"
}

variable "lambda_timeout" {
  description = "Lambda function timeout"
  type        = number
  default     = 5
}

variable "bucket_name" {
  description = "Name of triggering bucket"
  type        = string
}

variable "bucket_arn" {
  description = "ARN of triggering bucket"
  type        = string
}

variable "prefix" {
  description = "Prefix to trigger"
  type        = string
}

variable "layers" {
  type    = list
  default = []
  description = "list of arns of the layers to apply"
}