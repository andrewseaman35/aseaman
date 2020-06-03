#!/bin/bash

export \
    BRANCH="$TRAVIS_BRANCH" \
    NONCE=$(date +%s)

if [ "$TRAVIS_BRANCH" == "develop" ]; then
    export DEPLOY_ENV="stage"
    export \
        STACKNAME=stack-$DEPLOY_ENV-$NONCE \
        API_URL=api-$NONCE.stage.andrewcseaman.com \
        STATE_API_NAME=state-api-$DEPLOY_ENV-$NONCE \
        WHISKY_API_NAME=whisky-api-$DEPLOY_ENV-$NONCE \
        DRAW_JASPER_API_NAME=draw_jasper-api-$DEPLOY_ENV-$NONCE \
        SALT_LEVEL_API_NAME=salt_level-api-$DEPLOY_ENV-$NONCE \
        COMPARE_ACNH_API_NAME=compare_acnh-api-$DEPLOY_ENV-$NONCE \
        HOSTED_ZONE_ID=Z1NTL75ESDHPUU \
        API_CERTIFICATE_ID=3aa91cb0-9bcb-4883-9fce-bb7a5d9da69d
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    export DEPLOY_ENV="live"
    export \
        STACKNAME=stack-$DEPLOY_ENV-$NONCE \
        API_URL=api-$NONCE.live.andrewcseaman.com \
        STATE_API_NAME=state-api-$DEPLOY_ENV-$NONCE \
        WHISKY_API_NAME=whisky-api-$DEPLOY_ENV-$NONCE \
        DRAW_JASPER_API_NAME=draw_jasper-api-$DEPLOY_ENV-$NONCE \
        SALT_LEVEL_API_NAME=salt_level-api-$DEPLOY_ENV-$NONCE \
        COMPARE_ACNH_API_NAME=compare_acnh-api-$DEPLOY_ENV-$NONCE \
        HOSTED_ZONE_ID=Z1NTL75ESDHPUU \
        API_CERTIFICATE_ID=bc74e242-e6b1-4d85-9c7e-318c328340fb
else
    export DEPLOY_ENV="test"
    export \
        STACKNAME=stack-$DEPLOY_ENV-$BRANCH-$NONCE \
        API_URL=api-$NONCE.test.andrewcseaman.com \
        STATE_API_NAME=state-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        WHISKY_API_NAME=whisky-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        DRAW_JASPER_API_NAME=draw_jasper-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        SALT_LEVEL_API_NAME=salt_level-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        COMPARE_ACNH_API_NAME=compare_acnh-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        HOSTED_ZONE_ID=Z1NTL75ESDHPUU \
        API_CERTIFICATE_ID=5af2f809-2459-4293-ae2d-d611ae4045bd
fi

if [ "$TRAVIS_BRANCH" == "develop" ]; then
    make deploy
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    make deploy
else
    make deploy_test
fi

make remove_old_stacks
