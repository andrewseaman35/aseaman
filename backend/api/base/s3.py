from typing import Callable, Union


class S3Bucket:
    def __init__(self, bucket_name, prefix, s3_client):
        self._bucket_name = bucket_name
        self._prefix = prefix
        self.s3_client = s3_client

    def _prefix(self):
        if callable(self.prefix):
            return self.prefix()
        return self.prefix

    def _generate_s3_key(self, key):
        if self._prefix():
            return f"{self._prefix()}/{key}"
        return key

    def _remove_prefix(self, key):
        if self._prefix():
            return key.split(f"{self._prefix()}/")[1]
        return key

    def put(self, file_bytes, filename):
        key = self._generate_s3_key(filename)
        self.s3_client.put_object(
            Body=file_bytes,
            Bucket=self._bucket_name,
            Key=self._generate_s3_key(filename),
        )
        return self._remove_prefix(key)
