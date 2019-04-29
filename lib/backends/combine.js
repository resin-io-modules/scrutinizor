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

const {
  combineValues
} = require('./utils.js')

module.exports = (B1, B2) => {
  return class CombineBackend {
    /**
     * @summary The combined based backend
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
      this.b1 = new B1(repository, reference)
      this.b2 = new B2(repository, reference)
    }

    /**
     * @summary Apply function to backends
     * @function
     * @private
     *
     * @param {String} fn - function to apply
     * @param {Array<Any>} args - arguments that will be passed to fn
     * @returns {Promise}
     *
     * @example
     * const backend = new CombineBackend(...)
     * backend.apply('init').then(() => {
     *   console.log('The repository is ready to be used')
     * })
     */
    async forward (fn, args = []) {
      const b1Result = await this.b1[fn](...args)
      const b2Result = await this.b2[fn](...args)
      return combineValues(b1Result, b2Result)
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
      return this.forward('init')
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
      return this.forward('getRepositoryUrl')
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
      return this.forward('readFile', [ file ])
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
    async isPublic () {
      return this.forward('isPublic')
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
    async getLastCommitDate () {
      return this.forward('getLastCommitDate')
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
    async getLatestRelease () {
      return this.forward('getLatestRelease')
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
    async getLatestPreRelease () {
      return this.forward('getLatestPreRelease')
    }
  }
}
