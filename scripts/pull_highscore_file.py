import os

import boto3

from base import BaseScript

BUCKET_NAME = "aseaman-public-bucket"
DOWNLOAD_DIR = "./outs/"


class PullHighscoreFile(BaseScript):
    aws_enabled = True

    def __init__(self):
        super(PullHighscoreFile, self).__init__()

    def _init_aws(self):
        super(PullHighscoreFile, self)._init_aws()
        self.s3_client = self.aws_session.client("s3", region_name="us-east-1")

    def _setup_parser(self):
        super(PullHighscoreFile, self)._setup_parser()
        self.parser.add_argument("--list", help="list games", action="store_true")
        self.parser.add_argument("--download", help="game id to download")

    def _validate_args(self):
        super(PullHighscoreFile, self)._validate_args()
        if self.args.download and self.args.list:
            raise Exception("one action only")
        if not self.args.download and not self.args.list:
            raise Exception("one action, please")

    def _list(self):
        response = self.s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix="hi/",
        )
        keys = [
            c["Key"].split("hi/")[1]
            for c in response["Contents"]
            if c["Key"].split("hi/")[1]
        ]
        print("")
        print("== Available highscore files ==")
        for key in keys:
            print(key)
        print("")

    def _download(self):
        filename = self.args.download.split(".hi")[0] + ".hi"
        key = "hi/" + filename
        local_filename = os.path.join(DOWNLOAD_DIR, filename)
        with open(local_filename, "wb") as data:
            self.s3_client.download_fileobj(BUCKET_NAME, key, data)

        print("")
        print(
            "Saved {} to {}".format(
                BUCKET_NAME + ":::" + key,
                local_filename,
            )
        )
        print("")

    def _run(self):
        if self.args.list:
            self._list()
        elif self.args.download:
            self._download()


if __name__ == "__main__":
    PullHighscoreFile().run()
