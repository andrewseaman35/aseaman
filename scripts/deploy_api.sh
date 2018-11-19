#!/bin/bash

export \
    BRANCH="$TRAVIS_BRANCH" \
    NONCE=$(date +%s) \
    STACKNAME=stack-$(DEPLOY_ENV)-$(NONCE) \
    LAMBDA_FUNCTION_NAME=lambda-api-$(DEPLOY_ENV)-$(NONCE)

if [ "$TRAVIS_BRANCH" == "develop" ]; then
    export DEPLOY_ENV="stage"
    make deploy
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    export DEPLOY_ENV="live"
    make deploy
else
    export DEPLOY_ENV="test"
    make deploy_test
fi
