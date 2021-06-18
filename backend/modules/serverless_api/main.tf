data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

resource "aws_iam_role_policy" "state_api_role" {
  name = "state_api_role"
  role = aws_iam_role.api_role.id

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
          "dynamodb:GetItem"
        ]
        Resource = "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/states"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter"
        ]
        Resource = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/*"
      }
    ]
  })
}

resource "aws_iam_role" "api_role" {
  name = "${var.api_name}_role"

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
}

resource "aws_iam_instance_profile" "api_instance_profile" {
  name = "${var.api_name}_instance_profile"
  role = aws_iam_role.api_role.name
}

resource "aws_lambda_function" "api_lambda_function" {
  function_name = "${var.api_name}-${var.deploy_env}-${var.nonce}-test"
  role          = aws_iam_role.api_role.arn
  handler       = "lambda_handler.lambda_handler"
  s3_bucket     = "aseaman-lambda-functions"
  s3_key        = "${var.deploy_env}/${var.api_name}-${var.deploy_env}-${var.nonce}.zip"

  runtime = "python3.6"
  timeout = 10
}

