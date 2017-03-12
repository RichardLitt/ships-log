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
const pTry = require('p-try')

const logDir = path.resolve(process.cwd(), 'log')
const nextSection = `\n## Next\n`

function generateTemplate (heading, tasks) {
  var routines = ''
  tasks = (typeof tasks === 'string') ? tasks : ''

  // Get the routines if they exist
  return pTry(() => getTasksFile(cli.flags.routines))
  .then(res => {
    routines = '\n' + res
  })
  .catch(err => {
    if (err.message !== 'Path must be a string. Received undefined') {
      throw new Error('Unable to read routine file', err)
    }
  })
  // Get the extra tasks if specified
  .then(() => pTry(() => getTasksFile(cli.flags.tasksfile, '\n-----\n')))
  .then(res => {
    tasks = tasks + '\n' + res
  })
  .catch(err => {
    if (err.message !== 'Path must be a string. Received undefined') {
      throw new Error('Unable to read tasks file', err)
    }
  })
  .then(() => {
    // Mung it all together
    var md =
`# ${heading}

## Mission
${routines}
## To Do
${tasks}
## Roundup
${nextSection}
`
    return md
  })
}

function openFile (file) {
  console.log('Opening file...')
  opn(file, {app: process.env.IDE})
  process.exit(0)
}

function getTasksFile (filename, divider) {
  return pify(fs.readFile)(path.resolve(process.cwd(), filename), 'utf8').then(res => {
    // Note, comes from the top and not the bottom. Different functionality. Issue?
    // Yes, definitely an issue
    return (divider) ? res.split(divider)[0] : res
  })
}

function getLastTasks () {
  return pify(fs.readdir)(logDir).then(res => {
    if (res.length === 0) {
      throw new Error('No files in log directory')
    }
    return res[res.length - 1]
  }).then(res => {
    return pify(fs.readFile)(path.resolve(process.cwd(), `log/${res}`), 'utf8').then(res => {
      return res.split(nextSection)[1]
    }).catch(err => {
      console.log('Unable to get previous tasks.')
      return err
    })
  }).catch(err => {
    console.log(err.message, '- continuing...')
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
        return generateTemplate(tomorrow, res)
          .then(res => pify(writeFile)(tomorrowFile, res))
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
        return generateTemplate(today, res)
          .then(res => pify(writeFile)(todayFile, res))
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
    -r, --routines Add a custom routines file
    --tasksfile Add a custom taskfile to check to

  Examples
    $ options
    Opening file...
`], {
  'alias': {
    'y': 'yesterday',
    'm': 'tomorrow',
    'r': 'routines'
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
