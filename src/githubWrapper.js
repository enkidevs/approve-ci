import GithubAPI from 'github'

const {GITHUB_TOKEN, GITHUB_REPO, GITHUB_ORG} = process.env

const headers = {
  'user-agent': 'approve-ci-bot'
}

const gh = new GithubAPI({
  version: '3.0.0',
  debug: false,
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
      console.error(err)
      return reject(err)
    }
    resolve(response)
  }
}

export function getHooks () {
  return new Promise((resolve, reject) => {
    console.log('get hooks')
    gh.repos.getHooks({
      user: GITHUB_ORG,
      repo: GITHUB_REPO
    }, responseHandler(resolve, reject))
  })
}

export function createHook (url) {
  return new Promise((resolve, reject) => {
    console.log('create hook')
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
    }, responseHandler(resolve, reject))
  })
}

export function getConfig () {
  return new Promise((resolve, reject) => {
    gh.repos.getContent({
      user: GITHUB_ORG,
      repo: GITHUB_REPO,
      headers,
      path: '.approve-ci'
    }, responseHandler(resolve, reject))
  })
}

export function setState ({sha, name, state, description, approvalLeft = '', repo = GITHUB_REPO, user = GITHUB_ORG}) {
  return new Promise((resolve, reject) => {
    gh.statuses.create({
      user,
      repo,
      sha,
      state,
      description: description.replace('{{x}}', approvalLeft),
      context: name,
      target_url: 'https://github.com/enkidevs/approve-ci'
    }, responseHandler(resolve, reject))
  })
}

export function getComments (number, user = GITHUB_ORG, repo = GITHUB_REPO) {
  return new Promise((resolve, reject) => {
    console.log('get comments')
    gh.issues.getComments({
      user,
      repo,
      number,
      per_page: 100
    }, responseHandler(resolve, reject))
  })
}

export function getPullRequest (number, user = GITHUB_ORG, repo = GITHUB_REPO) {
  return new Promise((resolve, reject) => {
    console.log('get pull request')
    gh.pullRequests.get({
      user,
      repo,
      number
    }, responseHandler(resolve, reject))
  })
}
