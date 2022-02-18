import json

from boto3.dynamodb.conditions import Key

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
)

SUMMARY_TABLE_NAME = 'compare_acnh_summary'
LOCAL_SUMMARY_TABLE_NAME = 'compare_acnh_summary_local'

RESULTS_TABLE_NAME = 'compare_acnh_results'
LOCAL_RESULTS_TABLE_NAME = 'compare_acnh_results_local'


def summarySortKey(item):
    return (
        -item['win_percentage'],
        -item['total'],
        item['villager_id']
    )


class CompareACNHHandler(APILambdaHandlerBase):
    require_auth = False

    def _init(self):
        self.summary_table_name = LOCAL_SUMMARY_TABLE_NAME if self.is_local else SUMMARY_TABLE_NAME
        self.results_table_name = LOCAL_RESULTS_TABLE_NAME if self.is_local else RESULTS_TABLE_NAME

    def _init_aws(self):
        self.ddb_client = self.aws_session.client('dynamodb', region_name='us-east-1')

    def _complete_summary_items(self, items):
        for item in items:
            wins = int(item['wins'])
            losses = int(item['losses'])
            total = wins + losses
            win_percentage = round(100 * (wins / total), 2) if total else 0
            item['total'] = total
            item['win_percentage'] = win_percentage
        return items

    def _get_all_summary_items(self):
        ddb_items = self.ddb_client.scan(
            TableName=self.summary_table_name,
        )['Items']
        items = self._complete_summary_items(
            [self._ddb_item_to_json(ddb_item) for ddb_item in ddb_items]
        )
        return sorted(items, key=summarySortKey)

    def _get_summary_items(self, villager_ids):
        request_keys = [{
            'villager_id': {
                'S': villager_id
            }
        } for villager_id in villager_ids]

        result = self.ddb_client.batch_get_item(
            RequestItems={
                self.summary_table_name: {
                    'Keys': request_keys
                }
            }
        )

        ddb_items = result.get('Responses', {}).get(self.summary_table_name, [])
        items = self._complete_summary_items(
            [self._ddb_item_to_json(ddb_item) for ddb_item in ddb_items]
        )

        return sorted(items, key=summarySortKey)

    def _get_results(self, villager_id):
        result = self.ddb_client.query(
            TableName=self.results_table_name,
            Select='ALL_ATTRIBUTES',
            ConsistentRead=False,
            KeyConditionExpression='v_id = :vid',
            ExpressionAttributeValues={
                ':vid': {
                    'S': villager_id,
                },
            },
        )

        ddb_items = result.get('Items', [])
        items = [self._ddb_item_to_json(ddb_item) for ddb_item in ddb_items]

        return items

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

    def _save_result(self, winner, loser):
        self._increment_summary_count(winner, 'wins')
        self._increment_result_count(winner, loser, 'wins')

        self._increment_summary_count(loser, 'losses')
        self._increment_result_count(loser, winner, 'losses')

    def handle_get(self):
        path_parts = self.event['path'].strip('/').split('/')
        resource = path_parts[1] if len(path_parts) > 1 else None

        if resource == 'summary':
            villager_ids = self.params.get('villager_id')
            results = self._get_summary_items(villager_ids) if villager_ids else self._get_all_summary_items()
        elif resource == 'result':
            villager_id = self.params['villager_id']
            results = self._get_results(villager_id)
        else:
            raise NotFoundException('unsupported resource: {}'.format(resource))

        return {
            **self._empty_response(),
            'body': json.dumps(results)
        }

    def handle_post(self):
        path_parts = self.event['path'].strip('/').split('/')
        resource = path_parts[1] if len(path_parts) > 1 else None

        if resource == "result":
            winner_id = self.params.get('winnerId')
            loser_id = self.params.get('loserId')
            if not winner_id or not loser_id:
                raise BadRequestException('winnerId and loserId required')
            self._save_result(winner_id, loser_id)
        else:
            raise NotFoundException('unsupported resource: {}'.format(resource))

        return self._empty_response()


def lambda_handler(event, context):
    return CompareACNHHandler(event, context).handle()
