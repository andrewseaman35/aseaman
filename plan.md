# My Website Plan #

I want to build myself a website. It'll both be functional and maybe act as a website/playground for things.

## Functions ##

### S3 Interface ###

I store a lot of files in AWS S3 which are currently only accessible through the AWS console. This isn't
very reasonable, given that it's very difficult to access when I'm not on my own computer. The website should
have a logged in site where I can log in via a username and password in order to access my files more easily.

It would also be quite cool if I could share files through this as well. My thought now is to be able to
generate a unique link to the website as well as a password. I can give someone else the link and the password
and they'd be granted onetime download access to a single file.

### Demo Logged in Site ###

I could also have different user levels - this would be good to allow others to demo the website without giving
them access to my real files. A demo user might have access to a demo bucket, or to a subset of prefixes within
the main bucket. Or maybe I could just have a dummy logged in site that points to a bucket with public material.

### Public Site ###

The public site should have, at a minimum, my resume. It would also be cool to have a write-up on how the site
itself works.

I'm starting to think that it'd be cool for the public site to have things about me and that I like doing. For
example, since we've been doing some cooking classes lately, it might be nice to document the classes and what
we're cooking and learning there too.

Possible categories of documentation for the future:

* Cooking
* Kickboxing
* Hikes
* Vacations
* Things I build
* Things I learn about cars
* Jasper
* Events
* Books
* Things I learn about programming
* Things I learn about home maintenance
* Back unit build status and teachings

## Infrastructure ##

I want to build this with a Serverless model. I have not yet decided whether I want to use Serverless or do it
manually. It might be good to start with Serverless and then move over to custom CloudFormation. No, I think I want
to do it all myself.

I want some sort of CI/CD. I can set up CD for the static website through GitHub webhooks, SNS/API Gateway, lambda.
I can also consider working with Travis, which I think is free. I'm not sure whether I'll need to run backend deploys
alongside my frontend deploys. I don't think I'll need to. I'll just deploy the backend changes first.

I need this thing to be cheap to run, since it doesn't bring much value to me. The frontend will be a purely static
website hosted in S3. I'm not sure whether I'm willing to pay for a hostname. I'm not sure whether I'm going to mess
around with webpack and other things like that. I probably will eventually.

The backend will be serverless, but not Serverless. I'll have to look up best practices regarding auth and account
management. I think I'll likely use DynamoDB for users and maybe KMS for key management. I could do token management
through Dynamo, but it might be fun to mess with KMS. I don't think that DynamoDB costs too much to store without access.

## Initial Approach ##

These are the things (maybe in order) that I'll need to do to get started. When starting out with data access, I think
I'll only do single object access at first. I'll need to look into authentication to see the best way to do this. Also,
I should set up a dummy bucket and maybe different environments?

* Make Travis account - DONE
* Set up Travis to deploy to S3 on Github merge into master - DONE
* Set up basic cloudformation template for simple serverless lambda API - DONE
* Start adding some level of content to the static website (get designs from Victoria)
* Set up DynamoDB user table
* Write initial Lambda functions for data access
  * Create user (leave this private for now, create via manual invocation)
  * Token vending machine
    * Login
    * Refresh
    * Logout
  * List files in S3
  * Generate presigned URL
* Choose a couple of the content categories to start with
  * Develop some sort of templating system for the content
    * Templates based on length?
    * Templates based on number of images?
    * Templates based on content category?
  * Keep it simple at first, and then iterate
* Maybe I can make the website self-sustainable once there's at least one template
  * Content creation page
    * Upload content
    * Content goes to S3 bucket, triggers Travis download, commit and push to git to retrigger new release

# Write Up #

This website is an ongoing project on mine that I'm using as a way to mess around and learn new things. It had a couple
of initial goals but is frequently changing with no final goal in mind.
Along with the websites eventual functionality,
I have exactly one additional requirement: cost. Because I plan on keeping the website up for some time as well as having
multiple environments up at a single time, I need to make sure that the website is very cost effective.

To fulfil this requirement, I've set up the website to be hosted statically in S3 and be supported by a serverless API
using API Gateway and Lambda. This architecture minimizes the cost incurred by running the website, since costs are
only incurred when the site is being used. I don't expect this site to be viewed basically ever, and if someone is looking
at it (you), I'd be willing to pay a few tenths of a cent to support that.


## Technologies ##

This is the (hopefully) ever-growing list of technologies I'm using for this website.

### AWS ###

* API Gateway
* Cloudformation
* Cloudfront
* Cognito
* Lambda
* S3

### Languages ###

* HTML, CSS, JavaScript
* Python
* Bash

### Tools ###

* Travis

## Environments ##

The first thing that I wanted to do was to set up was a pipeline to easily write code, deploy changes to test environments,
and then deploy them live. I decided to do this before actually writing any code since it would increase my ability to make
changes vastly, so the earlier it was available, the better. I wanted to try out Travis to support this endeavor.

I set up three environments, `live`, `stage`, and `test`. The `test` environment is a little bit special, but I'll get to this
later. Each of the environments had its own S3 bucket, but that's about it. I wrote a quick `index.html`, uploaded, and BAM,
I was live!

** Include Picture: site_1.png **

I was planning on setting up most of the AWS
infrastructure through AWS Cloudformation. Through Travis, I set up S3 deploys to `live`, `stage`, and `test` based on the
branch name, `master` goes to `live`, `develop` to `stage` and everything else to `test`. On top of this, I set up a
Cloudformation template that would deploy a simple serverless stack pointing to a stubbed Lambda function. At this point,
each commit would do the following:

1. Create a Cloudformation stack with a unique name with a Lambda function and associated API Gateway
2. Upload the static website files to the S3 bucket associated with the given branch

This wasn't enough. I didn't like how if I had multiple branches for features at the same time, only one would be able to
exist in my `test` bucket at a time. This wasn't _actually_ an issue since I was the only one working on the website, but
it sounded like a fun problem to solve.

To solve this, I updated my Travis script to deploy feature branches to a location in S3 prefixed with the branch name.
For example, pushing `index.html` in branch called `my-branch` would be uploaded to `test-bucket/my-branch/index.html`
instead of `test-bucket/index.html` as it was formally. This enabled the existence of multiple copies of the website at
different URL paths. I then set up a basic frontend for the homepage of the test site. On load, this page listed all the
keys in the root of the `test` S3 bucket and provided links to all of the available paths. My own little testing hub with
new environments available on every push -- sweet.

** Include Picture: testing_hub_1.png **

Add some deletion of the old stacks that correspond to the environment and branch that is being deployed, add some lifecycle
rules to the buckets that host the static files, and we have a sustainable development pipeline!



https://github.com/aws-samples/aws-serverless-security-workshop
