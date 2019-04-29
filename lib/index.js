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

/**
 * @module scrutinizer
 */

const _ = require('lodash')
const Bluebird = require('bluebird')
const backendUtils = require('./backends/utils')

const fsBackend = require('./backends/fs')
const githubBackend = require('./backends/github')
const combineBackends = require('./backends/combine')

/**
 * @summary Supported backends
 * @type {Object}
 * @constant
 * @private
 */
const BACKENDS = {
  fs: fsBackend,
  github: githubBackend,
  combined: combineBackends(fsBackend, githubBackend)
}

/**
 * @summary Built-in plugins
 * @type {Function[]}
 * @constant
 * @private
 */
const BUILTIN_PLUGINS = [
  require('./plugins/license'),
  require('./plugins/contributing'),
  require('./plugins/architecture'),
  require('./plugins/github-fork'),
  require('./plugins/github-public'),
  require('./plugins/dependencies'),
  require('./plugins/last-commit-date'),
  require('./plugins/latest-release'),
  require('./plugins/latest-prerelease')
]

/**
 * @summary Examine a git repository
 * @function
 * @private
 *
 * @param {Object} options - options
 * @param {String} options.repository - repository URL (can be local)
 * @param {Object} options.backend - scrutinizer backend to interact with the repository
 * @param {Function[]} options.plugins - plugins to use during examination
 * @param {Object} options.accumulator - default accumulator
 * @param {String} options.reference - git reference to check
 * @param {Function} [options.progress] - progress function callback
 * @returns {Promise}
 *
 * @example
 * examineGitRepository({
 *   repository: 'foo/bar/baz',
 *   backend: BACKENDS.fs,
 *   plugins: BUILTIN_PLUGINS,
 *   accumulator: {},
 *   reference: 'master',
 *   progress: (state) => {
 *     console.log(state)
 *   }
 * }).then((results) => {
 *   console.log(results)
 * })
 */
const examineGitRepository = (options) => {
  // eslint-disable-next-line new-cap
  const backend = new options.backend(options.repository, options.reference)

  return backend.init().then(() => {
    return Bluebird.reduce(options.plugins, (accumulator, plugin, index) => {
      if (options.progress) {
        options.progress({
          percentage: Math.floor(index * 100 / options.plugins.length)
        })
      }
      return plugin(backend).then((result) => {
        return _.merge(accumulator, backendUtils.interpretValue(result))
      })
    }, options.accumulator)
  })
}

/**
 * @summary Examine a local git repository directory
 * @function
 * @public
 *
 * @param {String} gitRepository - path to git repository
 * @param {Object} options - options
 * @param {String} options.reference - git reference to check
 * @param {Function} [options.progress] - progress callback (state)
 * @fulfil {Object} - examination results
 * @returns {Promise}
 *
 * @example
 * scrutinizer.local('./foo/bar/baz', {
 *   reference: 'master',
 *   progress: (state) => {
 *     console.log(state.percentage)
 *   }
 * }).then((results) => {
 *   console.log(results)
 * })
 */
exports.local = (gitRepository, options) => {
  return examineGitRepository({
    repository: {
      path: gitRepository
    },
    backend: BACKENDS.fs,
    plugins: BUILTIN_PLUGINS,
    accumulator: {},
    progress: options.progress,
    reference: options.reference
  })
}

/**
 * @summary Examine a remote git repository url
 * @function
 * @public
 *
 * @description
 * If `$GITHUB_TOKEN` is set, it will be used to authenticate with
 * GitHub to increase rate-limiting.
 *
 * @param {String} gitRepository - git repository url
 * @param {Object} options - options
 * @param {String} options.reference - git reference to check
 * @param {Function} [options.progress] - progress callback (state)
 * @fulfil {Object} - examination results
 * @returns {Promise}
 *
 * @example
 * scrutinizer.remote('git@github.com:foo/bar.git', {
 *   reference: 'master',
 *   progress: (state) => {
 *     console.log(state.percentage)
 *   }
 * }).then((results) => {
 *   console.log(results)
 * })
 */
exports.remote = (gitRepository, options) => {
  return examineGitRepository({
    repository: {
      url: gitRepository
    },
    backend: BACKENDS.github,
    plugins: BUILTIN_PLUGINS,
    accumulator: {},
    progress: options.progress,
    reference: options.reference
  })
}

/**
 * @summary Examine a git repository combining local and remote backend
 * @function
 * @public
 *
 * @param {Object} gitRepository - git repository info
 * @param {Object} gitRepository.path - path to git repository
 * @param {Object} gitRepository.url - url of git repository
 * @param {Object} options - options
 * @param {String} options.reference - git reference to check
 * @param {Function} [options.progress] - progress callback (state)
 * @fulfil {Object} - examination results
 * @returns {Promise}
 *
 * @example
 * scrutinizer.combined({ path: '..', url: '..' }, {
 *   reference: 'master',
 *   progress: (state) => {
 *     console.log(state.percentage)
 *   }
 * }).then((results) => {
 *   console.log(results)
 * })
 */
exports.combined = (gitRepository, options) => {
  return examineGitRepository({
    repository: gitRepository,
    backend: BACKENDS.combined,
    plugins: BUILTIN_PLUGINS,
    accumulator: {},
    progress: options.progress,
    reference: options.reference
  })
}
