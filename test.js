/* global describe, it, beforeEach */

const assert = require('assert')
const log = require('./index.js')
const fs = require('fs')
const path = require('path')

// Use https://www.npmjs.com/package/tmp to clean up and remove file.

describe('create log file', () => {
  beforeEach(function () {
    // runs before each test in this block
    fs.unlink(path.join(__dirname, `temp/test.md`), (err, res) => {
      if (err) { console.log(err) }
    })
  })

  it('creates a file', function (done) {
    var filename = 'test'
    log.createLogFile(filename, {
      logDir: '/Users/richard/src/ships-log/temp',
      test: true
    })
    setTimeout(() => fs.stat(path.join(__dirname, `temp/${filename}.md`), (err, res) => {
      (err) ? done(err) : done()
    }), 10)
  })

  it('creates the right file', function (done) {
    var fileName = 'test'
    var falseFile = 'err'
    log.createLogFile(fileName, {
      logDir: '/Users/richard/src/ships-log/temp',
      test: true
    })
    setTimeout(() => fs.stat(path.join(__dirname, `temp/${falseFile}.md`), (err, res) => {
      (err)
        ? assert.ok(true)
        : assert.fail(falseFile, fileName, 'Wrong file created')
      done()
    }), 10)
  })
})
