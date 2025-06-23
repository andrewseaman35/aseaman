import os
from typing import Any

from base import BaseScript

BUCKET_NAME = "aseaman-public-bucket"
WEBSITE_PREFIX = "aseaman/images/"


class UploadImagesToPublicBucket(BaseScript):
    aws_enabled = True

    def __init__(self) -> None:
        super(UploadImagesToPublicBucket, self).__init__()

    def _init_aws(self) -> None:
        super(UploadImagesToPublicBucket, self)._init_aws()
        self.s3_client: Any = self.aws_session.client("s3", region_name="us-east-1")

    def _setup_parser(self) -> None:
        super(UploadImagesToPublicBucket, self)._setup_parser()
        self.parser.add_argument(
            "--prefix", help="prefix: images/<prefix>/...", dest="prefix"
        )
        self.parser.add_argument(
            "--image-dir",
            required=True,
            help="Directory containing images to upload",
            dest="image_dir",
        )

    def _validate_args(self) -> None:
        super(UploadImagesToPublicBucket, self)._validate_args()
        if not self.args.prefix:
            raise Exception("prefix please")

    def _run(self) -> None:
        prefix: str = self.args.prefix
        if not prefix.endswith("/"):
            prefix += "/"

        if not self.confirm(
            f"Are you sure you want to upload images to {BUCKET_NAME} with prefix {prefix}?"
        ):
            print("Upload cancelled.")
            return

        print(f"Uploading images to {BUCKET_NAME} with prefix {prefix}")

        for root, dirs, files in os.walk(self.args.image_dir):
            for file in files:
                local_path: str = os.path.join(root, file)
                s3_path: str = os.path.join(WEBSITE_PREFIX, prefix, file)

                print(f"Uploading {local_path} to s3://{BUCKET_NAME}/{s3_path}")
                self.s3_client.upload_file(
                    local_path, BUCKET_NAME, s3_path, ExtraArgs={"ACL": "public-read"}
                )


if __name__ == "__main__":
    UploadImagesToPublicBucket().run()
