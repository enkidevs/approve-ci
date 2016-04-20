import express from 'express'
import bodyParser from 'body-parser'
import {decode} from 'base-64'
import GithubAPI from 'github'

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

const headers = {
  'user-agent': 'approve-ci-bot'
}

const gh = new GithubAPI({
  version: '3.0.0',
  debug: true,
  protocol: 'https',
  host: 'api.github.com',
  pathPrefix: '',
  timeout: 5000,
  headers
})

gh.authenticate({
  type: 'oauth',
  token: GITHUB_TOKEN
})

gh.repos.getHooks({
  user: GITHUB_ORG,
  repo: GITHUB_REPO
}, (err, response) => {
  if (err) console.error(err)

  // Existing hook?
  const hook = (response || []).find((hook) => hook.config.url === URL)
  if (hook) {
    return
  }

  // Create a hook
  gh.repos.createHook({
    user: GITHUB_ORG,
    repo: GITHUB_REPO,
    name: 'web',
    active: true,
    config: {
      url: URL,
      content_type: 'json'
    },
    events: ['pull_request', 'issue_comment']
  }, (err, response) => {
    if (err) return console.error(err)
    console.log(response)
  })
})

// Retrieve configuration from repository
// This is stored in .approve-ci found in the root directory
gh.repos.getContent({
  user: GITHUB_ORG,
  repo: GITHUB_REPO,
  path: '.approve-ci',
  headers
}, (err, response) => {
  if (err) console.error(err)
  if (response) {
    try {
      var userConfig = JSON.parse(decode(response.content))
      Object.keys(userConfig).forEach((key) => {
        config[key] = userConfig[key]
      })
    } catch (e) {
      console.error(err)
    }
  }
})

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
      gh.statuses.create({
        user: GITHUB_ORG,
        repo: GITHUB_REPO,
        sha: event.pull_request.head.sha,
        state: 'pending',
        context: config.name,
        description: 'Waiting for approval'
      }, (err, response) => {
        if (err) {
          console.error(err)
          return res.status(500).send(err)
        }
        return res.status(200).send({success: true})
      })
      return
  }

  // Issue Comment
  switch (event.action) {
    case 'created':
    case 'edited':
    case 'deleted':
      // Fetch all comments from PR
      if (event.issue.pull_request) {
        gh.issues.getComments({
          user: GITHUB_ORG,
          repo: GITHUB_REPO,
          number: event.issue.number,
          per_page: 100
        }, (err, comments) => {
          if (err) {
            console.error(err)
            return res.status(500).send(err)
          }

          gh.pullRequests.get({
            user: GITHUB_ORG,
            repo: GITHUB_REPO,
            number: event.issue.number
          }, (err, pr) => {
            if (err) {
              console.error(err)
              return res.status(500).send(err)
            }

            const result = comments
              .filter((comment) => comment.user.login !== pr.user.login)
              .reduce((ret, comment) => {
                console.log(comment.body)
                if (config.approvalStrings.some((str) => {
                  return comment.body.includes(str)
                })) return ret + 1

                if (config.disapprovalStrings.some((str) => {
                  return comment.body.includes(str)
                })) return ret - 1

                return ret
              }, 0)

            console.log(result)

            let state, description
            if (result > config.approvalCount) {
              state = 'success'
              description = 'The pull-request was approved'
            } else if (result < 0) {
              state = 'failure'
              description = 'The pull-request needs more work'
            } else {
              return res.status(200).send({success: true})
            }

            gh.statuses.create({
              user: GITHUB_ORG,
              repo: GITHUB_REPO,
              sha: pr.head.sha,
              state,
              context: config.name,
              description
            }, (err) => {
              if (err) {
                console.error(err)
                return res.status(500).send(err)
              }
              console.log('Set status of new PR to \'' + state + '\'')
              return res.status(200).send({success: true})
            })
          })
        })
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
