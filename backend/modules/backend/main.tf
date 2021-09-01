data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  aws_region           = data.aws_region.current.name
  aws_account_id       = data.aws_caller_identity.current.account_id
}

resource "aws_api_gateway_rest_api" "rest_api" {
  name = "aseaman-website-api-${var.deploy_env}"
}

module "state_api" {
  source = "../serverless_api"
  zip_file = "../../api/packages/state_api.zip"

  api_name           = "state-api"
  branch             = "master"
  path_part          = "state_check"
  deploy_env         = var.deploy_env

  rest_api_root_resource_id = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
}

module "state_api_iam_role_policy" {
  source = "../roles/state_check"
  role = module.state_api.api_role_id
  deploy_env         = var.deploy_env
  api_name           = "state-api"
}


module "salt_level_api" {
  source = "../serverless_api"
  zip_file = "../../api/packages/salt_level_api.zip"

  api_name           = "salt_level-api"
  branch             = "master"
  path_part          = "salt_level"
  deploy_env         = var.deploy_env

  rest_api_root_resource_id = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
}

module "salt_level_api_iam_role_policy" {
  source = "../roles/salt_level"
  role = module.salt_level_api.api_role_id
  deploy_env = var.deploy_env

  api_name = "salt_level-api"
}

module "whisky_api" {
  source = "../serverless_api"
  zip_file = "../../api/packages/whisky_api.zip"

  api_name           = "whisky-api"
  branch             = "master"
  path_part          = "whisky"
  deploy_env         = var.deploy_env

  rest_api_root_resource_id = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
}

module "whisky_api_iam_role_policy" {
  source = "../roles/whisky"
  role = module.whisky_api.api_role_id
  deploy_env = var.deploy_env

  api_name = "whisky-api"
}

# module "draw_jasper_api" {
#   source = "../serverless_api"
#   zip_file = "../../api/packages/draw_jasper_api.zip"

#   api_name           = "draw_jasper-api"
#   branch             = "master"
#   path_part          = "draw_jasper"
#   deploy_env         = var.deploy_env

#   rest_api_root_resource_id = aws_api_gateway_rest_api.rest_api.root_resource_id
#   rest_api_id = aws_api_gateway_rest_api.rest_api.id
# }

# module "draw_jasper_iam_role_policy" {
#   source = "../roles/draw_jasper"
#   role = module.draw_jasper_api.api_role_id
#   deploy_env = var.deploy_env

#   api_name = "draw_jasper-api"
# }

module "compare_acnh_api" {
  source = "../serverless_api"
  zip_file = "../../api/packages/compare_acnh_api.zip"

  api_name           = "compare_acnh-api"
  branch             = "master"
  path_part          = "compare_acnh"
  deploy_env         = var.deploy_env

  rest_api_root_resource_id = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
}

module "compare_acnh_iam_role_policy" {
  source = "../roles/compare_acnh"
  role = module.compare_acnh_api.api_role_id
  deploy_env = var.deploy_env

  api_name = "compare_acnh-api"
}

module "mame_highscore_api" {
  source = "../serverless_api"
  zip_file = "../../api/packages/mame_highscore_api.zip"

  api_name           = "mame_highscore-api"
  branch             = "master"
  path_part          = "mame_highscore"
  deploy_env         = var.deploy_env

  rest_api_root_resource_id = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
}

module "mame_highscore_iam_role_policy" {
  source = "../roles/mame_highscore"
  role = module.mame_highscore_api.api_role_id
  deploy_env = var.deploy_env

  api_name = "mame_highscore-api"
}

module "chess_api" {
  source = "../serverless_api"
  zip_file = "../../api/packages/chess_api.zip"

  api_name           = "chess-api"
  branch             = "master"
  path_part          = "chess"
  deploy_env         = var.deploy_env

  rest_api_root_resource_id = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
}

module "chess_iam_role_policy" {
  source = "../roles/chess"
  role = module.chess_api.api_role_id
  deploy_env = var.deploy_env

  api_name = "chess-api"
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

      module.salt_level_api.api_resource_id,
      module.salt_level_api.api_gateway_post_method_id,
      module.salt_level_api.api_gateway_post_integration_id,
      module.salt_level_api.api_gateway_options_method_id,
      module.salt_level_api.api_gateway_options_integration_id,

      module.whisky_api.api_resource_id,
      module.whisky_api.api_gateway_post_method_id,
      module.whisky_api.api_gateway_post_integration_id,
      module.whisky_api.api_gateway_options_method_id,
      module.whisky_api.api_gateway_options_integration_id,

      # module.draw_jasper_api.api_resource_id,
      # module.draw_jasper_api.api_gateway_post_method_id,
      # module.draw_jasper_api.api_gateway_post_integration_id,
      # module.draw_jasper_api.api_gateway_options_method_id,
      # module.draw_jasper_api.api_gateway_options_integration_id,

      module.compare_acnh_api.api_resource_id,
      module.compare_acnh_api.api_gateway_post_method_id,
      module.compare_acnh_api.api_gateway_post_integration_id,
      module.compare_acnh_api.api_gateway_options_method_id,
      module.compare_acnh_api.api_gateway_options_integration_id,

      module.mame_highscore_api.api_resource_id,
      module.mame_highscore_api.api_gateway_post_method_id,
      module.mame_highscore_api.api_gateway_post_integration_id,
      module.mame_highscore_api.api_gateway_options_method_id,
      module.mame_highscore_api.api_gateway_options_integration_id,

      module.chess_api.api_resource_id,
      module.chess_api.api_gateway_post_method_id,
      module.chess_api.api_gateway_post_integration_id,
      module.chess_api.api_gateway_options_method_id,
      module.chess_api.api_gateway_options_integration_id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    module.state_api.aws_api_gateway_method,
    module.state_api.aws_api_gateway_integration,

    module.salt_level_api.aws_api_gateway_method,
    module.salt_level_api.aws_api_gateway_integration,

    module.whisky_api.aws_api_gateway_method,
    module.whisky_api.aws_api_gateway_integration,

    # module.draw_jasper_api.aws_api_gateway_method,
    # module.draw_jasper_api.aws_api_gateway_integration,

    module.compare_acnh_api.aws_api_gateway_method,
    module.compare_acnh_api.aws_api_gateway_integration,

    module.mame_highscore_api.aws_api_gateway_method,
    module.mame_highscore_api.aws_api_gateway_integration,

    module.chess_api.aws_api_gateway_method,
    module.chess_api.aws_api_gateway_integration,
  ]
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

