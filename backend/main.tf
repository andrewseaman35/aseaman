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

resource "aws_api_gateway_rest_api" "rest_api" {
  name = "aseaman-website-api-test"
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
  api_url            = "test"
  api_name           = "salt_level-api"
  nonce              = "1619239047"
  hosted_zone_id     = "test"
  api_certificate_id = "test"
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

