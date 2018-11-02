/* global describe, it, after, afterEach */

const assert = require('assert')
const log = require('./index.js')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

// Use https://www.npmjs.com/package/tmp to clean up and remove file.

// getTasksFile,
// getLastTasks,
// initProject,

function unlinkFile (dir, file) {
  fs.unlink(path.join(dir, file + '.md'), (err, res) => {
    if (err) { console.log(`Unable to delete ${file}.md file`); return }
    fs.rmdir(dir, (err) => {
      if (err) { console.log(`Unable to delete test directory ${dir}`) }
    })
  })
}

var logDir = path.join(__dirname, 'temp')

// createLogFile,
describe('create log file', () => {
  // runs before each test in this block
  afterEach(() => { unlinkFile(logDir, 'test') })

  it('creates a file', function (done) {
    var filename = 'test'

    log.createLogFile(filename, {
      logDir: logDir,
      noOpen: true
    })
    setTimeout(() => fs.stat(path.join(__dirname, `temp/${filename}.md`), (err, res) => {
      done(err)
    }), 10)
  })

  it('creates the right file', function (done) {
    var fileName = 'test'
    var falseFile = 'err'
    log.createLogFile(fileName, {
      logDir: logDir,
      noOpen: true
    })
    setTimeout(() => fs.stat(path.join(__dirname, `temp/${falseFile}.md`), (err, res) => {
      (err)
        ? assert.ok(true)
        : assert.fail(falseFile, fileName, 'Wrong file created')
      done()
    }), 10)
  })
})

// openYesterday
describe('opens yesterday', () => {
  var yesterdayFile = `${moment().subtract(1, 'days').format('YYYY-MM-DD')}`

  after(() => {
    unlinkFile(logDir, yesterdayFile)
  })

  it('will exit if yesterday does not exist', function (done) {
    log.openYesterday({
      logDir: logDir
    }).then(res => {
      if (res === false) {
        done()
      }
    })
  })

  it('will open the file otherwise', function (done) {
    log.createLogFile(yesterdayFile, {
      logDir: logDir,
      noOpen: true
    })
    setTimeout(() => fs.stat(path.join(logDir, yesterdayFile + '.md'), (err, res) => {
      (err) ? done(err) : done()
    }), 10)
  })
})

describe('check if in a log dir', () => {
  it('will do nothing if not in a log dir', (done) => {
    let opts = log.checkIfInLogFile({logDir: '/test/log'})
    assert.equal(opts.logDir, '/test/log')
    done()
  })
  it('will remove extra log if in a log dir', (done) => {
    let opts = log.checkIfInLogFile({logDir: '/test/log/log'})
    assert.equal(opts.logDir, '/test/log')
    done()
  })
})
