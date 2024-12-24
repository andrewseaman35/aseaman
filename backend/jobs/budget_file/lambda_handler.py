from base.lambda_handler_base import JobLambdaHandlerBase


CREATION_EVENT_NAME = "ObjectCreated:Put"

ACTION_CREATE = "CREATE"
ACTION_DELETE = "DELETE"


class BudgetFileLambdaHandler(JobLambdaHandlerBase):
    sns_arn = None

    def _run(self, event, context):
        print("RUNNING")
        print(self.changes)


def lambda_handler(event, context):
    return BudgetFileLambdaHandler(event, context).handle()
