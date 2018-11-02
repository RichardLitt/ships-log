# Ship's Log

[![Greenkeeper badge](https://badges.greenkeeper.io/RichardLitt/ships-log.svg)](https://greenkeeper.io/)

> Open up a log file for today in a project folder

This is a to do list manager without frills, that allows you to use Git's power of line changes with a daily file for each todo, and to carry tasks over from previous files.

## Background

_Note: This section comes from my write-up of why and how I use this, [here](https://medium.com/@richlitt/ships-log-my-new-to-do-list-manager-6a1d9397a0db)._

I keep todo lists. Sometimes by hand, sometimes on my computer. For the past six months, I've been organizing them on my computer, in a simple folder called log, with a file for each day I decide to have a to do list.

Yesterday, I realized that my shell script I had been using to create these log files wasn't as extensible as it could be, and that I wanted a bit more out of my system. I have a global todo list, and daily todo lists, but I also want to be able to take notes on particular projects, group todos in those projects, and start having a folder on my computer for reach project that I'm working on.
So, I built ships-log, which does this for me, just a bit easier.

Using ships-log, I can easily initiate a folder structure for each project I like. It creates a README for me to think about the project, with a nice template — title, mission, criteria for success, notes — as well as a blank TODO file, and a log folder. In the log folder, log automatically creates a file named after the date, with another set of super helpful headings:

**Mission**: What am I going to do today that will make me feel accomplished at the end of the day? What's the biggest rock?  
**Routines**: What routines do I want here that I do every day?  
**To Do**: What is there to do?  
**Roundup**: For my post-mortem at the end. How did I do? What did I accomplish? How do I feel about?  
**Next**: What tasks should be put into the next to do list?  

The next day, I'll automatically grab any tasks left over in the Next from the previous day, or marked in the main To Do list, and make a new one. I don't have to rewrite anything, and I have a very clear way of uploading and downloading state — of knowing where I was when I left a project, and what I need to do to get back into focusing on a given project.

I have ships-log set up with some aliases so that I never have to think twice about my daily to do list, the one I look at when I wake up (after my morning routine) and before I go to bed (as part of my evening routine). Instead, I just type t in my Terminal to open today's todo list, or I use Alfred and a workflow I have set up there. If I have a specific project, I just change my terminal to point to the directory I want, and use ships-log there.

It's a quick, efficient system, that leaves a good papertrail in case I want to look at what I've done, and let's me know what I ought to be doing next. I like it.

## Install

```sh
npm i -g ships-log
```

## Usage

```sh
ship
# Will automatically open or create today's date file in `log/`

ship --init
# Will create `log/`, `README.md`, and `TODO.md` in the current folder.

ship --init="project"
# Will create a folder named `project` with the above files in it

ship --yesterday
# Will open yesterday's log file

ship --tomorrow
# Will generate tomorrow's file, with tasks from the last file's next section

ship --routines=routines.md --tasksfile=todo.md --divider='--Stop Here--'
# Will create today's file, adding in routines and any tasks listed before the divider in the todo file

ship --path=~/Desktop
# Will create a file on the Desktop for you
```

### Options

- `-h, --help` Display helptext
- `-i, --init` Initialize a project folder (with optional name)
- `-m, --tomorrow` Make tomorrow's file
- `-p, --path` Specify where the log file should exist
- `-r, --routines <filename>` Add in a routine file
- `-y, --yesterday` Print yesterday's tasks which will be added to today
- `--divider` Send a customer divider for parsing additional task files
  Default: `-----` on a new line
- `--tasksfile` Add a custom taskfile to check to

### Useful Aliases for your .bash_profile

```sh
alias today='ship -p '$BASEDIR'log --tasksfile '$BASEDIR'todo.md -r '$BASEDIR'daily_routines.md'
alias t=today
alias tomorrow='ship -m -p '$BASEDIR'log --tasksfile '$BASEDIR'todo.md -r '$BASEDIR'daily_routines.md'
alias yesterday='ship -y -p '$BASEDIR'log'
alias y=yesterday
alias todo=$IDE' '$BASEDIR'todo.md'
```

### Notes

- Ship's Log will not allow you to have a `log` directory embedded inside another `log` directory. It will automatically default to creating files in the current working directory if you are in a `log` directory already.

## Contribute

Please do! Open an issue if you want to contribute something.

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## License

[MIT](LICENSE) © 2017 [Richard Littauer](https://burntfen.com)
