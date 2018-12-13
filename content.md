# Home #

Welcome, this is a website.

This website is an ongoing project on mine that I'm using as a way to mess around and learn new things. It started with a couple
of initial goals but has been quickly changing with no final goal in mind. Take a look around, though there's not too much to see.

* Website
* Social

## Website ##

This page is about this website. You can check out the source here if you'd like: *github link*

Once again, this website is a personal project of mine that I'm building for fun and for the sake of building. I have some goals
to make it somewhat functional and helpful but until those things have been implemented, we won't be mentioning them here.

This website is built on AWS and is currently hosted as a static website in an S3 bucket. I also have a nice little CloudFront
distribution set up in front of my live bucket. Wait, "live"? Does that mean there's more than one environment for this static
website? Yes. There are three, and yes, that's somewhat unnecessary for a personal project with exactly one contributor and zero
viewers, but alas, build for the sake of building, right?

You can check out the *staging environment* and my *testing hub* for test environments.

If you want to read more about how I set up my *Travis* pipeline, you can click *here*.


## Travis Development Pipeline ##

Depending on how you got to this page, you may or may not know that there are three environments set up for this website, which
I recognize is ridiculous given the simplicity and fact that I'm the only contributor, but that's okay. It was fun to set up.

I made this pipeline before actually writing any code since it would increase my ability to make
changes easily, so the earlier it was available, the better. I wanted to try out Travis to support this mostly because I'd
never used Travis before.


I set up three environments, `live`, `stage`, and `test`. The `test` environment is a little bit special, but I'll get to this
later. For each environment, I made an S3 bucket. I wrote a quick `index.html`, uploaded, and I was live!

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
