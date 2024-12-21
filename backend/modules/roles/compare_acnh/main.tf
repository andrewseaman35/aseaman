data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  aws_region     = data.aws_region.current.name
  aws_account_id = data.aws_caller_identity.current.account_id
  results_table_name     = "${var.deploy_env == "live" ? "compare_acnh_results" : "compare_acnh_results_stage"}"
  summary_table_name     = "${var.deploy_env == "live" ? "compare_acnh_summary" : "compare_acnh_summary_stage"}"
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
          "dynamodb:BatchGetItem",
          "dynamodb:Query"
        ]
        Resource = [
          "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${local.results_table_name}",
          "arn:aws:dynamodb:${local.aws_region}:${local.aws_account_id}:table/${local.summary_table_name}"
        ]
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
