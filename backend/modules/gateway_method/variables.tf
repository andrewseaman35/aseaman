variable "authorization" {
  type        = string
  description = "method authorization type [NONE, COGNITO_USER_POOLS]"
  default     = "NONE"
}

variable "authorizer_id" {
  type        = string
  description = "authorizer id"
  default     = ""
}

variable "http_method" {
  type        = string
  description = "http method"
  default     = "ANY"
}

variable "api_resource_id" {
  type        = string
  description = "api gateway resource id"
}

variable "rest_api_id" {
  type        = string
  description = "id of rest api to associate gateway method"
}

variable "integration_uri" {
  type        = string
  description = "uri for gateway integration"
}
