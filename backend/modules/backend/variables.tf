variable api_certificate_id {
  type = string
  description = "Certificate id for API"
}
variable deploy_env {
  type = string
  description = "environment to deploy to"
}
variable hosted_zone_id {
  type = string
  description = "Hosted zone id"
}
variable api_url {
  type = string
  description = "API Url for custom domain and DNS record set"
}