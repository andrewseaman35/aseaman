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

resource "aws_iam_role_policy" "api_role_policy" {
  name = "${var.api_name}_role"
  role = aws_iam_role.api_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:*",
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:DeleteItem"
        ]
        Resource = [
          "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${var.table_name}",
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter"
        ]
        Resource = "arn:aws:ssm:${local.aws_region}:${local.aws_account_id}:parameter/*"
      },
      {
          Effect = "Allow"
          Action = [
              "execute-api:ManageConnections"
          ],
          Resource = [
              "arn:aws:execute-api:${local.aws_region}:${local.aws_account_id}:buhsox5cb5/develop/*"
          ]
      }
    ]
  })
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

  runtime = "python3.13"
  timeout = var.lambda_timeout

  environment {
    variables = {
      ENV      = var.deploy_env
      HOSTNAME = var.hostname
      table_name = var.table_name
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

# resource "aws_api_gateway_authorizer" "cognito" {
#   name          = "CognitoUserPoolAuthorizer-${var.api_name}"
#   type          = "COGNITO_USER_POOLS"
#   rest_api_id   = var.rest_api_id
#   provider_arns = [var.cognito_user_pool_arn]
# }


resource "aws_apigatewayv2_integration" "ws_api_integration" {
  api_id                    = var.api_id
  integration_type          = "AWS_PROXY"
  integration_uri           = aws_lambda_function.api_lambda_function.invoke_arn
  content_handling_strategy = "CONVERT_TO_TEXT"
  passthrough_behavior      = "WHEN_NO_MATCH"
}

# resource "aws_apigatewayv2_integration_response" "ws_api_integration_response" {
#   api_id                   = var.api_id
#   integration_id           = aws_apigatewayv2_integration.ws_api_integration.id
#   integration_response_key = "/200/"
# }

resource "aws_apigatewayv2_route" "ws_api_default_route" {
  api_id    = var.api_id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.ws_api_integration.id}"
}

# resource "aws_apigatewayv2_route_response" "ws_api_default_route_response" {
#   api_id             = var.api_id
#   route_id           = aws_apigatewayv2_route.ws_api_default_route.id
#   route_response_key = "$default"
# }

resource "aws_apigatewayv2_route" "ws_api_connect_route" {
  api_id    = var.api_id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.ws_api_integration.id}"
}

# resource "aws_apigatewayv2_route_response" "ws_api_connect_route_response" {
#   api_id             = var.api_id
#   route_id           = aws_apigatewayv2_route.ws_api_connect_route.id
#   route_response_key = "$default"
# }

resource "aws_apigatewayv2_route" "ws_api_disconnect_route" {
  api_id    = var.api_id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.ws_api_integration.id}"
}

# resource "aws_apigatewayv2_route_response" "ws_api_disconnect_route_response" {
#   api_id             = var.api_id
#   route_id           = aws_apigatewayv2_route.ws_api_disconnect_route.id
#   route_response_key = "$default"
# }

resource "aws_apigatewayv2_route" "ws_messenger_api_message_route" {
  api_id    = var.api_id
  route_key = "MESSAGE"
  target    = "integrations/${aws_apigatewayv2_integration.ws_api_integration.id}"
}

resource "aws_apigatewayv2_route_response" "ws_messenger_api_message_route_response" {
  api_id             = var.api_id
  route_id           = aws_apigatewayv2_route.ws_messenger_api_message_route.id
  route_response_key = "$default"
}

resource "aws_apigatewayv2_stage" "ws_messenger_api_stage" {
  api_id      = var.api_id
  name        = "develop"
  auto_deploy = true

  default_route_settings {
    throttling_rate_limit  = 5
    throttling_burst_limit = 10
  }
}

# resource "aws_lambda_permission" "ws_lambda_permissions" {
#   statement_id  = "AllowExecutionFromAPIGateway"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.api_lambda_function.function_name
#   principal     = "apigateway.amazonaws.com"
#   source_arn    = "${var.execution_arn}/*/*"
# }

resource "aws_lambda_permission" "api_invoke_function" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_lambda_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${local.aws_region}:${local.aws_account_id}:${var.api_id}/*"
}

output "api_role_id" {
  value = aws_iam_role.api_role.id
}

# output "api_resource_id" {
#   value = aws_api_gateway_resource.api_resource.id
# }


output "api_resource_module_ids" {
  value = [

  ]
}
