#! /usr/bin/env node

const meow = require('meow')
const path = require('path')
const moment = require('moment')
const log = require('./index.js')

const cli = meow(`
  Usage
    $ project

  Options
    --help Display helptext
    -i, --init Initialize a project folder (with optional name)
    -m, --tomorrow Make tomorrow's list
    -p, --path Specify where the log folder exists
    -r, --routines Add a custom routines file
    -y, --yesterday Open yesterday's file
    -c, --create Create a log file with a given date
    --date Open a specific date in the past (format: YYYY-MM-DD)
    --divider Send a customer divider for parsing additional task files
      Default: '-----' on a new line
    --tasksfile Add a custom taskfile to check to
    --noOpen Don't open files (for tests)

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
`, {
  'flags': {
    'help': {
      type: 'boolean',
      alias: 'h'
    },
    'init': {
      // type: 'boolean', Can also be a string
      alias: 'i'
    },
    'path': {
      type: 'string',
      alias: 'p'
    },
    'tomorrow': {
      type: 'boolean',
      alias: 't'
    },
    'routines': {
      type: 'string',
      alias: 'r'
    },
    'yesterday': {
      type: 'boolean',
      alias: 'y'
    },
    'tasksfile': {
      type: 'string'
    },
    'noOpen': {
      type: 'boolean'
    },
    'divider': {
      type: 'string'
    },
    'nextSection': {
      type: 'string'
    },
    'date': {
      type: 'string'
    },
    'create': {
      type: 'boolean'
    }
  }
})

var logDir = (cli.flags.path) ? cli.flags.path : path.resolve(process.cwd(), 'log')

var opts = {
  nextSection: cli.flags.nextSection || `\n## Next\n`,
  divider: cli.flags.divider || '\n-----\n',
  logDir: logDir,
  parentFolder: logDir.split('/')[logDir.split('/').length - 2],
  projectName: (typeof cli.flags.init === 'string') ? cli.flags.init : this.parentFolder,
  routines: cli.flags.routines,
  tasksFile: cli.flags.tasksfile,
  app: process.env.IDE,
  noOpen: cli.flags.noOpen,
  date: cli.flags.date
}

// Syntactic sugar. Really, `yesterday` is last tasks. Could be from today.
if (cli.flags.init) {
  // Create a dir for the project if it's not in one
  if (typeof opts.projectName === 'string' && opts.projectName !== opts.parentFolder) {
    // Note: by default, path will point to the init, not to the log folder
    opts.logDir = path.resolve((cli.flags.path) ? cli.flags.path : process.cwd(), `${opts.projectName}/log`)
  }
  log.initProject(opts)
} else if (cli.flags.create) {
  if (cli.flags.date) {
    log.createLogFile(moment(cli.flags.date).format('YYYY-MM-DD'), opts)
  } else {
    console.log('Date not provided.')
    process.exit(0)
  }
} else if (cli.flags.yesterday || cli.flags.date) {
  log.openYesterday(opts).then(res => {
    if (!res) {
      // Don't create it or open it if it doesn't exist
      // Note: This quote is from _Three Days of the Condor_
      console.log("I don't remember yesterday. Today, it rained.")
      process.exit(0)
    }
  })
} else if (cli.flags.tomorrow) {
  log.createLogFile(moment().add(1, 'days').format('YYYY-MM-DD'), opts)
} else {
  log.createLogFile(moment().format('YYYY-MM-DD'), opts)
}
