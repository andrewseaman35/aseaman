import json
import logging

import boto3
from botocore.exceptions import ClientError

from typing import Any

from base.lambda_handler_base import LambdaHandlerBase
from base.aws import (
    AWSConfig,
    DynamoDBConfig,
    DynamoDBTableConfig,
    S3Config,
    SSMConfig,
)
from base.dynamodb import (
    WSConnectionDDBItem,
    WSConnectionTable,
    DynamoDBNotFoundException,
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)


class WSLambdaHandler(LambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[
                DynamoDBTableConfig("ws_connection", WSConnectionTable),
            ],
        ),
        s3=S3Config(enabled=False),
        ssm=SSMConfig(enabled=True),
    )

    def handle_connect(self, connection_id: str, username: str, room_id: str):
        status_code = 200

        print(f"Adding connection {connection_id}, room {room_id}, user {username}.")
        try:
            connection_item = WSConnectionDDBItem.from_dict(
                {
                    "connection_id": connection_id,
                    "room_id": room_id,
                    "username": username,
                }
            )
            self.aws.dynamodb.tables["ws_connection"].put(connection_item)
        except Exception as e:
            print(
                f"Couldn't add connection {connection_id} for user {username} in room {room_id}: {e}"
            )
            print(e)
            status_code = 503
        return status_code

    def handle_disconnect(self, connection_id: str) -> int:
        status_code = 200
        try:
            self.aws.dynamodb.tables["ws_connection"].delete(
                WSConnectionDDBItem.build_ddb_key(connection_id=connection_id)
            )
            print("Disconnected connection %s.", connection_id)
        except Exception as e:
            print(f"Couldn't disconnect connection {connection_id}: {e}")
            print(e)
            status_code = 503
        return status_code

    def handle_message(
        self, room_id: str, connection_id: str, event_body, apig_management_client
    ):
        logger.info("Handling message from connection %s.", connection_id)
        status_code = 200
        username = "guest"
        try:
            logger.info(
                f"Getting user name for connection {connection_id} in room {room_id}."
            )
            connection = self.aws.dynamodb.tables["ws_connection"].get(
                connection_id=connection_id, room_id=room_id
            )
            username = connection.username
            logger.info("Got user name %s.", username)
        except DynamoDBNotFoundException:
            logger.exception("Couldn't find user name. Using %s.", username)

        connection_ids = []
        try:
            connections = self.aws.dynamodb.tables["ws_connection"].scan(
                scan_dict={"room_id": room_id}
            )
            connection_ids = [item.connection_id for item in connections]
            logger.info("Found %s active connections.", len(connection_ids))
        except Exception as e:
            print(e)
            status_code = 404

        message = f"{username}: {event_body['message']}".encode()
        print(f"Message: {message}")

        for other_conn_id in connection_ids:
            try:
                if other_conn_id != connection_id:
                    send_response = apig_management_client.post_to_connection(
                        Data=message, ConnectionId=other_conn_id
                    )
                    print(
                        f"Posted message to connection {other_conn_id}, got response {send_response}."
                    )
            except ClientError:
                print(f"Couldn't post to connection {other_conn_id}.")
            except apig_management_client.exceptions.GoneException:
                print(f"Connection {other_conn_id} is gone, removing it.")
                try:
                    self.aws.dynamodb.tables["ws_connection"].delete(
                        WSConnectionDDBItem.build_ddb_key(connection_id=other_conn_id)
                    )
                except Exception as e:
                    print(f"Couldn't remove connection {other_conn_id}: {e}")

        return status_code

    def _handle_ws(self) -> dict[str, Any]:
        response: dict[str, Any] = {}
        event = self.event
        print("Received event: %s", json.dumps(event))
        request_context = event["requestContext"]
        route_key = request_context.get("routeKey")
        connection_id = event.get("requestContext", {}).get("connectionId", "12345")
        if route_key is None or connection_id is None:
            print("Missing route key or connection ID in request.")
            response["statusCode"] = 400
            return response

        query_parameters = event.get("queryStringParameters", {})

        if route_key == "$connect":
            user_name = query_parameters.get("name", "guest")
            room_id = query_parameters.get("room_id", "default")
            response["statusCode"] = self.handle_connect(
                connection_id, user_name, room_id
            )
        elif route_key == "$disconnect":
            response["statusCode"] = self.handle_disconnect(connection_id)
        elif route_key == "MESSAGE":
            body = event.get("body")
            if body is None:
                logger.warning("No body in request.")
                response["statusCode"] = 400
                return response

            body = json.loads(body)

            room_id = body.get("room_id", "default")
            domain = event.get("requestContext", {}).get("domainName")
            stage = event.get("requestContext", {}).get("stage")
            if domain is None or stage is None:
                logger.warning(
                    "Couldn't send message. Bad endpoint in request: domain '%s', "
                    "stage '%s'",
                    domain,
                    stage,
                )
                response["statusCode"] = 400
            else:
                logger.info(
                    "Sending message to all connections at %s/%s.", domain, stage
                )
                apig_management_client = boto3.client(
                    "apigatewaymanagementapi", endpoint_url=f"https://{domain}/{stage}"
                )
                response["statusCode"] = self.handle_message(
                    room_id, connection_id, body, apig_management_client
                )
        else:
            logger.warning("Unknown route key: %s", route_key)
            response["statusCode"] = 404

        return response

    def handle(self) -> dict[str, Any]:
        print(self.event)
        self._before_run()
        return self._handle_ws()


def lambda_handler(event: dict[Any, Any], context: dict[Any, Any]) -> dict[str, Any]:
    return WSLambdaHandler(event, context).handle()
