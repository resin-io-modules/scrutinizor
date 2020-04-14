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
  if (!headers) {
    return
  }
  const resetDate = new Date(headers['x-ratelimit-reset'] * 1000)
  debug(`Rate limiting: ${headers['x-ratelimit-remaining']}/${
    headers['x-ratelimit-limit']
  },
         will reset in ${fromNow(resetDate)}}`)
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

    let auth

    if (process.env.GITHUB_TOKEN) {
      debug('Using $GITHUB_TOKEN as the authentication token')
      auth = `token ${process.env.GITHUB_TOKEN}`
    }

    this.github = new GitHub({
      UserAgent: packageJSON.name,
      auth
    })

    const parsedUrl = repository.match(/([\w-]+)\/([\w-]+)(\.\w+)?$/)
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
  init () {
    return Bluebird.resolve(this)
  }

  /**
   * @summary Read the contents of a directort
   * @function
   * @public
   *
   * @param {String} directory - directory path
   * @returns {Promise}
   *
   * @example
   * const backend = new GitHubBackend(...)
   * backend.readDirectoryFilePaths('docs').then((contents) => {
   *   console.log(contents)
   * })
   */
  readDirectoryFilePaths (directory) {
    return this.github.repos
      .getContents({
        owner: this.owner,
        repo: this.repo,
        path: directory,
        ref: this.reference
      })
      .then((results) => {
        logGitHubRateLimitingInformation(results.headers)

        if (_.isArray(results.data)) {
          const files = _.map(_.filter(results.data, { type: 'file' }), 'path')
          return files
        }

        throw new Error('Not a directory')
      })
      .catch((error) => {
        logGitHubRateLimitingInformation(error.headers)
        if (error.status === 404) {
          return null
        }

        throw error
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
   * const backend = new GitHubBackend(...)
   * backend.readFile('README.md').then((contents) => {
   *   console.log(contents)
   * })
   */
  readFile (file) {
    return this.github.repos
      .getContents({
        owner: this.owner,
        repo: this.repo,
        path: file,
        ref: this.reference
      })
      .then((results) => {
        logGitHubRateLimitingInformation(results.headers)

        if (results.data.type === 'file') {
          const buffer = Buffer.from(
            results.data.content,
            results.data.encoding
          )

          if (results.data.encoding === 'base64' &&
          (results.data.name.includes('.png') ||
            results.data.name.includes('.gif')
          )) {
            return buffer.toString('base64')
          }

          return buffer.toString()
        }

        throw new Error(`Can't handle response: ${results.data}`)
      })
      .catch((error) => {
        logGitHubRateLimitingInformation(error.headers)
        if (error.status === 404) {
          return null
        }

        throw error
      })
  }

  /**
   * @summary Get the basic Github metadata
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new FileSystemBackend(...)
   * backend.getMetadata().then((metadata) => {
   *   console.log(metadata)
   * })
   */
  getMetadata () {
    return this.github.repos
      .get({
        owner: this.owner,
        repo: this.repo
      })
      .then((results) => {
        logGitHubRateLimitingInformation(results.headers)
        return {
          name: results.data.name,
          public: !results.data.private,
          fork: results.data.fork,
          description: results.data.description,
          stars: results.data.stargazers_count,
          homepage: results.data.homepage,
          repositoryUrl: results.data.clone_url,
          active: !results.data.archived && !results.data.disabled,
          owner: {
            avatar: results.data.owner.avatar_url,
            handle: results.data.owner.login,
            url: results.data.owner.html_url,
            type: results.data.owner.type
          }
        }
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
  getLastCommitDate () {
    return this.github.repos
      .listCommits({
        owner: this.owner,
        repo: this.repo,
        sha: this.reference,
        per_page: 1,
        page: 1
      })
      .then((results) => {
        logGitHubRateLimitingInformation(results.headers)
        const commitDate = _.get(
          results,
          [ 'data', '0', 'commit', 'committer', 'date' ],
          null
        )
        return commitDate
      })
      .catch((error) => {
        if (error.status === 404) {
          debug('Cannot get the last commit (have you passed $GITHUB_TOKEN ?)')
          return null
        }

        throw error
      })
  }

  /**
   * @summary Get the contriburors
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new GitHubBackend(...)
   * backend.this().then((list) => {
   *   console.log(list)
   * })
   */
  getContributors () {
    return this.github.repos
      .listContributors({
        owner: this.owner,
        repo: this.repo
      })
      .then((results) => {
        logGitHubRateLimitingInformation(results.headers)
        const contributors = _.get(results, [ 'data' ], [])

        // eslint-disable-next-line camelcase
        return _.map(contributors, ({ login, avatar_url }) => {
          return {
            username: login,
            avatar: avatar_url
          }
        })
      })
      .catch((error) => {
        if (error.status === 404) {
          debug('Cannot get the contributors list (have you passed $GITHUB_TOKEN ?)')
          return null
        }

        throw error
      })
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
  getLatestRelease () {
    return this.github.repos
      .getLatestRelease({
        owner: this.owner,
        repo: this.repo
      })
      .then((results) => {
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
      })
      .catch((error) => {
        if (error.status === 404) {
          debug(
            'Cannot get the latest release (have you passed $GITHUB_TOKEN ?)'
          )
          return null
        }

        throw error
      })
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
  getLatestPreRelease () {
    return this.github
      .paginate('GET /repos/:owner/:repo/releases', {
        owner: this.owner,
        repo: this.repo
      })
      .then((results) => {
        if (_.isEmpty(results)) {
          return null
        }

        const candidate = _.chain(results)
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
      })
      .catch((error) => {
        if (error.status === 404) {
          debug(
            'Cannot get the latest release (have you passed $GITHUB_TOKEN ?)'
          )
          return null
        }

        throw error
      })
  }

  /**
   * @summary Get the # of the open issues, along with the 20 latest ones
   * @function
   * @public
   *
   * @returns {Promise}
   *
   * @example
   * const backend = new GitHubBackend(...)
   * backend.getOpenIssues().then((openIssues) => {
   *   console.log(openIssues)
   * })
   */
  getOpenIssues () {
    return this.github.repos.get({
      owner: this.owner,
      repo: this.repo
    }).then((results) => {
      logGitHubRateLimitingInformation(results.headers)
      const numberOfIssues = results.data.open_issues_count

      const openIssuesObj = {
        numberOfIssues,
        latestIssues: []
      }

      if (numberOfIssues === 0) {
        return openIssuesObj
      }

      /*
        We can calculate the pages of issues, and make
        a series of calls, in order to get the full listing
        - https://octokit.github.io/rest.js/#api-Issues-listForRepo
        This list can be hundrends of items,
        so let's settle for the first 20
      */

      return this.github.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        state: 'open',
        per_page: 20,
        page: 1
      }).then((issueResults) => {
        logGitHubRateLimitingInformation(issueResults.headers)

        const latestIssues = _.map(issueResults.data, (issue) => {
          return {
            title: issue.title,
            url: issue.html_url
          }
        })

        openIssuesObj.latestIssues = latestIssues
        return openIssuesObj
      })
    })
  }
}
