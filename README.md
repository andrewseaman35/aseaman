# aseaman

## Set up ##

`pre-commit install`

## Running Locally ##
### Website ###

Install NPM
`make start_local`

removed -g from `node_modules` target

Hit errors:
`/bin/sh: browserify: command not found`
and
`make[1]: sass: No such file or directory`

Run locally
`npm install -g browserify sass`

New tab
`make watch`

Download images from public bucket
python scripts/pull_public_s3_bucket.py --destination website/local_data/ --download
cd website && make assets

### Backend ###

`cd backend/api`
`make start_local`


#### Deploy ####

https://www.terraform.io/downloads.html

DEPLOY_ENV=stage make deploy

## TODO ##

Add early checks for `/bin/sh: aws: command not found`

brew install tflint

aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=test,PASSWORD=Beauisadog2! --client-id 107r5ru564tscdc95snh8rqhkf