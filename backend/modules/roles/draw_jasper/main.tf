data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  aws_region     = data.aws_region.current.name
  aws_account_id = data.aws_caller_identity.current.account_id
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
          "arn:aws:s3:::aseaman-public-bucket",
          "arn:aws:s3:::aseaman-public-bucket/aseaman/jasper/*"
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
