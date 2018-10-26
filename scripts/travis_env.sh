#!/usr/bin/env bash

mkdir -p ~/.aws

cat > ~/.aws/credentials << EOL
[default]
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_DEFAULT_REGION=us-east-1
EOL
