import express from 'express'
import GithubAPI from 'github'

const {GITHUB_TOKEN, GITHUB_REPO, GITHUB_ORG, URL} = process.env

var headers = {
  'user-agent': 'approve-ci-bot'
}

var gh = new GithubAPI({
  version: '3.0.0',
  debug: true,
  protocol: 'https',
  host: 'api.github.com',
  pathPrefix: '',
  timeout: 5000,
  headers: headers
})

gh.authenticate({
  type: 'oauth',
  token: GITHUB_TOKEN
})

gh.repos.getHooks({
  user: GITHUB_ORG,
  repo: GITHUB_REPO,
  headers: headers
}, (response) => {
  // Existing hook?
  if (response) {
    var hook = response.find((hook) => {
      return (hook.config.url === URL)
    })
    if (hook) {
      return
    }
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
    events: ['pull_request', 'pull_request_review_comment'],
    headers: headers
  }, (err, response) => {
    if (err) return console.error(err)
    console.log(response)
  })
})

const app = express()

// Default app-alive message
app.get('/', (res, req) => {
  res.send('Hello, world!')
})

// Handler hook event
app.post('/', (res, req) => {
  console.log(req.body)
})
