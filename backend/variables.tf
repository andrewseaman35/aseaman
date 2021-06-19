variable api_certificate_id {
  type = string
  description = "Certificate id for API"
  default = "bc74e242-e6b1-4d85-9c7e-318c328340fb"
}
variable deploy_env {
  type = string
  description = "environment to deploy to"
  default = "live"
}
variable hosted_zone_id {
  type = string
  description = "Hosted zone id"
  default = "Z1NTL75ESDHPUU"
}
variable api_url {
  type = string
  description = "API Url for custom domain and DNS record set"
  default = "test-api.live.andrewcseaman.com"
}
variable nonce {
  type = string
  description = "nonce it up"
  default = "1619239047"
}
