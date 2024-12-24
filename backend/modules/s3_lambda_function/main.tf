data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  lambda_function_name = "${var.job_name}-${var.deploy_env}"
  aws_region           = data.aws_region.current.name
  aws_account_id       = data.aws_caller_identity.current.account_id
}

resource "aws_iam_role" "job_role" {
  name = "${var.job_name}_job_role-${var.deploy_env}"

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
    Service = var.job_name
  }
}

resource "aws_iam_instance_profile" "job_instance_profile" {
  name = "${var.job_name}_job_instance_profile-${var.deploy_env}"
  role = aws_iam_role.job_role.name

  tags = {
    Service = var.job_name
  }
}

locals {
  lambda_function_package_md5 = filemd5("${var.zip_file}")
}

resource "aws_s3_bucket_object" "lambda_function_package" {
  bucket = "aseaman-lambda-functions"
  key    = "${var.deploy_env}/${var.job_name}-job-${var.deploy_env}-${local.lambda_function_package_md5}.zip"
  source = var.zip_file

  etag = filemd5("${var.zip_file}")
  tags = {
    Environment = "Shared"
  }
}

resource "aws_lambda_function" "job_lambda_function" {
  function_name = local.lambda_function_name
  role          = aws_iam_role.job_role.arn
  handler       = "lambda_handler.lambda_handler"
  s3_bucket     = "aseaman-lambda-functions"
  s3_key        = "${var.deploy_env}/${var.job_name}-job-${var.deploy_env}-${local.lambda_function_package_md5}.zip"

  layers = var.layers

  runtime = "python3.9"
  timeout = var.lambda_timeout

  environment {
    variables = {
      ENV      = var.deploy_env
    }
  }

  depends_on = [
    aws_s3_bucket_object.lambda_function_package
  ]

  tags = {
    Service = var.job_name
  }
}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3${var.bucket_name}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.job_lambda_function.arn
  principal     = "s3.amazonaws.com"
  source_arn    = var.bucket_arn
}

output "job_role_id" {
  value = aws_iam_role.job_role.id
}

output "lambda_function_arn" {
  value = aws_lambda_function.job_lambda_function.arn
}

output "prefix" {
  value = var.prefix
}
