terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket  = "aseaman-tf-state"
    key     = "aseaman-website/local.tfstate"
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
      Environment = "Local"
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

module "budget_file_job" {
  source         = "../../modules/s3_lambda_function"
  zip_file       = "../../jobs/packages/budget_file.zip"
  job_name       = "budget_file"
  deploy_env     = var.deploy_env
  bucket_name    = "aseaman-protected"
  bucket_arn     = "arn:aws:s3:::aseaman-protected"
  prefix         = "budget/uploads/${var.deploy_env}/"

  lambda_timeout = 30
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

module "budget_file_job_iam_role_policy" {
  source     = "../../modules/roles/budget_file_job"
  role       = module.budget_file_job.job_role_id
  deploy_env = var.deploy_env
  job_name   = "budget_file"
}
module "splitomatic_job_iam_role_policy" {
  source     = "../../modules/roles/splitomatic_job"
  role       = module.splitomatic_job.job_role_id
  deploy_env = var.deploy_env
  job_name   = "splitomatic"
}

resource "aws_ssm_parameter" "budget_file_job_lambda_arn" {
  name = "/aseaman/${var.deploy_env}/lambda/budget_file_job_lambda_arn"
  type = "String"
  value = module.budget_file_job.lambda_function_arn
}

resource "aws_ssm_parameter" "budget_file_job_prefix" {
  name = "/aseaman/${var.deploy_env}/lambda/budget_file_job_prefix"
  type = "String"
  value = module.budget_file_job.prefix
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