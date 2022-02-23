variable env {
  type = string
  description = "website environment"
}

variable callback_urls {
  type    = list(string)
}

variable default_redirect_uri {
  type = string
}

variable logout_urls {
  type    = list(string)
}