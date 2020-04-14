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
const packageJSON = require('../package.json')
const Bluebird = require('bluebird')
const fsExtra = Bluebird.promisifyAll(require('fs-extra'))
const debug = require('debug')(`${packageJSON.name}`)
const tmp = Bluebird.promisifyAll(require('tmp'))
tmp.setGracefulCleanup()

/**
 * @summary Supported backends
 * @type {Object}
 * @constant
 * @private
 */
const BACKENDS = {
  fs: require('./backends/fs'),
  github: require('./backends/github')
}

/**
 * @summary Built-in plugins
 * @type {Function[]}
 * @constant
 * @private
 */
const BUILTIN_PLUGINS = {
  license: require('./plugins/license'),
  blog: require('./plugins/blog'),
  changelog: require('./plugins/changelog'),
  contributing: require('./plugins/contributing'),
  contributors: require('./plugins/contributors'),
  docs: require('./plugins/docs'),
  security: require('./plugins/security'),
  faq: require('./plugins/faq'),
  'code-of-conduct': require('./plugins/code-of-conduct'),
  architecture: require('./plugins/architecture'),
  maintainers: require('./plugins/maintainers'),
  readme: require('./plugins/readme'),
  'readme-sections': require('./plugins/readme-sections'),
  'github-metadata': require('./plugins/github-metadata'),
  dependencies: require('./plugins/dependencies'),
  'last-commit-date': require('./plugins/last-commit-date'),
  'latest-release': require('./plugins/latest-release'),
  'latest-prerelease': require('./plugins/latest-prerelease'),
  'open-issues': require('./plugins/open-issues'),
  version: require('./plugins/version'),
  screenshot: require('./plugins/screenshot'),
  logo: require('./plugins/logo')
}

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
  return Bluebird.reduce(options.plugins, (accumulator, plugin, index) => {
    if (options.progress) {
      options.progress({
        percentage: Math.floor(index * 100 / options.plugins.length)
      })
    }

    // eslint-disable-next-line new-cap
    const backend = new options.backend(options.repository, options.reference)
    return backend.init().then(() => {
      return plugin(backend).then((result) => {
        return _.merge(accumulator, result)
      })
    })
  }, options.accumulator)
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
 * @param {String[]} [options.whitelistPlugins] - list of plugins to run. Matches all if empty
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
  // Clone the local repository into a temporary
  // directory, so we can reset it, modify it, and
  // traverse it as much as we want without messing
  // up with the user's original repo, or with the
  // user's unstaged changes, etc.
  return tmp.dirAsync({
    // This ensures the temporary directory is removed
    // when this module finishes its job even if the
    // directory is not empty
    unsafeCleanup: true,
    prefix: `${packageJSON.name}_`
  }).then((temporaryDirectory) => {
    debug(`Cloning ${gitRepository} to ${temporaryDirectory}`)
    return fsExtra
      .copy(gitRepository, temporaryDirectory)
      .then(_.constant(temporaryDirectory))
  }).then((temporaryRepository) => {
    // Then examine the temporary version of the
    // repository.
    return examineGitRepository({
      repository: temporaryRepository,
      backend: BACKENDS.fs,
      plugins: filterPlugins(options.whitelistPlugins),
      accumulator: {},
      progress: options.progress,
      reference: options.reference
    })
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
 * @param {String[]} [options.whitelistPlugins] - list of plugins to run. Matches all if empty
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
    repository: gitRepository,
    backend: BACKENDS.github,
    plugins: filterPlugins(options.whitelistPlugins),
    accumulator: {},
    progress: options.progress,
    reference: options.reference
  })
}

/**
 * @summary Filter whitelist from BUILTIN_PLUGINS
 * @function
 * @private
 *
 * @description
 * Filter BUILTIN_PLUGINS based on a whitelisst
 *
 * @param {String[]} pluginWhitelist - list of plugins to whitelist
 * @returns {Function[]}
 *
 * @example
 * filterPlugins(['docs'])
 */
const filterPlugins = (pluginWhitelist) => {
  let plugins = BUILTIN_PLUGINS
  if (!_.isEmpty(pluginWhitelist)) {
    plugins = _.pick(plugins, pluginWhitelist)
  }
  return _.values(plugins)
}
