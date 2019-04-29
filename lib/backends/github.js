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

const GitHub = require('@octokit/rest')
const _ = require('lodash')
const Bluebird = require('bluebird')
const fromNow = require('fromnow')
const packageJSON = require('../../package.json')
const debug = require('debug')(`${packageJSON.name}:backends:github`)
const {
  Nothing
} = require('./utils')

/**
 * @summary Log GitHub rate-limiting information
 * @function
 * @private
 *
 * @param {Object} headers - HTTP headers
 *
 * @example
 * github.repos.getContents({ ... }).then((results) => {
 *   logGitHubRateLimitingInformation(results.meta)
 * })
 */
const logGitHubRateLimitingInformation = (headers) => {
  const resetDate = new Date(headers['x-ratelimit-reset'] * 1000)
  debug(`Rate limiting: ${headers['x-ratelimit-remaining']}/${headers['x-ratelimit-limit']},
         will reset in ${fromNow(resetDate)}}`)
}

/**
 * @summary Utility function to ignore authorization errors
 * @function
 * @private
 *
 * @param {Object} error - HTTP error
 *
 * @returns {Object} Nothing
 *
 * @example
 * .catch(checkForAuthError)
 *
 */
const checkForAuthError = (error) => {
  logGitHubRateLimitingInformation(error.headers)
  if (error.status === 404) {
    debug('Can not fetch information, you might want to pass $GITHUB_TOKEN')

    return Nothing
  }

  throw error
}

module.exports = class GitHubBackend {
  /**
   * @summary The GitHub based backend
   * @class
   * @public
   *
   * @param {String} repository - git repository url
   * @param {String} reference - git repository reference
   *
   * @example
   * const backend = new GitHubBackend('git@github.com:foo/bar.git', 'master')
   */
  constructor (repository, reference) {
    this.reference = reference
    this.github = new GitHub({
      UserAgent: packageJSON.name,
      auth () {
        if (process.env.GITHUB_TOKEN) {
          debug('Using $GITHUB_TOKEN as the authentication token')
          return `token ${process.env.GITHUB_TOKEN}`
        }
        return null
      }
    })

    const parsedUrl = repository.url.match(/([\w-]+)\/([\w-]+)(\.\w+)?$/)
    this.owner = parsedUrl[1]
    this.repo = parsedUrl[2]
  }

  /**
   * @summary Initialize the git repository
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new GitHubBackend(...)
   * backend.init().then(() => {
   *   console.log('The repository is ready to be used')
   * })
   */
  async init () { // eslint-disable-line class-methods-use-this
    return Bluebird.resolve(null)
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
   * const backend = new GitHubBackend(...)
   * backend.readFile('README.md').then((contents) => {
   *   console.log(contents)
   * })
   */
  async readFile (file) {
    return this.github.repos.getContents({
      owner: this.owner,
      repo: this.repo,
      path: file,
      ref: this.reference
    }).then((results) => {
      logGitHubRateLimitingInformation(results.headers)
      if (results.data.type === 'file') {
        const buffer = Buffer.from(results.data.content, results.data.encoding)
        return buffer.toString()
      }

      throw new Error(`Can't handle response: ${results.data}`)
    }).catch(checkForAuthError)
  }

  /**
   * @summary Check if the repository is public
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new GitHubBackend(...)
   * backend.isPublic().then((isPublic) => {
   *   console.log(isPublic)
   * })
   */
  async isPublic () {
    return this.github.repos.get({
      owner: this.owner,
      repo: this.repo
    }).then((results) => {
      logGitHubRateLimitingInformation(results.headers)
      return !results.data.private
    }).catch(checkForAuthError)
  }

  /**
   * @summary Check if the repository is a fork
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new GitHubBackend(...)
   * backend.isFork().then((isFork) => {
   *   console.log(isFork)
   * })
   */
  isFork () {
    return this.github.repos.get({
      owner: this.owner,
      repo: this.repo
    }).then((results) => {
      logGitHubRateLimitingInformation(results.headers)
      return results.data.fork
    })
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
    return this.github.repos.listCommits({
      owner: this.owner,
      repo: this.repo,
      sha: this.reference,
      per_page: 1,
      page: 1
    }).then((results) => {
      logGitHubRateLimitingInformation(results.headers)
      const commitDate = _.get(results, [ 'data', '0', 'commit', 'committer', 'date' ], Nothing)
      return commitDate
    }).catch(checkForAuthError)
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
    return this.github.repos.getLatestRelease({
      owner: this.owner,
      repo: this.repo
    }).then((results) => {
      logGitHubRateLimitingInformation(results.headers)
      const releaseAssets = _.map(results.data.assets, (asset) => {
        return {
          name: asset.name,
          downloadUrl: asset.browser_download_url
        }
      })

      if (_.isEmpty(results.data)) {
        return null
      }

      return {
        tagName: results.data.tag_name,
        asssets: releaseAssets
      }
    }).catch(checkForAuthError)
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
   * backend.getPreReleases().then((releases) => {
   *   console.log(releases)
   * })
   */
  async getLatestPreRelease () {
    return this.github.paginate('GET /repos/:owner/:repo/releases', {
      owner: this.owner,
      repo: this.repo
    }).then((results) => {
      if (_.isEmpty(results)) {
        return Nothing
      }

      const candidate = _
        .chain(results)
        .filter('prerelease')
        .sortBy('created_at')
        .last()
        .value()

      if (!candidate) {
        return null
      }

      return {
        tagName: candidate.tag_name,
        assets: _.map(candidate.assets, (asset) => {
          return {
            name: asset.name,
            downloadUrl: asset.browser_download_url
          }
        })
      }
    }).catch(checkForAuthError)
  }
}
