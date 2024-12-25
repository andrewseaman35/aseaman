import json

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
)
from base.aws import AWSConfig, DynamoDBTableConfig, DynamoDBConfig
from base.dynamodb import (
    CompareACNHSummaryTable,
    CompareACNHResultsTable,
    CompareACNHSummaryItem,
    CompareACNHResultsItem,
)


def summarySortKey(item):
    return (-item["win_percentage"], -item["total"], item["villager_id"])


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

        items = [
            self._complete_summary_item(summary.to_dict()) for summary in summaries
        ]

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
        resource = self.get_resource()

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
        resource = self.get_resource()

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
