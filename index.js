#!/usr/bin/env node

const fs = require('fs')
const meow = require('meow')
const moment = require('moment')
const opn = require('opn')
const path = require('path')
const pTry = require('p-try')
const pify = require('pify')
const fileExists = pify(require('file-exists'))
const mkdirp = pify(require('mkdirp'))
const writeFile = pify(require('write'))

const cli = meow([`
  Usage
    $ project

  Options
    --help Display helptext
    -i, --init Initialize a project folder (with optional name)
    -m, --tomorrow Make tomorrow's list
    -p, --path Specify where the log folder exists
    -r, --routines Add a custom routines file
    -y, --yesterday Grab yesterday's tasks
    --divider Send a customer divider for parsing additional task files
    --tasksfile Add a custom taskfile to check to

  Examples
    $ log
    # Will automatically open or create today's date file in log/

    $ log --init
    # Will create 'log/', 'README.md', and 'TODO.md' in the current folder.

    $ log --init="project"
    # Will create a folder named 'project' with the above files in it

    $ log --yesterday
    # Will open yesterday's log file

    $ log --tomorrow
    # Will generate tomorrow's file, with tasks from the last file's next section

    $ log --routines=routines.md --tasksfile=todo.md --divider='--Stop Here--'
    # Will create today's file, adding in routines and any tasks listed before the divider in the todo file

    $ log --path=~/Desktop
    # Will create a file on the Desktop for you
`], {
  'alias': {
    'h': 'help',
    'i': 'init',
    'p': 'path',
    'm': 'tomorrow',
    'r': 'routines',
    'y': 'yesterday'
  }
})

let logDir = (cli.flags.path) ? cli.flags.path : path.resolve(process.cwd(), 'log')
const nextSection = `\n## Next\n`
const divider = cli.flags.divider || '\n-----\n'

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
  .then(() => pTry(() => getTasksFile(cli.flags.tasksfile, divider)))
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
    return pify(fs.readFile)(path.resolve(logDir, res), 'utf8').then(res => {
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

function createLogFile (date) {
  const file = `${logDir}/${date}.md`

  return mkdirp(logDir).then((res) => {
    return fileExists(file)
  }).catch(err => {
    if (err.code === 'ENOENT') {
      return getLastTasks().then(tasks => {
        return generateTemplate(date, tasks)
          .then(template => writeFile(file, template))
      })
    }
  }).then(res => openFile(file))
}

function openYesterday () {
  const yesterdayFile = `${logDir}/${moment().subtract(1, 'dats').format('YYYY-MM-DD')}.md`
  return mkdirp(logDir).then((res) => {
    return fileExists(yesterdayFile)
  }).catch(err => {
    if (err.code === 'ENOENT') {
      console.log("I don't remember yesterday. Today, it rained.")
    } else {
      // Don't create it or open it if it doesn't exist
      openFile(yesterdayFile)
    }
  })
}

function initProject (projectName) {
  const parentFolder = logDir.split('/')[logDir.split('/').length - 2]
  projectName = (typeof projectName === 'string') ? projectName : parentFolder
  // Create a dir for the project if it's not in one
  if (typeof projectName === 'string' && projectName !== parentFolder) {
    // Note: by default, path will point to the init, not to the log folder
    logDir = path.resolve((cli.flags.path) ? cli.flags.path : process.cwd(), `${projectName}/log`)
  }
  return mkdirp(logDir).then((res) => {
    return fileExists(`${logDir}/../README.md`)
  }).catch(err => {
    if (err.code === 'ENOENT') {
      return writeFile(`${logDir}/../README.md`, `# ${projectName}

## Mission

## Collaborators

## Criteria for success

## Tracking Location`)
    }
  }).then(() => fileExists(`${logDir}/../TODO.md`)
  ).catch(err => {
    if (err.code === 'ENOENT') {
      return writeFile(`${logDir}/../TODO.md`, divider)
    }
  })
}

// Syntactic sugar. Really, `yesterday` is last tasks. Could be from today.
if (cli.flags.init) {
  initProject(cli.flags.init)
} else if (cli.flags.yesterday) {
  openYesterday()
} else if (cli.flags.tomorrow) {
  createLogFile(moment().add(1, 'days').format('YYYY-MM-DD'))
} else {
  createLogFile(moment().format('YYYY-MM-DD'))
}
