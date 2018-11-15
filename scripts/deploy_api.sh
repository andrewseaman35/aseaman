#!/bin/bash

if [ "$TRAVIS_BRANCH" == "develop" ]; then
    DEPLOY_ENV="$stage" BRANCH="$TRAVIS_BRANCH" make deploy
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    DEPLOY_ENV="$live" BRANCH="$TRAVIS_BRANCH" make deploy
else
    DEPLOY_ENV="$test" BRANCH="$TRAVIS_BRANCH" make deploy
fi
