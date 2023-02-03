variable "zip_file" {
  type        = string
  description = "path to zip file"
}
variable "deploy_env" {
  type        = string
  description = "environment to deploy to"
}
variable "hostname" {
  type        = string
  description = "site hostname"
  default     = "stage.andrewcseaman.com"
}
variable "api_name" {
  type        = string
  description = "State API Lambda function name"
}
variable "path_part" {
  type = string
}
variable "rest_api_root_resource_id" {
  type = string
}
variable "rest_api_id" {
  type = string
}

variable "lambda_timeout" {
  description = "Lambda function timeout"
  type        = number
  default     = 5
}

variable "cognito_user_pool_arn" {
  type        = string
  description = "arn of cognito user pool for authorization"
}

variable "cognito_user_pool_id" {
  type        = string
  description = "id of cognito user pool for authorization"
}

variable "cognito_user_groups" {
  type        = map
  description = "user groups to set up for this api"
  default     = {}
}

variable "get_method_authorization" {
  type    = string
  default = "COGNITO_USER_POOLS"
}

variable "post_method_authorization" {
  type    = string
  default = "COGNITO_USER_POOLS"
}

variable "put_method_authorization" {
  type    = string
  default = "COGNITO_USER_POOLS"
}

variable "delete_method_authorization" {
  type    = string
  default = "COGNITO_USER_POOLS"
}

variable "get_proxy_method_authorization" {
  type    = string
  default = "COGNITO_USER_POOLS"
}

variable "post_proxy_method_authorization" {
  type    = string
  default = "COGNITO_USER_POOLS"
}

variable "put_proxy_method_authorization" {
  type    = string
  default = "COGNITO_USER_POOLS"
}

variable "delete_proxy_method_authorization" {
  type    = string
  default = "COGNITO_USER_POOLS"
}

variable "layers" {
  type    = list
  default = []
  description = "list of arns of the layers to apply"
}