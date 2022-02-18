FROM python:3.9-slim-buster

RUN apt-get update -y && \
    apt-get install -y python-pip python-dev

COPY local_requirements.txt /app/requirements.txt

WORKDIR /app

ENV AWS_SHARED_CREDENTIALS_FILE="/.aws/credentials"

RUN pip install -r requirements.txt

COPY development/ /aseaman

ENTRYPOINT [ "python" ]

CMD [ "/app/local_backend.py" ]