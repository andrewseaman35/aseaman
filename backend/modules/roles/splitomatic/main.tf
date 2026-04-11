data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  aws_region     = data.aws_region.current.name
  aws_account_id = data.aws_caller_identity.current.account_id
  event_table_name     = "${var.deploy_env == "live" ? "splitomatic_event" : "splitomatic_event_${var.deploy_env}"}"
  user_table_name     = "${var.deploy_env == "live" ? "splitomatic_user" : "splitomatic_user_${var.deploy_env}"}"
  receipt_table_name     = "${var.deploy_env == "live" ? "splitomatic_receipt" : "splitomatic_receipt_${var.deploy_env}"}"
  receipt_item_table_name     = "${var.deploy_env == "live" ? "splitomatic_receipt_item" : "splitomatic_receipt_item_${var.deploy_env}"}"
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
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = [
          "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${local.event_table_name}",
          "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${local.user_table_name}",
          "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${local.receipt_table_name}",
          "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${local.receipt_item_table_name}",
          "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${local.receipt_item_table_name}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "arn:aws:s3:::aseaman-protected/splitomatic/receipts/*"
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
