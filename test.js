/* global describe, it */

const assert = require('assert')
const log = require('./index.js')
const fs = require('fs')
const path = require('path')

// Use https://www.npmjs.com/package/tmp to clean up and remove file.

describe('createLogFile', () => {
  it('creates a file', function (done) {
    var filename = 'test'
    log.createLogFile(filename, {
      logDir: '/Users/richard/src/ships-log/temp',
      test: true
    })
    setTimeout(() => fs.stat(path.join(__dirname, `temp/${filename}.md`), (err, res) => {
      done(err)
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
      if (err) {
        assert.ok(true)
      } else {
        assert.notStrictEqual(falseFile, fileName, 'Wrong file created')
      }
      done()
    }), 10)
  })
})
