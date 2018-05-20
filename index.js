const fs = require('fs')
const moment = require('moment')
const opn = require('opn')
const path = require('path')
const pTry = require('p-try')
const pify = require('pify')
const fileExists = require('file-exists')
const mkdirp = pify(require('mkdirp'))
const writeFile = pify(require('write'))
const _ = require('lodash')
const templates = require('./templates.js')

module.exports = {
  getTasksFile,
  getLastTasks,
  createLogFile,
  initProject,
  openYesterday
}

function generateTemplate (heading, tasks, opts) {
  var routines = ''
  tasks = (typeof tasks === 'string') ? tasks : ''

  // Get the routines if they exist
  return pTry(() => getTasksFile(opts.routines, opts))
    .then(res => {
      routines = '\n' + res
    })
    .catch(err => {
      if (err.message !== 'Path must be a string. Received undefined') {
        throw new Error('Unable to read routine file', err)
      }
    })
  // Get the extra tasks if specified
    .then(() => pTry(() => getTasksFile(opts.tasksFile, opts)))
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
      return templates.daily(heading, routines, tasks, opts.nextSection)
    })
}

function openFile (file, opts) {
  console.log('Opening file...')
  opn(file, {app: opts.app, wait: false})
  process.exit(0)
}

function getTasksFile (filename, opts) {
  return pify(fs.readFile)(path.resolve(process.cwd(), filename), 'utf8').then(res => {
    // Note, comes from the top and not the bottom. Different functionality. Issue?
    // Yes, definitely an issue
    // What if the divider is the top of the file? Remove the first newline.
    if (opts.divider && opts.divider.charAt(0) === '\n' && res.indexOf(opts.divider.slice(1)) === 0) {
      return ''
    }
    return (opts.divider) ? res.split(opts.divider)[0] : res
  })
}

function getLastTasks (opts) {
  return pify(fs.readdir)(opts.logDir).then(res => {
    if (res.length === 0) {
      throw new Error('No files in log directory')
    }
    // Filter to only get date files
    return _.last(_.filter(res, (file) => file.match(/[\d-]*.md/)))
  }).then(res => {
    return pify(fs.readFile)(path.resolve(opts.logDir, res), 'utf8').then(res => {
      return res.split(opts.nextSection)[1]
    }).catch(err => {
      console.log('Unable to get previous tasks.')
      return err
    })
  }).catch(err => {
    if (!opts.noOpen) {
      console.log(err.message, '- continuing...')
    }
    return err
  })
}

function createLogFile (date, opts) {
  const file = `${opts.logDir}/${date}.md`

  return mkdirp(opts.logDir).then((res) => {
    return fileExists(file)
  }).catch(err => {
    console.log('Unable to find out if file exists')
    throw err
  }).then(res => {
    if (res === false) {
      return getLastTasks(opts).then(tasks => {
        return generateTemplate(date, tasks, opts)
          .then(template => writeFile(file, template))
      })
    }
  }).then(res => {
    if (opts.noOpen) {
      return
    }
    openFile(file, opts)
  })
}

// TODO Allow for sending in a specific date to open
function openYesterday (opts) {
  const yesterdayFile = `${opts.logDir}/${moment().subtract(1, 'days').format('YYYY-MM-DD')}.md`
  return mkdirp(opts.logDir)
    .then((res) => fileExists(yesterdayFile))
    .then((res) => {
      if (!res) {
        return res
      }
      openFile(yesterdayFile, opts)
    })
}

function initProject (opts) {
  return mkdirp(opts.logDir).then((res) => {
    return fileExists(`${opts.logDir}/../README.md`)
  }).catch(err => {
    if (err) {
      throw new Error('Unable to read or write README file')
    }
  }).then(res => {
    if (res === false) {
      return writeFile(`${opts.logDir}/../README.md`, templates.readme(opts.projectName))
    }
  }).then(() => fileExists(`${opts.logDir}/../TODO.md`))
    .then(res => {
      if (res === false) {
        return writeFile(`${opts.logDir}/../TODO.md`, opts.divider)
      }
    }).catch(err => {
      if (err) {
        throw new Error('Unable to read or write TODO file')
      }
    })
}
