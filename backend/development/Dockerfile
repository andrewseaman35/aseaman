FROM ubuntu:16.04

RUN apt-get update -y && \
    apt-get install -y python-pip python-dev

COPY local_requirements.txt /app/requirements.txt

WORKDIR /app

ENV AWS_SHARED_CREDENTIALS_FILE="/.aws/credentials"

RUN pip install -r requirements.txt

COPY development/ /app

ENTRYPOINT [ "python" ]

CMD [ "/app/local_backend.py" ]