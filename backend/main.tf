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

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  aws_region           = data.aws_region.current.name
  aws_account_id       = data.aws_caller_identity.current.account_id
}

resource "aws_api_gateway_rest_api" "rest_api" {
  name = "aseaman-website-api-test"
}

module "state_api" {
  source = "./modules/serverless_api"

  branch             = "master"
  deploy_env         = "live"
  api_name           = "state-api"
  nonce              = var.nonce
  path_part          = "state_check"

  rest_api_root_resource_id = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
}

module "state_api_iam_role_policy" {
  source = "./modules/roles/state_check"
  role = module.state_api.api_role_id
  api_name           = "state-api"
}


module "salt_level_api" {
  source = "./modules/serverless_api"

  branch             = "master"
  deploy_env         = "live"
  api_name           = "salt_level-api"
  nonce              = var.nonce
  path_part          = "salt_level"

  rest_api_root_resource_id = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
}

module "salt_level_api_iam_role_policy" {
  source = "./modules/roles/salt_level"
  role = module.salt_level_api.api_role_id

  api_name = "salt_level-api"
}


resource "aws_api_gateway_deployment" "api_gateway_deployment" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      module.state_api.api_resource_id,
      module.state_api.api_gateway_post_method_id,
      module.state_api.api_gateway_post_integration_id,
      module.state_api.api_gateway_options_method_id,
      module.state_api.api_gateway_options_integration_id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "stage" {
  deployment_id = aws_api_gateway_deployment.api_gateway_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  stage_name    = "test"
}

resource "aws_api_gateway_domain_name" "api_domain_name" {
  domain_name              = var.api_url
  regional_certificate_arn = "arn:aws:acm:${local.aws_region}:${local.aws_account_id}:certificate/${var.api_certificate_id}"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_route53_record" "api_dns_record" {
  name    = aws_api_gateway_domain_name.api_domain_name.domain_name
  type    = "A"
  zone_id = var.hosted_zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_api_gateway_domain_name.api_domain_name.regional_domain_name
    zone_id                = aws_api_gateway_domain_name.api_domain_name.regional_zone_id
  }
}

