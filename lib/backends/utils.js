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

const _ = require('lodash')

/**
 * @summary Empty class to signal not implemented functions in the backend
 * @class
 * @private
 *
 */
class NotImplemented {}

module.exports.NotImplemented = NotImplemented

module.exports.Nothing = new NotImplemented()

module.exports.interpretValue = (result) => {
  return _.mapValues(result, (value) => {
    if (value instanceof NotImplemented) {
      return null
    }
    return value
  })
}

module.exports.combineValues = (v1, v2) => {
  if (v1 instanceof NotImplemented) return v2
  if (v2 instanceof NotImplemented) return v1
  if (!_.isEqual(v1, v2)) {
    throw new Error(`Backends disagree on ${v1} and ${v2}`)
  }
  return v1
}
