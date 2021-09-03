variable zip_file {
  type = string
  description = "path to zip file"
}
variable deploy_env {
  type = string
  description = "environment to deploy to"
}
variable api_name {
  type = string
  description = "State API Lambda function name"
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

variable lambda_timeout {
  description = "Lambda function timeout"
  type = number
  default = 5
}