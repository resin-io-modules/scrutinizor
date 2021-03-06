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

const path = require('path')
const Bluebird = require('bluebird')
const { convertHtmlToMD } = require('../utils/markdown')

module.exports = (backend) => {
  return Bluebird.props({
    architecture: backend.readFile('ARCHITECTURE.md'),
    docsArchitecture: backend.readFile(path.join('docs', 'ARCHITECTURE.md'))
  }).then(async(files) => {
    return {
      architecture:
        ((await convertHtmlToMD(files.architecture)).contents).trim() ||
        ((await convertHtmlToMD(files.docsArchitecture)).contents).trim() ||
        null
    }
  })
}
