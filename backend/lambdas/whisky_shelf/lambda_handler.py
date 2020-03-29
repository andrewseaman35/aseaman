import json

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import BadRequestException, UnauthorizedException

TABLE_NAME = 'whisky'
LOCAL_TABLE_NAME = 'whisky_local'

class WhiskyShelfLambdaHandler(APILambdaHandlerBase):
    auth_actions = {
        'get_current_shelf': False,
        'add_to_shelf': True,
        'remove_from_shelf': True,
    }

    @property
    def require_auth(self):
        return self.auth_actions[self.action]

    def _init(self):
        self.table_name = LOCAL_TABLE_NAME if self.is_local else TABLE_NAME
        self.actions = {
            'get_current_shelf': self._get_current_shelf,
            'add_to_shelf': self._add_to_shelf,
            'remove_from_shelf': self._remove_from_shelf,
        }
        self.validation_actions = {
            'add_to_shelf': self._validate_add_to_shelf,
            'remove_from_shelf': self._validate_remove_from_shelf,
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

    def _validate_add_to_shelf(self):
        self.distillery = self.payload.get('distillery')
        if self.distillery is None:
            raise BadRequestException('distillery parameter required')

        self.name = self.payload.get('name')
        if self.name is None:
            raise BadRequestException('name parameter required')

        self.type = self.payload.get('type')
        self.region = self.payload.get('region')
        self.country = self.payload.get('country')
        self.style = self.payload.get('style')
        self.age = self.payload.get('age')

    def _validate_remove_from_shelf(self):
        self.distillery = self.payload.get('distillery')
        if self.distillery is None:
            raise BadRequestException('distillery parameter required')

        self.name = self.payload.get('name')
        if self.name is None:
            raise BadRequestException('name parameter required')

    def _get_item(self, distillery, name):
        result = self.ddb_client.get_item(
            TableName=self.table_name,
            Key={
                'distillery': {
                    'S': distillery,
                },
                'name': {
                    'S': name,
                },
            }
        )

        return result.get('Item')

    def _update_item(self, distillery, name, current):
        expression_attribute_names = {
            '#cur': 'current',
        }
        expression_attribute_values = {
            ':cur': { 'BOOL': current }
        }
        update_expression_list = ['SET #cur = :cur']
        if getattr(self, 'type', None):
            expression_attribute_names['#typ'] = 'type'
            expression_attribute_values[':typ'] = { 'S': self.type }
            update_expression_list.append('#typ = :typ')
        if getattr(self, 'region', None):
            expression_attribute_names['#reg'] = 'region'
            expression_attribute_values[':reg'] = { 'S': self.region }
            update_expression_list.append('#reg = :reg')
        if getattr(self, 'country', None):
            expression_attribute_names['#cou'] = 'country'
            expression_attribute_values[':cou'] = { 'S': self.country }
            update_expression_list.append('#cou = :cou')
        if getattr(self, 'style', None):
            expression_attribute_names['#sty'] = 'style'
            expression_attribute_values[':sty'] = { 'S': self.style }
            update_expression_list.append('#sty = :sty')
        if getattr(self, 'age', None):
            expression_attribute_names['#age'] = 'age'
            expression_attribute_values[':age'] = { 'S': self.age }
            update_expression_list.append('#age = :age')

        self.ddb_client.update_item(
            TableName=self.table_name,
            Key={
                'distillery': {
                    'S': distillery,
                },
                'name': {
                    'S': name,
                },
            },
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            UpdateExpression=','.join(update_expression_list),
        )

    def _add_to_shelf(self):
        item = self._get_item(self.distillery, self.name)
        if item is None:
            print("Adding new item to shelf: {} {}".format(
                self.distillery,
                self.name,
            ))
            ddbItem = {
                'distillery': {
                    'S': self.distillery,
                },
                'name': {
                    'S': self.name,
                },
                'current': {
                    'BOOL': True,
                }
            }
            if self.type:
                ddbItem['type'] = { 'S': self.type }
            if self.region:
                ddbItem['region'] = { 'S': self.region }
            if self.country:
                ddbItem['country'] = { 'S': self.country }
            if self.style:
                ddbItem['style'] = { 'S': self.style }
            if self.age:
                ddbItem['age'] = { 'N': self.age }

            self.ddb_client.put_item(
                TableName=self.table_name,
                Item=ddbItem,
            )
            return {
                'distillery': self.distillery,
                'name': self.name,
                'current': True,
                'type': self.type,
                'region': self.region,
                'country': self.country,
                'style': self.style,
                'age': self.age,
            }
        else:
            print("Updating: {} {}".format(self.distillery, self.name))
            self._update_item(self.distillery, self.name, True)
            return {
                'distillery': item['distillery']['S'],
                'name': item['name']['S'],
                'current': item.get('current', {}).get('BOOL'),
                'type': item.get('type', {}).get('S'),
                'region': item.get('region', {}).get('S'),
                'country': item.get('country', {}).get('S'),
                'style': item.get('style', {}).get('S'),
                'age': item.get('age', {}).get('N'),
            }

    def _remove_from_shelf(self):
        item = self._get_item(self.distillery, self.name)
        if item is not None and item['current']['BOOL']:
            self._update_item(self.distillery, self.name, False)

    def _get_current_shelf(self):
        ddb_items = self.ddb_client.scan(
            TableName=self.table_name,
            ExpressionAttributeNames={
                '#cur': 'current',
            },
            ExpressionAttributeValues={
                ':true': {
                    'BOOL': True
                }
            },
            FilterExpression='#cur = :true',
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
    return WhiskyShelfLambdaHandler(event, context).handle()
