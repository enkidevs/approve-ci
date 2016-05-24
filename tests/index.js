import test from 'ava'

import {mergeConfigs, checkApproved} from '../src/approval'

const comments = require('./fixtures/comments.json')
const content = require('./fixtures/content.json')
const pr = require('./fixtures/pr.json')

const config = {
  name: 'approve-test',
  approvalCount: 1,
  approvalStrings: ['👍', ':+1:', ':thumbsup:'],
  disapprovalStrings: ['👎', ':-1:', ':thumbsdown:'],
  approveString: 'The pull request was approved',
  rejectString: 'The pull request needs more work',
  pendingString: 'Waiting for approval ({{x}} more needed)'
}

test('Check configs merge', t => {
  return t.deepEqual(mergeConfigs(content), config)
})

test('Check request is approved', t => {
  return t.deepEqual(checkApproved([config, comments, pr]), {
    sha: 'a085778b8f028205881c0bdbfc3772edc5563a3d',
    name: 'approve-test',
    state: 'failure',
    description: 'The pull request needs more work',
    approvalLeft: 2
  })
})
