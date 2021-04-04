import json
import random
import re
import string
import time

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    UnauthorizedException,
    NotFoundException,
)

TABLE_NAME = 'chess_game'
LOCAL_TABLE_NAME = 'chess_game'

GAME_ID_LENGTH = 6
TURN_REGEX_PATTERN = r'(?P<side>WHITE|BLACK)\|(?P<starting_space>[A-Z]\d)\|(?P<ending_space>[A-Z]\d)\|(?P<turn_type>\w+)\|(?P<options>\w*)'

class ChessLambdaHandler(APILambdaHandlerBase):
    require_auth = False

    primary_partition_key = 'game_id'

    def _init(self):
        self.table_name = LOCAL_TABLE_NAME if self.is_local else TABLE_NAME
        self.actions = {
            'new_game': self._new_game,
            'get_game': self._get_game,
            'save_turn': self._save_turn,
        }
        self.validation_actions = {
            'new_game': self._validate_new_game,
            'get_game': self._validate_get_game,
            'save_turn': self._validate_save_turn,
        }

        self.turn_regex_pattern = re.compile(TURN_REGEX_PATTERN)

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

    def _deserialize_turn(self, turn):
        match = self.turn_regex_pattern.match(turn)
        if not match:
            raise BadRequestException('invalid turn format')
        side, starting_space, ending_space, turn_type = match.groups()
        if side not in {'WHITE', 'BLACK'}:
            raise BadRequestException('invalid side')
        if turn_type not in {'normal', 'kingside_castle', 'queenside_castle', 'en_passant', 'promotion'}:
            raise BadRequestException('invalid turn type')
        return {
            'side': side,
            'starting_space': starting_space,
            'ending_space': ending_space,
            'turn_type': turn_type,
            'options': options,
        }

    def _validate_new_game(self):
        pass

    def _validate_get_game(self):
        if 'game_id' not in self.payload:
            raise BadRequestException('game_id parameter required')

    def _validate_save_turn(self):
        if 'game_id' not in self.payload:
            raise BadRequestException('game_id parameter required')
        if 'turn' not in self.payload:
            raise BadRequestException('turn parameter required')

    def _new_game_id(self):
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=GAME_ID_LENGTH))

    def _get_timestamp(self):
        return str(int(time.time()))

    def _format_ddb_item(self, ddbItem):
        print(ddbItem)
        return {
            'game_id': ddbItem['game_id']['S'],
            'turns': [
                turn['S'] for turn in ddbItem['turns']['L']
            ],
            'time_created': ddbItem['time_created']['N'],
            'time_updated': ddbItem['time_updated']['N'],
        }

    def _build_new_game_ddb_item(self):
        timestamp = self._get_timestamp()
        return {
            'game_id': {
                'S': self._new_game_id(),
            },
            'turns': {
                'L': [],
            },
            'time_created': {
                'N': timestamp,
            },
            'time_updated': {
                'N': timestamp,
            },
        }

    def __fetch_game(self, game_id):
        ddbItem = self.ddb_client.get_item(
            TableName=self.table_name,
            Key={
                'game_id': {
                    'S': game_id,
                },
            },
        )
        if 'Item' not in ddbItem:
            raise NotFoundException('game not found')

        return self._format_ddb_item(ddbItem['Item'])

    def _get_game(self):
        return self.__fetch_game(self.payload['game_id'])

    def _new_game(self):
        print("Creating new game")
        ddbItem = self._build_new_game_ddb_item()
        self.ddb_client.put_item(
            TableName=self.table_name,
            Item=ddbItem,
        )
        return self._format_ddb_item(ddbItem)

    def _save_turn(self):
        print("saving new turn")
        new_turn = self._deserialize_turn(self.payload['turn'])
        game = self.__fetch_game(self.payload['game_id'])
        print(game)
        if game['turns']:
            serialized_last_turn = game['turns'][-1]
            last_turn = self._deserialize_turn(serialized_last_turn)
            if new_turn['side'] == last_turn['side']:
                raise BadRequestException(f"not {new_turn['side']}'s turn!")

        response = self.ddb_client.update_item(
            TableName=self.table_name,
            Key={
                'game_id': {
                    'S': self.payload['game_id']
                },
            },
            UpdateExpression="SET turns = list_append(#t, :t), #tu = :tu",
            ExpressionAttributeNames={
                '#t': 'turns',
                '#tu': 'time_updated',
            },
            ExpressionAttributeValues={
                ':t': {'L': [{ 'S': self.payload['turn'] }]},
                ':tu': { 'N': self._get_timestamp() },
            },
            ReturnValues='ALL_NEW',
        )
        return response

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
    return ChessLambdaHandler(event, context).handle()
