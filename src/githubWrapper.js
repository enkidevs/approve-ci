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

function reponseHandler (resolve, reject) {
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
    }, reponseHandler)
  })
}

export function createHook (url) {
  return new Promise((resolve, reject) => {
    gh.repos.createHook({
      user: GITHUB_ORG,
      repo: GITHUB_REPO,
      name: 'web',
      active: true,
      config: {
        url,
        content_type: 'json'
      },
      events: ['pull_request', 'issue_comment']
    }, reponseHandler)
  })
}
