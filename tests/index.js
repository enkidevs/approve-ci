import test from 'ava'

import {testIfHookAlreadyExist, mergeConfigs, checkApproved} from '../src/approval'

const comments = require('./fixtures/comments.json')
const content = require('./fixtures/content.json')
const hooks = require('./fixtures/hooks.json')
const pr = require('./fixtures/pr.json')

test('Check for existing web hook', t => t.throws(testIfHookAlreadyExist(hooks)))

test('Check configs merge', t => {
  t.same(mergeConfigs(content), {
    name: 'approve-test',
    approvalCount: 1,
    approvalStrings: ['👍', ':+1:', ':thumbsup:'],
    disapprovalStrings: ['👎', ':-1:', ':thumbsdown:']
  })
})

test('Check request is approved', t => t.true(checkApproved(comments, pr)))
