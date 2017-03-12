# ships-log

> Open up a log file for today in a project folder

## Install

```sh
npm i -g ships-log
```

## Usage

```sh
log
# Will automatically open up today's date file in log/

# Or, to see yesterday's tasks
log --yesterday
# Will print them to stdout
```

### Options

- `-r, --routines <filename>` Add in a routine file.
- `-m, --tomorrow` Make tomorrow's file
- `-y, --yesterday` Print yesterday's tasks which will be added to today
- `-p, --path` Specify where the log file should exist

## Contribute

This is mainly for me. Please open an issue if you want to contribute, first, as I am unlikely to merge if I disagree with a change.

## License

[MIT](LICENSE) © 2017 [Richard Littauer](https://burntfen.com)
