terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
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
      Project     = "website"
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

  default_redirect_uri = "https://${var.deploy_env}.andrewcseaman.com/auth_callback"
  callback_urls = [
    "http://localhost:8123/auth_callback",
    "https://${var.deploy_env}.andrewcseaman.com/auth_callback"
  ]
  logout_urls = [
    "http://localhost:8123/logout",
    "https://${var.deploy_env}.andrewcseaman.com/logout"
  ]
}

module "backend" {
  source                = "../../modules/backend"
  api_certificate_id    = var.api_certificate_id
  deploy_env            = var.deploy_env
  hostname              = var.hostname
  hosted_zone_id        = var.hosted_zone_id
  api_url               = var.api_url
  cognito_user_pool_arn = module.auth.cognito_user_pool_arn
  cognito_user_pool_id  = module.auth.cognito_user_pool_id

  depends_on = [module.auth]
}

module "splitomatic_job" {
  source         = "../../modules/s3_lambda_function"
  zip_file       = "../../jobs/packages/splitomatic.zip"
  job_name       = "splitomatic"
  deploy_env     = var.deploy_env
  bucket_name    = "aseaman-protected"
  bucket_arn     = "arn:aws:s3:::aseaman-protected"
  prefix         = "splitomatic/receipts/${var.deploy_env}/"

  lambda_timeout = 30
}

module "splitomatic_job_iam_role_policy" {
  source     = "../../modules/roles/splitomatic_job"
  role       = module.splitomatic_job.job_role_id
  deploy_env = var.deploy_env
  job_name   = "splitomatic"
}

resource "aws_ssm_parameter" "splitomatic_job_lambda_arn" {
  name = "/aseaman/${var.deploy_env}/lambda/splitomatic_job_lambda_arn"
  type = "String"
  value = module.splitomatic_job.lambda_function_arn
}

resource "aws_ssm_parameter" "splitomatic_job_prefix" {
  name = "/aseaman/${var.deploy_env}/lambda/splitomatic_job_prefix"
  type = "String"
  value = module.splitomatic_job.prefix
}

module "exports" {
  source                          = "../../modules/exports"
  env                             = var.deploy_env
  cognito_user_pool_client_id     = module.auth.cognito_user_pool_client_id
  cognito_user_pool_id            = module.auth.cognito_user_pool_id
  cognito_identity_pool_id        = module.auth.cognito_identity_pool_id
  budget_file_job_lambda_arn      = module.backend.budget_file_job_lambda_arn
  budget_file_job_prefix          = module.backend.budget_file_job_prefix
}