/* global describe, it, beforeEach, afterEach */

const assert = require('assert')
const log = require('./index.js')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

// Use https://www.npmjs.com/package/tmp to clean up and remove file.

// getTasksFile,
// getLastTasks,
// initProject,

// createLogFile,
describe('create log file', () => {
  beforeEach(function () {
    // runs before each test in this block
    fs.unlink(path.join(__dirname, `temp/test.md`), (err, res) => {
      if (err) {} // All is good
    })
  })
  var logDir = path.join(__dirname, 'temp')

  it('creates a file', function (done) {
    var filename = 'test'

    log.createLogFile(filename, {
      logDir: logDir,
      noOpen: true
    })
    setTimeout(() => fs.stat(path.join(__dirname, `temp/${filename}.md`), (err, res) => {
      (err) ? done(err) : done()
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
  var logDir = path.join(__dirname, 'temp')
  var yesterdayFile = `${moment().subtract(1, 'days').format('YYYY-MM-DD')}`

  function unlinkFile () {
    fs.unlink(path.join(logDir, yesterdayFile + '.md'), (err, res) => {
      if (err) {} // All is good
    })
  }

  beforeEach(function () { unlinkFile() })
  afterEach(function () { unlinkFile() })

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
