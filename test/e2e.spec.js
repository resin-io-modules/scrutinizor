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
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const scrutinizer = require('..')

const CASES = _.map(fs.readdirSync(path.join(__dirname, 'e2e')), (testCase) => {
  return require(path.join(__dirname, 'e2e', testCase))
})

_.each(CASES, (testCase) => {
  const repositoryPath = path.join(__dirname, 'repositories', testCase.name)

  const logProgress = (state) => {
    console.log(`${repositoryPath} -> ${state.percentage}%`)
  }

  ava.test(`local: ${testCase.name} (${testCase.reference})`, (test) => {
    return scrutinizer.local(repositoryPath, {
      reference: testCase.reference,
      progress: logProgress
    }).then((data) => {
      test.deepEqual(data, testCase.local)
    })
  })

  ava.test(`remote: ${testCase.name} (${testCase.reference})`, (test) => {
    return scrutinizer.remote(testCase.url, {
      reference: testCase.reference,
      progress: logProgress
    }).then((data) => {
      test.deepEqual(data, testCase.remote)
    })
  })
})
