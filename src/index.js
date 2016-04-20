import express from 'express'
import GithubAPI from 'github'

const {GITHUB_TOKEN, GITHUB_REPO, GITHUB_ORG} = process.env

var headers = {
  'user-agent': 'approve-ci-bot'
}

var gh = new GithubAPI({
  // required
  version: '3.0.0',
  // optional
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

gh.getHooks({
  user: GITHUB_ORG,
  repo: GITHUB_REPO,
  headers: headers
}, (response) => {
  console.log(response)

  // TODO - check whether hooks exist
})

const app = express()

app.get('/', (res, req) => {
  res.send('Hello, world!')
})

app.post('/', (res, req) => {
  // TODO
})
