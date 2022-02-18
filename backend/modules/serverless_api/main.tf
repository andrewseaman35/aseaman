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
}
resource "aws_s3_bucket_object" "lambda_function_package" {
  bucket = "aseaman-lambda-functions"
  key    = "${var.deploy_env}/${var.api_name}-${var.deploy_env}-${local.lambda_function_package_md5}.zip"
  source = "${var.zip_file}"

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

  runtime = "python3.6"
  timeout = var.lambda_timeout

  depends_on = [
    aws_s3_bucket_object.lambda_function_package
  ]

  tags = {
    Service = var.api_name
  }
}

resource "aws_api_gateway_resource" "api_resource" {
  parent_id   = var.rest_api_root_resource_id
  path_part   = var.path_part
  rest_api_id = var.rest_api_id
}

resource "aws_api_gateway_method" "any" {
  authorization = "NONE"
  http_method   = "ANY"
  resource_id   = aws_api_gateway_resource.api_resource.id
  rest_api_id   = var.rest_api_id
}

resource "aws_api_gateway_integration" "any_integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.api_resource.id
  http_method             = aws_api_gateway_method.any.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_lambda_function.invoke_arn
}

resource "aws_api_gateway_method_response" "any_200" {
  rest_api_id = var.rest_api_id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = aws_api_gateway_method.any.http_method
  status_code   = 200
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
      "method.response.header.Access-Control-Allow-Headers" = true,
      "method.response.header.Access-Control-Allow-Methods" = true,
      "method.response.header.Access-Control-Allow-Origin" = true
  }
  depends_on = [
    aws_api_gateway_method.any
  ]
}

resource "aws_api_gateway_integration_response" "any_integration_response" {
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.api_resource.id
  http_method = aws_api_gateway_method.any.http_method
  status_code = "${aws_api_gateway_method_response.any_200.status_code}"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.any_integration
  ]
}

resource "aws_api_gateway_method" "options" {
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.api_resource.id
  http_method             = aws_api_gateway_method.options.http_method
  type                    = "MOCK"

  depends_on = [aws_api_gateway_method.options]

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_200" {
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = aws_api_gateway_method.options.http_method
  status_code   = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
      "method.response.header.Access-Control-Allow-Headers" = true,
      "method.response.header.Access-Control-Allow-Methods" = true,
      "method.response.header.Access-Control-Allow-Origin" = true
  }

  depends_on = [
    aws_api_gateway_integration.options_integration
  ]
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.api_resource.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "${aws_api_gateway_method_response.options_200.status_code}"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }

  depends_on = [
    aws_api_gateway_method_response.options_200
  ]
}

resource "aws_api_gateway_resource" "proxy_api_resource" {
  parent_id   = aws_api_gateway_resource.api_resource.id
  path_part   = "{proxy+}"
  rest_api_id = var.rest_api_id
}

resource "aws_api_gateway_method" "proxy_any" {
  authorization = "NONE"
  http_method   = "ANY"
  resource_id   = aws_api_gateway_resource.proxy_api_resource.id
  rest_api_id   = var.rest_api_id
}

resource "aws_api_gateway_integration" "proxy_any_integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.proxy_api_resource.id
  http_method             = aws_api_gateway_method.proxy_any.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_lambda_function.invoke_arn
}

resource "aws_api_gateway_method_response" "proxy_any_200" {
  rest_api_id = var.rest_api_id
  resource_id   = aws_api_gateway_resource.proxy_api_resource.id
  http_method   = aws_api_gateway_method.proxy_any.http_method
  status_code   = 200
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
      "method.response.header.Access-Control-Allow-Headers" = true,
      "method.response.header.Access-Control-Allow-Methods" = true,
      "method.response.header.Access-Control-Allow-Origin" = true
  }
  depends_on = [
    aws_api_gateway_method.proxy_any
  ]
}

resource "aws_api_gateway_integration_response" "proxy_any_integration_response" {
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.proxy_api_resource.id
  http_method = aws_api_gateway_method.proxy_any.http_method
  status_code = "${aws_api_gateway_method_response.proxy_any_200.status_code}"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.proxy_any_integration
  ]
}

resource "aws_api_gateway_method" "proxy_options" {
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.proxy_api_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "proxy_options_integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.proxy_api_resource.id
  http_method             = aws_api_gateway_method.proxy_options.http_method
  type                    = "MOCK"

  depends_on = [aws_api_gateway_method.proxy_options]

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "proxy_options_200" {
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.proxy_api_resource.id
  http_method   = aws_api_gateway_method.proxy_options.http_method
  status_code   = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
      "method.response.header.Access-Control-Allow-Headers" = true,
      "method.response.header.Access-Control-Allow-Methods" = true,
      "method.response.header.Access-Control-Allow-Origin" = true
  }

  depends_on = [
    aws_api_gateway_integration.proxy_options_integration
  ]
}

resource "aws_api_gateway_integration_response" "proxy_options_integration_response" {
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.proxy_api_resource.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = "${aws_api_gateway_method_response.proxy_options_200.status_code}"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }

  depends_on = [
    aws_api_gateway_method_response.proxy_options_200
  ]
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

output "api_gateway_any_method_id" {
  value = aws_api_gateway_method.any.id
}

output "api_gateway_options_method_id" {
  value = aws_api_gateway_method.options.id
}

output "api_gateway_any_integration_id" {
  value = aws_api_gateway_integration.any_integration.id
}

output "api_gateway_options_integration_id" {
  value = aws_api_gateway_integration.options_integration.id
}
