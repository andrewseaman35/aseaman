import sys
import time

import boto3

from script_data.acnh_villagers import villager_ids
from base import BaseScript


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def toItem(vid):
    return {
        'villager_id': { 'S': vid },
        'wins': { 'N': "0" },
        'losses': { 'N': "0" },
    }


class PopulateCompareACNHSummaryTable(BaseScript):
    aws_enabled = True

    def __init__(self):
        super(PopulateCompareACNHSummaryTable, self).__init__()
        self.all_villagers = villager_ids.copy()

    def _setup_parser(self):
        super(PopulateCompareACNHSummaryTable, self)._setup_parser()
        self.parser.add_argument("--table", help="DDB table to populate")
        self.parser.add_argument("--commit", help="Store things")

    def _validate_args(self):
        super(PopulateCompareACNHSummaryTable, self)._validate_args()
        self.table = self.args.table
        if not self.table:
            raise Exception('need table')
        self.commit = self.args.commit

    def _batch_write_villagers(self, villager_id_batch):
        requests = [
            {
                'PutRequest': {
                    'Item': toItem(villager_id),
                },
            } for villager_id in villager_id_batch
        ]
        if self.commit:
            ddb_client.batch_write_item(
                RequestItems={
                    table: requests
                }
            )
        return len(requests)

    def _run(self):
        print("Starting to populate table `{}`".format(self.table))
        print("  {}COMMITTING".format("" if self.commit else "NOT "))

        row_count = 0
        request_count = 0
        for villager_batch in chunks(self.all_villagers, 25):
            row_count += self._batch_write_villagers(villager_batch)
            request_count += 1

        print("Done!")
        print("  Total rows: {}".format(row_count))
        print("  Requests: {}".format(request_count))


if __name__ == '__main__':
    PopulateCompareACNHSummaryTable().run()
