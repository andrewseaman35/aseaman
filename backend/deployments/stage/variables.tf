variable "api_certificate_id" {
  type        = string
  description = "Certificate id for API"
  default     = "950a537e-44e0-4870-9236-f678f952a6b9"
}
variable "deploy_env" {
  type        = string
  description = "environment to deploy to"
  default     = "stage"
}
variable "hosted_zone_id" {
  type        = string
  description = "Hosted zone id"
  default     = "Z1NTL75ESDHPUU"
}
variable "api_url" {
  type        = string
  description = "API Url for custom domain and DNS record set"
  default     = "api.stage.andrewcseaman.com"
}
