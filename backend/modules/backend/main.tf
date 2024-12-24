data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  aws_region     = data.aws_region.current.name
  aws_account_id = data.aws_caller_identity.current.account_id
}

/*********/
/*  API  */
/*********/
resource "aws_api_gateway_rest_api" "rest_api" {
  name = "aseaman-website-api-${var.deploy_env}"
}

module "salt_level_api" {
  source     = "../serverless_api"
  zip_file   = "../../api/packages/salt_level_api.zip"
  api_name   = "salt_level-api"
  path_part  = "salt_level"
  deploy_env = var.deploy_env
  hostname   = var.hostname

  cognito_user_pool_arn = var.cognito_user_pool_arn
  cognito_user_pool_id  = var.cognito_user_pool_id

  rest_api_root_resource_id      = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id                    = aws_api_gateway_rest_api.rest_api.id
  get_method_authorization       = "NONE"
  get_proxy_method_authorization = "NONE"
}

module "salt_level_api_iam_role_policy" {
  source     = "../roles/salt_level"
  role       = module.salt_level_api.api_role_id
  deploy_env = var.deploy_env
  api_name   = "salt_level-api"
}

module "draw_jasper_api" {
  source         = "../serverless_api"
  zip_file       = "../../api/packages/draw_jasper_api.zip"
  api_name       = "draw_jasper-api"
  path_part      = "draw_jasper"
  deploy_env     = var.deploy_env
  lambda_timeout = 30
  layers = ["arn:aws:lambda:us-east-1:560983357304:layer:opencv_python39:1"]

  cognito_user_pool_arn = var.cognito_user_pool_arn
  cognito_user_pool_id  = var.cognito_user_pool_id

  rest_api_root_resource_id       = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id                     = aws_api_gateway_rest_api.rest_api.id
  get_method_authorization        = "NONE"
  post_method_authorization       = "NONE"
  get_proxy_method_authorization  = "NONE"
  post_proxy_method_authorization = "NONE"
}

module "draw_jasper_iam_role_policy" {
  source     = "../roles/draw_jasper"
  role       = module.draw_jasper_api.api_role_id
  deploy_env = var.deploy_env
  api_name   = "draw_jasper-api"
}

module "compare_acnh_api" {
  source     = "../serverless_api"
  zip_file   = "../../api/packages/compare_acnh_api.zip"
  api_name   = "compare_acnh-api"
  path_part  = "compare_acnh"
  deploy_env = var.deploy_env
  hostname   = var.hostname

  cognito_user_pool_arn = var.cognito_user_pool_arn
  cognito_user_pool_id  = var.cognito_user_pool_id

  rest_api_root_resource_id       = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id                     = aws_api_gateway_rest_api.rest_api.id
  get_method_authorization        = "NONE"
  post_method_authorization       = "NONE"
  get_proxy_method_authorization  = "NONE"
  post_proxy_method_authorization = "NONE"
}

module "compare_acnh_iam_role_policy" {
  source     = "../roles/compare_acnh"
  role       = module.compare_acnh_api.api_role_id
  deploy_env = var.deploy_env
  api_name   = "compare_acnh-api"
}

module "event_api" {
  source     = "../serverless_api"
  zip_file   = "../../api/packages/event_api.zip"
  api_name   = "event-api"
  path_part  = "event"
  deploy_env = var.deploy_env
  hostname   = var.hostname

  cognito_user_pool_arn = var.cognito_user_pool_arn
  cognito_user_pool_id  = var.cognito_user_pool_id

  rest_api_root_resource_id       = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id                     = aws_api_gateway_rest_api.rest_api.id
  get_method_authorization        = "NONE"
  post_method_authorization       = "NONE"
  get_proxy_method_authorization  = "NONE"
  post_proxy_method_authorization = "NONE"
}

module "event_iam_role_policy" {
  source     = "../roles/event"
  role       = module.event_api.api_role_id
  deploy_env = var.deploy_env
  api_name   = "event-api"
}

module "mame_highscore_api" {
  source     = "../serverless_api"
  zip_file   = "../../api/packages/mame_highscore_api.zip"
  api_name   = "mame_highscore-api"
  path_part  = "mame_highscore"
  deploy_env = var.deploy_env
  hostname   = var.hostname

  cognito_user_pool_arn = var.cognito_user_pool_arn
  cognito_user_pool_id  = var.cognito_user_pool_id

  rest_api_root_resource_id      = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id                    = aws_api_gateway_rest_api.rest_api.id
  get_method_authorization       = "NONE"
  get_proxy_method_authorization = "NONE"
}

module "mame_highscore_iam_role_policy" {
  source     = "../roles/mame_highscore"
  role       = module.mame_highscore_api.api_role_id
  deploy_env = var.deploy_env
  api_name   = "mame_highscore-api"
}

module "chess_api" {
  source     = "../serverless_api"
  zip_file   = "../../api/packages/chess_api.zip"
  api_name   = "chess-api"
  path_part  = "chess"
  deploy_env = var.deploy_env
  hostname   = var.hostname

  cognito_user_pool_arn = var.cognito_user_pool_arn
  cognito_user_pool_id  = var.cognito_user_pool_id

  rest_api_root_resource_id       = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id                     = aws_api_gateway_rest_api.rest_api.id
  get_method_authorization        = "NONE"
  post_method_authorization       = "NONE"
  get_proxy_method_authorization  = "NONE"
  post_proxy_method_authorization = "NONE"
}

module "chess_iam_role_policy" {
  source     = "../roles/chess"
  role       = module.chess_api.api_role_id
  deploy_env = var.deploy_env
  api_name   = "chess-api"
}

module "linker_api" {
  source     = "../serverless_api"
  zip_file   = "../../api/packages/linker_api.zip"
  api_name   = "linker-api"
  path_part  = "linker"
  deploy_env = var.deploy_env
  hostname   = var.hostname

  cognito_user_pool_arn = var.cognito_user_pool_arn
  cognito_user_pool_id  = var.cognito_user_pool_id
  cognito_user_groups   = {
    "link-manager": {
      "description": "Create, update, delete links"
    }
  }

  rest_api_root_resource_id         = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id                       = aws_api_gateway_rest_api.rest_api.id
  get_method_authorization          = "NONE"
  get_proxy_method_authorization    = "NONE"
}

module "linker_iam_role_policy" {
  source     = "../roles/linker"
  role       = module.linker_api.api_role_id
  deploy_env = var.deploy_env
  api_name   = "linker-api"
}

module "budget_api" {
  source     = "../serverless_api"
  zip_file   = "../../api/packages/budget_api.zip"
  api_name   = "budget-api"
  path_part  = "budget"
  deploy_env = var.deploy_env
  hostname   = var.hostname

  cognito_user_pool_arn = var.cognito_user_pool_arn
  cognito_user_pool_id  = var.cognito_user_pool_id
  cognito_user_groups   = {
    "budget-manager": {
      "description": "Access to managing budget files"
    }
  }

  rest_api_root_resource_id         = aws_api_gateway_rest_api.rest_api.root_resource_id
  rest_api_id                       = aws_api_gateway_rest_api.rest_api.id
  get_method_authorization          = "NONE"
  get_proxy_method_authorization    = "NONE"
}

module "budget_iam_role_policy" {
  source     = "../roles/budget"
  role       = module.budget_api.api_role_id
  deploy_env = var.deploy_env
  api_name   = "budget-api"
}

resource "aws_api_gateway_deployment" "api_gateway_deployment" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id

  triggers = {
    redeployment = sha1(jsonencode({
      salt_level_api     = module.salt_level_api.api_resource_module_ids
      draw_jasper_api    = module.draw_jasper_api.api_resource_module_ids
      compare_acnh_api   = module.compare_acnh_api.api_resource_module_ids
      event_api          = module.event_api.api_resource_module_ids
      mame_highscore_api = module.mame_highscore_api.api_resource_module_ids
      chess_api          = module.chess_api.api_resource_module_ids
      linker_api         = module.linker_api.api_resource_module_ids
      budget_api         = module.budget_api.api_resource_module_ids
    }))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    module.salt_level_api.aws_api_gateway_method,
    module.salt_level_api.aws_api_gateway_integration,

    module.draw_jasper_api.aws_api_gateway_method,
    module.draw_jasper_api.aws_api_gateway_integration,

    module.compare_acnh_api.aws_api_gateway_method,
    module.compare_acnh_api.aws_api_gateway_integration,

    module.event_api.aws_api_gateway_method,
    module.event_api.aws_api_gateway_integration,

    module.mame_highscore_api.aws_api_gateway_method,
    module.mame_highscore_api.aws_api_gateway_integration,

    module.chess_api.aws_api_gateway_method,
    module.chess_api.aws_api_gateway_integration,

    module.linker_api.aws_api_gateway_method,
    module.linker_api.aws_api_gateway_integration,

    module.budget_api.aws_api_gateway_method,
    module.budget_api.aws_api_gateway_integration,
  ]
}

resource "aws_api_gateway_stage" "stage" {
  deployment_id = aws_api_gateway_deployment.api_gateway_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  stage_name    = "test"
}

resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  stage_name  = aws_api_gateway_stage.stage.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled        = true
    logging_level          = "ERROR"
    throttling_rate_limit  = 100
    throttling_burst_limit = 200
  }
}

resource "aws_api_gateway_domain_name" "api_domain_name" {
  domain_name              = var.api_url
  regional_certificate_arn = "arn:aws:acm:${local.aws_region}:${local.aws_account_id}:certificate/${var.api_certificate_id}"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_base_path_mapping" "mapping" {
  api_id      = aws_api_gateway_rest_api.rest_api.id
  stage_name  = aws_api_gateway_stage.stage.stage_name
  domain_name = aws_api_gateway_domain_name.api_domain_name.domain_name
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

/**********/
/*  JOBS  */
/**********/

module "budget_file_job" {
  source      = "../s3_lambda_function"
  zip_file    = "../../jobs/packages/budget_file.zip"
  job_name    = "budget_file"
  deploy_env  = var.deploy_env
  bucket_name = "aseaman-protected"
  bucket_arn  = "arn:aws:s3:::aseaman-protected"
  prefix      = "budget/uploads/${var.deploy_env}/"
}

module "budget_file_job_iam_role_policy" {
  source     = "../roles/budget_file_job"
  role       = module.budget_file_job.job_role_id
  deploy_env = var.deploy_env
  job_name   = "budget_file"
}

output "budget_file_job_lambda_arn" {
  value = module.budget_file_job.lambda_function_arn
}

output "budget_file_job_prefix" {
  value = module.budget_file_job.prefix
}