#!/bin/bash

if [[ $TRAVIS_PULL_REQUEST == "false" ]] ; then
  echo "Skip FVT"
else
  sed -i \
    "s,TRAVIS_COMMIT_MESSAGE,${TRAVIS_COMMIT_MESSAGE},g ; 
     s,TRAVIS_PULL_REQUEST_SHA,${TRAVIS_PULL_REQUEST_SHA},g ;
     s,TRAVIS_BRANCH,${TRAVIS_BRANCH},g ;
     s,FVT_URL,${FVT_URL},g ;" \
    message.json
  curl -X POST -H "Content-Type: Application/json" --data "@message.json" ${WEBHOOK_URL}
fi
