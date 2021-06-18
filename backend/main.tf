terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket         = "aseaman-tf-state"
    key            = "aseaman-website/terraform.tfstate"
    profile        = "aseaman"
    region         = "us-east-1"
  }

  required_version = ">= 0.14.9"
}


provider "aws" {
  profile = "aseaman"
  region  = "us-east-1"
}

module "state_api" {
  source = "./modules/serverless_api"

  branch             = "master"
  deploy_env         = "live"
  api_url            = "test"
  api_name           = "state-api"
  nonce              = "1619239047"
  hosted_zone_id     = "test"
  api_certificate_id = "test"
}
