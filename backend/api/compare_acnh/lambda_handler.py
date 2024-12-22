import json

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
)
from base.aws import AWSConfig, DynamoDBTableConfig, DynamoDBConfig
from base.dynamodb import DynamoDBTable, DynamoDBItem, DynamoDBItemValueConfig


def summarySortKey(item):
    return (-item["win_percentage"], -item["total"], item["villager_id"])


class CompareACNHSummaryItem(DynamoDBItem):
    _timestamp_key = None

    _config = {
        "villager_id": DynamoDBItemValueConfig("S"),
        "losses": DynamoDBItemValueConfig("N"),
        "wins": DynamoDBItemValueConfig("N"),
    }

    @classmethod
    def build_ddb_key(cls, *args, villager_id=None, **kwargs):
        assert villager_id is not None, "villager_id required to build ddb key"
        return {
            "villager_id": {
                "S": villager_id,
            }
        }


class CompareACNHResultsItem(DynamoDBItem):
    _timestamp_key = None

    _config = {
        "v_id": DynamoDBItemValueConfig("S"),
        "v_id2": DynamoDBItemValueConfig("S"),
        "losses": DynamoDBItemValueConfig("N"),
        "wins": DynamoDBItemValueConfig("N"),
    }

    @classmethod
    def build_ddb_key(cls, *args, villager_id=None, villager_id_2=None, **kwargs):
        assert villager_id is not None, "villager_id required to build ddb key"
        assert villager_id_2 is not None, "villager_id_2 required to build ddb key"
        return {
            "v_id": {
                "S": villager_id,
            },
            "v_id2": {
                "S": villager_id_2,
            },
        }


class CompareACNHSummaryTable(DynamoDBTable):
    ItemClass = CompareACNHSummaryItem


class CompareACNHResultsTable(DynamoDBTable):
    ItemClass = CompareACNHResultsItem


class CompareACNHHandler(APILambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[
                DynamoDBTableConfig("compare_acnh_summary", CompareACNHSummaryTable),
                DynamoDBTableConfig("compare_acnh_results", CompareACNHResultsTable),
            ],
        )
    )

    def _complete_summary_items(self, items):
        for item in items:
            self._complete_summary_item(item)
        return items

    def _complete_summary_item(self, item):
        wins = int(item["wins"])
        losses = int(item["losses"])
        total = wins + losses
        win_percentage = round(100 * (wins / total), 2) if total else 0
        item["total"] = total
        item["win_percentage"] = win_percentage
        return item

    def _get_all_summary_items(self):
        summaries = self.aws.dynamodb.tables["compare_acnh_summary"].scan()
        items = [
            self._complete_summary_item(summary.to_dict()) for summary in summaries
        ]
        return sorted(items, key=summarySortKey)

    def _get_summary_items(self, villager_ids):
        request_keys = [
            CompareACNHSummaryItem.build_ddb_key(village_id=villager_id)
            for villager_id in villager_ids
        ]

        summaries = self.aws.dynamodb.tables["compare_acnh_summary"].batch_get(
            request_keys
        )

        items = self._complete_summary_items(
            [self._ddb_item_to_json(summary.to_dict()) for summary in summaries]
        )

        return sorted(items, key=summarySortKey)

    def _get_results(self, villager_id):
        query_dict = {
            "v_id": villager_id,
        }
        results = self.aws.dynamodb.tables["compare_acnh_results"].query(query_dict)

        return [result.to_dict() for result in results]

    def _increment_summary_count(self, villager_id, column):
        update_dict = {
            column: {
                "value": "1",
                "operation": "ADD",
            },
        }
        self.aws.dynamodb.tables["compare_acnh_summary"].update(
            CompareACNHSummaryItem.build_ddb_key(villager_id=villager_id),
            update_dict,
        )

    def _increment_result_count(self, villager_id, villager_id_2, column):
        update_dict = {
            column: {
                "value": "1",
                "operation": "ADD",
            },
        }
        self.aws.dynamodb.tables["compare_acnh_results"].update(
            CompareACNHResultsItem.build_ddb_key(
                villager_id=villager_id, villager_id_2=villager_id_2
            ),
            update_dict,
        )

    def _save_result(self, winner, loser):
        self._increment_summary_count(winner, "wins")
        self._increment_result_count(winner, loser, "wins")

        self._increment_summary_count(loser, "losses")
        self._increment_result_count(loser, winner, "losses")

    def handle_get(self):
        path_parts = self.event["path"].strip("/").split("/")
        resource = path_parts[1] if len(path_parts) > 1 else None

        if resource == "summary":
            villager_ids = self.params.get("villager_id")
            results = (
                self._get_summary_items(villager_ids)
                if villager_ids
                else self._get_all_summary_items()
            )
        elif resource == "result":
            villager_id = self.params["villager_id"]
            results = self._get_results(villager_id)
        else:
            raise NotFoundException("unsupported resource: {}".format(resource))

        return {**self._empty_response(), "body": json.dumps(results)}

    def handle_post(self):
        path_parts = self.event["path"].strip("/").split("/")
        resource = path_parts[1] if len(path_parts) > 1 else None

        if resource == "result":
            winner_id = self.params.get("winnerId")
            loser_id = self.params.get("loserId")
            if not winner_id or not loser_id:
                raise BadRequestException("winnerId and loserId required")
            self._save_result(winner_id, loser_id)
        else:
            raise NotFoundException("unsupported resource: {}".format(resource))

        return self._empty_response()


def lambda_handler(event, context):
    return CompareACNHHandler(event, context).handle()
