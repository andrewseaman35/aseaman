import os
import tempfile
from typing import Any, Callable, Union


class S3Bucket:
    def __init__(self, bucket_name: str, prefix: Union[str, Callable], s3_client: Any):
        self._bucket_name = bucket_name
        self._prefix = prefix
        self.s3_client = s3_client

    @property
    def prefix(self):
        if callable(self._prefix):
            return self._prefix()
        return self._prefix

    def _generate_s3_key(self, key):
        if self.prefix:
            return f"{self.prefix}/{key}"
        return key

    def _remove_prefix(self, key):
        if self.prefix:
            return key.split(f"{self.prefix}/")[1]
        return key

    def put(self, file_bytes, filename):
        key = self._generate_s3_key(filename)
        self.s3_client.put_object(
            Body=file_bytes,
            Bucket=self._bucket_name,
            Key=self._generate_s3_key(filename),
        )
        return self._remove_prefix(key)

    def download(self, key):
        tmpdir = tempfile.gettempdir()
        filename = key.split("/")[-1]
        local_filename = os.path.join(tmpdir, filename)
        with open(local_filename, "wb") as data:
            self.s3_client.download_fileobj(
                self._bucket_name,
                key,
                data,
            )
        return local_filename

    def list_objects(self, path):
        return self.s3_client.list_objects_v2(
            Bucket=self._bucket_name, MaxKeys=50, Prefix=self._generate_s3_key(path)
        )
