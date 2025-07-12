FROM python:3.13-slim-buster

RUN apt-get update -y && \
    apt-get install -y python-pip python-dev

COPY local_requirements.txt /app/requirements.txt

WORKDIR /app

ENV AWS_SHARED_CREDENTIALS_FILE="/.aws/credentials"
ENV IN_DOCKER_API="true"
ENV ENV="local"
ENV HOSTNAME="localhost:8123"

RUN pip install -r /app/requirements.txt

COPY development/ /aseaman

ENTRYPOINT [ "python" ]

CMD [ "/app/local_backend.py" ]