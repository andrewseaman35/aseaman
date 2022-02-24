variable "env" {
  type        = string
  description = "website environment"
}

variable "callback_urls" {
  type = list(string)
  description = "list of valid callback urls after authentication"
}

variable "default_redirect_uri" {
  type = string
  description = "default callback url after authentication"
}

variable "logout_urls" {
  type = list(string)
  description = "list of valid callback urls after log out"
}