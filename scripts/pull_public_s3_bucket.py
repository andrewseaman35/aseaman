import os

import boto3

from base import BaseScript

BUCKET_NAME = "aseaman-public-bucket"
WEBSITE_PREFIX = "aseaman/"

OMIT_PREFIXES = ["aseaman/images/jasper/jobs/"]


class PullPublicS3Bucket(BaseScript):
    aws_enabled = True

    def __init__(self):
        super(PullPublicS3Bucket, self).__init__()

    def _init_aws(self):
        super(PullPublicS3Bucket, self)._init_aws()
        self.s3_client = self.aws_session.client('s3', region_name='us-east-1')
        self.s3_resource = self.aws_session.resource('s3', region_name='us-east-1')

    def _setup_parser(self):
        super(PullPublicS3Bucket, self)._setup_parser()
        self.parser.add_argument("--download", help="actually download", action="store_true")
        self.parser.add_argument("--destination", help="destination of download")

    def _validate_args(self):
        super(PullPublicS3Bucket, self)._validate_args()
        if not self.args.destination:
            raise Exception('destination please')
        if self.args.download:
            confirm = input("this will overwrite any matched files in the destination, you sure? ")
            if confirm.lower() not in {'y, yes'}:
                raise Exception('nah')

    def _download_dir(self, prefix, local, bucket, download=False):
        """
        Downloads all contents of an S3 bucket with the given prefix
        """
        paginator = self.s3_client.get_paginator('list_objects')
        for result in paginator.paginate(Bucket=bucket, Delimiter='/', Prefix=prefix):
            if result.get('CommonPrefixes') is not None:
                for subdir in result.get('CommonPrefixes'):
                    if not any(subdir.get('Prefix', '').startswith(pref) for pref in OMIT_PREFIXES):
                        self._download_dir(subdir.get('Prefix'), local, bucket, download=download)
            if result.get('Contents') is not None:
                for file in result.get('Contents'):
                    if not os.path.exists(os.path.dirname(local + os.sep + file.get('Key'))):
                         os.makedirs(os.path.dirname(local + os.sep + file.get('Key')))
                    print("{}{}{}".format(
                        "Downloading " if self.args.download else "",
                        file.get('Key'),
                        " --> " + os.path.abspath(local + os.sep + file.get('Key')),
                    ))
                    if self.args.download:
                        try:
                            self.s3_resource.meta.client.download_file(bucket, file.get('Key'), local + file.get('Key'))
                        except Exception as e:
                            print("WARNING: {}".format(e))
                            pass

    def _run(self):
        self._download_dir(WEBSITE_PREFIX, self.args.destination, BUCKET_NAME, self.args.download)


if __name__ == '__main__':
    PullPublicS3Bucket().run()
