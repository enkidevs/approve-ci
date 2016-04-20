import GithubAPI from 'github'

const {GITHUB_TOKEN, GITHUB_REPO, GITHUB_ORG} = process.env

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

function responseHandler (resolve, reject) {
  return function (err, response) {
    if (err) {
      return reject(err)
    }

    resolve(response)
  }
}

export function getHooks () {
  return new Promise((resolve, reject) => {
    gh.repos.getHooks({
      user: GITHUB_ORG,
      repo: GITHUB_REPO
    }, responseHandler)
  })
}

export function createHook (url) {
  return new Promise((resolve, reject) => {
    gh.repos.createHook({
      user: GITHUB_ORG,
      repo: GITHUB_REPO,
      headers,
      name: 'web',
      active: true,
      config: {
        url,
        content_type: 'json'
      },
      events: ['pull_request', 'issue_comment']
    }, responseHandler)
  })
}

export function getConfig () {
  return new Promise((resolve, reject) => {
    gh.repos.getContent({
      user: GITHUB_ORG,
      repo: GITHUB_REPO,
      headers,
      path: '.approve-ci'
    }, responseHandler)
  })
}

export function setState ({sha, name, state, description}) {
  return new Promise((resolve, reject) => {
    gh.statuses.create({
      user: GITHUB_ORG,
      repo: GITHUB_REPO,
      sha,
      state,
      description,
      context: name
    }, responseHandler)
  })
}

export function getComments (number) {
  return new Promise((resolve, reject) => {
    gh.statuses.create({
      user: GITHUB_ORG,
      repo: GITHUB_REPO,
      number,
      per_page: 100
    }, responseHandler)
  })
}

export function getPullRequest (number) {
  return new Promise((resolve, reject) => {
    gh.pullRequests.get({
      user: GITHUB_ORG,
      repo: GITHUB_REPO,
      number
    }, responseHandler)
  })
}
