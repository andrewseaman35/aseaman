#!/bin/bash

if [ "$TRAVIS_BRANCH" == "develop" ]; then
    make deploy
fi
