# approve-ci

[![build status](https://img.shields.io/travis/enkidevs/approve-ci/master.svg?style=flat-square)](https://travis-ci.org/enkidevs/approve-ci)

Approve-ci monitors pull requests and checks for approval. Once the number of approvals exceeds the number of disapprovals by a set amount the pull request is marked as 'approved' and is ready to merge.

![approve-ci in use](http://i.imgur.com/2aMhuzk.png)

## How To Use?

- Go to
 - your project on GitHub > Settings > Webhooks & services > Add Webhook or
 - your organization on GitHub > Settings > Webhooks > Add Webhook
- Payload URL: (https://approve-ci.herokuapp.com/)
- Let me select individual events > Check `repo`
- Add Webhook

And you are done. Next time a pull request is opened, you should see the pending status from approve-ci ;)

## Configuration

The bot can be configured by adding a `.approve-ci` file to the base directory of the repo. Here's a list of the possible options:

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

When using emojis you must [URI encodeURI](http://pressbin.com/tools/urlencode_urldecode/) them (as shown above for :thumbsup: and :thumbsdown:).

## Protected branches

GitHub allows you protect branches and to require specific tests to pass before pull requests can be merged. You can set this up by visiting [https://github.com/USERNAME/REPO/settings/branches](https://github.com/USERNAME/REPO/settings/branches), selecting the branch you want to protect and then checking the approve-ci bot (the name is defined in the configuration file, see the next section), approval is needed before a request can be merged.

[![Protected branches](http://i.imgur.com/bpEb9nU.png)](https://github.com/enkidevs/approve-ci/settings/branches)

## How To Contribute or Run Your Own Bot?

If you want to use a different account for the bot, change the message or extend it with more functionalities, we've tried to make it super easy:

```bash
git clone https://github.com/enkidevs/approve-ci.git
cd approve-ci
npm install
npm start
# Follow the instructions there
```

Alternatively you can deploy the bot using Heroku by pressing the button below:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## License

  MIT
