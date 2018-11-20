#!/bin/bash

export \
    BRANCH="$TRAVIS_BRANCH" \
    NONCE=$(date +%s)

export \
    STACKNAME=stack-$(DEPLOY_ENV)-$(NONCE) \
    LAMBDA_FUNCTION_NAME=lambda-api-$(DEPLOY_ENV)-$(NONCE)

if [ "$TRAVIS_BRANCH" == "develop" ]; then
    export DEPLOY_ENV="stage"
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    export DEPLOY_ENV="live"
else
    export DEPLOY_ENV="test"
fi

export \
    STACKNAME=stack-$(DEPLOY_ENV)-$(NONCE) \
    LAMBDA_FUNCTION_NAME=lambda-api-$(DEPLOY_ENV)-$(NONCE)

if [ "$TRAVIS_BRANCH" == "develop" ]; then
    make deploy
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    make deploy
else
    make deploy_test
fi
