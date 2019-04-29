/*
 * Copyright 2018 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const ava = require('ava')
const GitHubBackend = require('../../lib/backends/github')

const makeGHBackend = (url, branch) => {
  return new GitHubBackend({
    url
  }, branch)
}
ava.test('constructor: should parse a GitHub git URL without a protocol', (test) => {
  const backend = makeGHBackend('git@github.com:resin-io/etcher.git', 'master')
  test.is(backend.owner, 'resin-io')
  test.is(backend.repo, 'etcher')
})

ava.test('constructor: should parse a GitHub git URL with a git+ssh protocol', (test) => {
  const backend = makeGHBackend('git+ssh://git@github.com:resin-io/capitano.git', 'master')
  test.is(backend.owner, 'resin-io')
  test.is(backend.repo, 'capitano')
})

ava.test('constructor: should parse a GitHub HTTPS URL with an extension', (test) => {
  const backend = makeGHBackend('https://github.com/resin-io/resin-supervisor.git', 'master')
  test.is(backend.owner, 'resin-io')
  test.is(backend.repo, 'resin-supervisor')
})

ava.test('constructor: should parse a GitHub HTTPS URL without an extension', (test) => {
  const backend = makeGHBackend('https://github.com/resin-io/resin-supervisor', 'master')
  test.is(backend.owner, 'resin-io')
  test.is(backend.repo, 'resin-supervisor')
})
