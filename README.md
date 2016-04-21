# approve-ci

[![build status](https://img.shields.io/travis/enkidevs/approve-ci/master.svg?style=flat-square)](https://travis-ci.org/enkidevs/approve-ci)

Approve-ci monitors pull requests and checks for approval. Once the number of approvals exceeds the number of disapprovals by a set amount the pull request is marked as 'approved' and is ready to merge.

![approve-ci in use](http://i.imgur.com/2aMhuzk.png)

## Deployment

To run an approve-ci bot clone this repository, modify `.approve-ci` and deploy your application. You must set a GitHub organisation, repository and an API [token](https://github.com/settings/tokens) with `repo` rights as environment variables, along with the URL of your deployment.

```
  export GITHUB_TOKEN='f7c41472410cacded24090d24f70e98995d8dc55'
  export GITHUB_REPO='approve-ci'
  export GITHUB_ORG='enkidevs'
  export URL='http://approve-ci.herokuapp.com/'
```

Alternatively you can deploy the bot using Heroku by pressing the button below:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

GitHub allows you protect branches and to require specific tests to pass before pull requests can be merged. You can set this up by visiting [https://github.com/USERNAME/REPO/settings/branches](https://github.com/USERNAME/REPO/settings/branches), selecting the branch you want to protect and then checking the approve-ci bot (the name is defined in the configuration file, see the next section), approval is needed before a request can be merged.

[![Protected branches](http://i.imgur.com/bpEb9nU.png)](https://github.com/enkidevs/approve-ci/settings/branches)

## Configuration

An example `.approve-ci` file, using :thumbsup: to approve and :thumbsdown: to disapprove, is given below. When using emojis you must use [encodeURIComponent](http://pressbin.com/tools/urlencode_urldecode/).

```
{
  "name": "approve-ci",
  "approvalCount": 1,
  "approvalStrings": ["%F0%9F%91%8D", ":+1:", ":thumbsup:"],
  "disapprovalStrings": ["%F0%9F%91%8E", ":-1:", ":thumbsdown:"],
  "approveString": "The pull request was approved",
  "rejectString": "The pull request needs more work",
  "pendingString": "Waiting for approval"
}
```
