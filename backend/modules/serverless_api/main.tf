data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  lambda_function_name = "${var.api_name}-${var.deploy_env}"
  aws_region           = data.aws_region.current.name
  aws_account_id       = data.aws_caller_identity.current.account_id
}

resource "aws_iam_role" "api_role" {
  name = "${var.api_name}_role-${var.deploy_env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    Service = var.api_name
  }
}

resource "aws_iam_instance_profile" "api_instance_profile" {
  name = "${var.api_name}_instance_profile-${var.deploy_env}"
  role = aws_iam_role.api_role.name

  tags = {
    Service = var.api_name
  }
}

locals {
  lambda_function_package_md5 = filemd5("${var.zip_file}")
  cognito_user_groups         = var.cognito_user_groups
}
resource "aws_s3_bucket_object" "lambda_function_package" {
  bucket = "aseaman-lambda-functions"
  key    = "${var.deploy_env}/${var.api_name}-${var.deploy_env}-${local.lambda_function_package_md5}.zip"
  source = var.zip_file

  etag = filemd5("${var.zip_file}")
  tags = {
    Environment = "Shared"
  }
}

resource "aws_lambda_function" "api_lambda_function" {
  function_name = local.lambda_function_name
  role          = aws_iam_role.api_role.arn
  handler       = "lambda_handler.lambda_handler"
  s3_bucket     = "aseaman-lambda-functions"
  s3_key        = "${var.deploy_env}/${var.api_name}-${var.deploy_env}-${local.lambda_function_package_md5}.zip"

  layers = var.layers

  runtime = "python3.9"
  timeout = var.lambda_timeout

  environment {
    variables = {
      ENV      = var.deploy_env
      HOSTNAME = var.hostname
    }
  }

  depends_on = [
    aws_s3_bucket_object.lambda_function_package
  ]

  tags = {
    Service = var.api_name
  }
}

resource "aws_cognito_user_group" "cognito_user_accounts" {
  for_each = local.cognito_user_groups

  name         = each.key
  description  = each.value.description
  user_pool_id = var.cognito_user_pool_id
}

resource "aws_api_gateway_resource" "api_resource" {
  parent_id   = var.rest_api_root_resource_id
  path_part   = var.path_part
  rest_api_id = var.rest_api_id
}

resource "aws_api_gateway_authorizer" "cognito" {
  name          = "CognitoUserPoolAuthorizer-${var.api_name}"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = var.rest_api_id
  provider_arns = [var.cognito_user_pool_arn]
}

module "get_method" {
  source = "../gateway_method"

  api_resource_id = aws_api_gateway_resource.api_resource.id
  rest_api_id     = var.rest_api_id

  authorization   = var.get_method_authorization
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  http_method     = "GET"
  integration_uri = aws_lambda_function.api_lambda_function.invoke_arn

  depends_on = [
    aws_api_gateway_authorizer.cognito
  ]
}

module "post_method" {
  source = "../gateway_method"

  api_resource_id = aws_api_gateway_resource.api_resource.id
  rest_api_id     = var.rest_api_id

  authorization   = var.post_method_authorization
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  http_method     = "POST"
  integration_uri = aws_lambda_function.api_lambda_function.invoke_arn

  depends_on = [
    aws_api_gateway_authorizer.cognito
  ]
}

module "put_method" {
  source = "../gateway_method"

  api_resource_id = aws_api_gateway_resource.api_resource.id
  rest_api_id     = var.rest_api_id

  authorization   = var.put_method_authorization
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  http_method     = "PUT"
  integration_uri = aws_lambda_function.api_lambda_function.invoke_arn

  depends_on = [
    aws_api_gateway_authorizer.cognito
  ]
}

module "delete_method" {
  source = "../gateway_method"

  api_resource_id = aws_api_gateway_resource.api_resource.id
  rest_api_id     = var.rest_api_id

  authorization   = var.delete_method_authorization
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  http_method     = "DELETE"
  integration_uri = aws_lambda_function.api_lambda_function.invoke_arn

  depends_on = [
    aws_api_gateway_authorizer.cognito
  ]
}

module "options_method" {
  source          = "../options_method"
  api_resource_id = aws_api_gateway_resource.api_resource.id
  rest_api_id     = var.rest_api_id
}


resource "aws_api_gateway_resource" "proxy_api_resource" {
  parent_id   = aws_api_gateway_resource.api_resource.id
  path_part   = "{proxy+}"
  rest_api_id = var.rest_api_id
}

module "get_proxy_method" {
  source = "../gateway_method"

  api_resource_id = aws_api_gateway_resource.proxy_api_resource.id
  rest_api_id     = var.rest_api_id

  authorization   = var.get_proxy_method_authorization
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  http_method     = "GET"
  integration_uri = aws_lambda_function.api_lambda_function.invoke_arn

  depends_on = [
    aws_api_gateway_authorizer.cognito
  ]
}

module "post_proxy_method" {
  source = "../gateway_method"

  api_resource_id = aws_api_gateway_resource.proxy_api_resource.id
  rest_api_id     = var.rest_api_id

  authorization   = var.post_proxy_method_authorization
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  http_method     = "POST"
  integration_uri = aws_lambda_function.api_lambda_function.invoke_arn

  depends_on = [
    aws_api_gateway_authorizer.cognito
  ]
}

module "put_proxy_method" {
  source = "../gateway_method"

  api_resource_id = aws_api_gateway_resource.proxy_api_resource.id
  rest_api_id     = var.rest_api_id

  authorization   = var.put_proxy_method_authorization
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  http_method     = "PUT"
  integration_uri = aws_lambda_function.api_lambda_function.invoke_arn

  depends_on = [
    aws_api_gateway_authorizer.cognito
  ]
}

module "delete_proxy_method" {
  source = "../gateway_method"

  api_resource_id = aws_api_gateway_resource.proxy_api_resource.id
  rest_api_id     = var.rest_api_id

  authorization   = var.delete_proxy_method_authorization
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  http_method     = "DELETE"
  integration_uri = aws_lambda_function.api_lambda_function.invoke_arn

  depends_on = [
    aws_api_gateway_authorizer.cognito
  ]
}

module "options_proxy_method" {
  source          = "../options_method"
  api_resource_id = aws_api_gateway_resource.proxy_api_resource.id
  rest_api_id     = var.rest_api_id
}

resource "aws_lambda_permission" "api_invoke_function" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_lambda_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${local.aws_region}:${local.aws_account_id}:${var.rest_api_id}/*"
}

output "api_role_id" {
  value = aws_iam_role.api_role.id
}

output "api_resource_id" {
  value = aws_api_gateway_resource.api_resource.id
}


output "api_resource_module_ids" {
  value = [
    module.get_method.method_id,
    module.post_method.method_id,
    module.put_method.method_id,
    module.delete_method.method_id,
    module.options_method.method_id,
    module.get_proxy_method.method_id,
    module.post_proxy_method.method_id,
    module.put_proxy_method.method_id,
    module.delete_proxy_method.method_id,
    module.options_proxy_method.method_id,
    module.get_method.integration_id,
    module.post_method.integration_id,
    module.put_method.integration_id,
    module.delete_method.integration_id,
    module.options_method.integration_id,
    module.get_proxy_method.integration_id,
    module.post_proxy_method.integration_id,
    module.put_proxy_method.integration_id,
    module.delete_proxy_method.integration_id,
    module.options_proxy_method.integration_id,
  ]
}
