import GithubAPI from 'github'

const {GITHUB_TOKEN} = process.env

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

export function getConfig (user, repo) {
  return new Promise((resolve, reject) => {
    gh.repos.getContent({
      user,
      repo,
      headers,
      path: '.approve-ci'
    }, responseHandler(resolve, reject))
  })
}

export function setState ({sha, name, state, description, approvalLeft = '', repo, user}) {
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

export function getComments (number, user, repo) {
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

export function getPullRequest (number, user, repo) {
  return new Promise((resolve, reject) => {
    console.log('get pull request')
    gh.pullRequests.get({
      user,
      repo,
      number
    }, responseHandler(resolve, reject))
  })
}
