const fs = require('fs')
const path = require('path')
const moment = require('moment')
const pify = require('pify')
const mkdirp = pify(require('mkdirp'))
const writeFile = require('write')
const opn = require('opn')
const fileExists = require('file-exists')
const meow = require('meow')

const today = moment().format('YYYY-MM-DD')
const logDir = path.resolve(process.cwd(), 'log')
const todayFile = `${logDir}/${today}.md`
const divider = `\n## Next\n`

function getYesterday () {
  return pify(fs.readdir)(logDir).then(res => {
    if (res.length === 0) {
      throw new Error('No files in log directory')
    }
    return res[res.length - 1]
  }).then(res => {
    return pify(fs.readFile)(path.resolve(process.cwd(), `log/${res}`), 'utf8').then(res => {
      return res.split(divider)[1]
    }).catch(err => {
      console.log('Unable to get tasks from yesterday.')
      return err
    })
  }).catch(err => {
    return err
  })
}

function createToday () {
  return mkdirp(logDir).then((res) => {
    return pify(fileExists)(todayFile)
  }).catch(err => {
    if (err.code === 'ENOENT') {
      return getYesterday().then(res => {
        return pify(writeFile)(todayFile, `# ${today}

## Mission

## To Do
${(typeof res === 'string') ? res : ''}
## Roundup

## Next
`)
      })
    }
  }).then(res => {
    console.log('Opening file...')
    opn(todayFile, {app: process.env.IDE})
    process.exit(0)
  })
}

const cli = meow([`
  Usage
    $ project

  Examples
    $ options
    Opening file...
`], {})

if (cli.flags.yesterday) {
  getYesterday().then(res => {
    if (res.length === 0) {
      console.log("I don't remember yesterday.")
    } else {
      console.log(res)
    }
  })
} else {
  createToday()
}
