variable branch {
  type = string
  description = "branch being deployed"
}
variable deploy_env {
  type = string
  description = "environment to deploy to"
}
variable api_url {
  type = string
  description = "API Url for custom domain and DNS record set"
}
variable nonce {
  type = string
  description = "nonce it up"
}
variable api_name {
  type = string
  description = "State API Lambda function name"
}
variable hosted_zone_id {
  type = string
  description = "Hosted zone id"
}
variable api_certificate_id {
  type = string
  description = "Certificate id for API"
}
variable path_part {
  type = string
}

variable rest_api_root_resource_id {
  type = string
}
variable rest_api_id {
  type = string
}
