#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const moment = require('moment')
const pify = require('pify')
const mkdirp = pify(require('mkdirp'))
const writeFile = require('write')
const opn = require('opn')
const fileExists = require('file-exists')
const meow = require('meow')

const logDir = path.resolve(process.cwd(), 'log')
const divider = `\n## Next\n`

function template (heading, tasks) {
  return `# ${heading}

## Mission

## To Do
${(typeof tasks === 'string') ? tasks : ''}
## Roundup
${divider}`
}

function openFile (file) {
  console.log('Opening file...')
  opn(file, {app: process.env.IDE})
  process.exit(0)
}

function getLastTasks () {
  return pify(fs.readdir)(logDir).then(res => {
    if (res.length === 0) {
      throw new Error('No files in log directory')
    }
    return res[res.length - 1]
  }).then(res => {
    return pify(fs.readFile)(path.resolve(process.cwd(), `log/${res}`), 'utf8').then(res => {
      return res.split(divider)[1]
    }).catch(err => {
      console.log('Unable to get previous tasks.')
      return err
    })
  }).catch(err => {
    return err
  })
}

function createTomorrow () {
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD')
  const tomorrowFile = `${logDir}/${tomorrow}.md`

  return mkdirp(logDir).then((res) => {
    return pify(fileExists)(tomorrowFile)
  }).catch(err => {
    if (err.code === 'ENOENT') {
      return getLastTasks().then(res => {
        return pify(writeFile)(tomorrowFile, template(tomorrow, res))
      })
    }
  }).then(res => openFile(tomorrowFile))
}

function createToday () {
  const today = moment().format('YYYY-MM-DD')
  const todayFile = `${logDir}/${today}.md`

  return mkdirp(logDir).then((res) => {
    return pify(fileExists)(todayFile)
  }).catch(err => {
    if (err.code === 'ENOENT') {
      return getLastTasks().then(res => {
        return pify(writeFile)(todayFile, template(today, res))
      })
    }
  }).then(res => openFile(todayFile))
}

const cli = meow([`
  Usage
    $ project

  Options
    -y, --yesterday Grab yesterday's tasks
    -m, --tomorrow Make tomorrow's list

  Examples
    $ options
    Opening file...
`], {
  'alias': {
    'y': 'yesterday',
    'm': 'tomorrow'
  }
})

// Syntactic sugar. Really, `yesterday` is last tasks. Could be from today.
if (cli.flags.yesterday) {
  getLastTasks().then(res => {
    if (res.length === 0) {
      console.log("I don't remember yesterday.")
    } else {
      console.log(res)
    }
  })
} else if (cli.flags.tomorrow) {
  createTomorrow()
} else {
  createToday()
}
