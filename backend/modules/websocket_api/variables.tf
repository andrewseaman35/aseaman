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
  description = "API Lambda function name"
}
variable "path_part" {
  type = string
}
variable "api_id" {
  type = string
}
variable "execution_arn" {
  type = string
  description = "exeuction_arn of ws api"
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



variable "layers" {
  type    = list
  default = []
  description = "list of arns of the layers to apply"
}

variable "table_name" {
  type        = string
  description = "DynamoDB table name"
  default     = "ws_connection_stage"
}