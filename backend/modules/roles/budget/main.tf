data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  aws_region     = data.aws_region.current.name
  aws_account_id = data.aws_caller_identity.current.account_id
  file_table_name     = "${var.deploy_env == "live" ? "budget_file" : "budget_file_${var.deploy_env}"}"
  entry_table_name     = "${var.deploy_env == "live" ? "budget_file_entry" : "budget_file_entry_${var.deploy_env}"}"
  config_table_name     = "${var.deploy_env == "live" ? "budget_file_config" : "budget_file_config_${var.deploy_env}"}"
}

resource "aws_iam_role_policy" "api_role" {
  name = "${var.api_name}_role"
  role = var.role

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
          "s3:PutObject",
          "s3:ListBucket",
          "s3:GetObject"
        ]
        Resource = [
          "arn:aws:s3:::aseaman-protected",
          "arn:aws:s3:::aseaman-protected/budget/uploads/${var.deploy_env}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:ListBucket",
          "s3:GetObject"
        ]
        Resource = [
          "arn:aws:s3:::aseaman-protected",
          "arn:aws:s3:::aseaman-protected/budget/config/${var.deploy_env}/*"
        ]
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
        ]
        Resource = "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${local.entry_table_name}"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:Query",
        ]
        Resource = "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${local.file_table_name}"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
        ]
        Resource = "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${local.config_table_name}"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter"
        ]
        Resource = "arn:aws:ssm:${local.aws_region}:${local.aws_account_id}:parameter/*"
      }
    ]
  })
}
