/* global describe, it, after, afterEach */

const assert = require('assert')
const log = require('./index.js')
const fs = require('fs')
const path = require('path')
const pify = require('pify')
const moment = require('moment')

// Use https://www.npmjs.com/package/tmp to clean up and remove file.

// getTasksFile,
// getLastTasks,
// initProject,

function unlinkFile (dir, file) {
  let filepath = path.join(dir, file + '.md')
  fs.unlink(filepath, (err, res) => {
    if (err) { console.log(`Unable to delete ${filepath} file`); return }
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
    }), 50)
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
    }), 50)
  })

  it('with routines file', function (done) {
    var filename = 'test'

    Promise.resolve(path.join(__dirname, `fixtures/routines.md`))
      .then(routines => {
        return log.createLogFile(filename, {
          logDir: logDir,
          noOpen: true,
          routines: routines
        })
      })
      .then(() => {
        return setTimeout(() => {
          let testfile
          return pify(fs)
            .readFile(path.join(__dirname, `temp/${filename}.md`), 'utf8')
            .then((res) => {
              testfile = res
              return pify(fs).readFile(path.join(__dirname, `fixtures/file-with-subroutines.md`), 'utf8')
            })
            .then((fixture) => assert.strictEqual(testfile, fixture))
            .then(() => done())
            .catch((err) => done(err))
        }, 50)
      })
  })

  it('with tasks file', function (done) {
    var filename = 'test'

    Promise.resolve(path.join(__dirname, `fixtures/tasks.md`))
      .then(tasks => {
        return log.createLogFile(filename, {
          logDir: logDir,
          noOpen: true,
          tasksFile: tasks
        })
      })
      .then(() => {
        return setTimeout(() => {
          let testfile
          return pify(fs)
            .readFile(path.join(__dirname, `temp/${filename}.md`), 'utf8')
            .then((res) => {
              testfile = res
              return pify(fs).readFile(path.join(__dirname, `fixtures/file-with-tasks.md`), 'utf8')
            })
            .then((fixture) => assert.strictEqual(testfile, fixture))
            .then(() => done())
            .catch((err) => done(err))
        }, 50)
      })
  })

  it('with tasks file', function (done) {
    var filename = 'test'

    Promise.resolve(path.join(__dirname, `fixtures/tasks.md`))
      .then(tasks => {
        return Promise.resolve(path.join(__dirname, 'fixtures/routines.md'))
          .then((routines) => {
            return log.createLogFile(filename, {
              logDir: logDir,
              noOpen: true,
              routines: routines,
              tasksFile: tasks
            })
          })
      })
      .then(() => {
        return setTimeout(() => {
          let testfile
          return pify(fs)
            .readFile(path.join(__dirname, `temp/${filename}.md`), 'utf8')
            .then((res) => {
              testfile = res
              return pify(fs).readFile(path.join(__dirname, `fixtures/file-with-tasks-and-subroutines.md`), 'utf8')
            })
            .then((fixture) => assert.strictEqual(testfile, fixture))
            .then(() => done())
            .catch((err) => done(err))
        }, 50)
      })
  })

  it('without routines file', function (done) {
    var filename = 'test'

    Promise.resolve(path.join(__dirname, `fixtures/routines.md`))
      .then(routines => {
        return log.createLogFile(filename, {
          logDir: logDir,
          noOpen: true
        })
      })
      .then(() => {
        return setTimeout(() => {
          let testfile
          return pify(fs)
            .readFile(path.join(__dirname, `temp/${filename}.md`), 'utf8')
            .then((res) => {
              testfile = res
              return pify(fs).readFile(path.join(__dirname, `fixtures/file.md`), 'utf8')
            })
            .then((fixture) => assert.strictEqual(testfile, fixture))
            .then(() => done())
            .catch((err) => done(err))
        }, 50)
      })
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
    }), 50)
  })
})

describe('check if in a log dir', () => {
  it('will do nothing if not in a log dir', (done) => {
    let opts = log.checkIfInLogFile({ logDir: '/test/log' })
    assert.strictEqual(opts.logDir, '/test/log')
    done()
  })
  it('will remove extra log if in a log dir', (done) => {
    let opts = log.checkIfInLogFile({ logDir: '/test/log/log' })
    assert.strictEqual(opts.logDir, '/test/log')
    done()
  })
})
