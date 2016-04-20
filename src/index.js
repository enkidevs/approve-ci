import express from 'express'
import bodyParser from 'body-parser'
import {decode} from 'base-64'

import {getHooks, createHook, getConfig, setState,
  getComments, getPullRequest} from './githubWrapper'

const {GITHUB_TOKEN, GITHUB_REPO, GITHUB_ORG, URL} = process.env

if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_ORG || !URL) {
  console.error('The ci was started without env variables')
  console.error('To get started:')
  if (!GITHUB_TOKEN) {
    console.error('* Visit https://github.com/settings/tokens')
    console.error('* Create a new token with the repo rights')
  }
  console.error('* Run the following command:')
  console.error('GITHUB_TOKEN=insert_github_token_here GITHUB_REPO=insert_github_repo_here GITHUB_ORG=insert_github_username_here URL=insert_url_here npm start')
  process.exit(1)
}

const defaultConfig = {
  name: 'approve-ci',
  approvalCount: 1,
  approvalStrings: ['👍', ':+1:', ':thumbsup:'],
  disapprovalStrings: ['👎', ':-1:', ':thumbsdown:']
}

var config = defaultConfig

// Existing hook?
// If not, create one
getHooks().then((hooks) => {
  const hook = (hooks || []).find((hook) => hook.config.url === URL)
  if (hook) {
    throw new Error('already defined')
  }
  return URL
}).then(createHook)
  .catch((err) => console.log(err))

// Retrieve configuration from repository
// This is stored in .approve-ci found in the root directory
getConfig().then((config) => {
  if (config) {
    var userConfig = JSON.parse(decode(config.content))
    Object.keys(userConfig).forEach((key) => {
      if (Array.isArray(userConfig[key])) {
        config[key] = userConfig[key].map((item) => decodeURIComponent(item))
      } else if (typeof userConfig[key] === 'string') {
        config[key] = decodeURIComponent(userConfig[key])
      } else {
        config[key] = userConfig[key]
      }
    })
  }
  console.log('Approving comments containing:', config.approvalStrings)
  console.log('Disapproving comments containing:', config.disapprovalStrings)
}).catch((err) => console.error(err))

const app = express()
app.use(bodyParser.json())

// Default app-alive message
app.get('/', (req, res) => {
  res.send('Hello, world!')
})

// Handler hook event
app.post('/', (req, res) => {
  var event = req.body

  // Pull Request
  switch (event.action) {
    case 'opened':
    case 'reopened':
    case 'synchronize':
      // Set status to 'pending'
      return setState({
        sha: event.pull_request.head.sha,
        name: config.name,
        state: 'pending',
        description: 'Waiting for approval'
      }).then((response) => {
        res.status(200).send({success: true})
      }).catch((err) => res.status(500).send(err))
  }

  // Issue Comment
  switch (event.action) {
    case 'created':
    case 'edited':
    case 'deleted':
      // Fetch all comments from PR
      if (event.issue.pull_request) {
        Promise.all([getComments(event.issue.number), getPullRequest(event.issue.number)]).then(([comments, pr]) => {
          const commenters = comments
            .filter((comment) => comment.user.login !== pr.user.login)
            .reduce((ret, comment) => {
              console.log(comment.body)
              if (config.approvalStrings.some((str) => comment.body.includes(str))) {
                console.log('+1')
                return {
                  ...ret,
                  [comment.user.id]: (ret[comment.user.id] || 0) + 1
                }
              }
              if (config.disapprovalStrings.some((str) => comment.body.includes(str))) {
                console.log('-1')
                return {
                  ...ret,
                  [comment.user.id]: (ret[comment.user.id] || 0) - 1
                }
              }

              return ret
            }, {})

          const result = Object.keys(commenters).reduce((ret, commenter) => {
            if (commenters[commenter] > 0) {
              return ret + 1
            }
            if (commenters[commenter] < 0) {
              return ret - 1
            }
            return ret
          }, 0)

          let state, description
          if (result >= config.approvalCount) {
            state = 'success'
            description = 'The pull-request was approved'
          } else if (result < 0) {
            state = 'failure'
            description = 'The pull-request needs more work'
          } else {
            return res.status(200).send({success: true})
          }

          // Set the status
          return {
            sha: pr.head.sha,
            name: config.name,
            state,
            description
          }
        }).then(setState).catch((err) => res.status(500).send(err))
      }
      return
  }
  return res.status(200).send({success: true})
})

// Start server
app.set('port', process.env.PORT || 3000)

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'))
})
