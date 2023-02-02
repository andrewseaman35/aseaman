variable "env" {
  type        = string
  description = "website environment"
}

variable "cognito_user_pool_client_id" {
  type = string
}

variable "cognito_user_pool_id" {
  type = string
}

variable "cognito_identity_pool_id" {
  type = string
}