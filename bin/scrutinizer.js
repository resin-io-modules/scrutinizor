#!/usr/bin/env node

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

const capitano    = require('capitano')
const { join }    = require('path')
const scrutinizer = require(join(__dirname, '../lib'))

const showHelp = () => {
  console.error(`Usage: scrutinizer <path> [--reference=master]`)

  console.log('\nGlobal Options:\n')
  for (const option of capitano.state.globalOptions) {
    console.log(`\t  ${option.alias ? '-' + option.alias + ', ' : ''}--${option.signature}`)
    if (option.description) console.log(`\t\t${option.description}`)
  }

  console.log('Commands:\n')
  for (const command of capitano.state.commands) {
    if (command.isWildcard()) continue

    console.log(`\t${command.signature}\t\t${command.description}`)
    for (const option of command.options) {
      console.log(`\t  ${option.alias ? '-' + option.alias + ', ' : ''}--${option.signature}`)
      if (option.description) console.log(`\t\t${option.description}`)
    }
  }
}

const prettyPrint = obj => {
  console.log(JSON.stringify(obj, null, 2))
}

capitano.globalOption({
  signature: 'help',
  alias: ['h'],
  boolean: true,
  required: false
})

capitano.globalOption({
  signature: 'reference',
  parameter: 'reference',
  alias: ['r'],
  required: false,
  description: 'Git reference to scrutinize'
})

capitano.command({
  signature: '*',
  action: () => {
    showHelp()
    process.exit(1)
  }
})

capitano.command({
  signature: 'local <path>',
  description: 'Retrieve metadata about a local checkout of a repo',
  action: ({ path }, { help, reference = 'master' }) => {
    if (help) {
      showHelp()
      process.exit(1)
    }

    scrutinizer.local(path, { reference }).then(result => prettyPrint(result))
  }
})

capitano.command({
  signature: 'remote <url>',
  description: 'Retrieve metadata about a remote repo. Set `GITHUB_TOKEN` as an env var for GitHub lookup',
  action: ({ url }, { help, reference = 'master' }) => {
    if (help) {
      showHelp()
      process.exit(1)
    }

    scrutinizer.remote(url, { reference }).then(result => prettyPrint(result))
  }
})

capitano.command({
  signature: 'combine <path> <url>',
  description: 'Retrieve metadata about a local checkout of a repo',
  action: ({ path, url }, { help, reference = 'master' }) => {
    if (help) {
      showHelp()
      process.exit(1)
    }

    scrutinizer.combined({ path, url }, { reference }).then(result => prettyPrint(result))
  }
})

capitano.run(process.argv, err => {
  if (!err) return

  showHelp()
  throw err
})
