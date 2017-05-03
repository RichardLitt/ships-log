# Ship's Log

> Open up a log file for today in a project folder

## Install

```sh
npm i -g ships-log
```

## Usage

```sh
log
# Will automatically open or create today's date file in `log/`

log --init
# Will create `log/`, `README.md`, and `TODO.md` in the current folder.

log --init="project"
# Will create a folder named `project` with the above files in it

log --yesterday
# Will open yesterday's log file

log --tomorrow
# Will generate tomorrow's file, with tasks from the last file's next section

log --routines=routines.md --tasksfile=todo.md --divider='--Stop Here--'
# Will create today's file, adding in routines and any tasks listed before the divider in the todo file

log --path=~/Desktop
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

## Contribute

This is mainly for me. Please open an issue if you want to contribute, first, as I am unlikely to merge if I disagree with a change.

## License

[MIT](LICENSE) © 2017 [Richard Littauer](https://burntfen.com)
