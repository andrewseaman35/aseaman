data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

locals {
  aws_region     = data.aws_region.current.name
  aws_account_id = data.aws_caller_identity.current.account_id
}

resource "aws_ssm_parameter" "cognito_user_pool_client_id" {
  name  = "/aseaman/${var.env}/cognito/user_pool_client_id"
  type  = "String"
  value = var.cognito_user_pool_client_id
}

resource "aws_ssm_parameter" "cognito_user_pool_id" {
  name  = "/aseaman/${var.env}/cognito/user_pool_id"
  type  = "String"
  value = var.cognito_user_pool_id
}

resource "aws_ssm_parameter" "cognito_identity_pool_id" {
  name  = "/aseaman/${var.env}/cognito/identity_pool_id"
  type  = "String"
  value = var.cognito_identity_pool_id
}

resource "aws_ssm_parameter" "budget_file_job_lambda_arn" {
  name = "/aseaman/${var.env}/lambda/budget_file_job_lambda_arn"
  type = "String"
  value = var.budget_file_job_lambda_arn
}

resource "aws_ssm_parameter" "budget_file_job_prefix" {
  name = "/aseaman/${var.env}/lambda/budget_file_job_prefix"
  type = "String"
  value = var.budget_file_job_lambda_arn
}