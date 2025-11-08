import sys
import time

import boto3

from script_data.acnh_villagers import villager_ids
from base import BaseScript


RUNNING_AVERAGE_COUNT = 10


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def toItem(vid, vidto):
    return {
        "v_id": {"S": vid},
        "v_id2": {"S": vidto},
        "wins": {"N": "0"},
        "losses": {"N": "0"},
    }


class PopulateCompareACNHResultsTable(BaseScript):
    aws_enabled = True

    def __init__(self):
        super(PopulateCompareACNHResultsTable, self).__init__()
        self.all_villagers = villager_ids.copy()

    def _setup_parser(self):
        super(PopulateCompareACNHResultsTable, self)._setup_parser()
        self.parser.add_argument("--table", help="DDB table to populate")
        self.parser.add_argument("--commit", help="Store things")
        self.parser.add_argument("--start", help="Villager id to start at")

    def _validate_args(self):
        super(PopulateCompareACNHResultsTable, self)._validate_args()
        self.table = self.args.table
        if not self.table:
            raise Exception("need table")
        self.commit = self.args.commit
        self.start = self.args.start

    def _batch_write_second_villagers(self, villager_id, villager_batch):
        requests = [
            {
                "PutRequest": {
                    "Item": toItem(villager_id, villager_id_to),
                },
            }
            for villager_id_to in villager_batch
            if villager_id_to != villager_id
        ]
        if self.commit:
            ddb_client.batch_write_item(RequestItems={table: requests})
        return len(requests)

    def _run(self):
        print("Starting to populate table {}".format(self.table))
        print("  {}COMMITTING".format("" if self.commit else "NOT "))
        start_index = self.all_villagers.index(self.start) if self.start else 0
        trimmed_villager_ids = villager_ids[start_index:]

        populated_count = 0
        row_count = 0
        request_count = 0
        villager_times = []

        for villager_id in villager_ids:
            populated_count += 1
            villager_start_time = round(time.time(), 2)

            print(
                "Populating villager {}/{}: `{}`".format(
                    populated_count, len(villager_ids), villager_id
                )
            )
            for villager_batch in chunks(self.all_villagers, 25):
                sys.stdout.write(".")
                sys.stdout.flush()
                row_count += self._batch_write_second_villagers(
                    villager_id, villager_batch
                )
                request_count += 1

            villager_end_time = round(time.time(), 2)
            villager_time = round(villager_end_time - villager_start_time, 2)
            villager_times.append(villager_time)

            average_time = round(sum(villager_times) / len(villager_times), 2)

            print()
            print("Finished {}".format(villager_id))
            print("  Time: {}".format(villager_time))
            print("  Average time per villager: {}".format(average_time))

            last_n = villager_times[-RUNNING_AVERAGE_COUNT:]
            average_of_last_m = round(sum(last_n) / len(last_n), 2)
            print("  Average of last 3: {}".format(average_of_last_m))

            remaining_villager_count = len(villager_ids) - populated_count
            est_reminaing = round(average_time * remaining_villager_count, 2)
            est_reminaing_last = round(average_of_last_m * remaining_villager_count, 2)
            print("  Estimated time remaining (all): {}".format(est_reminaing))
            print("  Estimated time remaining (last): {}".format(est_reminaing_last))
            print()

        print("Done!")
        print("total rows: {}".format(row_count))
        print("requests: {}".format(request_count))


if __name__ == "__main__":
    PopulateCompareACNHResultsTable().run()
