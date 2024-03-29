#!/bin/bash
set -euxo pipefail

export \
    BRANCH="$TRAVIS_BRANCH"

if [ "$TRAVIS_BRANCH" == "develop" ]; then
    export DEPLOY_ENV="stage"
    export API_URL="api.stage.andrewcseaman.com"
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    export DEPLOY_ENV="live"
    export API_URL="api.live.andrewcseaman.com"
else
    export DEPLOY_ENV="test"
    export \
        STACKNAME=stack-$DEPLOY_ENV-$BRANCH-$NONCE \
        API_URL=api-$NONCE.test.andrewcseaman.com \
        DRAW_JASPER_API_NAME=draw_jasper-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        SALT_LEVEL_API_NAME=salt_level-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        COMPARE_ACNH_API_NAME=compare_acnh-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        EVENT_API_NAME=event-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        MAME_HIGHSCORE_API_NAME=mame_highscore-api-$DEPLOY_ENV-$BRANCH-$NONCE \
        CHESS_API_NAME=chess-api-$DEPLOY_ENV-$BRANCH-$NONCE \
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
