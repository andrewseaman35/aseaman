#!/bin/bash

export \
    BRANCH="$TRAVIS_BRANCH" \
    NONCE=$(date +%s)

if [ "$TRAVIS_BRANCH" == "develop" ]; then
    export DEPLOY_ENV="stage"
    export \
        STACKNAME=stack-$DEPLOY_ENV-$NONCE \
        LAMBDA_FUNCTION_NAME=lambda-api-$DEPLOY_ENV-$NONCE \
        WHISKY_API_NAME=whisky-api-$DEPLOY_ENV-$NONCE
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    export DEPLOY_ENV="live"
    export \
        STACKNAME=stack-$DEPLOY_ENV-$NONCE \
        LAMBDA_FUNCTION_NAME=lambda-api-$DEPLOY_ENV-$NONCE \
        WHISKY_API_NAME=whisky-api-$DEPLOY_ENV-$NONCE
else
    export DEPLOY_ENV="test"
    export \
        STACKNAME=stack-$DEPLOY_ENV-$BRANCH-$NONCE \
        LAMBDA_FUNCTION_NAME=lambda-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        WHISKY_API_NAME=whisky-api-$DEPLOY_ENV-$BRANCH-$NONCE
fi

if [ "$TRAVIS_BRANCH" == "develop" ]; then
    make deploy
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    make deploy
else
    make deploy_test
fi

make remove_old_stacks
