/* global describe, it, after, afterEach */

const assert = require('assert')
const log = require('./index.js')
const fs = require('fs')
const path = require('path')
const pify = require('pify')
const moment = require('moment')
const write = require('write')
const rimraf = require('rimraf')

// getTasksFile,
// getLastTasks,
// initProject,

var logDir = path.join(__dirname, 'temp')

function unlinkFile (dir, file) {
  let filepath = path.join(dir, file + '.md')
  fs.unlink(filepath, (err, res) => {
    if (err && err.message.indexOf('ENOENT: no such file or directory') !== 0) {
      console.log(`Unable to delete ${filepath} file`)
    }
  })
}

function removeTempDir () {
  rimraf(logDir, (err) => {
    if (err && err.message.indexOf('ENOENT: no such file or directory') !== 0) {
      console.log(err.message)
      console.log(`Unable to delete test directory ${logDir}`)
    }
  })
}

after(() => removeTempDir())

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

  it('creates a file given a date', function (done) {
    after(() => { unlinkFile(logDir, '2018-02-14') })

    var date = '2018-02-14'

    log.createLogFile(date, {
      logDir: logDir,
      noOpen: true
    })

    setTimeout(() => fs.stat(path.join(__dirname, `temp/${date}.md`), (err, res) => {
      done(err)
    }), 50)
  })

  // TODO Fix. This should fail and be OK.
  // it('creates no file given an invalid date', function (done) {
  //   var date = '2018-02-14s'
  //
  //   log.createLogFile(date, {
  //     logDir: logDir,
  //     noOpen: true,
  //     date: date
  //   })
  //
  //   return setTimeout(() => {
  //     return pify(fs)
  //       .readFile(fs.stat(path.join(__dirname, `temp/${date}.md`)))
  //       .catch((err) => {
  //         if (err) {
  //           assert.ok(true)
  //           done()
  //         }
  //       })
  //   }, 50)
  // })

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

  it('with task and routine files', function (done) {
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
  const yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
  const anotherDate = '2018-11-02'

  afterEach(() => {
    unlinkFile(logDir, yesterdayDate)
    unlinkFile(logDir, '2018-11-02')
  })

  it('will exit if yesterday does not exist', function (done) {
    log.openYesterday({
      logDir: logDir,
      noOpen: true
    }).then(res => {
      if (res === false) {
        done()
      }
    })
  })

  it('will open the file otherwise', function (done) {
    log.createLogFile(yesterdayDate, {
      logDir: logDir,
      noOpen: true
    })
    setTimeout(() => fs.stat(path.join(logDir, yesterdayDate + '.md'), (err, res) => {
      (err) ? done(err) : done()
    }), 50)
  })

  it('will open another date if specified', function (done) {
    let anotherDateFile = path.join(logDir, anotherDate + '.md')
    write(anotherDateFile).then(() => {
      log.openYesterday({
        logDir: logDir,
        date: anotherDate,
        noOpen: true
      })
      setTimeout(() => fs.stat(anotherDateFile, (err, res) => {
        (err) ? done(err) : done()
      }), 50)
    })
  })
})

// openTomorrow
describe('opens tomorrow', () => {
  const tomorrowDate = moment().add(1, 'days').format('YYYY-MM-DD')

  afterEach(() => {
    unlinkFile(logDir, tomorrowDate)
  })

  it('will create the file', function (done) {
    log.createLogFile(tomorrowDate, {
      logDir: logDir,
      noOpen: true
    })
    setTimeout(() => fs.stat(path.join(logDir, tomorrowDate + '.md'), (err, res) => {
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
