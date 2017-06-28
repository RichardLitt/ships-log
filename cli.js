#! /usr/bin/env node

const meow = require('meow')
const path = require('path')
const moment = require('moment')
const log = require('./index.js')

const cli = meow([`
  Usage
    $ project

  Options
    --help Display helptext
    -i, --init Initialize a project folder (with optional name)
    -m, --tomorrow Make tomorrow's list
    -p, --path Specify where the log folder exists
    -r, --routines Add a custom routines file
    -y, --yesterday Open yesterday's file
    --divider Send a customer divider for parsing additional task files
      Default: '-----' on a new line
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

var logDir = (cli.flags.path) ? cli.flags.path : path.resolve(process.cwd(), 'log')

var opts = {
  nextSection: `\n## Next\n`,
  divider: cli.flags.divider || '\n-----\n',
  logDir: logDir,
  parentFolder: logDir.split('/')[logDir.split('/').length - 2],
  projectName: (typeof cli.flags.init === 'string') ? cli.flags.init : this.parentFolder,
  routines: cli.flags.routines,
  tasksFile: cli.flags.tasksfile,
  app: process.env.IDE
}

// Syntactic sugar. Really, `yesterday` is last tasks. Could be from today.
if (cli.flags.init) {
  // Create a dir for the project if it's not in one
  if (typeof opts.projectName === 'string' && opts.projectName !== opts.parentFolder) {
    // Note: by default, path will point to the init, not to the log folder
    opts.logDir = path.resolve((cli.flags.path) ? cli.flags.path : process.cwd(), `${opts.projectName}/log`)
  }
  log.initProject(opts)
} else if (cli.flags.yesterday) {
  log.openYesterday(opts)
} else if (cli.flags.tomorrow) {
  log.createLogFile(moment().add(1, 'days').format('YYYY-MM-DD'), opts)
} else {
  log.createLogFile(moment().format('YYYY-MM-DD'), opts)
}
