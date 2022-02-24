terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket  = "aseaman-tf-state"
    key     = "aseaman-website/stage.tfstate"
    profile = "aseaman"
    region  = "us-east-1"
  }

  required_version = ">= 0.14.9"
}


provider "aws" {
  profile = "aseaman"
  region  = "us-east-1"

  default_tags {
    tags = {
      Environment = "Stage"
      Repo        = "aseaman"
    }
  }
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  aws_region     = data.aws_region.current.name
  aws_account_id = data.aws_caller_identity.current.account_id
}

module "auth" {
  source = "../../modules/auth"
  env    = var.deploy_env

  default_redirect_uri = "https://${var.deploy_env}.andrewcseaman.com/auth_callback.html"
  callback_urls = [
    "http://localhost:8123/auth_callback.html",
    "https://${var.deploy_env}.andrewcseaman.com/auth_callback.html"
  ]
  logout_urls = [
    "http://localhost:8123/logout.html",
    "https://${var.deploy_env}.andrewcseaman.com/logout.html"
  ]
}

module "backend" {
  source                = "../../modules/backend"
  api_certificate_id    = var.api_certificate_id
  deploy_env            = var.deploy_env
  hosted_zone_id        = var.hosted_zone_id
  api_url               = var.api_url
  cognito_user_pool_arn = module.auth.cognito_user_pool_arn

  depends_on = [module.auth]
}

module "exports" {
  source                      = "../../modules/exports"
  env                         = var.deploy_env
  cognito_user_pool_client_id = module.auth.cognito_user_pool_client_id
}