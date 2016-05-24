import express from 'express'
import bodyParser from 'body-parser'

import {getConfig, setState, getComments, getPullRequest} from './githubWrapper'
import {checkApproved, mergeConfigs} from './approval'

const {GITHUB_TOKEN} = process.env

if (!GITHUB_TOKEN) {
  console.error('The ci was started without env variables')
  console.error('To get started:')
  if (!GITHUB_TOKEN) {
    console.error('* Visit https://github.com/settings/tokens')
    console.error('* Create a new token with the repo rights')
  }
  console.error('* Run the following command:')
  console.error('GITHUB_TOKEN=insert_github_token_here npm start')
  process.exit(1)
}

const app = express()
app.use(bodyParser.json())

// Default app-alive message
app.get('/', (req, res) => {
  res.send('Approve CI Active. ' +
    'Go to https://github.com/enkidevs/approve-ci for more information.')
})

// Handler hook event
app.post('/', (req, res) => {
  var event = req.body
  console.log(event)

  // Pull Request
  switch (event.action) {
    case 'opened':
    case 'reopened':
    case 'synchronize':
      // Set status to 'pending'
      const user = event.repository.owner.login
      const repo = event.repository.name
      return getConfig(user, repo).then(mergeConfigs).then((config) => {
        return setState({
          user,
          repo,
          sha: event.pull_request.head.sha,
          name: config.name,
          state: 'pending',
          description: config.pendingString,
          approvalLeft: config.approvalCount
        })
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
      if ((event.issue || {}).pull_request) { // check if it's a comment on a PR
        const user = event.repository.owner.login
        const repo = event.repository.name
        return Promise.all([
          getConfig(user, repo),
          getComments(event.issue.number, user, repo),
          getPullRequest(event.issue.number, user, repo)
        ]).then(checkApproved)
          .then((result) => setState({
            ...result,
            user,
            repo
          }))
          .then((response) => {
            res.status(200).send({success: true})
          })
          .catch((err) => res.status(500).send(err))
      }
  }
  return res.status(200).send({success: true})
})

// Start server
app.set('port', process.env.PORT || 3000)

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'))
})
