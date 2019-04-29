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
const Bluebird = require('bluebird')
const fs = Bluebird.promisifyAll(require('fs'))
const path = require('path')
const packageJSON = require('../../package.json')
const git = require('simple-git/promise')
const debug = require('debug')(`${packageJSON.name}:backends:fs`)
const tmp = Bluebird.promisifyAll(require('tmp'))
tmp.setGracefulCleanup()
const {
  Nothing
} = require('./utils')

module.exports = class FileSystemBackend {
  /**
   * @summary The file-system based backend
   * @class
   * @public
   *
   * @param {String} repository - git repository path
   * @param {String} reference - git repository reference
   *
   * @example
   * const backend = new FileSystemBackend('foo/bar', 'master')
   */
  constructor (repository, reference) {
    this.repository = repository.path
    this.reference = reference
  }

  /**
   * @summary Initialize the git repository
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new FileSystemBackend(...)
   * backend.init().then(() => {
   *   console.log('The repository is ready to be used')
   * })
   */
  async init () {
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
      debug(`Cloning ${this.repository} to ${temporaryDirectory}`)
      return git()
        .clone(this.repository, temporaryDirectory)
        .then(_.constant(temporaryDirectory))
    }).then((temporaryRepository) => {
      this.repository = temporaryRepository
      return null
    })
  }

  /**
   * @summary Get the repository URL
   * @function
   * @private
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new FileSystemBackend(...)
   * backend.getRepositoryUrl().then((url) => {
   *   console.log(url)
   * })
   */
  async getRepositoryUrl () {
    return this.readFile('package.json').then((content) => {
      if (!content) {
        return Nothing
      }

      return _.get(JSON.parse(content), [ 'repository', 'url' ], Nothing)
    })
  }

  /**
   * @summary Read the contents of a file
   * @function
   * @public
   *
   * @param {String} file - file path
   * @returns {Promise}
   *
   * @example
   * const backend = new FileSystemBackend(...)
   * backend.readFile('README.md').then((contents) => {
   *   console.log(contents)
   * })
   */
  async readFile (file) {
    return fs.readFileAsync(path.join(this.repository, file), {
      encoding: 'utf8'
    }).catch({
      code: 'ENOENT'
    }, _.constant(Nothing))
  }

  /**
   * @summary Check if the repository is public
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new FileSystemBackend(...)
   * backend.isPublic().then((isPublic) => {
   *   console.log(isPublic)
   * })
   */
  async isPublic () { // eslint-disable-line class-methods-use-this
    return Nothing
  }

  /**
   * @summary Check if the repository is a fork
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new FileSystemBackend(...)
   * backend.isFork().then((isFork) => {
   *   console.log(isFork)
   * })
   */
  isFork () {
    if (!this.github) {
      return Bluebird.resolve(null)
    }

    return this.github.isFork()
  }

  /**
   * @summary Get the date of the last commit
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new GitHubBackend(...)
   * backend.getLastCommitDate().then((lastCommitDate) => {
   *   console.log(lastCommitDate)
   * })
   */
  async getLastCommitDate () { // eslint-disable-line class-methods-use-this
    return Nothing
  }

  /**
   * @summary Get the latest release
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new GitHubBackend(...)
   * backend.getReleases().then((releases) => {
   *   console.log(releases)
   * })
   */
  async getLatestRelease () { // eslint-disable-line class-methods-use-this
    return Nothing
  }

  /**
   * @summary Get the latest prerelease
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new GitHubBackend(...)
   * backend.getReleases().then((releases) => {
   *   console.log(releases)
   * })
   */
  async getLatestPreRelease () { // eslint-disable-line class-methods-use-this
    return Nothing
  }
}
