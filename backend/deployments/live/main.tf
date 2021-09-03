terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket         = "aseaman-tf-state"
    key            = "aseaman-website/live.tfstate"
    profile        = "aseaman"
    region         = "us-east-1"
  }

  required_version = ">= 0.14.9"
}


provider "aws" {
  profile = "aseaman"
  region  = "us-east-1"
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  aws_region           = data.aws_region.current.name
  aws_account_id       = data.aws_caller_identity.current.account_id
}

module "backend" {
    source = "../../modules/backend"
    api_certificate_id = var.api_certificate_id
    deploy_env = var.deploy_env
    hosted_zone_id = var.hosted_zone_id
    api_url = var.api_url
}
