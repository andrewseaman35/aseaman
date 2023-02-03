variable "api_certificate_id" {
  type        = string
  description = "Certificate id for API"
}
variable "deploy_env" {
  type        = string
  description = "environment to deploy to"
}
variable "hostname" {
  type        = string
  description = "site hostname"
}
variable "hosted_zone_id" {
  type        = string
  description = "Hosted zone id"
}
variable "api_url" {
  type        = string
  description = "API Url for custom domain and DNS record set"
}

variable "cognito_user_pool_arn" {
  type = string
}

variable "cognito_user_pool_id" {
  type = string
}

variable "cognito_user_groups" {
  type = map
  default = {}
}