import json

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import BadRequestException, UnauthorizedException

SUMMARY_TABLE_NAME = 'compare_acnh_summary'
LOCAL_SUMMARY_TABLE_NAME = 'compare_acnh_summary_local'

RESULTS_TABLE_NAME = 'compare_acnh_results'
LOCAL_RESULTS_TABLE_NAME = 'compare_acnh_results_local'

class CompareACNHHandler(APILambdaHandlerBase):
    require_auth = False

    def _init(self):
        self.summary_table_name = LOCAL_SUMMARY_TABLE_NAME if self.is_local else SUMMARY_TABLE_NAME
        self.results_table_name = LOCAL_RESULTS_TABLE_NAME if self.is_local else RESULTS_TABLE_NAME
        self.actions = {
            'all_summary_items': self._get_all_summary_items,
            'get_summary_items': self._get_summary_items,
            'comparisons': self._get_comparisons,
            'save': self._save_result,
        }
        self.validation_actions = {
            'get_summary_items': self._validate_get_summary_items,
            'comparisons': self._validate_get_comparisons,
            'save': self._validate_save_result,
        }

    def _init_aws(self):
        self.ddb_client = self.aws_session.client('dynamodb', region_name='us-east-1')

    def _parse_payload(self, payload):
        self.action = payload.get('action')
        if not self.action:
            raise BadRequestException('action parameter required')
        self.action = self.action.lower()
        if self.action not in self.actions:
            raise BadRequestException('invalid action')
        self.payload = payload.get('payload')

    def _validate_get_comparisons(self):
        pass

    def _validate_save_result(self):
        self.winner = self.payload.get('winner')
        if self.winner is None:
            raise BadRequestException('winner parameter required')

        self.loser = self.payload.get('loser')
        if self.loser is None:
            raise BadRequestException('loser parameter required')

    def _validate_get_summary_items(self):
        self.villager_ids = self.payload.get('villager_ids')
        if self.villager_ids is None:
            raise BadRequestException('villager_ids parameter required')

    def _get_summary_items(self):
        request_keys = [{
            'villager_id': {
                'S': villager_id
            }
        } for villager_id in self.villager_ids]

        result = self.ddb_client.batch_get_item(
            RequestItems={
                self.summary_table_name: {
                    'Keys': request_keys
                }
            }
        )

        ddb_items = result.get('Responses', {}).get(self.summary_table_name, [])
        items = [self._ddb_item_to_json(ddb_item) for ddb_item in ddb_items]

        return items

    def _get_comparisons(self):
        return

    def _increment_summary_count(self, villager_id, column):
        self.ddb_client.update_item(
            TableName=self.summary_table_name,
            Key={
                'villager_id': {
                    'S': villager_id,
                },
            },
            UpdateExpression="ADD {} :v".format(column),
            ExpressionAttributeValues={
                ':v': {
                    'N': "1",
                },
            },
        )

    def _increment_result_count(self, villager_id, villager_id_2, column):
        self.ddb_client.update_item(
            TableName=self.results_table_name,
            Key={
                'v_id': {
                    'S': villager_id,
                },
                'v_id2': {
                    'S': villager_id_2,
                }
            },
            UpdateExpression="ADD {} :v".format(column),
            ExpressionAttributeValues={
                ':v': {
                    'N': "1",
                },
            },
        )

    def _save_result(self):
        self._increment_summary_count(self.winner, 'wins')
        self._increment_result_count(self.winner, self.loser, 'wins')

        self._increment_summary_count(self.loser, 'losses')
        self._increment_result_count(self.loser, self.winner, 'losses')

    def _get_all_summary_items(self):
        ddb_items = self.ddb_client.scan(
            TableName=self.summary_table_name,
        )['Items']
        items = [
            {
                key: value[list(value.keys())[0]]
                for key, value in ddb_item.items()
            } for ddb_item in ddb_items
        ]
        return items

    def _run(self):
        result = self.actions[self.action]()

        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "multiValueHeaders": {},
            "body": json.dumps(result)
        }


def lambda_handler(event, context):
    return CompareACNHHandler(event, context).handle()
