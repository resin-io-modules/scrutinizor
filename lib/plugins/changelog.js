/*
 * Copyright 2019 Balena
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

const yaml = require('js-yaml')
const _ = require('lodash')

// Prefer a machine readable yml changelog, if one isn't available try to load
// the standard markdown changelog
module.exports = (backend) => {
  return backend.readFile('.versionbot/CHANGELOG.yml').then((contents) => {
    if (_.isEmpty(contents)) {
      return backend.readFile('CHANGELOG.md').then((markdown) => {
        if (_.isEmpty(contents)) {
          return {
            changelog: []
          }
        }

        return {
          changelog: markdown
        }
      }
    }

    const changelog = yaml.safeLoad(contents)

    return {
      changelog
    }
  })
}
