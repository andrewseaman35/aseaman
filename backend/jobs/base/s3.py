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

    def put(self, file_bytes, filename, content_type=None, remove_prefix=True):
        key = self._generate_s3_key(filename)
        kwargs = {
            "Body": file_bytes,
            "Bucket": self._bucket_name,
            "Key": self._generate_s3_key(filename),
        }
        if content_type is not None:
            kwargs["ContentType"] = content_type
        self.s3_client.put_object(**kwargs)
        if remove_prefix:
            return self._remove_prefix(key)
        return key

    def head(self, key):
        return self.s3_client.head_object(
            Bucket=self._bucket_name,
            Key=key,
        )

    def download(self, key, include_prefix=False):
        tmpdir = tempfile.gettempdir()
        filename = key.split("/")[-1]
        local_filename = os.path.join(tmpdir, filename)
        if include_prefix:
            key = self._generate_s3_key(key)
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

    def presigned_url(self, key: str, expires_in: int = 3600) -> str:
        if not key:
            return None
        return self.s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket_name, "Key": key},
            ExpiresIn=expires_in,
        )
