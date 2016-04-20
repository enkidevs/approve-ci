import {decode} from 'base-64'

const {URL} = process.env

const defaultConfig = {
  name: 'approve-ci',
  approvalCount: 1,
  approvalStrings: ['👍', ':+1:', ':thumbsup:'],
  disapprovalStrings: ['👎', ':-1:', ':thumbsdown:']
}

const config = defaultConfig

export function testIfHookAlreadyExist (hooks) {
  const hook = (hooks || []).find((hook) => hook.config.url === URL)
  if (hook) {
    throw new Error('already defined')
  }
  return URL
}

export function mergeConfigs (remoteConfig) {
  if (remoteConfig) {
    var userConfig = JSON.parse(decode(remoteConfig.content))
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

  return config
}

export function checkApproved ([comments, pr]) {
  const commenters = comments
    .filter((comment) => comment.user.login !== pr.user.login)
    .reduce((ret, comment) => {
      if (config.approvalStrings.some((str) => comment.body.includes(str))) {
        return {
          ...ret,
          [comment.user.id]: (ret[comment.user.id] || 0) + 1
        }
      }
      if (config.disapprovalStrings.some((str) => comment.body.includes(str))) {
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
    throw new Error('nothing to do')
  }

  return {
    sha: pr.head.sha,
    name: config.name,
    state,
    description
  }
}
