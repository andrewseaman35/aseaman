variable "role" {
  type        = string
  description = "id of role to attach policy"
}

variable "job_name" {
  type = string
}

variable "deploy_env" {
  type        = string
  description = "environment to deploy to"
}