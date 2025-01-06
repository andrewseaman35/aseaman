data "aws_ssm_parameter" "live_budget_file_job_lambda_arn" {
  name = "/aseaman/live/lambda/budget_file_job_lambda_arn"
}

data "aws_ssm_parameter" "live_budget_file_job_prefix" {
  name = "/aseaman/live/lambda/budget_file_job_prefix"
}

data "aws_ssm_parameter" "stage_budget_file_job_lambda_arn" {
  name = "/aseaman/stage/lambda/budget_file_job_lambda_arn"
}

data "aws_ssm_parameter" "stage_budget_file_job_prefix" {
  name = "/aseaman/stage/lambda/budget_file_job_prefix"
}
data "aws_ssm_parameter" "local_budget_file_job_lambda_arn" {
  name = "/aseaman/local/lambda/budget_file_job_lambda_arn"
}

data "aws_ssm_parameter" "local_budget_file_job_prefix" {
  name = "/aseaman/local/lambda/budget_file_job_prefix"
}

resource "aws_s3_bucket_notification" "aseaman_protected_notification" {
  bucket = "aseaman-protected"

  lambda_function {
    lambda_function_arn = data.aws_ssm_parameter.live_budget_file_job_lambda_arn.value
    filter_prefix       = data.aws_ssm_parameter.live_budget_file_job_prefix.value
    events              = ["s3:ObjectCreated:*"]
  }

  lambda_function {
    lambda_function_arn = data.aws_ssm_parameter.stage_budget_file_job_lambda_arn.value
    filter_prefix       = data.aws_ssm_parameter.stage_budget_file_job_prefix.value
    events              = ["s3:ObjectCreated:*"]
  }

  lambda_function {
    lambda_function_arn = data.aws_ssm_parameter.local_budget_file_job_lambda_arn.value
    filter_prefix       = data.aws_ssm_parameter.local_budget_file_job_prefix.value
    events              = ["s3:ObjectCreated:*"]
  }
}