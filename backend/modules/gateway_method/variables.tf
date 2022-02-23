variable authorization {
  type = string
  description = "method authorization"
  default = "NONE"
}

variable authorizer_id {
  type = string
  description = "authorizer id"
  default = ""
}

variable http_method {
    type = string
    description = "http method"
    default = "ANY"
}

variable api_resource_id {
    type = string
    description = "api gateway resource id"
}

variable rest_api_id {
  type = string
}

variable integration_uri {
    type = string
}
